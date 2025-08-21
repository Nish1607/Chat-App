import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Register
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check for duplicate username 
    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(409).json({ message: "Username already taken." });

    // Check for duplicate email
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already in use." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // ✅ Generate token after successful registration
    // const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    //   expiresIn: "7d",
    // });
    const token = jwt.sign(
  {
    id: user._id,
    username: user.username,
    profilePic: user.profilePic, // optional, but useful for UI
  },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);

    // ✅ Return user and token like login
    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        nickname: user.nickname || "",
        profilePic: user.profilePic || "",
      },
    });

  } catch (err) {
    console.error("❌ Registration Error:", err);
    return res.status(500).json({ error: err.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email & password required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    //   expiresIn: "7d",
    const token = jwt.sign(
  {
    id: user._id,
    username: user.username,
    profilePic: user.profilePic, // optional, but useful for UI
  },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);
    
    console.log("🎟️ NEW token issued:", token);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        nickname: user.nickname || "",
        profilePic: user.profilePic || "",
      },
    });

  } catch (err) {
    console.error("❌ Login Error:", err);
    return res.status(500).json({ error: err.message });
  }
};

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  // console.log("🛡️ Auth Header:", authHeader); // Debug line
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access Denied: No token provided" });
  }

  // Extract token
  const token = authHeader.split(" ")[1];

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    req.user = verified; 
    next();
  } catch (err) {
    console.error("❌ Token Verification Error:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }

};