
// import clsx from "clsx";
// import { useEffect, useLayoutEffect, useMemo, useState } from "react";
// import axiosInstance from "../Utils/axiosInstance";
// import socket from "../lib/socket";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faSearch } from "@fortawesome/free-solid-svg-icons";

// export default function Sidebar({ users, setUsers, selectedId, onSelect, avatarBust }) {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [unseenCounts, setUnseenCounts] = useState({});

//   // ---- init client-owned timestamps from users ONCE (prevents first-paint flicker)
//   const [messageTimestamps, setMessageTimestamps] = useState(() => {
//     const init = {};
//     (users || []).forEach((u) => {
//       if (u?.lastMessageAt) init[String(u._id)] = new Date(u.lastMessageAt).toISOString();
//     });
//     return init;
//   });

//   // seed any NEW users that appear later (do it before paint to avoid flicker)
//   useLayoutEffect(() => {
//     let changed = false;
//     const next = { ...messageTimestamps };
//     (users || []).forEach((u) => {
//       const id = String(u._id);
//       if (next[id] == null && u?.lastMessageAt) {
//         next[id] = new Date(u.lastMessageAt).toISOString();
//         changed = true;
//       }
//     });
//     if (changed) setMessageTimestamps(next);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [users]);

//   const currentUser = (() => {
//     try {
//       const token = localStorage.getItem("token");
//       if (token) {
//         const user = JSON.parse(atob(token.split(".")[1]));
//         if (user?.id && !user._id) user._id = user.id;
//         return user;
//       }
//     } catch {
//       return null;
//     }
//   })();

//   if (!currentUser || !currentUser._id) {
//     return <div className="p-4 text-gray-500">Loading user info...</div>;
//   }

//   const filteredUsers = users
//     .filter((u) => u._id !== currentUser._id)
//     .filter((u) => u.username.toLowerCase().includes(searchTerm.toLowerCase()));

//   const toTs = (v) => (v ? new Date(v).getTime() : 0);

//   // ---- ORDER: strictly by client-maintained timestamps (no server fallback here)
//   const sortedFilteredUsers = useMemo(() => {
//     return [...filteredUsers].sort((a, b) => {
//       const ta = toTs(messageTimestamps[a._id]);
//       const tb = toTs(messageTimestamps[b._id]);
//       return tb - ta;
//     });
//   }, [filteredUsers, messageTimestamps]);

//   const formatTimestamp = (timestamp) => {
//     if (!timestamp) return "";
//     const date = new Date(timestamp);
//     const now = new Date();
//     const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//     const yesterday = new Date(today);
//     yesterday.setDate(today.getDate() - 1);

//     if (date >= today) return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
//     if (date >= yesterday) return "Yesterday";
//     if (date.getFullYear() === now.getFullYear())
//       return date.toLocaleDateString([], { month: "short", day: "numeric" });
//     return date.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" });
//   };

//   // ---- Only bump order on NEWER message (send/receive)
//   useEffect(() => {
//     const handleMsg = (msg) => {
//       const otherId = msg.from === currentUser._id ? msg.to : msg.from;
//       const otherIdStr = String(otherId);
//       const incoming = msg.createdAt ? new Date(msg.createdAt).toISOString() : new Date().toISOString();

//       setMessageTimestamps((prev) => {
//         const prevIso = prev[otherIdStr];
//         if (!prevIso || new Date(incoming).getTime() > new Date(prevIso).getTime()) {
//           return { ...prev, [otherIdStr]: incoming };
//         }
//         return prev;
//       });

//       if (
//         String(msg.from) !== String(currentUser._id) &&
//         String(otherId) !== String(selectedId)
//       ) {
//         setUnseenCounts((prev) => ({
//           ...prev,
//           [otherIdStr]: (prev[otherIdStr] || 0) + 1,
//         }));
//       }
//     };

//     socket.on("message received", handleMsg);
//     return () => socket.off("message received", handleMsg);
//   }, [currentUser._id, selectedId]);

