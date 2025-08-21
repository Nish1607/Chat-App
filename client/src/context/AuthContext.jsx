import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // NEW

  useEffect(() => {
    const storedUser = localStorage.getItem("chat-user");
    // console.log("🔥 LocalStorage user from auth:", storedUser);
  
  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      
      setUser(parsedUser);
    } catch (err) {
      console.error("❌ Error parsing chat-user:", err);
      localStorage.removeItem("chat-user");
    }
  }
    setLoading(false); // ✅ Add this here

}, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
