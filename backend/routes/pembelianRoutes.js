// pembelianRoutes.js

const express = require("express");
const router = express.Router();
const Pembelian = require("../models/Pembelian");
const { isPaketActive } = require("../utils/paketHelper");
const jwt = require("jsonwebtoken");
const Paket = require("../models/Paket");
const User = require("../models/User");
const Anak = require("../models/Child"); // atau sesuaikan jika file-nya bernama "Anak.js"

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

// ✅ POST: Membuat pembelian baru
router.post("/", authenticateToken, async (req, res) => {
  const { paketId, childId } = req.body;
  const userId = req.user.id;

  if (!childId) {
    return res.status(400).json({ error: "ChildId wajib disertakan." });
  }

  try {
    const pembelian = new Pembelian({
      userId,
      paketId,
      childId,
    });
    await pembelian.save();
    res.status(201).json(pembelian);
  } catch (err) {
    console.error("Gagal menyimpan pembelian:", err);
    res.status(500).json({ error: "Gagal mencatat pembelian." });
  }
});

// ✅ GET: Ambil riwayat pembelian + status aktif
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

const moment = require("moment"); // npm install moment

// GET: Jadwal daycare anak aktif hari ini untuk parent tertentu
router.get("/jadwal-hari-ini/:userId", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const hariIni = moment().startOf("day");

    const pembelian = await Pembelian.find({ userId })
      .populate("paketId")
      .populate("childId");

    // Filter paket yang masih aktif hari ini
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

// ✅ GET: Admin - semua pembelian, bisa difilter by userId (parent)
router.get("/admin/all", authenticateToken, async (req, res) => {
  const { userId } = req.query;

  try {
    const filter = userId ? { userId } : {};

    const pembelian = await Pembelian.find(filter)
      .populate("paketId")
      .populate("childId")
      .populate("userId", "name email"); // untuk menampilkan nama/email orang tua

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

// POST: Generate Snap Token Midtrans
// const midtransClient = require("midtrans-client");

// router.post("/midtrans-token", authenticateToken, async (req, res) => {
//   const { paketId, childId } = req.body;
//   const userId = req.user.id;

//   if (!paketId || !childId) {
//     return res.status(400).json({ error: "PaketId dan ChildId wajib." });
//   }

//   try {
//     const { name: paketName, price } = await Paket.findById(paketId);
//     const user = await User.findById(userId); // Assuming User model available
//     const anak = await Anak.findById(childId);

//     if (!paketName || !price || !user || !anak) {
//       return res.status(404).json({ error: "Data tidak ditemukan." });
//     }

//     const snap = new midtransClient.Snap({
//       isProduction: false,
//       serverKey: process.env.MIDTRANS_SERVER_KEY,
//     });

//     const parameter = {
//       transaction_details: {
//         order_id: `ORDER-${Date.now()}`,
//         gross_amount: price,
//       },
//       customer_details: {
//         first_name: user.name,
//         email: user.email,
//         phone: anak.parentPhone || "081234567890",
//       },
//     };

//     const snapResponse = await snap.createTransaction(parameter);
//     res.json({ token: snapResponse.token });
//   } catch (err) {
//     console.error("Midtrans Snap Token error:", err);
//     res.status(500).json({ error: "Gagal membuat token Midtrans." });
//   }
// });

// POST: Generate Snap Token Midtrans
const midtransClient = require("midtrans-client");

router.post("/midtrans-token", authenticateToken, async (req, res) => {
  const { paketId, childId } = req.body;
  const userId = req.user.id;

  if (!paketId || !childId) {
    return res.status(400).json({ error: "PaketId dan ChildId wajib." });
  }

  try {
    const paket = await Paket.findById(paketId);
    const user = await User.findById(userId);
    const anak = await Anak.findById(childId);

    if (!paket || !user || !anak) {
      return res
        .status(404)
        .json({ error: "Data paket, user, atau anak tidak ditemukan." });
    }

    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
    });

    const parameter = {
      transaction_details: {
        order_id: `ORDER-${Date.now()}`,
        gross_amount: paket.price,
      },
      customer_details: {
        first_name: user.name,
        email: user.email,
        phone: anak.parentPhone || "081234567890",
      },
    };

    const snapResponse = await snap.createTransaction(parameter);
    res.json({ token: snapResponse.token });
  } catch (err) {
    console.error("Midtrans Snap Token error:", err);
    res.status(500).json({ error: "Gagal membuat token Midtrans." });
  }
});

module.exports = router;
