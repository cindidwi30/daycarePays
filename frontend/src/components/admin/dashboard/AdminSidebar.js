// export default AdminSidebar;
import React from "react";
import {
  FaTachometerAlt,
  FaUsers,
  FaMoneyBillWave,
  FaHistory,
} from "react-icons/fa";
import SidebarItem from "./AdminSidebarItem";
import "bootstrap/dist/css/bootstrap.min.css";

const navItems = [
  {
    to: "/dashboard/admin",
    label: "Dashboard",
    icon: <FaTachometerAlt />,
    exact: true,
  },
  {
    to: "/dashboard/admin/tambah-paket",
    label: "Tambah Paket",
    icon: <FaMoneyBillWave />,
  },
  {
    to: "/dashboard/admin/paket-list",
    label: "List Paket",
    icon: <FaMoneyBillWave />,
  },
  {
    to: "/dashboard/admin/riwayat-pembelian", // menu baru
    label: "Riwayat Pembelian",
    icon: <FaHistory />,
  },
  {
    to: "/dashboard/admin/daftar-anak",
    label: "Daftar Anak",
    icon: <FaUsers />,
  },
];

const AdminSidebar = ({ visible }) => {
  if (!visible) return null; // jika tidak visible, return null (sembunyikan)

  return (
    <div
      className="bg-dark text-white vh-100 position-fixed top-0 start-0 p-3 shadow"
      style={{ width: "250px", zIndex: 1000 }}
    >
      <div className="text-center mb-4">
        <h4 className="fw-bold">DaycarePays</h4>
      </div>
      <nav className="nav flex-column">
        {navItems.map(({ to, label, icon, exact }) => (
          <SidebarItem
            key={to}
            to={to}
            label={label}
            icon={icon}
            exact={exact}
          />
        ))}
      </nav>
      <style>{`
        .hover-effect:hover {
          background-color: rgba(255, 255, 255, 0.1);
          transition: background-color 0.3s;
        }
      `}</style>
    </div>
  );
};

export default AdminSidebar;
