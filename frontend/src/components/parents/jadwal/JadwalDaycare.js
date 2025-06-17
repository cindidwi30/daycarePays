import React, { useEffect, useState } from "react";
import axios from "axios";

const JadwalDaycareHariIni = () => {
  const [jadwal, setJadwal] = useState([]);
  const [absensi, setAbsensi] = useState([]);
  const [error, setError] = useState(null);

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
          `${process.env.REACT_APP_API_URL}/api/pembelian/jadwal-hari-ini/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
        axios.get(`${process.env.REACT_APP_API_URL}/api/absensi`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      console.log("✅ Jadwal:", jadwalRes.data);
      console.log("✅ Absensi:", absensiRes.data);

      setJadwal(jadwalRes.data || []);
      setAbsensi(absensiRes.data || []);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
      setError("Gagal mengambil data jadwal atau absensi.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // polling setiap 10 detik
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const getAbsensiForChild = (childId) => {
    if (!childId) return null;

    const idToCompare =
      typeof childId === "object" && childId !== null ? childId._id : childId;

    return absensi.find((a) => {
      const absensiChildId =
        typeof a.childId === "object" && a.childId !== null
          ? a.childId._id
          : a.childId;
      return absensiChildId?.toString() === idToCompare?.toString();
    });
  };

  const formatWaktu = (isoString) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (error) return <div className="text-danger">{error}</div>;
  if (!jadwal || jadwal.length === 0)
    return <div>Tidak ada jadwal daycare hari ini.</div>;

  return (
    <div className="container">
      <h3>Jadwal Daycare Hari Ini</h3>

      <button className="btn btn-sm btn-secondary mb-3" onClick={fetchData}>
        Refresh Status
      </button>

      {jadwal.map((item, index) => {
        const childId =
          typeof item.childId === "object" ? item.childId._id : item.childId;
        const absensiAnak = getAbsensiForChild(childId);

        return (
          <div
            key={index}
            className="card mb-3"
            style={{ width: "100%", borderLeft: "4px solid #4CAF50" }}
          >
            <div className="card-body">
              <h5 className="card-title">{item.childName}</h5>
              <p className="card-text">
                <strong>Jadwal Antar:</strong> {item.startTime} <br />
                <strong>Jadwal Jemput:</strong> {item.endTime} <br />
                <strong>Paket:</strong> {item.paketName || "-"}
              </p>

              {absensiAnak ? (
                <>
                  <p className="text-success mb-1">
                    Hadir pukul: {formatWaktu(absensiAnak.hadirAt)}
                  </p>
                  <p className="text-primary mb-1">
                    Pulang pukul:{" "}
                    {absensiAnak.pulangAt
                      ? formatWaktu(absensiAnak.pulangAt)
                      : "Belum dijemput"}
                  </p>
                </>
              ) : (
                <p className="text-danger">Belum absen hari ini.</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default JadwalDaycareHariIni;
