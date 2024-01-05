import type { StackProps } from "aws-cdk-lib";
import { Stack } from "aws-cdk-lib";
import {
  CfnAuthorizer,
  CfnAuthorizerProps,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { Build } from "@nest-cdk/build";
import * as path from "node:path";
import { NestAppStack } from "./nest.stack";
export * from "./nest.stack";
import titleCase from "./utils/title-case.util";

interface INestCdkConfig {
  app: any;
  restApi?: false | RestApi;
  name?: string;
  props?: StackProps;
  rootPath?: string;
  plugins?: any[];
  env?: any;
  authorizers?: Record<string, Exclude<CfnAuthorizerProps, "restApiId">>;
}

export class NestCdkStack extends Stack {
  api?: RestApi;
  authorizers: Record<string, CfnAuthorizer> = {};
  constructor(scope: Construct, id: string, private props: INestCdkConfig) {
    super(scope, id, props.props);

    // console.log("process.mainModule?.path", process.mainModule?.path);

    //     new NestStack(this, 'NestApplication', {
    //   project: 'nest-application',
    //   distPath: 'dist',
    //   api: api,
    // });
  }

  getApi() {
    if (this.api) return this.api;
    if (this.props.restApi === false) return;
    if (this.props.restApi) return this.props.restApi!;
    this.api = new RestApi(this, "Api");
    return this.api!;
  }

  getAuthorizer(name: string) {
    if (this.authorizers[name]) return this.authorizers[name];
    if (!this.props.authorizers![name])
      throw new Error(`No authorizer found with name ${name}`);

    const api = this.getApi();
    if (!api) throw new Error("No api found");

    const authorizer = new CfnAuthorizer(this, name, {
      ...this.props.authorizers![name],
      restApiId: api.restApiId,
    });
    this.authorizers[name] = authorizer;
    return authorizer;
  }

  getAuthorizers() {
    const authorizers = Object.keys(this.props.authorizers || {});
    for (let i = 0; i < authorizers.length; i++) {
      this.getAuthorizer(authorizers[i]);
    }
    return this.authorizers;
  }

  async init() {
    const rootPath = path.join(
      process.mainModule?.path || "",
      this.props.rootPath || ".."
    );

    const build = new Build({
      path: rootPath,
    });

    if (!process.env.IGNORE_BUILD) await build.run();

    this.getAuthorizers();

    const stacks: NestAppStack[] = [];

    if (build.isMonorepo) {
      const projects = build.projectNames;
      for (const project of projects) {
        stacks.push(
          new NestAppStack(this, `${titleCase(project)}Nest`, {
            api: this.getApi(),
            project,
            distPath: path.join(rootPath, "dist/apps", project),
            env: this.props.env,
            authorizers: this.authorizers,
          })
        );
      }
    } else {
      stacks.push(
        new NestAppStack(this, "NestApplication", {
          api: this.getApi(),
          project: "nest-application",
          distPath: path.join(rootPath, "dist"),
          env: this.props.env,
          authorizers: this.authorizers,
        })
      );
    }

    this.props.plugins?.forEach((plugin) => {
      stacks.forEach((stack) => {
        plugin.register(stack);
      });
    });

    return stacks;
  }
}

export const defineConfig = (opts: INestCdkConfig) => {
  return new NestCdkStack(opts.app, opts.name || "Nest", opts).init();
};
