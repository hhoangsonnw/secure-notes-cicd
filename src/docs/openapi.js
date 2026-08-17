const openapiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Secure Notes API",
    version: "1.0.0",
    description: `
> **Protected local API environment.** Authentication, validation, rate limiting, security headers, and note ownership controls are enabled.

Start with **Authentication**: register an account, log in, click **Authorize**, and use the bearer token for the private Notes workflow.

Start with **Security Verification Demos**: nine executable endpoint flows cover all 13 remediated checks. The verification endpoint lists every control, including removed-route, rate-limit, and dependency-audit checks.
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
      name: "Security Verification Demos",
      description:
        "Nine executable local flows cover all 13 remediated insecure-demo issues. Open the verification status endpoint for the complete checklist; use SECURITY-VERIFICATION-GUIDE.md for multi-request and removed-route checks."
    },
    {
      name: "Authentication",
      description: "User registration, login, and profile endpoints"
    },
    {
      name: "Notes",
      description: "Authenticated notes CRUD endpoints"
    },
    {
      name: "Health",
      description: "API health check"
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
      SecurityVerificationScenario: {
        type: "object",
        required: ["id", "status", "evidence", "interactiveCheck"],
        properties: {
          id: {
            type: "string",
            example: "sql-injection"
          },
          status: {
            type: "string",
            example: "resolved"
          },
          evidence: {
            type: "string",
            example: "Authentication and note queries use parameterized SQL statements."
          },
          interactiveCheck: {
            type: "string",
            example: "POST /api/auth/login"
          }
        }
      },
      SecurityVerificationResponse: {
        type: "object",
        required: ["status", "service", "scenarios"],
        properties: {
          status: {
            type: "string",
            example: "resolved"
          },
          service: {
            type: "string",
            example: "secure-notes-api"
          },
          scenarios: {
            type: "array",
            items: {
              $ref: "#/components/schemas/SecurityVerificationScenario"
            }
          }
        }
      }
    }
  },
  paths: {
    "/api/security/verification": {
      get: {
        tags: ["Security Verification Demos"],
        summary: "List all 13 resolved security scenarios",
        description:
          "Safe, non-sensitive verification summary for the secure counterpart of the insecure demo. Each scenario names the mitigation and its corresponding interactive check. The complete reproduction steps are in `SECURITY-VERIFICATION-GUIDE.md`.",
        responses: {
          200: {
            description: "All resolved security scenarios and their verification pointers.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/SecurityVerificationResponse"
                }
              }
            }
          }
        }
      }
    },
    "/health": {
      get: {
        tags: ["Security Verification Demos", "Health"],
        summary: "Check protected health and rate limits",
        description:
          "Inspect this response to verify Helmet headers. Repeating this request more than 100 times in 15 minutes produces `429 Too Many Requests`; see the verification guide for the local-only command.",
        responses: {
          200: {
            description: "API is healthy"
          }
        }
      }
    },
    "/api/auth/register": {
      post: {
        tags: ["Security Verification Demos", "Authentication"],
        summary: "Register with validation and private passwords",
        description:
          "Use the **Blocked weak input** example to verify that malformed registration data receives `400`. A successful registration response includes only the public user fields; no plaintext password or hash is returned.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RegisterRequest"
              },
              examples: {
                validRegistration: {
                  summary: "Valid registration",
                  value: {
                    username: "secure_demo_user",
                    email: "secure-demo@example.com",
                    password: "Password123"
                  }
                },
                blockedWeakInput: {
                  summary: "Blocked weak input",
                  value: {
                    username: "",
                    email: "not-an-email",
                    password: "short"
                  }
                }
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
        tags: ["Security Verification Demos", "Authentication"],
        summary: "Log in with parameterized, hashed credentials",
        description:
          "Use the **SQL injection probe** example. It is treated as a literal email value and receives a generic authentication failure rather than bypassing the password check. The request never exposes a password hash.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/LoginRequest"
              },
              examples: {
                registeredUserLogin: {
                  summary: "Login after registration",
                  value: {
                    email: "secure-demo@example.com",
                    password: "Password123"
                  }
                },
                sqlInjectionProbe: {
                  summary: "SQL injection probe blocked by parameterized query",
                  value: {
                    email: "attacker'@example.com",
                    password: "does-not-matter"
                  }
                }
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
        tags: ["Security Verification Demos", "Authentication"],
        summary: "Verify the current user with a valid JWT",
        description:
          "Use **Authorize** with a login token. An arbitrary or forged-looking token receives the generic `401 Invalid or expired token.` response and no signing secret is exposed.",
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
        summary: "List notes owned by the current user",
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
        tags: ["Security Verification Demos", "Notes"],
        summary: "Create a validated JSON note",
        description:
          "Use the **Blocked empty note** example to verify validation. The API returns JSON only and exposes no raw HTML note-rendering route; presentation layers must still render note content safely.",
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
              },
              examples: {
                validNote: {
                  summary: "Valid private note",
                  value: {
                    title: "Secure demo note",
                    content: "This note belongs only to the authenticated user."
                  }
                },
                blockedEmptyNote: {
                  summary: "Blocked empty note",
                  value: {
                    title: "",
                    content: ""
                  }
                },
                jsonOnlyXssProbe: {
                  summary: "JSON-only XSS storage probe",
                  value: {
                    title: "Untrusted text",
                    content: "<script>alert(\"not-rendered-by-this-api\")</script>"
                  }
                }
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
        tags: ["Security Verification Demos", "Notes"],
        summary: "Read only your own note",
        description:
          "After creating a note with one user, authorize as a second user and request that ID. The secure API returns `404 Note not found.` instead of leaking another user's note.",
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
        tags: ["Security Verification Demos", "Notes"],
        summary: "Update only your own note",
        description:
          "A second authenticated user receives `404 Note not found.` when attempting to overwrite the first user's note. This prevents the insecure demo's IDOR update.",
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
        tags: ["Security Verification Demos", "Notes"],
        summary: "Delete only your own note",
        description:
          "A second authenticated user receives `404 Note not found.` when attempting to delete the first user's note. This prevents the insecure demo's IDOR delete.",
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
