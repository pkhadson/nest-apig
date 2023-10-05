import {
  applyDecorators,
  Injectable,
  CanActivate,
  ExecutionContext,
  UseGuards,
  UnauthorizedException,
} from "@nestjs/common";
import getClaimsFromRequest from "../utils/get-clains-from-jwt.util";

@Injectable()
export class AuthService implements CanActivate {
  constructor() {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    try {
      const claims = getClaimsFromRequest(request);
      if (!claims.email) throw new UnauthorizedException();
      if (!claims.exp || claims.exp < Math.floor(Date.now() / 1000))
        throw new UnauthorizedException();

      return true;
    } catch (e) {
      response.status(401).send({ message: "Unauthorized" });
      return false;
    }
  }
}

const OriginalCognitoAuth =
  (authenticatorName: string): MethodDecorator =>
  (target, methodName) => {
    const key = `${target.constructor.name}_${methodName.toString()}`;
    const nestCdkAuth = Reflect.get(globalThis, "nest-cdk:auth") || {};
    nestCdkAuth[key] = authenticatorName;
    Reflect.set(globalThis, "nest-cdk:auth", nestCdkAuth);
  };

export const CognitoAuth = (authenticatorName: string) => {
  const isLambdaMode =
    !!process.env.LAMBDA_TASK_ROOT &&
    process.env.LAMBDA_TASK_ROOT !== "false" &&
    process.env.LAMBDA_TASK_ROOT !== "0";

  const decorators = [OriginalCognitoAuth(authenticatorName)];

  if (!isLambdaMode) decorators.push(UseGuards(AuthService));

  return applyDecorators(...decorators);
};
