const express = require("express");

const { db } = require("../db/database");
const { requireAuth } = require("../middleware/auth.middleware");
const {
  isValidNoteTitle,
  isValidNoteContent,
  normalizeNoteTitle,
  normalizeNoteContent
} = require("../utils/validation");

const router = express.Router();

router.use(requireAuth);

function parseNoteId(id) {
  const noteId = Number(id);

  if (!Number.isInteger(noteId) || noteId <= 0) {
    return null;
  }

  return noteId;
}

router.post("/", (req, res) => {
  const { title, content } = req.body;

  if (!isValidNoteTitle(title)) {
    return res.status(400).json({
      error: "Note title is required and must be 100 characters or fewer."
    });
  }

  if (!isValidNoteContent(content)) {
    return res.status(400).json({
      error: "Note content is required and must be 5000 characters or fewer."
    });
  }

  const cleanTitle = normalizeNoteTitle(title);
  const cleanContent = normalizeNoteContent(content);

  const result = db
    .prepare(
      `
      INSERT INTO notes (user_id, title, content)
      VALUES (?, ?, ?)
      `
    )
    .run(req.user.id, cleanTitle, cleanContent);

  const note = db
    .prepare(
      `
      SELECT id, user_id, title, content, created_at, updated_at
      FROM notes
      WHERE id = ? AND user_id = ?
      `
    )
    .get(result.lastInsertRowid, req.user.id);

  return res.status(201).json({
    message: "Note created successfully.",
    note
  });
});

router.get("/", (req, res) => {
  const notes = db
    .prepare(
      `
      SELECT id, title, content, created_at, updated_at
      FROM notes
      WHERE user_id = ?
      ORDER BY created_at DESC
      `
    )
    .all(req.user.id);

  return res.status(200).json({
    notes
  });
});

router.get("/:id", (req, res) => {
  const noteId = parseNoteId(req.params.id);

  if (!noteId) {
    return res.status(400).json({
      error: "Invalid note ID."
    });
  }

  const note = db
    .prepare(
      `
      SELECT id, title, content, created_at, updated_at
      FROM notes
      WHERE id = ? AND user_id = ?
      `
    )
    .get(noteId, req.user.id);

  if (!note) {
    return res.status(404).json({
      error: "Note not found."
    });
  }

  return res.status(200).json({
    note
  });
});

router.put("/:id", (req, res) => {
  const noteId = parseNoteId(req.params.id);

  if (!noteId) {
    return res.status(400).json({
      error: "Invalid note ID."
    });
  }

  const { title, content } = req.body;

  if (!isValidNoteTitle(title)) {
    return res.status(400).json({
      error: "Note title is required and must be 100 characters or fewer."
    });
  }

  if (!isValidNoteContent(content)) {
    return res.status(400).json({
      error: "Note content is required and must be 5000 characters or fewer."
    });
  }

  const cleanTitle = normalizeNoteTitle(title);
  const cleanContent = normalizeNoteContent(content);

  const result = db
    .prepare(
      `
      UPDATE notes
      SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
      `
    )
    .run(cleanTitle, cleanContent, noteId, req.user.id);

  if (result.changes === 0) {
    return res.status(404).json({
      error: "Note not found."
    });
  }

  const updatedNote = db
    .prepare(
      `
      SELECT id, title, content, created_at, updated_at
      FROM notes
      WHERE id = ? AND user_id = ?
      `
    )
    .get(noteId, req.user.id);

  return res.status(200).json({
    message: "Note updated successfully.",
    note: updatedNote
  });
});

router.delete("/:id", (req, res) => {
  const noteId = parseNoteId(req.params.id);

  if (!noteId) {
    return res.status(400).json({
      error: "Invalid note ID."
    });
  }

  const result = db
    .prepare(
      `
      DELETE FROM notes
      WHERE id = ? AND user_id = ?
      `
    )
    .run(noteId, req.user.id);

  if (result.changes === 0) {
    return res.status(404).json({
      error: "Note not found."
    });
  }

  return res.status(200).json({
    message: "Note deleted successfully."
  });
});

module.exports = router;