import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupUser } from "../api.js";
import { toast, Toaster } from "react-hot-toast";
import { UserPlus } from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    regNo: "", // Added registration number field
    password: "",
    role: "student",
    // Teacher-specific fields
    experience: "",
    description: "",
    researchPast: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Prepare data to send, excluding teacher fields if role is student
    const dataToSend = {
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    };

    if (formData.role === 'student') {
      dataToSend.regNo = formData.regNo;
    } else {
      dataToSend.experience = formData.experience;
      dataToSend.description = formData.description;
      dataToSend.researchPast = formData.researchPast;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 text-white flex items-center justify-center p-4">
      <Toaster position="top-right" toastOptions={{ className: "bg-slate-700 text-white" }} />
      <div className="w-full max-w-md">
        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 p-8 rounded-2xl shadow-lg text-center">
            <UserPlus className="mx-auto w-12 h-12 text-cyan-400 mb-4" />
            <h1 className="text-3xl font-bold mb-2">Create an Account</h1>
            <p className="text-slate-400 mb-6">Join Project Connect SRM</p>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition">
                    <option value="student">I am a Student</option>
                    <option value="teacher">I am a Teacher</option>
                </select>

                <input type="text" name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition" required />
                
                {/* Conditionally render Registration Number for students */}
                {formData.role === 'student' && (
                    <input type="text" name="regNo" placeholder="Registration Number" value={formData.regNo} onChange={handleChange} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition" required />
                )}

                <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition" required />
                <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition" required minLength={6} />

                <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-transform transform hover:scale-105 disabled:opacity-50">
                    {loading ? 'Signing Up...' : 'Sign Up'}
                </button>
            </form>
            <p className="text-center text-sm text-slate-400 mt-6">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-cyan-400 hover:underline">
                    Login
                </Link>
            </p>
        </div>
      </div>
    </div>
  );
}