import React, { useEffect, useState } from 'react';
import { getAllProjects, applyToProject, getCurrentUser } from '../api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast'; // Assuming you have this library installed
import { LogOut, BookOpen, Send, CheckCircle, User } from 'lucide-react';

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
          // Assuming user object contains an array of applied project IDs
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 text-white p-4 sm:p-6 lg:p-8 relative">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22 width=%2232%22 height=%2232%22 fill=%22none%22 stroke=%22rgb(148 163 184 / 0.05)%22%3e%3cpath d=%22m0 .5 32 32M32 .5 0 32%22/%3e%3c/svg%3e')]" />
      
      <div className="relative max-w-7xl mx-auto z-10">
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl shadow-xl">
                <User className="w-6 h-6 text-white" />
            </div>
            <div>
                <h1 className="text-3xl font-bold">Student Dashboard</h1>
                {user && (
                <p className="text-cyan-200 text-md">
                    Welcome, <span className="font-semibold">{user.fullName}</span>!
                </p>
                )}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:to-red-700 text-white rounded-full shadow text-sm"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </header>

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