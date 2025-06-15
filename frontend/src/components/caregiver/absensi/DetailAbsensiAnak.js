import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Spinner } from "react-bootstrap";
import axios from "axios";

const AbsensiAnak = () => {
  const [anak, setAnak] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showDetail, setShowDetail] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    const fetchAnak = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/pengasuh/anak-aktif`
        );
        setAnak(res.data);
      } catch (err) {
        console.error("Gagal fetch anak aktif:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnak();
  }, []);

  const handleHadir = async (childId, name) => {
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/absensi/hadir`,
        {
          childId,
        }
      );
      alert(`Absensi hadir berhasil untuk ${name}`);
      // Optional: reload detail or data if needed
      if (detailData && detailData.absensi.childId === childId) {
        fetchDetail(childId);
      }
    } catch (error) {
      alert(error.response?.data?.error || "Gagal melakukan absensi hadir.");
      console.error(error);
    }
  };

  const handlePulang = async (childId, name) => {
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/absensi/pulang`,
        {
          childId,
        }
      );
      alert(`Absensi pulang berhasil untuk ${name}`);
      if (detailData && detailData.absensi.childId === childId) {
        fetchDetail(childId);
      }
    } catch (error) {
      alert(error.response?.data?.error || "Gagal melakukan absensi pulang.");
      console.error(error);
    }
  };

  const fetchDetail = async (childId) => {
    setLoadingDetail(true);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/absensi/detail/${childId}`
      );
      setDetailData({ ...res.data, childId });
      setShowDetail(true);
    } catch (error) {
      alert(error.response?.data?.error || "Gagal mengambil detail absensi.");
      console.error(error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const groupedByPaket = anak.reduce((acc, a) => {
    const paketName = a.paket?.name || "Tanpa Paket";
    if (!acc[paketName]) acc[paketName] = [];
    acc[paketName].push(a);
    return acc;
  }, {});

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
                      onClick={() => fetchDetail(a._id)}
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

          {/* Modal Detail */}
          <Modal show={showDetail} onHide={() => setShowDetail(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Detail Absensi Anak</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {loadingDetail ? (
                <Spinner animation="border" />
              ) : detailData ? (
                <>
                  <p>
                    <strong>Nama:</strong>{" "}
                    {anak.find((a) => a._id === detailData.childId)?.name}
                  </p>
                  <p>
                    <strong>Tanggal Lahir:</strong>{" "}
                    {new Date(
                      anak.find((a) => a._id === detailData.childId)?.birthDate
                    ).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Hadiran:</strong>{" "}
                    {detailData.absensi.hadirAt
                      ? new Date(
                          detailData.absensi.hadirAt
                        ).toLocaleTimeString()
                      : "-"}
                  </p>
                  <p>
                    <strong>Pulang:</strong>{" "}
                    {detailData.absensi.pulangAt
                      ? new Date(
                          detailData.absensi.pulangAt
                        ).toLocaleTimeString()
                      : "-"}
                  </p>
                  <p>
                    <strong>Denda Keterlambatan:</strong> Rp{" "}
                    {detailData.absensi.lateFee?.toLocaleString() || 0}
                  </p>
                  <p>
                    <strong>Durasi Telat (menit):</strong>{" "}
                    {detailData.absensi.lateDurationMinutes || 0}
                  </p>
                  <div className="d-flex justify-content-between mt-3">
                    <Button
                      variant="success"
                      onClick={() =>
                        handleHadir(
                          detailData.childId,
                          anak.find((a) => a._id === detailData.childId)?.name
                        )
                      }
                      disabled={!!detailData.absensi.hadirAt}
                    >
                      Hadir
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() =>
                        handlePulang(
                          detailData.childId,
                          anak.find((a) => a._id === detailData.childId)?.name
                        )
                      }
                      disabled={!!detailData.absensi.pulangAt}
                    >
                      Pulang
                    </Button>
                  </div>
                </>
              ) : (
                <p>Tidak ada data absensi untuk hari ini.</p>
              )}
            </Modal.Body>
          </Modal>
        </div>
      ))}
    </div>
  );
};

export default AbsensiAnak;
