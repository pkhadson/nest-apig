# Authentication Feature

Nest CDK's **Authentication** feature empowers developers to seamlessly integrate authentication mechanisms, such as Cognito, directly from NestJS code to API Gateway Lambda functions. This feature streamlines the authentication process and ensures secure access to your endpoints.

## Cognito Authentication Example

### 1. Create an instance of CfnAuthorizer

Start by creating an instance of `CfnAuthorizer` from the AWS CDK, specifying the details for the Cognito User Pool:

```typescript
import { CfnAuthorizer } from "@aws-cdk/aws-apigateway";

const userAuth = new CfnAuthorizer(this, "UserAuth", {
  restApiId: this.api.restApiId,
  type: "COGNITO_USER_POOLS",
  name: "UserAuth",
  identitySource: "method.request.header.Authorization",
  providerArns: [
    "arn:aws:cognito-idp:us-east-1:525093512740:userpool/us-east-1_mjkpZWeuW",
  ],
});
```

### 2. Pass the Authorizer to NestStack

Include the created authorizer in the configuration when initializing the `NestStack`:

```typescript
import { NestStack } from "@nest-cdk/core";

const nest = new NestStack(this.api, "Nest", {
  api: this.api,
  authorizers: { UserAuth: userAuth }, // Use the 'UserAuth' name in the next steps
});
```

### 3. Use the CognitoAuth Decorator in Controller

Protect specific methods/endpoints with the `CognitoAuth` decorator to enforce Cognito authentication:

```typescript
import { Get, Controller } from "@nestjs/common";
import { CognitoAuth } from "@nest-cdk/cognito";

@Controller()
export class ApiController {
  @CognitoAuth("UserAuth")
  @Get()
  helloWorld() {
    return `Hello World at ${new Date().toISOString()}`;
  }

  @CognitoAuth("UserAuth")
  @Get("getMe")
  helloWorld(@CognitoUser() user) {
    return user;
  }
}
```

### 4. Use CognitoUser to Get User Data

If needed, retrieve user data within the protected method using the `CognitoUser` decorator:

```typescript
import { Get, Controller } from "@nestjs/common";
import { CognitoAuth, CognitoUser } from "@nest-cdk/cognito";

@Controller()
export class ApiController {
  @CognitoAuth("UserAuth")
  @Get("getMe")
  helloWorld(@CognitoUser() user) {
    return user;
  }
}
```

## Other Authentication Providers

For other authentication providers like Keycloak, please refer to the relevant NestJS modules and follow their documentation for integration:

- [NestJS Passport Module](https://docs.nestjs.com/security/authentication#passport)
- [NestJS Keycloak Connect Module](https://www.npmjs.com/package/nest-keycloak-connect)

Integrate the desired authentication provider into your NestJS application and use the Nest CDK to secure your API Gateway Lambda functions.
