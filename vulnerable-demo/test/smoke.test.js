const assert = require("node:assert/strict");
const http = require("node:http");
const { after, before, test } = require("node:test");

const inheritedDbFile = process.env.DB_FILE;
process.env.DB_FILE = ":memory:";
const app = require("../src/app");

if (inheritedDbFile === undefined) {
  delete process.env.DB_FILE;
} else {
  process.env.DB_FILE = inheritedDbFile;
}

let server;
let baseUrl;

before(async () => {
  server = http.createServer(app);

  await new Promise((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });

  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("serves the health response from the public HTTP interface", async () => {
  const response = await fetch(`${baseUrl}/health`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    status: "running",
    service: "insecure-notes-demo",
    docs: "/api-docs",
    openapi: "/openapi.json"
  });
});

test("serves the local-only landing page", async () => {
  const response = await fetch(`${baseUrl}/`);
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /Insecure(?:<br \/>)?Notes API/);
  assert.match(html, /vulnerable-demo\/DEMO-GUIDE\.md/);
});

test("serves the documented OpenAPI catalogue and Swagger UI", async () => {
  const specResponse = await fetch(`${baseUrl}/openapi.json`);

  assert.equal(specResponse.status, 200);
  const spec = await specResponse.json();
  assert.equal(spec.info.title, "Insecure Notes API Demo");
  assert.ok(spec.paths["/api/debug/users"]);

  const docsResponse = await fetch(`${baseUrl}/api-docs/`);
  const docsHtml = await docsResponse.text();

  assert.equal(docsResponse.status, 200);
  assert.match(docsHtml, /Insecure Notes · API Lab/);
  assert.match(docsHtml, /swagger-ui-bundle\.js/);
});

test("retains the explicit unauthenticated debug-data demonstration", async () => {
  const response = await fetch(`${baseUrl}/api/debug/users`);
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.users.length, 3);
  assert.equal(payload.jwtSecret, "dev-notes-hardcoded-secret-12345");
});
