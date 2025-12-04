import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import analyticsController from '../src/controllers/analyticsController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!uri) {
  console.error('No MONGO_URI found in env');
  process.exit(1);
}

async function run() {
  await mongoose.connect(uri);

  const req = { params: { id: process.argv[2] } };
  const res = {
    status(code) {
      this._status = code; return this;
    },
    json(obj) {
      console.log('Response status:', this._status || 200);
      console.log(JSON.stringify(obj, null, 2));
    }
  };

  await analyticsController.overview(req, res, () => {});
  await mongoose.disconnect();
}

const id = process.argv[2] || '';
if (!id) {
  console.error('Usage: node testOverview.js <classroomId>');
  process.exit(1);
}

run().catch((e) => { console.error(e); process.exit(1); });
