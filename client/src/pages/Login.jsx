// client/src/pages/Login.jsx
import AuthForm from "../components/AuthForm";
import axiosInstance from "../Utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext"; // adjust path as needed


const Login = () => {
  const [message, setMessage] = useState({ text: "", error: false });
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const handleLogin = async (data) => {
    try {
      const res = await axiosInstance.post("api/auth/login", data);
      const user = res.data.user; 
      const token = res.data.token;
      // console.log("🧾 FULL LOGIN RESPONSE:", res.data);

      if (!user || !token) {
        throw new Error("Missing user or token in response");
      }
      console.log("Base URL is: ", import.meta.env.VITE_API_URL);

      // console.log("✅ Logged in:", res.data);
      localStorage.setItem("token", token);
      localStorage.setItem("chat-user", JSON.stringify(user));
      setUser(user); // important!
      setMessage({ text: "Logged in successfull!", error: false });
      navigate("/chat");


    } catch (err) {

      const msg =
        err.response?.data?.message ||
        err.message ||
        "Login failed";
      setMessage({ text: msg, error: true });
    }
  };

  return (
    <div className="w-full min-h-screen bg-white flex items-center justify-center p-4">
      <AuthForm type="login" onSubmit={handleLogin} message={message} />
    </div>


  );
};

export default Login;