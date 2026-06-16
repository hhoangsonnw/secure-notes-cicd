const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const { initializeDatabase } = require("./db/database");
const authRoutes = require("./routes/auth.routes");

initializeDatabase();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: "Too many requests. Please try again later."
  }
});

app.use(apiLimiter);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Secure Notes API",
    status: "running"
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "secure-notes-api"
  });
});

app.use("/api/auth", authRoutes);

module.exports = app;
