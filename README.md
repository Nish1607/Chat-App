# 💬 MERN Real-Time Chat App

A modern full-stack real-time chat app built with **React, Node.js, Express, MongoDB**, and **Socket.IO**. It features:

- Live messaging with **unseen message count**
- Chat history **grouped by date**
- **Responsive UI** built using **Tailwind CSS**
- **JWT-based authentication**
- Deployment with **Vercel** and **Render**
---

## 🚀 Live Project

- 🔗 **Frontend**: [https://chat-app-nine-delta-31.vercel.app](https://chat-app-nine-delta-31.vercel.app)  
- 🛠 **Backend**: [https://chat-app-7937.onrender.com](https://chat-app-7937.onrender.com)

---

## 🌟 Features

### 📲 Real-Time Chat
- Instant messaging powered by **Socket.IO**
- Unseen messages are shown as **badge counts** next to users
- Messages are **grouped by date** (Today, Yesterday, etc.)

### 🔐 Authentication
- Secure JWT login & registration
- Token stored in `localStorage`
- Auto refresh profile & chat on login

### 📋 User List
- Shows all registered users
- Display last message time
- Show **unseen messages** for each user

### 💬 Chat History
- Sorted and **grouped by date**
- Seen/unseen status updated live
- Responsive design for both mobile and desktop

### 🌍 Deployment
- Frontend on **Vercel**
- Backend on **Render**
- CORS and `.env` ready for production

---
root/
├── client/ # Frontend (React + Vite)
│ ├── src/
│ ├── vercel.json # SPA routing config
│ └── .env # VITE_API_URL and VITE_SOCKET_URL
│
├── server/ # Backend (Express + MongoDB)
│ ├── routes/
│ ├── models/
│ ├── config/
│ └── src/index.js
│
└── README.md

---

## ⚙️ Environment Setup

### 🔧 Server `.env`

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
VITE_API_URL=https://your-backend-url.onrender.com/api
VITE_SOCKET_URL=https://your-backend-url.onrender.com
###Run Locally
Backend--
cd server
npm install
node src/index.js
Frontend--
cd client
npm install
npm run dev

##Future Improvements

🔜 Typing indicator
🔜 Dark mode
🔜 Push notifications
🔜 Read receipts
🔜 Chat delete/edit/archive
🔜 create Group with admin

🙋‍♀️ Author

Nishi Patel
📧 nishisoni98@gmail.com



