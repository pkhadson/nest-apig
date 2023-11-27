import { DynamicModule, Module } from "@nestjs/common";
import { IPubSubModuleOptions } from "./interface/pubsub-module.interfaces";
import MetadataStorage from "./metadata.storage";
import { PubSubService } from "./pubsub.service";

@Module({})
export class PubSubModule {
  public static forRoot(options: IPubSubModuleOptions): DynamicModule {
    MetadataStorage.addConfig(options);
    return {
      module: PubSubModule,
      providers: [
        {
          provide: "PUBSUB_CONFIG",
          useValue: options,
        },
        PubSubService,
      ],
      exports: [PubSubService],
    };
  }
}
