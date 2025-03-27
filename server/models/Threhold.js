const mongoose = require("mongoose");

const ThresholdSchema = new mongoose.Schema({
  low: { type: Number, required: true },
  high: { type: Number, required: true },
});

module.exports = mongoose.model("Threshold", ThresholdSchema);
