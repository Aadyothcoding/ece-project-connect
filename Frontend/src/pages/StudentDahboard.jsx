import React, { useEffect, useState } from "react";
import {
  getAllProjects,
  applyToProject,
  getCurrentUser,
  logoutUser,
} from "../api";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { BookOpen, Send, CheckCircle, Search } from "lucide-react";
import Navbar from "../components/Navbar";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [user, setUser] = useState(null);
  const [appliedProjectIds, setAppliedProjectIds] = useState(new Set());
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

  useEffect(() => {
    getCurrentUser()
      .then((res) => {
        if (res.data.role !== "student") {
          navigate("/teacher-dashboard");
        } else {
          setUser(res.data);
          if (res.data.appliedProjects) {
            setAppliedProjectIds(new Set(res.data.appliedProjects));
          }
        }
      })
      .catch(() => navigate("/login"));

    getAllProjects()
      .then((res) => {
        setProjects(res.data);
        setFilteredProjects(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch projects:", err);
        toast.error("Could not load available projects.");
      });
  }, [navigate]);

  useEffect(() => {
    let filtered = projects;

    // Filter by search
    if (searchQuery.trim()) {
      filtered = filtered.filter((p) =>
        p.projectTitle.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by selected domains
    if (selectedDomains.length > 0) {
      filtered = filtered.filter((p) => selectedDomains.includes(p.domain));
    }

    setFilteredProjects(filtered);
  }, [searchQuery, selectedDomains, projects]);

  const handleApplyClick = (projectId) => {
    if (!user) {
      toast.error("User data not loaded. Please wait.");
      return;
    }
    const applicationData = {
      projectId: projectId,
      studentId: user._id,
      studentName: user.fullName,
    };
    toast.promise(applyToProject(applicationData), {
      loading: "Submitting your application...",
      success: (res) => {
        setAppliedProjectIds((prev) => new Set(prev).add(projectId));
        return res.data.message || "Successfully Applied!";
      },
      error: (err) => err.response?.data?.message || "Application failed.",
    });
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 text-white p-4 sm:p-6 lg:p-8 relative">
      <Toaster
        position="top-right"
        toastOptions={{
          className: "bg-slate-700 text-white",
        }}
      />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22 width=%2232%22 height=%2232%22 fill=%22none%22 stroke=%22rgb(148 163 184 / 0.05)%22%3e%3cpath d=%22m0 .5 32 32M32 .5 0 32%22/%3e%3c/svg%3e')]" />

      <div className="relative max-w-7xl mx-auto z-10">
        <Navbar user={user} handleLogout={handleLogout} />

        <div className="flex gap-8 mt-6">
          {/* Sidebar Filter */}
          <aside className="w-64 bg-slate-800/50 p-4 rounded-lg border border-slate-700 h-fit sticky top-20">
            <h3 className="text-lg font-bold mb-4">Filter by Domain</h3>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
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

          {/* Main Content */}
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
                    onClick={() => handleApplyClick(p._id)}
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
