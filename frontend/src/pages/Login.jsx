// src/pages/Login.jsx
import { useState, useContext } from "react";
import { login, getProfile } from "../services/authService";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
      const profile = await getProfile();
      setUser(profile);
      alert("Login successful!");
      navigate("/home");
    } catch (err) {
      alert(err.response?.data?.detail || "Login failed");
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
          Login
        </h2>

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
          className="w-full mb-4 p-3 border rounded-lg focus:ring-2 focus:ring-teal-500"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-600 text-white py-2 rounded-lg font-semibold 
            hover:bg-teal-700 hover:shadow-lg transition-all"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* 👇 Signup link under the form */}
        <p className="mt-4 text-center text-gray-700 dark:text-gray-300">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-teal-600 hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
