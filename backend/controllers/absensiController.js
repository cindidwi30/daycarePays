const Absensi = require("../models/Absensi");
const Pembelian = require("../models/Pembelian");
const { hitungDenda } = require("../utils/hitungDenda");

exports.hadir = async (req, res) => {
  const { childId } = req.body;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const pembelian = await Pembelian.findOne({ childId }).populate("paketId");
    if (!pembelian)
      return res.status(404).json({ error: "Paket tidak ditemukan" });

    let absensi = await Absensi.findOne({ childId, date: today });
    if (absensi) return res.status(400).json({ error: "Sudah absen hari ini" });

    absensi = new Absensi({
      childId,
      paketId: pembelian.paketId._id,
      date: today,
      hadirAt: new Date(),
    });

    await absensi.save();
    res.json({ message: "Absensi hadir berhasil", absensi });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal menyimpan absensi" });
  }
};

exports.pulang = async (req, res) => {
  const { childId, pulangAt: pulangAtStr } = req.body;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    let absensi = await Absensi.findOne({ childId, date: today }).populate(
      "paketId"
    );
    if (!absensi)
      return res.status(404).json({ error: "Belum absen masuk hari ini" });

    if (absensi.pulangAt)
      return res.status(400).json({ error: "Sudah pulang" });

    const pulangAt = pulangAtStr ? new Date(pulangAtStr) : new Date();

    const { lateMinutes, fee } = hitungDenda(absensi.paketId, pulangAt);

    absensi.pulangAt = pulangAt;
    absensi.lateDurationMinutes = lateMinutes;
    absensi.lateFee = fee;

    await absensi.save();
    res.json({ message: "Absensi pulang berhasil", absensi });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal menyimpan absensi pulang" });
  }
};

// exports.getAllAbsensi = async (req, res) => {
//   try {
//     const absensi = await Absensi.find()
//       .populate("childId") // tambahkan ini untuk menampilkan data anak
//       .sort({ date: -1 }); // urutkan dari yang terbaru

//     res.json(absensi);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Gagal mengambil data absensi" });
//   }
// };

exports.getAllAbsensi = async (req, res) => {
  try {
    const absensi = await Absensi.find()
      .populate("childId")
      .populate("paketId") // <-- penting agar semua field absensi lengkap
      .sort({ date: -1 });

    res.json(absensi);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil data absensi" });
  }
};

exports.bayarDenda = async (req, res) => {
  const { absensiId } = req.body;

  try {
    const absensi = await Absensi.findById(absensiId);
    if (!absensi) {
      return res.status(404).json({ error: "Absensi tidak ditemukan" });
    }

    if (!absensi.lateFee || absensi.lateFee === 0) {
      return res
        .status(400)
        .json({ error: "Tidak ada denda yang harus dibayar" });
    }

    if (absensi.dendaSudahDibayar) {
      return res.status(400).json({ error: "Denda sudah dibayar sebelumnya" });
    }

    absensi.dendaSudahDibayar = true; // tandai denda sudah dibayar
    await absensi.save();

    res.json({ message: "Pembayaran denda berhasil", absensi });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal memproses pembayaran denda" });
  }
};
