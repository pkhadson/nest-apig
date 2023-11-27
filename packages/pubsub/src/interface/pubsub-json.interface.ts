import { IPubSubModuleOptions } from "./pubsub-module.interfaces";

export interface IPubSub {
  events: {
    service: string;
    method: string;
    events: string[];
  }[];
  config?: IPubSubModuleOptions;
}
