import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '..', '.env');
console.log('Loading env from:', envPath);
dotenv.config({ path: envPath });

(async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in .env file');
    }
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Drop the username_1 index if it exists
    try {
      await mongoose.connection.collection('classrooms').dropIndex('username_1');
      console.log('✅ Dropped username_1 index from classrooms');
    } catch (err) {
      if (err.message.includes('index not found')) {
        console.log('ℹ️  Index username_1 does not exist (safe to ignore)');
      } else {
        throw err;
      }
    }

    // Also drop any other problematic indexes
    const indexes = await mongoose.connection.collection('classrooms').getIndexes();
    console.log('Current indexes on classrooms:', Object.keys(indexes));

    await mongoose.connection.close();
    console.log('✅ Done');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
