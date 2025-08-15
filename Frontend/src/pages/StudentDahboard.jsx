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
  Bell,
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
  const [applicationType, setApplicationType] = useState("individual");
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

    // If length matches typical regNo length (e.g., 10 chars), check immediately
    if (value.length >= 8) {
      // adjust min length for regNo
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

    setActiveIndex(null); // Hide dropdown after selection
  };

  const fetchStudentByRegNo = async (index, regNo) => {
    try {
      const res = await searchStudents(regNo);
      // Only auto-fill if exactly one match AND regNo matches exactly
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
    if (applicationType === "group") {
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
    }
    setIsSubmitting(true);
    const applicationData = {
      projectId: project._id,
      applicationType,
      members: applicationType === "group" ? members : [],
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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg p-6 md:p-8 shadow-xl max-w-lg w-full border border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-white">
            Apply to: {project.projectTitle}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={28} />
          </button>
        </div>
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setApplicationType("individual")}
            className={`flex-1 p-3 rounded-lg flex items-center justify-center gap-2 transition ${
              applicationType === "individual"
                ? "bg-cyan-600 text-white"
                : "bg-slate-700 hover:bg-slate-600 text-slate-300"
            }`}
          >
            <User /> Individual
          </button>
          <button
            onClick={() => setApplicationType("group")}
            className={`flex-1 p-3 rounded-lg flex items-center justify-center gap-2 transition ${
              applicationType === "group"
                ? "bg-cyan-600 text-white"
                : "bg-slate-700 hover:bg-slate-600 text-slate-300"
            }`}
          >
            <Users /> Group (3 members)
          </button>
        </div>
        {applicationType === "group" && (
          <div className="space-y-4 mb-6">
            <p className="text-sm text-slate-400">
              You are the group leader. Search for your 2 teammates by name to
              add them to the group. They will be notified on their dashboard.
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
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition"
                  />
                  {activeIndex === index && searchQueries[index].length > 1 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-lg z-10 max-h-40 overflow-y-auto">
                      {searchLoading[index] && (
                        <div className="p-3 text-slate-400 flex items-center gap-2">
                          <Loader className="animate-spin w-4 h-4" />{" "}
                          Searching...
                        </div>
                      )}
                      {!searchLoading[index] &&
                        searchResults[index].length === 0 && (
                          <div className="p-3 text-slate-400">
                            No students found.
                          </div>
                        )}
                      {searchResults[index].map((student) => (
                        <div
                          key={student._id}
                          onClick={() => handleSelectStudent(index, student)}
                          className="p-3 hover:bg-slate-700 cursor-pointer"
                        >
                          <p className="font-semibold">{student.fullName}</p>
                          <p className="text-xs text-slate-400">
                            {student.regNo}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Registration No."
                  value={members[index].regNo}
                  readOnly
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-400 cursor-not-allowed"
                />
              </div>
            ))}
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-4 py-3 rounded-lg font-semibold disabled:opacity-50"
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
  const [searchQuery, setSearchQuery] = useState(""); // <-- NEW for title search
  const [selectedDomains, setSelectedDomains] = useState([]); // <-- NEW

  // 1️⃣ Domain filter options
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

  // 2️⃣ Filtering projects based on search + selected domains
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

  // 3️⃣ Toggle domain filter
  const toggleDomain = (domain) => {
    setSelectedDomains((prev) =>
      prev.includes(domain)
        ? prev.filter((d) => d !== domain)
        : [...prev, domain]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 text-white p-4 sm:p-6 lg:p-8 relative">
      <Toaster
        position="top-right"
        toastOptions={{ className: "bg-slate-700 text-white" }}
      />
      {selectedProject && (
        <ApplyModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onApply={handleApplySuccess}
        />
      )}

      <div className="relative max-w-7xl mx-auto z-10">
        <Navbar
          user={user}
          handleLogout={handleLogout}
          notificationCount={invitations.length}
        />

        <div className="lg:flex lg:gap-8 mt-6">
          {/* 4️⃣ Sidebar Filter Menu */}
          <aside className="w-full lg:w-64 mb-8 lg:mb-0 bg-slate-800/50 p-4 rounded-lg border border-slate-700 h-fit lg:sticky top-20">
            <h3 className="text-lg font-bold mb-4">Filter by Domain</h3>
            <div className="space-y-2 max-h-[30vh] lg:max-h-[60vh] overflow-y-auto">
              {domainOptions.map((domain) => (
                <label key={domain} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedDomains.includes(domain)}
                    onChange={() => toggleDomain(domain)}
                    className="accent-cyan-500"
                  />
                  {domain}
                </label>
              ))}
            </div>
          </aside>

          {/* Main Projects Section */}
          <main className="flex-1">
            {/* Search Bar */}
            <div className="mb-6 flex items-center bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2">
              <Search className="w-5 h-5 text-slate-400 mr-2" />
              <input
                type="text"
                placeholder="Search by project title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent outline-none text-white placeholder-slate-400"
              />
            </div>

            {/* Projects List */}
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-cyan-400" />
              Available Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((p) => (
                <div
                  key={p._id}
                  className="bg-slate-800/40 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-lg hover:border-cyan-500 transition-all duration-300 flex flex-col"
                >
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold mb-2 text-white">
                      {p.projectTitle}
                    </h3>
                    <p className="text-sm text-slate-300 mb-4 h-24 overflow-y-auto">
                      {p.description}
                    </p>
                    <div className="text-xs text-slate-400 space-y-2 border-t border-slate-700 pt-3 mt-3">
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
                    className="mt-6 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-4 py-3 rounded-lg font-semibold transition-transform transform hover:scale-105 disabled:from-slate-600 disabled:to-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed"
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
