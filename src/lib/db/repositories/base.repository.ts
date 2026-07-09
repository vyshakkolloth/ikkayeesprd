import { Collection, Document, Filter, OptionalUnlessRequiredId, WithId } from "mongodb";
import { getDb } from "../client";

export abstract class BaseRepository<T extends Document> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  protected async getCollection(): Promise<Collection<T>> {
    const db = await getDb();
    return db.collection<T>(this.collectionName);
  }

  async find(filter: Filter<T> = {}): Promise<WithId<T>[]> {
    const col = await this.getCollection();
    return col.find(filter).toArray();
  }

  async findOne(filter: Filter<T>): Promise<WithId<T> | null> {
    const col = await this.getCollection();
    return col.findOne(filter);
  }

  async insertOne(doc: OptionalUnlessRequiredId<T>): Promise<string> {
    const col = await this.getCollection();
    const result = await col.insertOne(doc);
    return result.insertedId.toString();
  }

  async updateOne(filter: Filter<T>, update: Partial<T>): Promise<boolean> {
    const col = await this.getCollection();
    const result = await col.updateOne(filter, { $set: update as any });
    return result.modifiedCount > 0;
  }

  async deleteOne(filter: Filter<T>): Promise<boolean> {
    const col = await this.getCollection();
    const result = await col.deleteOne(filter);
    return result.deletedCount > 0;
  }
}
