const express = require("express");
const Humidity = require("../models/Humidity");

const router = express.Router();

// GET: Lấy danh sách độ ẩm mới nhất
router.get("/", async (req, res) => {
  try {
    const data = await Humidity.find().sort({ timestamp: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// POST: Nhận dữ liệu từ ESP8266 và lưu vào MongoDB
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

// DELETE: Xóa tất cả dữ liệu độ ẩm trong ngày hôm qua
router.delete("/delete-yesterday", async (req, res) => {
  try {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    const startOfYesterday = new Date(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate()
    );

    const endOfYesterday = new Date(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate(),
      23, 59, 59, 999
    );

    const result = await Humidity.deleteMany({
      timestamp: {
        $gte: startOfYesterday,
        $lte: endOfYesterday
      }
    });

    res.json({
      message: "Đã xóa dữ liệu độ ẩm trong ngày hôm qua",
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa dữ liệu", error: error.message });
  }
});

module.exports = router;
