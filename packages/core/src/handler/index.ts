import serverlessExpress from "@vendia/serverless-express";
import type { Callback, Context, Handler } from "aws-lambda";
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
    if (event.service && event.method) {
      const service = Reflect.get(globalThis, `service:${event.service}`);
      res = await app.get(service)[event.method](event.detail);
    } else {
      server = server ?? (await bootstrap(app));
      res = server(event, context, callback);
    }

    return res;
  };

  return handler;
};
