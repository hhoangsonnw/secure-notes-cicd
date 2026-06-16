const request = require("supertest");
const app = require("../src/app");
const { resetDatabase } = require("./helpers/test-db");

describe("Input validation", () => {
  beforeEach(() => {
    resetDatabase();
  });

  test("Register should reject invalid email", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        username: "testuser",
        email: "not-an-email",
        password: "Password123"
      });

    expect(response.statusCode).toBe(400);
  });

  test("Register should reject short username", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        username: "ab",
        email: "test@example.com",
        password: "Password123"
      });

    expect(response.statusCode).toBe(400);
  });

  test("Create note should reject empty title", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({
        username: "testuser",
        email: "test@example.com",
        password: "Password123"
      });

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password: "Password123"
      });

    const response = await request(app)
      .post("/api/notes")
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send({
        title: "",
        content: "Valid content"
      });

    expect(response.statusCode).toBe(400);
  });

  test("Create note should reject empty content", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({
        username: "testuser",
        email: "test@example.com",
        password: "Password123"
      });

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password: "Password123"
      });

    const response = await request(app)
      .post("/api/notes")
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send({
        title: "Valid title",
        content: ""
      });

    expect(response.statusCode).toBe(400);
  });
});