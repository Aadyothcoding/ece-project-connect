import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupUser } from "../api.js";
import { toast, Toaster } from "react-hot-toast";
import { UserPlus } from "lucide-react";
import srmLogo from '../assets/SRM_Institute_of_Science_and_Technology_Logo.svg.png'; // 🖼️ IMPORT YOUR LOGO HERE

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    regNo: "",
    password: "",
    role: "student",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const dataToSend = {
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    };

    if (formData.role === 'student') {
      dataToSend.regNo = formData.regNo;
    }

    toast.promise(
      signupUser(dataToSend),
      {
        loading: 'Creating your account...',
        success: (res) => {
          setTimeout(() => navigate("/login"), 2000);
          return res.data.message || "Signup successful! Please verify your email.";
        },
        error: (err) => err.response?.data?.message || "Signup failed. Please try again.",
      }
    ).finally(() => setLoading(false));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
      <Toaster position="top-right" />
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-2xl">
        <div className="text-center">
          {/* 🖼️ Use the imported logo variable here */}
          <img 
            src={srmLogo} 
            alt="College Logo" 
            className="mx-auto mb-4 h-12" 
          />
          <h1 className="text-2xl font-bold text-gray-800">
            Create an Account
          </h1>
          <p className="text-gray-500">Join the Project Connect Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">I am a...</label>
            <select name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-2 mt-1 text-gray-700 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition">
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Full Name</label>
            <input type="text" name="fullName" placeholder="Enter your full name" value={formData.fullName} onChange={handleChange} className="w-full px-4 py-2 mt-1 text-gray-700 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition" required />
          </div>

          {formData.role === 'student' && (
            <div>
              <label className="text-sm font-medium text-gray-600">Registration Number</label>
              <input type="text" name="regNo" placeholder="Enter your registration number" value={formData.regNo} onChange={handleChange} className="w-full px-4 py-2 mt-1 text-gray-700 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition" required />
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-600">Email Address</label>
            <input type="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 mt-1 text-gray-700 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition" required />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">Password</label>
            <input type="password" name="password" placeholder="Create a password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2 mt-1 text-gray-700 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition" required minLength={6} />
          </div>

          <button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:opacity-50">
            {loading ? 'Creating Account...' : 'Sign Up'}
            {!loading && <UserPlus size={18} />}
          </button>
        </form>

        <p className="text-sm text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-cyan-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}