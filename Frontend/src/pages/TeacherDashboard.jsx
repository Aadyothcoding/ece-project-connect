import React, { useEffect, useState } from 'react';
import {
  getAllProjects,
  createProject,
  deleteProject,
  getCurrentUser,
} from '../api';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  Plus,
  BookOpen,
  Users,
  Trash2,
  Loader,
  BookMarked,
} from 'lucide-react';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({
    facultyName: '',
    projectTitle: '',
    description: '',
    applicationDeadline: '',
    stream: '',
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCurrentUser()
      .then((res) => {
        setUser(res.data);
        if (res.data.role !== 'teacher') {
          navigate('/student-dashboard');
        }
      })
      .catch(() => {
        navigate('/login');
      });

    loadProjects();
  }, [navigate]);

  const loadProjects = () => {
    getAllProjects()
      .then((res) => setProjects(res.data))
      .catch((err) => console.error(err));
  };

  const handleUpload = (e) => {
    e.preventDefault();
    setLoading(true);
    createProject(newProject)
      .then(() => {
        setNewProject({
          facultyName: '',
          projectTitle: '',
          description: '',
          applicationDeadline: '',
          stream: '',
        });
        loadProjects();
      })
      .catch((err) => {
        console.error(err);
        alert('Failed to upload project. Please try again.');
      })
      .finally(() => setLoading(false));
  };

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    deleteProject(id)
      .then(() => loadProjects())
      .catch((err) => {
        console.error(err);
        alert('Failed to delete project.');
      });
  };

  const handleViewApplications = (projectId) => {
    navigate(`/teacher/applications/${projectId}`);
  };

  const handleLogout = () => {
    // In a real app, you'd call an API endpoint
    // For now, we'll just clear client-side data
    localStorage.removeItem('token'); // or your session cookie
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 text-white p-4 sm:p-6 lg:p-8 relative">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22 width=%2232%22 height=%2232%22 fill=%22none%22 stroke=%22rgb(148 163 184 / 0.05)%22%3e%3cpath d=%22m0 .5 32 32M32 .5 0 32%22/%3e%3c/svg%3e')]" />

      <div className="relative max-w-7xl mx-auto z-10">
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-xl">
              <BookMarked className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
              {user && (
                <p className="text-blue-200 text-md">
                  Welcome, <span className="font-semibold">{user.fullName}</span>
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

        {/* Upload Form */}
        <section className="bg-slate-800/50 backdrop-blur-md border border-slate-700 p-6 rounded-2xl shadow-lg mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Plus className="w-6 h-6 text-green-400" />
            Upload a New Project
          </h2>
          <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Project Title"
                value={newProject.projectTitle}
                onChange={(e) => setNewProject({ ...newProject, projectTitle: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
                required
              />
            </div>
             <div className="md:col-span-2">
               <textarea
                placeholder="Description"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
                rows={4}
                required
              />
            </div>
            <input
              type="text"
              placeholder="Faculty Name"
              value={newProject.facultyName}
              onChange={(e) => setNewProject({ ...newProject, facultyName: e.target.value })}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
              required
            />
            <input
              type="text"
              placeholder="Stream (e.g. CSE, ECE)"
              value={newProject.stream}
              onChange={(e) => setNewProject({ ...newProject, stream: e.target.value })}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
              required
            />
             <div className="relative md:col-span-2">
              <input
                type="date"
                value={newProject.applicationDeadline}
                onChange={(e) => setNewProject({ ...newProject, applicationDeadline: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-4 pr-10 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
                required
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <><Loader className="animate-spin w-5 h-5" /> Uploading...</> : 'Upload Project'}
              </button>
            </div>
          </form>
        </section>

        {/* Project List */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-blue-400" />
            Your Projects
          </h2>
          {projects.length === 0 ? (
            <div className="text-center text-slate-400 bg-slate-800/50 p-10 rounded-2xl">
              No projects uploaded yet. Start by adding one above! 📚
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((p) => (
                <div key={p._id} className="bg-slate-800/40 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-lg hover:border-purple-500 transition-all duration-300 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-white">{p.projectTitle}</h3>
                    <p className="text-sm text-slate-300 mb-4 h-20 overflow-y-auto">{p.description}</p>
                    <div className="text-xs text-slate-400 space-y-2 border-t border-slate-700 pt-3 mt-3">
                      <p><strong>Faculty:</strong> {p.facultyName}</p>
                      <p><strong>Stream:</strong> {p.stream}</p>
                      <p><strong>Deadline:</strong> {new Date(p.applicationDeadline).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <button onClick={() => handleViewApplications(p._id)} className="flex-1 flex items-center justify-center gap-2 text-sm bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-3 py-2 rounded-md font-semibold transition">
                      <Users className="w-4 h-4" /> Applications
                    </button>
                    <button onClick={() => handleDelete(p._id)} className="flex-1 flex items-center justify-center gap-2 text-sm bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white px-3 py-2 rounded-md font-semibold transition">
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}