export const OnAtlasEvent =
  (events: string[], filter?: Object): MethodDecorator =>
  (target, propertyKey, descriptor: PropertyDescriptor) => {
    const atlasEvents = Reflect.get(globalThis, "atlasEvents") || [];
    atlasEvents.push({
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
    Reflect.set(globalThis, "atlasEvents", atlasEvents);
    return descriptor;
  };
