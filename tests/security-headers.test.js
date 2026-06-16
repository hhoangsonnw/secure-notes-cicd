const request = require("supertest");
const app = require("../src/app");

describe("Security headers", () => {
  test("GET /health should include basic security headers", async () => {
    const response = await request(app).get("/health");

    expect(response.statusCode).toBe(200);
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["x-frame-options"]).toBe("SAMEORIGIN");
    expect(response.headers["content-security-policy"]).toBeDefined();
  });
});