import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import serverlessExpress from "@vendia/serverless-express";
import type { Callback, Context, Handler } from "aws-lambda";
import { validationMetadatasToSchemas } from "class-validator-jsonschema";
import fs from "node:fs";
import * as path from "node:path";
export * from "./decorators/cognito-auth.decorator";
export * from "./decorators/on-atlas-event.decorator";
import { nestedValidation } from "./jsonschema/nested-validation";
import { subjectToRule } from "./atlas/utils/subject-to-rule";
import { filterParse } from "./atlas/filter-parse";

let server: Handler;
async function bootstrap(app: any): Promise<Handler> {
  await app.init();
  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

const generate = async (app: any) => {
  app = await app;
  const mainPath = process.mainModule?.path;
  if (!mainPath || !process.mainModule?.filename)
    throw new Error("No main module path found");

  // the below function add a line to end of file
  fs.writeFileSync(
    process.mainModule?.filename,
    "\nexports.handler=global['handler']",
    {
      flag: "a",
    }
  );

  const swaggerPath = path.resolve(`${mainPath}/swagger.json`);
  const jsonSchemaPath = path.resolve(`${mainPath}/json-schema.json`);
  const authMapPath = path.resolve(`${mainPath}/auth-map.json`);
  const onAtlasEventPath = path.resolve(`${mainPath}/on-atlas-event.json`);

  const config = new DocumentBuilder().build();

  const document = SwaggerModule.createDocument(app, config);
  fs.writeFileSync(swaggerPath, JSON.stringify(document));

  const schemas = validationMetadatasToSchemas({
    classTransformerMetadataStorage: Reflect.get(
      globalThis,
      "defaultMetadataStorage"
    ),
    refPointerPrefix: "${PREFIX::SCHEMA}",
    additionalConverters: {
      nestedValidation,
    },
  });

  fs.writeFileSync(jsonSchemaPath, JSON.stringify(schemas));

  const authMap = Reflect.get(globalThis, "authMap");

  if (authMap) fs.writeFileSync(authMapPath, JSON.stringify(authMap));

  const onAtlasEvent = Reflect.get(globalThis, "atlasEvents");
  fs.writeFileSync(
    onAtlasEventPath,
    JSON.stringify((onAtlasEvent || []).map(filterParse), null, 2)
  );
};

let app: any;

export const getHandler = (_app: any) => {
  if (process.env.GENERATE) {
    generate(_app);
    return {} as Handler;
  }

  const handler: Handler = async (
    event: any,
    context: Context,
    callback: Callback
  ) => {
    console.time("ALL");

    let res: any;
    if (!app) app = await _app;
    if (event.service && event.method) {
      const service = Reflect.get(globalThis, `service:${event.service}`);
      res = await app.get(service)[event.method](event.detail);
    } else {
      server = server ?? (await bootstrap(app));
      res = server(event, context, callback);
    }

    console.timeEnd("ALL");
    return res;
  };

  return handler;
};
