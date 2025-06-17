const express = require("express");
const router = express.Router();
const Pembelian = require("../models/Pembelian");
const { isPaketActive } = require("../utils/paketHelper");
const jwt = require("jsonwebtoken");
const Paket = require("../models/Paket");
const User = require("../models/User");
const Anak = require("../models/Child");
const axios = require("axios");
const crypto = require("crypto");
const moment = require("moment");
const midtransClient = require("midtrans-client");

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

// POST: Buat pembelian
router.post("/", authenticateToken, async (req, res) => {
  const { paketId, childId } = req.body;
  const userId = req.user.id;

  if (!childId)
    return res.status(400).json({ error: "ChildId wajib disertakan." });

  try {
    const pembelian = new Pembelian({ userId, paketId, childId });
    await pembelian.save();
    res.status(201).json(pembelian);
  } catch (err) {
    console.error("Gagal menyimpan pembelian:", err);
    res.status(500).json({ error: "Gagal mencatat pembelian." });
  }
});

// GET: Riwayat pembelian user
router.get("/user/:userId", authenticateToken, async (req, res) => {
  try {
    const pembelian = await Pembelian.find({ userId: req.params.userId })
      .populate("paketId")
      .populate("childId");

    const denganStatus = pembelian.map((p) => ({
      ...p.toObject(),
      isActive: isPaketActive(p, p.paketId),
    }));

    res.json(denganStatus);
  } catch (err) {
    console.error("Error fetching pembelian:", err);
    res.status(500).json({ error: "Gagal mengambil riwayat pembelian" });
  }
});

// GET: Jadwal hari ini
router.get("/jadwal-hari-ini/:userId", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const hariIni = moment().startOf("day");

    const pembelian = await Pembelian.find({ userId })
      .populate("paketId")
      .populate("childId");

    const jadwalHariIni = pembelian
      .filter((p) => {
        if (!p.paketId || !p.tanggalPembelian) return false;
        const durasi = p.paketId.duration;
        const tglBeli = moment(p.tanggalPembelian).startOf("day");

        let tglAkhir;
        if (durasi === "harian") {
          tglAkhir = tglBeli.clone().add(1, "days");
        } else if (durasi === "bulanan") {
          tglAkhir = tglBeli.clone().add(1, "months");
        } else {
          return false;
        }

        return (
          hariIni.isBetween(tglBeli, tglAkhir, null, "[") ||
          hariIni.isSame(tglBeli)
        );
      })
      .map((p) => ({
        childName: p.childId?.name,
        childId: p.childId?._id, // ✅ Tambahkan ID anak untuk pencocokan
        paketName: p.paketId?.name,
        startTime: p.paketId?.startTime,
        endTime: p.paketId?.endTime,
      }));

    res.json(jadwalHariIni);
  } catch (error) {
    console.error("Error get jadwal hari ini:", error);
    res.status(500).json({ error: "Gagal mengambil jadwal hari ini." });
  }
});

// GET: Admin - semua pembelian
router.get("/admin/all", authenticateToken, async (req, res) => {
  const { userId } = req.query;

  try {
    const filter = userId ? { userId } : {};

    const pembelian = await Pembelian.find(filter)
      .populate("paketId")
      .populate("childId")
      .populate("userId", "name email");

    const hasil = pembelian.map((p) => ({
      _id: p._id,
      parentName: p.userId?.name,
      parentEmail: p.userId?.email,
      childName: p.childId?.name,
      paketName: p.paketId?.name,
      tanggalPembelian: p.tanggalPembelian,
    }));

    res.json(hasil);
  } catch (err) {
    console.error("Admin fetch error:", err);
    res.status(500).json({ error: "Gagal mengambil data pembelian (admin)" });
  }
});

router.post("/midtrans-token", authenticateToken, async (req, res) => {
  const { paketId, childId } = req.body;

  if (!paketId || !childId)
    return res.status(400).json({ error: "paketId & childId diperlukan." });

  try {
    const paket = await Paket.findById(paketId);
    const user = await User.findById(req.user.id);
    const anak = await Anak.findById(childId);

    if (!paket || !user || !anak)
      return res.status(404).json({ error: "Data tidak ditemukan." });

    const merchantOrderId =
      "INV-" + Date.now() + "-" + Math.floor(Math.random() * 10000);

    // Buat transaksi di database
    const pembelian = new Pembelian({
      userId: req.user.id,
      paketId,
      childId,
      merchantOrderId,
      status: "pending",
    });
    await pembelian.save();

    // Midtrans Snap Config
    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY,
    });

    const parameter = {
      transaction_details: {
        order_id: merchantOrderId,
        gross_amount: Math.round(paket.price),
      },
      customer_details: {
        first_name: user.name,
        email: user.email,
        phone: user.phone || "08123456789",
      },
      item_details: [
        {
          id: paket._id.toString(),
          name: paket.name,
          quantity: 1,
          price: Math.round(paket.price),
        },
      ],
    };

    const snapResponse = await snap.createTransaction(parameter);
    res.json({
      token: snapResponse.token,
      redirect_url: snapResponse.redirect_url,
    });
  } catch (err) {
    console.error("❌ Midtrans error:", err.message);
    res.status(500).json({ error: "Gagal membuat transaksi Midtrans." });
  }
});
router.post("/callback-midtrans", async (req, res) => {
  try {
    const { order_id, transaction_status } = req.body;

    if (!order_id || !transaction_status) {
      return res.status(400).json({ error: "Data callback tidak lengkap." });
    }

    let status;
    if (
      transaction_status === "settlement" ||
      transaction_status === "capture"
    ) {
      status = "paid";
    } else if (["deny", "cancel", "expire"].includes(transaction_status)) {
      status = "failed";
    } else {
      status = "pending";
    }

    const pembelian = await Pembelian.findOneAndUpdate(
      { merchantOrderId: order_id },
      { status },
      { new: true }
    );

    if (!pembelian) {
      console.warn("❗ Pembelian tidak ditemukan untuk:", order_id);
      return res.sendStatus(404);
    }

    console.log(
      `✅ Callback Midtrans sukses. Status: ${status} untuk order: ${order_id}`
    );
    res.sendStatus(200);
  } catch (err) {
    console.error("🔥 Callback Midtrans error:", err.message);
    res.sendStatus(500);
  }
});

module.exports = router;
