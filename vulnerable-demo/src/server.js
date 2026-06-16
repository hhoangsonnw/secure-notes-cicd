const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const Database = require("better-sqlite3");

const app = express();
const port = process.env.PORT || 4000;

// Intentionally hardcoded secret.
// This represents a developer's first insecure implementation.
const HARDCODED_JWT_SECRET = "dev-notes-hardcoded-secret-12345";

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// Intentionally missing Helmet.
// Intentionally missing rate limiting.
// Intentionally weak input validation.

const db = new Database(process.env.DB_FILE || ":memory:");

db.exec(`
  DROP TABLE IF EXISTS notes;
  DROP TABLE IF EXISTS users;

  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user'
  );

  CREATE TABLE notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  INSERT INTO users (username, email, password, role)
  VALUES
    ('admin', 'admin@example.com', 'admin123', 'admin'),
    ('alice', 'alice@example.com', 'Password123', 'user'),
    ('bob', 'bob@example.com', 'Password123', 'user');

  INSERT INTO notes (user_id, title, content)
  VALUES
    (1, 'Admin private note', 'This should not be visible to normal users.'),
    (2, 'Alice note', 'Alice private note.'),
    (2, 'Stored XSS note', '<script>alert("stored-xss")</script>');
`);

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    },
    HARDCODED_JWT_SECRET,
    { expiresIn: "1h" }
  );
}

function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Missing token." });
    }

    const payload = jwt.verify(token, HARDCODED_JWT_SECRET);
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({
      error: "Invalid token.",
      details: error.message
    });
  }
}

