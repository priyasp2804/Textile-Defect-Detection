import { useState, useRef, useEffect } from "react";
import api from "../services/api";
import { CameraIcon, PhotoIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function UploadBox({ onReportGenerated }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const cameraInputRef = useRef();
  const galleryInputRef = useRef();

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) setFile(e.target.files[0]);
  };

  const handleDeleteSelected = () => {
    setFile(null);
    setPreviewUrl(null);
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select or capture an image first!");
    const formData = new FormData();
    formData.append("image", file);

    setLoading(true);
    try {
      const res = await api.post("/report/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const savedReport = res.data.report;
      onReportGenerated?.(savedReport);
      setFile(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Error uploading report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start">
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-lg shadow w-full max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800 dark:text-gray-200">
          Upload Fabric Image
        </h2>

        {/* Hidden inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => cameraInputRef.current.click()}
            className="w-full sm:w-40 flex flex-col items-center gap-2 p-4 border-2 border-dashed rounded hover:border-teal-500 dark:hover:bg-slate-700"
          >
            <CameraIcon className="h-7 w-7 text-teal-600" />
            <span className="text-gray-700 dark:text-gray-200">Camera</span>
          </button>
          <button
            onClick={() => galleryInputRef.current.click()}
            className="w-full sm:w-40 flex flex-col items-center gap-2 p-4 border-2 border-dashed rounded hover:border-teal-500 dark:hover:bg-slate-700"
          >
            <PhotoIcon className="h-7 w-7 text-teal-600" />
            <span className="text-gray-700 dark:text-gray-200">Gallery</span>
          </button>
          {file && (
            <button
              onClick={handleDeleteSelected}
              className="w-full sm:w-auto flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              <TrashIcon className="h-5 w-5" />
              Remove
            </button>
          )}
        </div>

        {/* Selected file preview */}
        {file && (
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:w-1/2">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="preview"
                  className="mt-3 w-full max-h-48 object-contain rounded border dark:border-gray-700"
                />
              )}
            </div>
            <button
              onClick={handleUpload}
              disabled={loading}
              className="bg-teal-600 text-white px-6 py-2 rounded hover:bg-teal-700 disabled:opacity-50"
            >
              {loading ? "Analyzing..." : "Upload & Analyze"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
