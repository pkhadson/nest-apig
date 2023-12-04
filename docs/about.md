# Overview

The Nest CDK library is designed to optimize the development of serverless applications using the TypeScript NestJS framework and AWS-CDK. Its mission is to shift as much processing as possible to the serverless layer, saving machine resources and consequently bringing significant cost savings to the project or company that uses this library.

## Save money

While NestJS’s documentation provides a guide for using it in a lambda, it’s not an ideal approach due to the high startup time of the lambda container with NestJS. The Nest CDK library helps by reducing the container startup time and making the use of NestJS in lambda feasible.

## Introduce features

By using class-validator and class-transformer in NestJS, the Nest CDK library will transform the DTOs, the input payload of HTTP requests, into JSON schemas. These will be configured at the API Gateway layer so that body validation is done at the API Gateway, preventing a lambda function from starting to perform this role, and thus saving money.

The library also allows, using @nestcdk/pubsub, for the @On decorator to listen to events fired by the PubSubService.
