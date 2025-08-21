
import React, { useEffect, useState } from "react";
import ProfilePictureModal from "./ProfilePictureModal";
import axiosInstance from "../Utils/axiosInstance";

const EditProfile = ({ onClose, onProfileUpdated }) => {
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);


 useEffect(() => {
  const fetchUser = async () => {
    // setLoading(true);

    const token = localStorage.getItem("token");
    // console.log("🪪 Token:", token);

    if (!token) {
      alert("No token found. You may be logged out.");
      setLoading(false);
      return;
    }

    try {
      const res = await axiosInstance.get("/users/login", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("👤 User data:", res.data);

      const { username, profilePic } = res.data.user;
      setUsername(username);
      setSelectedAvatar(profilePic || "/avatars/default.jpg");
    } catch (err) {
      console.error("❌ Failed to fetch user:", err.response || err.message || err);
      alert("Error fetching user data.");
    } finally {
      setLoading(false);
    }
  };

  fetchUser();
}, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axiosInstance.put(
        "/users/update-avatar",
        { profilePic: selectedAvatar },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      onProfileUpdated(res.data.user); // update parent state
      onClose();
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile.");
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-sm shadow-md space-y-6">
        <h2 className="text-lg font-semibold text-center text-gray-700">Edit Profile</h2>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Username
          </label>
          <div className="px-3 py-2 bg-gray-100 border rounded text-gray-800">
            {username || "Unknown"}
          </div>
        </div>

        <div className="flex flex-col items-center space-y-2">
          <img
            src={selectedAvatar}
            alt="Avatar"
            className="w-20 h-20 rounded-full object-cover border"
          />
          <button
            onClick={() => setShowAvatarModal(true)}
            className="text-sm text-blue-600 hover:underline"
          >
            Change Avatar
          </button>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Save
          </button>
        </div>
      </div>

      {showAvatarModal && (
        <ProfilePictureModal
          onSelect={(url) => {
            setSelectedAvatar(url);
            setShowAvatarModal(false);
          }}
          onClose={() => setShowAvatarModal(false)}
        />
      )}
    </div>
  );
};

export default EditProfile;
