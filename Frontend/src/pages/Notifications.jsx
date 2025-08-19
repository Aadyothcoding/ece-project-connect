import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPendingInvitations,
  respondToInvitation,
  getCurrentUser,
  logoutUser,
  getNotifications, // ✅ add this to api.js if not already
} from "../api";
import { toast, Toaster } from "react-hot-toast";
import { Loader, Bell, Check, X, Inbox } from "lucide-react";
import Navbar from "../components/Navbar";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([getPendingInvitations(), getNotifications()])
      .then(([invRes, notifRes]) => {
        setInvitations(invRes.data || []);
        setNotifications(notifRes.data.notifications || []);
      })
      .catch((err) => {
        console.error("Failed to fetch notifications:", err);
        toast.error("Could not load notifications.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getCurrentUser()
      .then((res) => {
        if (res.data.role !== "student") {
          navigate("/teacher-dashboard");
        } else {
          setUser(res.data);
          fetchData(); // ✅ fetch both invitations + notifications
        }
      })
      .catch(() => navigate("/login"));
  }, [navigate, fetchData]);

  const handleInvitationResponse = (applicationId, memberId, response) => {
    // Optimistically remove the invitation first
    setInvitations((prev) =>
      prev.filter((invite) => invite.applicationId !== applicationId)
    );

    toast.promise(respondToInvitation({ applicationId, memberId, response }), {
      loading: "Submitting your response...",
      success: (res) => res.data.message,
      error: (err) => {
        fetchData(); // refresh if error
        return err.response?.data?.message || "Action failed.";
      },
    });
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login");
    } catch (error) {
      navigate("/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader className="w-10 h-10 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 text-white p-4 sm:p-6 lg:p-8 relative">
      <Toaster
        position="top-right"
        toastOptions={{ className: "bg-slate-700 text-white" }}
      />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 32 32%22 width=%2232%22 height=%2232%22 fill=%22none%22 stroke=%22rgb(148 163 184 / 0.05)%22%3e%3cpath d=%22m0 .5 32 32M32 .5 0 32%22/%3e%3c/svg%3e')]" />
      <div className="relative max-w-4xl mx-auto z-10">
        <Navbar
          user={user}
          handleLogout={handleLogout}
          notificationCount={invitations.length + notifications.length}
        />

        {/* Invitations */}
        <section>
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <Bell className="w-8 h-8 text-yellow-400" />
            Your Invitations
          </h2>
          {invitations.length === 0 ? (
            <div className="text-center text-slate-400 bg-slate-800/50 p-12 rounded-2xl flex flex-col items-center gap-4">
              <Inbox className="w-16 h-16 text-slate-500" />
              <h3 className="text-2xl font-bold">No Pending Invitations</h3>
              <p>You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {invitations.map((invite) => (
                <div
                  key={invite.applicationId}
                  className="bg-slate-800/60 border border-slate-700 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="flex-grow">
                    <p>
                      <span className="font-bold">{invite.leaderName}</span> has
                      invited you to join a group for the project:
                    </p>
                    <p className="text-cyan-400 font-semibold">
                      {invite.projectTitle}
                    </p>
                    <p className="text-xs text-slate-500">
                      Faculty: {invite.facultyName}
                    </p>
                  </div>
                  <div className="flex gap-3 flex-shrink-0">
                    <button
                      onClick={() =>
                        handleInvitationResponse(
                          invite.applicationId,
                          invite.memberId,
                          "approved"
                        )
                      }
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-500 px-4 py-2 rounded-md font-semibold transition"
                    >
                      <Check size={16} /> Accept
                    </button>
                    <button
                      onClick={() =>
                        handleInvitationResponse(
                          invite.applicationId,
                          invite.memberId,
                          "rejected"
                        )
                      }
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-500 px-4 py-2 rounded-md font-semibold transition"
                    >
                      <X size={16} /> Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* General Notifications */}
        <section className="mt-12">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <Bell className="w-8 h-8 text-blue-400" />
            Notifications
          </h2>
          {notifications.length === 0 ? (
            <div className="text-center text-slate-400 bg-slate-800/50 p-12 rounded-2xl flex flex-col items-center gap-4">
              <Inbox className="w-16 h-16 text-slate-500" />
              <h3 className="text-2xl font-bold">No Notifications</h3>
              <p>You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((n) => (
                <div
                  key={n._id}
                  className="bg-slate-800/60 border border-slate-700 rounded-lg p-4"
                >
                  <p>{n.message}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
