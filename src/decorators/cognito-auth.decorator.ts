export const CognitoAuth =
  (authName: string): MethodDecorator =>
  (target, propertyKey, descriptor) => {
    const methodName = `${target.constructor.name}_${propertyKey.toString()}`;
    const authMap = Reflect.get(globalThis, "authMap") || {};
    authMap[methodName] = authName;

    Reflect.set(globalThis, "authMap", authMap);

    return descriptor;
  };
