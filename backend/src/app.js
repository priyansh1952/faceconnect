import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import { createServer } from "node:http";
import mongoose from "mongoose";
import cors from "cors";
import { connectToSocket } from "./controllers/socketManager.js"; // Import WebSocket logic
import userRoutes from "./routes/userRoutes.js";

// Fix path issues for ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const server = createServer(app);
const io = connectToSocket(server); // Initialize Socket.io properly

app.set("port", process.env.PORT || 8000);

// **Improved CORS Setup**
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Allow cookies
  })
);

// **Middleware for Parsing Requests**
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

// **MongoDB Connection Check**
if (!process.env.MONGO_URI) {
  console.error("ERROR: MONGO_URI is not defined in .env file");
  process.exit(1);
}

// **Use Routes**
app.use("/api/users", userRoutes);

// **MongoDB Connection**
const start = async () => {
  try {
    console.log("🔍 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI); // Removed deprecated options
    console.log("MongoDB Connected Successfully");

    server.listen(process.env.PORT || 8000, () => {
      console.log(`Server running on PORT ${process.env.PORT || 8000}`);
    });
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

start();
