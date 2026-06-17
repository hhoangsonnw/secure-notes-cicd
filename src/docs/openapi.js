const openapiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Secure Notes API",
    version: "1.0.0",
    description:
      "A security-focused Notes API built for CI/CD and DevSecOps practice. The API supports user registration, JWT login, authenticated user profile lookup, and secure notes CRUD operations."
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local development server"
    }
  ],
  tags: [
    {
      name: "Health",
      description: "API health check"
    },
    {
      name: "Authentication",
      description: "User registration, login, and profile endpoints"
    },
    {
      name: "Notes",
      description: "Authenticated notes CRUD endpoints"
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    schemas: {
      RegisterRequest: {
        type: "object",
        required: ["username", "email", "password"],
        properties: {
          username: {
            type: "string",
            example: "alice"
          },
          email: {
            type: "string",
            example: "alice@example.com"
          },
          password: {
            type: "string",
            example: "Password123"
          }
        }
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
            example: "alice@example.com"
          },
          password: {
            type: "string",
            example: "Password123"
          }
        }
      },
      User: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1
          },
          username: {
            type: "string",
            example: "alice"
          },
          email: {
            type: "string",
            example: "alice@example.com"
          }
        }
      },
      AuthResponse: {
        type: "object",
        properties: {
          message: {
            type: "string",
            example: "Login successful."
          },
          token: {
            type: "string",
            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          },
          user: {
            $ref: "#/components/schemas/User"
          }
        }
      },
      NoteRequest: {
        type: "object",
        required: ["title", "content"],
        properties: {
          title: {
            type: "string",
            example: "My secure note"
          },
          content: {
            type: "string",
            example: "This note belongs only to the authenticated user."
          }
        }
      },
      Note: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1
          },
          user_id: {
            type: "integer",
            example: 1
          },
          title: {
            type: "string",
            example: "My secure note"
          },
          content: {
            type: "string",
            example: "This note belongs only to the authenticated user."
          },
          created_at: {
            type: "string",
            example: "2026-06-17 10:00:00"
          },
          updated_at: {
            type: "string",
            example: "2026-06-17 10:00:00"
          }
        }
      },
      ErrorResponse: {
        type: "object",
        properties: {
          error: {
            type: "string",
            example: "Unauthorized."
          }
        }
      }
    }
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Check API health",
        responses: {
          200: {
            description: "API is healthy"
          }
        }
      }
    },
    "/api/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RegisterRequest"
              }
            }
          }
        },
        responses: {
          201: {
            description: "User registered successfully"
          },
          400: {
            description: "Invalid registration input"
          },
          409: {
            description: "User already exists"
          }
        }
      }
    },
    "/api/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Login and receive JWT token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/LoginRequest"
              }
            }
          }
        },
        responses: {
          200: {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthResponse"
                }
              }
            }
          },
          401: {
            description: "Invalid credentials"
          }
        }
      }
    },
    "/api/auth/me": {
      get: {
        tags: ["Authentication"],
        summary: "Get current authenticated user",
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          200: {
            description: "Authenticated user profile"
          },
          401: {
            description: "Missing or invalid token"
          }
        }
      }
    },
    "/api/notes": {
      get: {
        tags: ["Notes"],
        summary: "List notes owned by the authenticated user",
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          200: {
            description: "List of notes"
          },
          401: {
            description: "Missing or invalid token"
          }
        }
      },
      post: {
        tags: ["Notes"],
        summary: "Create a new note",
        security: [
          {
            bearerAuth: []
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/NoteRequest"
              }
            }
          }
        },
        responses: {
          201: {
            description: "Note created successfully"
          },
          400: {
            description: "Invalid note input"
          },
          401: {
            description: "Missing or invalid token"
          }
        }
      }
    },
    "/api/notes/{id}": {
      get: {
        tags: ["Notes"],
        summary: "Get one note owned by the authenticated user",
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer"
            }
          }
        ],
        responses: {
          200: {
            description: "Note found"
          },
          401: {
            description: "Missing or invalid token"
          },
          404: {
            description: "Note not found or not owned by user"
          }
        }
      },
      put: {
        tags: ["Notes"],
        summary: "Update one note owned by the authenticated user",
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer"
            }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/NoteRequest"
              }
            }
          }
        },
        responses: {
          200: {
            description: "Note updated successfully"
          },
          400: {
            description: "Invalid note input"
          },
          401: {
            description: "Missing or invalid token"
          },
          404: {
            description: "Note not found or not owned by user"
          }
        }
      },
      delete: {
        tags: ["Notes"],
        summary: "Delete one note owned by the authenticated user",
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer"
            }
          }
        ],
        responses: {
          200: {
            description: "Note deleted successfully"
          },
          401: {
            description: "Missing or invalid token"
          },
          404: {
            description: "Note not found or not owned by user"
          }
        }
      }
    }
  }
};

module.exports = openapiSpec;