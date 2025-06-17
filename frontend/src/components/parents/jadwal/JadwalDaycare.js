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

  const getAbsensiForChildToday = (childId) => {
    const today = new Date().toISOString().split("T")[0];
    return absensi.find((a) => {
      const aChildId = a.childId?._id || a.childId;
      const aDate = new Date(a.date).toISOString().split("T")[0];
      return aChildId === childId && aDate === today;
    });
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
        const childId = item.childId?._id || item.childId;
        const childName =
          item.childId?.name || item.childName || "Nama tidak ditemukan";
        const absensiAnak = getAbsensiForChildToday(childId);

        const denda = absensiAnak?.lateFee ?? null;
        const statusBayar = absensiAnak?.dendaSudahDibayar
          ? "Sudah dibayar"
          : "Belum dibayar";

        return (
          <div
            key={index}
            className="card mb-3"
            style={{ width: "18rem", borderLeft: "4px solid #4CAF50" }}
          >
            <div className="card-body">
              <h5 className="card-title">{childName}</h5>
              <p className="card-text">
                <strong>Jadwal Antar:</strong> {item.startTime} <br />
                <strong>Jadwal Jemput:</strong> {item.endTime} <br />
                <small className="text-muted">{item.paketName || "-"}</small>
              </p>

              {absensiAnak ? (
                <>
                  <p className="text-success">
                    Hadir jam:{" "}
                    {new Date(absensiAnak.hadirAt).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Asia/Jakarta",
                    })}
                  </p>
                  <p className="text-primary">
                    Pulang jam:{" "}
                    {absensiAnak.pulangAt
                      ? new Date(absensiAnak.pulangAt).toLocaleTimeString(
                          "id-ID",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                            timeZone: "Asia/Jakarta",
                          }
                        )
                      : "Belum dijemput"}
                  </p>

                  {denda !== null && (
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
                </>
              ) : (
                <p className="text-warning">Belum absen hari ini</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default JadwalDaycareHariIni;
