import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!uri) {
  console.error('No MONGO_URI found in env');
  process.exit(1);
}

const ClassroomSchema = new mongoose.Schema({}, { strict: false, collection: 'classrooms' });
const Classroom = mongoose.model('Classroom', ClassroomSchema);

async function run() {
  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || undefined });
  const one = await Classroom.findOne().lean();
  console.log('Found classroom:', one?._id?.toString() || JSON.stringify(one));
  await mongoose.disconnect();
}

run().catch((e) => { console.error(e); process.exit(1); });
