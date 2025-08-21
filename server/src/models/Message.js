// server/models/message.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  to:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
seen: { type: Boolean, default: false }, // 👈 add this
}, { timestamps: true });


const Message = mongoose.model("Message", messageSchema);
messageSchema.index({ from: 1, to: 1, createdAt: 1 });
export default Message;
