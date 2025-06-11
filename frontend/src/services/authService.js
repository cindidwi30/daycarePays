import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

// Buat instance Axios agar lebih clean
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Register user
export const registerUser = (name, email, password) =>
  axiosInstance.post("/register", { name, email, password });

// Login user
export const loginUser = async (email, password) => {
  try {
    const response = await axiosInstance.post("/login", { email, password });
    return response.data;
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    return { success: false, message: "Login failed" };
  }
};
