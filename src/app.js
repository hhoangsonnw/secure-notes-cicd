const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");

const { initializeDatabase } = require("./db/database");
const openapiSpec = require("./docs/openapi");
const swaggerUiOptions = require("./docs/swagger-ui-options");
const authRoutes = require("./routes/auth.routes");
const notesRoutes = require("./routes/notes.routes");
const { renderSecureLandingPage } = require("./ui/secure-landing-page");
const { securityVerificationScenarios } = require("./verification/scenarios");

const app = express();
const apiIndex = Object.freeze({
  message: "Secure Notes API",
  docs: "/api-docs",
  openapi: "/openapi.json",
  health: "/health"
});

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

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
      error: "Too many requests. Please try again later."
    }
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  if (req.get("accept")?.includes("application/json")) {
    return res.json(apiIndex);
  }

  return res.type("html").send(renderSecureLandingPage());
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "secure-notes-api"
  });
});

app.get("/api/security/verification", (req, res) => {
  res.json({
    status: "resolved",
    service: "secure-notes-api",
    scenarios: securityVerificationScenarios
  });
});

app.get("/openapi.json", (req, res) => {
  res.json(openapiSpec);
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapiSpec, swaggerUiOptions));
app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found."
  });
});

app.use((error, req, res, next) => {
  void req;
  void next;

  console.error(error);

  res.status(500).json({
    error: "Internal server error."
  });
});

module.exports = app;
