import { BellIcon } from "@heroicons/react/24/outline";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EditProfile from "./EditProfile";
import axiosInstance from "../Utils/axiosInstance";

export default function Header({ onProfileUpdated,onOpenSidebar}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // include _id so we can read/write a persistent bust value
  const [userState, setUserState] = useState(() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return {};
      const payload = JSON.parse(atob(token.split(".")[1]));
      const _id = payload._id || payload.id;
      return {
        _id,
        username: payload.username,
        profilePic: payload.profilePic,
        profilePicVersion: payload.profilePicVersion, // may be undefined
        _bust: 0, // local cache-buster
      };
    } catch {
      return {};
    }
  });

  const dropdownRef = useRef();
  const profileRef = useRef();
  const navigate = useNavigate();

  // 🔑 Fetch the fresh user on mount so refresh shows the new avatar
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axiosInstance
      .get("/users/login", { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => {
        const u = data.user || {};
        // also load any persisted bust fallback (if no version field)
        const persistedBust = u._id ? Number(localStorage.getItem(`avatarBust:${u._id}`)) || 0 : 0;
        setUserState((prev) => ({
          ...prev,
          ...u,
          _bust: persistedBust || prev._bust || 0,
        }));
      })
      .catch((err) => {
        console.error("Failed to load current user:", err);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Called by EditProfile after successful PUT
  const handleProfileUpdatedLocal = (updatedUser) => {
    // if backend returns profilePicVersion, prefer it; otherwise bump local bust and persist
    const hasVersion = typeof updatedUser.profilePicVersion === "number";
    const newBust = Date.now();

    if (updatedUser._id) {
      localStorage.setItem(`avatarBust:${updatedUser._id}`, String(newBust));
    }

    setUserState((prev) => ({
      ...prev,
      ...updatedUser,
      _bust: hasVersion ? prev._bust : newBust, // if no version, use local bust
    }));

    setShowEditModal(false);

    // notify parent (ChatPage) so Sidebar/ChatWindow can update too
    if (typeof onProfileUpdated === "function") onProfileUpdated(updatedUser);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        profileRef.current &&
        !profileRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 📸 cache-busted URL: prefer server version; else use persisted local bust
  const raw = userState.profilePic || "/avatars/default.jpg";
  const version =
    typeof userState.profilePicVersion === "number"
      ? userState.profilePicVersion
      : Number(localStorage.getItem(`avatarBust:${userState._id}`)) || userState._bust || 0;
  const imgSrc = `${raw}${raw.includes("?") ? "&" : "?"}v=${version}`;

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white border-b shadow-sm sticky top-0 z-50">
      <h1 className="text-xl font-bold">Chat-Time</h1>
{/* <button
  onClick={onOpenSidebar}
  className="sm:hidden -ml-2 mr-2 p-2 rounded-md hover:bg-gray-100"
  aria-label="Open sidebar"
>
  <Bars3Icon className="h-6 w-6 text-gray-700" />
</button> */}
      <div className="flex items-center gap-4">
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setOpen(!open)} className="relative">
            <BellIcon className="h-6 w-6 text-gray-700" />
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white"></span>
          </button>
          {open && (
            <div className="absolute left-[-241px] mt-6 w-72 bg-white shadow-md rounded-md border z-50">
              <ul className="divide-y divide-gray-200 text-left"></ul>
            </div>
          )}
        </div>

        <div ref={profileRef} className="relative">
          <div
            className="w-10 h-10 rounded-full bg-gray-300 hover:scale-105 transition cursor-pointer"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {/* cache-busted header avatar */}
            <img
              src={imgSrc}
              alt="Profile"
              className="w-full h-full rounded-full object-cover"
            />
          </div>

          {menuOpen && (
            <div className="absolute right-0 top-[57px] w-[12rem] bg-white border shadow-lg rounded-md z-50">
              <ul className="text-gray-700 text-lg">
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setMenuOpen(false);
                    setShowEditModal(true);
                  }}
                >
                  Edit Profile
                </li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  Settings
                </li>
                <li
                  className="px-4 py-2 text-red-500 hover:bg-gray-100 cursor-pointer"
                  onClick={handleLogout}
                >
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {showEditModal && (
        <EditProfile
          currentUser={userState}
          onClose={() => setShowEditModal(false)}
          onProfileUpdated={handleProfileUpdatedLocal}
        />
      )}
    </header>
  );
}

