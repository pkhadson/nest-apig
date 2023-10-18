import { OpenAPIObject } from "@nestjs/swagger";
import {
  ReferenceObject,
  RequestBodyObject,
} from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";
import { Stack, StackProps } from "aws-cdk-lib";
import {
  AuthorizationType,
  CfnAuthorizer,
  LambdaIntegration,
  MethodOptions,
  Model,
  Resource,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import * as fs from "node:fs";
import * as path from "node:path";
import { makeFakeLib } from "./fake-lib";
import Mutable from "./interfaces/mutable.interface";
import titleCase from "./utils/title-case.util";

interface INestStackProps extends StackProps {
  project: string;
  api: RestApi;
  distPath?: string;
  authorizers?: IAuthMap;
}

type IAuthMap = Record<string, CfnAuthorizer>;

export class NestStack extends Stack {
  projectName: string;
  distPath: string;
  models: Map<string, Model> = new Map();
  api: RestApi;
  fn: NodejsFunction;
  fnIntegraion: LambdaIntegration;
  authorizers: IAuthMap;
  constructor(scope: Construct, id: string, props: INestStackProps) {
    super(scope, id, props);

    const mainPath = process.mainModule?.path;
    if (!mainPath || !process.mainModule?.filename)
      throw new Error("No main module path found");

    this.projectName = props.project;
    // this.fakeLibs();
    this.distPath =
      props.distPath ||
      path.join(path.join(mainPath, "../dist/apps", this.projectName));
    this.api = props.api;
    this.fn = this.getFuction();
    this.fnIntegraion = this.getFnIntergation();
    this.authorizers = props.authorizers || {};

    this.registerSchemas();
    const authMap = this.readAuthorizers();
    this.registerMethods(authMap);
  }

  getFuction() {
    // this.fakeLibs();
    return new NodejsFunction(this, `${titleCase(this.projectName)}Function`, {
      runtime: Runtime.NODEJS_18_X,
      entry: path.join(this.distPath, `main.js`),
      handler: "handler",
      memorySize: 512,
    });
  }

  getFnIntergation() {
    return new LambdaIntegration(this.fn);
  }

  registerSchemas() {
    const schemaPath = path.join(this.distPath, "_generated/json-schema.json");
    const schema = JSON.parse(fs.readFileSync(schemaPath, "utf-8")) as Record<
      string,
      Object
    >;

    Object.entries(schema).forEach(([key, schema]) => {
      schema = this.schemaModifier(schema);

      const model = new Model(
        this.api,
        `${titleCase(this.projectName)}${key}`,
        {
          restApi: this.api,
          contentType: "application/json",
          description: "To validate the request body",
          modelName: `${titleCase(this.projectName)}${key}`,
          schema,
        }
      );
      this.models.set(key, model);
    });
  }

  schemaModifier(schema: Object) {
    return JSON.parse(
      JSON.stringify(schema).replace(
        /\$\{PREFIX\:\:SCHEMA\}/g,
        `https://apigateway.amazonaws.com/restapis/${
          this.api.restApiId
        }/models/${titleCase(this.projectName)}`
      )
    );
  }

  registerMethods(authMap: IAuthMap) {
    const methods: any = Object.entries(this.getMethods());

    for (let i = 0; i < methods.length; i++) {
      const [method, path] = methods[i][0].split(" ");
      const methodName = methods[i][1].method;
      const bodyValidator: Model | undefined = methods[i][1].bodyValidator;
      const resource = this.getResource(path);

      const methodOptions: Mutable<MethodOptions> = {};

      const auth = authMap[methodName];

      if (auth) {
        methodOptions.authorizer = { authorizerId: auth.ref };
        methodOptions.authorizationType = AuthorizationType.COGNITO;
      }

      if (bodyValidator) {
        methodOptions.requestModels = {
          "application/json": bodyValidator,
        };
      }
      methodOptions.requestValidatorOptions = {
        validateRequestBody: true,
      };

      resource.addMethod(method, this.fnIntegraion, methodOptions);
    }
  }

  readAuthorizers(): IAuthMap {
    const authorizersPath = path.join(this.distPath, "_generated/auth.json");
    if (!fs.existsSync(authorizersPath)) return {};
    return Object.fromEntries(
      Object.entries(JSON.parse(fs.readFileSync(authorizersPath, "utf-8"))).map(
        ([key, authName]) => [key, this.authorizers[`${authName}`]]
      )
    );
  }

  getMethods() {
    const swaggerPath = path.join(this.distPath, "_generated/swagger.json");
    const swagger = JSON.parse(
      fs.readFileSync(swaggerPath, "utf-8")
    ) as OpenAPIObject;
    return Object.entries(swagger.paths).reduce((response, [path, methods]) => {
      const methodNames = Object.keys(methods);
      for (let i = 0; i < methodNames.length; i++) {
        const method = methodNames[i] as "get";

        const requestBody = methods[method]?.requestBody as RequestBodyObject;

        const value: any = {
          method: methods[method]?.operationId,
        };

        if (requestBody) {
          const [bodyContent] = Object.values(requestBody.content || {});
          const schema = bodyContent?.schema as ReferenceObject;
          if (schema && schema.$ref)
            value.bodyValidator = this.models.get(
              schema.$ref.split("/").pop()!
            );
        }

        response[`${method.toUpperCase()} ${path}`] = value;
      }
      return response;
    }, {} as Record<string, any>);
  }

  getResource(path: string, rootResource?: Resource) {
    if (!rootResource) rootResource = this.api.root as Resource;

    const parts = path.split("/").filter((a) => a != "");
    let currentResource: Resource = rootResource;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!part) continue;
      const existingResource = currentResource.getResource(part) as Resource;
      currentResource = existingResource || currentResource.addResource(part);
    }

    return currentResource;
  }

  // fakeLibs() {
  //   [
  //     "@nestjs/microservices",
  //     "@nestjs/websockets",
  //     "@nestjs/microservices/microservices-module",
  //     "@nestjs/websockets/socket-module",
  //     "lodash.groupby",
  //     "lodash.merge",
  //     "js-yaml",
  //     "swagger-ui-dist",
  //     "swagger-ui-dist/absolute-path.js",
  //     // "path-to-regexp",
  //     // "@nestjs/mapped-types",
  //     "class-transformer/storage",
  //   ].forEach(makeFakeLib);
  // }
}
