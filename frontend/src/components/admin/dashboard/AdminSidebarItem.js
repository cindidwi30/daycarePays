import React from "react";
import { NavLink } from "react-router-dom";

const AdminSidebarItem = ({ to, label, icon, exact = false }) => {
  return (
    <NavLink
      to={to}
      end={exact}
      className={({ isActive }) =>
        `nav-link text-white d-flex align-items-center py-2 px-3 rounded mb-1 ${
          isActive ? "bg-primary fw-bold" : "hover-effect"
        }`
      }
    >
      <span className="me-2">{icon}</span>
      {label}
    </NavLink>
  );
};

export default AdminSidebarItem;
