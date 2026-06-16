const request = require("supertest");
const app = require("../src/app");
const { resetDatabase } = require("./helpers/test-db");

describe("Authentication endpoints", () => {
  beforeEach(() => {
    resetDatabase();
  });

  test("POST /api/auth/register should create a new user", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        username: "testuser",
        email: "test@example.com",
        password: "Password123"
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe("User registered successfully.");
    expect(response.body.user.email).toBe("test@example.com");
    expect(response.body.user.password).toBeUndefined();
    expect(response.body.user.password_hash).toBeUndefined();
  });

  test("POST /api/auth/register should reject weak password", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        username: "testuser",
        email: "test@example.com",
        password: "short"
      });

    expect(response.statusCode).toBe(400);
  });

  test("POST /api/auth/login should return a JWT token", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({
        username: "testuser",
        email: "test@example.com",
        password: "Password123"
      });

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password: "Password123"
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Login successful.");
    expect(response.body.token).toBeDefined();
  });

  test("POST /api/auth/login should reject invalid credentials", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "wrong@example.com",
        password: "WrongPassword123"
      });

    expect(response.statusCode).toBe(401);
  });

  test("GET /api/auth/me should reject request without token", async () => {
    const response = await request(app).get("/api/auth/me");

    expect(response.statusCode).toBe(401);
  });
});