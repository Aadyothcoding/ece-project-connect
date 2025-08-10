// frontend/src/pages/TeacherDashboard.jsx
import React, { useEffect, useState } from "react";
import {
  getAllProjects,
  createProject,
  deleteProject,
  getCurrentUser,
} from "../api";

export default function TeacherDashboard() {
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    skills: "",
    duration: "",
    difficulty: "",
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    getCurrentUser()
      .then((res) => {
        setUser(res.data);
        if (res.data.role !== "teacher") {
          window.location.href = "/student-dashboard"; // redirect if not teacher
        }
      })
      .catch(() => {
        window.location.href = "/login";
      });

    loadProjects();
  }, []);

  const loadProjects = () => {
    getAllProjects()
      .then((res) => setProjects(res.data))
      .catch((err) => console.error(err));
  };

  const handleUpload = (e) => {
    e.preventDefault();
    const payload = {
      ...newProject,
      skills: newProject.skills.split(",").map((s) => s.trim()), // turn string into array
    };
    createProject(payload)
      .then(() => {
        setNewProject({
          title: "",
          description: "",
          skills: "",
          duration: "",
          difficulty: "",
        });
        loadProjects();
      })
      .catch((err) => console.error(err));
  };

  const handleDelete = (id) => {
    deleteProject(id)
      .then(() => loadProjects())
      .catch((err) => console.error(err));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Teacher Dashboard</h1>
      {user && (
        <p className="text-lg mb-6">
          Welcome, <span className="font-semibold">{user.fullName}</span>
        </p>
      )}

      {/* Upload Form */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold mb-4">Upload a New Project</h2>
        <form onSubmit={handleUpload} className="space-y-4">
          <input
            type="text"
            placeholder="Project Title"
            value={newProject.title}
            onChange={(e) =>
              setNewProject({ ...newProject, title: e.target.value })
            }
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <textarea
            placeholder="Description"
            value={newProject.description}
            onChange={(e) =>
              setNewProject({ ...newProject, description: e.target.value })
            }
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            required
          />
          <input
            type="text"
            placeholder="Skills (comma separated)"
            value={newProject.skills}
            onChange={(e) =>
              setNewProject({ ...newProject, skills: e.target.value })
            }
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Duration"
              value={newProject.duration}
              onChange={(e) =>
                setNewProject({ ...newProject, duration: e.target.value })
              }
              className="w-1/2 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Difficulty"
              value={newProject.difficulty}
              onChange={(e) =>
                setNewProject({ ...newProject, difficulty: e.target.value })
              }
              className="w-1/2 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Upload Project
          </button>
        </form>
      </div>

      {/* Project List */}
      <h2 className="text-xl font-semibold mb-4">Your Projects</h2>
      {projects.length === 0 ? (
        <p className="text-gray-600">No projects uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <div
              key={p._id}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-semibold mb-2">{p.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{p.description}</p>

              {p.skills && p.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {p.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              <div className="text-xs text-gray-500 mb-4">
                <p>Duration: {p.duration || "N/A"}</p>
                <p>Difficulty: {p.difficulty || "N/A"}</p>
              </div>

              <button
                onClick={() => handleDelete(p._id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
