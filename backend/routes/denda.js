const express = require("express");
const router = express.Router();
const midtransClient = require("midtrans-client");
const jwt = require("jsonwebtoken");
const Absensi = require("../models/Absensi");
const User = require("../models/User");

// Middleware verifikasi token
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "User belum login." });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token tidak valid." });
    req.user = user;
    next();
  });
}

// ======== ROUTE: Buat Token Midtrans untuk Denda =========
router.post("/midtrans-token-denda", authenticateToken, async (req, res) => {
  const { absensiId } = req.body;

  if (!absensiId) {
    return res.status(400).json({ error: "absensiId diperlukan." });
  }

  try {
    const absensi = await Absensi.findById(absensiId).populate("childId");
    const user = await User.findById(req.user.id);

    if (!absensi || !user) {
      return res.status(404).json({ error: "Data tidak ditemukan." });
    }

    if (absensi.dendaSudahDibayar) {
      return res.status(400).json({ error: "Denda sudah dibayar." });
    }

    if (!absensi.lateFee || absensi.lateFee <= 0) {
      return res.status(400).json({ error: "Denda tidak valid." });
    }

    const merchantOrderId =
      "DENDA-" + Date.now() + "-" + Math.floor(Math.random() * 10000);

    absensi.midtransOrderId = merchantOrderId;
    await absensi.save();

    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY,
    });

    const parameter = {
      transaction_details: {
        order_id: merchantOrderId,
        gross_amount: Math.round(absensi.lateFee),
      },
      customer_details: {
        first_name: user.name,
        email: user.email,
        phone: user.phone || "08123456789",
      },
      item_details: [
        {
          id: absensi._id.toString(),
          name: `Denda keterlambatan - ${absensi.childId.name}`,
          quantity: 1,
          price: Math.round(absensi.lateFee),
        },
      ],
    };

    const snapResponse = await snap.createTransaction(parameter);

    res.json({
      token: snapResponse.token,
      redirect_url: snapResponse.redirect_url,
    });
  } catch (err) {
    console.error("❌ Midtrans error (denda):", err.message);
    res.status(500).json({ error: "Gagal membuat transaksi denda." });
  }
});

// ======== ROUTE: Callback Midtrans untuk Denda =========
router.post("/callback-midtrans-denda", async (req, res) => {
  try {
    const { order_id, transaction_status } = req.body;

    if (!order_id || !transaction_status) {
      return res.status(400).json({ error: "Data callback tidak lengkap." });
    }

    const isPaid =
      transaction_status === "settlement" || transaction_status === "capture";

    const absensi = await Absensi.findOneAndUpdate(
      { midtransOrderId: order_id },
      { dendaSudahDibayar: isPaid },
      { new: true }
    );

    if (!absensi) {
      console.warn("❗ Absensi tidak ditemukan untuk:", order_id);
      return res.sendStatus(404);
    }

    console.log(
      `✅ Callback Midtrans Denda sukses. Status: ${transaction_status} untuk order: ${order_id}`
    );
    res.sendStatus(200);
  } catch (err) {
    console.error("🔥 Callback Midtrans Denda error:", err.message);
    res.sendStatus(500);
  }
});

module.exports = router;