app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Insecure Notes API Demo</title>
      </head>
      <body>
        <h1>Insecure Notes API Demo</h1>
        <p>This is the initial insecure version of the Notes app.</p>
        <p>It intentionally represents a developer's first attempt before secure coding guidelines were applied.</p>

        <h2>Demo links</h2>
        <ul>
          <li><a href="/health">Health check</a></li>
          <li><a href="/search?q=test">Unsafe note search</a></li>
          <li><a href="/search?q=%3Cscript%3Ealert('xss')%3C/script%3E">Reflected XSS example</a></li>
          <li><a href="/api/users?id=1">Unsafe user lookup</a></li>
          <li><a href="/api/users?id=1%20OR%201=1">SQL injection example</a></li>
          <li><a href="/notes/3/render">Stored XSS note render</a></li>
          <li><a href="/api/set-session">Insecure cookie example</a></li>
          <li><a href="/api/debug/users">Debug user dump</a></li>
        </ul>

        <h2>Search Notes</h2>
        <form action="/search" method="GET">
          <input name="q" value="test" />
          <button type="submit">Search</button>
        </form>

        <h2>User Lookup</h2>
        <form action="/api/users" method="GET">
          <input name="id" value="1" />
          <button type="submit">Lookup</button>
        </form>
      </body>
    </html>
  `);
});

app.get("/health", (req, res) => {
  res.json({
    status: "running",
    service: "insecure-notes-demo"
  });
});

app.post("/api/auth/register", (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Vulnerability: SQL injection risk.
    // Vulnerability: plaintext password storage.
    // Vulnerability: weak validation.
    const sql = `
      INSERT INTO users (username, email, password, role)
      VALUES ('${username}', '${email}', '${password}', 'user')
    `;

    const result = db.prepare(sql).run();

    res.status(201).json({
      message: "User registered.",
      user: {
        id: result.lastInsertRowid,
        username,
        email,
        password
      }
    });
  } catch (error) {
    // Vulnerability: verbose error disclosure.
    res.status(500).json({
      error: "Database error during registration.",
      details: error.message
    });
  }
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  try {
    // Vulnerability: SQL injection login query.
    // Vulnerability: plaintext password comparison.
    const sql = `
      SELECT id, username, email, password, role
      FROM users
      WHERE email = '${email}' AND password = '${password}'
    `;

    const user = db.prepare(sql).get();

    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials."
      });
    }

    const token = signToken(user);

    return res.json({
      message: "Login successful.",
      token,
      user
    });
  } catch (error) {
    return res.status(500).json({
      error: "Database error during login.",
      details: error.message
    });
  }
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({
    user: req.user
  });
});

app.get("/api/users", (req, res) => {
  const id = req.query.id || "1";

  try {
    // Vulnerability: SQL injection.
    const sql = `SELECT id, username, email, role FROM users WHERE id = ${id}`;
    const users = db.prepare(sql).all();

    res.json({
      query: sql,
      users
    });
  } catch (error) {
    // Vulnerability: verbose SQL/database error disclosure.
    res.status(500).json({
      error: "Database error in user lookup.",
      query: `SELECT id, username, email, role FROM users WHERE id = ${id}`,
      details: error.message
    });
  }
});

app.post("/api/notes", requireAuth, (req, res) => {
  const { title, content } = req.body;

  try {
    // Vulnerability: SQL injection risk.
    // Vulnerability: no input validation.
    const sql = `
      INSERT INTO notes (user_id, title, content)
      VALUES (${req.user.id}, '${title}', '${content}')
    `;

    const result = db.prepare(sql).run();

    res.status(201).json({
      message: "Note created.",
      note: {
        id: result.lastInsertRowid,
        user_id: req.user.id,
        title,
        content
      }
    });
  } catch (error) {
    res.status(500).json({
      error: "Database error while creating note.",
      details: error.message
    });
  }
});

app.get("/api/notes", requireAuth, (req, res) => {
  try {
    const sql = `SELECT * FROM notes WHERE user_id = ${req.user.id}`;
    const notes = db.prepare(sql).all();

    res.json({
      notes
    });
  } catch (error) {
    res.status(500).json({
      error: "Database error while listing notes.",
      details: error.message
    });
  }
});

app.get("/api/notes/:id", requireAuth, (req, res) => {
  const noteId = req.params.id;

  try {
    // Vulnerability: IDOR / broken access control.
    // Missing condition: AND user_id = current_user_id.
    const sql = `SELECT * FROM notes WHERE id = ${noteId}`;
    const note = db.prepare(sql).get();

    if (!note) {
      return res.status(404).json({
        error: "Note not found."
      });
    }

    return res.json({
      note
    });
  } catch (error) {
    return res.status(500).json({
      error: "Database error while reading note.",
      details: error.message
    });
  }
});

app.put("/api/notes/:id", requireAuth, (req, res) => {
  const noteId = req.params.id;
  const { title, content } = req.body;

  try {
    // Vulnerability: IDOR / broken access control.
    // Any authenticated user can update any note.
    const sql = `
      UPDATE notes
      SET title = '${title}', content = '${content}'
      WHERE id = ${noteId}
    `;

    db.prepare(sql).run();

    const updatedNote = db.prepare(`SELECT * FROM notes WHERE id = ${noteId}`).get();

    return res.json({
      message: "Note updated.",
      note: updatedNote
    });
  } catch (error) {
    return res.status(500).json({
      error: "Database error while updating note.",
      details: error.message
    });
  }
});

app.delete("/api/notes/:id", requireAuth, (req, res) => {
  const noteId = req.params.id;

  try {
    // Vulnerability: IDOR / broken access control.
    // Any authenticated user can delete any note.
    const sql = `DELETE FROM notes WHERE id = ${noteId}`;
    db.prepare(sql).run();

    return res.json({
      message: "Note deleted."
    });
  } catch (error) {
    return res.status(500).json({
      error: "Database error while deleting note.",
      details: error.message
    });
  }
});

app.get("/notes/:id/render", (req, res) => {
  const noteId = req.params.id;

  try {
    const sql = `SELECT * FROM notes WHERE id = ${noteId}`;
    const note = db.prepare(sql).get();

    if (!note) {
      return res.status(404).send("Note not found.");
    }

    // Vulnerability: stored XSS.
    // User-controlled title/content is rendered directly as HTML.
    return res.send(`
      <html>
        <head>
          <title>${note.title}</title>
        </head>
        <body>
          <h1>${note.title}</h1>
          <div>${note.content}</div>
          <a href="/">Back</a>
        </body>
      </html>
    `);
  } catch (error) {
    return res.status(500).send(`
      <h1>Database Error</h1>
      <pre>${error.message}</pre>
    `);
  }
});

app.get("/search", (req, res) => {
  const query = req.query.q || "";

  // Vulnerability: reflected XSS.
  res.send(`
    <html>
      <body>
        <h1>Search Notes</h1>
        <p>You searched for: ${query}</p>
        <a href="/">Back</a>
      </body>
    </html>
  `);
});

app.get("/api/set-session", (req, res) => {
  // Vulnerability: insecure cookie.
  // Missing Secure, HttpOnly, and SameSite.
  res.cookie("demo_session", "insecure-demo-session");

  res.json({
    message: "Insecure session cookie set."
  });
});

app.get("/api/debug/users", (req, res) => {
  // Vulnerability: debug endpoint exposing sensitive data.
  const users = db.prepare("SELECT id, username, email, password, role FROM users").all();

  res.json({
    warning: "This endpoint intentionally exposes plaintext passwords.",
    users,
    jwtSecret: HARDCODED_JWT_SECRET
  });
});

app.listen(port, () => {
  console.log(`Insecure Notes demo app is running on port ${port}`);
});