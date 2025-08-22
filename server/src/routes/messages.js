//messages.js

import { Router } from "express";
import mongoose from "mongoose";          
import Message from "../models/Message.js";
import express from "express";
import User from "../models/User.js"; // ✅ ADD THIS LINE
import { verifyToken } from "../controllers/authController.js";
const { Types } = mongoose;               
const router = express.Router();

//* -------- POST /api/messages -------- */
router.post("/", async (req, res) => {
  let { from, to, text } = req.body;

  from = from?.trim();
  to = to?.trim();

  if (!Types.ObjectId.isValid(from) || !Types.ObjectId.isValid(to)) {
    return res.status(400).json({ error: "`from` and `to` must be valid ObjectId strings" });
  }

  if (!text || !text.trim()) {
    return res.status(400).json({ error: "`text` is required" });
  }

  try {
    // 1. Save the message
    const savedMessage = await Message.create({ from, to, text });

    // 2. Update lastMessageAt for both users
    await User.updateMany(
      { _id: { $in: [from, to] } },
      { $set: { lastMessageAt: savedMessage.createdAt } }
    );

    // 3. Emit message with createdAt to both sender and receiver
    const io = req.app.get("io");
    if (io) {
      const msgPayload = {
        ...savedMessage.toObject(),
        createdAt: savedMessage.createdAt,
      };

      io.to(to).emit("message received", msgPayload);
      io.to(from).emit("message received", msgPayload);
    }

    // 4. Return the message
    res.status(201).json(savedMessage);
  } catch (err) {
    console.error("Message creation error:", err);
    res.status(500).json({ error: err.message });
  }
});


/* -------- GET /api/messages/:from/:to -------- */
router.get("/:from/:to", verifyToken, async (req, res) => {
  const { from, to } = req.params;

  if (!Types.ObjectId.isValid(from) || !Types.ObjectId.isValid(to)) {
    return res.status(400).json({ error: "Invalid user ids" });
  }

  try {
    const messages = await Message.find({
      $or: [
        { from, to },
        { from: to, to: from },
      ],
    }).sort("createdAt");

    console.log("📦 Messages returned:", messages.length);
    res.json(messages);
  } catch (err) {
    console.error("❌ Fetch messages error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* -------- GET /api/messages/unseen -------- */
router.get("/unseen", verifyToken, async (req, res) => {
  const userId = req.user.id;
  if (!Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "Invalid user id" });
  }

  try {
    const unseenCounts = await Message.aggregate([
      {
        $match: {
          to: new mongoose.Types.ObjectId(userId),
          seen: false,
        },
      },
      {
        $group: {
          _id: "$from",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json(unseenCounts);
  } catch (err) {
    console.error("Unseen error:", err);
    res.status(500).json({ error: "Failed to get unseen messages count" });
  }
});

/* -------- PUT /api/messages/markseen/:userId -------- */
router.put("/markseen/:userId", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const fromUser = req.params.userId?.trim();

  if (!Types.ObjectId.isValid(fromUser) || !Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "Invalid user ids!" });
  }

  try {
    await Message.updateMany(
      { from: fromUser, to: userId, seen: false },
      { $set: { seen: true } }
    );

    console.log("fromUser:", fromUser);
    console.log("loggedInUserId:", userId);

    res.json({ success: true });
  } catch (err) {
    console.error("Mark seen error:", err);
    res.status(500).json({ error: "Failed to mark messages as seen" }); 
  }
});

export default router;