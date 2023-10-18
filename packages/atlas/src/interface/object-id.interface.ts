import { ObjectId as _ObjectId } from "mongodb";

export class ObjectId extends _ObjectId {
  constructor(input: any, private opts?: { bson?: boolean }) {
    super(input);
  }

  toJSON(): any {
    return this.opts?.bson ? { $oid: this.toHexString() } : this.toHexString();
  }
}
