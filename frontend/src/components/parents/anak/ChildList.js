//parents/anak/childlist

import React, { useState, useEffect } from "react";
import axios from "axios";
import FormTambahAnak from "./FormTambahAnak"; // sesuaikan path

const DaftarAnakDenganForm = () => {
  const [anakList, setAnakList] = useState([]);
  const [loadingAnak, setLoadingAnak] = useState(true);
  const [errorAnak, setErrorAnak] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [paketList, setPaketList] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [selectedPaketId, setSelectedPaketId] = useState("");

  const token = localStorage.getItem("token");
  const fetchPaketList = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admin/paket`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPaketList(res.data);
    } catch (err) {
      console.error("Gagal fetch paket:", err);
    }
  };

  const fetchData = async () => {
    setLoadingAnak(true);
    try {
      // 1. Fetch data anak
      const resAnak = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/anak`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const anakData = Array.isArray(resAnak.data) ? resAnak.data : [];

      // 2. Fetch riwayat pembelian orang tua (paket yang aktif)
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      const userId = decodedToken.id;
      const resPembelian = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/pembelian/user/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const riwayatPembelian = Array.isArray(resPembelian.data)
        ? resPembelian.data
        : [];

      // 3. Mapping paket aktif per anak
      const paketAktifPerAnak = {};
      riwayatPembelian.forEach((pembelian) => {
        if (pembelian.isActive && pembelian.childId?._id) {
          paketAktifPerAnak[pembelian.childId._id] = {
            paket: pembelian.paketId,
            status: pembelian.isActive ? "Aktif" : "Kadaluarsa",
          };
        }
      });

      // 4. Gabungkan data anak dengan paket aktif
      const anakWithPaket = anakData.map((anak) => ({
        ...anak,
        paketAktif: paketAktifPerAnak[anak._id] || null,
      }));

      setAnakList(anakWithPaket);
      setErrorAnak(null);
    } catch (err) {
      setAnakList([]);
      setErrorAnak("Gagal mengambil data anak atau pembelian.");
    } finally {
      setLoadingAnak(false);
    }
  };

  // useEffect(() => {
  //   if (token) {
  //     fetchData();
  //     fetchPaketList(); // tambahkan ini
  //   } else {
  //     setErrorAnak("Token tidak ditemukan, silakan login.");
  //     setLoadingAnak(false);
  //   }
  // }, []);

  useEffect(() => {
    if (token) {
      fetchData();
      fetchPaketList();
    } else {
      setErrorAnak("Token tidak ditemukan, silakan login.");
      setLoadingAnak(false);
    }
  }, []); // ✅ kosong = hanya sekali jalan

  const onTambahSukses = () => {
    fetchData();
    setShowForm(false);
  };

  // const handlePembelianBaru = async () => {
  //   if (!selectedChild || !selectedPaketId) return;

  //   try {
  //     await axios.post(
  //       `${process.env.REACT_APP_API_URL}/api/pembelian`,
  //       { childId: selectedChild._id, paketId: selectedPaketId },
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );
  //     alert("Pembelian berhasil!");
  //     setSelectedChild(null);
  //     setSelectedPaketId("");
  //     fetchData();
  //   } catch (err) {
  //     console.error("Gagal melakukan pembelian:", err);
  //     alert("Gagal melakukan pembelian.");
  //   }
  // };
  // const handlePembelianBaru = async () => {
  //   if (!selectedChild || !selectedPaketId) return;

  //   try {
  //     const res = await axios.post(
  //       "http://localhost:5000/api/pembelian/midtrans-token",
  //       {
  //         childId: selectedChild._id,
  //         paketId: selectedPaketId,
  //       },
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //       }
  //     );

  //     const { token: snapToken } = res.data;

  //     window.snap.pay(snapToken, {
  //       onSuccess: async function (result) {
  //         console.log("Payment success:", result);
  //         alert("Pembayaran berhasil!");
  //         setSelectedChild(null);
  //         setSelectedPaketId("");
  //         fetchData(); // Refresh data anak
  //       },
  //       onPending: function (result) {
  //         console.log("Payment pending:", result);
  //         alert("Pembayaran sedang diproses.");
  //       },
  //       onError: function (result) {
  //         console.error("Payment error:", result);
  //         alert("Pembayaran gagal.");
  //       },
  //     });
  //   } catch (err) {
  //     console.error("Gagal memulai pembayaran:", err);
  //     alert("Gagal memulai pembayaran.");
  //   }
  // };
  const handlePembelianBaru = async () => {
    if (!selectedChild || !selectedPaketId) return;

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/pembelian/duitku-token`,
        {
          childId: selectedChild._id,
          paketId: selectedPaketId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { paymentUrl } = res.data;

      // Arahkan user ke Duitku payment URL
      window.location.href = paymentUrl;
    } catch (err) {
      console.error(
        "Gagal memulai pembayaran Duitku:",
        err.response?.data || err
      );
      alert("Gagal memulai pembayaran.");
    }
  };

  const toggleDetail = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Format tanggal "12 Mei 2023"
  const formatTanggal = (tanggal) => {
    if (!tanggal) return "-";
    const date = new Date(tanggal);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="container mt-4">
      <h3>Daftar Anak</h3>

      {loadingAnak && <p>Loading...</p>}
      {errorAnak && <div className="alert alert-danger">{errorAnak}</div>}

      {!loadingAnak && anakList.length === 0 && <p>Belum ada data anak.</p>}

      {!loadingAnak && anakList.length > 0 && (
        <ul className="list-group mb-3">
          {anakList.map((anak) => (
            <li key={anak._id} className="list-group-item">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>{anak.name}</strong>
                </div>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => toggleDetail(anak._id)}
                >
                  {expandedId === anak._id ? "Sembunyikan Detail" : "Detail"}
                </button>
              </div>

              {expandedId === anak._id && (
                <div className="mt-3 border rounded p-3 bg-light">
                  <p>
                    <strong>Jenis Kelamin:</strong> {anak.gender || "-"}
                  </p>
                  <p>
                    <strong>Tanggal Lahir:</strong>{" "}
                    {formatTanggal(anak.birthDate)}
                  </p>
                  <p>
                    <strong>Tempat Lahir:</strong> {anak.placeOfBirth || "-"}
                  </p>
                  <p>
                    <strong>Golongan Darah:</strong> {anak.bloodType || "-"}
                  </p>
                  <p>
                    <strong>Alergi:</strong> {anak.allergy || "-"}
                  </p>
                  <p>
                    <strong>Alamat:</strong> {anak.address || "-"}
                  </p>
                  <p>
                    <strong>Nomor Telepon Orang Tua:</strong>{" "}
                    {anak.parentPhone || "-"}
                  </p>
                  <p>
                    <strong>Kontak Darurat:</strong>{" "}
                    {anak.emergencyContact || "-"}
                  </p>

                  {/* Tambahan paket aktif */}
                  <p>
                    <strong>Paket Aktif:</strong>{" "}
                    {anak.paketAktif
                      ? `${anak.paketAktif.paket?.name || "-"} (${
                          anak.paketAktif.paket?.duration || "-"
                        })`
                      : "Tidak ada paket aktif"}
                  </p>
                  <p>
                    <strong>Status Paket:</strong>{" "}
                    {anak.paketAktif ? anak.paketAktif.status : "Tidak aktif"}
                  </p>

                  {!anak.paketAktif && (
                    <>
                      <p className="mt-3 mb-1">
                        <strong>Pilih Paket Baru:</strong>
                      </p>
                      <select
                        className="form-select mb-2"
                        value={
                          selectedChild?._id === anak._id ? selectedPaketId : ""
                        }
                        onChange={(e) => {
                          setSelectedChild(anak);
                          setSelectedPaketId(e.target.value);
                        }}
                      >
                        <option value="">-- Pilih Paket --</option>
                        {paketList.map((paket) => (
                          <option key={paket._id} value={paket._id}>
                            {paket.name} ({paket.duration})
                          </option>
                        ))}
                      </select>

                      <button
                        className="btn btn-sm btn-success"
                        disabled={
                          selectedChild?._id !== anak._id || !selectedPaketId
                        }
                        onClick={handlePembelianBaru}
                      >
                        Beli Paket Ini
                      </button>
                    </>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {!showForm && (
        <button className="btn btn-success" onClick={() => setShowForm(true)}>
          Tambah Anak
        </button>
      )}

      {showForm && (
        <div className="mt-4">
          <button
            className="btn btn-secondary mb-3"
            onClick={() => setShowForm(false)}
          >
            Batal
          </button>
          <FormTambahAnak onTambahSukses={onTambahSukses} />
        </div>
      )}
    </div>
  );
};

export default DaftarAnakDenganForm;
