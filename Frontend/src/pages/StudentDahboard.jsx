import React, { useEffect, useState, useCallback } from "react";
import {
  getAllProjects,
  applyToProject,
  getCurrentUser,
  logoutUser,
  searchStudents,
  getPendingInvitations,
} from "../api";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import {
  BookOpen,
  Send,
  CheckCircle,
  Search,
  Users,
  User,
  X,
  Loader,
} from "lucide-react";
import Navbar from "../components/Navbar";

// Custom hook for debouncing input to reduce API calls
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

// ApplyModal with live search functionality
const ApplyModal = ({ project, onClose, onApply }) => {
  const [applicationType] = useState("group");
  const [members, setMembers] = useState([
    { name: "", regNo: "" },
    { name: "", regNo: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for the live search

  const [searchQueries, setSearchQueries] = useState(["", ""]);
  const [searchResults, setSearchResults] = useState([[], []]);
  const [searchLoading, setSearchLoading] = useState([false, false]);
  const [activeIndex, setActiveIndex] = useState(null); // To control which dropdown is visible

  const debouncedSearchQueries = useDebounce(searchQueries, 300);

  useEffect(() => {
    const performSearch = async (index) => {
      const query = debouncedSearchQueries[index];
      if (query.length < 2) {
        setSearchResults((prev) => {
          const next = [...prev];
          next[index] = [];
          return next;
        });
        return;
      }
      setSearchLoading((prev) => {
        const next = [...prev];
        next[index] = true;
        return next;
      });
      try {
        const res = await searchStudents(query);
        setSearchResults((prev) => {
          const next = [...prev];
          next[index] = res.data;
          return next;
        });
      } catch (error) {
        console.error("Search failed:", error);
        toast.error("Failed to search for students.");
      } finally {
        setSearchLoading((prev) => {
          const next = [...prev];
          next[index] = false;
          return next;
        });
      }
    };

    debouncedSearchQueries.forEach((query, index) => {
      performSearch(index);
    });
  }, [debouncedSearchQueries]);

  const handleSearchChange = (index, value) => {
    const updatedQueries = [...searchQueries];
    updatedQueries[index] = value;
    setSearchQueries(updatedQueries);

    const updatedMembers = [...members];
    updatedMembers[index] = { name: value, regNo: "" }; // reset
    setMembers(updatedMembers);
    setActiveIndex(index);

    if (value.length >= 8) {
      fetchStudentByRegNo(index, value);
    }
  };

  const handleSelectStudent = (memberIndex, student) => {
    const updatedMembers = [...members];
    updatedMembers[memberIndex] = {
      name: student.fullName,
      regNo: student.regNo || "N/A",
    };
    setMembers(updatedMembers);

    const updatedQueries = [...searchQueries];
    updatedQueries[memberIndex] = student.regNo;

    setActiveIndex(null);
  };

  const fetchStudentByRegNo = async (index, regNo) => {
    try {
      const res = await searchStudents(regNo);
      if (
        res.data.length === 1 &&
        res.data[0].regNo.toLowerCase() === regNo.toLowerCase()
      ) {
        const student = res.data[0];
        const updatedMembers = [...members];
        updatedMembers[index] = {
          name: student.fullName,
          regNo: student.regNo,
        };
        setMembers(updatedMembers);
      }
    } catch (error) {
      console.error("Exact regNo search failed:", error);
    }
  };

  const handleSubmit = async () => {
    for (const member of members) {
      if (
        !member.name.trim() ||
        !member.regNo.trim() ||
        member.regNo === "N/A"
      ) {
        toast.error("Please select valid teammates from the search results.");
        return;
      }
    }
    setIsSubmitting(true);
    const applicationData = {
      projectId: project._id,
      applicationType: "group",
      members,
    };

    toast
      .promise(applyToProject(applicationData), {
        loading: "Submitting application...",
        success: (res) => {
          onApply(project._id);
          onClose();
          return res.data.message || "Success!";
        },
        error: (err) => err.response?.data?.message || "Application failed.",
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 md:p-8 shadow-xl max-w-lg w-full border border-slate-200 text-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">
            Apply to: {project.projectTitle}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X size={28} />
          </button>
        </div>
        <div className="flex gap-4 mb-6">
          <button
            className="flex-1 p-3 rounded-lg flex items-center justify-center gap-2 bg-cyan-600 text-white cursor-not-allowed"
            disabled
          >
            <Users /> Group (3 members)
          </button>
        </div>
        {applicationType === "group" && (
          <div className="space-y-4 mb-6">
            <p className="text-sm text-gray-600">
              You are the group leader. Search for your 2 teammates by their
              registration number.
            </p>
            {[0, 1].map((index) => (
              <div
                key={index}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <div className="relative">
                  <input
                    type="text"
                    placeholder={`Enter Teammate ${index + 1} Reg. No.`}
                    value={searchQueries[index]}
                    onChange={(e) => handleSearchChange(index, e.target.value)}
                    className="w-full px-4 py-2 text-gray-700 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                  />
                  {activeIndex === index && searchQueries[index].length > 1 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-300 rounded-lg z-10 max-h-40 overflow-y-auto shadow-lg">
                      {searchLoading[index] && (
                        <div className="p-3 text-gray-500 flex items-center gap-2">
                          <Loader className="animate-spin w-4 h-4" />{" "}
                          Searching...
                        </div>
                      )}
                      {!searchLoading[index] &&
                        searchResults[index].length === 0 && (
                          <div className="p-3 text-gray-500">
                            No students found.
                          </div>
                        )}
                      {searchResults[index].map((student) => (
                        <div
                          key={student._id}
                          onClick={() => handleSelectStudent(index, student)}
                          className="p-3 hover:bg-slate-100 cursor-pointer"
                        >
                          <p className="font-semibold text-gray-800">{student.fullName}</p>
                          <p className="text-xs text-gray-500">
                            {student.regNo}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Student Name"
                  value={members[index].name}
                  readOnly
                  className="w-full px-4 py-2 bg-slate-200 border border-slate-300 rounded-lg text-gray-500 cursor-not-allowed"
                />
              </div>
            ))}
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Confirm Application"}
        </button>
      </div>
    </div>
  );
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [user, setUser] = useState(null);
  const [appliedProjectIds, setAppliedProjectIds] = useState(new Set());
  const [selectedProject, setSelectedProject] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomains, setSelectedDomains] = useState([]);

  const domainOptions = [
    "Analog Circuits",
    "Digital Circuits",
    "Semiconductor Devices",
    "Wireless & Mobile Communication",
    "Fiber-Optic Communication",
    "Computer Networks",
    "Digital Signal Processing (DSP)",
    "Image & Video Processing",
    "Embedded Systems",
    "Internet of Things (IoT)",
    "Electromagnetics & RF Engineering",
    "Antennas & Wave Propagation",
    "VLSI (Very Large Scale Integration)",
    "Control Systems",
    "Robotics and Automation",
    "Power Electronics",
    "Computer Architecture",
    "Photonics and Optoelectronics",
    "Information Theory",
    "Biomedical Engineering",
    "Quantum Computing",
    "MEMS (Micro-Electro-Mechanical Systems)",
    "Machine Learning & AI Hardware",
    "Signal Integrity and High-Speed Design",
    "Nanoelectronics",
    "Terahertz Technology",
    "Mixed Signal Design",
    "Automotive Electronics",
    "Sensor Networks",
    "Radar Systems",
    "Satellite Communication",
    "Cyber-Physical Systems",
    "Augmented & Virtual Reality Hardware",
  ];

  const fetchInvitations = useCallback(() => {
    getPendingInvitations()
      .then((res) => setInvitations(res.data))
      .catch((err) => console.error("Failed to fetch invitations:", err));
  }, []);

  useEffect(() => {
    getCurrentUser()
      .then((res) => {
        if (res.data.role !== "student") {
          navigate("/teacher-dashboard");
        } else {
          setUser(res.data);
          fetchInvitations();
        }
      })
      .catch(() => navigate("/login"));

    getAllProjects()
      .then((res) => {
        setProjects(res.data);
        setFilteredProjects(res.data);
      })
      .catch(() => toast.error("Could not load available projects."));
  }, [navigate, fetchInvitations]);

  useEffect(() => {
    let filtered = projects;

    if (searchQuery.trim()) {
      filtered = filtered.filter((p) =>
        p.projectTitle.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedDomains.length > 0) {
      filtered = filtered.filter((p) => selectedDomains.includes(p.domain));
    }

    setFilteredProjects(filtered);
  }, [searchQuery, selectedDomains, projects]);

  const handleApplySuccess = (projectId) => {
    setAppliedProjectIds((prev) => new Set(prev).add(projectId));
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login");
    } catch {
      navigate("/login");
    }
  };

  const toggleDomain = (domain) => {
    setSelectedDomains((prev) =>
      prev.includes(domain)
        ? prev.filter((d) => d !== domain)
        : [...prev, domain]
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 text-gray-800">
      <Toaster
        position="top-right"
      />
      {selectedProject && (
        <ApplyModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onApply={handleApplySuccess}
        />
      )}

      <div className="relative max-w-7xl mx-auto z-10 p-4 sm:p-6 lg:p-8">
        <Navbar
          user={user}
          handleLogout={handleLogout}
          notificationCount={invitations.length}
        />

        <div className="lg:flex lg:gap-8 mt-6">
          <aside className="w-full lg:w-64 mb-8 lg:mb-0 bg-white p-4 rounded-xl shadow-lg border border-slate-200 h-fit lg:sticky top-8">
            <h3 className="text-lg font-bold mb-4 text-gray-700">Filter by Domain</h3>
            <div className="space-y-2 max-h-[30vh] lg:max-h-[60vh] overflow-y-auto">
              {domainOptions.map((domain) => (
                <label key={domain} className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={selectedDomains.includes(domain)}
                    onChange={() => toggleDomain(domain)}
                    className="accent-cyan-600"
                  />
                  {domain}
                </label>
              ))}
            </div>
          </aside>

          <main className="flex-1">
            <div className="mb-6 flex items-center bg-white border border-slate-200 rounded-lg px-4 py-2 shadow-sm">
              <Search className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search by project title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
              />
            </div>

            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-700">
              <BookOpen className="w-6 h-6 text-cyan-600" />
              Available Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProjects.map((p) => (
                <div
                  key={p._id}
                  className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 flex flex-col justify-between transition hover:shadow-cyan-100 hover:border-cyan-300"
                >
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold mb-2 text-gray-800">
                      {p.projectTitle}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 h-24 overflow-y-auto">
                      {p.description}
                    </p>
                    <div className="text-xs text-gray-500 space-y-2 border-t border-slate-200 pt-3 mt-3">
                      <p>
                        <strong>Faculty:</strong> {p.facultyName}
                      </p>
                      <p>
                        <strong>Stream:</strong> {p.stream}
                      </p>
                      <p>
                        <strong>Domain:</strong> {p.domain}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedProject(p)}
                    disabled={appliedProjectIds.has(p._id)}
                    className="mt-6 w-full flex items-center justify-center gap-2 py-3 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {appliedProjectIds.has(p._id) ? (
                      <>
                        <CheckCircle className="w-5 h-5" /> Applied
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" /> Apply Now
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}