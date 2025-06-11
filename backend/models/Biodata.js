const mongoose = require("mongoose");

const biodataSchema = new mongoose.Schema(
  {
    childName: {
      type: String,
      required: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Laki-laki", "Perempuan"],
      required: true,
    },
    parentName: {
      type: String,
      required: true,
    },
    parentPhone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    healthCondition: {
      type: String,
    },
    allergies: {
      type: String,
    },
    daycarePackage: {
      type: String,
      enum: ["bulanan", "harian"],
      default: "bulanan",
    },
    additionalNotes: {
      type: String,
    },
  },
  { timestamps: true }
);

const Biodata = mongoose.model("Biodata", biodataSchema);

module.exports = Biodata;
