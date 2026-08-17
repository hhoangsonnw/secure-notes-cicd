const securityVerificationScenarios = [
  {
    id: "plaintext-password-storage",
    status: "resolved",
    evidence: "Passwords are bcrypt hashes in storage and are excluded from API responses.",
    interactiveCheck: "POST /api/auth/register"
  },
  {
    id: "hardcoded-jwt-secret",
    status: "resolved",
    evidence: "JWT signing uses the JWT_SECRET environment variable; invalid tokens return a generic 401 response.",
    interactiveCheck: "GET /api/auth/me"
  },
  {
    id: "sql-injection",
    status: "resolved",
    evidence: "Authentication and note queries use parameterized SQL statements.",
    interactiveCheck: "POST /api/auth/login"
  },
  {
    id: "broken-access-control",
    status: "resolved",
    evidence: "Note reads and mutations include the authenticated user's ID in their database queries.",
    interactiveCheck: "GET, PUT, DELETE /api/notes/{id}"
  },
  {
    id: "missing-security-headers",
    status: "resolved",
    evidence: "Helmet applies security headers, including CSP, X-Content-Type-Options, and X-Frame-Options.",
    interactiveCheck: "GET /health"
  },
  {
    id: "missing-rate-limiting",
    status: "resolved",
    evidence: "The API limits requests to 100 per 15-minute window.",
    interactiveCheck: "GET /health"
  },
  {
    id: "weak-input-validation",
    status: "resolved",
    evidence: "Registration and note input are validated before any database operation.",
    interactiveCheck: "POST /api/auth/register and POST /api/notes"
  },
  {
    id: "reflected-xss",
    status: "resolved",
    evidence: "The secure API has no HTML search-rendering endpoint and returns API data as JSON.",
    interactiveCheck: "GET /search returns 404"
  },
  {
    id: "stored-xss",
    status: "resolved",
    evidence: "The secure API has no raw HTML note-rendering endpoint; note data is returned as JSON only.",
    interactiveCheck: "GET /notes/{id}/render returns 404"
  },
  {
    id: "insecure-cookies",
    status: "resolved",
    evidence: "The API uses bearer tokens and exposes no session-cookie endpoint.",
    interactiveCheck: "GET /api/set-session returns 404"
  },
  {
    id: "verbose-error-disclosure",
    status: "resolved",
    evidence: "Client responses use generic validation, authentication, not-found, and internal-error messages.",
    interactiveCheck: "GET /api/notes/not-a-number"
  },
  {
    id: "debug-data-exposure",
    status: "resolved",
    evidence: "No unauthenticated debug user or secret dump route is exposed.",
    interactiveCheck: "GET /api/debug/users returns 404"
  },
  {
    id: "outdated-dependencies",
    status: "resolved",
    evidence: "The production and development dependency tree has no npm audit findings at high severity or above.",
    interactiveCheck: "npm run audit"
  }
];

module.exports = {
  securityVerificationScenarios
};
