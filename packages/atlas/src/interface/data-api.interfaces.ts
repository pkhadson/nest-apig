export type IProjection<T> = {
  [K in keyof T]?: 0 | 1;
};

export type ISort<T> = {
  [K in keyof T]?: 0 | 1;
};

export type IFindOneOpts<T> = {
  projection?: IProjection<T>;
};

export type IFindOpts<T> = {
  projection?: IProjection<T>;
  sort?: ISort<T>;
  limit?: number;
  skip?: number;
};

export interface IUpdateResult {
  matchedCount: number;
  modifiedCount: number;
}

export interface IDeleteResult {
  deletedCount: number;
}

export type IAction =
  | "findOne"
  | "find"
  | "insertOne"
  | "insertMany"
  | "updateOne"
  | "updateMany"
  | "deleteOne"
  | "deleteMany";
