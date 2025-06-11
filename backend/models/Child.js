// //child.js

const mongoose = require("mongoose");

const childSchema = new mongoose.Schema({
  name: { type: String, required: true },
  birthDate: { type: Date, required: true },
  gender: { type: String, enum: ["Laki-laki", "Perempuan"], required: true },
  placeOfBirth: { type: String, default: "" },
  bloodType: { type: String, enum: ["A", "B", "AB", "O"], default: null },
  allergy: { type: String, default: "" },
  address: { type: String, default: "" },
  parentPhone: { type: String, default: "" },
  emergencyContact: { type: String, default: "" },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Child", childSchema);
