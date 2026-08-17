# Insecure Notes API Demo

This application represents the initial insecure version of the Secure Notes API.

It simulates a developer's first attempt at building a notes application without secure coding guidelines. The main application in `src/` represents the remediated secure version.

## Intentional Vulnerabilities

This app intentionally includes:

- Plaintext password storage.
- Hardcoded JWT secret.
- SQL injection.
- Broken access control / IDOR.
- Missing security headers.
- No rate limiting.
- Weak input validation.
- Reflected XSS.
- Stored XSS.
- Insecure cookies.
- Verbose error disclosure.
- Debug endpoint exposing sensitive data.
- Outdated dependencies.

## Purpose

The purpose of this app is to demonstrate how CI/CD security tooling can detect insecure development patterns before code is promoted.

The secure implementation in the root `src/` directory applies remediations such as password hashing, prepared statements, authorization checks, input validation, Helmet security headers, rate limiting, safer secret handling, and automated tests.

## Guided Local Demo

Start the app locally with `npm start`, then open `http://127.0.0.1:4000/api-docs` for the interactive vulnerability catalogue. The Swagger UI includes the same named examples and seeded records as the complete [local demo guide](DEMO-GUIDE.md).

## Local Commands

```bash
npm start       # Run the local-only demo on port 4000
npm test        # Run the built-in HTTP smoke suite
npm run smoke   # Run only the smoke suite explicitly
```

The app entry point is `src/server.js`; `src/app.js` assembles the intentionally insecure routes so the smoke suite can exercise the same HTTP interface without binding port 4000.

## Warning

Do not deploy this application publicly. It is intentionally vulnerable and should only be used for local or CI/CD security testing demonstrations.
