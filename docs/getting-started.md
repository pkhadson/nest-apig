# Getting Started with Nest CDK

Welcome to the Nest CDK library! This guide will help you get started with the library and walk you through the steps of setting up your application.

## 1. Install Nest CDK

To install the Nest CDK library, use one of the following package managers:

::: code-group

```shell [yarn]
yarn add @nest-cdk/core
```

```shell [npm:
npm i @nest-cdk/core
```

```shell [pnpm]
pnpm add @nest-cdk/core
```

:::

## 2. Create Your CDK Application Infrastructure

Ensure you have an existing AWS CDK application set up. If not, create one using the following steps:

```typescript
import * as cdk from "aws-cdk-lib";
import { RestApi } from "aws-cdk-lib/aws-apigateway";

const app = new cdk.App();

// Define your API using AWS CDK constructs
const api = new RestApi(app, "MyApi");

// ... (add more infrastructure components as needed)
```

## 3. Use Nest Application Stack

Integrate Nest CDK into your AWS CDK application by adding the NestApplicationStack:

```typescript
import { defineConfig } from "@nest-cdk/core/register";
import * as cdk from "aws-cdk-lib";

const app = new cdk.App();

defineConfig({
  app,
  name: "ProjectName",
});
```

## 4. Configure main.ts for AWS Lambda Integration

Adjustments include setting up a global handler and checking the environment to determine whether the application is running in Lambda mode.

```typescript
import { AppModule } from "./app.module";
import { NestFactory } from "@nestjs/core";
import { getHandler, Handler } from "@nest-cdk/core";

const _app = NestFactory.create(AppModule);

if (!process.env.LAMBDA_TASK_ROOT && !process.env.GENERATE) {
  // check if is lambda or build_mode
  const bootstrap = async () => {
    const app = await _app;
    app.enableCors();
    await app.listen(1307); // in no lambda mode
  };

  bootstrap();
}

export const handler: Handler = getHandler(_app);
global["handler"] = handler;
```

## 5. CDK CLI Commands

Use the AWS CDK CLI to synthesize, bootstrap, and build your project:

- Synthesize CDK templates:

  ```bash
  cdk synth
  ```

- Bootstrap your AWS environment (if not already done):

  ```bash
  cdk bootstrap
  ```

- Build the project:

  ```bash
  npm run build
  ```

This completes the setup of your Nest CDK application. You can now deploy and manage your infrastructure using the AWS CDK.

For more details and advanced features, refer to the official documentation of Nest CDK.

---

Feel free to customize the instructions based on your library's specific details and requirements.
