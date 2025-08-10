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
    facultyName: "",
    projectTitle: "",
    description: "",
    applicationDeadline: "",
    stream: "",
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCurrentUser()
      .then((res) => {
        setUser(res.data);
        if (res.data.role !== "teacher") {
          window.location.href = "/student-dashboard";
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
    setLoading(true);
    createProject(newProject)
      .then(() => {
        setNewProject({
          facultyName: "",
          projectTitle: "",
          description: "",
          applicationDeadline: "",
          stream: "",
        });
        loadProjects();
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to upload project. Please try again.");
      })
      .finally(() => setLoading(false));
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    deleteProject(id)
      .then(() => loadProjects())
      .catch((err) => {
        console.error(err);
        alert("Failed to delete project.");
      });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
        {user && (
          <p className="text-lg text-gray-700 mt-1">
            Welcome, <span className="font-semibold">{user.fullName}</span>
          </p>
        )}
      </header>

      {/* Upload Form */}
      <section className="bg-white p-6 rounded-lg shadow mb-10">
        <h2 className="text-xl font-semibold mb-4">Upload a New Project</h2>
        <form onSubmit={handleUpload} className="space-y-4">
          <input
            type="text"
            placeholder="Faculty Name"
            value={newProject.facultyName}
            onChange={(e) =>
              setNewProject({ ...newProject, facultyName: e.target.value })
            }
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            placeholder="Project Title"
            value={newProject.projectTitle}
            onChange={(e) =>
              setNewProject({ ...newProject, projectTitle: e.target.value })
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
            type="date"
            value={newProject.applicationDeadline}
            onChange={(e) =>
              setNewProject({
                ...newProject,
                applicationDeadline: e.target.value,
              })
            }
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            placeholder="Stream (e.g. CSE, ECE)"
            value={newProject.stream}
            onChange={(e) =>
              setNewProject({ ...newProject, stream: e.target.value })
            }
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className={`${
              loading ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-600"
            } text-white px-4 py-2 rounded transition`}
          >
            {loading ? "Uploading..." : "Upload Project"}
          </button>
        </form>
      </section>

      {/* Project List */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Your Projects</h2>
        {projects.length === 0 ? (
          <div className="text-gray-600 bg-white p-6 rounded shadow text-center">
            No projects uploaded yet. Start by adding one above! 📚
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p) => (
              <div
                key={p._id}
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-lg font-semibold mb-2">{p.projectTitle}</h3>
                  <p className="text-sm text-gray-600 mb-4">{p.description}</p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p><strong>Faculty:</strong> {p.facultyName}</p>
                    <p>
                      <strong>Deadline:</strong>{" "}
                      {new Date(p.applicationDeadline).toLocaleDateString()}
                    </p>
                    <p><strong>Stream:</strong> {p.stream}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(p._id)}
                  className="mt-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
