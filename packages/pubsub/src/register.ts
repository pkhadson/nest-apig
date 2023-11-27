import * as path from "node:path";
import * as fs from "node:fs";
import { IPubSub } from "./interface/pubsub-json.interface";
import { Topic } from "aws-cdk-lib/aws-sns";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { SqsSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";

const register = (nestStack: any) => {
  const { events, config } = JSON.parse(
    fs.readFileSync(
      path.join(nestStack.distPath, "_generated/pubsub.json"),
      "utf-8"
    )
  ) as IPubSub;

  if (!config?.snsArn) throw new Error("SNS ARN not found in pubsub config");

  const rootTopic = Topic.fromTopicArn(nestStack, "rootTopic", config.snsArn);
  const nestFunction = nestStack.fn as NodejsFunction;

  rootTopic.grantPublish(nestFunction);

  if (!events || !events.length) return;
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const queue = new Queue(nestStack, `Queue${event.service}${event.method}`, {
      queueName: `${event.service}-${event.method}`,
    });
    rootTopic.addSubscription(
      new SqsSubscription(queue, {
        filterPolicy: {
          event: {
            conditions: event.events.map((event) =>
              event.endsWith("*") ? { prefix: event.slice(0, -1) } : event
            ),
          },
        },
      })
    );

    nestFunction.addEventSource(
      new SqsEventSource(queue, {
        batchSize: 10,
      })
    );
  }
};

export default register;
