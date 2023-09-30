import { OpenAPIObject } from "@nestjs/swagger";
import {
  ReferenceObject,
  RequestBodyObject,
} from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";
import { Stack, StackProps } from "aws-cdk-lib";
import {
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
}

export class NestStack extends Stack {
  projectName: string;
  distPath: string;
  models: Map<string, Model> = new Map();
  api: RestApi;
  fn: NodejsFunction;
  fnIntegraion: LambdaIntegration;
  constructor(scope: Construct, id: string, props: INestStackProps) {
    super(scope, id, props);

    const mainPath = process.mainModule?.path;
    if (!mainPath || !process.mainModule?.filename)
      throw new Error("No main module path found");

    this.projectName = props.project;
    this.fakeLibs();
    this.distPath = path.join(
      props.distPath?.startsWith("/")
        ? props.distPath
        : path.join(mainPath, props.distPath || "../dist"),
      `apps/${this.projectName}`
    );
    this.api = props.api;
    this.fn = this.getFuction();
    this.fnIntegraion = this.getFnIntergation();

    this.registerSchemas();
    this.registerMethods();
  }

  getFuction() {
    this.fakeLibs();
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

      const model = new Model(this, `${titleCase(this.projectName)}${key}`, {
        restApi: this.api,
        contentType: "application/json",
        description: "To validate the request body",
        modelName: `${titleCase(this.projectName)}${key}`,
        schema,
      });
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

  registerMethods() {
    const methods: any = Object.entries(this.getMethods());

    for (let i = 0; i < methods.length; i++) {
      const [method, path] = methods[i][0].split(" ");
      const bodyValidator: Model | undefined = methods[i][1].bodyValidator;
      const resource = this.getResource(path);

      const methodOptions: Mutable<MethodOptions> = {};

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

        const value: any = {};

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

  fakeLibs() {
    [
      "@nestjs/microservices",
      "@nestjs/websockets",
      "@nestjs/microservices/microservices-module",
      "@nestjs/websockets/socket-module",
      "tslib",
      "lodash.groupby",
      "lodash.merge",
      "js-yaml",
      "tslib",
      "swagger-ui-dist",
      "swagger-ui-dist/absolute-path.js",
      // "path-to-regexp",
      // "@nestjs/mapped-types",
      // "class-transformer/storage",
    ].forEach(makeFakeLib);
  }
}
