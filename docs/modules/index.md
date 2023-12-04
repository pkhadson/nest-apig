# Features

## Mission: Save Money

At Nest CDK, our mission is to empower developers to build cost-effective and efficient applications in the cloud. We understand the importance of optimizing resources and minimizing unnecessary expenses. Each feature in our library is crafted with the goal of contributing to significant cost savings in your AWS infrastructure.

### Example: Body Validator

One prominent example of how Nest CDK helps you save money is through the **Body Validator** feature. Traditionally, when dealing with AWS Lambda functions, input validation is often handled within the function code. This means that even invalid requests consume resources as the Lambda function is invoked, leading to unnecessary costs.

With Nest CDK's Body Validator feature, we shift the responsibility of input validation from the Lambda layer to the API Gateway layer. By implementing validation at the API Gateway, invalid requests are identified and rejected before reaching the Lambda function. This not only improves the efficiency of your application but also prevents the invocation of Lambda functions with invalid payloads, ultimately saving you money on unnecessary compute resources.

By embracing features like the Body Validator, you can ensure that your AWS resources are utilized efficiently, leading to cost optimization and a more economical cloud infrastructure.

Discover more cost-saving features and unleash the full potential of Nest CDK in building robust yet economical applications.
