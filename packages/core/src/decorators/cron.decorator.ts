interface CronOptions {
  readonly minute?: string;
  readonly hour?: string;
  readonly day?: string;
  readonly month?: string;
  readonly year?: string;
  readonly weekDay?: string;
}

export const Cron =
  (options: any = {}): MethodDecorator =>
  (target, propertyKey, descriptor: PropertyDescriptor) => {
    const cron = Reflect.get(globalThis, "nest-cdk:cron") || [];
    cron.push({
      rule: options,
      service: target.constructor.name,
      method: propertyKey,
    });
    Reflect.set(
      globalThis,
      `service:${target.constructor.name}`,
      target.constructor
    );
    Reflect.set(globalThis, "nest-cdk:cron", cron);
    return descriptor;
  };
