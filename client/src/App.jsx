// import { useState, useEffect } from "react";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import './App.css'
// import ProtectedRoute from "./components/ProtectedRoute";
// import ChatPage   from "./pages/ChatPage";      // ⬅️  NEW
// import { Navigate } from "react-router-dom";
// import socket from "./lib/socket";
// // import user from '../../server/src/models/User';
// import { useAuth } from "./context/AuthContext";   // ← context we created

// function App() {
//   const [count, setCount] = useState(0);
//     const { user } = useAuth();  // <-- or however you fetch the logged-in user

//   useEffect(() => {
//   if (user?.id) socket.emit("setup", user.id);
// }, [user]);

//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<Register />} />
//         <Route
//           path="/chat"          
//           element={
//             <ProtectedRoute>
//               <ChatPage />      
//             </ProtectedRoute>
//           }
//         />
//         <Route path="*" element={<Navigate to="/chat" replace />} />
       
//     </Routes>
//     </BrowserRouter>
//   )
// }

// export default App


import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ChatPage from "./pages/ChatPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";  // ⬅️ import layout
import { useAuth } from "./context/AuthContext";
import { useState, useEffect } from "react";
import socket from "./lib/socket";

function App() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [avatarBust, setAvatarBust] = useState({});

  useEffect(() => {
    if (user?.id) socket.emit("setup", user.id);
  }, [user]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout
                users={users}
                setUsers={setUsers}
                selectedId={selectedId}
                onSelect={setSelectedId}
                avatarBust={avatarBust}
              />
            </ProtectedRoute>
          }
        >
          <Route path="chat" element={<ChatPage />} />
          {/* Add more nested routes if needed */}
        </Route>

        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
