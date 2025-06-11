import React from "react";
import Sidebar from "../components/caregiver/dashboard/PengasuhSidebar";
import Navbar from "../components/caregiver/dashboard/PengasuhNavbar";
import { Outlet } from "react-router-dom";

function ParentDashboard() {
  return (
    <div className="d-flex">
      <Sidebar />
      <div
        className="flex-grow-1 bg-white min-vh-100 d-flex flex-column"
        style={{ marginLeft: "250px" }}
      >
        <Navbar />
        <div className="container mt-4">
          <Outlet /> {/* Ini yang akan render Summary atau Biodata */}
        </div>
      </div>
    </div>
  );
}

export default ParentDashboard;
