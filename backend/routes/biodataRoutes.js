const express = require("express");
const router = express.Router();
const biodataController = require("../controllers/biodataController");

// Endpoint untuk membuat biodata baru
router.post("/biodata", biodataController.createBiodata);

// Endpoint untuk mendapatkan semua biodata
router.get("/biodata", biodataController.getAllBiodata);

// Endpoint untuk mendapatkan biodata berdasarkan ID
router.get("/biodata/:id", biodataController.getBiodataById);

// Endpoint untuk memperbarui biodata
router.put("/biodata/:id", biodataController.updateBiodata);

// Endpoint untuk menghapus biodata
router.delete("/biodata/:id", biodataController.deleteBiodata);

module.exports = router;
