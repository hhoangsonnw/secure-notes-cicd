const openapiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Insecure Notes API Demo",
    version: "1.0.0",
    description: `
> **Local security training environment.** This API is intentionally unsafe; run it only on a machine you control.

Start with **Vulnerability Demos** below. It contains 13 executable scenarios, including SQL injection, IDOR, XSS, plaintext passwords, unsafe cookies, and debug-data exposure.

For authenticated scenarios, log in as **Alice** with \`alice@example.com\` / \`Password123\`, click **Authorize**, and paste the returned bearer token. The seeded admin owns note \`1\`; Alice owns notes \`2\` and \`3\`.

The complete command-by-command walkthrough is in \`vulnerable-demo/DEMO-GUIDE.md\`.
`
  },
  servers: [
    {
      url: "/",
      description: "The same local origin serving Swagger UI"
    }
  ],
  tags: [
    {
      name: "Vulnerability Demos",
      description:
        "Complete local-only catalogue of the intentional vulnerabilities. Some operations are duplicated from functional sections so each demo is easy to find."
    },
    {
      name: "Health",
      description: "Landing page, readiness endpoint, and deliberately absent security controls."
    },
    {
      name: "Authentication",
      description: "Insecure registration, login, and bearer-token endpoints."
    },
    {
      name: "Notes",
      description: "Insecure notes CRUD endpoints."
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description:
          "For local demos, log in as Alice, then click Authorize and paste her token. The API also accepts a forged token when signed with its hardcoded secret; see the demo guide."
      }
    },
    schemas: {
      HealthResponse: {
        type: "object",
        required: ["status", "service", "docs", "openapi"],
        properties: {
          status: { type: "string", example: "running" },
          service: { type: "string", example: "insecure-notes-demo" },
          docs: { type: "string", example: "/api-docs" },
          openapi: { type: "string", example: "/openapi.json" }
        }
      },
      User: {
        type: "object",
        required: ["id", "username", "email", "role"],
        properties: {
          id: { type: "integer", example: 2 },
          username: { type: "string", example: "alice" },
          email: { type: "string", format: "email", example: "alice@example.com" },
          password: {
            type: "string",
            example: "Password123",
            description:
              "Intentionally exposed by vulnerable responses and the debug endpoint; secure APIs must never return this field."
          },
          role: { type: "string", example: "user" }
        }
      },
      Note: {
        type: "object",
        required: ["id", "user_id", "title", "content"],
        properties: {
          id: { type: "integer", example: 3 },
          user_id: { type: "integer", example: 2 },
          title: { type: "string", example: "Stored XSS note" },
          content: {
            type: "string",
            example: "<script>alert(\"stored-xss\")</script>",
            description: "Intentionally unescaped when rendered at `/notes/{id}/render`."
          },
          created_at: { type: "string", example: "2026-01-01 00:00:00" }
        }
      },
      RegisterRequest: {
        type: "object",
        required: ["username", "email", "password"],
        properties: {
          username: { type: "string", example: "charlie" },
          email: { type: "string", example: "charlie@example.com" },
          password: { type: "string", example: "Password123" }
        }
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", example: "alice@example.com" },
          password: { type: "string", example: "Password123" }
        }
      },
      NoteRequest: {
        type: "object",
        required: ["title", "content"],
        properties: {
          title: { type: "string", example: "Unsafe note title" },
          content: {
            type: "string",
            example: "<script>alert(\"stored-xss\")</script>"
          }
        }
      },
      RegisterResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "User registered." },
          user: { $ref: "#/components/schemas/User" }
        }
      },
      LoginResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "Login successful." },
          token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
          user: { $ref: "#/components/schemas/User" }
        }
      },
      AuthMeResponse: {
        type: "object",
        properties: {
          user: { $ref: "#/components/schemas/User" }
        }
      },
      NoteResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "Note updated." },
          note: { $ref: "#/components/schemas/Note" }
        }
      },
      NotesResponse: {
        type: "object",
        properties: {
          notes: {
            type: "array",
            items: { $ref: "#/components/schemas/Note" }
          }
        }
      },
      UserLookupResponse: {
        type: "object",
        properties: {
          query: {
            type: "string",
            example: "SELECT id, username, email, role FROM users WHERE id = 1 OR 1=1"
          },
          users: {
            type: "array",
            items: { $ref: "#/components/schemas/User" }
          }
        }
      },
      DebugUsersResponse: {
        type: "object",
        properties: {
          warning: {
            type: "string",
            example: "This endpoint intentionally exposes plaintext passwords."
          },
          users: {
            type: "array",
            items: { $ref: "#/components/schemas/User" }
          },
          jwtSecret: {
            type: "string",
            example: "dev-notes-hardcoded-secret-12345"
          }
        }
      },
      MessageResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "Note deleted." }
        }
      },
      ErrorResponse: {
        type: "object",
        properties: {
          error: { type: "string", example: "Database error." },
          query: {
            type: "string",
            example: "SELECT id, username, email, role FROM users WHERE id = not_a_number"
          },
          details: {
            type: "string",
            example: "no such column: not_a_number"
          }
        }
      }
    }
  },
  paths: {
    "/": {
      get: {
        tags: ["Health"],
        summary: "Open the insecure demo landing page",
        description:
          "HTML landing page that links to the local Swagger UI and the purpose-built vulnerability routes.",
        responses: {
          200: { description: "Landing page returned" }
        }
      }
    },
    "/health": {
      get: {
        tags: ["Health", "Vulnerability Demos"],
        summary: "Check health without headers or rate limits",
        description:
          "Returns a health response, but the app intentionally omits Helmet and rate limiting. Inspect the response headers to see that `Content-Security-Policy`, `X-Content-Type-Options`, and `X-Frame-Options` are absent. The complete repeated-request demo is in `DEMO-GUIDE.md` section 4.12.",
        responses: {
          200: {
            description: "App is running; no security headers are added by the application.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HealthResponse" }
              }
            }
          }
        }
      }
    },
    "/openapi.json": {
      get: {
        tags: ["Health"],
        summary: "Get this OpenAPI document",
        responses: {
          200: { description: "OpenAPI 3.0 document returned" }
        }
      }
    },
    "/api/auth/register": {
      post: {
        tags: ["Authentication", "Vulnerability Demos"],
        summary: "Register with plaintext password storage",
        description:
          "Intentionally vulnerable: directly interpolates values into SQL, stores passwords in plaintext, performs no meaningful validation, and returns the submitted password. Use the **Weak validation and plaintext password** example, then inspect `GET /api/debug/users`.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
              examples: {
                normalRegistration: {
                  summary: "Normal registration",
                  value: {
                    username: "charlie",
                    email: "charlie@example.com",
                    password: "Password123"
                  }
                },
                weakValidationAndPlaintextPassword: {
                  summary: "Weak validation and plaintext password",
                  value: {
                    username: "",
                    email: "not-an-email",
                    password: ""
                  }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: "User stored and returned, including its plaintext password.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RegisterResponse" }
              }
            }
          },
          500: {
            description: "Unsafe SQL may expose a verbose database error.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/api/auth/login": {
      post: {
        tags: ["Authentication", "Vulnerability Demos"],
        summary: "Log in with plaintext, unsafe SQL checks",
        description:
          "Intentionally vulnerable: compares plaintext passwords and builds the query using string interpolation. The **SQL injection bypass** example comments out the password clause in this local demo. Copy its returned token into **Authorize** to call authenticated routes.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
              examples: {
                aliceLogin: {
                  summary: "Alice login for IDOR demos",
                  value: {
                    email: "alice@example.com",
                    password: "Password123"
                  }
                },
                sqlInjectionBypass: {
                  summary: "SQL injection bypass (local demo only)",
                  value: {
                    email: "admin@example.com' -- ",
                    password: "does-not-matter"
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Login succeeded; the response also exposes the user's plaintext password.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginResponse" }
              }
            }
          },
          401: { description: "Invalid credentials" },
          500: {
            description: "Unsafe SQL may expose a verbose database error.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/api/auth/me": {
      get: {
        tags: ["Authentication", "Vulnerability Demos"],
        summary: "Return JWT claims without robust validation",
        description:
          "Accepts any valid token signed with the embedded JWT secret. After generating the local forged-admin token in `DEMO-GUIDE.md` section 4.2, use **Authorize** and execute this endpoint to see the attacker-controlled claims reflected back.",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "JWT payload returned without checking it against a user record.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthMeResponse" }
              }
            }
          },
          401: {
            description: "Missing or invalid token",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/api/notes": {
      get: {
        tags: ["Notes"],
        summary: "List notes for the token subject",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Notes returned",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/NotesResponse" }
              }
            }
          },
          401: { description: "Missing or invalid token" }
        }
      },
      post: {
        tags: ["Notes", "Vulnerability Demos"],
        summary: "Create an unvalidated note that stores XSS",
        description:
          "Intentionally vulnerable: interpolates title and content into SQL, accepts unvalidated input, and stores the payload for unsafe HTML rendering. Use the **Stored XSS payload** example, then open `GET /notes/{id}/render` with the created note ID.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/NoteRequest" },
              examples: {
                storedXssPayload: {
                  summary: "Stored XSS payload (local browser demo only)",
                  value: {
                    title: "Untrusted title",
                    content: "<script>alert(\"new-stored-xss\")</script>"
                  }
                },
                ordinaryNote: {
                  summary: "Ordinary note",
                  value: {
                    title: "Demo note",
                    content: "Created from Swagger UI."
                  }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: "Note stored without validation.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/NoteResponse" }
              }
            }
          },
          401: { description: "Missing or invalid token" },
          500: {
            description: "Unsafe SQL may expose a verbose database error.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/api/notes/{id}": {
      get: {
        tags: ["Notes", "Vulnerability Demos"],
        summary: "Read any authenticated user's note (IDOR)",
        description:
          "Intentionally vulnerable: it authenticates the caller but never verifies ownership. Authorize as Alice and use note ID `1` to read the admin's private note.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            example: 1,
            description: "Use `1` while authorized as Alice for the local IDOR read demonstration."
          }
        ],
        responses: {
          200: {
            description: "Note returned even when it is not owned by the authenticated user.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/NoteResponse" }
              }
            }
          },
          401: { description: "Missing or invalid token" },
          404: { description: "Note not found" },
          500: {
            description: "Unsafe note ID may expose a verbose database error.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      },
      put: {
        tags: ["Notes", "Vulnerability Demos"],
        summary: "Update any authenticated user's note (IDOR)",
        description:
          "Intentionally vulnerable: any authenticated user can update any note. Authorize as Alice, use note ID `1`, and run the example. This mutates the disposable demo database; restart the app to reset it.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            example: 1,
            description: "Use `1` while authorized as Alice for the local IDOR update demonstration."
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/NoteRequest" },
              examples: {
                idorOverwrite: {
                  summary: "Alice overwrites the admin note (local demo only)",
                  value: {
                    title: "Changed by Alice",
                    content: "A normal user modified the admin note."
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Note updated without an ownership check.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/NoteResponse" }
              }
            }
          },
          401: { description: "Missing or invalid token" },
          500: {
            description: "Unsafe SQL may expose a verbose database error.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      },
      delete: {
        tags: ["Notes", "Vulnerability Demos"],
        summary: "Delete any authenticated user's note (IDOR)",
        description:
          "Intentionally vulnerable: any authenticated user can delete any note. Authorize as Alice and use note ID `1`. This changes the disposable demo database; restart the app to reset it.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            example: 1,
            description: "Use `1` while authorized as Alice for the local IDOR delete demonstration."
          }
        ],
        responses: {
          200: {
            description: "Note deleted without an ownership check.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageResponse" }
              }
            }
          },
          401: { description: "Missing or invalid token" },
          500: {
            description: "Unsafe note ID may expose a verbose database error.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/api/users": {
      get: {
        tags: ["Vulnerability Demos"],
        summary: "Extract users with SQL injection",
        description:
          "Intentionally vulnerable: concatenates `id` directly into SQL and returns that assembled query. Use the **Extract all users** example to turn a single-ID lookup into a full user dump. The **Verbose SQL error** example shows database internals in the response.",
        parameters: [
          {
            name: "id",
            in: "query",
            required: false,
            schema: { type: "string", default: "1" },
            examples: {
              singleUser: { summary: "Single user", value: "1" },
              extractAllUsers: {
                summary: "Extract all users (local demo only)",
                value: "1 OR 1=1"
              },
              verboseSqlError: {
                summary: "Verbose SQL error", value: "not_a_number"
              }
            }
          }
        ],
        responses: {
          200: {
            description: "User records returned; an injected condition can return every user.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserLookupResponse" }
              }
            }
          },
          500: {
            description: "Raw SQL query and database error disclosed.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/notes/{id}/render": {
      get: {
        tags: ["Vulnerability Demos"],
        summary: "Render raw HTML note content (stored XSS)",
        description:
          "Intentionally vulnerable: directly inserts the note title and content into an HTML page. Use seeded note ID `3` to run `alert(\"stored-xss\")` in a local demo browser. To create a new payload, use `POST /api/notes` with its **Stored XSS payload** example first.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            example: 3,
            description: "Use seeded note `3` for the local stored-XSS demonstration."
          }
        ],
        responses: {
          200: { description: "Raw HTML response containing unescaped note data" },
          404: { description: "Note not found" },
          500: { description: "Raw HTML error page leaks database error details" }
        }
      }
    },
    "/search": {
      get: {
        tags: ["Vulnerability Demos"],
        summary: "Reflect unescaped HTML (reflected XSS)",
        description:
          "Intentionally vulnerable: reflects `q` into an HTML response without escaping. Use the **Reflected XSS payload** example in a local demo browser. The payload executes immediately and is not stored.",
        parameters: [
          {
            name: "q",
            in: "query",
            required: false,
            schema: { type: "string", default: "test" },
            examples: {
              normalSearch: { summary: "Normal search", value: "test" },
              reflectedXssPayload: {
                summary: "Reflected XSS payload (local browser demo only)",
                value: "<script>alert('reflected-xss')</script>"
              }
            }
          }
        ],
        responses: {
          200: { description: "HTML response containing unescaped query input" }
        }
      }
    },
    "/api/set-session": {
      get: {
        tags: ["Vulnerability Demos"],
        summary: "Set an insecure session cookie",
        description:
          "Intentionally vulnerable: sets `demo_session` without `Secure`, `HttpOnly`, or `SameSite`. Execute this operation and inspect the response header in the browser's network tools or use the curl command in `DEMO-GUIDE.md` section 4.10.",
        responses: {
          200: {
            description: "Insecure cookie set",
            headers: {
              "Set-Cookie": {
                description: "Intentionally lacks Secure, HttpOnly, and SameSite attributes.",
                schema: { type: "string" },
                example: "demo_session=insecure-demo-session; Path=/"
              }
            },
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageResponse" }
              }
            }
          }
        }
      }
    },
    "/api/debug/users": {
      get: {
        tags: ["Vulnerability Demos"],
        summary: "Expose users, passwords, and JWT secret",
        description:
          "Intentionally vulnerable debug endpoint with no authorization. It returns every user, their plaintext passwords, and the embedded signing secret. The local token-forging command in `DEMO-GUIDE.md` section 4.2 uses that secret before calling `GET /api/auth/me`.",
        responses: {
          200: {
            description: "Sensitive debug data returned without authentication.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DebugUsersResponse" }
              }
            }
          }
        }
      }
    }
  }
};

module.exports = openapiSpec;
