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

        return (
          hariIni.isBetween(tglBeli, tglAkhir, null, "[") ||
          hariIni.isSame(tglBeli)
        );
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
// router.post("/duitku-token", authenticateToken, async (req, res) => {
//   const { paketId, childId } = req.body;

//   if (!paketId || !childId)
//     return res.status(400).json({ error: "paketId & childId diperlukan." });

//   try {
//     const paket = await Paket.findById(paketId);
//     const user = await User.findById(req.user.id);
//     const anak = await Anak.findById(childId);

//     if (!paket || !user || !anak)
//       return res.status(404).json({ error: "Data tidak ditemukan." });

//     const merchantCode = "DS23357";
//     const merchantKey = "b8112db3b7b3018909665205141c1ae8";
//     const returnUrl =
//       process.env.DUITKU_RETURN_URL ||
//       "https://daycare-pays.vercel.app/dashboard";
//     const callbackUrl =
//       process.env.DUITKU_CALLBACK_URL ||
//       "https://daycarepays-backend.up.railway.app/api/pembelian/callback-duitku";

//     const paymentAmount = Math.round(Number(paket.price));
//     const merchantOrderId =
//       "INV-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
//     const productDetails = paket.name;

//     const signatureString =
//       merchantCode + merchantOrderId + paymentAmount + merchantKey;
//     const signature = crypto
//       .createHash("md5")
//       .update(signatureString)
//       .digest("hex");

//     const address = {
//       firstName: user.name || "FirstName",
//       lastName: "",
//       address: "Alamat belum diisi",
//       city: "Kota belum diisi",
//       postalCode: "00000",
//       phone: user.phone || "08123456789",
//       countryCode: "ID",
//     };

//     const payload = {
//       merchantCode,
//       paymentAmount,
//       paymentMethod: "SP",
//       merchantOrderId,
//       productDetails,
//       email: user.email,
//       phoneNumber: user.phone || "08123456789",
//       additionalParam: "",
//       merchantUserInfo: user.email,
//       customerVaName: anak.name || "Nama Anak",
//       returnUrl,
//       callbackUrl,
//       expiryPeriod: 60,
//       signature,
//       itemDetails: [
//         {
//           name: paket.name,
//           price: paymentAmount,
//           quantity: 1,
//         },
//       ],
//       customerDetail: {
//         firstName: user.name || "FirstName",
//         lastName: "",
//         email: user.email,
//         phoneNumber: user.phone || "08123456789",
//         billingAddress: address,
//         shippingAddress: address,
//       },
//     };

//     console.log("Payload ke Duitku:", JSON.stringify(payload, null, 2));

//     const resp = await axios.post(
//       "https://sandbox.duitku.com/webapi/api/merchant/v2/inquiry",
//       payload,
//       { headers: { "Content-Type": "application/json" } }
//     );

