// db.js
const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env file

const mongodbURI = process.env.MONGODB_URI;

const connectDB = async () => {
    try {
        await mongoose.connect(mongodbURI);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error(`Failed to connect: ${err}`);
    }
};
module.exports = { connectDB };
