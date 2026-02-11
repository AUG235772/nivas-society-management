const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // MONGO_URI function ke ANDAR access hona chahiye, bahar nahi
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;