import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getApprovedTeams,
  getCurrentUser,
  logoutUser,
  removeTeamMember,
  addTeamMember,
  searchStudentByRegNo,
} from "../api";
import { toast, Toaster } from "react-hot-toast";
import { Loader, Users, Inbox, X, Plus } from "lucide-react";
import Navbar from "../components/Navbar";

export default function MyTeams() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [myTeams, setMyTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [searchRegNo, setSearchRegNo] = useState("");
  const [searchedStudent, setSearchedStudent] = useState(null);

  const fetchMyTeams = useCallback((currentUser) => {
    if (!currentUser) return;
    setLoading(true);
    getApprovedTeams()
      .then((res) => {
        // Filter teams to show only those belonging to the current teacher
        const filteredTeams = res.data.teams.filter(
          (team) => team.facultyName === currentUser.fullName
        );
        setMyTeams(filteredTeams);
      })
      .catch((err) => {
        console.error("Failed to fetch teams:", err);
        toast.error("Could not load your approved teams.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getCurrentUser()
      .then((res) => {
        if (res.data.role !== "teacher") {
          navigate("/student-dashboard");
        } else {
          setUser(res.data);
          fetchMyTeams(res.data);
        }
      })
      .catch(() => navigate("/login"));
  }, [navigate, fetchMyTeams]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login");
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      navigate("/login");
    }
  };
  const handleRemoveMember = async (teamId, memberId) => {
    try {
      const res = await removeTeamMember(teamId, memberId);
      toast.success("Member removed successfully");
      // update state with new team
      setMyTeams((prev) =>
        prev.map((team) => (team._id === teamId ? res.data.team : team))
      );
    } catch (err) {
      toast.error("Failed to remove member");
      console.error(err);
    }
  };
  const handleSearchStudent = async () => {
    try {
      const res = await searchStudentByRegNo(searchRegNo);
      setSearchedStudent(res.data.student);
    } catch (err) {
      setSearchedStudent(null);
      toast.error(err.response?.data?.message || "Student not found");
    }
  };

  const handleAddMember = async () => {
    if (!searchedStudent) return;
    try {
      const res = await addTeamMember(selectedTeam._id, searchedStudent._id);
      toast.success("Member added successfully");
      setMyTeams((prev) =>
        prev.map((team) =>
          team._id === selectedTeam._id ? res.data.team : team
        )
      );
      setShowModal(false);
      setSearchedStudent(null);
      setSearchRegNo("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add member");
    }
  };

  if (loading || !user) {
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
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22 width=%2232%22 height=%2232%22 fill=%22none%22 stroke=%22rgb(148 163 184 / 0.05)%22%3e%3cpath d=%22m0 .5 32 32M32 .5 0 32%22/%3e%3c/svg%3e')]" />
      <div className="relative max-w-6xl mx-auto z-10">
        <Navbar user={user} handleLogout={handleLogout} />

        <section>
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-400" />
            My Approved Teams
          </h2>
          {myTeams.length === 0 ? (
            <div className="text-center text-slate-400 bg-slate-800/50 p-12 rounded-2xl flex flex-col items-center gap-4">
              <Inbox className="w-16 h-16 text-slate-500" />
              <h3 className="text-2xl font-bold">No Approved Teams Yet</h3>
              <p>When you approve an application, the team will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myTeams.map((team) => (
                <div
                  key={team._id}
                  className="bg-slate-800/60 border border-slate-700 rounded-lg p-6"
                >
                  <h3 className="text-xl font-bold text-purple-300 mb-2">
                    {team.projectId.projectTitle}
                  </h3>
                  <p className="text-sm text-slate-400 mb-4 capitalize">
                    {team.applicationType} Project
                  </p>
                  <div className="border-t border-slate-700 pt-4">
                    <h4 className="font-semibold mb-2">Members:</h4>
                    <ul className="space-y-2">
                      {team.members.map((member) => (
                        <li
                          key={member.studentId._id}
                          className="flex items-center justify-between text-sm text-slate-300"
                        >
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-xs text-slate-500">
                              {member.regNo}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              handleRemoveMember(team._id, member.studentId._id)
                            }
                            className="text-red-400 hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => {
                        setSelectedTeam(team);
                        setShowModal(true);
                      }}
                      className="mt-4 flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" /> Add Member
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      {/* Popup Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-slate-800 p-6 rounded-xl w-96">
            <h3 className="text-xl font-bold mb-4">Add Member</h3>
            <input
              type="text"
              placeholder="Enter Register No"
              value={searchRegNo}
              onChange={(e) => setSearchRegNo(e.target.value)}
              className="w-full px-3 py-2 rounded bg-slate-700 text-white mb-3"
            />
            <button
              onClick={handleSearchStudent}
              className="bg-blue-600 px-4 py-2 rounded text-white"
            >
              Search
            </button>

            {searchedStudent && (
              <div className="mt-4 p-3 bg-slate-700 rounded">
                <p>
                  {searchedStudent.fullName} ({searchedStudent.regNo})
                </p>
                <button
                  onClick={handleAddMember}
                  className="bg-green-500 px-4 py-1 mt-2 rounded text-white"
                >
                  Add to Team
                </button>
              </div>
            )}

            <button
              onClick={() => setShowModal(false)}
              className="mt-4 text-red-400"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
