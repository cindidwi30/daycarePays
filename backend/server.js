// server.js

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const authRoutes = require("./routes/authRoutes");
const biodataRoutes = require("./routes/biodataRoutes");
const paketRoutes = require("./routes/paketRoutes");
const userRoutes = require("./routes/userRoutes");
const absensiRoutes = require("./routes/absensiRoutes");
const anakRoutes = require("./routes/anakRoutes");
const pembelianRoutes = require("./routes/pembelianRoutes");
const pengasuhRoutes = require("./routes/pengasuhRoutes");
const midtransRoutes = require("./routes/midtrans");

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
app.get("/", (req, res) => {
  res.send("🟢 API is running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/biodata", biodataRoutes); // Ubah path jadi lebih spesifik
app.use("/api/admin/user", userRoutes);
app.use("/api/admin/paket", paketRoutes);
app.use("/api/pembelian", pembelianRoutes);
app.use("/api/absensi", absensiRoutes);
app.use("/api/anak", anakRoutes);
app.use("/api/pengasuh", pengasuhRoutes);
app.use("/api/midtrans", midtransRoutes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    message: "🔍 Endpoint tidak ditemukan",
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Terjadi kesalahan pada server",
    error: process.env.NODE_ENV === "development" ? err.stack : {},
  });
});

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`)
);
