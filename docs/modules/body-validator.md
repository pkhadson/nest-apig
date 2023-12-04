# Body Validator Feature

Nest CDK's **Body Validator** feature enhances the validation process for incoming requests by seamlessly integrating with the powerful NestJS Validator, using the well-known `class-validator` library. This feature ensures that only valid payloads reach your AWS Lambda functions, preventing unnecessary computation costs and improving the efficiency of your application.

## NestJS Validator and class-validator

NestJS Validator is a robust validation module that simplifies the validation of incoming data in NestJS applications. It seamlessly integrates with `class-validator`, a popular validation library for TypeScript and JavaScript.

- [NestJS Validation Documentation](https://docs.nestjs.com/techniques/validation)

Class-validator allows you to express validation rules using decorators on your DTOs (Data Transfer Objects). For example, a simple DTO with validation might look like this:

```typescript
import { IsString, IsInt } from "class-validator";

export class CreateCatDto {
  @IsString()
  readonly name: string;

  @IsInt()
  readonly age: number;
}
```

In this example, `IsString` and `IsInt` are decorators from `class-validator` specifying that the `name` property should be a string and the `age` property should be an integer.

## Nest CDK's Body Validator in Action

When you build your Nest CDK application, the library automatically processes all DTOs, generating a JSON schema for each one. This schema is then configured in the AWS API Gateway, ensuring that the API Gateway rejects requests with payloads that do not conform to the specified validation rules.

### Configuration

No additional configuration is needed to make class-validator work with Nest CDK. As part of the build process, the library seamlessly integrates with class-validator, leveraging the validation rules specified in your DTOs to enhance the validation process at the API Gateway layer.

This integration not only enforces a higher level of data integrity but also contributes to significant cost savings by preventing the invocation of Lambda functions with invalid payloads.

Explore the power of Nest CDK's Body Validator feature in conjunction with class-validator to build resilient and cost-effective applications.
