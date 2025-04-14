const mongoose = require("mongoose")

const scheduleSchema = new mongoose.Schema({
  time: {
    type: String,
    required: true,
  },
  dates: {
    type: [Date], // Chọn ngày cụ thể thay vì thứ
    required: true,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
})

module.exports = mongoose.model("Schedule", scheduleSchema)
