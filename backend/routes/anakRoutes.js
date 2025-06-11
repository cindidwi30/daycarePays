const express = require("express");
const router = express.Router();
const Child = require("../models/Child");
const authenticateToken = require("../middleware/authenticate");

// Tambah anak dengan data lengkap
router.post("/", authenticateToken, async (req, res) => {
  const {
    name,
    birthDate,
    gender,
    placeOfBirth,
    bloodType,
    allergy,
    address,
    parentPhone,
    emergencyContact,
  } = req.body;

  const userId = req.user.id;

  if (!name || !birthDate || !gender) {
    return res
      .status(400)
      .json({ error: "Nama, tanggal lahir dan gender wajib diisi." });
  }

  try {
    const newChild = new Child({
      name,
      birthDate,
      gender,
      placeOfBirth,
      bloodType,
      allergy,
      address,
      parentPhone,
      emergencyContact,
      parentId: userId,
    });

    await newChild.save();
    res.status(201).json(newChild);
  } catch (err) {
    console.error("Gagal menambahkan anak:", err);
    res.status(500).json({ error: "Gagal menambahkan anak." });
  }
});

// Ambil semua anak milik user
router.get("/", authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const children = await Child.find({ parentId: userId });
    res.json(children);
  } catch (err) {
    console.error("Gagal mengambil data anak:", err);
    res.status(500).json({ error: "Gagal mengambil data anak." });
  }
});

// Ambil semua anak (khusus admin)
router.get("/all", authenticateToken, async (req, res) => {
  // Cek apakah user adalah admin
  if (req.user.role !== "admin") {
    return res.status(403).json({
      error: "Akses ditolak. Hanya admin yang bisa melihat semua anak.",
    });
  }

  try {
    const children = await Child.find().populate("parentId", "name email"); // untuk lihat info orang tua juga
    res.json(children);
  } catch (err) {
    console.error("Gagal mengambil semua anak:", err);
    res.status(500).json({ error: "Gagal mengambil semua anak." });
  }
});

// Hapus anak berdasarkan ID (khusus admin)
router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ error: "Hanya admin yang bisa menghapus anak." });
  }

  try {
    const deletedChild = await Child.findByIdAndDelete(id);

    if (!deletedChild) {
      return res.status(404).json({ error: "Anak tidak ditemukan." });
    }

    res.json({ message: "Anak berhasil dihapus." });
  } catch (err) {
    console.error("Gagal menghapus anak:", err);
    res.status(500).json({ error: "Terjadi kesalahan saat menghapus anak." });
  }
});

module.exports = router;
