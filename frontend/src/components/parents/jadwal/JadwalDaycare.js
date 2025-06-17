import React, { useEffect, useState } from "react";
import axios from "axios";

const JadwalDaycareHariIni = () => {
  const [jadwal, setJadwal] = useState([]);
  const [absensi, setAbsensi] = useState([]);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [jadwalRes, absensiRes] = await Promise.all([
        axios.get(
          "https://daycarepays-backend.up.railway.app/api/jadwal/hari-ini",
          config
        ),
        axios.get(
          "https://daycarepays-backend.up.railway.app/api/absensi",
          config
        ),
      ]);

      console.log("✅ Absensi:", absensiRes.data);
      console.log("✅ Jadwal:", jadwalRes.data);

      setJadwal(jadwalRes.data);
      setAbsensi(absensiRes.data);
    } catch (err) {
      console.error("❌ Gagal fetch data:", err);
      setError("Gagal memuat data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getAbsensiForChild = (childId) => {
    if (!childId) return null;

    return absensi.find((a) => {
      const absensiChildId =
        typeof a.childId === "object" ? a.childId._id : a.childId;
      return absensiChildId?.toString() === childId?.toString();
    });
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Jadwal Daycare Hari Ini</h2>
      {error && <p className="text-red-500">{error}</p>}

      {jadwal.length === 0 ? (
        <p>Tidak ada jadwal hari ini.</p>
      ) : (
        <ul className="space-y-4">
          {jadwal.map((j) => {
            const childId =
              typeof j.child === "object" ? j.child._id : j.childId;
            const absensiAnak = getAbsensiForChild(childId);

            const status = absensiAnak?.pulangAt
              ? "Sudah dijemput"
              : absensiAnak
              ? "Hadir"
              : "Belum absen";

            return (
              <li
                key={j._id}
                className="border rounded p-4 shadow flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">Nama: {j.child?.name || "-"}</p>
                  <p>Paket: {j.paket?.name || "-"}</p>
                </div>
                <div className="text-sm text-gray-700">{status}</div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default JadwalDaycareHariIni;
