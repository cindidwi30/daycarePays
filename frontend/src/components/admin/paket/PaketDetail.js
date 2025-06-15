import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, Button } from "react-bootstrap";

const PaketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paket, setPaket] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/admin/paket/${id}`)
      .then((response) => {
        setPaket(response.data);
      })
      .catch((err) => {
        setError("Gagal mengambil detail paket");
        console.error(err);
      });
  }, [id]);

  const handleDelete = () => {
    if (window.confirm("Apakah kamu yakin ingin menghapus paket ini?")) {
      axios
        .delete(`${process.env.REACT_APP_API_URL}/api/admin/paket/${id}`)
        .then(() => {
          alert("Paket berhasil dihapus");
          navigate("/dashboard/admin/paket-list"); // Kembali ke list setelah hapus
        })
        .catch((err) => {
          alert("Gagal menghapus paket");
          console.error(err);
        });
    }
  };

  if (error) return <div className="container mt-4 text-danger">{error}</div>;
  if (!paket) return <div className="container mt-4">Memuat...</div>;

  return (
    <div className="container mt-4">
      <h3>Detail Paket</h3>
      <Card className="p-4">
        <p>
          <strong>Nama Paket:</strong> {paket.name}
        </p>
        <p>
          <strong>Deskripsi:</strong> {paket.description}
        </p>
        <p>
          <strong>Harga:</strong> Rp{paket.price}
        </p>
        <p>
          <strong>Durasi:</strong> {paket.duration}
        </p>

        {/* Tambahkan pengecekan apakah statis atau dinamis */}
        {paket.lateFeeType === "statis" ? (
          <>
            <p>
              <strong>Jenis Denda:</strong> Statis
            </p>
            <p>
              <strong>Denda per Jam:</strong> Rp{paket.lateFeePerHour}
            </p>
            <p>
              <strong>Batas Maks Denda / Hari:</strong> Rp
              {paket.maxLateFeePerDay}
            </p>
          </>
        ) : (
          <>
            <p>
              <strong>Jenis Denda:</strong> Dinamis
            </p>
            <p>
              <strong>Aturan Denda:</strong>
            </p>
            <ul>
              {paket.lateFeeRules?.map((rule, index) => (
                <li key={index}>
                  {rule.minutes} menit = Rp{rule.fee}
                </li>
              ))}
            </ul>
          </>
        )}

        <p>
          <strong>Jam Mulai:</strong> {paket.startTime}
        </p>
        <p>
          <strong>Jam Selesai:</strong> {paket.endTime}
        </p>
        <p>
          <strong>Masa Tenggang:</strong> {paket.gracePeriod} menit
        </p>

        <div className="d-flex gap-2 mt-3">
          <Link to="/dashboard/admin/paket-list">
            <Button variant="secondary">Kembali</Button>
          </Link>
          <Button variant="danger" onClick={handleDelete}>
            Hapus Paket
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PaketDetail;
