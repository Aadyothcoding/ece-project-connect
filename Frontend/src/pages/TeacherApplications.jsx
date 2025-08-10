// frontend/src/pages/TeacherApplications.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getApplicationsForProject } from "../api";
import { useNavigate } from "react-router-dom";


export default function TeacherApplications() {
    const navigate = useNavigate();
  const { id } = useParams(); // projectId from route
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getApplicationsForProject(id)
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to load applications.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!data) {
    return <div className="p-6">No data found.</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Applications</h1>

      {/* Project Info */}
      <div className="bg-white p-4 rounded shadow mb-6">
         <p><strong>Title:</strong> {data.project.projectTitle}</p>
        <p><strong>Faculty:</strong> {data.project.facultyName}</p>
        <p><strong>Stream:</strong> {data.project.stream}</p>
      </div>

      {/* Applications List */}
      {data.applications.length === 0 ? (
        <div className="bg-white p-4 rounded shadow">No applications yet.</div>
      ) : (
        <div className="grid gap-4">
          {data.applications.map((app) => (
            <div
              key={app._id}
              className="bg-white p-4 rounded shadow flex justify-between items-center"
            >
              <div>
                <p><strong>Student:</strong> {app.studentName}</p>
                <p className="text-sm text-gray-500">
                  Applied on: {new Date(app.appliedAt).toLocaleDateString()}
                </p>
              </div>
              <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                View Profile
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
