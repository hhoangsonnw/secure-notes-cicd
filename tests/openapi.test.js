const request = require("supertest");
const app = require("../src/app");

describe("OpenAPI documentation", () => {
  test("GET /openapi.json should return OpenAPI specification", async () => {
    const response = await request(app).get("/openapi.json");

    expect(response.statusCode).toBe(200);
    expect(response.body.openapi).toBe("3.0.3");
    expect(response.body.info.title).toBe("Secure Notes API");
    expect(response.body.tags[0].name).toBe("Security Verification Demos");
    expect(response.body.paths["/api/security/verification"]).toBeDefined();
    expect(response.body.paths["/api/auth/login"]).toBeDefined();
    expect(response.body.paths["/api/notes"]).toBeDefined();
  });

  test("GET /api/security/verification should list every resolved scenario", async () => {
    const response = await request(app).get("/api/security/verification");

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("resolved");
    expect(response.body.scenarios).toHaveLength(13);
    expect(response.body.scenarios.every(({ status }) => status === "resolved")).toBe(
      true
    );
    expect(response.body.scenarios.map(({ id }) => id)).toEqual(
      expect.arrayContaining([
        "sql-injection",
        "broken-access-control",
        "stored-xss",
        "outdated-dependencies"
      ])
    );
  });

  test("GET /api-docs should return Swagger UI page", async () => {
    const response = await request(app).get("/api-docs/");

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("swagger-ui-bundle.js");
    expect(response.text).toContain("Secure Notes · API Lab");
  });

  test("GET / should return the secure landing page to browsers", async () => {
    const response = await request(app).get("/").set("Accept", "text/html");

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toContain("text/html");
    expect(response.text).toContain("Security controls active");
    expect(response.text).toContain("Security controls at a glance");
  });

  test("GET / should retain JSON API metadata for JSON clients", async () => {
    const response = await request(app)
      .get("/")
      .set("Accept", "application/json");

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      message: "Secure Notes API",
      docs: "/api-docs",
      openapi: "/openapi.json",
      health: "/health"
    });
  });

  test("Swagger UI enables the shared interactive documentation controls", async () => {
    const response = await request(app).get("/api-docs/swagger-ui-init.js");

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("\"tryItOutEnabled\": true");
    expect(response.text).toContain("\"displayRequestDuration\": true");
    expect(response.text).toContain("\"filter\": true");
  });
});
