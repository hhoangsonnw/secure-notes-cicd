process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret";
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
process.env.DB_FILE = process.env.DB_FILE || "./data/test_secure_notes.sqlite";

const request = require("supertest");
const app = require("../src/app");

describe("Authentication endpoints", () => {
  const testUser = {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: "Password123"
  };

  test("POST /api/auth/register should create a new user", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send(testUser);

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe("User registered successfully.");
    expect(response.body.user.email).toBe(testUser.email);
    expect(response.body.user.password).toBeUndefined();
    expect(response.body.user.password_hash).toBeUndefined();
  });

  test("POST /api/auth/login should return a JWT token", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Login successful.");
    expect(response.body.token).toBeDefined();
  });

  test("GET /api/auth/me should reject request without token", async () => {
    const response = await request(app).get("/api/auth/me");

    expect(response.statusCode).toBe(401);
  });
});
