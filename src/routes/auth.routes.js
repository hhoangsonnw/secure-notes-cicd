const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { db } = require("../db/database");
const { requireAuth } = require("../middleware/auth.middleware");
const {
  isValidEmail,
  isValidUsername,
  isValidPassword,
  normalizeEmail,
  normalizeUsername
} = require("../utils/validation");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!isValidUsername(username)) {
      return res.status(400).json({
        error: "Username must be between 3 and 30 characters."
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: "A valid email address is required."
      });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        error: "Password must be at least 8 characters long."
      });
    }

    const cleanUsername = normalizeUsername(username);
    const cleanEmail = normalizeEmail(email);

    const existingUser = db
      .prepare("SELECT id FROM users WHERE username = ? OR email = ?")
      .get(cleanUsername, cleanEmail);

    if (existingUser) {
      return res.status(409).json({
        error: "Username or email already exists."
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = db
      .prepare(
        "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)"
      )
      .run(cleanUsername, cleanEmail, passwordHash);

    return res.status(201).json({
      message: "User registered successfully.",
      user: {
        id: result.lastInsertRowid,
        username: cleanUsername,
        email: cleanEmail
      }
    });
  } catch {
    return res.status(500).json({
      error: "Registration failed."
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!isValidEmail(email) || typeof password !== "string") {
      return res.status(400).json({
        error: "Valid email and password are required."
      });
    }

    const cleanEmail = normalizeEmail(email);

    const user = db
      .prepare(
        "SELECT id, username, email, password_hash FROM users WHERE email = ?"
      )
      .get(cleanEmail);

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password."
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({
        error: "Invalid email or password."
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1h"
      }
    );

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch {
    return res.status(500).json({
      error: "Login failed."
    });
  }
});

router.get("/me", requireAuth, (req, res) => {
  return res.status(200).json({
    user: req.user
  });
});

module.exports = router;
