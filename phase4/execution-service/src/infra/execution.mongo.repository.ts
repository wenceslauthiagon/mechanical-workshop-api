/**
 * MongoDB repository for ExecutionRecord.
 *
 * Interfaces below mirror the ExecutionRecord domain so this file compiles
 * without requiring a running MongoDB instance at build time.
 * Pass a real MongoClient (from 'mongodb') or a mock in tests.
 */

import { ExecutionRecord } from '../domain';

// ── MongoDB-shape interfaces ──
interface MongoDocument {
  _id?: string;
  orderId: string;
  status: string;
  notes: string[];
  startedAt?: string;
  completedAt?: string;
}

interface MongoCollection {
  insertOne(doc: MongoDocument): Promise<{ insertedId: string }>;
  findOne(filter: { _id?: string; orderId?: string }): Promise<MongoDocument | null>;
  updateOne(filter: { _id: string }, update: { $set?: Partial<MongoDocument>; $push?: { notes: string } }): Promise<unknown>;
}

interface ExecutionMongoClient {
  db(name?: string): {
    collection(name: string): MongoCollection;
  };
}

export class ExecutionMongoRepository {
  private readonly collection: MongoCollection;

  constructor(client: ExecutionMongoClient, dbName = 'execution_db') {
    this.collection = client.db(dbName).collection('executions');
  }

  async create(record: ExecutionRecord): Promise<ExecutionRecord> {
    await this.collection.insertOne({
      _id: record.id,
      orderId: record.orderId,
      status: record.status,
      notes: record.notes,
      startedAt: record.startedAt,
    });
    return record;
  }

  async findById(id: string): Promise<ExecutionRecord | undefined> {
    const doc = await this.collection.findOne({ _id: id });
    return doc ? this.toDomain(doc, id) : undefined;
  }

  async findByOrderId(orderId: string): Promise<ExecutionRecord | undefined> {
    const doc = await this.collection.findOne({ orderId });
    if (!doc?._id) {
      return undefined;
    }
    return this.toDomain(doc, doc._id);
  }

  async save(record: ExecutionRecord): Promise<void> {
    await this.collection.updateOne(
      { _id: record.id },
      {
        $set: {
          status: record.status,
          completedAt: record.completedAt,
        },
      },
    );
  }

  async addNote(id: string, note: string): Promise<void> {
    await this.collection.updateOne(
      { _id: id },
      { $push: { notes: note } },
    );
  }

  private toDomain(doc: MongoDocument, id: string): ExecutionRecord {
    return {
      id,
      orderId: doc.orderId,
      status: doc.status as ExecutionRecord['status'],
      notes: doc.notes ?? [],
      startedAt: doc.startedAt,
      completedAt: doc.completedAt,
    };
  }
}
