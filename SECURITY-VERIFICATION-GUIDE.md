# Secure Notes API: Security Verification Guide

This local-only guide is the secure counterpart to `vulnerable-demo/DEMO-GUIDE.md`. It verifies the 13 issues demonstrated by the insecure app are remediated in the secure API.

Run the secure API locally and open `http://127.0.0.1:3000/api-docs`. The **Security Verification Demos** Swagger section contains the corresponding interactive operations and examples.

## Setup

```bash
export DEMO_URL=http://127.0.0.1:3000
export RUN_ID="$(date +%s)"
export OWNER_EMAIL="owner-${RUN_ID}@example.com"
export ATTACKER_EMAIL="attacker-${RUN_ID}@example.com"

curl -fsS "$DEMO_URL/health"
```

Register and log in two disposable users. Keep their tokens for the ownership checks below.

```bash
curl -fsS -X POST "$DEMO_URL/api/auth/register" \
  -H 'Content-Type: application/json' \
  --data "{\"username\":\"owner_${RUN_ID}\",\"email\":\"${OWNER_EMAIL}\",\"password\":\"Password123\"}"

curl -fsS -X POST "$DEMO_URL/api/auth/register" \
  -H 'Content-Type: application/json' \
  --data "{\"username\":\"attacker_${RUN_ID}\",\"email\":\"${ATTACKER_EMAIL}\",\"password\":\"Password123\"}"

export OWNER_TOKEN="$(
  curl -fsS -X POST "$DEMO_URL/api/auth/login" \
    -H 'Content-Type: application/json' \
    --data "{\"email\":\"${OWNER_EMAIL}\",\"password\":\"Password123\"}" \
  | node -e 'let body = ""; process.stdin.on("data", c => { body += c; }); process.stdin.on("end", () => process.stdout.write(JSON.parse(body).token));'
)"

export ATTACKER_TOKEN="$(
  curl -fsS -X POST "$DEMO_URL/api/auth/login" \
    -H 'Content-Type: application/json' \
    --data "{\"email\":\"${ATTACKER_EMAIL}\",\"password\":\"Password123\"}" \
  | node -e 'let body = ""; process.stdin.on("data", c => { body += c; }); process.stdin.on("end", () => process.stdout.write(JSON.parse(body).token));'
)"
```

## Resolution checks

| Former issue | Verification | Expected result |
| --- | --- | --- |
| Plaintext password storage | Register a user and inspect the response. | `user` contains only `id`, `username`, and `email`; no password or hash. |
| Hardcoded JWT secret | Send an invalid bearer token to `GET /api/auth/me`. | `401` with the generic `Invalid or expired token.` message. |
| SQL injection | Submit a SQL-shaped email to login. | `401` authentication failure; no SQL bypass or query disclosure. |
| Broken access control / IDOR | Create a note as owner, then read, update, and delete it as attacker. | Each attacker request returns `404 Note not found.` |
| Missing security headers | Inspect `GET /health` headers. | Helmet headers include CSP, `X-Content-Type-Options`, and `X-Frame-Options`. |
| Missing rate limit | Make more than 100 health requests in one 15-minute window. | Excess requests return `429`. |
| Weak input validation | Register malformed input or create an empty note. | `400` validation error before database work. |
| Reflected XSS | Request the former `/search` route. | Generic `404`; no HTML search page exists. |
| Stored XSS | Create a note containing HTML, then request the former raw render route. | Note response is JSON; `/notes/:id/render` is `404`. |
| Insecure cookies | Request the former session endpoint. | `404`; the API uses bearer tokens rather than session cookies. |
| Verbose errors | Request a non-numeric note ID with a valid token. | `400 Invalid note ID.` with no database detail. |
| Debug-data exposure | Request the former debug endpoint. | Generic `404`; no secret or user dump is exposed. |
| Outdated dependencies | Run the audit command. | No high-severity or critical npm audit findings. |

### 1. Plaintext passwords and weak validation

The setup registration responses must not include `password` or `password_hash`. Then verify malformed registration is rejected:

```bash
curl -isS -X POST "$DEMO_URL/api/auth/register" \
  -H 'Content-Type: application/json' \
  --data '{"username":"","email":"not-an-email","password":"short"}'
```

