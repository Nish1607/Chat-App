import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    nickname: {
      type: String,
      default: ""
    },
    profilePic: {
      type: String,
      default: "" // You can add a default avatar URL here
    },
    profilePicVersion: {
      type: Number,
      default: 0
    },

    isOnline: {
      type: Boolean,
      default: false
    },
    socketId: {
      type: String,
      default: ""
    },
    lastMessageAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
