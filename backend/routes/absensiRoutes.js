//absensiRoutes.js

const express = require("express");
const router = express.Router();
const absensiController = require("../controllers/absensiController");

router.get("/", absensiController.getAllAbsensi);

router.post("/hadir", absensiController.hadir);
router.post("/pulang", absensiController.pulang);
router.post("/bayar-denda", absensiController.bayarDenda);

module.exports = router;
