// frontend/src/pages/StudentDashboard.jsx
import React, { useEffect, useState } from "react";
import { getAllProjects, getCurrentUser } from "../api";

export default function StudentDashboard() {
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get logged-in user
    getCurrentUser()
      .then((res) => {
        setUser(res.data);
        if (res.data.role !== "student") {
          window.location.href = "/teacher-dashboard";
        }
      })
      .catch((err) => {
        console.error(err);
        window.location.href = "/login";
      });

    // Get all projects
    getAllProjects()
      .then((res) => setProjects(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Student Dashboard</h1>
      {user && (
        <p className="text-lg mb-6">
          Welcome, <span className="font-semibold">{user.fullName}</span>
        </p>
      )}

      <h2 className="text-xl font-semibold mb-4">Available Projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((p) => (
          <div
            key={p._id}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold mb-2">{p.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{p.description}</p>

            {/* Skills */}
            {p.skills && p.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {p.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}

            {/* Meta info */}
            <div className="text-xs text-gray-500 mb-4">
              <p>Duration: {p.duration || "N/A"}</p>
              <p>Difficulty: {p.difficulty || "N/A"}</p>
              <p>Applicants: {p.applicants || 0}</p>
            </div>

            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Apply
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
