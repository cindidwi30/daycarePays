const Biodata = require("../models/Biodata");

// Menambahkan biodata baru
const createBiodata = async (req, res) => {
  try {
    const newBiodata = new Biodata(req.body);
    await newBiodata.save();
    res.status(201).json(newBiodata);
  } catch (err) {
    res.status(500).json({ message: "Gagal menambahkan biodata", error: err });
  }
};

// Mengambil semua biodata
const getAllBiodata = async (req, res) => {
  try {
    const biodata = await Biodata.find();
    res.status(200).json(biodata);
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil biodata", error: err });
  }
};

// Mengambil biodata berdasarkan ID
const getBiodataById = async (req, res) => {
  try {
    const biodata = await Biodata.findById(req.params.id);
    if (!biodata) {
      return res.status(404).json({ message: "Biodata tidak ditemukan" });
    }
    res.status(200).json(biodata);
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil biodata", error: err });
  }
};

// Memperbarui biodata

const updateBiodata = async (req, res) => {
  try {
    const biodataId = req.params.id;

    // Ensure data is coming from the request body
    if (!req.body) {
      return res
        .status(400)
        .json({ message: "Data tidak ditemukan dalam request." });
    }

    // Update the biodata in the database
    const updatedBiodata = await Biodata.findByIdAndUpdate(
      biodataId,
      req.body,
      { new: true }
    );

    if (!updatedBiodata) {
      return res.status(404).json({ message: "Biodata tidak ditemukan." });
    }

    res.status(200).json(updatedBiodata);
  } catch (err) {
    console.error(err); // Log error for debugging
    res
      .status(500)
      .json({ message: "Gagal memperbarui biodata.", error: err.message });
  }
};

// Menghapus biodata
const deleteBiodata = async (req, res) => {
  try {
    const deletedBiodata = await Biodata.findByIdAndDelete(req.params.id);
    if (!deletedBiodata) {
      return res.status(404).json({ message: "Biodata tidak ditemukan" });
    }
    res.status(200).json({ message: "Biodata berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ message: "Gagal menghapus biodata", error: err });
  }
};

module.exports = {
  createBiodata,
  getAllBiodata,
  getBiodataById,
  updateBiodata,
  deleteBiodata,
};
