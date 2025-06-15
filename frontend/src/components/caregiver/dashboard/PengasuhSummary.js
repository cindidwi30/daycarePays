import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Spinner, Modal } from "react-bootstrap";

const AbsensiAnak = () => {
  const [anak, setAnak] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAnak, setSelectedAnak] = useState(null);
  const [absensiHariIni, setAbsensiHariIni] = useState([]);

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [anakRes, absensiRes] = await Promise.all([
          axios.get(`${API_URL}/api/pengasuh/anak-aktif`),
          axios.get(`${API_URL}/api/absensi`),
        ]);

        setAnak(anakRes.data);

        // Filter absensi untuk tanggal hari ini
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const absensiToday = absensiRes.data.filter((a) => {
          const absDate = new Date(a.date);
          absDate.setHours(0, 0, 0, 0);
          return absDate.getTime() === today.getTime();
        });

        setAbsensiHariIni(absensiToday);
      } catch (err) {
        console.error("Gagal fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL]);

  const handleHadir = async (childId, name) => {
    try {
      await axios.post(`${API_URL}/api/absensi/hadir`, { childId });
      alert(`Absensi hadir berhasil untuk ${name}`);
      // Refresh data absensi setelah hadir
      refreshAbsensiHariIni();
    } catch (error) {
      alert(
        error.response?.data?.error ||
          "Gagal melakukan absensi hadir. Cek console."
      );
      console.error(error);
    }
  };

  const handlePulang = async (childId, name) => {
    try {
      await axios.post(`${API_URL}/api/absensi/pulang`, {
        childId,
      });
      alert(`Absensi pulang berhasil untuk ${name}`);
      // Refresh data absensi setelah pulang
      refreshAbsensiHariIni();
    } catch (error) {
      alert(
        error.response?.data?.error ||
          "Gagal melakukan absensi pulang. Cek console."
      );
      console.error(error);
    }
  };

  // Fungsi refresh data absensi hari ini (dipanggil setelah hadir/pulang)
  const refreshAbsensiHariIni = async () => {
    try {
      const absensiRes = await axios.get(`${API_URL}/api/absensi`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const absensiToday = absensiRes.data.filter((a) => {
        const absDate = new Date(a.date);
        absDate.setHours(0, 0, 0, 0);
        return absDate.getTime() === today.getTime();
      });
      setAbsensiHariIni(absensiToday);
    } catch (err) {
      console.error("Gagal refresh absensi hari ini:", err);
    }
  };

  const handleShowDetail = (anak) => {
    // Cari data absensi anak hari ini
    const absensi = absensiHariIni.find((a) => a.childId._id === anak._id);

    setSelectedAnak({
      ...anak,
      absensi: absensi || null,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAnak(null);
  };

  // Group anak berdasarkan paket untuk tampilan
  const groupedByPaket = anak.reduce((acc, a) => {
    const paketName = a.paket?.name || "Tanpa Paket";
    if (!acc[paketName]) acc[paketName] = [];
    acc[paketName].push(a);
    return acc;
  }, {});

  const handleBayarDenda = async () => {
    if (!selectedAnak?.absensi?._id) {
      alert("Data absensi tidak tersedia.");
      return;
    }

    try {
      await axios.post(`${API_URL}/api/absensi/bayar-denda`, {
        absensiId: selectedAnak.absensi._id,
      });
      alert("Denda berhasil dibayar.");
      handleCloseModal();
      refreshAbsensiHariIni();
    } catch (err) {
      console.error(err);
      alert("Gagal membayar denda.");
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <div>
      <h4 className="mb-4">Daftar Anak Berdasarkan Paket Aktif</h4>
      {Object.entries(groupedByPaket).map(([paketName, anakList], i) => (
        <div key={i} className="mb-5">
          <h5 className="text-primary mb-3">{paketName}</h5>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Anak</th>
                <th>Tanggal Lahir</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {anakList.map((a, index) => (
                <tr key={a._id}>
                  <td>{index + 1}</td>
                  <td>{a.name}</td>
                  <td>{new Date(a.birthDate).toLocaleDateString()}</td>
                  <td>
                    <Button
                      variant="success"
                      size="sm"
                      className="me-2"
                      onClick={() => handleHadir(a._id, a.name)}
                    >
                      Hadir
                    </Button>
                    <Button
                      variant="info"
                      size="sm"
                      className="me-2"
                      onClick={() => handleShowDetail(a)}
                    >
                      Detail
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handlePulang(a._id, a.name)}
                    >
                      Pulang
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      ))}

      {/* Modal Detail Anak */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Detail Anak</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAnak ? (
            <>
              <p>
                <strong>Nama:</strong> {selectedAnak.name}
              </p>
              <p>
                <strong>Tanggal Lahir:</strong>{" "}
                {new Date(selectedAnak.birthDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Paket:</strong>{" "}
                {selectedAnak.paket?.name || "Tanpa Paket"}
              </p>
              <hr />
              <p>
                <strong>Waktu Hadir:</strong>{" "}
                {selectedAnak.absensi?.hadirAt
                  ? new Date(selectedAnak.absensi.hadirAt).toLocaleTimeString()
                  : "Belum absen hadir"}
              </p>
              <p>
                <strong>Waktu Pulang:</strong>{" "}
                {selectedAnak.absensi?.pulangAt
                  ? new Date(selectedAnak.absensi.pulangAt).toLocaleTimeString()
                  : "Belum absen pulang"}
              </p>
              <p>
                <strong>Denda Telat:</strong>{" "}
                {selectedAnak.absensi?.lateFee != null
                  ? `Rp ${selectedAnak.absensi.lateFee.toLocaleString("id-ID")}`
                  : "Tidak ada denda"}
              </p>
              {selectedAnak.absensi?.lateFee > 0 && (
                <p>
                  <strong>Status Denda:</strong>{" "}
                  {selectedAnak.absensi?.dendaSudahDibayar
                    ? "Sudah Dibayar"
                    : "Belum Dibayar"}
                </p>
              )}
            </>
          ) : (
            <p>Loading...</p>
          )}
        </Modal.Body>
        {/* <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Tutup
          </Button>
        </Modal.Footer> */}
        <Modal.Footer>
          {selectedAnak?.absensi?.lateFee > 0 && (
            <Button variant="warning" onClick={handleBayarDenda}>
              Denda Dibayar
            </Button>
          )}
          <Button variant="secondary" onClick={handleCloseModal}>
            Tutup
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AbsensiAnak;
