
import { useEffect, useRef, useState } from "react";
import socket from "../lib/socket";

export default function ChatWindow({
  selectedUser,
  onNewMessage,
  currentUser,   
  avatarBust,   
  onBack 
}) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Join socket room for me
  useEffect(() => {
    if (currentUser?._id) {
      socket.emit("setup", currentUser._id);
    }
  }, [currentUser?._id]);

  // Fetch thread + mark seen when partner changes
  useEffect(() => {
    const token = localStorage.getItem("token");
    const me = currentUser?._id;
    const partner = selectedUser?._id;

    if (!me || !partner) return;

    setMessages([]);

    (async () => {
      try {
        const res = await fetch(`${API}/api/messages/${me}/${partner}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        //tryy debugging
           if (!Array.isArray(data)) {
      console.error("❌ Messages response is not an array:", data);
      return;
    }
        setMessages(data);

        await fetch(`${API}/api/messages/markseen/${partner}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (e) {
        console.error("❌ Fetch messages failed:", e);
      }
      }, [currentUser?._id, selectedUser?._id]);
    // })();

    const handler = (msg) => {
      const match =
        (String(msg.from) === String(partner) && String(msg.to) === String(me)) ||
        (String(msg.from) === String(me) && String(msg.to) === String(partner));
      if (!match) return;

      setMessages((prev) => {
        const exists = prev.some((m) => m._id === msg._id);
        return exists ? prev : [...prev, msg];
      });

      onNewMessage?.(msg);
    };

    socket.on("message received", handler);
    return () => socket.off("message received", handler);
  }, [currentUser?._id, selectedUser?._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const payload = {
      from: currentUser._id,
      to: selectedUser._id,
      text: text.trim(),
    };

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const newMessage = await res.json();

      // echo to my UI (your server may also emit)
      socket.emit("message received", {
        ...newMessage,
        createdAt: newMessage.createdAt || new Date(),
      });

      setText("");
    } catch (err) {
      console.error("❌ Failed to send message:", err);
    }
  };

  const groupMessagesByDate = (msgs) => {
    const groups = {};
    msgs.forEach((msg) => {
      const date = new Date(msg.createdAt);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);

      let label;
      if (date >= today) label = "Today";
      else if (date >= yesterday) label = "Yesterday";
      else {
        label = date.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" });
      }
      (groups[label] ||= []).push(msg);
    });
    return groups;
  };

  if (!selectedUser) {
    return (
      <section className="flex flex-col flex-1 bg-gray-50 h-full items-center justify-center">
        <p className="text-gray-400 text-lg">Select a user to start chatting</p>
      </section>
    );
  }

  // helper: build cache-busted avatar URL
  const imgSrcFor = (user) => {
    const url = user?.profilePic || "/avatars/default.jpg";
    const bust = avatarBust?.[user?._id] || 0;
    return `${url}${url.includes("?") ? "&" : "?"}v=${bust}`;
  };

  return (
    <section className="flex flex-col flex-1 bg-gray-50 h-[calc(100vh-4rem)]">
      {/* Mobile back bar */}
{/* <div className="sm:hidden sticky top-16 z-10 bg-gray-50/95 backdrop-blur px-4 py-2 border-b flex items-center gap-3"> */}
 <div className="sm:hidden sticky top-0 z-30 bg-white/90 backdrop-blur px-4 py-2 border-b flex items-center gap-3">

  <button
    onClick={onBack}
    className="p-2 -ml-2 rounded-md hover:bg-gray-100"
    aria-label="Back to chats"
  >
    {/* simple left chevron */}
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </button>

  {/* tiny avatar + name */}
  {(() => {
    const url = selectedUser?.profilePic || "/avatars/default.jpg";
    const bust = avatarBust?.[selectedUser?._id] || 0;
    const src = `${url}${url.includes("?") ? "&" : "?"}v=${bust}`;
    return (
      <>
        <img src={src} alt={selectedUser?.username} className="w-8 h-8 rounded-full object-cover" />
        <div className="font-medium truncate">{selectedUser?.username}</div>
      </>
    );
  })()}
</div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 pt-16">
        {Object.entries(groupMessagesByDate(messages)).map(([dateLabel, msgs]) => (
          <div key={dateLabel}>
            <div className="sticky top-0 z-10 py-1">
              <p className="text-center text-sm font-medium text-gray-500">{dateLabel}</p>
            </div>

            {msgs.map((m) => {
              const mine = String(m.from) === String(currentUser._id);
              const who = mine ? currentUser : selectedUser; // 👈 live user objects
              const avatar = imgSrcFor(who);                // 👈 cache-busted src

              return (
                <div
                  key={m._id || m.id}
                  className={`flex flex-col ${mine ? "items-end" : "items-start"} mt-1`}
                >
                  <div className={`flex gap-2 ${mine ? "flex-row-reverse" : ""}`}>
                    <img
                      src={avatar}
                      alt="avatar"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div
                      className={`px-4 py-2 rounded-lg text-sm max-w-xs ${
                        mine ? "bg-purple-500 text-white" : "bg-gray-200"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                  <div className="text-[0.65rem] text-gray-500 mt-1 mx-10">
                    {new Date(m.createdAt).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      <form onSubmit={send}   className="sticky bottom-0 w-full border-t bg-white px-4 py-3 md:px-6 md:py-4 md:pb-4 pb-[calc(env(safe-area-inset-bottom)+12px)]"
>
       <div className="mx-auto max-w-3xl flex items-center gap-2">
    <input
      type="text"
      value={text}
      onChange={(e) => setText(e.target.value)}
      placeholder="Type a message"
      className="flex-1 min-w-0 w-full px-4 py-3 md:py-2 border rounded-full focus:outline-none"
    />
    <button
      type="submit"
      className="px-6 py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600"
    >
      Send
    </button>
  </div>
</form>
    </section>
  );
}
