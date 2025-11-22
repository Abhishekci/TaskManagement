// config/swagger-routes.js
const swaggerSpec = require("./swagger");

const bookingSchema = {
  BookingCreate: {
    type: "object",
    properties: {
      serviceId: { type: "string", example: "64a1f0..." },
      scheduledAt: {
        type: "string",
        format: "date-time",
        example: "2025-12-01T10:00:00.000Z",
      },
      notes: { type: "string", example: "Please be on time" },
    },
    required: ["serviceId", "scheduledAt"],
  },
  BookingResp: {
    type: "object",
    properties: {
      action: { type: "string", enum: ["accept", "reject"], example: "accept" },
    },
    required: ["action"],
  },
};

const paths = {
  // Auth
  "/api/v1/sign-in": {
    post: {
      tags: ["Auth"],
      summary: "Sign up (user or vendor)",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UserSignup" },
          },
        },
      },
      responses: {
        201: { description: "Signup successful" },
        400: { description: "Validation error" },
      },
    },
  },
  "/api/v1/log-in": {
    post: {
      tags: ["Auth"],
      summary: "Login (email or username)",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Login" },
          },
        },
      },
      responses: {
        200: { description: "Login success (returns token)" },
        400: { description: "Invalid credentials" },
      },
    },
  },

    // User: current user profile
  "/api/v1/me": {
    get: {
      tags: ["User"],
      summary: "Get logged-in user/vendor profile",
      description: "Returns the authenticated user's full profile (without password). Requires JWT token.",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "Successfully fetched user details",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { $ref: "#/components/schemas/UserProfile" },
                },
              },
            },
          },
        },
        "401": { description: "Unauthorized – missing or invalid token" },
        "404": { description: "User not found" },
        "500": { description: "Internal Server Error" },
      },
    },
  },

  // Profile pic update
  "/api/v1/profile-pic": {
    patch: {
      tags: ["User"],
      summary: "Update profile picture",
      description:
        "Update user's profile picture. Accepts either a profilePic object `{ url, public_id }` or `profilePicUrl` string.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              oneOf: [
                { $ref: "#/components/schemas/ProfilePic" },
                {
                  type: "object",
                  properties: {
                    profilePicUrl: { type: "string", example: "https://res.cloudinary.com/..." },
                  },
                },
              ],
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Profile picture updated",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string", example: "Profile picture updated" },
                  profilePic: { $ref: "#/components/schemas/ProfilePic" },
                },
              },
            },
          },
        },
        "400": { description: "Bad request" },
        "401": { description: "Unauthorized" },
        "404": { description: "User not found" },
      },
    },
  },

  // Vendor
  "/api/v1/vendor/dashboard": {
    get: {
      tags: ["Vendor"],
      summary: "Vendor dashboard (vendor & approved)",
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: "Vendor data" },
        403: { description: "Forbidden" },
      },
    },
  },

  // Services
  "/api/v1/service/create": {
    post: {
      tags: ["Service"],
      summary: "Create service (vendor only)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ServiceCreate" },
          },
        },
      },
      responses: { 201: { description: "Service created" } },
    },
  },
  "/api/v1/service/my-services": {
    get: {
      tags: ["Service"],
      summary: "List my services (vendor only)",
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: "Array of services" } },
    },
  },
  "/api/v1/service/search": {
    get: {
      tags: ["Service"],
      summary: "Search services by type (public)",
      parameters: [
        {
          in: "query",
          name: "type",
          schema: { type: "string" },
          required: true,
        },
        { in: "query", name: "minPrice", schema: { type: "number" } },
        { in: "query", name: "maxPrice", schema: { type: "number" } },
      ],
      responses: { 200: { description: "Array of services" } },
    },
  },

    // Service gallery endpoints
  "/api/v1/service/{id}/images": {
    post: {
      tags: ["Service"],
      summary: "Add image to service gallery (vendor only)",
      security: [{ bearerAuth: [] }],
      parameters: [
        { in: "path", name: "id", required: true, schema: { type: "string" } },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              oneOf: [
                { $ref: "#/components/schemas/ServiceImage" },
                {
                  type: "object",
                  properties: {
                    imageUrl: { type: "string", example: "https://res.cloudinary.com/..." },
                  },
                },
              ],
            },
          },
        },
      },
      responses: {
        201: {
          description: "Image added",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string", example: "Image added" },
                  images: {
                    type: "array",
                    items: { $ref: "#/components/schemas/ServiceImage" },
                  },
                },
              },
            },
          },
        },
        400: { description: "Bad request" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden" },
        404: { description: "Service not found" },
      },
    },

    get: {
      tags: ["Service"],
      summary: "List service gallery images (public)",
      parameters: [
        { in: "path", name: "id", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "Array of images",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  images: {
                    type: "array",
                    items: { $ref: "#/components/schemas/ServiceImage" },
                  },
                },
              },
            },
          },
        },
        404: { description: "Service not found" },
      },
    },

    delete: {
      tags: ["Service"],
      summary: "Delete image from service gallery (vendor only)",
      security: [{ bearerAuth: [] }],
      parameters: [
        { in: "path", name: "id", required: true, schema: { type: "string" } },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                public_id: { type: "string", example: "services/123/abc" },
                url: { type: "string", example: "https://res.cloudinary.com/..." },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Image deleted",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string", example: "Image deleted" },
                  images: {
                    type: "array",
                    items: { $ref: "#/components/schemas/ServiceImage" },
                  },
                },
              },
            },
          },
        },
        400: { description: "Bad request" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden" },
        404: { description: "Service or image not found" },
      },
    },
  },


  // Tasks (existing)
  "/api/v2/create-task": {
    post: {
      tags: ["Task"],
      summary: "Create task (protected)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/TaskCreate" },
          },
        },
      },
      responses: { 201: { description: "Task created" } },
    },
  },

  // Bookings
  "/api/v1/booking/create": {
    post: {
      tags: ["Booking"],
      summary: "Create booking (user only)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/BookingCreate" },
          },
        },
      },
      responses: {
        201: { description: "Booking created" },
        400: { description: "Bad request" },
        403: { description: "Forbidden" },
      },
    },
  },
  "/api/v1/booking/my-bookings": {
    get: {
      tags: ["Booking"],
      summary: "My bookings (user)",
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: "Array of bookings" } },
    },
  },
  "/api/v1/booking/vendor-bookings": {
    get: {
      tags: ["Booking"],
      summary: "Bookings for vendor",
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: "Array of bookings" } },
    },
  },
  "/api/v1/booking/{id}/respond": {
    put: {
      tags: ["Booking"],
      summary: "Vendor respond to booking (accept/reject)",
      security: [{ bearerAuth: [] }],
      parameters: [
        { in: "path", name: "id", required: true, schema: { type: "string" } },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/BookingResp" },
          },
        },
      },
      responses: {
        200: { description: "Booking updated" },
        403: { description: "Forbidden" },
        404: { description: "Not found" },
      },
    },
  },
};

