import express from "express";
import cors from "cors";
import { connectMongoDb } from "./lib/mongodb.js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import authRoute from "./routes/auth.route.js";
import roleRoute from "./routes/role.route.js";
import prescriptionRoute from "./routes/prescription.route.js";
import bookingRoute from "./routes/booking.route.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.send("Samarth Clinics API Server is running");
});

// Setup API routes with flexible path handling
const setupApiRoutes = () => {
  // Direct API routes
  app.use("/api/auth", authRoute);
  app.use("/api/role", roleRoute);
  app.use("/api/prescription", prescriptionRoute);
  app.use("/api/booking", bookingRoute);
  
  // Also handle routes without /api prefix for flexibility
  app.use("/auth", authRoute);
  app.use("/role", roleRoute);
  app.use("/prescription", prescriptionRoute);
  app.use("/booking", bookingRoute);
};

// Initialize all routes
setupApiRoutes();

app.listen(4000, () => {
  connectMongoDb();
  console.log("Server is running on port 4000");
});
