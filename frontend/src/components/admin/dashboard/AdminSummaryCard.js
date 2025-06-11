import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const AdminSummaryCard = ({ icon, text, number }) => {
  return (
    <div className="card h-100 shadow-sm border-light">
      <div className="card-body d-flex align-items-center gap-3">
        <div
          className="fs-2 text-dark d-flex align-items-center justify-content-center"
          style={{ width: "50px" }}
        >
          {icon}
        </div>
        <div>
          <p className="mb-1 fw-semibold text-secondary">{text}</p>
          <h4 className="mb-0 fw-bold text-dark">{number}</h4>
        </div>
      </div>
    </div>
  );
};

export default AdminSummaryCard;
