import React, { useEffect, useState } from "react";
import { getCurrentUser, updateProfile, logoutUser } from "../api";
import { useNavigate } from "react-router-dom";
import { Loader, Save, AlertCircle, CheckCircle } from 'lucide-react';
import Navbar from "../components/Navbar";

export default function StudentProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });

  useEffect(() => {
    getCurrentUser()
      .then((res) => {
        if (res.data.role !== "student") {
          navigate("/teacher-dashboard");
        } else {
          setProfile(res.data);
        }
      })
      .catch(() => navigate("/login"))
      .finally(() => setLoading(false));
  }, [navigate]);

  const showNotification = (message, type = 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 4000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    // Exclude role from the data sent for update
    // eslint-disable-next-line no-unused-vars
    const { role, ...profileData } = profile;
    updateProfile(profileData)
      .then(() => {
        showNotification("Profile updated successfully!", "success");
      })
      .catch((err) => {
        showNotification(err.response?.data?.message || "Failed to update profile.");
      })
      .finally(() => setSaving(false));
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login');
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader className="w-10 h-10 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 text-white p-4 sm:p-6 lg:p-8 relative">
       {notification.message && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 p-4 rounded-lg shadow-lg ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {notification.type === 'success' ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
          <span>{notification.message}</span>
        </div>
      )}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22 width=%2232%22 height=%2232%22 fill=%22none%22 stroke=%22rgb(148 163 184 / 0.05)%22%3e%3cpath d=%22m0 .5 32 32M32 .5 0 32%22/%3e%3c/svg%3e')]" />
      <div className="relative max-w-4xl mx-auto z-10">
        <Navbar user={profile} handleLogout={handleLogout} />
        
        <section className="bg-slate-800/50 backdrop-blur-md border border-slate-700 p-8 rounded-2xl shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-6">
              <img
                src={profile.profilePic || `https://placehold.co/120x120/475569/E2E8F0?text=${profile.fullName.charAt(0)}`}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-slate-700"
              />
              <div className="flex-grow">
                <h2 className="text-3xl font-bold">{profile.fullName}</h2>
                <p className="text-slate-400">{profile.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-400">Profile Picture URL</label>
                <input type="text" name="profilePic" value={profile.profilePic || ""} onChange={handleChange} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-400">Department</label>
                <input type="text" name="department" value={profile.department || ""} onChange={handleChange} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition" />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-sm font-medium text-slate-400">Skills (comma-separated)</label>
                <input type="text" name="skills" value={profile.skills || ""} onChange={handleChange} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition" />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-sm font-medium text-slate-400">Resume URL</label>
                <input type="text" name="resumeUrl" value={profile.resumeUrl || ""} onChange={handleChange} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition" />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button type="submit" disabled={saving} className="w-full md:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                {saving ? <><Loader className="animate-spin w-5 h-5" /> Saving...</> : <><Save className="w-5 h-5" /> Save Changes</>}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}