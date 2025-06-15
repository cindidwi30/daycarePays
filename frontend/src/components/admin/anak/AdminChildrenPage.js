import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

const AdminChildrenPage = () => {
  const [children, setChildren] = useState([]);
  const [filterKeyword, setFilterKeyword] = useState("");
  const [filteredChildren, setFilteredChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchChildren = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/anak/all`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setChildren(response.data);
    } catch (err) {
      console.error("Gagal mengambil data anak:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = async (id) => {
    const confirm = window.confirm("Yakin ingin menghapus anak ini?");
    if (!confirm) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/anak/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChildren((prev) => prev.filter((child) => child._id !== id));
    } catch (err) {
      console.error("Gagal menghapus anak:", err);
      alert("Gagal menghapus anak.");
    }
  };

  const filterData = (items, keyword) => {
    if (!keyword.trim()) return items;

    const lowerKeyword = keyword.toLowerCase();
    return items.filter(
      ({ name = "", parentId = {} }) =>
        name.toLowerCase().includes(lowerKeyword) ||
        parentId.name?.toLowerCase().includes(lowerKeyword)
    );
  };

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  useEffect(() => {
    setFilteredChildren(filterData(children, filterKeyword));
  }, [children, filterKeyword]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container">
      <h2 className="my-4">Daftar Anak</h2>

      {/* Filter */}
      <div className="mb-4 p-3 bg-light rounded shadow-sm">
        <div className="row align-items-center">
          <label
            htmlFor="filterKeyword"
            className="col-md-3 col-form-label fw-semibold"
          >
            Filter Nama Anak / Orang Tua:
          </label>
          <div className="col-md-6">
            <input
              id="filterKeyword"
              type="search"
              className="form-control form-control-sm"
              placeholder="Ketik nama anak atau orang tua..."
              value={filterKeyword}
              onChange={(e) => setFilterKeyword(e.target.value)}
              aria-label="Filter nama anak atau orang tua"
              autoComplete="off"
              style={{ fontSize: "0.9rem", padding: "0.25rem 0.5rem" }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive shadow rounded">
        <table className="table table-striped table-bordered align-middle mb-0">
          <thead className="table-dark">
            <tr>
              <th>Nama</th>
              <th>Tanggal Lahir</th>
              <th>Gender</th>
              <th>Orang Tua</th>
              <th>Email</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredChildren.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center fst-italic text-muted">
                  Tidak ada data anak.
                </td>
              </tr>
            ) : (
              filteredChildren.map((child) => (
                <tr key={child._id}>
                  <td>{child.name}</td>
                  <td>{new Date(child.birthDate).toLocaleDateString()}</td>
                  <td>{child.gender}</td>
                  <td>{child.parentId?.name || "-"}</td>
                  <td>{child.parentId?.email || "-"}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(child._id)}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminChildrenPage;
