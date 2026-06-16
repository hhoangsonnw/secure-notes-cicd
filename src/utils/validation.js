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

module.exports = {
  isValidEmail,
  isValidUsername,
  isValidPassword,
  normalizeEmail,
  normalizeUsername
};
