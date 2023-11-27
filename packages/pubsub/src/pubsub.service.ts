import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import { Inject } from "@nestjs/common";
import { IPubSubModuleOptions } from "./interface/pubsub-module.interfaces";

export class PubSubService {
  client: SNSClient;
  region: string;
  constructor(
    @Inject("PUBSUB_CONFIG") private readonly config: IPubSubModuleOptions
  ) {
    this.region = this.getRegion();
    this.client = new SNSClient({ region: this.region });
  }

  getRegion(): string {
    const region = this.config.snsArn.split(":")[3];
    if (!region) throw new Error("Invalid SNS ARN");
    return region.toString();
  }

  emit(eventName: string, data?: any) {
    const command = new PublishCommand({
      TopicArn: this.config.snsArn,
      Message: data ? JSON.stringify(data) : "null",
      MessageAttributes: {
        event: {
          DataType: "String",
          StringValue: eventName,
        },
      },
    });
    return this.client.send(command);
  }
}
