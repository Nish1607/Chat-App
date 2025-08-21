import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import './App.css'
import ProtectedRoute from "./components/ProtectedRoute";
import ChatPage   from "./pages/ChatPage";      // ⬅️  NEW
import { Navigate } from "react-router-dom";
import socket from "./lib/socket";
// import user from '../../server/src/models/User';
import { useAuth } from "./context/AuthContext";   // ← context we created

function App() {
  const [count, setCount] = useState(0);
    const { user } = useAuth();  // <-- or however you fetch the logged-in user

  useEffect(() => {
  if (user?.id) socket.emit("setup", user.id);
}, [user]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/chat"          
          element={
            <ProtectedRoute>
              <ChatPage />      
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/chat" replace />} />
       
    </Routes>
    </BrowserRouter>
  )
}

export default App
