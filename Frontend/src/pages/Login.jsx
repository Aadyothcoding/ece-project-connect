import { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, getCurrentUser } from "../api";
import { LogIn } from "lucide-react";
import srmLogo from '../assets/SRM_Institute_of_Science_and_Technology_Logo.svg.png'; // 🖼️ IMPORT YOUR LOGO HERE

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginUser(formData);
      const { data } = await getCurrentUser();
      if (data.role === "teacher") {
        navigate("/teacher-dashboard");
      } else if (data.role === "student") {
        navigate("/student-dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <motion.div
        className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-2xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          {/* 🖼️ Use the imported logo variable here */}
          <img 
            src={srmLogo} 
            alt="College Logo" 
            className="mx-auto mb-4 h-12" 
          />
          <h1 className="text-2xl font-bold text-gray-800">
            Project Connect Portal
          </h1>
          <p className="text-gray-500">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Email / Register No.</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 mt-1 text-gray-700 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              className="w-full px-4 py-2 mt-1 text-gray-700 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
              onChange={handleChange}
              required
            />
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Login"}
            {!loading && <LogIn size={18} />}
          </button>
        </form>

        <div className="text-sm text-center text-gray-600 space-y-2">
          <Link to="/forgot-password" className="font-medium text-cyan-600 hover:underline">
            Forgot Password?
          </Link>
          <p>
            Don't have an account?{" "}
            <Link to="/signup" className="font-medium text-cyan-600 hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}