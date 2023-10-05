import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import getClaimsFromRequest from "../utils/get-clains-from-jwt.util";

export const CognitoUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return getClaimsFromRequest(request);
  }
);
