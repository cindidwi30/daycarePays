import React from "react";
import { useNavigate } from "react-router-dom";

const AdminNavbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom shadow-sm">
      <div className="container-fluid d-flex justify-content-between px-4">
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn btn-outline-secondary d-lg-none"
            onClick={toggleSidebar}
          >
            ☰
          </button>
          <span className="navbar-brand fw-bold text-black">Welcome Admin</span>
        </div>
        <button className="btn btn-outline-dark" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default AdminNavbar;
