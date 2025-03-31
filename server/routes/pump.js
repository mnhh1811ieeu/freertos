const express = require("express");
const router = express.Router();

let pumpStatus = false; // Trạng thái máy bơm (chỉ lưu trong RAM)

// 🟢 API lấy trạng thái máy bơm
router.get("/", (req, res) => {
    res.status(200).json({ pumpStatus });
});

// 🔴 API bật/tắt máy bơm (chỉ khi manual mode)
router.post("/", (req, res) => {
    const { status, autoMode } = req.body;

    if (typeof status !== "boolean") {
        return res.status(400).json({ success: false, message: "Giá trị không hợp lệ" });
    }

    if (autoMode) {
        return res.status(400).json({ success: false, message: "Không thể điều khiển máy bơm ở chế độ tự động" });
    }

    pumpStatus = status;
    res.status(200).json({ success: true, pumpStatus });
});

module.exports = router;
