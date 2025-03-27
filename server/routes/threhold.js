const express = require("express");
const Threshold = require("../models/Threshold");

const router = express.Router();

// Lấy giá trị ngưỡng (low, high)
router.get("/", async (req, res) => {
  try {
    let threshold = await Threshold.findOne();
    if (!threshold) {
      threshold = new Threshold({ low: 25, high: 60 }); // Giá trị mặc định
      await threshold.save();
    }
    res.json(threshold);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Cập nhật ngưỡng (low, high)
router.put("/", async (req, res) => {
  try {
    const { low, high } = req.body;
    if (low === undefined || high === undefined) {
      return res.status(400).json({ message: "Thiếu dữ liệu ngưỡng" });
    }

    let threshold = await Threshold.findOne();
    if (!threshold) {
      threshold = new Threshold({ low, high });
    } else {
      threshold.low = low;
      threshold.high = high;
    }
    await threshold.save();
    res.json({ message: "✅ Ngưỡng đã cập nhật!", data: threshold });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;
