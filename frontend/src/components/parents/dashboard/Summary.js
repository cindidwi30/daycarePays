//
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

const Summary = () => {
  const [paketList, setPaketList] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/admin/paket`)
      .then((response) => {
        setPaketList(response.data);
      })
      .catch((err) => {
        setError("Gagal memuat daftar paket.");
        console.error(err);
      });
  }, []);

  return (
    <div className="container mt-4">
      <h3 className="fw-bold mb-4 text-dark">Paket Layanan Kami</h3>
      {error && <p className="text-danger">{error}</p>}
      <div className="row g-4">
        {paketList.length === 0 ? (
          <p>Tidak ada paket tersedia saat ini.</p>
        ) : (
          paketList.map((paket) => (
            <div key={paket._id} className="col-md-6 col-lg-4">
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <Card.Title>{paket.name}</Card.Title>
                  <Card.Text>{paket.description}</Card.Text>
                  <Card.Text>
                    <strong>Harga:</strong> Rp{paket.price}
                    <br />
                    <strong>Durasi:</strong> {paket.duration}
                    <br />
                    <strong>Denda / Menit:</strong> Rp{paket.lateFeePerMinute}
                    <br />
                    <strong>Batas Maks Denda:</strong> Rp
                    {paket.maxLateFeePerDay}
                    <br />
                    <strong>Masa Tenggang:</strong> {paket.gracePeriod} menit
                  </Card.Text>
                  <div className="d-flex justify-content-between mt-3">
                    <Link to={`paket/${paket._id}`}>
                      <Button variant="info" size="sm">
                        Lihat Detail
                      </Button>
                    </Link>
                    <Link to={`/paket/${paket._id}/beli`}>
                      <Button variant="success" size="sm">
                        Beli
                      </Button>
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Summary;
