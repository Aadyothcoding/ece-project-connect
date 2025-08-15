import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3050/api",
  withCredentials: true,
});

/* =======================
   AUTH ROUTES
========================= */
export const signupUser = (data) => API.post("/auth/signup", data);
export const loginUser = (data) => API.post("/auth/login", data);
export const forgotPassword = (data) => API.post("/auth/forgot-password", data);
export const getCurrentUser = () => API.get("/auth/check");
export const updateProfile = (data) => API.put("/auth/update-profile", data);
export const logoutUser = () => API.post("/auth/logout");

/* =======================
   PROJECT ROUTES
========================= */
export const getAllProjects = () => API.get("/projects");
export const createProject = (data) => API.post("/projects", data);
export const deleteProject = (id) => API.delete(`/projects/${id}`);
export const getTeacherProjects = () => API.get("/projects/my-projects");
export const updateProject = (id, data) => API.put(`/projects/${id}`, data);

/* =======================
   STUDENT & APPLICATION ROUTES
========================= */
export const getStudentProfile = (id) => API.get(`/student/${id}`);
export const updateStudentProfile = (id, data) => API.put(`/student/${id}`, data);

// For the student to apply (handles both individual and group)
export const applyToProject = (data) => API.post("/student/apply", data);

// For a group member to verify their application from an email link
export const verifyApplication = (applicationId, memberId, token) => 
  API.get(`/student/verify/${applicationId}/${memberId}/${token}`);

// For the teacher to view applicants for a specific project
export const getApplicationsForProject = (projectId) => API.get(`/student/${projectId}`);