import { applyDecorators } from "@nestjs/common";

const OriginalAuth =
  (authenticatorName: string): MethodDecorator =>
  (target, methodName) => {
    const key = `${target.constructor.name}_${methodName.toString()}`;
    const nestCdkAuth = Reflect.get(globalThis, "nest-cdk:auth") || {};
    nestCdkAuth[key] = authenticatorName;
    Reflect.set(globalThis, "nest-cdk:auth", nestCdkAuth);
  };

export const Auth = (authenticatorName: string) => {
  const decorators = [OriginalAuth(authenticatorName)];

  return applyDecorators(...decorators);
};
