import { IPubSub } from "./interface/pubsub-json.interface";

class MetadataStorage {
  private static metadataName = "pubsub";
  private static metadata: IPubSub = { events: [] };

  public static refresh() {
    this.metadata =
      Reflect.get(globalThis, `nest-cdk:${this.metadataName}`) || {};
  }

  public static save() {
    Reflect.set(globalThis, `nest-cdk:${this.metadataName}`, this.metadata);
  }

  public static addEvent(event: IPubSub["events"][0]) {
    this.refresh();
    this.metadata.events.push(event);
    this.save();
  }

  public static addConfig(config: IPubSub["config"]) {
    this.refresh();
    this.metadata.config = config;
    this.save();
  }
}

export default MetadataStorage;
