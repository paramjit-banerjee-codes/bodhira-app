import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Use connection timeout and retries for Atlas stability
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority',
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected successfully');
    });

  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    console.error('');
    console.error('🔧 TROUBLESHOOTING STEPS:');
    console.error('1. Check your IP is whitelisted in MongoDB Atlas');
    console.error('2. Go to: https://cloud.mongodb.com → Security → Network Access');
    console.error('3. Add your current IP or 0.0.0.0/0 (allow all)');
    console.error('4. Verify MONGODB_URI in .env file is correct');
    console.error('5. Check internet connection');
    console.error('');
    
    // 🔧 DEV MODE: Don't exit, allow server to start without DB for testing
    console.error('⚠️  [DEV MODE] Server will continue WITHOUT database connection');
    console.error('⚠️  API calls requiring database will fail until connection is restored');
    console.error('');
    // process.exit(1); // Commented out for dev mode
  }
};

export default connectDB;
