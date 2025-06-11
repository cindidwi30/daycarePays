import React, { useState, useEffect } from "react";
import axios from "axios";

const FormTambahAnak = () => {
  const [form, setForm] = useState({
    name: "",
    birthDate: "",
    gender: "",
    placeOfBirth: "",
    bloodType: "",
    allergy: "",
    address: "",
    parentPhone: "",
    emergencyContact: "",
    paketId: "",
  });

  const [paketList, setPaketList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchPakets = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/paket", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (Array.isArray(res.data)) {
          setPaketList(res.data);
          setError(null);
        } else {
          setPaketList([]);
          setError("Data paket tidak valid");
        }
      } catch (err) {
        setError("Gagal mengambil data paket");
        setPaketList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPakets();
  }, [token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const selectedPaket = paketList.find((paket) => paket._id === form.paketId);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.birthDate || !form.gender || !form.paketId) {
      alert("Nama, tanggal lahir, gender, dan paket wajib diisi.");
      return;
    }

    if (new Date(form.birthDate) > new Date()) {
      alert("Tanggal lahir tidak boleh di masa depan");
      return;
    }

    try {
      // Tambah anak
      const res = await axios.post(
        "http://localhost:5000/api/anak",
        {
          name: form.name,
          birthDate: form.birthDate,
          gender: form.gender,
          placeOfBirth: form.placeOfBirth,
          bloodType: form.bloodType,
          allergy: form.allergy,
          address: form.address,
          parentPhone: form.parentPhone,
          emergencyContact: form.emergencyContact,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newChildId = res.data._id;

      // Beli paket untuk anak
      await axios.post(
        "http://localhost:5000/api/pembelian",
        {
          paketId: form.paketId,
          childId: newChildId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Anak dan paket berhasil ditambahkan!");
      setForm({
        name: "",
        birthDate: "",
        gender: "",
        placeOfBirth: "",
        bloodType: "",
        allergy: "",
        address: "",
        parentPhone: "",
        emergencyContact: "",
        paketId: "",
      });
      setError(null);
    } catch (err) {
      console.error(err);
      alert("Gagal menambahkan anak atau membeli paket.");
    }
  };

  return (
    <div className="container mt-4">
      <h3>Tambah Profil Anak</h3>
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Nama Anak</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="mb-3">
          <label>Tanggal Lahir</label>
          <input
            type="date"
            name="birthDate"
            value={form.birthDate}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="mb-3">
          <label>Jenis Kelamin</label>
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="form-control"
            required
          >
            <option value="">-- Pilih Jenis Kelamin --</option>
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
        </div>

        <div className="mb-3">
          <label>Tempat Lahir</label>
          <input
            type="text"
            name="placeOfBirth"
            value={form.placeOfBirth}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <div className="mb-3">
          <label>Golongan Darah</label>
          <select
            name="bloodType"
            value={form.bloodType}
            onChange={handleChange}
            className="form-control"
          >
            <option value="">-- Pilih Golongan Darah --</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="AB">AB</option>
            <option value="O">O</option>
          </select>
        </div>

        <div className="mb-3">
          <label>Alergi</label>
          <input
            type="text"
            name="allergy"
            value={form.allergy}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <div className="mb-3">
          <label>Alamat</label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            className="form-control"
            rows={2}
          />
        </div>

        <div className="mb-3">
          <label>Nomor Telepon Orang Tua</label>
          <input
            type="text"
            name="parentPhone"
            value={form.parentPhone}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <div className="mb-3">
          <label>Kontak Darurat</label>
          <input
            type="text"
            name="emergencyContact"
            value={form.emergencyContact}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <div className="mb-3">
          <label>Pilih Paket</label>
          {loading ? (
            <div className="form-text">Memuat daftar paket...</div>
          ) : (
            <select
              name="paketId"
              value={form.paketId}
              onChange={handleChange}
              className="form-control"
              required
            >
              <option value="">-- Pilih Paket --</option>
              {paketList.length === 0 ? (
                <option disabled>Tidak ada paket tersedia</option>
              ) : (
                paketList.map((paket) => (
                  <option key={paket._id} value={paket._id}>
                    {paket.name} - {paket.duration} - Rp{paket.price}
                  </option>
                ))
              )}
            </select>
          )}
          {selectedPaket && (
            <div className="mt-2 alert alert-info">
              <strong>Deskripsi Paket:</strong>
              <p>{selectedPaket.description || "Tidak ada deskripsi paket."}</p>
            </div>
          )}
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          Simpan
        </button>
      </form>
    </div>
  );
};

export default FormTambahAnak;
