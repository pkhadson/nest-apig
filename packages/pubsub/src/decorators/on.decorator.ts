import { IPubSub } from "../interface/pubsub-json.interface";

export const On =
  (eventPatterns: string | string[]): MethodDecorator =>
  (target, propertyKey, descriptor: PropertyDescriptor) => {
    const pubsub: IPubSub = Reflect.get(globalThis, `nest-cdk:pubsub`) || {
      events: [],
    };

    pubsub.events.push({
      events:
        typeof eventPatterns === "string" ? [eventPatterns] : eventPatterns,
      service: target.constructor.name,
      method: propertyKey.toString(),
    });

    Reflect.set(globalThis, `nest-cdk:pubsub`, pubsub);

    Reflect.set(
      globalThis,
      `service:${target.constructor.name}`,
      target.constructor
    );
  };
