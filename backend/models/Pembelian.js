// //pembelian.js

// const mongoose = require("mongoose");

// const PembelianSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     paketId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Paket",
//       required: true,
//     },
//     childId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Child",
//       required: true,
//     },
//     tanggalPembelian: {
//       type: Date,
//       default: Date.now,
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Pembelian", PembelianSchema);

const mongoose = require("mongoose");

const PembelianSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    paketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Paket",
      required: true,
    },
    childId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Child",
      required: true,
    },
    tanggalPembelian: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    merchantOrderId: {
      type: String,
      required: true,
      unique: true,
    },
    reference: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pembelian", PembelianSchema);
