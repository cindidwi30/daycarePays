import React from "react";
import { useNavigate } from "react-router-dom"; // ⬅️ Import ini
import "bootstrap/dist/css/bootstrap.min.css";

// const Navbar = () => {
//   const navigate = useNavigate(); // ⬅️ Inisialisasi

//   const handleLogout = () => {
//     localStorage.removeItem("token"); // Hapus token
//     navigate("/login"); // Redirect ke login
//   };

//   return (
//     <nav className="navbar navbar-expand-lg bg-white border-bottom shadow-sm">
//       <div className="container-fluid d-flex justify-content-between px-4">
//         <span className="navbar-brand fw-bold text-black">
//           Welcome Pengasuh
//         </span>
//         <button className="btn btn-outline-dark" onClick={handleLogout}>
//           Logout
//         </button>
//       </div>
//     </nav>
//   );
// };

const Navbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom shadow-sm">
      <div className="container-fluid d-flex justify-content-between px-4">
        <div className="d-flex align-items-center">
          {/* Tombol toggle sidebar */}
          <button
            className="btn btn-outline-primary me-3"
            onClick={toggleSidebar}
          >
            ☰
          </button>
          <span className="navbar-brand fw-bold text-black">
            Welcome Pengasuh
          </span>
        </div>
        <button className="btn btn-outline-dark" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
