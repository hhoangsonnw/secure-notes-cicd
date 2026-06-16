const request = require("supertest");
const app = require("../src/app");
const { resetDatabase } = require("./helpers/test-db");

async function createUserAndLogin(prefix) {
  const randomId = Math.floor(Math.random() * 100000);
  const safePrefix = prefix.slice(0, 12);
  const unique = `${safePrefix}_${randomId}`;

  const user = {
    username: unique,
    email: `${unique}@example.com`,
    password: "Password123"
  };

  const registerResponse = await request(app)
    .post("/api/auth/register")
    .send(user);

  expect(registerResponse.statusCode).toBe(201);

  const loginResponse = await request(app)
    .post("/api/auth/login")
    .send({
      email: user.email,
      password: user.password
    });

  expect(loginResponse.statusCode).toBe(200);
  expect(loginResponse.body.token).toBeDefined();

  return {
    user,
    token: loginResponse.body.token
  };
}

describe("Notes endpoints", () => {
  beforeEach(() => {
    resetDatabase();
  });

  test("POST /api/notes should reject unauthenticated requests", async () => {
    const response = await request(app)
      .post("/api/notes")
      .send({
        title: "Unauthorized note",
        content: "This should not be created."
      });

    expect(response.statusCode).toBe(401);
  });

  test("Authenticated user can create and list notes", async () => {
    const { token } = await createUserAndLogin("notes_owner");

    const createResponse = await request(app)
      .post("/api/notes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test Note",
        content: "This is a test note."
      });

    expect(createResponse.statusCode).toBe(201);
    expect(createResponse.body.note.title).toBe("Test Note");

    const listResponse = await request(app)
      .get("/api/notes")
      .set("Authorization", `Bearer ${token}`);

    expect(listResponse.statusCode).toBe(200);
    expect(Array.isArray(listResponse.body.notes)).toBe(true);
    expect(listResponse.body.notes.length).toBeGreaterThanOrEqual(1);
  });

  test("Authenticated user can update own note", async () => {
    const { token } = await createUserAndLogin("notes_update");

    const createResponse = await request(app)
      .post("/api/notes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Original Title",
        content: "Original content."
      });

    const noteId = createResponse.body.note.id;

    const updateResponse = await request(app)
      .put(`/api/notes/${noteId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Updated Title",
        content: "Updated content."
      });

    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.body.note.title).toBe("Updated Title");
    expect(updateResponse.body.note.content).toBe("Updated content.");
  });

  test("Authenticated user can delete own note", async () => {
    const { token } = await createUserAndLogin("notes_delete");

    const createResponse = await request(app)
      .post("/api/notes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Delete Me",
        content: "This note should be deleted."
      });

    const noteId = createResponse.body.note.id;

    const deleteResponse = await request(app)
      .delete(`/api/notes/${noteId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleteResponse.statusCode).toBe(200);
    expect(deleteResponse.body.message).toBe("Note deleted successfully.");

    const getResponse = await request(app)
      .get(`/api/notes/${noteId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(getResponse.statusCode).toBe(404);
  });

  test("User cannot access another user's note", async () => {
    const owner = await createUserAndLogin("note_owner");
    const attacker = await createUserAndLogin("note_attacker");

    const createResponse = await request(app)
      .post("/api/notes")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        title: "Private Note",
        content: "Only the owner should see this."
      });

    const noteId = createResponse.body.note.id;

    const attackerGetResponse = await request(app)
      .get(`/api/notes/${noteId}`)
      .set("Authorization", `Bearer ${attacker.token}`);

    expect(attackerGetResponse.statusCode).toBe(404);

    const attackerUpdateResponse = await request(app)
      .put(`/api/notes/${noteId}`)
      .set("Authorization", `Bearer ${attacker.token}`)
      .send({
        title: "Stolen Note",
        content: "Trying to overwrite someone else's note."
      });

    expect(attackerUpdateResponse.statusCode).toBe(404);

    const attackerDeleteResponse = await request(app)
      .delete(`/api/notes/${noteId}`)
      .set("Authorization", `Bearer ${attacker.token}`);

    expect(attackerDeleteResponse.statusCode).toBe(404);
  });
});