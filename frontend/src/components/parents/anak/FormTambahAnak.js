import React, { useState, useEffect } from "react";
import axios from "axios";

const FormTambahAnak = ({ defaultValue, onEditSukses, onTambahSukses }) => {
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
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/admin/paket`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

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

  useEffect(() => {
    if (defaultValue) {
      setForm({
        name: defaultValue.name || "",
        birthDate: defaultValue.birthDate?.slice(0, 10) || "",
        gender: defaultValue.gender || "",
        placeOfBirth: defaultValue.placeOfBirth || "",
        bloodType: defaultValue.bloodType || "",
        allergy: defaultValue.allergy || "",
        address: defaultValue.address || "",
        parentPhone: defaultValue.parentPhone || "",
        emergencyContact: defaultValue.emergencyContact || "",
        paketId: "", // optional untuk edit
      });
    }
  }, [defaultValue]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const selectedPaket = paketList.find((paket) => paket._id === form.paketId);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.birthDate || !form.gender) {
      alert("Nama, tanggal lahir, dan gender wajib diisi.");
      return;
    }

    if (new Date(form.birthDate) > new Date()) {
      alert("Tanggal lahir tidak boleh di masa depan");
      return;
    }

    try {
      if (defaultValue) {
        // MODE EDIT
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/anak/${defaultValue._id}`,
          form,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        alert("Data anak berhasil diperbarui!");
        if (onEditSukses) onEditSukses();
      } else {
        // MODE TAMBAH
        const res = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/anak`,
          form,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const newChildId = res.data._id;

        // Beli paket jika dipilih
        if (form.paketId) {
          await axios.post(
            `${process.env.REACT_APP_API_URL}/api/pembelian`,
            {
              paketId: form.paketId,
              childId: newChildId,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
        }

        alert("Anak dan paket berhasil ditambahkan!");
        if (onTambahSukses) onTambahSukses();
      }

      // Reset form kalau mode tambah
      if (!defaultValue) {
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
      }

      setError(null);
    } catch (err) {
      console.error(err);
      alert(
        defaultValue
          ? "Gagal memperbarui data anak."
          : "Gagal menambahkan anak atau membeli paket."
      );
    }
  };

  const handleBayarMidtrans = async (e) => {
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
      const anakRes = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/anak`,
        form,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const newChildId = anakRes.data._id;

      const bayarRes = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/pembelian/midtrans-token`,
        {
          paketId: form.paketId,
          childId: newChildId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const snapToken = bayarRes.data.token;

      window.snap.pay(snapToken, {
        onSuccess: function (result) {
          alert("Pembayaran berhasil!");
          console.log("✅ SUCCESS:", result);
        },
        onPending: function (result) {
          alert("Menunggu pembayaran...");
          console.log("🕒 PENDING:", result);
        },
        onError: function (result) {
          alert("Terjadi kesalahan pembayaran.");
          console.error("❌ ERROR:", result);
        },
        onClose: function () {
          alert("Kamu menutup popup pembayaran.");
        },
      });
    } catch (err) {
      const detail = err?.response?.data?.detail || err.message;
      console.error("🔥 Gagal membuat pembayaran Midtrans:", detail);
      alert("Gagal membuat pembayaran Midtrans: " + detail);
    }
  };

  return (
    <div className="container mt-4">
      <h3>{defaultValue ? "Edit Profil Anak" : "Tambah Profil Anak"}</h3>
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Input Fields */}
        {[
          ["Nama Anak", "name", "text"],
          ["Tanggal Lahir", "birthDate", "date"],
          ["Tempat Lahir", "placeOfBirth", "text"],
          ["Alergi", "allergy", "text"],
          ["Alamat", "address", "textarea"],
          ["Nomor Telepon Orang Tua", "parentPhone", "text"],
          ["Kontak Darurat", "emergencyContact", "text"],
        ].map(([label, name, type]) => (
          <div className="mb-3" key={name}>
            <label>{label}</label>
            {type === "textarea" ? (
              <textarea
                name={name}
                value={form[name]}
                onChange={handleChange}
                className="form-control"
                rows={2}
              />
            ) : (
              <input
                type={type}
                name={name}
                value={form[name]}
                onChange={handleChange}
                className="form-control"
                required={["name", "birthDate"].includes(name)}
              />
            )}
          </div>
        ))}

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
          <label>Pilih Paket</label>
          {loading ? (
            <div className="form-text">Memuat daftar paket...</div>
          ) : (
            <select
              name="paketId"
              value={form.paketId}
              onChange={handleChange}
              className="form-control"
              required={!defaultValue}
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

        <button type="submit" className="btn btn-primary me-2">
          Simpan Data Anak
        </button>

        {!defaultValue && (
          <button
            type="button"
            onClick={handleBayarMidtrans}
            className="btn btn-success"
          >
            Bayar dan Daftarkan Anak
          </button>
        )}
      </form>
    </div>
  );
};

export default FormTambahAnak;
