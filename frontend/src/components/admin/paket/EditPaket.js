import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const EditPaket = () => {
  const [paketData, setPaketData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "bulanan",
    lateFeePerMinute: 2000,
    maxLateFeePerDay: 50000,
    gracePeriod: 5,
  });

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/admin/paket/${id}`)
      .then((response) => {
        setPaketData(response.data);
      })
      .catch((err) => {
        console.error("Failed to fetch package", err);
      });
  }, [id]);

  const handleChange = (e) => {
    setPaketData({ ...paketData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    axios
      .put(`${process.env.REACT_APP_API_URL}/api/admin/paket/${id}`, paketData)
      .then((response) => {
        alert("Paket berhasil diperbarui!");
        navigate("/dashboard/admin/paket-list");
      })
      .catch((err) => {
        alert("Gagal memperbarui paket");
        console.error(err);
      });
  };

  return (
    <div className="container mt-4">
      <h3>Edit Paket</h3>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Nama Paket</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={paketData.name}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Deskripsi</Form.Label>
          <Form.Control
            as="textarea"
            name="description"
            value={paketData.description}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Harga</Form.Label>
          <Form.Control
            type="number"
            name="price"
            value={paketData.price}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Durasi</Form.Label>
          <Form.Select
            name="duration"
            value={paketData.duration}
            onChange={handleChange}
            required
          >
            <option value="bulanan">Bulanan</option>
            <option value="harian">Harian</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Tarif Denda per Menit (Rp)</Form.Label>
          <Form.Control
            type="number"
            name="lateFeePerMinute"
            value={paketData.lateFeePerMinute}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Batas Maks Denda per Hari (Rp)</Form.Label>
          <Form.Control
            type="number"
            name="maxLateFeePerDay"
            value={paketData.maxLateFeePerDay}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Masa Tenggang Keterlambatan (menit)</Form.Label>
          <Form.Control
            type="number"
            name="gracePeriod"
            value={paketData.gracePeriod}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Perbarui Paket
        </Button>
      </Form>
    </div>
  );
};

export default EditPaket;
