// frontend/src/pages/StudentDashboard.jsx
import React, { useEffect, useState } from "react";
// Make sure you have an api.js file that exports these functions
import { getAllProjects, applyToProject, getCurrentUser } from "../api";
// It's recommended to use a notification library like react-hot-toast
import { toast } from "react-hot-toast";

export default function StudentDashboard() {
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(null);
  // Use a Set for efficient tracking of applied project IDs
  const [appliedProjectIds, setAppliedProjectIds] = useState(new Set());

  useEffect(() => {
    // Get logged-in user details
    getCurrentUser()
      .then((res) => {
        if (res.data.role !== "student") {
          // In a real app, use React Router's <Navigate> component instead
          window.location.href = "/teacher-dashboard";
        } else {
          setUser(res.data);
        }
      })
      .catch((err) => {
        console.error("Auth check failed:", err);
        window.location.href = "/login";
      });

    // Get all available projects
    getAllProjects()
      .then((res) => setProjects(res.data))
      .catch((err) => {
        console.error("Failed to fetch projects:", err);
        toast.error("Could not load available projects.");
      });
  }, []); // This effect runs once on component mount

  // Function to handle the "Apply" button click
  const handleApplyClick = (projectId) => {
    if (!user) {
      toast.error("User data not loaded. Please wait a moment.");
      return;
    }

    const applicationData = {
      projectId: projectId,
      studentId: user._id,
      studentName: user.fullName,
    };

    // Use toast.promise for clean loading/success/error feedback
    toast.promise(
      applyToProject(applicationData),
      {
        loading: "Submitting your application...",
        success: (res) => {
          // On success, update the state to disable the button
          setAppliedProjectIds((prev) => new Set(prev).add(projectId));
          return res.data.message || "Successfully Applied!";
        },
        error: (err) => {
          // Show a specific error message from the server if available
          return err.response?.data?.message || "Application failed.";
        },
      }
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Student Dashboard</h1>
      {user && (
        <p className="text-lg mb-6">
          Welcome, <span className="font-semibold">{user.fullName}</span>!
        </p>
      )}

      <h2 className="text-xl font-semibold mb-4">Available Projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((p) => (
          <div
            key={p._id}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow flex flex-col"
          >
            <div className="flex-grow">
              {/* Corrected p.title to p.projectTitle */}
              <h3 className="text-lg font-semibold mb-2">{p.projectTitle}</h3>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Faculty: {p.facultyName}
              </p>
              <p className="text-sm text-gray-600 mb-4 line-clamp-4">
                {p.description}
              </p>
            </div>

            <button
              onClick={() => handleApplyClick(p._id)}
              // Disable the button if the student has already applied
              disabled={appliedProjectIds.has(p._id)}
              className="mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
            >
              {appliedProjectIds.has(p._id) ? "Applied" : "Apply"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}