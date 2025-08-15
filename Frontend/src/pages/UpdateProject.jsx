import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAllProjects, updateProject } from "../api";

export default function UpdateProject() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [projectData, setProjectData] = useState({
    facultyName: "",
    projectTitle: "",
    description: "",
    applicationDeadline: "",
    stream: "",
    domain: "",
  });
  const [loading, setLoading] = useState(false);

  // Load existing project
  useEffect(() => {
    getAllProjects()
      .then((res) => {
        const found = res.data.find((p) => p._id === projectId);
        if (found) {
          setProjectData({
            facultyName: found.facultyName || "",
            projectTitle: found.projectTitle,
            description: found.description,
            applicationDeadline: found.applicationDeadline.split("T")[0],
            stream: found.stream,
            domain: found.domain || "",
          });
        }
      })
      .catch((err) => console.error("Failed to load project", err));
  }, [projectId]);

  const handleChange = (e) => {
    setProjectData({ ...projectData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    updateProject(projectId, projectData)
      .then(() => {
        navigate("/teacher-dashboard");
      })
      .catch((err) => console.error("Update failed", err))
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-lg mx-auto bg-slate-800 p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Update Project</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Faculty Name */}
          <input
            type="text"
            name="facultyName"
            value={projectData.facultyName}
            onChange={handleChange}
            placeholder="Faculty Name"
            className="w-full px-4 py-2 rounded bg-slate-700 border border-slate-600"
            required
          />

          {/* Project Title */}
          <input
            type="text"
            name="projectTitle"
            value={projectData.projectTitle}
            onChange={handleChange}
            placeholder="Project Title"
            className="w-full px-4 py-2 rounded bg-slate-700 border border-slate-600"
            required
          />

          {/* Description */}
          <textarea
            name="description"
            value={projectData.description}
            onChange={handleChange}
            placeholder="Description"
            className="w-full px-4 py-2 rounded bg-slate-700 border border-slate-600"
            rows="4"
            required
          />

          {/* Stream */}
          <input
            type="text"
            name="stream"
            value={projectData.stream}
            onChange={handleChange}
            placeholder="Stream"
            className="w-full px-4 py-2 rounded bg-slate-700 border border-slate-600"
            required
          />

          {/* Domain */}
          <select
            name="domain"
            value={projectData.domain}
            onChange={handleChange}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
            required
          >
            <option value="">Select Domain</option>
            <option>Analog Circuits</option>
            <option>Digital Circuits</option>
            <option>Semiconductor Devices</option>
            <option>Wireless & Mobile Communication</option>
            <option>Fiber-Optic Communication</option>
            <option>Computer Networks</option>
            <option>Digital Signal Processing (DSP)</option>
            <option>Image & Video Processing</option>
            <option>Embedded Systems</option>
            <option>Internet of Things (IoT)</option>
            <option>Electromagnetics & RF Engineering</option>
            <option>Antennas & Wave Propagation</option>
            <option>VLSI (Very Large Scale Integration)</option>
            <option>Control Systems</option>
            <option>Robotics and Automation</option>
            <option>Power Electronics</option>
            <option>Computer Architecture</option>
            <option>Photonics and Optoelectronics</option>
            <option>Information Theory</option>
            <option>Biomedical Engineering</option>
            <option>Quantum Computing</option>
            <option>MEMS (Micro-Electro-Mechanical Systems)</option>
            <option>Machine Learning & AI Hardware</option>
            <option>Signal Integrity and High-Speed Design</option>
            <option>Nanoelectronics</option>
            <option>Terahertz Technology</option>
            <option>Mixed Signal Design</option>
            <option>Automotive Electronics</option>
            <option>Sensor Networks</option>
            <option>Radar Systems</option>
            <option>Satellite Communication</option>
            <option>Cyber-Physical Systems</option>
            <option>Augmented & Virtual Reality Hardware</option>
          </select>

          {/* Application Deadline */}
          <input
            type="date"
            name="applicationDeadline"
            value={projectData.applicationDeadline}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded bg-slate-700 border border-slate-600"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded"
          >
            {loading ? "Updating..." : "Update Project"}
          </button>
        </form>
      </div>
    </div>
  );
}
