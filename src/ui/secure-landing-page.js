function renderSecureLandingPage() {
  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Secure Notes API</title>
        <style>
          :root {
            color-scheme: dark;
            --canvas: #0b1019;
            --panel: #141d2d;
            --panel-soft: #1b2638;
            --border: #2a3a54;
            --text: #eef2f8;
            --muted: #aab7ca;
            --secure: #54d17c;
            --secure-soft: #b7f5c8;
            --accent: var(--secure);
            --link: #84adff;
          }

          html { background: var(--canvas); }
          * { box-sizing: border-box; }

          body {
            background:
              radial-gradient(circle at top left, #173d35 0, transparent 42rem),
              linear-gradient(180deg, #101a29 0, var(--canvas) 46rem);
            color: var(--text);
            font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            line-height: 1.5;
            margin: 0;
            min-height: 100vh;
            -moz-osx-font-smoothing: grayscale;
            -webkit-font-smoothing: antialiased;
            text-rendering: optimizeLegibility;
          }

          a { color: var(--link); text-decoration-thickness: 1.5px; text-underline-offset: 2px; }
          a:hover { color: var(--accent); }
          a:focus-visible, button:focus-visible {
            outline: 3px solid var(--secure);
            outline-offset: 3px;
          }

          .shell { margin: 0 auto; max-width: 1160px; padding: clamp(28px, 4vw, 44px) clamp(18px, 3vw, 32px) clamp(52px, 7vw, 72px); }

          .eyebrow {
            color: var(--secure);
            font-size: .78rem;
            font-weight: 800;
            letter-spacing: .12em;
            line-height: 1.2;
            margin: 0 0 12px;
            text-transform: uppercase;
          }

          .hero {
            align-items: end;
            display: grid;
            gap: clamp(24px, 3vw, 36px);
            grid-template-columns: minmax(0, 1.35fr) minmax(250px, .65fr);
            margin: clamp(32px, 4vw, 48px) 0 30px;
          }

          h1 { font-size: clamp(2.6rem, 7vw, 4.9rem); letter-spacing: -.055em; line-height: .98; margin: 0; }
          h2 { font-size: 1.25rem; letter-spacing: -.02em; line-height: 1.22; margin: 0; }
          p { margin: 0; }
          code { background: #081018; border-radius: 5px; color: #9ad8ff; padding: .13rem .33rem; }

          .lead { color: var(--muted); font-size: 1.08rem; line-height: 1.62; margin-top: 18px; max-width: 43rem; }

          .status-card, .card, .tool, .notice {
            background: var(--panel);
            background: color-mix(in srgb, var(--panel) 92%, transparent);
            border: 1px solid var(--border);
            border-radius: 16px;
          }

          .status-card { box-shadow: 0 18px 44px rgba(0, 0, 0, .16); overflow: hidden; padding: 21px; position: relative; }
          .status-card::before { background: linear-gradient(90deg, var(--accent), transparent); content: ""; height: 3px; left: 0; position: absolute; right: 0; top: 0; }
          .status-label { color: var(--muted); font-size: .82rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
          .status-value { color: var(--secure); font-size: 1.25rem; font-weight: 800; margin-top: 6px; }
          .status-card p:last-child { color: var(--muted); font-size: .9rem; margin-top: 8px; }

          .notice {
            align-items: flex-start;
            border-color: rgba(84, 209, 124, .48);
            display: flex;
            gap: 13px;
            margin: 26px 0 38px;
            padding: 17px 19px;
          }

          .notice strong { color: var(--secure-soft); display: block; margin-bottom: 3px; }
          .notice p { color: var(--muted); font-size: .95rem; }
          .notice-mark { color: var(--secure); font-size: 1.25rem; line-height: 1.15; }

          .actions { display: flex; flex-wrap: wrap; gap: 12px; margin: 27px 0 0; }
          .button {
            align-items: center;
            border: 1px solid transparent;
            border-radius: 9px;
            display: inline-flex;
            font-weight: 750;
            justify-content: center;
            line-height: 1.15;
            min-height: 44px;
            padding: 11px 15px;
            text-decoration: none;
            transition: background-color .18s ease, border-color .18s ease, color .18s ease, transform .18s ease;
          }
          .button-primary { background: var(--secure); color: #06250f; }
          .button-primary:hover { background: #79e49a; color: #06250f; }
          .button-secondary { border-color: var(--border); color: var(--text); }
          .button-secondary:hover { background: var(--panel-soft); color: var(--text); }

          .section-head { align-items: baseline; display: flex; justify-content: space-between; gap: 18px; margin: clamp(40px, 5vw, 56px) 0 16px; }
          .section-head p { color: var(--muted); font-size: .92rem; line-height: 1.5; max-width: 37rem; text-align: right; }

          .grid { display: grid; gap: 16px; grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .card { display: flex; flex-direction: column; min-height: 178px; padding: 20px; }
          .card span { color: var(--secure); display: block; font-size: .76rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
          .card h3 { font-size: 1.06rem; letter-spacing: -.012em; line-height: 1.25; margin: 8px 0 7px; }
          .card p { color: var(--muted); font-size: .91rem; line-height: 1.55; }
          .card a { display: inline-block; font-size: .9rem; font-weight: 700; margin-top: auto; padding-top: 16px; }

          .tools { display: grid; gap: 16px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .tool { display: flex; flex-direction: column; min-height: 220px; padding: 20px; }
          .tool p { color: var(--muted); font-size: .92rem; margin: 7px 0 14px; }
          .steps { color: var(--muted); margin: 0; padding-left: 1.25rem; }
          .steps li + li { margin-top: 8px; }
          .tool .button { align-self: flex-start; margin-top: auto; }

          footer { border-top: 1px solid var(--border); color: var(--muted); font-size: .88rem; line-height: 1.55; margin-top: 52px; padding-top: 22px; }

          @media (hover: hover) {
            .card, .tool { transition: border-color .18s ease, box-shadow .18s ease, transform .18s ease; }
            .card:hover, .tool:hover { border-color: color-mix(in srgb, var(--accent) 50%, var(--border)); box-shadow: 0 14px 30px rgba(0, 0, 0, .16); transform: translateY(-2px); }
            .button:hover { transform: translateY(-1px); }
          }

          @media (max-width: 980px) {
            .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          }

          @media (max-width: 920px) {
            .hero { grid-template-columns: 1fr; }
          }

          @media (max-width: 760px) {
            .tools { grid-template-columns: 1fr; }
            .grid { grid-template-columns: 1fr; }
            .section-head { align-items: flex-start; flex-direction: column; gap: 4px; }
            .section-head p { text-align: left; }
          }

          @media (max-width: 560px) {
            .actions { gap: 10px; }
            .actions .button { width: 100%; }
            .notice { gap: 11px; }
          }
        </style>
      </head>
      <body>
        <main class="shell">
          <p class="eyebrow">Security-focused API environment</p>
          <section class="hero" aria-labelledby="page-title">
            <div>
              <h1 id="page-title">Secure<br />Notes API</h1>
              <p class="lead">A protected notes service that pairs strong authentication and ownership controls with a transparent, interactive API workflow.</p>
              <div class="actions">
                <a class="button button-primary" href="/api-docs">Open interactive API docs</a>
                <a class="button button-secondary" href="/api/security/verification">See 13 resolved checks</a>
                <a class="button button-secondary" href="/openapi.json">View OpenAPI JSON</a>
              </div>
            </div>
            <aside class="status-card" aria-label="API security status">
              <p class="status-label">Environment status</p>
              <p class="status-value">Security controls active</p>
              <p>13 resolved checks across nine runnable verification flows</p>
            </aside>
          </section>

          <section class="notice" aria-label="Security summary">
            <span class="notice-mark" aria-hidden="true">✓</span>
            <div>
              <strong>Built for private notes.</strong>
              <p>Passwords are hashed, requests are validated, and note access is scoped to the authenticated owner.</p>
            </div>
          </section>

          <section aria-labelledby="controls-title">
            <div class="section-head">
              <h2 id="controls-title">Security controls at a glance</h2>
              <p>Explore the implementation through the API documentation.</p>
            </div>
            <div class="grid">
              <article class="card">
                <span>Authentication</span>
                <h3>Hashed passwords</h3>
                <p>Credentials are protected with bcrypt before they reach the database.</p>
                <a href="/api-docs">Review auth flow →</a>
              </article>
              <article class="card">
                <span>Authorization</span>
                <h3>Private note ownership</h3>
                <p>Every note lookup and mutation is scoped to the authenticated user.</p>
                <a href="/api-docs">Review notes flow →</a>
              </article>
              <article class="card">
                <span>Input safety</span>
                <h3>Validated requests</h3>
                <p>Registration and note payloads are checked before database operations run.</p>
                <a href="/api-docs">Review request schemas →</a>
              </article>
              <article class="card">
                <span>HTTP posture</span>
                <h3>Security headers</h3>
                <p>Helmet applies a baseline of protective HTTP headers to API responses.</p>
                <a href="/health">Inspect health response →</a>
              </article>
              <article class="card">
                <span>Abuse protection</span>
                <h3>Rate limited</h3>
                <p>Requests are throttled to limit repeated automated attempts.</p>
                <a href="/api-docs">Explore endpoints →</a>
              </article>
              <article class="card">
                <span>Delivery</span>
                <h3>CI/CD ready</h3>
                <p>Automated tests, security scans, Docker checks, and staging simulation are included.</p>
                <a href="/health">Check service health →</a>
              </article>
            </div>
          </section>

          <section aria-labelledby="workflow-title">
            <div class="section-head">
              <h2 id="workflow-title">Quick secure workflow</h2>
              <p>Use Swagger UI to complete the full authenticated request cycle.</p>
            </div>
            <div class="tools">
              <section class="tool" aria-labelledby="start-title">
                <h2 id="start-title">Create an account and sign in</h2>
                <p>Registration validates the request; login returns a short-lived bearer token.</p>
                <ol class="steps">
                  <li>Run <code>POST /api/auth/register</code>.</li>
                  <li>Run <code>POST /api/auth/login</code>.</li>
                  <li>Use <strong>Authorize</strong> to set the token.</li>
                </ol>
                <a class="button button-secondary" href="/api-docs">Open authentication workflow</a>
              </section>
              <section class="tool" aria-labelledby="notes-title">
                <h2 id="notes-title">Manage your own notes</h2>
                <p>Create, list, update, and delete notes after authorizing your request.</p>
                <a class="button button-secondary" href="/api-docs">Open notes workflow</a>
              </section>
            </div>
          </section>

          <footer>
            Use the <a href="/api-docs">interactive API documentation</a> and the repository's <code>SECURITY-VERIFICATION-GUIDE.md</code> to test the secure request flow on this local environment.
          </footer>
        </main>
      </body>
    </html>
  `;
}

module.exports = {
  renderSecureLandingPage
};
