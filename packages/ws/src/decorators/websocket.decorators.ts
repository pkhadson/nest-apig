import { IWsData } from "../interfaces/data.interface";

export const WsAction =
  (actionName: string) =>
  (target: any, propertyKey: any, descriptor: PropertyDescriptor) => {
    const data: IWsData = Reflect.get(globalThis, `nest-cdk:ws`) || [];

    data.push({
      action: actionName,
      service: target.constructor.name,
      method: propertyKey.toString(),
      fnArn: "",
    });

    Reflect.set(globalThis, `nest-cdk:ws`, data);

    Reflect.set(
      globalThis,
      `service:${target.constructor.name}`,
      target.constructor
    );
  };
