import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

const AdminRiwayatPembelian = () => {
  const [data, setData] = useState([]);
  const [filterName, setFilterName] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/pembelian/admin/all`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setData(res.data);
    } catch (err) {
      console.error(
        "Gagal fetch data admin:",
        err.response ? err.response.data : err.message
      );
    }
  }, []);

  const filterByName = (items, keyword) => {
    if (!keyword.trim()) return items;

    const lowerKeyword = keyword.toLowerCase();
    return items.filter(
      ({ parentName = "", childName = "" }) =>
        parentName.toLowerCase().includes(lowerKeyword) ||
        childName.toLowerCase().includes(lowerKeyword)
    );
  };

  useEffect(() => {
    setFilteredData(filterByName(data, filterName));
  }, [data, filterName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="container">
      <h2 className="my-4">Riwayat Pembelian</h2>

      {/* Filter Box */}
      <div className="mb-4 p-3 bg-light rounded shadow-sm">
        <div className="row align-items-center">
          <label
            htmlFor="filterName"
            className="col-md-3 col-form-label fw-semibold"
          >
            Filter by Nama Parent / Anak:
          </label>
          <div className="col-md-6">
            <input
              id="filterName"
              type="search"
              className="form-control form-control-sm"
              placeholder="Ketik nama Parent atau Anak..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              aria-label="Filter by nama parent atau anak"
              autoComplete="off"
              style={{ fontSize: "0.9rem", padding: "0.25rem 0.5rem" }}
            />
          </div>
        </div>
      </div>

      <div className="table-responsive shadow rounded">
        <table className="table table-striped table-bordered align-middle mb-0">
          <thead className="table-dark">
            <tr>
              <th>Parent</th>
              <th>Email</th>
              <th>Nama Anak</th>
              <th>Paket</th>
              <th>Tanggal Pembelian</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center fst-italic text-muted">
                  Tidak ada data pembelian.
                </td>
              </tr>
            ) : (
              filteredData.map(
                ({
                  _id,
                  parentName,
                  parentEmail,
                  childName,
                  paketName,
                  tanggalPembelian,
                }) => (
                  <tr key={_id}>
                    <td>{parentName}</td>
                    <td>{parentEmail}</td>
                    <td>{childName}</td>
                    <td>{paketName}</td>
                    <td>{new Date(tanggalPembelian).toLocaleDateString()}</td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminRiwayatPembelian;
