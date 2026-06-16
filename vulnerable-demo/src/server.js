const express = require("express");
const cookieParser = require("cookie-parser");
const Database = require("better-sqlite3");

const app = express();
const port = process.env.PORT || 4000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// Intentionally no Helmet.
// Intentionally weak security headers.
// This app is only for local/CI security testing demonstration.

const db = new Database(":memory:");

db.exec(`
  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL
  );

  INSERT INTO users (username, email, role)
  VALUES
    ('admin', 'admin@example.com', 'admin'),
    ('alice', 'alice@example.com', 'user'),
    ('bob', 'bob@example.com', 'user');
`);

app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Vulnerable Demo App</title>
      </head>
      <body>
        <h1>Vulnerable Demo App</h1>
        <p>This app is intentionally vulnerable for CI/CD security testing demos only.</p>

        <ul>
          <li><a href="/health">Health check</a></li>
          <li><a href="/search?q=test">Reflected XSS demo</a></li>
          <li><a href="/profile?name=guest">Another reflected input demo</a></li>
          <li><a href="/user?id=1">SQL injection demo</a></li>
          <li><a href="/set-cookie">Insecure cookie demo</a></li>
          <li><a href="/redirect?url=https://example.com">Open redirect demo</a></li>
          <li><a href="/debug">Debug information exposure demo</a></li>
        </ul>

        <form action="/search" method="GET">
          <label>Search:</label>
          <input name="q" value="test" />
          <button type="submit">Search</button>
        </form>

        <form action="/profile" method="GET">
          <label>Name:</label>
          <input name="name" value="guest" />
          <button type="submit">View profile</button>
        </form>

        <form action="/user" method="GET">
          <label>User ID:</label>
          <input name="id" value="1" />
          <button type="submit">View user</button>
        </form>
      </body>
    </html>
  `);
});

app.get("/health", (req, res) => {
  res.json({
    status: "running",
    service: "vulnerable-demo-app"
  });
});

app.get("/search", (req, res) => {
  const query = req.query.q || "";

  // Vulnerability: reflected XSS.
  // User input is inserted directly into HTML without escaping.
  res.send(`
    <html>
      <body>
        <h1>Search Results</h1>
        <p>You searched for: ${query}</p>
        <a href="/">Back</a>
      </body>
    </html>
  `);
});

app.get("/profile", (req, res) => {
  const name = req.query.name || "guest";

  // Vulnerability: reflected XSS.
  res.send(`
    <html>
      <body>
        <h1>Profile page</h1>
        <p>Hello, ${name}</p>
        <a href="/">Back</a>
      </body>
    </html>
  `);
});

app.get("/user", (req, res) => {
  const id = req.query.id || "1";

  try {
    // Vulnerability: SQL injection.
    // User input is concatenated directly into the SQL query.
    const query = `SELECT id, username, email, role FROM users WHERE id = ${id}`;
    const rows = db.prepare(query).all();

    res.json({
      query,
      results: rows
    });
  } catch (error) {
    // Vulnerability: verbose error disclosure.
    res.status(500).send(`
      <html>
        <body>
          <h1>Database Error</h1>
          <pre>${error.message}</pre>
          <a href="/">Back</a>
        </body>
      </html>
    `);
  }
});

app.get("/set-cookie", (req, res) => {
  // Vulnerability: cookie is missing Secure, HttpOnly, and SameSite flags.
  res.cookie("demo_session", "insecure-demo-session");
  res.send(`
    <html>
      <body>
        <h1>Cookie Set</h1>
        <p>An intentionally insecure cookie was set.</p>
        <a href="/">Back</a>
      </body>
    </html>
  `);
});

app.get("/redirect", (req, res) => {
  const target = req.query.url || "/";

  // Vulnerability: open redirect.
  res.redirect(target);
});

app.get("/debug", (req, res) => {
  // Vulnerability: unnecessary debug information exposure.
  res.json({
    app: "vulnerable-demo",
    nodeVersion: process.version,
    platform: process.platform,
    environment: process.env.NODE_ENV || "development",
    message: "This endpoint intentionally exposes debug information."
  });
});

app.listen(port, () => {
  console.log(`Vulnerable demo app is running on port ${port}`);
});