swaggerSpec.paths = Object.assign({}, swaggerSpec.paths || {}, paths);

// add booking schemas to components
swaggerSpec.components = swaggerSpec.components || {};
swaggerSpec.components.schemas = Object.assign(
  {},
  swaggerSpec.components.schemas || {},
  {
    ...swaggerSpec.components.schemas,
    ...bookingSchema,
  }
);

// add UserProfile schema (merge with existing schemas)
swaggerSpec.components.schemas = Object.assign(
  {},
  swaggerSpec.components.schemas || {},
  {
    UserProfile: {
      type: "object",
      properties: {
        _id: { type: "string", example: "691e2193dbe2dc5ae7219017" },
        username: { type: "string", example: "vendor_demo" },
        phone: { type: "string", example: "9999999999" },
        email: { type: "string", example: "vendor_demo@example.com" },
        role: { type: "string", example: "vendor" },
        businessName: { type: "string", example: "Demo Salon" },
        serviceType: { type: "array", items: { type: "string" }, example: ["salon"] },
        address: { type: "string", example: "MG Road" },
        profilePic: {
          type: "object",
          properties: {
            url: { type: "string", example: "https://res.cloudinary.com/your_cloud_name/image/upload/v.../profile.jpg" },
            public_id: { type: "string", example: "profiles/vendor_demo_123" }
          }
        },
        isApproved: { type: "boolean", example: true },
        createdAt: { type: "string" },
        updatedAt: { type: "string" }
      }
    },
    // ProfilePic schema (for PATCH /profile-pic)
    ProfilePic: {
      type: "object",
      properties: {
        profilePic: {
          type: "object",
          properties: {
            url: {
              type: "string",
              example: "https://res.cloudinary.com/your_cloud_name/image/upload/v.../profile.jpg"
            },
            public_id: { type: "string", example: "profiles/vendor_demo_123" }
          }
        }
      }
    },

        // Service image schema used in gallery endpoints
    ServiceImage: {
      type: "object",
      properties: {
        url: { type: "string", example: "https://res.cloudinary.com/your_cloud_name/image/upload/v.../svc1.jpg" },
        public_id: { type: "string", example: "services/123/abc" },
        uploadedAt: { type: "string", example: "2025-01-01T12:00:00.000Z" }
      }
    }
  }
);


module.exports = swaggerSpec;
