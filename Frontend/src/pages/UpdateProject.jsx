import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAllProjects, updateProject } from '../api';

export default function UpdateProject() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [projectData, setProjectData] = useState({
    facultyName: '',
    projectTitle: '',
    description: '',
    applicationDeadline: '',
    stream: ''
  });
  const [loading, setLoading] = useState(false);

  // Load existing project
  useEffect(() => {
    getAllProjects()
      .then(res => {
        const found = res.data.find(p => p._id === projectId);
        if (found) {
          setProjectData({
            facultyName: found.facultyName || '',
            projectTitle: found.projectTitle,
            description: found.description,
            applicationDeadline: found.applicationDeadline.split('T')[0],
            stream: found.stream
          });
        }
      })
      .catch(err => console.error("Failed to load project", err));
  }, [projectId]);

  const handleChange = (e) => {
    setProjectData({ ...projectData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    updateProject(projectId, projectData)
      .then(() => {
        navigate('/teacher-dashboard');
      })
      .catch(err => console.error("Update failed", err))
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
