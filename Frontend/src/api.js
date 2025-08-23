import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3050/api",
  withCredentials: true,
});

// --- AUTH ROUTES ---
export const signupUser = (data) => API.post("/auth/signup", data);
export const loginUser = (data) => API.post("/auth/login", data);
export const logoutUser = () => API.post("/auth/logout");
export const forgotPassword = (data) => API.post("/auth/forgot-password", data);
export const getCurrentUser = () => API.get("/auth/check");
export const updateProfile = (data) => API.put("/auth/update-profile", data);

// --- PROJECT ROUTES ---
export const getAllProjects = () => API.get("/projects");
export const createProject = (data) => API.post("/projects", data);
export const deleteProject = (id) => API.delete(`/projects/${id}`);
export const getTeacherProjects = () => API.get("/projects/my-projects");
export const updateProject = (id, data) => API.put(`/projects/${id}`, data);

// --- STUDENT & APPLICATION ROUTES ---
export const applyToProject = (data) => API.post("/student/apply", data);
export const getApplicationsForProject = (projectId) =>
  API.get(`/student/${projectId}`);

// --- NOTIFICATION / INVITATION ROUTES ---
export const getPendingInvitations = () => API.get("/student/invitations");
export const respondToInvitation = (data) =>
  API.post("/student/invitations/respond", data);
export const getNotifications = () => API.get("/notifications/me");
export const deleteNotification = (id) => API.delete(`/notifications/${id}`);

// --- USER SEARCH ROUTE ---
export const searchStudents = (name) => API.get(`/usersearch?q=${name}`);

// --- TEAM APPROVAL ROUTES ---
export const approveApplication = (id) =>
  API.post(`/team-approved/approve/${id}`);
export const rejectApplication = (id) =>
  API.post(`/team-approved/reject/${id}`);
export const getApprovedTeams = () => API.get(`/team-approved`);
export const removeTeamMember = (teamId, memberId) =>
  API.delete(`/team-approved/${teamId}/members/${memberId}`);
export const searchStudentByRegNo = (regNo) =>
  API.get(`/team-approved/search-student?regNo=${regNo}`);

export const addTeamMember = (teamId, studentId) =>
  API.post(`/team-approved/${teamId}/members`, { studentId });
