import React, { useEffect, useState, useCallback } from "react";
import { getAllProjects, applyToProject, getCurrentUser, logoutUser, searchStudents, getPendingInvitations } from "../api";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { BookOpen, Send, CheckCircle, Search, Users, User, X, Loader, Bell } from "lucide-react";
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
  const [applicationType, setApplicationType] = useState('individual');
  const [members, setMembers] = useState([{ name: '', regNo: '' }, { name: '', regNo: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for the live search
  const [searchQueries, setSearchQueries] = useState(['', '']);
  const [searchResults, setSearchResults] = useState([[], []]);
  const [searchLoading, setSearchLoading] = useState([false, false]);
  const [activeIndex, setActiveIndex] = useState(null); // To control which dropdown is visible

  const debouncedSearchQueries = useDebounce(searchQueries, 300);

  useEffect(() => {
    const performSearch = async (index) => {
      const query = debouncedSearchQueries[index];
      if (query.length < 2) {
        setSearchResults(prev => { const next = [...prev]; next[index] = []; return next; });
        return;
      }
      setSearchLoading(prev => { const next = [...prev]; next[index] = true; return next; });
      try {
        const res = await searchStudents(query);
        setSearchResults(prev => { const next = [...prev]; next[index] = res.data; return next; });
      } catch (error) {
        console.error("Search failed:", error);
        toast.error("Failed to search for students.");
      } finally {
        setSearchLoading(prev => { const next = [...prev]; next[index] = false; return next; });
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
    updatedMembers[index] = { name: value, regNo: '' }; // Clear selection if user types again
    setMembers(updatedMembers);
    setActiveIndex(index);
  };

  const handleSelectStudent = (memberIndex, student) => {
    const updatedMembers = [...members];
    updatedMembers[memberIndex] = { name: student.fullName, regNo: student.regNo || 'N/A' };
    setMembers(updatedMembers);
    
    const updatedQueries = [...searchQueries];
    updatedQueries[memberIndex] = student.fullName;
    setSearchQueries(updatedQueries);

    setActiveIndex(null); // Hide dropdown after selection
  };

  const handleSubmit = async () => {
    if (applicationType === 'group') {
        for (const member of members) {
            if (!member.name.trim() || !member.regNo.trim() || member.regNo === 'N/A') {
                toast.error("Please select valid teammates from the search results.");
                return;
            }
        }
    }
    setIsSubmitting(true);
    const applicationData = {
      projectId: project._id,
      applicationType,
      members: applicationType === 'group' ? members : [],
    };

    toast.promise(
      applyToProject(applicationData),
      {
        loading: 'Submitting application...',
        success: (res) => {
          onApply(project._id);
          onClose();
          return res.data.message || 'Success!';
        },
        error: (err) => err.response?.data?.message || 'Application failed.',
      }
    ).finally(() => setIsSubmitting(false));
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg p-6 md:p-8 shadow-xl max-w-lg w-full border border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-white">Apply to: {project.projectTitle}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={28} /></button>
        </div>
        <div className="flex gap-4 mb-6">
          <button onClick={() => setApplicationType('individual')} className={`flex-1 p-3 rounded-lg flex items-center justify-center gap-2 transition ${applicationType === 'individual' ? 'bg-cyan-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}><User /> Individual</button>
          <button onClick={() => setApplicationType('group')} className={`flex-1 p-3 rounded-lg flex items-center justify-center gap-2 transition ${applicationType === 'group' ? 'bg-cyan-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}><Users /> Group (3 members)</button>
        </div>
        {applicationType === 'group' && (
          <div className="space-y-4 mb-6">
            <p className="text-sm text-slate-400">You are the group leader. Search for your 2 teammates by name to add them to the group. They will be notified on their dashboard.</p>
            {[0, 1].map(index => (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <input type="text" placeholder={`Search Teammate ${index + 1} Name`} value={searchQueries[index]} onChange={(e) => handleSearchChange(index, e.target.value)} onFocus={() => setActiveIndex(index)} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition" />
                  {activeIndex === index && searchQueries[index].length > 1 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-lg z-10 max-h-40 overflow-y-auto">
                      {searchLoading[index] && <div className="p-3 text-slate-400 flex items-center gap-2"><Loader className="animate-spin w-4 h-4" /> Searching...</div>}
                      {!searchLoading[index] && searchResults[index].length === 0 && <div className="p-3 text-slate-400">No students found.</div>}
                      {searchResults[index].map(student => (
                        <div key={student._id} onClick={() => handleSelectStudent(index, student)} className="p-3 hover:bg-slate-700 cursor-pointer">
                          <p className="font-semibold">{student.fullName}</p>
                          <p className="text-xs text-slate-400">{student.regNo}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <input type="text" placeholder="Registration No." value={members[index].regNo} readOnly className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-400 cursor-not-allowed" />
              </div>
            ))}
          </div>
        )}
        <button onClick={handleSubmit} disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-4 py-3 rounded-lg font-semibold disabled:opacity-50">{isSubmitting ? 'Submitting...' : 'Confirm Application'}</button>
      </div>
    </div>
  );
};


export default function StudentDashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(null);
  const [appliedProjectIds, setAppliedProjectIds] = useState(new Set());
  const [selectedProject, setSelectedProject] = useState(null);
  const [invitations, setInvitations] = useState([]);

  const fetchInvitations = useCallback(() => {
    getPendingInvitations()
      .then(res => setInvitations(res.data))
      .catch(err => console.error("Failed to fetch invitations:", err));
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
      .then((res) => setProjects(res.data))
      .catch(() => toast.error("Could not load available projects."));
  }, [navigate, fetchInvitations]);

  const handleApplySuccess = (projectId) => {
    setAppliedProjectIds((prev) => new Set(prev).add(projectId));
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login");
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 text-white p-4 sm:p-6 lg:p-8 relative">
      <Toaster position="top-right" toastOptions={{ className: "bg-slate-700 text-white" }} />
      {selectedProject && <ApplyModal project={selectedProject} onClose={() => setSelectedProject(null)} onApply={handleApplySuccess}/>}
      
      <div className="relative max-w-7xl mx-auto z-10">
        <Navbar user={user} handleLogout={handleLogout} notificationCount={invitations.length} />

        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-cyan-400" />
            Available Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p) => (
              <div key={p._id} className="bg-slate-800/40 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-lg hover:border-cyan-500 transition-all duration-300 flex flex-col">
                <div className="flex-grow">
                  <h3 className="text-xl font-bold mb-2 text-white">{p.projectTitle}</h3>
                  <p className="text-sm text-slate-300 mb-4 h-24 overflow-y-auto">{p.description}</p>
                   <div className="text-xs text-slate-400 space-y-2 border-t border-slate-700 pt-3 mt-3">
                      <p><strong>Faculty:</strong> {p.facultyName}</p>
                      <p><strong>Stream:</strong> {p.stream}</p>
                    </div>
                </div>
                <button onClick={() => setSelectedProject(p)} disabled={appliedProjectIds.has(p._id)} className="mt-6 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-4 py-3 rounded-lg font-semibold transition-transform transform hover:scale-105 disabled:from-slate-600 disabled:to-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed">
                  {appliedProjectIds.has(p._id) ? (<><CheckCircle className="w-5 h-5" /> Applied</>) : (<><Send className="w-5 h-5" /> Apply Now</>)}
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}