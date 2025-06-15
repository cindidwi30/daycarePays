import React from "react";
import {
  FaTachometerAlt,
  FaUsers,
  FaMoneyBillWave,
  FaHistory,
  FaCalendarAlt, // import icon untuk jadwal
} from "react-icons/fa";
import SidebarItem from "./SidebarItem";
import "bootstrap/dist/css/bootstrap.min.css";

const navItems = [
  {
    to: "/dashboard/parent",
    label: "Dashboard",
    icon: <FaTachometerAlt />,
    exact: true,
  },
  {
    to: "/dashboard/parent/anak",
    label: "Data Anak",
    icon: <FaUsers />,
  },
  // {
  //   to: "/dashboard/parent/pilihan-paket",
  //   label: "Pilihan Paket",
  //   icon: <FaMoneyBillWave />,
  // },
  {
    to: "/dashboard/parent/riwayat-pembelian",
    label: "Riwayat Pembelian",
    icon: <FaHistory />,
  },
  {
    to: "/dashboard/parent/jadwal", // path baru untuk jadwal
    label: "Jadwal",
    icon: <FaCalendarAlt />, // icon kalender dari react-icons/fa
  },
];

const Sidebar = () => {
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

export default Sidebar;
