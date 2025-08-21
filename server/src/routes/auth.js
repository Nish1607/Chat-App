import express from "express";
import { register, login } from "../controllers/authController.js";
import User from "../models/User.js";
const router = express.Router();
import jwt from "jsonwebtoken";
router.post("/register", register);
router.post("/login", login);
// router.get("/ping", (req, res) => res.send("pong ✅"));

router.put("/profile/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { profilePic } = req.body;

    if (!profilePic) {
      return res.status(400).json({ message: "No profile picture URL provided" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { profilePic },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Profile picture updated", user: updatedUser });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Failed to update profile picture" });
  }
});

export default router;
