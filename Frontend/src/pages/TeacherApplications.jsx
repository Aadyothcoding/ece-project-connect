/*import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getApplicationsForProject } from "../api";
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
import axios from "axios";
import { toast } from "react-hot-toast";

export default function TeacherApplications() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getApplicationsForProject(id)
      .then((res) => {
        // Filter applications to only show those ready for faculty review
        const readyForReview = res.data.applications.filter(
          (app) =>
            app.status === "pending_faculty_approval" ||
            app.status === "approved" ||
            app.status === "rejected"
        );
        setData({ ...res.data, applications: readyForReview });
      })
      .catch((err) => {
        console.error(err);
        // eslint-disable-next-line no-undef
        toast.error("Failed to load applications.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAccept = async (applicationId) => {
    try {
      await axios.post(
        `http://localhost:3050/api/team-approved/approve/${applicationId}`
      );
      toast.success("Application approved!");
      navigate("/student-dashboard"); // 👈 redirect after success
    } catch (err) {
      toast.error("Failed to approve application");
    }
  };

  const handleReject = async (applicationId) => {
    try {
      await axios.post(
        `http://localhost:3050/api/team-approved/reject/${applicationId}`
      );
      toast.success("Application rejected!");
      navigate("/student-dashboard"); // 👈 redirect after success
    } catch (err) {
      toast.error("Failed to reject application");
    }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 text-white p-4 sm:p-6 lg:p-8 relative">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22 width=%2232%22 height=%2232%22 fill=%22none%22 stroke=%22rgb(148 163 184 / 0.05)%22%3e%3cpath d=%22m0 .5 32 32M32 .5 0 32%22/%3e%3c/svg%3e')]" />

      <div className="relative max-w-5xl mx-auto z-10">
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/teacher-dashboard")}
              className="p-2 rounded-full bg-slate-800/50 hover:bg-slate-700/70 transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FileText className="w-8 h-8 text-green-400" />
              Project Applications
            </h1>
          </div>
        </header>

        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 p-6 rounded-2xl shadow-lg mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">
            {data.project.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
            <p>
              <strong>Faculty:</strong> {data.project.facultyName}
            </p>
          </div>
        </div>

        {data.applications.length === 0 ? (
          <div className="text-center text-slate-400 bg-slate-800/50 p-12 rounded-2xl flex flex-col items-center gap-4">
            <Inbox className="w-16 h-16 text-slate-500" />
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
                className="bg-slate-800/40 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-lg"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-slate-700 rounded-full">
                        {app.applicationType === "group" ? (
                          <Users className="w-5 h-5 text-green-400" />
                        ) : (
                          <User className="w-5 h-5 text-green-400" />
                        )}
                      </div>
                      <h3 className="text-xl font-semibold capitalize">
                        {app.applicationType} Application
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {app.members.map((member) => (
                        <div
                          key={member._id}
                          className="text-sm text-slate-300"
                        >
                          <p>
                            <span className="font-bold">{member.name}</span> (
                            {member.regNo})
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6 border-t border-slate-700 pt-4">
                  <button
                    onClick={() => handleAccept(app._id)}
                    className="flex-1 flex items-center justify-center gap-2 text-sm bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-3 py-2 rounded-md font-semibold transition"
                  >
                    <Check className="w-4 h-4" /> Accept
                  </button>
                  <button
                    onClick={() => handleReject(app._id)}
                    className="flex-1 flex items-center justify-center gap-2 text-sm bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white px-3 py-2 rounded-md font-semibold transition"
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
*/

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getApplicationsForProject, approveApplication, rejectApplication } from '../api';
import { toast, Toaster } from 'react-hot-toast';
import { ArrowLeft, FileText, User, Users, Calendar, Loader2, Check, X, Inbox } from 'lucide-react';

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
            app => app.status === 'pending_faculty_approval'
        );
        setData({ ...res.data, applications: readyForReview });
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load applications.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleAccept = (applicationId) => {
    toast.promise(
      approveApplication(applicationId),
      {
        loading: 'Approving application...',
        success: () => {
          fetchApplications(); // Refresh the list of applications
          return 'Application approved successfully!';
        },
        error: (err) => err.response?.data?.message || 'Failed to approve application.',
      }
    );
  };

  const handleReject = (applicationId) => {
    toast.promise(
      rejectApplication(applicationId),
      {
        loading: 'Rejecting application...',
        success: () => {
          fetchApplications(); // Refresh the list of applications
          return 'Application rejected.';
        },
        error: (err) => err.response?.data?.message || 'Failed to reject application.',
      }
    );
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 text-white p-4 sm:p-6 lg:p-8 relative">
       <Toaster position="top-right" toastOptions={{ className: "bg-slate-700 text-white" }} />
       <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22 width=%2232%22 height=%2232%22 fill=%22none%22 stroke=%22rgb(148 163 184 / 0.05)%22%3e%3cpath d=%22m0 .5 32 32M32 .5 0 32%22/%3e%3c/svg%3e')]" />

      <div className="relative max-w-5xl mx-auto z-10">
        <header className="flex items-center justify-between mb-10">
          <div className='flex items-center gap-4'>
            <button
              onClick={() => navigate('/teacher-dashboard')}
              className="p-2 rounded-full bg-slate-800/50 hover:bg-slate-700/70 transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FileText className="w-8 h-8 text-green-400" />
              Project Applications
            </h1>
          </div>
        </header>

        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 p-6 rounded-2xl shadow-lg mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">{data.project.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
                <p><strong>Faculty:</strong> {data.project.facultyName}</p>
                <p><strong>Stream:</strong> {data.project.stream}</p>
            </div>
        </div>

        {data.applications.length === 0 ? (
          <div className="text-center text-slate-400 bg-slate-800/50 p-12 rounded-2xl flex flex-col items-center gap-4">
            <Inbox className="w-16 h-16 text-slate-500" />
            <h3 className="text-2xl font-bold">No Applications Ready for Review</h3>
            <p>Check back later to see new applications.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {data.applications.map((app) => (
              <div key={app._id} className="bg-slate-800/40 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-lg">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-slate-700 rounded-full">
                               {app.applicationType === 'group' ? <Users className="w-5 h-5 text-green-400" /> : <User className="w-5 h-5 text-green-400" />}
                            </div>
                            <h3 className="text-xl font-semibold capitalize">{app.applicationType} Application</h3>
                        </div>
                        <div className="space-y-2">
                            {app.members.map(member => (
                                <div key={member._id} className="text-sm text-slate-300">
                                    <p><span className="font-bold">{member.name}</span> ({member.regNo})</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-slate-400 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(app.appliedAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div className="flex gap-3 mt-6 border-t border-slate-700 pt-4">
                  <button onClick={() => handleAccept(app._id)} className="flex-1 flex items-center justify-center gap-2 text-sm bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-3 py-2 rounded-md font-semibold transition">
                    <Check className="w-4 h-4" /> Accept
                  </button>
                   <button onClick={() => handleReject(app._id)} className="flex-1 flex items-center justify-center gap-2 text-sm bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white px-3 py-2 rounded-md font-semibold transition">
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