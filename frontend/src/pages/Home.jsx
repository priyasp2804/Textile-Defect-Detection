import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import UploadBox from "../components/UploadBox";
import { useState } from "react";
import api from "../services/api";

export default function Home() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);

  const handleNewReport = (report) => {
    setReports((prev) => [report, ...prev]);
    setSelectedReport(report);
  };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar
          reports={reports}
          setReports={setReports}
          onSelectReport={setSelectedReport}
        />

        <main className="flex-1 mt-[64px] flex justify-center px-3 sm:px-6">
          <div className="w-full max-w-3xl py-6 mx-auto">
            <UploadBox onReportGenerated={handleNewReport} />

            {selectedReport ? (
              <div className="mt-6 p-4 bg-white dark:bg-slate-800 rounded-lg shadow text-left">
                <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-200">
                  {selectedReport.description?.summary ||
                    "Fabric Analysis Report"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  {new Date(selectedReport.created_at).toLocaleDateString()}
                </p>

                {selectedReport.image_url && (
                  <img
                    src={selectedReport.image_url}
                    alt="Report Preview"
                    className="mb-4 w-full max-h-80 object-contain rounded border dark:border-gray-700"
                  />
                )}

                <p className="text-gray-800 dark:text-gray-300 mb-3">
                  <b>Severity:</b>{" "}
                  {selectedReport.description?.overall_severity}
                </p>

                <ul className="mt-3 space-y-2">
                  {selectedReport.description?.details?.map((d, idx) => (
                    <li
                      key={idx}
                      className="border-b border-gray-200 dark:border-gray-700 pb-2"
                    >
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {d.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {d.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Recommendation: {d.recommendation}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="mt-6 text-center text-gray-500 dark:text-gray-400">
                Select a report from the sidebar or upload a new one to see
                details here.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
