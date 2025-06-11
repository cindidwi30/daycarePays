// const express = require("express");
// const router = express.Router();
// const Pembelian = require("../models/Pembelian");
// const Child = require("../models/Child");
// const { isPaketActive } = require("../utils/paketHelper");

// // Endpoint untuk dapatkan anak dengan paket aktif
// router.get("/anak-aktif", async (req, res) => {
//   try {
//     // Ambil semua pembelian dengan populate paket dan anak
//     const pembelian = await Pembelian.find()
//       .populate("paketId")
//       .populate("childId");

//     // Filter hanya yang aktif
//     const pembelianAktif = pembelian.filter((p) => isPaketActive(p, p.paketId));

//     // Map ke anak (child) tanpa duplikat
//     const anakAktifMap = new Map();
//     pembelianAktif.forEach((p) => {
//       if (p.childId && !anakAktifMap.has(p.childId._id.toString())) {
//         anakAktifMap.set(p.childId._id.toString(), p.childId);
//       }
//     });

//     const anakAktif = Array.from(anakAktifMap.values());

//     res.json(anakAktif);
//   } catch (error) {
//     console.error("Error getting active children:", error);
//     res.status(500).json({ error: "Gagal mengambil data anak aktif." });
//   }
// });

// module.exports = router;

// routes/anak-aktif.js

const express = require("express");
const router = express.Router();
const Pembelian = require("../models/Pembelian");
const { isPaketActive } = require("../utils/paketHelper");

// Endpoint untuk dapatkan anak dengan paket aktif
router.get("/anak-aktif", async (req, res) => {
  try {
    const pembelian = await Pembelian.find()
      .populate("paketId")
      .populate("childId");

    const pembelianAktif = pembelian.filter((p) => isPaketActive(p, p.paketId));

    const anakDenganPaket = [];
    const anakIds = new Set();

    pembelianAktif.forEach((p) => {
      if (p.childId && !anakIds.has(p.childId._id.toString())) {
        anakIds.add(p.childId._id.toString());

        anakDenganPaket.push({
          _id: p.childId._id,
          name: p.childId.name,
          birthDate: p.childId.birthDate,
          paket: {
            _id: p.paketId._id,
            name: p.paketId.name,
          },
        });
      }
    });

    res.json(anakDenganPaket);
  } catch (error) {
    console.error("Error getting active children:", error);
    res.status(500).json({ error: "Gagal mengambil data anak aktif." });
  }
});

module.exports = router;
