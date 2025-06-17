//caregiver.js

import React, { useState } from "react";
import Sidebar from "../components/caregiver/dashboard/PengasuhSidebar";
import Navbar from "../components/caregiver/dashboard/PengasuhNavbar";
import { Outlet } from "react-router-dom";

const CaregiverDashboard = () => {
  const [showSidebar, setShowSidebar] = useState(true);

  return (
    <div className="d-flex">
      {/* Sidebar */}
      {showSidebar && <Sidebar />}

      <div
        className="flex-grow-1"
        style={{ marginLeft: showSidebar ? 250 : 0 }}
      >
        {/* Navbar */}
        <Navbar toggleSidebar={() => setShowSidebar(!showSidebar)} />
        <div className="p-3">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default CaregiverDashboard;
