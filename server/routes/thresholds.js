const express = require("express");
const router = express.Router();

// Lưu ngưỡng trên RAM
let thresholds = {
  upperThreshold: 60,
  lowerThreshold: 25,
};

// API lấy ngưỡng hiện tại
router.get("/", (req, res) => {
  res.json(thresholds);
});

// API cập nhật ngưỡng
router.post("/", (req, res) => {
  const { upperThreshold, lowerThreshold } = req.body;
  if (upperThreshold <= lowerThreshold) {
    return res.status(400).json({ success: false, message: "Ngưỡng trên phải lớn hơn ngưỡng dưới!" });
  }
  thresholds = { upperThreshold, lowerThreshold };
  res.json({ success: true, message: "Cập nhật thành công", thresholds });
});

module.exports = router;
