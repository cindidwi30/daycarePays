function isPaketActive(pembelian, paket) {
  if (!pembelian.tanggalPembelian || !paket?.duration) return false;

  const tglBeli = new Date(pembelian.tanggalPembelian);
  const tglSekarang = new Date();

  let tglAkhir = new Date(tglBeli);
  if (paket.duration === "harian") {
    tglAkhir.setDate(tglAkhir.getDate() + 1);
  } else if (paket.duration === "bulanan") {
    tglAkhir.setMonth(tglAkhir.getMonth() + 1);
  }

  return tglSekarang <= tglAkhir;
}

module.exports = { isPaketActive };
