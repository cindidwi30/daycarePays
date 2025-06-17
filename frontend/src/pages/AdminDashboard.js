import React, { useState } from "react";
import AdminSidebar from "../components/admin/dashboard/AdminSidebar";
import AdminNavbar from "../components/admin/dashboard/AdminNavbar";
import { Outlet, useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="d-flex">
      {sidebarVisible && <AdminSidebar visible={sidebarVisible} />}
      <div
        className="flex-grow-1 bg-white min-vh-100 d-flex flex-column"
        style={{ marginLeft: sidebarVisible ? "250px" : "0" }}
      >
        <AdminNavbar toggleSidebar={() => setSidebarVisible(!sidebarVisible)} />
        <div className="container mt-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
