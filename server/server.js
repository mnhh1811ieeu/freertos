const express = require("express");
const cors = require("cors");
const connectDB = require("./database");

const app = express();

// Kết nối MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cors());
const thresholdRoutes = require("./routes/thresholds");
app.use("/api/thresholds", thresholdRoutes);
// Routes
app.use("/api/humidity", require("./routes/humidity"));
app.use("/api/mode", require("./routes/mode"));
app.use("/api/pump", require("./routes/pump")); 

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server đang chạy trên cổng ${PORT}`));
