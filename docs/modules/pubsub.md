# PubSub Feature

Nest CDK's **PubSub** feature allows you to seamlessly implement the Publish-Subscribe architecture in your NestJS application. This feature is based on two main components: the `@On` decorator and the NestJS module with service, `PubSubModule`, and `PubSubService`.

## Getting Started

### 1. Create an SNS Topic in Your AWS Account

Before using the PubSub feature, create an SNS (Simple Notification Service) topic in your AWS account. Save the ARN (Amazon Resource Name) string of the topic, as it will be used in the configuration.

// isntall @aws-sdk/client-sns

### 2. Install packages:

```shell
npm install @aws-sdk/client-sns @nest-cdk/pubsub --save-dev
```

### 3. Import PubSubModule in Your App Module and in yout CDK code

In your NestJS `AppModule`, import the `PubSubModule` and configure it with the SNS ARN:

```typescript
import { PubSubModule } from "@nest-cdk/pubsub";
import { Module } from "@nestjs/common";

@Module({
  imports: [
    PubSubModule.forRoot({
      snsArn: "arn:aws:sns:us-east-1:123456789:SnsName",
    }),
    // ... other modules
  ],
  // ... other module configurations
})
export class AppModule {}
```

```typescript
import { defineConfig } from "@nest-cdk/core/register";
import PubSubPlugin from "@nest-cdk/pubsub/register";
import * as cdk from "aws-cdk-lib";

const app = new cdk.App();

defineConfig({
  app,
  name: "Pubsub",
  plugins: [new PubSubPlugin()],
});
```

### 4. Import PubSubService in Your Service

Inject the `PubSubService` into your service for easy event emission:

```typescript
import { PubSubService } from "@nest-cdk/pubsub";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  constructor(private readonly pubSubService: PubSubService) {}

  // ... other service methods
}
```

### 5. Register a Listener for Your Event

Use the `@On` decorator to register a listener for a specific event in your service:

```typescript
import { On } from "@nest-cdk/pubsub";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  @On("event.name") // heve you can use * (like: user.*)
  handleMyTopic(message: any) {
    console.log("Received message: ", message);
  }

  // ... other service methods
}
```

### 6. Emit an Event

Use the `PubSubService` to emit an event:

```typescript
import { PubSubService } from "@nest-cdk/pubsub";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  constructor(private readonly pubSubService: PubSubService) {}

  emitEvent() {
    this.pubSubService.emit("event.name", {
      message: "Hello World",
    });
  }

  // ... other service methods
}
```

## Conclusion

The PubSub feature in Nest CDK provides a simple and effective way to implement the Publish-Subscribe pattern in your NestJS application. Utilize the `@On` decorator and the `PubSubService` to create a flexible and scalable event-driven architecture.

Explore the full potential of PubSub in Nest CDK and build reactive and responsive applications with ease.
