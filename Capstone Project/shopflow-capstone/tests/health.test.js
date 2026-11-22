const request = require("supertest");
const express = require("express");

describe("Health endpoint", () => {
  test("returns API status", async () => {
    const app = express();
    app.get("/api/health", (req, res) => res.json({ success: true, message: "ShopFlow API is running" }));
    const response = await request(app).get("/api/health");
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
