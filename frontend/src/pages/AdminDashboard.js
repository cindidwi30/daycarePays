import React from "react";
import AdminSidebar from "../components/admin/dashboard/AdminSidebar";
import AdminNavbar from "../components/admin/dashboard/AdminNavbar";
import { Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div
        className="flex-grow-1 bg-white min-vh-100 d-flex flex-column"
        style={{ marginLeft: "250px" }}
      >
        <AdminNavbar />
        <div className="container mt-4">
          <Outlet /> {/* This renders the child route (Summary, Biodata) */}
        </div>
      </div>
    </div>
  );
}
export default AdminDashboard;
