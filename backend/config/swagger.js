// config/swagger.js
const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Service Booking API",
      version: "1.0.0",
      description:
        "Small API for users, vendors, services and bookings (converted from a task management app).",
    },
    servers: [{ url: "http://localhost:1000", description: "Local server" }],
    // add inside options.definition (next to servers)
  tags: [
    { name: "Auth", description: "Authentication endpoints (signup/login)" },
    { name: "User", description: "User profile and account endpoints" },
    { name: "Vendor", description: "Vendor dashboard and vendor-only actions" },
    { name: "Service", description: "Service creation & search" },
    { name: "Booking", description: "Booking related endpoints" },
    { name: "Task", description: "Legacy task APIs" }
  ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        UserSignup: {
          type: "object",
          properties: {
            username: { type: "string", example: "vendor01" },
            phone: { type: "string", example: "9999999999" },
            email: { type: "string", example: "vendor01@example.com" },
            password: { type: "string", example: "secret123" },
            role: {
              type: "string",
              enum: ["user", "vendor"],
              example: "vendor",
            },
            businessName: { type: "string", example: "Vendor Salon" },
            serviceType: {
              type: "array",
              items: { type: "string" },
              example: ["salon", "haircut"],
            },
            address: { type: "string", example: "MG Road" },
          },
          required: ["username", "phone", "email", "password"],
        },
        Login: {
          type: "object",
          properties: {
            email: { type: "string", example: "vendor01@example.com" },
            username: { type: "string", example: "vendor01" },
            password: { type: "string", example: "secret123" },
          },
        },
        ServiceCreate: {
          type: "object",
          properties: {
            title: { type: "string", example: "Haircut - Basic" },
            description: { type: "string", example: "Basic haircut" },
            serviceType: { type: "string", example: "salon" },
            price: { type: "number", example: 200 },
            durationMins: { type: "number", example: 30 },
          },
          required: ["title", "serviceType"],
        },
        TaskCreate: {
          type: "object",
          properties: {
            title: { type: "string" },
            desc: { type: "string" },
            important: { type: "boolean" },
            complete: { type: "boolean" },
          },
          required: ["title", "desc"],
        },
      },
    },
  },
  // No file globs needed — we list paths inline below, but this gives option to scan JSDoc in code.
  apis: [],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