//   // ---- Fetch unseen + users; do NOT overwrite timestamps once seeded
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [unseenRes, usersRes] = await Promise.all([
//           axiosInstance.get("/messages/unseen"),
//           axiosInstance.get("/users"),
//         ]);

//         const unseenMap = {};
//         unseenRes.data.forEach(({ _id, count }) => {
//           unseenMap[String(_id)] = count;
//         });
//         setUnseenCounts(unseenMap);

//         setUsers((prevUsers) => {
//           const userMap = new Map(usersRes.data.map((u) => [String(u._id), u]));
//           return prevUsers.map((oldUser) => ({ ...oldUser, ...(userMap.get(String(oldUser._id)) || {}) }));
//         });

//         // seed timestamps for any new users (if useLayoutEffect above missed any race)
//         setMessageTimestamps((prev) => {
//           const next = { ...prev };
//           let changed = false;
//           usersRes.data.forEach((u) => {
//             const id = String(u._id);
//             if (next[id] == null && u?.lastMessageAt) {
//               next[id] = new Date(u.lastMessageAt).toISOString();
//               changed = true;
//             }
//           });
//           return changed ? next : prev;
//         });
//       } catch (err) {
//         console.error("❌ Sidebar fetch failed:", err);
//       }
//     };

//     fetchData();
//     const interval = setInterval(fetchData, 7000);
//     return () => clearInterval(interval);
//   }, [setUsers]);

//   // ---- Selecting a user should NOT affect order
//   const handleSelect = async (user) => {
//     onSelect(user);

//     try {
//       const token = localStorage.getItem("token");
//       await axiosInstance.put(`/messages/markseen/${user._id}`, null, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//     } catch (err) {
//       console.error("❌ Failed to mark messages as seen:", err);
//     }

//     setUnseenCounts((prev) => ({
//       ...prev,
//       [String(user._id)]: 0,
//     }));
//   };

//   return (
//     <aside className="w-full lg:w-72 border-r bg-white overflow-y-auto">
//       <div className="px-4 pb-4 pt-8 relative">
//         <input
//           type="text"
//           placeholder="Search users"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring focus:ring-indigo-300"
//         />
//         <FontAwesomeIcon
//           icon={faSearch}
//           className="absolute right-6 top-1/2 translate-y-1/2 text-gray-400 pointer-events-none"
//         />
//       </div>

//       <ul className="space-y-1 px-2">
//         {sortedFilteredUsers.map((user) => {
//           const count = unseenCounts[String(user._id)] || 0;
//           const displayTime = messageTimestamps[user._id] ?? user.lastMessageAt;

//           // ✅ compute cache-busted avatar URL INSIDE the map (user is in scope here)
//           const bust = avatarBust?.[user._id] || 0;
//           const url = user.profilePic || "/avatars/default.jpg";
//           const imgSrc = `${url}${url.includes("?") ? "&" : "?"}v=${bust}`;

//           return (
//             <li
//               key={user._id}
//               onClick={() => handleSelect(user)}
//               className={clsx(
//                 "flex items-center justify-between gap-3 px-4 py-2 cursor-pointer hover:bg-indigo-50 transition rounded-md",
//                 selectedId === user._id && "bg-indigo-100 border-l-4 border-indigo-500"
//               )}
//             >
//               <div className="flex items-center gap-3 overflow-hidden">
//                 <div className="relative">
//                   <img
//                     src={imgSrc}
//                     alt={user.username}
//                     className="w-10 h-10 rounded-full object-cover"
//                   />
//                   <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full" />
//                 </div>
//                 <div className="flex flex-col truncate">
//                   <span className="truncate font-medium">{user.username}</span>
//                 </div>
//               </div>

//               <div className="flex flex-col items-end justify-between h-10 min-w-[60px]">
//                 <span className="text-xs text-gray-500 whitespace-nowrap leading-none">
//                   {displayTime ? formatTimestamp(displayTime) : ""}
//                 </span>
//                 {count > 0 && (
//                   <span className="bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center mt-1">
//                     {count}
//                   </span>
//                 )}
//               </div>
//             </li>
//           );
//         })}
//       </ul>
//     </aside>
//   );
// }


import clsx from "clsx";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import axiosInstance from "../Utils/axiosInstance";
import socket from "../lib/socket";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

export default function Sidebar({ users, setUsers, selectedId, onSelect, avatarBust }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [unseenCounts, setUnseenCounts] = useState({});

  // seed timestamps once
  const [messageTimestamps, setMessageTimestamps] = useState(() => {
    const init = {};
    (users || []).forEach((u) => {
      if (u?.lastMessageAt) init[String(u._id)] = new Date(u.lastMessageAt).toISOString();
    });
    return init;
  });

  useLayoutEffect(() => {
    let changed = false;
    const next = { ...messageTimestamps };
    (users || []).forEach((u) => {
      const id = String(u._id);
      if (next[id] == null && u?.lastMessageAt) {
        next[id] = new Date(u.lastMessageAt).toISOString();
        changed = true;
      }
    });
    if (changed) setMessageTimestamps(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users]);

  const currentUser = (() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const user = JSON.parse(atob(token.split(".")[1]));
        if (user?.id && !user._id) user._id = user.id;
        return user;
      }
    } catch {
      return null;
    }
  })();

  if (!currentUser || !currentUser._id) {
    return <div className="p-4 text-gray-500">Loading user info...</div>;
  }

  const filteredUsers = users
    .filter((u) => u._id !== currentUser._id)
    .filter((u) => u.username.toLowerCase().includes(searchTerm.toLowerCase()));

  const toTs = (v) => (v ? new Date(v).getTime() : 0);

  const sortedFilteredUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      const ta = toTs(messageTimestamps[a._id]);
      const tb = toTs(messageTimestamps[b._id]);
      return tb - ta;
    });
  }, [filteredUsers, messageTimestamps]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date >= today) return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    if (date >= yesterday) return "Yesterday";
    if (date.getFullYear() === now.getFullYear())
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    return date.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" });
  };

  // bump order only on NEWER message
  useEffect(() => {
    const handleMsg = (msg) => {
      const otherId = msg.from === currentUser._id ? msg.to : msg.from;
      const otherIdStr = String(otherId);
      const incoming = msg.createdAt ? new Date(msg.createdAt).toISOString() : new Date().toISOString();

      setMessageTimestamps((prev) => {
        const prevIso = prev[otherIdStr];
        if (!prevIso || new Date(incoming).getTime() > new Date(prevIso).getTime()) {
          return { ...prev, [otherIdStr]: incoming };
        }
        return prev;
      });

      if (String(msg.from) !== String(currentUser._id) && String(otherId) !== String(selectedId)) {
        setUnseenCounts((prev) => ({ ...prev, [otherIdStr]: (prev[otherIdStr] || 0) + 1 }));
      }
    };

    socket.on("message received", handleMsg);
    return () => socket.off("message received", handleMsg);
  }, [currentUser._id, selectedId]);

  // unseen + users refresh
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [unseenRes, usersRes] = await Promise.all([
          axiosInstance.get("/messages/unseen"),
          axiosInstance.get("/users"),
        ]);

        const unseenMap = {};
        unseenRes.data.forEach(({ _id, count }) => {
          unseenMap[String(_id)] = count;
        });
        setUnseenCounts(unseenMap);

        setUsers((prevUsers) => {
          const userMap = new Map(usersRes.data.map((u) => [String(u._id), u]));
          return prevUsers.map((oldUser) => ({ ...oldUser, ...(userMap.get(String(oldUser._id)) || {}) }));
        });

        setMessageTimestamps((prev) => {
          const next = { ...prev };
          let changed = false;
          usersRes.data.forEach((u) => {
            const id = String(u._id);
            if (next[id] == null && u?.lastMessageAt) {
              next[id] = new Date(u.lastMessageAt).toISOString();
              changed = true;
            }
          });
          return changed ? next : prev;
        });
      } catch (err) {
        console.error("❌ Sidebar fetch failed:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 7000);
    return () => clearInterval(interval);
  }, [setUsers]);

  const handleSelect = async (user) => {
    onSelect(user);
    try {
      const token = localStorage.getItem("token");
      await axiosInstance.put(`/messages/markseen/${user._id}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("❌ Failed to mark messages as seen:", err);
    }
    setUnseenCounts((prev) => ({ ...prev, [String(user._id)]: 0 }));
  };

  return (
    // 💡 FULL PAGE on mobile: h-[calc(100vh-4rem)] assumes your header is h-16
    // becomes a 18rem panel only on lg+
    <aside className="flex flex-col w-full h-[calc(100vh-4rem)] lg:h-auto lg:w-72 bg-white lg:border-r overflow-hidden">
      {/* Search */}
      <div className="relative px-4 py-4 border-b">
        <input
          type="text"
          placeholder="Search users"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-gray-300 rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring focus:ring-indigo-300"
        />
        <FontAwesomeIcon
          icon={faSearch}
          className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto">
        <ul className="space-y-1 px-2 py-2">
          {sortedFilteredUsers.map((user) => {
            const count = unseenCounts[String(user._id)] || 0;
            const displayTime = messageTimestamps[user._id] ?? user.lastMessageAt;

            const bust = avatarBust?.[user._id] || 0;
            const url = user.profilePic || "/avatars/default.jpg";
            const imgSrc = `${url}${url.includes("?") ? "&" : "?"}v=${bust}`;

            return (
              <li
                key={user._id}
                onClick={() => handleSelect(user)}
                className={clsx(
                  "flex items-center justify-between gap-3 px-4 py-2 cursor-pointer hover:bg-indigo-50 transition rounded-md",
                  selectedId === user._id && "bg-indigo-100 border-l-4 border-indigo-500"
                )}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="relative">
                    <img
                      src={imgSrc}
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full" />
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="truncate font-medium">{user.username}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between h-10 min-w-[60px]">
                  <span className="text-xs text-gray-500 whitespace-nowrap leading-none">
                    {displayTime ? formatTimestamp(displayTime) : ""}
                  </span>
                  {count > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center mt-1">
                      {count}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
