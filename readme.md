# Nest-ApiG - Integration of NestJS with AWS Lambda and AWS CDK

<p  align="center">
    <a href="https://npmjs.com/nest-apig">
        <img  src="https://img.shields.io/npm/v/nest-apig.svg"  alt="NPM Version"  />
    </a>
    <img  src="https://img.shields.io/npm/l/nest-apig.svg"  alt="Package License"  />
    <img  src="https://img.shields.io/npm/dm/nest-apig.svg"  alt="NPM Downloads"  />
</p>

Nest-ApiG is a library that simplifies the integration of [NestJS](https://nestjs.com/) with AWS Lambda and makes your NestJS application compatible with the [AWS CDK](https://aws.amazon.com/cdk/). With this library, you can easily transform your NestJS application into a Lambda function and make it executable using AWS CDK. Nest-ApiG offers several features to streamline serverless application development, including:

- Automatic creation of handlers for the API Gateway.
- Input payload validation using class-transformer and class-validator.
- Use of the `@OnAtlasEvent` decorator to associate service methods with specific events in MongoDB Atlas.
- Integrated authentication with Amazon Cognito using the `@CognitoAuth` decorator.

Here are some details on how to use and configure Nest-ApiG in your project:

## Installation

To get started with Nest-ApiG, you need to install it in your project:

```bash
npm install nest-apig
# or
yarn add nest-apig
```

## Configuration

Here are some examples of how you can configure Nest-ApiG in your project:

### Creating the Handler for the API Gateway

You can create a handler for the API Gateway in the main.ts file as follows:

```typescript
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { getHandler } from "nest-apig";
import type { Handler } from "aws-lambda";

export const handler: Handler = getHandler(NestFactory.create(AppModule));
global["handler"] = handler;
```

This allows your NestJS application to run as a Lambda function.

## Payload Validation

Nest-ApiG simplifies input payload validation. Just use NestJS decorators like @Body() to define the structure of your payload. Validation will be automatically handled outside the Lambda function, reducing execution costs.

### `@OnMongoAtlas` Decorator

The `@OnMongoAtlas` decorator allows you to associate service methods with specific events in MongoDB Atlas. You can use it as follows:

```typescript
@OnMongoAtlas(['user.created'])
sendWelcomeMail(user: UserModel){...}

@OnMongoAtlas(['user.deleted'])
sendByeMail(user: UserModel) {}

@OnMongoAtlas(['user.updated'], {status: {prefix: "SUSPENSED"}})
onUserSuspensed(user: UserModel) {}
```

This ensures that the methods are automatically called when the specified events occur in the database.

### `@CognitoAuth` Decorator

The `@CognitoAuth` decorator is used to authenticate methods of a controller with Amazon Cognito. You can configure it like this:

```typescript
class AppController {
  @Get("hello-1")
  hello1() {
    return "Hello 1";
  }

  @CognitoAuth("AdminAuth")
  @Get("hello-2")
  hello2() {
    return "Hello 2";
  }
}
```

It will ensure that only authenticated users with the 'AdminAuth' profile have access to the hello2 method.

# Integration with AWS CDK

You can easily integrate your NestJS application with AWS CDK for simplified deployment to AWS. Refer to the AWS CDK documentation for details on programmatically configuring your infrastructure.

## Contributing

We welcome contributions! If you'd like to improve Nest-ApiG, feel free to open an issue or submit a pull request on our GitHub repository.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.

## Authors

Patrick Hadson - pkhadson@gmail.com

## Acknowledgments

We would like to thank NestJS and all open-source software developers who make this project possible.