Expect `HTTP/1.1 400` and a concise validation message.

### 2. Hardcoded secrets and forged tokens

The signing secret is loaded from `JWT_SECRET`, never returned by an endpoint, and an invented token has no privileged effect:

```bash
curl -isS "$DEMO_URL/api/auth/me" \
  -H 'Authorization: Bearer not-a-signed-token'
```

Expect `401` and `Invalid or expired token.` without token parsing detail or a secret.

### 3. SQL injection

This value passes the app's basic email shape check but is bound as data by the parameterized login query:

```bash
curl -isS -X POST "$DEMO_URL/api/auth/login" \
  -H 'Content-Type: application/json' \
  --data '{"email":"attacker\u0027@example.com","password":"does-not-matter"}'
```

Expect `401 Invalid email or password.` The insecure app's public `/api/users` query route is not present in the secure API.

### 4. IDOR: private notes remain private

Create a note as the owner and retain its ID:

```bash
export OWNER_NOTE_ID="$(
  curl -fsS -X POST "$DEMO_URL/api/notes" \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer $OWNER_TOKEN" \
    --data '{"title":"Private verification note","content":"Only the owner may access this."}' \
  | node -e 'let body = ""; process.stdin.on("data", c => { body += c; }); process.stdin.on("end", () => process.stdout.write(String(JSON.parse(body).note.id)));'
)"

curl -isS "$DEMO_URL/api/notes/$OWNER_NOTE_ID" \
  -H "Authorization: Bearer $ATTACKER_TOKEN"

curl -isS -X PUT "$DEMO_URL/api/notes/$OWNER_NOTE_ID" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $ATTACKER_TOKEN" \
  --data '{"title":"Blocked overwrite","content":"This change must not be applied."}'

curl -isS -X DELETE "$DEMO_URL/api/notes/$OWNER_NOTE_ID" \
  -H "Authorization: Bearer $ATTACKER_TOKEN"
```

All three requests must return `404 Note not found.` Confirm the owner can still read the note:

```bash
curl -fsS "$DEMO_URL/api/notes/$OWNER_NOTE_ID" \
  -H "Authorization: Bearer $OWNER_TOKEN"
```

### 5. Security headers and rate limiting

```bash
curl -isS "$DEMO_URL/health"

for i in $(seq 1 101); do
  curl -sS -o /dev/null -w '%{http_code}\n' "$DEMO_URL/health"
done | sort | uniq -c
```

The headers include `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, and `X-Frame-Options: SAMEORIGIN`. In a fresh rate-limit window, the request count includes `429` after the first 100 requests.

### 6. JSON-only notes and removed browser-risk routes

The secure API intentionally does not sanitize arbitrary note text for a hypothetical downstream renderer. Instead, it only returns JSON and does not expose the insecure HTML endpoints. Do not render API content with unsafe HTML APIs in a separate client.

```bash
curl -fsS -X POST "$DEMO_URL/api/notes" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  --data '{"title":"Untrusted text","content":"<script>alert(\"not-rendered-by-this-api\")</script>"}'

for route in /search /notes/1/render /api/set-session /api/debug/users /api/users; do
  curl -sS -o /dev/null -w "%{http_code} ${route}\n" "$DEMO_URL$route"
done
```

The note body is returned as JSON, not executable HTML. Every legacy route in the loop returns `404`.

### 7. Generic errors and dependency hygiene

```bash
curl -isS "$DEMO_URL/api/notes/not-a-number" \
  -H "Authorization: Bearer $OWNER_TOKEN"

npm run audit
```

The invalid ID returns `400 Invalid note ID.` rather than a database error. The audit exits successfully with zero high-severity or critical findings.

## Swagger UI mapping

The **Security Verification Demos** group is a concise interactive map:

- `GET /api/security/verification` lists all 13 resolved scenarios and their evidence.
- Registration, login, and authenticated profile operations demonstrate validation, password handling, SQL injection resistance, and token validation.
- Note creation and note-by-ID operations demonstrate validation, JSON-only behavior, and IDOR protection.
- Health demonstrates security headers and is the target for the rate-limit check.

The guide covers the multi-user and removed-route checks that cannot be shown by a single Swagger operation.
