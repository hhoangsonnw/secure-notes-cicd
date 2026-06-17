const openapiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Insecure Notes API Demo",
    version: "1.0.0",
    description:
      "This is the intentionally vulnerable first implementation of the Notes API. It represents an initial developer version built without secure coding guidelines. The remediated secure version is the main Secure Notes API in the root src/ directory."
  },
  servers: [
    {
      url: "http://localhost:4000",
      description: "Local insecure demo server"
    }
  ],
  tags: [
    {
      name: "Health",
      description: "Health check endpoint"
    },
    {
      name: "Authentication",
      description: "Insecure registration and login endpoints"
    },
    {
      name: "Notes",
      description: "Insecure notes CRUD endpoints"
    },
    {
      name: "Vulnerability Demos",
      description: "Endpoints intentionally designed to demonstrate common web vulnerabilities"
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
            example: "charlie"
          },
          email: {
            type: "string",
            example: "charlie@example.com"
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
      NoteRequest: {
        type: "object",
        required: ["title", "content"],
        properties: {
          title: {
            type: "string",
            example: "Unsafe note title"
          },
          content: {
            type: "string",
            example: "<script>alert('stored-xss')</script>"
          }
        }
      },
      ErrorResponse: {
        type: "object",
        properties: {
          error: {
            type: "string",
            example: "Database error."
          },
          details: {
            type: "string",
            example: "Verbose database error details may be exposed here."
          }
        }
      }
    }
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Check insecure demo app health",
        responses: {
          200: {
            description: "Insecure demo app is running"
          }
        }
      }
    },
    "/api/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register a user insecurely",
        description:
          "Intentionally vulnerable: stores plaintext passwords, performs weak validation, and uses unsafe SQL construction.",
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
            description: "User registered insecurely"
          },
          500: {
            description: "Verbose database error may be returned"
          }
        }
      }
    },
    "/api/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Login using insecure plaintext password comparison",
        description:
          "Intentionally vulnerable: uses plaintext password comparison and unsafe SQL query construction.",
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
            description: "Login successful, JWT returned"
          },
          401: {
            description: "Invalid credentials"
          },
          500: {
            description: "Verbose database error may be returned"
          }
        }
      }
    },
    "/api/auth/me": {
      get: {
        tags: ["Authentication"],
        summary: "Return current JWT payload",
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          200: {
            description: "JWT payload returned"
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
        summary: "List notes for current user",
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          200: {
            description: "Notes returned"
          },
          401: {
            description: "Missing or invalid token"
          }
        }
      },
      post: {
        tags: ["Notes"],
        summary: "Create note insecurely",
        description:
          "Intentionally vulnerable: weak input validation and unsafe SQL construction. Stored XSS payloads can be saved.",
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
            description: "Note created"
          },
          401: {
            description: "Missing or invalid token"
          },
          500: {
            description: "Verbose database error may be returned"
          }
        }
      }
    },
    "/api/notes/{id}": {
      get: {
        tags: ["Notes"],
        summary: "Get note by ID with broken access control",
        description:
          "Intentionally vulnerable: missing ownership check allows IDOR. Any authenticated user may read another user's note by changing the note ID.",
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
            },
            example: 1
          }
        ],
        responses: {
          200: {
            description: "Note returned, even if not owned by current user"
          },
          401: {
            description: "Missing or invalid token"
          },
          404: {
            description: "Note not found"
          }
        }
      },
      put: {
        tags: ["Notes"],
        summary: "Update note by ID with broken access control",
        description:
          "Intentionally vulnerable: missing ownership check allows any authenticated user to update another user's note.",
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
            },
            example: 1
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
            description: "Note updated"
          },
          401: {
            description: "Missing or invalid token"
          }
        }
      },
      delete: {
        tags: ["Notes"],
        summary: "Delete note by ID with broken access control",
        description:
          "Intentionally vulnerable: missing ownership check allows any authenticated user to delete another user's note.",
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
            },
            example: 1
          }
        ],
        responses: {
          200: {
            description: "Note deleted"
          },
          401: {
            description: "Missing or invalid token"
          }
        }
      }
    },
    "/api/users": {
      get: {
        tags: ["Vulnerability Demos"],
        summary: "Unsafe user lookup with SQL injection",
        description:
          "Intentionally vulnerable: the id query parameter is concatenated into SQL. Example payload: 1 OR 1=1",
        parameters: [
          {
            name: "id",
            in: "query",
            required: false,
            schema: {
              type: "string"
            },
            example: "1 OR 1=1"
          }
        ],
        responses: {
          200: {
            description: "User records returned"
          },
          500: {
            description: "Verbose SQL error may be returned"
          }
        }
      }
    },
    "/notes/{id}/render": {
      get: {
        tags: ["Vulnerability Demos"],
        summary: "Render note as raw HTML",
        description:
          "Intentionally vulnerable: note title and content are rendered directly into HTML, enabling stored XSS.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer"
            },
            example: 3
          }
        ],
        responses: {
          200: {
            description: "Raw HTML page returned"
          },
          404: {
            description: "Note not found"
          }
        }
      }
    },
    "/search": {
      get: {
        tags: ["Vulnerability Demos"],
        summary: "Unsafe reflected search",
        description:
          "Intentionally vulnerable: q query parameter is reflected into HTML without escaping, enabling reflected XSS.",
        parameters: [
          {
            name: "q",
            in: "query",
            required: false,
            schema: {
              type: "string"
            },
            example: "<script>alert('xss')</script>"
          }
        ],
        responses: {
          200: {
            description: "HTML response with reflected input"
          }
        }
      }
    },
    "/api/set-session": {
      get: {
        tags: ["Vulnerability Demos"],
        summary: "Set insecure cookie",
        description:
          "Intentionally vulnerable: sets a cookie without Secure, HttpOnly, or SameSite flags.",
        responses: {
          200: {
            description: "Insecure cookie set"
          }
        }
      }
    },
    "/api/debug/users": {
      get: {
        tags: ["Vulnerability Demos"],
        summary: "Expose debug user dump",
        description:
          "Intentionally vulnerable: exposes users, plaintext passwords, and a hardcoded JWT secret for demonstration purposes.",
        responses: {
          200: {
            description: "Sensitive debug data returned"
          }
        }
      }
    }
  }
};

module.exports = openapiSpec;