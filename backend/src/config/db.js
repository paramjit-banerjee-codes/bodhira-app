import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Direct, modern connection (no deprecated options)
    const conn = await mongoose.connect(process.env.MONGODB_URI);

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
    console.error('💡 Check if your IP is whitelisted in MongoDB Atlas.');
    process.exit(1);
  }
};

export default connectDB;
