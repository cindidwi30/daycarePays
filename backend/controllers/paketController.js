//paketcontroller

const Paket = require("../models/Paket"); // Import model Paket sekali saja

// Membuat paket baru
const createPaket = async (req, res) => {
  try {
    const paketData = req.body; // terima seluruh data paket dari request body
    const newPaket = new Paket(paketData); // langsung buat model dengan data lengkap
    await newPaket.save();
    res.status(201).json(newPaket);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating Paket", error: err.message });
  }
};

// Mendapatkan semua paket
// const getAllPakets = async (req, res) => {
//   try {
//     const pakets = await Paket.find(); // Ambil semua paket
//     res.status(200).json(pakets); // Kirim daftar paket
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: "Error fetching Pakets", error: err.message });
//   }
// };
// Mendapatkan semua paket, bisa difilter berdasarkan durasi (harian/bulanan)
const getAllPakets = async (req, res) => {
  try {
    const { duration } = req.query;

    let filter = {};
    if (duration) {
      filter.duration = duration; // hanya ambil paket dengan durasi tertentu
    }

    const pakets = await Paket.find(filter);
    res.status(200).json(pakets);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching Pakets", error: err.message });
  }
};

// Mendapatkan paket berdasarkan ID
const getPaketById = async (req, res) => {
  try {
    const paket = await Paket.findById(req.params.id);
    if (!paket) {
      return res.status(404).json({ message: "Paket tidak ditemukan" });
    }
    res.status(200).json(paket);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching Paket", error: err.message });
  }
};

// Memperbarui paket berdasarkan ID
const updatePaket = async (req, res) => {
  try {
    const updatedPaket = await Paket.findByIdAndUpdate(
      req.params.id,
      req.body, // update dengan data lengkap dari body
      { new: true }
    );
    if (!updatedPaket) {
      return res.status(404).json({ message: "Paket tidak ditemukan" });
    }
    res.status(200).json(updatedPaket);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating Paket", error: err.message });
  }
};

// Menghapus paket berdasarkan ID
const deletePaket = async (req, res) => {
  try {
    const deletedPaket = await Paket.findByIdAndDelete(req.params.id);
    if (!deletedPaket) {
      return res.status(404).json({ message: "Paket tidak ditemukan" });
    }
    res.status(200).json({ message: "Paket berhasil dihapus" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting Paket", error: err.message });
  }
};

// Menghitung total paket
const countPakets = async (req, res) => {
  try {
    const count = await Paket.countDocuments(); // Menghitung semua dokumen di koleksi Paket
    res.status(200).json({ count });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching Paket count", error: err.message });
  }
};

module.exports = {
  createPaket,
  getAllPakets,
  getPaketById,
  updatePaket,
  deletePaket,
  countPakets,
};
