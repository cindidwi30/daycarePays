import React, { useState } from "react";
import { Form, Button, Card } from "react-bootstrap";
import axios from "axios";

const Biodata = () => {
  // Menyimpan state untuk biodata, dimulai dengan nilai kosong
  const [biodata, setBiodata] = useState({
    childName: "",
    dob: "",
    gender: "",
    parentName: "",
    parentPhone: "",
    address: "",
    healthCondition: "",
    allergies: "",
    daycarePackage: "bulanan", // default pilihan paket bulanan
    additionalNotes: "",
  });
  const [editMode, setEditMode] = useState(false); // Menyimpan status edit mode
  const [isLoading, setIsLoading] = useState(false); // Status loading saat menyimpan data
  const [error, setError] = useState(null); // Error jika ada kesalahan

  // Menangani perubahan input pada form
  const handleChange = (e) => {
    setBiodata({ ...biodata, [e.target.name]: e.target.value });
  };

  // Menangani submit form (menyimpan data yang sudah diperbarui)
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    const biodataId = "1234567890"; // Replace this with the actual ID from your form

    axios
      .put(`http://localhost:5000/api/user/biodata/${biodataId}`, biodata)
      .then((response) => {
        setIsLoading(false);
        alert("Biodata berhasil diperbarui!");
      })
      .catch((err) => {
        setIsLoading(false);
        alert("Gagal memperbarui biodata");
        console.error(err.response?.data || err); // Improved error handling with more details
      });
  };

  return (
    <div className="container mt-4">
      <h3 className="fw-bold mb-4 text-dark">Biodata Anak Daycare</h3>

      <Card className="shadow-sm">
        <Card.Body>
          {!editMode ? (
            // Menampilkan data biodata yang sudah diisi
            <>
              <p>
                <strong>Nama Anak:</strong> {biodata.childName || "__________"}
              </p>
              <p>
                <strong>Tanggal Lahir:</strong> {biodata.dob || "__________"}
              </p>
              <p>
                <strong>Jenis Kelamin:</strong> {biodata.gender || "__________"}
              </p>
              <p>
                <strong>Nama Orang Tua:</strong>{" "}
                {biodata.parentName || "__________"}
              </p>
              <p>
                <strong>No HP Orang Tua:</strong>{" "}
                {biodata.parentPhone || "__________"}
              </p>
              <p>
                <strong>Alamat:</strong> {biodata.address || "__________"}
              </p>
              <p>
                <strong>Kondisi Kesehatan:</strong>{" "}
                {biodata.healthCondition || "__________"}
              </p>
              <p>
                <strong>Alergi/Pembatasan Khusus:</strong>{" "}
                {biodata.allergies || "__________"}
              </p>
              <p>
                <strong>Paket Penitipan:</strong>{" "}
                {biodata.daycarePackage === "bulanan" ? "Bulanan" : "Harian"}
              </p>
              <p>
                <strong>Catatan Tambahan:</strong>{" "}
                {biodata.additionalNotes || "__________"}
              </p>
              <Button variant="primary" onClick={() => setEditMode(true)}>
                Edit Biodata
              </Button>
            </>
          ) : (
            // Form untuk mengedit biodata
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Nama Anak</Form.Label>
                <Form.Control
                  type="text"
                  name="childName"
                  value={biodata.childName}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Tanggal Lahir</Form.Label>
                <Form.Control
                  type="date"
                  name="dob"
                  value={biodata.dob}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Jenis Kelamin</Form.Label>
                <Form.Select
                  name="gender"
                  value={biodata.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Pilih Jenis Kelamin</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Nama Orang Tua</Form.Label>
                <Form.Control
                  type="text"
                  name="parentName"
                  value={biodata.parentName}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>No HP Orang Tua</Form.Label>
                <Form.Control
                  type="text"
                  name="parentPhone"
                  value={biodata.parentPhone}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Alamat</Form.Label>
                <Form.Control
                  as="textarea"
                  name="address"
                  value={biodata.address}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Kondisi Kesehatan</Form.Label>
                <Form.Control
                  type="text"
                  name="healthCondition"
                  value={biodata.healthCondition}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Alergi/Pembatasan Khusus</Form.Label>
                <Form.Control
                  type="text"
                  name="allergies"
                  value={biodata.allergies}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Paket Penitipan</Form.Label>
                <Form.Select
                  name="daycarePackage"
                  value={biodata.daycarePackage}
                  onChange={handleChange}
                  required
                >
                  <option value="bulanan">Bulanan</option>
                  <option value="harian">Harian</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Catatan Tambahan</Form.Label>
                <Form.Control
                  as="textarea"
                  name="additionalNotes"
                  value={biodata.additionalNotes}
                  onChange={handleChange}
                />
              </Form.Group>

              <div className="d-flex gap-2">
                <Button variant="success" type="submit" disabled={isLoading}>
                  {isLoading ? "Menyimpan..." : "Simpan"}
                </Button>
                <Button variant="secondary" onClick={() => setEditMode(false)}>
                  Batal
                </Button>
              </div>
            </Form>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default Biodata;
