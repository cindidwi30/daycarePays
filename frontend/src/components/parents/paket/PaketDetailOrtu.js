import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Card, Button, Form } from "react-bootstrap";

const PaketDetailOrtu = () => {
  const { id } = useParams();
  const [paket, setPaket] = useState(null);
  const [error, setError] = useState(null);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState("");

  const token = localStorage.getItem("token");

  const handleSubscribe = async () => {
    if (!token) {
      alert("User belum login.");
      return;
    }

    if (!selectedChild) {
      alert("Pilih anak terlebih dahulu.");
      return;
    }

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/pembelian`,
        { paketId: paket._id, childId: selectedChild },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Berhasil membeli paket!");
    } catch (error) {
      console.error("Gagal membeli paket:", error);
      alert("Gagal membeli paket.");
    }
  };

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/admin/paket/${id}`)
      .then((response) => {
        setPaket(response.data);
      })
      .catch((err) => {
        setError("Gagal memuat detail paket.");
        console.error(err);
      });

    if (token) {
      axios
        .get(`${process.env.REACT_APP_API_URL}/api/anak`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          console.log("Children data:", res.data); // Debug data anak
          // Pastikan data yang diterima array, dan tiap objek ada _id dan name
          if (Array.isArray(res.data)) {
            setChildren(res.data);
          } else {
            console.error("Data anak bukan array:", res.data);
            setChildren([]);
          }
        })
        .catch((err) => {
          console.error("Gagal memuat anak:", err);
          setChildren([]);
        });
    }
  }, [id, token]);

  if (error) return <div className="container mt-4 text-danger">{error}</div>;
  if (!paket) return <div className="container mt-4">Memuat...</div>;

  return (
    <div className="container mt-4">
      <h3 className="fw-bold text-dark">Detail Paket</h3>
      <Card className="p-4 shadow-sm">
        <Card.Body>
          <Card.Title>{paket.name}</Card.Title>
          <Card.Text>
            <strong>Deskripsi:</strong> {paket.description || "Tidak tersedia"}
            <br />
            <strong>Harga:</strong> Rp{paket.price}
            <br />
            <strong>Durasi:</strong> {paket.duration}
            <br />
            <strong>Denda / Jam:</strong> Rp{paket.lateFeePerHour}
            <br />
            <strong>Batas Maks Denda:</strong> Rp{paket.maxLateFeePerDay}
            <br />
            <strong>Masa Tenggang:</strong> {paket.gracePeriod} menit
          </Card.Text>

          <Form.Group className="my-3">
            <Form.Label>Pilih Anak</Form.Label>
            <Form.Select
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
            >
              <option value="">-- Pilih Anak --</option>
              {children.length === 0 ? (
                <option disabled>Tidak ada anak</option>
              ) : (
                children.map((child) => (
                  <option key={child._id} value={child._id}>
                    {child.name}
                  </option>
                ))
              )}
            </Form.Select>
          </Form.Group>

          <div className="d-flex justify-content-between mt-3">
            <Link to="/dashboard/parent">
              <Button variant="secondary">Kembali</Button>
            </Link>
            <Button variant="success" onClick={handleSubscribe}>
              Beli Sekarang
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PaketDetailOrtu;
