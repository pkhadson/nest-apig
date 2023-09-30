import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { validationMetadatasToSchemas } from "class-validator-jsonschema";
import fs from "node:fs";
import * as path from "node:path";
import { nestedValidation } from "./jsonschema/validators";

const generate = async (app: any) => {
  app = await app;
  const mainPath = process.mainModule?.path;
  if (!mainPath || !process.mainModule?.filename)
    throw new Error("No main module path found");

  // create _generated folder if not exist
  if (fs.existsSync(`${mainPath}/_generated`))
    fs.rmSync(`${mainPath}/_generated`, { recursive: true });
  fs.mkdirSync(`${mainPath}/_generated`);

  // the below function add a line to end of handler file
  fs.writeFileSync(
    process.mainModule?.filename,
    "\nexports.handler=global['handler']",
    {
      flag: "a",
    }
  );

  // write swagger.json and json-schema.json
  const swaggerPath = path.resolve(`${mainPath}/_generated/swagger.json`);
  const jsonSchemaPath = path.resolve(
    `${mainPath}/_generated/json-schema.json`
  );

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

  // write all of anothers json files based on Reflect.get(globalThis, "nest-cdk:")
  const keys = Reflect.ownKeys(globalThis).filter((key) =>
    key.toString().startsWith("nest-cdk:")
  );

  keys.forEach((key) => {
    const file = key.toString().replace("nest-cdk:", "");
    const filePath = path.resolve(`${mainPath}/_generated/${file}.json`);
    const data = Reflect.get(globalThis, key);
    fs.writeFileSync(filePath, JSON.stringify(data));
  });
};

export default generate;
