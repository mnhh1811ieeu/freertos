require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./database");

const app = express();

// Kết nối MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/humidity", require("./routes/humidity"));
app.use("/api/thresholds", require("./routes/threshold")); // Thêm tuyến đường ngưỡng

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server đang chạy trên cổng ${PORT}`));
