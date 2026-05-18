import { MongoClient } from 'mongodb';

let client: MongoClient | undefined;

export async function connectMongo(): Promise<MongoClient> {
  if (client) {
    return client;
  }

  const mongoUrl = process.env.MONGODB_URL;
  if (!mongoUrl) {
    throw new Error('MONGODB_URL is required');
  }

  client = new MongoClient(mongoUrl);
  await client.connect();
  return client;
}