const express = require("express")
const router = express.Router()
const Schedule = require("../models/Schedule")

// ✅ Lấy tất cả lịch tưới
// router.get("/", async (req, res) => {
//   try {
//     const schedules = await Schedule.find()
//     res.json(schedules)
//   } catch (error) {
//     res.status(500).json({ message: "Lỗi khi lấy lịch tưới", error })
//   }
// })
router.get("/", async (req, res) => {
  try {
    const schedules = await Schedule.find()
    const now = new Date()

    // Duyệt qua từng lịch và loại bỏ các ngày đã qua
    for (const schedule of schedules) {
      const filteredDates = schedule.dates.filter((date) => {
        const [hour, minute] = schedule.time.split(":").map(Number)
        const scheduledDate = new Date(date)
        scheduledDate.setHours(hour, minute, 0, 0)
        return scheduledDate > now // Giữ lại nếu lịch còn trong tương lai
      })

      if (filteredDates.length === 0) {
        // Nếu không còn ngày nào hợp lệ thì xóa toàn bộ lịch
        await Schedule.findByIdAndDelete(schedule._id)
      } else if (filteredDates.length !== schedule.dates.length) {
        // Cập nhật nếu có thay đổi
        schedule.dates = filteredDates
        await schedule.save()
      }
    }

    // Trả về danh sách lịch còn hiệu lực
    const validSchedules = await Schedule.find()
    res.json(validSchedules)
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy và lọc lịch tưới", error })
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
