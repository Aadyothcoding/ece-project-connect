// frontend/src/pages/StudentDashboard.jsx
import React, { useEffect, useState } from "react";
import { getAllProjects, getCurrentUser } from "../api";

export default function StudentDashboard() {
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    getCurrentUser().then((res) => {
      setUser(res.data);
      if (res.data.role !== "student") {
        window.location.href = "/teacher-dashboard";
      }
    });
    getAllProjects().then((res) => setProjects(res.data));
  }, []);

  return (
    <div>
      <h1>Student Dashboard</h1>
      {user && <p>Welcome, {user.fullName}</p>}

      <h2>Available Projects</h2>
      <ul>
        {projects.map((p) => (
          <li key={p._id}>
            <strong>{p.title}</strong> - {p.description}
            <button>Apply</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
