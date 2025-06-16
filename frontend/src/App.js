import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import ParentDashboard from "./pages/ParentDashboard.js";
import CaregiverDashboard from "./pages/CaregiverDashboard";
import "bootstrap/dist/css/bootstrap.min.css";
// import { Outlet } from "react-router-dom";
import AdminSummary from "./components/admin/dashboard/AdminSummary.js";
import AddPaket from "./components/admin/paket/AddPaket.js"; // Correct AddPaket path
import PaketList from "./components/admin/paket/PaketList"; // The new list of packages component
import Summary from "./components/parents/dashboard/Summary"; // Import Summary component
// import Biodata from "./components/parents/biodata/Biodata"; // Correct PaketList path
import EditPaket from "./components/admin/paket/EditPaket"; // Import EditPaket component
import PaketDetail from "./components/admin/paket/PaketDetail.js";
import PaketDetailOrtu from "./components/parents/paket/PaketDetailOrtu.js";
import ChildList from "./components/parents/anak/ChildList.js";
import RiwayatPembelianOrtu from "./components/parents/paket/RiwayatPembelianOrtu.js";
import PengasuhSummary from "./components/caregiver/dashboard/PengasuhSummary.js";
import JadwalDaycareHariIni from "./components/parents/jadwal/JadwalDaycare.js";
import AdminRiwayatPembelian from "./components/admin/pembelian/AdminRiwayatPembelian.js";
import AdminChildrenPage from "./components/admin/anak/AdminChildrenPage.js";
import PaymentSuccess from "./components/parents/anak/PaymentSuccess.js";

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp && decoded.exp > currentTime) {
          setUser({ role: decoded.role });
        } else {
          console.warn("Token expired at:", new Date(decoded.exp * 1000));
          localStorage.removeItem("token");
          setUser(null);
        }
      } catch (error) {
        console.error("Token decode error:", error);
        localStorage.removeItem("token");
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [location]);

  return (
    <Routes>
      {/* Redirect root ke login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Payment success page (tanpa autentikasi) */}
      <Route path="/payment-success" element={<PaymentSuccess />} />

      {/* Login route (cukup satu saja) */}
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to={`/dashboard/${user.role}`} />
          ) : (
            <Login setUser={setUser} />
          )
        }
      />

      {/* Register route */}
      <Route
        path="/register"
        element={
          user ? (
            <Navigate to={`/dashboard/${user.role}`} />
          ) : (
            <Register setUser={setUser} />
          )
        }
      />

      {/* ADMIN */}
      <Route
        path="/dashboard/admin"
        element={
          user?.role === "admin" ? <AdminDashboard /> : <Navigate to="/login" />
        }
      >
        <Route index element={<AdminSummary />} />
        <Route path="tambah-paket" element={<AddPaket />} />
        <Route path="paket-list" element={<PaketList />} />
        <Route path="paket/:id/edit" element={<EditPaket />} />
        <Route path="paket/:id" element={<PaketDetail />} />{" "}
        <Route path="riwayat-pembelian" element={<AdminRiwayatPembelian />} />
        <Route path="daftar-anak" element={<AdminChildrenPage />} />
        {/* Route to edit package */}
      </Route>

      {/* PARENT: Parent route with Outlet */}
      <Route
        path="/dashboard/parent"
        element={
          user?.role === "parent" ? (
            <ParentDashboard />
          ) : (
            <Navigate to="/login" />
          )
        }
      >
        <Route index element={<Summary />} />
        {/* <Route path="biodata" element={<Biodata />} /> */}
        <Route path="paket/:id" element={<PaketDetailOrtu />} />
        <Route path="anak" element={<ChildList />} />
        <Route
          path="/dashboard/parent/riwayat-pembelian"
          element={<RiwayatPembelianOrtu />}
        />
        <Route path="jadwal" element={<JadwalDaycareHariIni />} />
      </Route>

      {/* CAREGIVER */}
      <Route
        path="/dashboard/caregiver"
        element={
          user?.role === "caregiver" ? (
            <CaregiverDashboard />
          ) : (
            <Navigate to="/login" />
          )
        }
      >
        <Route index element={<PengasuhSummary />} />
      </Route>
    </Routes>
  );
}

export default AppWrapper;
