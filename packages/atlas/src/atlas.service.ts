import { Inject, Injectable } from "@nestjs/common";
import { IAtlasOptions } from "./interface/atlas-options.interface";
import { Filter, UpdateFilter } from "mongodb";
import {
  IAction,
  IDeleteResult,
  IFindOneOpts,
  IFindOpts,
  IUpdateResult,
} from "./interface/data-api.interfaces";

@Injectable()
export class AtlasService {
  constructor(
    @Inject("ATLAS_CONFIG")
    public options: IAtlasOptions
  ) {}

  async findOne<TModel>(
    filter: Filter<TModel>,
    options: IFindOneOpts<TModel> = {}
  ): Promise<TModel | undefined> {
    const collection = this.getCollection(filter);

    const { document } = await this.sendRequest("findOne", {
      collection,
      filter,
      ...options,
    });

    return document || undefined;
  }

  async find<TModel>(
    filter: Filter<TModel>,
    options: IFindOpts<TModel> = {}
  ): Promise<TModel[]> {
    const collection = this.getCollection(filter);

    const { documents } = await this.sendRequest("find", {
      collection,
      filter,
      ...options,
    });

    return documents;
  }

  async insertOne<TModel>(document: TModel): Promise<TModel & { _id: string }> {
    const collection = this.getCollection({} as Filter<TModel>);

    const { insertedId } = await this.sendRequest("insertOne", {
      collection,
      document,
    });

    return { ...document, _id: insertedId };
  }

  async insertMany<TModel>(
    documents: TModel[]
  ): Promise<(TModel & { _id: string })[]> {
    const collection = this.getCollection({} as Filter<TModel>);

    const { insertedIds } = await this.sendRequest("insertMany", {
      collection,
      documents,
    });

    return documents.map((document, index) => ({
      ...document,
      _id: insertedIds[index],
    }));
  }

  async updateOne<TModel>(
    filter: Filter<TModel>,
    update: UpdateFilter<TModel>
  ): Promise<IUpdateResult> {
    const collection = this.getCollection(filter);

    return await this.sendRequest("updateOne", {
      collection,
      filter,
      update,
    });
  }

  async updateMany<TModel>(
    filter: Filter<TModel>,
    update: UpdateFilter<TModel>
  ): Promise<IUpdateResult> {
    const collection = this.getCollection(filter);

    return await this.sendRequest("updateMany", {
      collection,
      filter,
      update,
    });
  }

  async deleteOne<TModel>(filter: Filter<TModel>): Promise<IDeleteResult> {
    const collection = this.getCollection(filter);

    return await this.sendRequest("deleteOne", {
      collection,
      filter,
    });
  }

  async deleteMany<TModel>(filter: Filter<TModel>): Promise<IDeleteResult> {
    const collection = this.getCollection(filter);

    return await this.sendRequest("deleteMany", {
      collection,
      filter,
    });
  }

  url(action: IAction) {
    return `https://${this.options.region}.data.mongodb-api.com/app/${this.options.appId}/endpoint/data/v1/action/${action}`;
  }

  async sendRequest(action: IAction, data: any) {
    const body = JSON.stringify({
      dataSource: this.options.dataSource,
      database: this.options.database,
      ...data,
    });

    const request = await fetch(this.url(action), {
      method: "POST",
      body,
      headers: {
        "api-key": this.options.apiKey,
        "Content-Type": "application/json",
      },
    });

    if (!request.ok) throw new Error(await request.text());

    return await request.json();
  }

  getCollection(filter: Filter<any>): string {
    const collection = Reflect.get(
      filter.constructor.constructor,
      "collection"
    );
    if (!collection) throw new Error("Collection not found");
    return collection;
  }
}
