import { getMongoDb } from '../lib/mongodb/client';
import {
  mongoGetCompanies,
  mongoSaveCompany,
  mongoGetCompanyBySupportPhone,
} from '../lib/mongodb/models';

async function testMongo() {
  console.log('Connecting to MongoDB...');
  const db = await getMongoDb();
  console.log('Connected to MongoDB database:', db.databaseName);

  const collections = await db.listCollections().toArray();
  console.log('Existing collections:', collections.map(c => c.name));

  const count = await db.collection('companies').countDocuments();
  console.log('Total companies in MongoDB:', count);

  const companies = await mongoGetCompanies();
  console.log('Companies list:', companies);

  console.log('MongoDB connection and models test PASSED successfully!');
  process.exit(0);
}

testMongo().catch((err) => {
  console.error('MongoDB test FAILED:', err);
  process.exit(1);
});
