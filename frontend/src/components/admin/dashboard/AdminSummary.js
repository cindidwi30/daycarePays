import React, { useState, useEffect } from "react";
import { FaMoneyBillWave, FaUsers } from "react-icons/fa";
import AdminSummaryCard from "./AdminSummaryCard";
import axios from "axios"; // For making HTTP requests

const AdminSummary = () => {
  // State for storing counts
  // const [totalPackages, setTotalPackages] = useState(0);
  const [totalParents, setTotalParents] = useState(0);
  const [error, setError] = useState(null);

  // Fetch the total number of packages and parent users
  useEffect(() => {
    // Fetch the total number of packages
    // axios
    //   .get("http://localhost:5000/api/admin/paket/count")
    //   .then((response) => {
    //     setTotalPackages(response.data.count); // Set the total number of packages
    //   })
    //   .catch((err) => {
    //     setError("Failed to fetch package count");
    //     console.error(err);
    //   });

    // Fetch the total number of parent users
    axios
      .get("http://localhost:5000/api/admin/user/parent/count") // Make sure this API endpoint is correct
      .then((response) => {
        setTotalParents(response.data.count); // Set the total number of parent users
      })
      .catch((err) => {
        setError("Failed to fetch parent user count");
        console.error(err);
      });
  }, []); // Empty dependency array ensures this runs once when component mounts

  return (
    <div className="container-fluid">
      <h3 className="fw-bold mb-4 text-dark">Dashboard Overview</h3>

      {/* Display error if fetching data failed */}
      {error && <p className="text-danger">{error}</p>}

      <div className="row g-4 mb-5">
        {/* Display Total Packages */}
        <div className="col-md-6 col-xl-4">
          <AdminSummaryCard
            icon={<FaMoneyBillWave />}
            text="Total Paket"
            // number={totalPackages} // Display total packages
          />
        </div>

        {/* Display Total Parent Users */}
        <div className="col-md-6 col-xl-4">
          <AdminSummaryCard
            icon={<FaUsers />}
            text="Total Siswa"
            number={totalParents} // Display total parent users
          />
        </div>
      </div>
    </div>
  );
};

export default AdminSummary;
