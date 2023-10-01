/**
 *
 *
 *
 *
 *
 *
 *           FUNCIONALIDADE INTERROMPIDA
 *
 *
 *
 *
 *
 *
 */

interface IOpts {
  collection?: string;
  dataSource?: string;
  database?: string;
}

const genericAction = (action: string, opts: IOpts) => {
  let collection: any = opts.collection;
  if (typeof collection !== "string")
    collection = Reflect.get(collection.constructor, "collection");
  if (!collection || typeof collection !== "string")
    throw new Error("Collection name is required");

  return function (target: any, ctx: any, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    const methodResult = originalMethod() || {};
    const integration = {
      method: ctx.name || ctx,
      service: target.constructor.name,
      methodResult,
      action,
      collection,
    };

    return descriptor;
  };
};

export const FindAll = (collection: any, opts?: IOpts) =>
  genericAction("find", { collection, ...opts });

export const FindOne = (collection: any, opts?: IOpts) =>
  genericAction("findOne", { collection, ...opts });

export const InsertOne = (collection: any, opts?: IOpts) =>
  genericAction("insertOne", { collection, ...opts });
