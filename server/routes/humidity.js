const express = require("express");
const Humidity = require("../models/Humidity");

const router = express.Router();

// Lấy danh sách độ ẩm mới nhất
router.get("/", async (req, res) => {
  try {
    const data = await Humidity.find().sort({ timestamp: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Nhận dữ liệu từ ESP8266 và lưu vào MongoDB
router.post("/", async (req, res) => {
  try {
    const { value } = req.body;
    if (value === undefined) {
      return res.status(400).json({ message: "Thiếu giá trị độ ẩm" });
    }

    const newHumidity = new Humidity({ value });
    await newHumidity.save();
    res.status(201).json(newHumidity);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;
