// frontend/src/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3050/api",
  withCredentials: true,
});

// Auth
export const signupUser = (data) => API.post("/auth/signup", data);
export const loginUser = (data) => API.post("/auth/login", data);
export const forgotPassword = (data) => API.post("/auth/forgot-password", data);
export const getCurrentUser = () => API.get("/auth/check-auth");
export const updateProfile = (data) => API.put("/auth/update-profile", data);

// Projects
export const getAllProjects = () => API.get("/projects");
export const createProject = (data) => API.post("/projects", data);
export const deleteProject = (id) => API.delete(`/projects/${id}`);

export default API;
