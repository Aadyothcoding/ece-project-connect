// frontend/src/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3050/api",
  withCredentials: true,
});

/* =======================
   AUTH ROUTES (/api/auth)
========================= */
export const signupUser = (data) => API.post("/auth/signup", data);
export const loginUser = (data) => API.post("/auth/login", data);
export const forgotPassword = (data) => API.post("/auth/forgot-password", data);
export const getCurrentUser = () => API.get("/auth/check-auth");
export const updateProfile = (data) => API.put("/auth/update-profile", data);

/* =======================
   PROJECT ROUTES (/api/projects)
========================= */
export const getAllProjects = () => API.get("/projects");
export const createProject = (data) => API.post("/projects", data);
export const deleteProject = (id) => API.delete(`/projects/${id}`);
export const getTeacherProjects = () => API.get("/projects/my-projects");

/* =======================
   STUDENT ROUTES (/api/student)
========================= */
export const getStudentProfile = (id) => API.get(`/student/${id}`);
export const updateStudentProfile = (id, data) =>
  API.put(`/student/${id}`, data);

// For the student to apply
export const applyToProject = (data) => API.post("/student/apply", data);
// For the teacher to view applicants for a specific project
export const getApplicationsForProject = (projectId) => API.get(`/student/${projectId}`);