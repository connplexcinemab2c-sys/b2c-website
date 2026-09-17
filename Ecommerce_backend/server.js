require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");
const connectDB = require("./src/config/db");
const adminRoutes = require("./src/routes/adminRoutes");

const app = express();
const PORT = process.env.PORT || 3067;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(morgan("dev"));

// Serve static uploaded files
const uploadDir = path.join(__dirname, "uploads");
app.use("/api/uploads", express.static(uploadDir));
app.use("/uploads", express.static(uploadDir));

// Health check endpoints
app.get("/", (req, res) => {
  res.json({
    status: 200,
    service: "Connplex Ecommerce API",
    statusText: "running",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (req, res) => {
  res.json({ status: 200, message: "Ecommerce API is healthy" });
});

// Mount admin and storefront routes on multiple prefixes for reverse-proxy compatibility
app.use("/api/admin", adminRoutes);
app.use("/admin", adminRoutes);
app.use("/api", adminRoutes);
app.use("/", adminRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("[Ecommerce Error]", err.stack || err);
  res.status(err.status || 500).json({
    status: err.status || 500,
    message: err.message || "Internal Server Error",
  });
});

// Start Server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`=========================================`);
  console.log(`Connplex Ecommerce Backend Service`);
  console.log(`Listening on http://0.0.0.0:${PORT}`);
  console.log(`Uploads served at: /api/uploads`);
  console.log(`Admin routes mounted at: /api/admin & /admin`);
  console.log(`=========================================`);
});
