// // import React, { useEffect, useState } from "react";
// // import axios from "axios";

// // const RiwayatPembelianOrtu = () => {
// //   const [riwayat, setRiwayat] = useState([]);
// //   const [error, setError] = useState(null);

// //   useEffect(() => {
// //     const fetchRiwayat = async () => {
// //       const token = localStorage.getItem("token");
// //       if (!token) {
// //         setError("User belum login.");
// //         return;
// //       }

// //       try {
// //         const decodedToken = JSON.parse(atob(token.split(".")[1]));
// //         const userId = decodedToken.id;

// //         const response = await axios.get(
// //           `http://localhost:5000/api/pembelian/user/${userId}`,
// //           {
// //             headers: { Authorization: `Bearer ${token}` },
// //           }
// //         );

// //         console.log("🔥 Response dari server:", response.data); // <-- tambahkan ini

// //         setRiwayat(response.data);
// //       } catch (err) {
// //         console.error(err);
// //         setError("Gagal mengambil riwayat pembelian.");
// //       }
// //     };

// //     fetchRiwayat();
// //   }, []);

// //   if (error) return <div className="container mt-4 text-danger">{error}</div>;
// //   if (!riwayat.length)
// //     return <div className="container mt-4">Belum ada riwayat pembelian.</div>;

// //   // Fungsi hitung masa aktif paket (tanggal berakhir)
// //   const hitungMasaAktif = (tanggalPembelian, durasi) => {
// //     if (!tanggalPembelian || !durasi) return "-";
// //     const tglBeli = new Date(tanggalPembelian);
// //     const tglAkhir = new Date(tglBeli);
// //     if (durasi === "harian") {
// //       tglAkhir.setDate(tglAkhir.getDate() + 1);
// //     } else if (durasi === "bulanan") {
// //       tglAkhir.setMonth(tglAkhir.getMonth() + 1);
// //     }
// //     return tglAkhir.toLocaleDateString();
// //   };

// //   return (
// //     <div className="container mt-4">
// //       <h3 className="mb-4">Riwayat Pembelian</h3>
// //       <ul className="list-group">
// //         {riwayat.map((item) => (
// //           <li key={item._id} className="list-group-item">
// //             <strong>Paket:</strong>{" "}
// //             {item.paketId?.name || "Nama paket tidak tersedia"} <br />
// //             <strong>Anak:</strong> {item.childId?.name || "-"} <br />
// //             <strong>Tanggal Pembelian:</strong>{" "}
// //             {new Date(item.tanggalPembelian).toLocaleDateString()} <br />
// //             <strong>Masa Aktif Sampai:</strong>{" "}
// //             {hitungMasaAktif(item.tanggalPembelian, item.paketId?.duration)}{" "}
// //             <br />
// //             <strong>Status:</strong>{" "}
// //             <span className={item.isActive ? "text-success" : "text-danger"}>
// //               {item.isActive ? "Aktif" : "Kadaluarsa"}
// //             </span>{" "}
// //             <br />
// //             <strong>Harga:</strong> Rp{item.paketId?.price || "-"}
// //           </li>
// //         ))}
// //       </ul>
// //     </div>
// //   );
// // };

// // export default RiwayatPembelianOrtu;

// import React, { useEffect, useState } from "react";
// import axios from "axios";

// const RiwayatPembelianOrtu = () => {
//   const [riwayat, setRiwayat] = useState([]);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchRiwayat = async () => {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         setError("User belum login.");
//         return;
//       }

//       try {
//         const decodedToken = JSON.parse(atob(token.split(".")[1]));
//         const userId = decodedToken.id;

//         const response = await axios.get(
//           `http://localhost:5000/api/pembelian/user/${userId}`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );

//         console.log("🔥 Response dari server:", response.data);

//         setRiwayat(response.data);
//       } catch (err) {
//         console.error(err);
//         setError("Gagal mengambil riwayat pembelian.");
//       }
//     };

//     fetchRiwayat();
//   }, []);

//   // Fungsi hitung tanggal masa aktif paket (tanggal berakhir)
//   const hitungMasaAktif = (tanggalPembelian, durasi) => {
//     if (!tanggalPembelian || !durasi) return null;
//     const tglBeli = new Date(tanggalPembelian);
//     const tglAkhir = new Date(tglBeli);

//     if (durasi === "harian") {
//       tglAkhir.setDate(tglAkhir.getDate() + 1);
//     } else if (durasi === "bulanan") {
//       tglAkhir.setMonth(tglAkhir.getMonth() + 1);
//     }
//     return tglAkhir;
//   };

//   // Fungsi cek apakah paket masih aktif
//   const cekStatusAktif = (tanggalPembelian, durasi) => {
//     const tglAkhir = hitungMasaAktif(tanggalPembelian, durasi);
//     if (!tglAkhir) return false;
//     const sekarang = new Date();
//     return sekarang <= tglAkhir;
//   };

