import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import {
  WebSocketApi,
  WebSocketApiProps,
  WebSocketStage,
} from "@aws-cdk/aws-apigatewayv2-alpha";
import { Construct } from "constructs";
import type { NestAppStack } from "@nest-cdk/core/register";
import { IWsData } from "./interfaces/data.interface";
import * as path from "node:path";
import * as fs from "node:fs";
import * as apigw2Integrations from "@aws-cdk/aws-apigatewayv2-integrations-alpha";

interface IWebSocketStackProps {
  wsApiProps?: WebSocketApiProps;
}

class WebSocketPlugin {
  wsApi?: WebSocketApi;
  constructor(private props?: IWebSocketStackProps) {}

  getWsApi(scope: any) {
    if (this.wsApi) return this.wsApi;
    this.wsApi = new WebSocketApi(scope, "WebSocketApi", {
      routeSelectionExpression: "$request.body.action",
      ...(this.props?.wsApiProps || {}),
    });

    new WebSocketStage(this.wsApi, "Prod", {
      webSocketApi: this.wsApi,
      stageName: "prod",
      autoDeploy: true,
    });
    new CfnOutput(this.wsApi, "WebSocket", { value: this.wsApi.apiEndpoint });
    return this.wsApi;
  }

  register(nestStack: NestAppStack) {
    const wsData = this.getWsData(nestStack);

    for (let i = 0; i < wsData.length; i++) {
      const ws = wsData[i];
      this.getWsApi(nestStack.api || nestStack).addRoute(ws.action, {
        integration: new apigw2Integrations.WebSocketLambdaIntegration(
          `${ws.service}-${ws.method}-ws` as any,
          nestStack.fn as any
        ),
      });
    }
  }

  getWsData(nestStack: NestAppStack): IWsData {
    const filePath = path.join(nestStack.distPath, "_generated/ws.json");

    if (!fs.existsSync(filePath)) return [];

    return (JSON.parse(fs.readFileSync(filePath, "utf-8")) as IWsData) || [];
  }
}

export default WebSocketPlugin;
