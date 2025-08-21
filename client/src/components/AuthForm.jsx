import { useState } from "react";
import { Link } from "react-router-dom";
import { EnvelopeIcon, LockClosedIcon, UserIcon } from "@heroicons/react/24/outline";

const AuthForm = ({ type = "login", onSubmit, message = { text: "", error: false } }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 translate-y-[-50px]">
      <div className="w-full max-w-md bg-white shadow-xl rounded-3xl px-8 py-10 space-y-6">
        {/* Icon */}
        <div className="w-14 h-14 bg-violet-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
          <UserIcon className="h-6 w-6" />
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-center text-gray-800">Welcome Back</h2>
        <p className="text-center text-gray-500 text-sm">Please sign in to your account</p>



        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username (only on register) */}
          {type === "register" && (
            <div className="relative">
              <UserIcon className="absolute left-4 top-3.5 text-gray-400 h-5 w-5" />
              <input
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full py-3 pl-12 pr-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder-gray-400"
              />
            </div>
          )}

          {/* Email */}
          <div className="relative">
            <EnvelopeIcon className="absolute left-4 top-3.5 text-gray-400 h-5 w-5" />
            <input
              name="email"
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full py-3 pl-12 pr-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder-gray-400"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <LockClosedIcon className="absolute left-4 top-3.5 text-gray-400 h-5 w-5" />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full py-3 pl-12 pr-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder-gray-400"
            />
          </div>

          {/* Remember Me & Forgot */}
          {type === "login" && (
            <div className="flex justify-between items-center text-sm text-gray-600">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-violet-500" />
                Remember me
              </label>
              <a href="#" className="text-violet-500 hover:underline">Forgot password?</a>
            </div>
          )}
          {/* Message */}
          {message.text && (
            <div
              className={`text-sm text-center px-3 py-2 rounded-md ${message.error ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"
                }`}
            >
              {message.text}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-violet-600 text-white py-3 rounded-full font-medium hover:bg-violet-700 shadow-md transition"
          >
            {type === "login" ? "Sign In" : "Register"}
          </button>

          {/* Or with */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            {/* <div className="relative flex justify-center text-sm text-gray-500 bg-white px-2">
              Or continue with
            </div> */}
          </div>

         
          {/* Bottom link */}
          <p className="text-center text-sm text-gray-600">
            {type === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <Link
              to={type === "login" ? "/register" : "/login"}
              className="text-violet-500 font-medium hover:underline"
            >
              {type === "login" ? "Sign up" : "Login"}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;
