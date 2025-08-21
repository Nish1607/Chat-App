import express from "express";
import User from "../models/User.js";
import Message from "../models/Message.js";
import mongoose from "mongoose";          
import { verifyToken } from "../controllers/authController.js"; // ✅ import it here
const { Types } = mongoose;      
const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  try {
    const currentUserId = req.user.id || req.user._id;

    const users = await User.find({ _id: { $ne: currentUserId } })
      .sort({ lastMessageAt: -1 })
      .select("username profilePic lastMessageAt");

    const usersWithTime = await Promise.all(
      users.map(async (u) => {
        const lastMsg = await Message.findOne({
          $or: [
            { from: currentUserId, to: u._id },
            { from: u._id, to: currentUserId },
          ],
        })
          .sort({ createdAt: -1 })
          .select("createdAt");

        return {
          ...u.toObject(),
          lastMessageAt: lastMsg?.createdAt || null,
        };
      })
    );
 // ✅ Now sort AFTER getting lastMessageAt
    usersWithTime.sort((a, b) => {
      const aTime = new Date(a.lastMessageAt || 0).getTime();
      const bTime = new Date(b.lastMessageAt || 0).getTime();
      return bTime - aTime;
    });
    res.json(usersWithTime);
  } catch (err) {
    console.error("❌ Failed to fetch users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});


// Update avatar and username
// router.put("/update-avatar", verifyToken, async (req, res) => {
//     const userId = req.user.id || req.user._id;
//   const { username, profilePic } = req.body;

//    try {
//     const profilePicVersion = Date.now(); // cache-buster
//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       { profilePic, profilePicVersion },
//       { new: true, select: "username profilePic profilePicVersion" }
//     );

//     // EMIT to everyone who needs to know (or io.emit if simple)
//     req.app.get("io").emit("user:profile_updated", {
//       userId: String(updatedUser._id || userId),
//       profilePic: updatedUser.profilePic,
//       profilePicVersion: updatedUser.profilePicVersion,
//     });

//     res.json({ user: updatedUser });
//   } catch (err) {
//     console.error("Update error:", err.message);
//     res.status(500).json({ error: "Failed to update profile" });
//   }
// });

// PUT /api/users/update-avatar
router.put("/update-avatar", verifyToken, async (req, res) => {
  const userId = req.user.id || req.user._id;
  const { profilePic } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        profilePic,
        $inc: { profilePicVersion: 1 }, // bump cache-buster
      },
      { new: true, select: "_id username profilePic profilePicVersion" }
    );

    // broadcast to all clients (or to rooms of friends if you track that)
    const io = req.app.get("io");
    if (io) {
      io.emit("user:profile_updated", {
        userId: String(updatedUser._id),
        profilePic: updatedUser.profilePic,
        profilePicVersion: updatedUser.profilePicVersion,
      });
    }

    res.json({ user: updatedUser });
  } catch (err) {
    console.error("Update avatar error:", err.message);
    res.status(500).json({ error: "Failed to update profile" });
  }
});
// routes/users.js
router.get("/login", verifyToken, async (req, res) => {
  const userId = req.user._id || req.user.id;
  const user = await User.findById(userId).select("username profilePic");

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({ user });
});



export default router;
