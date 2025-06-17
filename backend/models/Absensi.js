const mongoose = require("mongoose");

const absensiSchema = new mongoose.Schema({
  childId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Child",
    required: true,
  },
  paketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Paket",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  hadirAt: Date,
  pulangAt: Date,
  lateDurationMinutes: Number,
  lateFee: Number,
  dendaSudahDibayar: {
    // tambahkan ini
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Absensi", absensiSchema);
