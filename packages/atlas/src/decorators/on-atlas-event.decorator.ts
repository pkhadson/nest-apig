import { filterParse } from "../helpers/filter-parse";

export const OnAtlasEvent =
  (events: string[], filter?: Object): MethodDecorator =>
  (target, propertyKey, descriptor: PropertyDescriptor) => {
    const filterParsed = filterParse({
      events,
      filter,
      service: target.constructor.name,
      method: propertyKey,
    });

    Reflect.set(
      globalThis,
      `service:${target.constructor.name}`,
      target.constructor
    );

    const atlasEvents = Reflect.get(globalThis, "nest-cdk:atlas-events") || [];
    Reflect.set(globalThis, "nest-cdk:atlas-events", [
      ...atlasEvents,
      filterParsed,
    ]);
    return descriptor;
  };
