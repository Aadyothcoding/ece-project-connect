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

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <Loader className="w-10 h-10 text-cyan-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-gray-800">
       {notification.message && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 p-4 rounded-lg shadow-lg ${notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {notification.type === 'success' ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
          <span>{notification.message}</span>
        </div>
      )}
      <div className="relative max-w-4xl mx-auto z-10 p-4 sm:p-6 lg:p-8">
        <Navbar user={profile} handleLogout={handleLogout} />
        
        <section className="bg-white p-8 rounded-xl shadow-lg border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-grow text-center sm:text-left">
                <h2 className="text-3xl font-bold text-gray-800">{profile.fullName}</h2>
                <p className="text-gray-500">{profile.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-200">
               <div>
                <label className="text-sm font-medium text-gray-600">Registration Number</label>
                <input type="text" name="regNo" value={profile.regNo || "Not set"} disabled className="w-full mt-1 px-4 py-2 bg-slate-200 border border-slate-300 rounded-lg text-gray-500 cursor-not-allowed" />
              </div>
               <div>
                <label className="text-sm font-medium text-gray-600">CGPA</label>
                <input type="number" name="cgpa" value={profile.cgpa ?? ""} min={0} max={10} step={0.01} onChange={handleChange} className="w-full mt-1 px-4 py-2 text-gray-700 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition" />
              </div>
               <div>
                <label className="text-sm font-medium text-gray-600">Department</label>
                <input type="text" name="department" value={profile.department || ""} onChange={handleChange} className="w-full mt-1 px-4 py-2 text-gray-700 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-600">Branch Specialisation</label>
                <select
                  name="branchSpecialisation"
                  value={profile.branchSpecialisation || "core"}
                  onChange={handleChange}
                  className="w-full mt-1 px-4 py-2 text-gray-700 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                  required
                >
                  <option value="core">core</option>
                  <option value="ECE (CPS)">ECE (CPS)</option>
                  <option value="ECE (DS)">ECE (DS)</option>
                  <option value="ECE (VLSI)">ECE (VLSI)</option>
                  <option value="ECE (EKE)">ECE (EKE)</option>
                  <option value="ECE (MES)">ECE (MES)</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-600">Skills (comma-separated)</label>
                <input type="text" name="skills" value={profile.skills || ""} onChange={handleChange} className="w-full mt-1 px-4 py-2 text-gray-700 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-600">Resume URL</label>
                <input type="text" name="resumeUrl" value={profile.resumeUrl || ""} onChange={handleChange} className="w-full mt-1 px-4 py-2 text-gray-700 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition" />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button type="submit" disabled={saving} className="w-full md:w-auto flex items-center justify-center gap-2 py-3 px-6 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                {saving ? <><Loader className="animate-spin w-5 h-5" /> Saving...</> : <><Save className="w-5 h-5" /> Save Changes</>}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}