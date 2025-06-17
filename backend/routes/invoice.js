const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const Pembelian = require("../models/Pembelian");

router.get("/invoice/:pembelianId", async (req, res) => {
  try {
    const pembelian = await Pembelian.findById(req.params.pembelianId)
      .populate("paketId")
      .populate("childId");

    if (!pembelian) return res.status(404).send("Pembelian tidak ditemukan");

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${pembelian._id}.pdf`
    );
    doc.pipe(res);

    // Judul Invoice
    doc.fontSize(20).text("INVOICE PEMBELIAN", { align: "center" });
    doc.moveDown();

    // Informasi Anak dan Pembelian
    doc.fontSize(12);
    doc.text(`Invoice ID: ${pembelian._id}`);
    doc.text(
      `Tanggal Pembelian: ${new Date(
        pembelian.tanggalPembelian
      ).toLocaleDateString("id-ID")}`
    );
    doc.moveDown(0.5);

    // Garis pemisah
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    // Kolom kiri (data anak)
    doc.font("Helvetica-Bold").text("Data Anak", { underline: true });
    doc.font("Helvetica").text(`Nama Anak: ${pembelian.childId?.name || "-"}`);
    doc.text(`Tempat Lahir: ${pembelian.childId?.placeOfBirth || "-"}`);
    doc.text(
      `Tanggal Lahir: ${
        pembelian.childId?.birthDate
          ? new Date(pembelian.childId.birthDate).toLocaleDateString("id-ID")
          : "-"
      }`
    );
    doc.text(`Jenis Kelamin: ${pembelian.childId?.gender || "-"}`);
    doc.moveDown();

    // Kolom kanan (paket)
    doc.font("Helvetica-Bold").text("Detail Paket", { underline: true });
    doc.font("Helvetica").text(`Nama Paket: ${pembelian.paketId?.name || "-"}`);
    doc.text(`Durasi: ${pembelian.paketId?.duration || "-"}`);
    doc.text(`Harga: Rp${pembelian.paketId?.price || "-"}`);
    doc.text(`Status: ${pembelian.status || "Sukses"}`);
    if (pembelian.paketId?.description)
      doc.text(`Deskripsi: ${pembelian.paketId.description}`);
    if (pembelian.paketId?.startTime && pembelian.paketId?.endTime)
      doc.text(
        `Jam Layanan: ${pembelian.paketId.startTime} - ${pembelian.paketId.endTime}`
      );

    // Info denda keterlambatan
    doc.moveDown(0.5);
    doc.font("Helvetica-Bold").text("Aturan Denda:", { underline: true });
    doc.font("Helvetica");
    if (pembelian.paketId?.lateFeeType === "dinamis") {
      doc.text("Jenis Denda: Dinamis");
      (pembelian.paketId?.lateFeeRules || []).forEach((rule) => {
        doc.text(`  > Terlambat ${rule.minutes} menit: Rp${rule.fee}`);
      });
    } else {
      doc.text("Jenis Denda: Statis");
      doc.text(
        `  > Denda per jam: Rp${pembelian.paketId?.lateFeePerHour || 0}`
      );
      doc.text(
        `  > Maksimum per hari: Rp${pembelian.paketId?.maxLateFeePerDay || 0}`
      );
    }

    // Footer
    doc.moveDown(1);
    doc.fontSize(10).text("Terima kasih atas pembelian Anda.", {
      align: "center",
    });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Gagal membuat invoice");
  }
});

module.exports = router;
