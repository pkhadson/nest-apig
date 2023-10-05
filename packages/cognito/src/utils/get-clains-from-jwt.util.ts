import { UnauthorizedException } from "@nestjs/common";

const CLAIMS_RGX = /\.([^\.]+)./;

const getClaimsFromRequest = (request: any) => {
  const authorizationHeader = request.headers.authorization;

  if (!authorizationHeader) throw new UnauthorizedException();

  const [, claimsB64] = authorizationHeader.match(CLAIMS_RGX) || [];

  const claims = JSON.parse(Buffer.from(claimsB64, "base64").toString("utf-8"));
  return claims;
};

export default getClaimsFromRequest;
