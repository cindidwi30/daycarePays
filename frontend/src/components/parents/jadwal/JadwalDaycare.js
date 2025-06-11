import React, { useEffect, useState } from "react";
import axios from "axios";

const JadwalDaycareHariIni = () => {
  const [jadwal, setJadwal] = useState([]);
  const [absensi, setAbsensi] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("User belum login.");
        return;
      }

      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        const userId = decodedToken.id;

        const [jadwalRes, absensiRes] = await Promise.all([
          axios.get(
            `http://localhost:5000/api/pembelian/jadwal-hari-ini/${userId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
          axios.get(`http://localhost:5000/api/absensi`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setJadwal(jadwalRes.data || []);
        setAbsensi(absensiRes.data || []);
      } catch (err) {
        console.error("Gagal mengambil data:", err);
        setError("Gagal mengambil data jadwal atau absensi.");
      }
    };

    fetchData();
  }, []);

  const getAbsensiForChild = (childId) => {
    if (!childId) return null;
    return absensi.find((a) => a.childId && a.childId._id === childId);
  };

  if (error) return <div className="text-danger">{error}</div>;
  if (!jadwal || jadwal.length === 0)
    return <div>Tidak ada jadwal daycare hari ini.</div>;

  return (
    <div className="container">
      <h3>Jadwal Daycare Hari Ini</h3>
      {jadwal.map((item, index) => {
        const childId =
          typeof item.childId === "object" ? item.childId._id : item.childId;
        const absensiAnak = getAbsensiForChild(childId);

        const denda = absensiAnak?.lateFee ?? null;
        const statusBayar = absensiAnak?.dendaSudahDibayar
          ? "Sudah dibayar"
          : "Belum dibayar";
        const statusJemput = absensiAnak?.pulangAt
          ? "Status jemput: Sudah dijemput"
          : "Status jemput: Belum dijemput";

        return (
          <div
            key={index}
            className="card mb-3"
            style={{ width: "18rem", borderLeft: "4px solid #4CAF50" }}
          >
            <div className="card-body">
              <h5 className="card-title">{item.childName}</h5>
              <p className="card-text">
                <strong>Jadwal Antar:</strong> {item.startTime} <br />
                <strong>Jadwal Jemput:</strong> {item.endTime} <br />
                <small className="text-muted">{item.paketName}</small>
              </p>

              {denda != null && (
                <p
                  className="text-danger fw-bold"
                  style={{ marginTop: "10px" }}
                >
                  Denda keterlambatan: Rp{Number(denda).toLocaleString("id-ID")}{" "}
                  ({statusBayar})
                </p>
              )}

              <p className="text-primary fw-semibold">{statusJemput}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default JadwalDaycareHariIni;
