import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getApprovedTeams,
  getCurrentUser,
  logoutUser,
  removeTeamMember,
  addTeamMember,
  searchStudents,
  getStudentInfo, // Assuming search is by RegNo
} from "../api";
import { toast, Toaster } from "react-hot-toast";
import { Loader, Users, Inbox, X, Plus, Search, FileText } from "lucide-react";
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
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const fetchMyTeams = useCallback((currentUser) => {
    if (!currentUser) return;
    setLoading(true);
    getApprovedTeams()
      .then((res) => {
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
    if (window.confirm("Are you sure you want to remove this member?")) {
      toast.promise(removeTeamMember(teamId, memberId), {
        loading: "Removing member...",
        success: (res) => {
          setMyTeams((prev) =>
            prev.map((team) => (team._id === teamId ? res.data.team : team))
          );
          return "Member removed successfully";
        },
        error: "Failed to remove member",
      });
    }
  };

  const handleViewProfile = async (memberId) => {
    setLoadingProfile(true);
    try {
      const res = await getStudentInfo(memberId);
      setProfileData(res.data);
      setShowProfileModal(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load profile");
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSearchStudent = async () => {
    if (!searchRegNo.trim()) return;
    setIsSearching(true);
    try {
      // Assuming searchStudents can also search by registration number
      const res = await searchStudents(searchRegNo);
      if (res.data.length > 0) {
        setSearchedStudent(res.data[0]);
      } else {
        setSearchedStudent(null);
        toast.error("Student not found.");
      }
    } catch (err) {
      setSearchedStudent(null);
      toast.error(err.response?.data?.message || "Student not found");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddMember = async () => {
    if (!searchedStudent) return;
    setIsAdding(true);
    toast
      .promise(addTeamMember(selectedTeam._id, searchedStudent._id), {
        loading: "Adding member...",
        success: (res) => {
          setMyTeams((prev) =>
            prev.map((team) =>
              team._id === selectedTeam._id ? res.data.team : team
            )
          );
          setShowModal(false);
          setSearchedStudent(null);
          setSearchRegNo("");
          return "Member added successfully";
        },
        error: (err) => err.response?.data?.message || "Failed to add member",
      })
      .finally(() => setIsAdding(false));
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
      <div className="relative max-w-6xl mx-auto z-10 p-4 sm:p-6 lg:p-8">
        <Navbar user={user} handleLogout={handleLogout} />

        <section>
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3 text-gray-700">
            <Users className="w-8 h-8 text-cyan-600" />
            My Approved Teams
          </h2>
          {myTeams.length === 0 ? (
            <div className="text-center text-gray-500 bg-white p-12 rounded-xl border border-slate-200 flex flex-col items-center gap-4">
              <Inbox className="w-16 h-16 text-slate-400" />
              <h3 className="text-2xl font-bold">No Approved Teams Yet</h3>
              <p>When you approve an application, the team will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myTeams.map((team) => (
                <div
                  key={team._id}
                  className="bg-white border border-slate-200 rounded-xl shadow-lg p-6 flex flex-col"
                >
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold text-cyan-700 mb-2">
                      {team.projectId.projectTitle}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4 capitalize">
                      {team.applicationType} Project
                    </p>
                    <div className="border-t border-slate-200 pt-4">
                      <h4 className="font-semibold mb-2 text-gray-600">
                        Members:
                      </h4>
                      <ul className="space-y-3">
                        {team.members.map((member) => (
                          <li
                            key={member._id}
                            className="flex items-center justify-between text-sm text-gray-700"
                          >
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-xs text-gray-500">
                                {member.regNo}
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                handleViewProfile(member.studentId._id)
                              } // ✅ FIXED
                              className="text-blue-500 hover:text-blue-700"
                              title="View Profile"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleRemoveMember(
                                  team._id,
                                  member.studentId._id
                                )
                              }
                              className="p-1 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600 transition"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedTeam(team);
                      setShowModal(true);
                    }}
                    className="mt-6 w-full flex items-center justify-center gap-2 px-3 py-2 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 rounded-lg text-sm font-semibold border border-cyan-200 transition"
                  >
                    <Plus className="w-4 h-4" /> Add Member
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {showProfileModal && profileData && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg text-gray-800">
            <h3 className="text-2xl font-bold mb-4">{profileData.fullName}</h3>
            <p>
              <span className="font-semibold">Email:</span> {profileData.email}
            </p>
            <p>
              <span className="font-semibold">Reg No:</span> {profileData.regNo}
            </p>
            <p>
              <span className="font-semibold">Department:</span>{" "}
              {profileData.department}
            </p>
            <p>
              <span className="font-semibold">Experience:</span>{" "}
              {profileData.experience || "N/A"}
            </p>
            <p>
              <span className="font-semibold">Description:</span>{" "}
              {profileData.description || "N/A"}
            </p>
            <p>
              <span className="font-semibold">Research Past:</span>{" "}
              {profileData.researchPast || "N/A"}
            </p>
            <p className="mt-2">
              <span className="font-semibold">Skills:</span>{" "}
              {profileData.skills?.join(", ") || "N/A"}
            </p>

            {profileData.resumeUrl && (
              <div className="mt-4">
                <a
                  href={profileData.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg"
                >
                  View Resume
                </a>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowProfileModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md text-gray-800">
            <h3 className="text-xl font-bold mb-4">Add New Member</h3>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Enter Student Registration No."
                value={searchRegNo}
                onChange={(e) => setSearchRegNo(e.target.value)}
                className="flex-grow px-4 py-2 text-gray-700 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
              />
              <button
                onClick={handleSearchStudent}
                disabled={isSearching}
                className="p-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white disabled:opacity-50"
              >
                {isSearching ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </button>
            </div>

            {searchedStudent && (
              <div className="mt-4 p-4 bg-slate-100 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-semibold">{searchedStudent.fullName}</p>
                  <p className="text-sm text-gray-500">
                    {searchedStudent.regNo}
                  </p>
                </div>
                <button
                  onClick={handleAddMember}
                  disabled={isAdding}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm font-semibold disabled:opacity-50"
                >
                  {isAdding ? "Adding..." : "Add to Team"}
                </button>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSearchedStudent(null);
                  setSearchRegNo("");
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
