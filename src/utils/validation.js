function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUsername(username) {
  return (
    typeof username === "string" &&
    username.trim().length >= 3 &&
    username.trim().length <= 30
  );
}

function isValidPassword(password) {
  return typeof password === "string" && password.length >= 8;
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function normalizeUsername(username) {
  return username.trim();
}

function isValidNoteTitle(title) {
  return (
    typeof title === "string" &&
    title.trim().length >= 1 &&
    title.trim().length <= 100
  );
}

function isValidNoteContent(content) {
  return (
    typeof content === "string" &&
    content.trim().length >= 1 &&
    content.trim().length <= 5000
  );
}

function normalizeNoteTitle(title) {
  return title.trim();
}

function normalizeNoteContent(content) {
  return content.trim();
}

module.exports = {
  isValidEmail,
  isValidUsername,
  isValidPassword,
  normalizeEmail,
  normalizeUsername,
  isValidNoteTitle,
  isValidNoteContent,
  normalizeNoteTitle,
  normalizeNoteContent
};