//   if (error) return <div className="container mt-4 text-danger">{error}</div>;
//   if (!riwayat.length)
//     return <div className="container mt-4">Belum ada riwayat pembelian.</div>;

//   return (
//     <div className="container mt-4">
//       <h3 className="mb-4">Riwayat Pembelian</h3>
//       <ul className="list-group">
//         {riwayat.map((item) => (
//           <li key={item._id} className="list-group-item">
//             <strong>Paket:</strong>{" "}
//             {item.paketId?.name || "Nama paket tidak tersedia"} <br />
//             <strong>Anak:</strong> {item.childId?.name || "-"} <br />
//             <strong>Tanggal Pembelian:</strong>{" "}
//             {new Date(item.tanggalPembelian).toLocaleDateString()} <br />
//             <strong>Masa Aktif Sampai:</strong>{" "}
//             {hitungMasaAktif(item.tanggalPembelian, item.paketId?.duration)
//               ? hitungMasaAktif(
//                   item.tanggalPembelian,
//                   item.paketId?.duration
//                 ).toLocaleDateString()
//               : "-"}{" "}
//             <br />
//             <strong>Status:</strong>{" "}
//             <span
//               className={
//                 cekStatusAktif(item.tanggalPembelian, item.paketId?.duration)
//                   ? "text-success"
//                   : "text-danger"
//               }
//             >
//               {cekStatusAktif(item.tanggalPembelian, item.paketId?.duration)
//                 ? "Aktif"
//                 : "Kadaluarsa"}
//             </span>{" "}
//             <br />
//             <strong>Harga:</strong> Rp{item.paketId?.price || "-"}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default RiwayatPembelianOrtu;

import React, { useEffect, useState } from "react";
import axios from "axios";

const RiwayatPembelianOrtu = () => {
  const [riwayat, setRiwayat] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRiwayat = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("User belum login.");
        return;
      }

      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        const userId = decodedToken.id;

        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/pembelian/user/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setRiwayat(response.data);
      } catch (err) {
        console.error(err);
        setError("Gagal mengambil riwayat pembelian.");
      }
    };

    fetchRiwayat();
  }, []);

  // Fungsi hitung tanggal masa aktif paket (kembali tanggal berakhir sebagai objek Date)
  const hitungMasaAktif = (tanggalPembelian, durasi) => {
    if (!tanggalPembelian || !durasi) return null;
    const tglBeli = new Date(tanggalPembelian);
    const tglAkhir = new Date(tglBeli);

    if (durasi === "harian") {
      tglAkhir.setDate(tglAkhir.getDate() + 1);
    } else if (durasi === "bulanan") {
      tglAkhir.setMonth(tglAkhir.getMonth() + 1);
    }
    return tglAkhir;
  };

  // Fungsi cek status aktif berdasarkan tanggal masa aktif
  const cekStatusAktif = (tanggalPembelian, durasi) => {
    const tglAkhir = hitungMasaAktif(tanggalPembelian, durasi);
    if (!tglAkhir) return false;
    const now = new Date();
    return now <= tglAkhir;
  };

  // Fungsi format tanggal ke "12 Mei 2025"
  const formatTanggalIndo = (date) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  if (error) return <div className="container mt-4 text-danger">{error}</div>;
  if (!riwayat.length)
    return <div className="container mt-4">Belum ada riwayat pembelian.</div>;

  return (
    <div className="container mt-4">
      <h3 className="mb-4">Riwayat Pembelian</h3>
      <ul className="list-group">
        {riwayat.map((item) => {
          const masaAktif = hitungMasaAktif(
            item.tanggalPembelian,
            item.paketId?.duration
          );
          const isActive = cekStatusAktif(
            item.tanggalPembelian,
            item.paketId?.duration
          );

          return (
            <li key={item._id} className="list-group-item">
              <strong>Paket:</strong>{" "}
              {item.paketId?.name || "Nama paket tidak tersedia"} <br />
              <strong>Anak:</strong> {item.childId?.name || "-"} <br />
              <strong>Tanggal Pembelian:</strong>{" "}
              {formatTanggalIndo(new Date(item.tanggalPembelian))} <br />
              <strong>Masa Aktif Sampai:</strong>{" "}
              {masaAktif ? formatTanggalIndo(masaAktif) : "-"} <br />
              <strong>Status:</strong>{" "}
              <span className={isActive ? "text-success" : "text-danger"}>
                {isActive ? "Aktif" : "Kadaluarsa"}
              </span>{" "}
              <br />
              <strong>Harga:</strong> Rp{item.paketId?.price || "-"}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default RiwayatPembelianOrtu;
