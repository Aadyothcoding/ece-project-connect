// frontend/src/pages/TeacherDashboard.jsx
import React, { useEffect, useState } from "react";
import { getAllProjects, createProject, deleteProject, getCurrentUser } from "../api";

export default function TeacherDashboard() {
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({ title: "", description: "" });
  const [user, setUser] = useState(null);

  useEffect(() => {
    getCurrentUser().then((res) => {
      setUser(res.data);
      if (res.data.role !== "teacher") {
        window.location.href = "/student-dashboard"; // Redirect students
      }
    });
    loadProjects();
  }, []);

  const loadProjects = () => {
    getAllProjects().then((res) => setProjects(res.data));
  };

  const handleUpload = (e) => {
    e.preventDefault();
    createProject(newProject).then(() => {
      setNewProject({ title: "", description: "" });
      loadProjects();
    });
  };

  return (
    <div>
      <h1>Teacher Dashboard</h1>
      {user && <p>Welcome, {user.fullName}</p>}

      <form onSubmit={handleUpload}>
        <input
          type="text"
          placeholder="Project Title"
          value={newProject.title}
          onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
        />
        <textarea
          placeholder="Description"
          value={newProject.description}
          onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
        />
        <button type="submit">Upload Project</button>
      </form>

      <h2>Your Projects</h2>
      <ul>
        {projects.map((p) => (
          <li key={p._id}>
            <strong>{p.title}</strong> - {p.description}
            <button onClick={() => deleteProject(p._id).then(loadProjects)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