//     if (resp.status === 200 && resp.data.statusCode === "00") {
//       return res.json({
//         paymentUrl: resp.data.paymentUrl,
//         reference: resp.data.reference,
//         vaNumber: resp.data.vaNumber || null,
//       });
//     } else {
//       return res.status(500).json({
//         error: "Gagal generate Duitku payment URL.",
//         detail: resp.data,
//       });
//     }
//   } catch (err) {
//     console.error("Duitku error:", err?.response?.data || err.message);
//     return res.status(500).json({
//       error: "Gagal generate Duitku payment URL.",
//       detail: err?.response?.data || err.message,
//     });
//   }
// });

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
      process.env.DUITKU_RETURN_URL ||
      "https://daycare-pays.vercel.app/dashboard";
    const callbackUrl =
      process.env.DUITKU_CALLBACK_URL ||
      "https://daycarepays-backend.up.railway.app/api/pembelian/callback-duitku";

    const paymentAmount = Math.round(Number(paket.price));
    const merchantOrderId =
      "INV-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
    const productDetails = paket.name;

    const signatureString =
      merchantCode + merchantOrderId + paymentAmount + merchantKey;
    const signature = crypto
      .createHash("md5")
      .update(signatureString)
      .digest("hex");

    const address = {
      firstName: user.name || "FirstName",
      lastName: "",
      address: "Alamat belum diisi",
      city: "Kota belum diisi",
      postalCode: "00000",
      phone: user.phone || "08123456789",
      countryCode: "ID",
    };

    const payload = {
      merchantCode,
      paymentAmount,
      paymentMethod: "SP",
      merchantOrderId,
      productDetails,
      email: user.email,
      phoneNumber: user.phone || "08123456789",
      additionalParam: "",
      merchantUserInfo: user.email,
      customerVaName: anak.name || "Nama Anak",
      returnUrl,
      callbackUrl,
      expiryPeriod: 60,
      signature,
      itemDetails: [
        {
          name: paket.name,
          price: paymentAmount,
          quantity: 1,
        },
      ],
      customerDetail: {
        firstName: user.name || "FirstName",
        lastName: "",
        email: user.email,
        phoneNumber: user.phone || "08123456789",
        billingAddress: address,
        shippingAddress: address,
      },
    };

    const resp = await axios.post(
      "https://sandbox.duitku.com/webapi/api/merchant/v2/inquiry",
      payload,
      { headers: { "Content-Type": "application/json" } }
    );

    if (resp.status === 200 && resp.data.statusCode === "00") {
      // Simpan transaksi ke database
      const pembelian = new Pembelian({
        userId: req.user.id,
        paketId,
        childId,
        merchantOrderId,
        status: "pending",
      });
      await pembelian.save();

      return res.json({
        paymentUrl: resp.data.paymentUrl,
        reference: resp.data.reference,
        vaNumber: resp.data.vaNumber || null,
        merchantOrderId,
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
// router.post("/callback-duitku", async (req, res) => {
//   try {
//     const { merchantOrderId, reference, statusCode, signature } = req.body;

//     // Optional: verifikasi signature Duitku
//     const expectedSignature = crypto
//       .createHash("md5")
//       .update(merchantOrderId + reference + process.env.DUITKU_MERCHANT_KEY)
//       .digest("hex");

//     if (signature !== expectedSignature) {
//       console.warn("Signature tidak valid dari callback Duitku");
//       return res.sendStatus(400);
//     }

//     // Update status di database
//     const pembelian = await Pembelian.findOneAndUpdate(
//       { merchantOrderId },
//       { status: statusCode === "00" ? "paid" : "failed" },
//       { new: true }
//     );

//     if (!pembelian) {
//       console.warn("Pembelian tidak ditemukan:", merchantOrderId);
//       return res.sendStatus(404);
//     }

//     console.log("Pembayaran sukses untuk:", merchantOrderId);
//     res.sendStatus(200);
//   } catch (err) {
//     console.error("Callback Duitku error:", err);
//     res.sendStatus(500);
//   }
// });

router.post("/callback-duitku", async (req, res) => {
  try {
    const { merchantOrderId, reference, statusCode, signature } = req.body;

    const expectedSignature = crypto
      .createHash("md5")
      .update(merchantOrderId + reference + process.env.DUITKU_MERCHANT_KEY)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.warn("Signature tidak valid dari callback Duitku");
      return res.sendStatus(400);
    }

    const pembelian = await Pembelian.findOneAndUpdate(
      { merchantOrderId },
      { status: statusCode === "00" ? "paid" : "failed" },
      { new: true }
    );

    if (!pembelian) {
      console.warn("Pembelian tidak ditemukan:", merchantOrderId);
      return res.sendStatus(404);
    }

    console.log("Pembayaran sukses untuk:", merchantOrderId);
    res.sendStatus(200);
  } catch (err) {
    console.error("Callback Duitku error:", err);
    res.sendStatus(500);
  }
});

module.exports = router;
