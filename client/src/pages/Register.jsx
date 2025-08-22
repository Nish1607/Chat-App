// client/src/pages/Register.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import axiosInstance from "../Utils/axiosInstance";
import ProfilePictureModal from "../components/ProfilePictureModal";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [message, setMessage] = useState({ text: "", error: false });
  const [showModal, setShowModal] = useState(false);
  const [newUserId, setNewUserId] = useState(null);

  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleRegister = async (data) => {
    try {
      const res = await axiosInstance.post("/auth/register", data);
      // console.log(" FULL REGISTER RESPONSE:", res.data);

      const user = res.data.user || res.data;
      const token = res.data.token;

      // if (!user || !token) throw new Error("Missing user or token");

      localStorage.setItem("token", token);
      // console.log(token);
      localStorage.setItem("chat-user", JSON.stringify(user));
      setUser(user);
      setNewUserId(user.id || user._id);
      setShowModal(true);
      setMessage({ text: "Account created! Please select a profile picture.", error: false });

    } catch (err) {
      console.error(" Registration failed:", err.response?.data?.message || err.message);
      setMessage({
        text: err.response?.data?.message || "Registration failed",
        error: true,
      });
    }
  };

  const handleProfileSelect = async (profilePic) => {
    try {
      await axiosInstance.put(`/auth/profile/${newUserId}`, { profilePic });
      const updatedUser = { ...JSON.parse(localStorage.getItem("chat-user")), profilePic };
      localStorage.setItem("chat-user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      navigate("/chat");
    } catch (err) {
      console.error("❌ Failed to update profile picture", err);
      navigate("/chat"); // still proceed
    }
  };

  return (
    <>
      <div className="w-full min-h-screen bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <AuthForm type="register" onSubmit={handleRegister} message={message} />
        </div>
      </div>

      {showModal && (
        <ProfilePictureModal
          onSelect={handleProfileSelect}
          onClose={() => navigate("/chat")} // skip option
        />
      )}
    </>
  );
};

export default Register;
