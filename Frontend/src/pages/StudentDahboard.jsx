import React, { useEffect, useState } from 'react';
import { getAllProjects, applyToProject, getCurrentUser, logoutUser } from '../api';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import { BookOpen, Send, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar'; // <-- IMPORT NAVBAR

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(null);
  const [appliedProjectIds, setAppliedProjectIds] = useState(new Set());

  useEffect(() => {
    getCurrentUser()
      .then((res) => {
        if (res.data.role !== 'student') {
          navigate('/teacher-dashboard');
        } else {
          setUser(res.data);
          if (res.data.appliedProjects) {
            setAppliedProjectIds(new Set(res.data.appliedProjects));
          }
        }
      })
      .catch(() => navigate('/login'));

    getAllProjects()
      .then((res) => setProjects(res.data))
      .catch((err) => {
        console.error('Failed to fetch projects:', err);
        toast.error('Could not load available projects.');
      });
  }, [navigate]);

  const handleApplyClick = (projectId) => {
    if (!user) {
      toast.error('User data not loaded. Please wait.');
      return;
    }
    const applicationData = {
      projectId: projectId,
      studentId: user._id,
      studentName: user.fullName,
    };
    toast.promise(
      applyToProject(applicationData),
      {
        loading: 'Submitting your application...',
        success: (res) => {
          setAppliedProjectIds((prev) => new Set(prev).add(projectId));
          return res.data.message || 'Successfully Applied!';
        },
        error: (err) => err.response?.data?.message || 'Application failed.',
      }
    );
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 text-white p-4 sm:p-6 lg:p-8 relative">
      <Toaster position="top-right" toastOptions={{
          className: 'bg-slate-700 text-white',
      }} />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22 width=%2232%22 height=%2232%22 fill=%22none%22 stroke=%22rgb(148 163 184 / 0.05)%22%3e%3cpath d=%22m0 .5 32 32M32 .5 0 32%22/%3e%3c/svg%3e')]" />
      
      <div className="relative max-w-7xl mx-auto z-10">
        {/* ===== USE NAVBAR COMPONENT ===== */}
        <Navbar user={user} handleLogout={handleLogout} />

        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-cyan-400" />
            Available Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p) => (
              <div
                key={p._id}
                className="bg-slate-800/40 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-lg hover:border-cyan-500 transition-all duration-300 flex flex-col"
              >
                <div className="flex-grow">
                  <h3 className="text-xl font-bold mb-2 text-white">{p.projectTitle}</h3>
                  <p className="text-sm text-slate-300 mb-4 h-24 overflow-y-auto">{p.description}</p>
                   <div className="text-xs text-slate-400 space-y-2 border-t border-slate-700 pt-3 mt-3">
                      <p><strong>Faculty:</strong> {p.facultyName}</p>
                      <p><strong>Stream:</strong> {p.stream}</p>
                    </div>
                </div>

                <button
                  onClick={() => handleApplyClick(p._id)}
                  disabled={appliedProjectIds.has(p._id)}
                  className="mt-6 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-4 py-3 rounded-lg font-semibold transition-transform transform hover:scale-105 disabled:from-slate-600 disabled:to-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  {appliedProjectIds.has(p._id) ? (
                    <><CheckCircle className="w-5 h-5" /> Applied</>
                  ) : (
                    <><Send className="w-5 h-5" /> Apply Now</>
                  )}
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}