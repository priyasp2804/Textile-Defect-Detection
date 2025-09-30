// src/components/Sidebar.jsx
import { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  EllipsisVerticalIcon,
  PencilSquareIcon,
  ArchiveBoxArrowDownIcon,
  TrashIcon,
  CheckIcon,
  FolderIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import api from "../services/api";

export default function Sidebar({ reports, setReports, onSelectReport }) {
  const [isOpen, setIsOpen] = useState(true); // desktop
  const [mobileOpen, setMobileOpen] = useState(false); // mobile
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  // Fetch reports on mount
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get("/report");
        setReports(res.data.reports || []);
      } catch (err) {
        console.error("Error fetching reports:", err);
      }
    };
    fetchReports();
  }, [setReports]);

  // Filter reports by defects/date
  const filteredReports = reports.filter((r) => {
    const defectNames =
      r.description?.details?.map((d) => d.title).join(", ") ||
      r.description?.summary ||
      "";
    const target = `${defectNames} ${r.created_at || ""}`;
    return target.toLowerCase().includes(search.toLowerCase());
  });

  // ===== Actions =====
  const handleRename = async (id) => {
    if (!editValue.trim()) return;
    try {
      const res = await api.patch(`/report/${id}`, { summary: editValue });
      setReports((prev) =>
        prev.map((r) => (r._id === id ? res.data.report : r))
      );
      setEditingId(null);
      setEditValue("");
      setMenuOpenId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to rename report");
    }
  };

  const handleArchive = async (id, archived) => {
    try {
      const res = await api.patch(`/report/${id}`, { archived });
      setReports((prev) =>
        prev.map((r) => (r._id === id ? res.data.report : r))
      );
      setMenuOpenId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update archive status");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this report permanently?")) return;
    try {
      await api.delete(`/report/${id}`);
      setReports((prev) => prev.filter((r) => r._id !== id));
      setMenuOpenId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete report");
    }
  };

  // ===== Report Item =====
  const renderReportItem = (report) => {
    const defectNames =
      report.description?.details?.map((d) => d.title).join(", ") ||
      report.description?.summary ||
      "Untitled Report";
    const isEditing = editingId === report._id;

    return (
      <li
        key={report._id}
        className="flex items-center justify-between p-2 bg-gray-100 dark:bg-slate-800 rounded-lg relative cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-700"
        onClick={() => {
          onSelectReport(report);
          setMobileOpen(false);
        }}
      >
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename(report._id);
                if (e.key === "Escape") {
                  setEditingId(null);
                  setMenuOpenId(null);
                }
              }}
              autoFocus
              className="w-full px-2 py-1 text-sm border rounded dark:bg-slate-700 dark:text-gray-200"
            />
          ) : (
            <>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                {defectNames}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {report.created_at
                  ? new Date(report.created_at).toLocaleString()
                  : ""}
              </p>
            </>
          )}
        </div>

        {/* Three dots */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpenId((prev) => (prev === report._id ? null : report._id));
            if (menuOpenId !== report._id) setEditingId(null);
          }}
          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700"
        >
          <EllipsisVerticalIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>

        {/* Dropdown menu */}
        {menuOpenId === report._id && (
          <div
            className="absolute right-2 top-10 bg-white dark:bg-slate-900 shadow-lg rounded p-2 w-40 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            {isEditing ? (
              <button
                onClick={() => handleRename(report._id)}
                className="flex items-center gap-2 w-full px-2 py-1 text-sm 
                  text-green-700 dark:text-green-400 
                  hover:bg-green-50 dark:hover:bg-green-900 rounded"
              >
                <CheckIcon className="h-4 w-4" />
                Save
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setEditingId(report._id);
                    setEditValue(defectNames);
                  }}
                  className="flex items-center gap-2 w-full px-2 py-1 text-sm 
                    text-blue-700 dark:text-blue-400 
                    hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
                >
                  <PencilSquareIcon className="h-4 w-4" />
                  Rename
                </button>

                {!report.archived ? (
                  <button
                    onClick={() => handleArchive(report._id, true)}
                    className="flex items-center gap-2 w-full px-2 py-1 text-sm 
                      text-yellow-700 dark:text-yellow-400 
                      hover:bg-yellow-50 dark:hover:bg-yellow-900 rounded"
                  >
                    <ArchiveBoxArrowDownIcon className="h-4 w-4" />
                    Archive
                  </button>
                ) : (
                  <button
                    onClick={() => handleArchive(report._id, false)}
                    className="flex items-center gap-2 w-full px-2 py-1 text-sm 
                      text-green-700 dark:text-green-400 
                      hover:bg-green-50 dark:hover:bg-green-900 rounded"
                  >
                    <FolderIcon className="h-4 w-4" />
                    Unarchive
                  </button>
                )}

                <button
                  onClick={() => handleDelete(report._id)}
                  className="flex items-center gap-2 w-full px-2 py-1 text-sm 
                    text-red-700 dark:text-red-400 
                    hover:bg-red-50 dark:hover:bg-red-900 rounded"
                >
                  <TrashIcon className="h-4 w-4" />
                  Delete
                </button>
              </>
            )}
          </div>
        )}
      </li>
    );
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-[70px] left-2 z-40 bg-teal-600 text-white p-2 rounded shadow"
      >
        <ChevronDoubleRightIcon className="h-5 w-5" />
      </button>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="flex-1 bg-black bg-opacity-50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="w-72 bg-white dark:bg-slate-800 shadow-lg h-full p-4 flex flex-col">
            <button
              onClick={() => setMobileOpen(false)}
              className="self-end p-2"
            >
              <XMarkIcon className="h-6 w-6 text-gray-700 dark:text-gray-200" />
            </button>

            <div className="mt-4 flex-1 flex flex-col overflow-y-auto">
              <div className="relative mb-4">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-2 top-2.5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border rounded-lg bg-white dark:bg-slate-800 dark:text-gray-200"
                />
              </div>

              <button
                onClick={() => setShowArchived(!showArchived)}
                className="mb-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                {showArchived ? "Show Active Reports" : "Show Archived Reports"}
              </button>

              <ul className="space-y-2">
                {filteredReports
                  .filter((r) => (showArchived ? r.archived : !r.archived))
                  .map((report) => renderReportItem(report))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div
        className={`hidden md:flex flex-col bg-white dark:bg-slate-800 shadow-lg transition-all duration-300
          ${isOpen ? "w-64" : "w-16"} h-[calc(100vh-64px)] fixed top-[64px] left-0`}
      >
        <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-slate-700">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-slate-700"
          >
            {isOpen ? (
              <ChevronDoubleLeftIcon className="h-5 w-5 text-gray-700 dark:text-gray-200" />
            ) : (
              <ChevronDoubleRightIcon className="h-5 w-5 text-gray-700 dark:text-gray-200" />
            )}
          </button>
        </div>

        {isOpen && (
          <div className="flex-1 flex flex-col overflow-y-auto px-3">
            <div className="relative mb-4">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-2 top-2.5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search reports..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border rounded-lg bg-white dark:bg-slate-800 dark:text-gray-200"
              />
            </div>

            <button
              onClick={() => setShowArchived(!showArchived)}
              className="mb-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              {showArchived ? "Show Active Reports" : "Show Archived Reports"}
            </button>

            <ul className="flex-1 space-y-2">
              {filteredReports
                .filter((r) => (showArchived ? r.archived : !r.archived))
                .map((report) => renderReportItem(report))}
              {filteredReports.filter((r) =>
                showArchived ? r.archived : !r.archived
              ).length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No reports found.
                </p>
              )}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
