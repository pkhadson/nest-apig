import { defaultMetadataStorage } from "class-transformer/cjs/storage";

export function Type(typeFunction?: any, options: any = {}): PropertyDecorator {
  return function (target: any, propertyName: any): void {
    const reflectedType = (Reflect as any).getMetadata(
      "design:type",
      target,
      propertyName
    );

    const storage =
      defaultMetadataStorage ||
      Reflect.get(globalThis, "defaultMetadataStorage");

    storage.addTypeMetadata({
      target: target.constructor,
      propertyName: propertyName as string,
      reflectedType,
      typeFunction,
      options,
    });
  };
}
