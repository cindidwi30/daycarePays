import React from "react";
import Sidebar from "../components/parents/dashboard/Sidebar";
import Navbar from "../components/parents/dashboard/Navbar";
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
          <Outlet /> {/* This renders the child route (Summary, Biodata) */}
        </div>
      </div>
    </div>
  );
}

export default ParentDashboard;
