const express = require("express");
const router = express.Router();

let autoMode = true; // Lưu trạng thái vào RAM

// API lấy trạng thái chế độ tự động
router.get("/", (req, res) => {
    res.json({ mode: autoMode });
});

// API cập nhật chế độ tự động
router.post("/", (req, res) => {
    const { mode } = req.body;
    
    if (typeof mode !== "boolean") {
        return res.status(400).json({ message: "Giá trị không hợp lệ" });
    }

    autoMode = mode; // Cập nhật giá trị trong RAM

    res.json({ success: true, mode: autoMode });
});

module.exports = router;
