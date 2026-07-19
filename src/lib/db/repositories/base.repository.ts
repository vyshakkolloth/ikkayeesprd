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

  protected async runWithRetry<R>(operation: (col: Collection<T>) => Promise<R>, retries = 2, delay = 1000): Promise<R> {
    let lastError: any;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const col = await this.getCollection();
        return await operation(col);
      } catch (err) {
        lastError = err;
        console.error(`Database operation on "${this.collectionName}" (Attempt ${attempt}/${retries}) failed:`, err);
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
    throw lastError || new Error(`Database operation on "${this.collectionName}" failed after all retries`);
  }

  async find(filter: Filter<T> = {}): Promise<WithId<T>[]> {
    try {
      return await this.runWithRetry((col) => col.find(filter).toArray());
    } catch (err) {
      console.error(`Failed to execute find on "${this.collectionName}" after retries. Returning empty array.`, err);
      return [];
    }
  }

  async findOne(filter: Filter<T>): Promise<WithId<T> | null> {
    try {
      return await this.runWithRetry((col) => col.findOne(filter));
    } catch (err) {
      console.error(`Failed to execute findOne on "${this.collectionName}" after retries. Returning null.`, err);
      return null;
    }
  }

  async insertOne(doc: OptionalUnlessRequiredId<T>): Promise<string> {
    return this.runWithRetry(async (col) => {
      const result = await col.insertOne(doc);
      return result.insertedId.toString();
    });
  }

  async updateOne(filter: Filter<T>, update: Partial<T>): Promise<boolean> {
    return this.runWithRetry(async (col) => {
      const result = await col.updateOne(filter, { $set: update as any });
      return result.modifiedCount > 0 || result.matchedCount > 0;
    });
  }

  async deleteOne(filter: Filter<T>): Promise<boolean> {
    return this.runWithRetry(async (col) => {
      const result = await col.deleteOne(filter);
      return result.deletedCount > 0;
    });
  }
}

