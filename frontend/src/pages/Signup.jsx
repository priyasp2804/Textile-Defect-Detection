// src/pages/Signup.jsx
import { useState } from "react";
import { signup } from "../services/authService";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(form);
      alert("Signup successful! Please login.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.detail || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center 
      bg-gradient-to-br from-gray-100 to-white 
      dark:from-slate-800 dark:to-black transition-colors">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-96"
      >
        {/* Project name */}
        <h1 className="text-3xl font-extrabold mb-6 text-center text-teal-600 dark:text-teal-400">
          TextileGuard 🧵
        </h1>

        <h2 className="text-xl font-semibold mb-6 text-center text-gray-900 dark:text-gray-100">
          Sign Up
        </h2>

        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full mb-3 p-3 border rounded-lg focus:ring-2 focus:ring-teal-500"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full mb-3 p-3 border rounded-lg focus:ring-2 focus:ring-teal-500"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full mb-3 p-3 border rounded-lg focus:ring-2 focus:ring-teal-500"
        />
        <input
          type="password"
          name="confirm_password"
          placeholder="Confirm Password"
          value={form.confirm_password}
          onChange={handleChange}
          required
          className="w-full mb-4 p-3 border rounded-lg focus:ring-2 focus:ring-teal-500"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-600 text-white py-2 rounded-lg font-semibold 
            hover:bg-teal-700 hover:shadow-lg transition-all"
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>

        {/* 👇 Login link under the form */}
        <p className="mt-4 text-center text-gray-700 dark:text-gray-300">
          Already have an account?{" "}
          <Link to="/login" className="text-teal-600 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
