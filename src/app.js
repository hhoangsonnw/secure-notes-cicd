const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");

const authRoutes = require("./routes/auth.routes");
const notesRoutes = require("./routes/notes.routes");
const openapiSpec = require("./docs/openapi");

const { initializeDatabase } = require("./db/database");

const app = express();

initializeDatabase();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"]
      }
    }
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: "Too many requests. Please try again later."
  }
});

app.use(limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.json({
    message: "Secure Notes API",
    docs: "/api-docs",
    openapi: "/openapi.json",
    health: "/health"
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "secure-notes-api"
  });
});

app.get("/openapi.json", (req, res) => {
  res.json(openapiSpec);
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));

app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found."
  });
});

app.use((error, req, res, next) => {
  void next;

  console.error(error);

  res.status(500).json({
    error: "Internal server error."
  });
});

module.exports = app;