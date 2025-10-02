import axios from "axios";

// Directly set your API URL here
const api = axios.create({
  baseURL: "https://textile-defect-detection.onrender.com/", // Replace with your actual Render backend URL
});

// Attach token to every request if exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
