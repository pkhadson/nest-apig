import { targetConstructorToSchema } from "class-validator-jsonschema";
import { SchemaConverter } from "class-validator-jsonschema/build/defaultConverters";

export const nestedValidation: SchemaConverter = (meta, options) => {
  if (typeof meta.target === "function") {
    const typeMeta = options.classTransformerMetadataStorage
      ? options.classTransformerMetadataStorage.findTypeMetadata(
          meta.target,
          meta.propertyName
        )
      : null;

    const childType: any = typeMeta
      ? typeMeta.typeFunction()
      : Reflect.getMetadata(
          "design:type",
          meta.target.prototype,
          meta.propertyName
        );

    return targetConstructorToSchema(childType, options);
  }
};
