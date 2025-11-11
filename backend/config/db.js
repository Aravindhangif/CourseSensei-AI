//todo)) We will make connection with our database
// import mongoose which is Object Data Modelling library
const mongoose = require('mongoose');

//* we will write a function to connect to MongoDB Atlas
const connectDB = async () => {
  try {
    // will give the URI MongoDB connection string
    await mongoose.connect(process.env.MONGODB_URI); // mongodb community server on your laptop
    // await mongoose.connect('mongodb://127.0.0.1:27017'); // mongodb community server on your laptop
    console.log('✅ MongoDB connected successfully 🍃');
  } catch (error) {
    console.error('❌ MongoDB Connection Failed', error.message);
    // process.exit(1); // stops the server just in case DB connection fails
  }
};

module.exports = connectDB;
