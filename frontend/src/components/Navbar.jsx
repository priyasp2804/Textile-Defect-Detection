// src/components/Navbar.jsx
import { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { logout } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { MoonIcon, SunIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export default function Navbar() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // Dark mode toggle
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Mobile menu state
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate("/login");
  };

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <nav className="fixed top-0 left-0 w-full flex items-center justify-between px-6 py-3 bg-white dark:bg-slate-800 shadow-md z-50">
      {/* Left - Logo */}
      <h1 className="text-2xl font-bold text-teal-600 dark:text-teal-400">
        TextileGuard 🧵
      </h1>

      {/* Right - Desktop */}
      <div className="hidden md:flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center">
              {user.name ? user.name[0].toUpperCase() : "U"}
            </div>
            <span className="text-gray-700 dark:text-gray-200">
              {user.name || user.email}
            </span>
          </div>
        )}

        {/* Dark/Light toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          {darkMode ? (
            <SunIcon className="h-5 w-5 text-yellow-400" />
          ) : (
            <MoonIcon className="h-5 w-5 text-gray-700 dark:text-gray-200" />
          )}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Mobile - Hamburger */}
      <div className="md:hidden">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          {menuOpen ? (
            <XMarkIcon className="h-6 w-6 text-gray-700 dark:text-gray-200" />
          ) : (
            <Bars3Icon className="h-6 w-6 text-gray-700 dark:text-gray-200" />
          )}
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div
          ref={menuRef}
          className="absolute top-full right-4 mt-2 w-48 bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 flex flex-col gap-3 z-50"
        >
          {user && (
            <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
              <div className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center">
                {user.name ? user.name[0].toUpperCase() : "U"}
              </div>
              <span className="text-gray-700 dark:text-gray-200 text-sm truncate">
                {user.name || user.email}
              </span>
            </div>
          )}

          {/* Dark/Light toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="flex items-center gap-2 p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            {darkMode ? (
              <SunIcon className="h-5 w-5 text-yellow-400" />
            ) : (
              <MoonIcon className="h-5 w-5 text-gray-700 dark:text-gray-200" />
            )}
            <span className="text-sm text-gray-700 dark:text-gray-200">
              {darkMode ? "Light Mode" : "Dark Mode"}
            </span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
