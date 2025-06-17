//Login.js

import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import { jwtDecode } from "jwt-decode"; // Menggunakan named import

function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("Sending login request:", { email, password });

    try {
      const data = await loginUser(email, password);
      console.log("Server response:", data);

      if (data.success && data.token) {
        // ✅ Simpan token ke localStorage
        localStorage.setItem("token", data.token);

        // Mendekode token dan ambil userId
        const decodedToken = jwtDecode(data.token); // Menggunakan jwtDecode di sini
        const userId = decodedToken.id; // Pastikan token memiliki id di payload

        // Simpan userId di localStorage
        localStorage.setItem("userId", userId);

        setUser({ role: data.role });
        navigate(`/dashboard/${data.role}`);
      } else {
        alert(data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow" style={{ width: "400px" }}>
        <div className="text-center mb-4">
          <h2 className="mt-2">Sign in to your account</h2>
        </div>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Email address</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Sign in
          </button>
          <div className="text-center mt-3">
            <a href="#" className="text-decoration-none">
              Forgot password?
            </a>
          </div>
        </form>
        <p className="text-center mt-3">
          Not a member? <a href="/register">Register here</a>
        </p>
      </div>
    </div>
  );
}

export default Login;
