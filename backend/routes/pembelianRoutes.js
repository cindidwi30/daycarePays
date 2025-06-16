// pembelianRoutes.js

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

        return hariIni.isBetween(tglBeli, tglAkhir, null, "[)");
      })
      .map((p) => ({
        childName: p.childId?.name,
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

// POST: Generate Duitku payment URL
// POST: Generate Duitku payment URL
router.post("/duitku-token", authenticateToken, async (req, res) => {
  const { paketId, childId } = req.body;

  if (!paketId || !childId)
    return res.status(400).json({ error: "paketId & childId diperlukan." });

  try {
    const paket = await Paket.findById(paketId);
    const user = await User.findById(req.user.id);
    const anak = await Anak.findById(childId);

    if (!paket || !user || !anak)
      return res.status(404).json({ error: "Data tidak ditemukan." });

    const merchantCode = "DS23357";
    const merchantKey = "b8112db3b7b3018909665205141c1ae8";
    const returnUrl =
      process.env.DUITKU_RETURN_URL?.trim() || "http://example.com/return";
    const callbackUrl =
      process.env.DUITKU_CALLBACK_URL?.trim() || "http://example.com/callback";

    const paymentAmount = Math.round(Number(paket.price));
    const merchantOrderId = "INV-" + Date.now();
    const productDetails = paket.name;

    // Signature MD5 sesuai dokumentasi Duitku: merchantCode + merchantOrderId + paymentAmount + merchantKey
    const signatureString =
      merchantCode + merchantOrderId + paymentAmount + merchantKey;
    const signature = crypto
      .createHash("md5")
      .update(signatureString)
      .digest("hex");

    // Detail alamat customer (optional, tapi bagus diisi)
    const address = {
      firstName: user.name || "FirstName",
      lastName: "", // Jika ada lastName bisa diisi
      address: "Alamat belum diisi",
      city: "Kota belum diisi",
      postalCode: "00000",
      phone: user.phone || "08123456789",
      countryCode: "ID",
    };

    // Detail customer
    const customerDetail = {
      firstName: user.name || "FirstName",
      lastName: "",
      email: user.email,
      phoneNumber: user.phone || "08123456789",
      billingAddress: address,
      shippingAddress: address,
    };

    // Contoh itemDetails, sesuaikan jika punya detail produk yang lebih akurat
    const itemDetails = [
      {
        name: paket.name,
        price: paymentAmount,
        quantity: 1,
      },
    ];

    // Payload lengkap sesuai dokumentasi Duitku
    const payload = {
      merchantCode,
      paymentAmount,
      merchantOrderId: orderId,
      productDetails,
      email: user.email || "tes@email.com",
      phoneNumber: user.phone || "081234567890",
      returnUrl,
      callbackUrl,
      signature,
      expiryPeriod: 60, // menit
      // jangan sertakan paymentMethod kalau ingin semua channel aktif muncul
    };

    const resp = await axios.post(
      "https://sandbox.duitku.com/webapi/api/merchant/v2/inquiry",
      payload,
      { headers: { "Content-Type": "application/json" } }
    );

    // Response sukses
    if (resp.status === 200 && resp.data.statusCode === "00") {
      return res.json({
        paymentUrl: resp.data.paymentUrl,
        reference: resp.data.reference,
        vaNumber: resp.data.vaNumber || null,
      });
    } else {
      return res.status(500).json({
        error: "Gagal generate Duitku payment URL.",
        detail: resp.data,
      });
    }
  } catch (err) {
    console.error("Duitku error:", err?.response?.data || err.message);
    return res.status(500).json({
      error: "Gagal generate Duitku payment URL.",
      detail: err?.response?.data || err.message,
    });
  }
});

// POST: Callback dari Duitku
router.post("/callback-duitku", async (req, res) => {
  console.log("Callback Duitku:", req.body);
  res.sendStatus(200);
});

module.exports = router;
