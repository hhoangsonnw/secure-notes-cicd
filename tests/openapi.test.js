const request = require("supertest");
const app = require("../src/app");

describe("OpenAPI documentation", () => {
  test("GET /openapi.json should return OpenAPI specification", async () => {
    const response = await request(app).get("/openapi.json");

    expect(response.statusCode).toBe(200);
    expect(response.body.openapi).toBe("3.0.3");
    expect(response.body.info.title).toBe("Secure Notes API");
    expect(response.body.paths["/api/auth/login"]).toBeDefined();
    expect(response.body.paths["/api/notes"]).toBeDefined();
  });

  test("GET /api-docs should return Swagger UI page", async () => {
    const response = await request(app).get("/api-docs/");

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("Swagger UI");
  });
});