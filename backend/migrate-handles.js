import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

// Generate unique handle from name (same as in authController)
const generateUniqueHandle = async (name) => {
  let baseHandle = name
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .substring(0, 15);

  if (!baseHandle) {
    baseHandle = 'user';
  }

  let randomNumber = Math.floor(1000 + Math.random() * 9000);
  let handle = `${baseHandle}_${randomNumber}`;

  let attempts = 0;
  while (await User.findOne({ handle }) && attempts < 10) {
    randomNumber = Math.floor(1000 + Math.random() * 9000);
    handle = `${baseHandle}_${randomNumber}`;
    attempts++;
  }

  if (attempts === 10) {
    const timestamp = Date.now().toString().slice(-4);
    handle = `${baseHandle}_${timestamp}`;
  }

  return handle;
};

const migrateHandles = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all users without handles
    const usersWithoutHandles = await User.find({ handle: { $exists: false } });
    console.log(`Found ${usersWithoutHandles.length} users without handles`);

    if (usersWithoutHandles.length === 0) {
      console.log('All users already have handles!');
      process.exit(0);
    }

    // Generate handles for each user
    let successCount = 0;
    for (const user of usersWithoutHandles) {
      const handle = await generateUniqueHandle(user.name);
      user.handle = handle;
      await user.save();
      console.log(`✓ Generated handle for ${user.name}: ${handle}`);
      successCount++;
    }

    console.log(`\n✅ Migration complete! Updated ${successCount} users with handles.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateHandles();
