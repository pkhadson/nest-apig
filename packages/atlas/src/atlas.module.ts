import { DynamicModule, Module } from "@nestjs/common";
import { AtlasService } from "./atlas.service";
import { IAtlasOptions } from "./interface/atlas-options.interface";

@Module({})
export class AtlasModule {
  public static forRoot(options: IAtlasOptions): DynamicModule {
    Reflect.set(globalThis, "nest-cdk:atlas-options", options);
    return {
      module: AtlasModule,
      providers: [
        {
          provide: "ATLAS_CONFIG",
          useValue: options,
        },
        AtlasService,
      ],
      exports: [AtlasService],
    };
  }
}
