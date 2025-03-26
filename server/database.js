const mongoose = require('mongoose');
require('dotenv').config(); // Load biến môi trường từ file .env

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.CONNECTION_STRING, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ MongoDB Connected Successfully!");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
        process.exit(1); // Dừng server nếu không kết nối được
    }
};

module.exports = connectDB;
