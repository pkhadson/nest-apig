import serverlessExpress from "@vendia/serverless-express";
import type { Callback, Context, Handler, SQSEvent } from "aws-lambda";
import generate from "../generate";

let server: Handler;
async function bootstrap(app: any): Promise<Handler> {
  await app.init();
  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

let app: any;

export const getHandler = (_app: any) => {
  Reflect.set(globalThis, "LAMBDA_MODE", true);
  if (process.env.GENERATE) {
    generate(_app);
    return {} as Handler;
  }

  const handler: Handler = async (
    event: any,
    context: Context,
    callback: Callback
  ) => {
    let res: any;
    if (!app) app = await _app;
    app.enableCors();
    if (event.service && event.method) {
      const service = Reflect.get(globalThis, `service:${event.service}`);
      res = await app.get(service)[event.method](event.detail);
    } else if (event.Records) {
      await Promise.all(
        event.Records.map(async (record: any) => {
          if (record.eventSource === "aws:sqs") {
            const SQSRecord = record as SQSEvent["Records"][0];
            const [service, method] = SQSRecord.eventSourceARN
              .split(":")
              .pop()
              ?.split("-") as [string, string];

            try {
              const serviceInstance = Reflect.get(
                globalThis,
                `service:${service}`
              );
              const body = JSON.parse(SQSRecord.body);
              try {
                body.Message = JSON.parse(body.Message);
              } catch {
                console.info("NO JSON MESSAGE");
              }
              res = await app.get(serviceInstance)[method](body.Message, body);
            } catch (err) {
              console.error(err);
            }
          }
        })
      );
    } else if (event?.requestContext?.routeKey) {
      const wsData: any[] = Reflect.get(globalThis, `nest-cdk:ws`) || [];
      const actionRow = wsData.find(
        (a) => a.action === event?.requestContext?.routeKey
      );
      const service = Reflect.get(globalThis, `service:${actionRow.service}`);
      res = await app.get(service)[actionRow.method](JSON.parse(event.body));
      if (typeof res !== "object") res = {};
      if (!res.statusCode) res.statusCode = 200;
    } else {
      server = server ?? (await bootstrap(app));
      res = server(event, context, callback);
    }

    return res;
  };

  return handler;
};
