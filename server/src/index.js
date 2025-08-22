//  server/src/index.js

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import messageRoutes from "./routes/messages.js";
import Message from "./models/Message.js";
import { verifyToken } from "../src/controllers/authController.js";
import User from "./models/User.js";

dotenv.config();
const PORT = process.env.PORT || 5000;
const cors = require("cors");

// ✅ Setup Express app


// ✅ Get allowed origins from env
// const allowedOrigins = (process.env.CLIENT_URL || "")
//   .split(",")
//   .map(origin => origin.trim());
const allowedOrigins = [
  "https://chat-app-nine-delta-31.vercel.app/", // your actual Vercel frontend URL
  "http://localhost:5173",                   // for local testing (optional)
];
// ✅ Setup CORS
// app.use(cors({
//   origin: allowedOrigins,
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"]
// }));


app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin like mobile apps or curl
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => res.send("✅ Backend is live"));

// ✅ Error Handling
app.use((req, res) => res.status(404).json({ error: "Not Found" }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

// ✅ Socket.IO setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"]
  }
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("⚡ Socket connected:", socket.id);

  socket.on("setup", (userId) => {
    socket.join(userId);
    socket.emit("connected");
  });

  socket.on("new message", async (msg) => {
    const { from, to, text } = msg;
    if (!from || !to || !text?.trim()) return;
    try {
      const savedMsg = await Message.create({ from, to, text });
      io.to(from).emit("message sent", savedMsg);
    } catch (err) {
      console.error("❌ Error:", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Disconnected:", socket.id);
  });
});

// ✅ Connect to DB and start server
connectDB()
  .then(() => server.listen(PORT, () => {
    console.log(`✅ Server running on ${PORT}`);
  }))
  .catch(err => {
    console.error("❌ DB connection error:", err);
  });
