import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import axios from "axios";

const AddPaket = () => {
  const [paketData, setPaketData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "bulanan",
    startTime: "",
    endTime: "",
    gracePeriod: 5,
    lateFeeType: "statis",
    lateFeePerHour: "",
    maxLateFeePerDay: "",
    lateFeeRules: [],
  });

  const handleChange = (e) => {
    setPaketData({ ...paketData, [e.target.name]: e.target.value });
  };

  const handleLateFeeRuleChange = (index, field, value) => {
    const updatedRules = [...paketData.lateFeeRules];
    updatedRules[index][field] = Number(value); // Konversi ke number
    setPaketData({ ...paketData, lateFeeRules: updatedRules });
  };

  const addLateFeeRule = () => {
    setPaketData({
      ...paketData,
      lateFeeRules: [...paketData.lateFeeRules, { minutes: 0, fee: 0 }],
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const preparedData = {
      ...paketData,
      price: Number(paketData.price),
      gracePeriod: Number(paketData.gracePeriod),
      lateFeePerHour:
        paketData.lateFeeType === "statis"
          ? Number(paketData.lateFeePerHour)
          : undefined,
      maxLateFeePerDay:
        paketData.lateFeeType === "statis"
          ? Number(paketData.maxLateFeePerDay)
          : undefined,
      lateFeeRules:
        paketData.lateFeeType === "dinamis"
          ? paketData.lateFeeRules.map((rule) => ({
              minutes: Number(rule.minutes),
              fee: Number(rule.fee),
            }))
          : [],
    };

    console.log("Sebelum submit:", paketData);
    console.log("Data dikirim:", preparedData);

    axios

      .post(`${process.env.REACT_APP_API_URL}/api/admin/paket`, preparedData)
      .then((response) => {
        alert("Paket berhasil ditambahkan!");
      })
      .catch((err) => {
        alert("Gagal menambahkan paket");
        console.error(err);
      });
  };

  return (
    <div className="container mt-4">
      <h3>Tambahkan Paket</h3>
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
          <Form.Label>Jam Masuk</Form.Label>
          <Form.Control
            type="time"
            name="startTime"
            value={paketData.startTime}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Jam Pulang</Form.Label>
          <Form.Control
            type="time"
            name="endTime"
            value={paketData.endTime}
            onChange={handleChange}
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

        <Form.Group className="mb-3">
          <Form.Label>Jenis Denda</Form.Label>
          <Form.Select
            name="lateFeeType"
            value={paketData.lateFeeType}
            onChange={handleChange}
          >
            <option value="statis">Statis</option>
            <option value="dinamis">Dinamis</option>
          </Form.Select>
        </Form.Group>

        {paketData.lateFeeType === "statis" && (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Denda per Jam (Rp)</Form.Label>
              <Form.Control
                type="number"
                name="lateFeePerHour"
                value={paketData.lateFeePerHour}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Maksimal Denda per Hari (Rp)</Form.Label>
              <Form.Control
                type="number"
                name="maxLateFeePerDay"
                value={paketData.maxLateFeePerDay}
                onChange={handleChange}
              />
            </Form.Group>
          </>
        )}

        {paketData.lateFeeType === "dinamis" && (
          <>
            <Form.Label>Aturan Denda Dinamis</Form.Label>
            {paketData.lateFeeRules.map((rule, index) => (
              <div key={index} className="d-flex mb-2">
                <Form.Control
                  type="number"
                  placeholder="Menit"
                  value={rule.minutes}
                  onChange={(e) =>
                    handleLateFeeRuleChange(index, "minutes", e.target.value)
                  }
                />
                <Form.Control
                  type="number"
                  placeholder="Biaya (Rp)"
                  value={rule.fee}
                  onChange={(e) =>
                    handleLateFeeRuleChange(index, "fee", e.target.value)
                  }
                  className="ms-2"
                />
              </div>
            ))}
            <Button
              variant="secondary"
              className="mb-3"
              onClick={addLateFeeRule}
            >
              Tambah Aturan Denda
            </Button>
          </>
        )}

        <Button variant="primary" type="submit">
          Tambah Paket
        </Button>
      </Form>
    </div>
  );
};

export default AddPaket;
