
// src/pages/ChatPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import axiosInstance from "../Utils/axiosInstance";
import socket from "../lib/socket";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

export default function ChatPage() {
  
  const [avatarBust, setAvatarBust] = useState({});
const [sidebarOpen, setSidebarOpen] = useState(false);
const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [me, setMe] = useState(() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      const decoded = JSON.parse(atob(token.split(".")[1]));
      if (decoded?.id && !decoded._id) decoded._id = decoded.id;
      return decoded;
    } catch {
      return null;
    }
  });


  useEffect(() => {
  const onResize = () => setIsMobile(window.innerWidth < 1024);
  window.addEventListener("resize", onResize);
  return () => window.removeEventListener("resize", onResize);
}, []);

  useEffect(() => {
    // fetch fresh user on mount so refresh shows updated avatar
    const token = localStorage.getItem("token");
    if (!token) return;
    axiosInstance
      .get("/users/login", { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => {
        if (data?.user) setMe(data.user);
      })
      .catch((err) => console.error("❌ Fetch me failed:", err));
  }, []);

  // ---- users, selection, messages
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);

  // ---- handle profile updated from Header/EditProfile
  const handleProfileUpdated = (u) => {
    setUsers((prev) =>
      prev.map((x) => (String(x._id) === String(u._id) ? { ...x, profilePic: u.profilePic } : x))
    );
    setSelectedUser((prev) =>
      prev && String(prev._id) === String(u._id) ? { ...prev, profilePic: u.profilePic } : prev
    );
    if (me && String(me._id) === String(u._id)) setMe((prev) => ({ ...prev, profilePic: u.profilePic }));
    setAvatarBust((prev) => ({ ...prev, [u._id]: Date.now() })); // 👈 bust cache
  };

  // ---- fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axiosInstance.get("/users");
        setUsers(res.data);
      } catch (err) {
        console.error("❌ Fetch users failed:", err);
      }
    };
    const t = setTimeout(fetchUsers, 300);
    return () => clearTimeout(t);
  }, []);

  // ---- listen for other users' avatar updates
  useEffect(() => {
    const onProfile = ({ userId, profilePic, profilePicVersion }) => {
      setUsers((prev) =>
        prev.map((u) =>
          String(u._id) === String(userId)
            ? { ...u, profilePic, profilePicVersion }
            : u
        )
      );
      setSelectedUser((prev) =>
        prev && String(prev._id) === String(userId)
          ? { ...prev, profilePic, profilePicVersion }
          : prev
      );
      if (me && String(me._id) === String(userId)) {
        setMe((prev) => ({ ...prev, profilePic, profilePicVersion }));
      }
      // 👇 force <img> to refetch
      setAvatarBust((prev) => ({ ...prev, [userId]: Date.now() }));
    };

    socket.on("user:profile_updated", onProfile);
    return () => socket.off("user:profile_updated", onProfile);
  }, [me]);

  // ---- fetch messages when selecting a user
  useEffect(() => {
    if (!selectedUser?._id || !me?._id) return;

    const token = localStorage.getItem("token");

    axios
      // .put(`http://localhost:5000/api/messages/markseen/${selectedUser._id}`, null, {
        .put(`${API}/messages/markseen/${selectedUser._id}`, null, {

        headers: { Authorization: `Bearer ${token}` },
      })
      .catch((err) => console.error("❌ Mark seen failed:", err));

    axios
      // .get(`http://localhost:5000/api/messages/${me._id}/${selectedUser._id}`, {
        .get(`${API}/messages/${me._id}/${selectedUser._id}`, {

        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setMessages(res.data))
      .catch((err) => console.error("❌ Fetch messages failed:", err));
  }, [selectedUser?._id, me?._id]);

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans shadow-2xl">
      <Header onProfileUpdated={handleProfileUpdated} onOpenSidebar={() => setSidebarOpen(true)}/>
     

      
<main className="flex flex-1 overflow-hidden">
  {isMobile ? (
    // MOBILE: list OR chat full width (Header stays on top)
    !selectedUser ? (
      <Sidebar
        users={users}
        setUsers={setUsers}
        selectedId={selectedUser?._id}
        onSelect={setSelectedUser}
        avatarBust={avatarBust}
      />
    ) : (
      me && (
        <ChatWindow
          key={selectedUser._id}
          selectedUser={selectedUser}
          messages={messages}
          setMessages={setMessages}
          currentUser={me}
          avatarBust={avatarBust}
          onBack={() => setSelectedUser(null)}
        />
      )
    )
  ) : (
    // DESKTOP: split view; only here do we constrain sidebar width
    <>
      <div className="w-72 shrink-0 border-r bg-white">
        <Sidebar
          users={users}
          setUsers={setUsers}
          selectedId={selectedUser?._id}
          onSelect={setSelectedUser}
          avatarBust={avatarBust}
        />
      </div>
      <div className="flex-1">
        {selectedUser && me ? (
          <ChatWindow
            key={selectedUser._id}
            selectedUser={selectedUser}
            messages={messages}
            setMessages={setMessages}
            currentUser={me}
            avatarBust={avatarBust}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            Select a user to start chatting
          </div>
        )}
      </div>
    </>
  )}
</main>




    </div>
  );
}
