import React, { useEffect, useState, useCallback } from "react";
import {
  createProject,
  deleteProject,
  getCurrentUser,
  logoutUser,
  getTeacherProjects,
} from "../api";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  BookOpen,
  Users,
  Trash2,
  Loader,
  AlertCircle,
  CheckCircle,
  Edit,
  ChevronDown,
} from "lucide-react";
import Navbar from "../components/Navbar";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

const ConfirmationModal = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm text-center text-gray-800">
      <p className="mb-6">{message}</p>
      <div className="flex justify-center gap-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700 font-semibold"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white font-semibold"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
);

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [globalDeadline, setGlobalDeadline] = useState("");
  const [newProject, setNewProject] = useState({
    projectTitle: "",
    description: "",
    domain: "",
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isUploadFormVisible, setIsUploadFormVisible] = useState(false);

  const [notification, setNotification] = useState({ message: "", type: "" });
  const [confirmDelete, setConfirmDelete] = useState(null);

  const showNotification = (message, type = "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 4000);
  };

  const loadProjectsForCurrentUser = useCallback(() => {
    getTeacherProjects()
      .then((res) => {
        setProjects(res.data);
      })
      .catch((err) => {
        console.error("Error loading projects:", err);
        showNotification("Could not load your projects.");
      })
      .finally(() => setInitialLoading(false));
  }, []);

  useEffect(() => {
    getCurrentUser()
      .then((res) => {
        const currentUser = res.data;
        if (!currentUser || currentUser.role !== "teacher") {
          navigate(currentUser ? "/student-dashboard" : "/login");
          return;
        }
        setUser(currentUser);
        loadProjectsForCurrentUser(currentUser);
      })
      .catch(() => {
        navigate("/login");
      });
  }, [navigate, loadProjectsForCurrentUser]);

  useEffect(() => {
    import("../api").then(({ getGlobalDeadline }) => {
      getGlobalDeadline()
        .then((res) => {
          if (res.data.deadline) {
            setGlobalDeadline(
              new Date(res.data.deadline).toLocaleDateString()
            );
          }
        })
        .catch(() => setGlobalDeadline(""));
    });
  }, []);

  const handleUpload = (e) => {
    e.preventDefault();
    if (!user) {
      showNotification("User data not loaded. Please wait and try again.");
      return;
    }
    if (projects.length >= 2) {
      showNotification("You can only upload a maximum of 2 projects.");
      return;
    }
    setLoading(true);
    const projectData = { ...newProject, facultyName: user.fullName };
    createProject(projectData)
      .then(() => {
        showNotification("Project uploaded successfully!", "success");
        setNewProject({
          projectTitle: "",
          description: "",
          applicationDeadline: "",
          domain: "",
        });
        setIsUploadFormVisible(false); // Close form on success
        loadProjectsForCurrentUser(user);
      })
      .catch((err) => {
        showNotification(
          err.response?.data?.message || "Failed to upload project."
        );
      })
      .finally(() => setLoading(false));
  };

  const handleDeleteClick = (id) => setConfirmDelete(id);

  const confirmDeletion = () => {
    if (!confirmDelete) return;
    deleteProject(confirmDelete)
      .then(() => {
        showNotification("Project deleted successfully.", "success");
        loadProjectsForCurrentUser(user);
      })
      .catch(() => showNotification("Failed to delete project."))
      .finally(() => setConfirmDelete(null));
  };

  const handleViewApplications = (projectId) =>
    navigate(`/teacher/applications/${projectId}`);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      navigate("/login");
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <Loader className="w-10 h-10 text-cyan-600 animate-spin" />
      </div>
    );
  }

  // Show set deadline button for allowed teachers
  const allowedEmails = [
    "sangeetm@srmist.edu.in",
    "vadivukk@srmist.edu.in",
    "elavelvg@srmist.edu.in",
  ];
  return (
    <div className="min-h-screen bg-slate-100 text-gray-800">
      {user && (
        <div className="max-w-2xl mx-auto mt-6 mb-2 text-center">
          <span className="text-2xl font-bold text-cyan-700 drop-shadow">Welcome, {user.fullName || user.name || user.email}</span>
        </div>
      )}
      {notification.message && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 p-4 rounded-lg shadow-lg ${
            notification.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle className="w-6 h-6" />
          ) : (
            <AlertCircle className="w-6 h-6" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {confirmDelete && (
        <ConfirmationModal
          message="Are you sure you want to delete this project? This action cannot be undone."
          onConfirm={confirmDeletion}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      <div className="relative max-w-7xl mx-auto z-10 p-4 sm:p-6 lg:p-8">
        {globalDeadline && (
          <div className="max-w-2xl mx-auto mt-6 mb-4 bg-white border border-cyan-200 rounded-lg shadow p-4 text-center">
            <span className="font-semibold text-cyan-700">
              Application Deadline:
            </span>
            <span className="ml-2 text-gray-800">{globalDeadline}</span>
          </div>
        )}
        {user && allowedEmails.includes(user.email) && (
          <div className="mb-6 flex justify-end gap-4">
            <button
              onClick={() => navigate("/teacher/set-global-deadline")}
              className="px-4 py-2 bg-cyan-700 text-white rounded-lg font-semibold shadow hover:bg-cyan-800 transition"
            >
              Set Global Application Deadline
            </button>
            <button
              onClick={() => navigate("/teacher/statistics-report")}
              className="px-4 py-2 bg-cyan-700 text-white rounded-lg font-semibold shadow hover:bg-cyan-800 transition"
            >
              Statistics Report
            </button>
          </div>
        )}
        <Navbar user={user} handleLogout={handleLogout} />

        <div className="mb-8">
          <button
            onClick={() => setIsUploadFormVisible(!isUploadFormVisible)}
            className="w-full flex justify-between items-center p-4 bg-white rounded-xl shadow-lg border border-slate-200 hover:bg-slate-50 transition"
          >
            <div className="flex items-center gap-3">
              <Plus className="w-6 h-6 text-cyan-600" />
              <h2 className="text-xl font-bold text-gray-700">
                Upload a New Project
              </h2>
            </div>
            <motion.div
              animate={{ rotate: isUploadFormVisible ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-6 h-6 text-gray-500" />
            </motion.div>
          </button>
        </div>

        <AnimatePresence>
          {isUploadFormVisible && (
            <motion.section
              key="upload-form"
              initial={{ height: 0, opacity: 0, marginTop: 0, marginBottom: 0 }}
              animate={{
                height: "auto",
                opacity: 1,
                marginTop: "-1.5rem",
                marginBottom: "3rem",
              }}
              exit={{ height: 0, opacity: 0, marginTop: 0, marginBottom: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 mt-6">
                <form onSubmit={handleUpload} className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Project Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Real-time EMG Signal Analysis"
                      value={newProject.projectTitle}
                      onChange={(e) =>
                        setNewProject({
                          ...newProject,
                          projectTitle: e.target.value,
                        })
                      }
                      className="w-full mt-1 px-4 py-2 text-gray-700 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Description
                    </label>
                    <textarea
                      placeholder="Provide a detailed description of the project..."
                      value={newProject.description}
                      onChange={(e) =>
                        setNewProject({
                          ...newProject,
                          description: e.target.value,
                        })
                      }
                      className="w-full mt-1 px-4 py-2 text-gray-700 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Domain
                      </label>
                      <select
                        value={newProject.domain}
                        onChange={(e) =>
                          setNewProject({
                            ...newProject,
                            domain: e.target.value,
                          })
                        }
                        className="w-full mt-1 px-4 py-2 text-gray-700 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                        required
                      >
                        <option value="">Select Domain</option>
                        <option>Antenna design and RF systems</option>
                        <option>AI/ML/DL based applications</option>
                        <option>Automation and Robotics</option>
                        <option>Audio, Speech signal Processing</option>
                        <option>Biomedical Electronics</option>
                        <option>Embedded Systems and IoT</option>
                        <option>Image and Video Processing</option>
                        <option>Multi disciplinary</option>
                        <option>Optical Communication</option>
                        <option>Semiconductor material & Devices</option>
                        <option>VLSI Design</option>
                        <option>Wireless Communication</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={loading || projects.length >= 2}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader className="animate-spin w-5 h-5" />{" "}
                          Uploading...
                        </>
                      ) : projects.length >= 2 ? (
                        "Limit Reached (2 Projects)"
                      ) : (
                        "Upload Project"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-700">
            <BookOpen className="w-6 h-6 text-cyan-600" />
            Your Projects
          </h2>
          {projects.length === 0 && !initialLoading ? (
            <div className="text-center text-gray-500 bg-white p-10 rounded-xl border border-slate-200">
              No projects uploaded yet. Start by adding one above! 📚
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((p) => (
                <div
                  key={p._id}
                  className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 flex flex-col justify-between transition hover:shadow-cyan-100 hover:border-cyan-300"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-gray-800 pr-4">
                        {p.projectTitle}
                      </h3>
                      <button
                        onClick={() =>
                          navigate(`/teacher/update-project/${p._id}`)
                        }
                        className="flex-shrink-0 flex items-center gap-2 text-xs bg-amber-100 text-amber-800 hover:bg-amber-200 px-3 py-1 rounded-full font-semibold transition"
                      >
                        <Edit size={12} /> Edit
                      </button>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 h-20 overflow-y-auto">
                      {p.description}
                    </p>
                    <div className="text-xs text-gray-500 space-y-2 border-t border-slate-200 pt-3 mt-3">
                      {/* Stream removed */}
                      <p>
                        <strong>Domain:</strong> {p.domain}
                      </p>
                      <p>
                        <strong>Application Deadline:</strong> <span id="global-deadline"></span>
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => handleViewApplications(p._id)}
                      className="flex-1 flex items-center justify-center gap-2 text-sm bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-2 rounded-md font-semibold transition"
                    >
                      <Users className="w-4 h-4" /> Applications
                    </button>
                    <button
                      onClick={() => handleDeleteClick(p._id)}
                      className="flex-1 flex items-center justify-center gap-2 text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md font-semibold transition"
                    >
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
