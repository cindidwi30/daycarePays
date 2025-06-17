import React from "react";
import { FaTachometerAlt, FaUsers, FaMoneyBillWave } from "react-icons/fa";
import SidebarItem from "./PengasuhSidebarItem"; // Import komponen baru
import "bootstrap/dist/css/bootstrap.min.css";

const navItems = [
  {
    to: "/dashboard/caregiver",
    label: "Dashboard",
    icon: <FaTachometerAlt />,
    exact: true, // Supaya nggak aktif terus di child route
  },
  // {
  //   to: "/dashboard/caregiver/biodata",
  //   label: "Biodata",
  //   icon: <FaUsers />,
  // },
  // {
  //   to: "/dashboard/caregiver/pilihan-paket",
  //   label: "Pilihan Paket",
  //   icon: <FaMoneyBillWave />,
  // },
];

// const Sidebar = () => {
//   return (
//     <div
//       className="bg-dark text-white vh-100 position-fixed top-0 start-0 p-3 shadow"
//       style={{ width: "250px", zIndex: 1000 }}
//     >
//       <div className="text-center mb-4">
//         <h4 className="fw-bold">DaycarePays</h4>
//       </div>
//       <nav className="nav flex-column">
//         {navItems.map(({ to, label, icon, exact }) => (
//           <SidebarItem
//             key={to}
//             to={to}
//             label={label}
//             icon={icon}
//             exact={exact}
//           />
//         ))}
//       </nav>

//       <style>{`
//         .hover-effect:hover {
//           background-color: rgba(255, 255, 255, 0.1);
//           transition: background-color 0.3s;
//         }
//       `}</style>
//     </div>
//   );
// };

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
    </div>
  );
};

export default Sidebar;
