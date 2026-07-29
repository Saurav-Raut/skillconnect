const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skillconnect');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.log('Running with localized mock/fallback behaviors enabled for testing.');
    // We don't exit process so server can still run and use mock logic if user doesn't have mongo active.
  }
};

module.exports = connectDB;
