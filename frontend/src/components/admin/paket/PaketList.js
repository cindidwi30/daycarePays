import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

const PaketList = () => {
  const [paketList, setPaketList] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPakets();
  }, []);

  // Fungsi ambil data paket
  const fetchPakets = () => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/admin/paket`)
      .then((response) => {
        setPaketList(response.data);
        setError(null);
      })
      .catch((err) => {
        setError("Gagal mengambil paket");
        console.error(err);
      });
  };

  // Fungsi delete paket
  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus paket ini?")) return;

    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/admin/paket/${id}`
      );
      // Setelah berhasil delete, refresh list paket
      setPaketList(paketList.filter((paket) => paket._id !== id));
    } catch (err) {
      setError("Gagal menghapus paket");
      console.error(err);
    }
  };

  return (
    <div className="container mt-4">
      <h3>Daftar Paket</h3>
      <Link to="/dashboard/admin/tambah-paket">
        <Button variant="primary" className="mb-3">
          Tambah Paket
        </Button>
      </Link>
      {error && <p className="text-danger">{error}</p>}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>No</th>
            <th>Nama Paket</th>
            <th>Deskripsi</th>
            <th>Harga</th>
            <th>Durasi</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paketList.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center">
                Tidak ada paket tersedia
              </td>
            </tr>
          ) : (
            paketList.map((paket, index) => (
              <tr key={paket._id}>
                <td>{index + 1}</td>
                <td>{paket.name}</td>
                <td>{paket.description}</td>
                <td>{paket.price}</td>
                <td>{paket.duration}</td>
                <td>
                  <Link to={`/dashboard/admin/paket/${paket._id}/edit`}>
                    <Button variant="warning" size="sm" className="me-2">
                      Edit
                    </Button>
                  </Link>
                  <Link to={`/dashboard/admin/paket/${paket._id}`}>
                    <Button variant="info" size="sm" className="me-2">
                      Detail
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(paket._id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default PaketList;
