import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getApplicationsForProject,
  approveApplication,
  rejectApplication,
} from "../api";
import { toast, Toaster } from "react-hot-toast";
import {
  ArrowLeft,
  FileText,
  User,
  Users,
  Calendar,
  Loader2,
  Check,
  X,
  Inbox,
} from "lucide-react";
import Navbar from "../components/Navbar";

export default function TeacherApplications() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchApplications = useCallback(() => {
    setLoading(true);
    getApplicationsForProject(id)
      .then((res) => {
        // Filter applications to only show those awaiting a decision
        const readyForReview = res.data.applications.filter(
          (app) => app.status === "pending_faculty_approval"
        );
        setData({ ...res.data, applications: readyForReview });
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load applications.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleAccept = (applicationId) => {
    toast.promise(approveApplication(applicationId), {
      loading: "Approving application...",
      success: () => {
        fetchApplications(); // Refresh the list of applications
        return "Application approved successfully!";
      },
      error: (err) =>
        err.response?.data?.message || "Failed to approve application.",
    });
  };

  const handleReject = (applicationId) => {
    toast.promise(rejectApplication(applicationId), {
      loading: "Rejecting application...",
      success: () => {
        fetchApplications(); // Refresh the list of applications
        return "Application rejected.";
      },
      error: (err) =>
        err.response?.data?.message || "Failed to reject application.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 flex items-center justify-center text-white">
        No data found for this project.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-gray-800">
      <Toaster
        position="top-right"
        toastOptions={{ className: "bg-slate-700 text-white" }}
      />
      <div className="relative max-w-7xl mx-auto z-10 p-4 sm:p-6 lg:p-8">
        <Navbar user={null} />
        <div className="mb-8">
          <button
            onClick={() => navigate("/teacher-dashboard")}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-lg border border-slate-200 hover:bg-slate-50 transition mb-4"
          >
            <ArrowLeft className="w-5 h-5 text-cyan-600" />
            <span className="font-semibold text-gray-700">Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-700 mb-2">
            <FileText className="w-8 h-8 text-cyan-600" />
            Project Applications
          </h1>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {data.project.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
            <p>
              <strong>Faculty:</strong> {data.project.facultyName}
            </p>
            <p>
              <strong>Stream:</strong> {data.project.stream}
            </p>
          </div>
        </div>

        {data.applications.length === 0 ? (
          <div className="text-center text-gray-500 bg-white p-10 rounded-xl border border-slate-200 flex flex-col items-center gap-4">
            <Inbox className="w-16 h-16 text-slate-400" />
            <h3 className="text-2xl font-bold">
              No Applications Ready for Review
            </h3>
            <p>Check back later to see new applications.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {data.applications.map((app) => (
              <div
                key={app._id}
                className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 flex flex-col justify-between transition hover:shadow-cyan-100 hover:border-cyan-300"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-cyan-100 rounded-full">
                        {app.applicationType === "group" ? (
                          <Users className="w-5 h-5 text-cyan-600" />
                        ) : (
                          <User className="w-5 h-5 text-cyan-600" />
                        )}
                      </div>
                      <h3 className="text-xl font-semibold capitalize text-gray-800">
                        {app.applicationType} Application
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {app.members.map((member) => (
                        <div key={member._id} className="text-sm text-gray-600">
                          <p>
                            <span className="font-bold">{member.name}</span> (
                            {member.regNo})
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 mt-6 border-t border-slate-200 pt-4">
                  <button
                    onClick={() => handleAccept(app._id)}
                    className="flex-1 flex items-center justify-center gap-2 text-sm bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-2 rounded-md font-semibold transition"
                  >
                    <Check className="w-4 h-4" /> Accept
                  </button>
                  <button
                    onClick={() => handleReject(app._id)}
                    className="flex-1 flex items-center justify-center gap-2 text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md font-semibold transition"
                  >
                    <X className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
