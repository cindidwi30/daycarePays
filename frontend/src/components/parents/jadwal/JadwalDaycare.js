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

      console.log("✅ Jadwal Anak:", jadwalRes.data);
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

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (timeStr) => {
    if (!timeStr) return "-";
    const date = new Date(timeStr);
    return `${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  const getAbsensiForChild = (jadwalChildId) => {
    const jadwalId =
      typeof jadwalChildId === "object" && jadwalChildId !== null
        ? jadwalChildId._id
        : jadwalChildId;

    const found = absensi.find((a) => {
      const absensiId =
        typeof a.childId === "object" && a.childId !== null
          ? a.childId._id
          : a.childId;

      const match = absensiId?.toString() === jadwalId?.toString();

      // 🔍 Debug matching log
      console.log("🧩 Cek pencocokan Absensi");
      console.log("  - ID dari Jadwal :", jadwalId);
      console.log("  - ID dari Absensi:", absensiId);
      console.log("  - Match:", match);
      return match;
    });

    return found;
  };

  const handleBayarDenda = async (absensiId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/denda/midtrans-token-denda`,
        { absensiId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { redirect_url } = response.data;
      window.location.href = redirect_url;
    } catch (err) {
      console.error("Gagal membuat transaksi denda:", err);
      alert("Gagal membuat transaksi denda.");
    }
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

        // 🧪 Debug detail absensi anak
        console.log(`👶 Anak: ${item.childName}`);
        console.log("   - ID Child Jadwal:", childId);
        console.log("   - Absensi Anak:", absensiAnak);

        const denda = absensiAnak?.lateFee ?? null;
        const statusBayar = absensiAnak?.dendaSudahDibayar
          ? "Sudah dibayar"
          : "Belum dibayar";

        const hadirJam = absensiAnak?.hadirAt
          ? `Hadir jam: ${formatTime(absensiAnak.hadirAt)}`
          : "Belum absen";
        const pulangJam = absensiAnak?.pulangAt
          ? `Pulang jam: ${formatTime(absensiAnak.pulangAt)}`
          : "Belum dijemput";

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

              <p className="text-success fw-semibold">{hadirJam}</p>
              <p className="text-primary fw-semibold">{pulangJam}</p>

              {denda != null && denda > 0 && (
                <>
                  <p className="text-danger fw-bold">
                    Denda keterlambatan: Rp
                    {Number(denda).toLocaleString("id-ID")} ({statusBayar})
                  </p>
                  {!absensiAnak?.dendaSudahDibayar && (
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => handleBayarDenda(absensiAnak._id)}
                    >
                      Bayar Denda
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default JadwalDaycareHariIni;
