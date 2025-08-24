import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPendingInvitations,
  respondToInvitation,
  getCurrentUser,
  logoutUser,
} from "../api";
import { toast, Toaster } from "react-hot-toast";
import { Loader, Bell, Check, X, Inbox } from "lucide-react";
import Navbar from "../components/Navbar";

export default function Notifications() {
  const [notifications] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = useCallback(() => {
    setLoading(true);
    // Assuming getNotifications is not yet implemented, we'll just fetch invitations.
    // If you implement getNotifications, you can use Promise.all as in your original code.
    getPendingInvitations()
      .then((invRes) => {
        setInvitations(invRes.data || []);
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
          fetchData();
        }
      })
      .catch(() => navigate("/login"));
  }, [navigate, fetchData]);

  const handleInvitationResponse = (applicationId, memberId, response) => {
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
    } catch {
      navigate("/login");
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <Loader className="w-10 h-10 text-cyan-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-gray-800">
      <Toaster position="top-right" />
      <div className="relative max-w-4xl mx-auto z-10 p-4 sm:p-6 lg:p-8">
        <Navbar
          user={user}
          handleLogout={handleLogout}
          notificationCount={invitations.length + notifications.length}
        />

        <section>
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3 text-gray-700">
            <Bell className="w-8 h-8 text-cyan-600" />
            Your Invitations
          </h2>
          {invitations.length === 0 ? (
            <div className="text-center text-gray-500 bg-white p-12 rounded-xl border border-slate-200 flex flex-col items-center gap-4">
              <Inbox className="w-16 h-16 text-slate-400" />
              <h3 className="text-2xl font-bold">No Pending Invitations</h3>
              <p>You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {invitations.map((invite) => (
                <div
                  key={invite.applicationId}
                  className="bg-white border border-slate-200 rounded-xl shadow-lg p-4 flex flex-wrap items-center justify-between gap-4 transition hover:shadow-cyan-100 hover:border-cyan-300"
                >
                  <div className="flex-grow">
                    <p className="text-gray-700">
                      <span className="font-bold">{invite.leaderName}</span> has
                      invited you to join a group for the project:
                    </p>
                    <p className="text-cyan-700 font-semibold">
                      {invite.projectTitle}
                    </p>
                    <p className="text-xs text-gray-500">
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
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-semibold transition"
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
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-semibold transition"
                    >
                      <X size={16} /> Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        
        {/* You can add your general notifications section here later if needed */}

      </div>
    </div>
  );
}