// paket.js

const mongoose = require("mongoose");

const LateFeeRuleSchema = new mongoose.Schema({
  minutes: Number,
  fee: Number,
});

const PaketSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  duration: { type: String, enum: ["harian", "bulanan"] },
  startTime: String, // Format: "08:00"
  endTime: String, // Format: "15:00"
  gracePeriod: Number, // dalam menit

  lateFeeType: { type: String, enum: ["statis", "dinamis"], default: "statis" },
  lateFeePerHour: Number,
  maxLateFeePerDay: Number,

  lateFeeRules: [LateFeeRuleSchema], // untuk dinamis
});

module.exports = mongoose.model("Paket", PaketSchema);
