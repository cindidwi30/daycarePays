import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const PaymentSuccess = () => {
  const location = useLocation();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const resultCode = query.get("resultCode");
    const orderId = query.get("merchantOrderId");
    const reference = query.get("reference");

    if (!resultCode) {
      setStatus("Gagal memproses hasil pembayaran.");
    } else if (resultCode === "00") {
      setStatus(
        `✅ Pembayaran berhasil! Order ID: ${orderId}, Referensi: ${reference}`
      );
    } else {
      setStatus(`❌ Pembayaran gagal. Kode: ${resultCode}`);
    }

    setLoading(false);
  }, [location.search]);

  if (loading)
    return <div className="container mt-5">Memproses hasil pembayaran...</div>;

  return (
    <div className="container mt-5">
      <h2>Hasil Pembayaran</h2>
      <div className="alert alert-info mt-3">{status}</div>
    </div>
  );
};

export default PaymentSuccess;
