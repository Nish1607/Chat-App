import { useState } from "react";
import React from "react";
import axiosInstance from "../Utils/axiosInstance";
const avatarOptions  = [
  "/avatars/avatar1.jpg",
  "/avatars/avatar2.jpg",
  "/avatars/avatar3.jpg",
  "/avatars/avatar4.jpg",
];

const ProfilePictureModal = ({ onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md space-y-6">
        <h2 className="text-lg font-semibold text-gray-700 text-center">Choose Your Profile Picture</h2>

        <div className="grid grid-cols-2 gap-4">
          {avatarOptions.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`Avatar ${index + 1}`}
              className="w-24 h-24 rounded-full object-cover cursor-pointer hover:ring-4 ring-purple-500 transition"
              onClick={() => onSelect(url)}
            />
          ))}
        </div>

        <button
          onClick={onClose}
          className="block mx-auto mt-4 px-4 py-2 bg-gray-200 rounded-full hover:bg-gray-300 transition"
        >
          Skip
        </button>
        
      </div>
    </div>
  );
};

export default ProfilePictureModal;