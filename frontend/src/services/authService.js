// src/services/authService.js
import api from "./api";

export const signup = async (data) => {
  const res = await api.post("/auth/signup", data);
  return res.data;
};

export const login = async (data) => {
  const res = await api.post("/auth/login", data);
  if (res.data.access_token) {
    localStorage.setItem("token", res.data.access_token);
  }
  return res.data;
};

export const getProfile = async () => {
  const res = await api.get("/auth/profile");
  return res.data.profile;
};

export const updateProfile = async (data) => {
  const res = await api.put("/auth/profile", data);
  return res.data;
};

export const logout = () => {
  localStorage.removeItem("token");
};
