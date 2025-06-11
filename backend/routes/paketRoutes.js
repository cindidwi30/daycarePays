//paketRoutes.js

const express = require("express");
const router = express.Router();
const paketController = require("../controllers/paketController");

// Route untuk membuat paket baru
router.post("/", paketController.createPaket);

// Route untuk mendapatkan semua paket
router.get("/", paketController.getAllPakets);

// // Route untuk mendapatkan paket berdasarkan ID
// router.get("/:id", paketController.getPaketById);

// Route untuk memperbarui paket berdasarkan ID
router.put("/:id", paketController.updatePaket);

// Route untuk menghapus paket berdasarkan ID
router.delete("/:id", paketController.deletePaket);

// // Route untuk menghitung jumlah paket
// router.get("/count", paketController.countPakets);

// Route untuk menghitung jumlah paket
router.get("/count", paketController.countPakets);

// Route untuk mendapatkan paket berdasarkan ID
router.get("/:id", paketController.getPaketById);

module.exports = router;
