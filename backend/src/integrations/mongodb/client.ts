import { MongoClient, Db } from 'mongodb';
import { config } from '../../config/index.js';

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;
let mongoFailedRecently = false;
let lastFailureTime = 0;

export async function getMongoClient(): Promise<MongoClient> {
  if (client) {
    return client;
  }

  if (mongoFailedRecently && Date.now() - lastFailureTime < 30000) {
    throw new Error('MongoDB currently unavailable (using in-memory fallback)');
  }

  if (!clientPromise) {
    const uri = config.mongoUri;
    const mongoInstance = new MongoClient(uri, {
      maxPoolSize: 20,
      serverSelectionTimeoutMS: 1000,
    });
    clientPromise = mongoInstance.connect().then((c) => {
      console.log(`[MongoDB] Connected successfully to ${uri}`);
      client = c;
      mongoFailedRecently = false;
      return c;
    }).catch((err) => {
      mongoFailedRecently = true;
      lastFailureTime = Date.now();
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
