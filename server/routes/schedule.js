const express = require("express")
const router = express.Router()
const Schedule = require("../models/Schedule")

// ✅ Lấy tất cả lịch tưới
router.get("/", async (req, res) => {
  try {
    const schedules = await Schedule.find()
    res.json(schedules)
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy lịch tưới", error })
  }
})

// ✅ Tạo lịch tưới mới
router.post("/", async (req, res) => {
  const { time, dates, enabled } = req.body
  try {
    const newSchedule = new Schedule({ time, dates, enabled })
    await newSchedule.save()
    res.json({ success: true, schedule: newSchedule })
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi tạo lịch tưới", error })
  }
})

// ✅ Xóa một lịch tưới
router.delete("/:id", async (req, res) => {
  try {
    await Schedule.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xoá lịch tưới", error })
  }
})

module.exports = router
