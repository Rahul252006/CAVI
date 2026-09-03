import { MongoClient, Db } from 'mongodb';
import { config } from '../../config/index.js';

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

export async function getMongoClient(): Promise<MongoClient> {
  if (client) {
    return client;
  }

  if (!clientPromise) {
    const uri = config.mongoUri;
    client = new MongoClient(uri, {
      maxPoolSize: 20,
      serverSelectionTimeoutMS: 5000,
    });
    clientPromise = client.connect().then((c) => {
      console.log(`[MongoDB] Connected successfully to ${uri}`);
      return c;
    }).catch((err) => {
      console.error('[MongoDB] Connection failed:', err);
      clientPromise = null;
      throw err;
    });
  }

  return clientPromise;
}

export async function getMongoDb(): Promise<Db> {
  const mongoClient = await getMongoClient();
  return mongoClient.db();
}
