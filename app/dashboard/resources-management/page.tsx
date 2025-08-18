"use client";
import React, { useState, useRef } from "react";
import { Upload, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Toaster, toast } from "react-hot-toast";

const ResourceManagement: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setPdfFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handlePdfUpload = async () => {
    if (!pdfFile) {
      toast.error("Please select a PDF file to upload.");
      return;
    }
    if (!pdfFile.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Only PDF files are allowed.");
      return;
    }
    if (pdfFile.size > 10 * 1024 * 1024) {
      toast.error("File size too large (max 10MB).");
      return;
    }
    setUploading(true);
    const toastId = toast.loading("Uploading PDF...");
    try {
      const formData = new FormData();
      formData.append("file", pdfFile);

      const res = await fetch("https://rafikeybot.onrender.com/pdf/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Upload failed");
      }
      const data = await res.json();
      toast.success(`Success: ${data.message} (Chunks: ${data.chunks_processed})`, { id: toastId });
      setPdfFile(null);
    } catch (err: unknown) {
      let message = "Upload failed";
      if (err && typeof err === "object" && "message" in err && typeof (err as { message?: unknown }).message === "string") {
        message = (err as { message: string }).message;
      }
      toast.error(message, { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const toggleTheme = () => setIsDarkMode((prev) => !prev);
  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${
        isDarkMode
          ? "bg-gray-900"
          : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
      }`}
    >
      <Toaster position="top-center" />
      <Sidebar
        isDarkMode={isDarkMode}
        isSidebarCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
      />

      <div
        className={`transition-all duration-300 ${
          isSidebarCollapsed ? "ml-0 sm:ml-16" : "ml-0 sm:ml-64"
        }`}
      >
        <Header
          isDarkMode={isDarkMode}
          isSidebarCollapsed={isSidebarCollapsed}
          toggleTheme={toggleTheme}
          toggleSidebar={toggleSidebar}
        />

        <main className="p-4 sm:p-6 md:p-8 flex flex-col items-center">
          <h1
            className={`text-3xl font-bold mb-8 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            PDF Upload
          </h1>
          <div className="w-full max-w-lg mx-auto">
            <div
              className={`mb-8 text-center transition-colors ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              <p className="text-base sm:text-lg font-medium">
                Upload a PDF document to process and store it in the system.
              </p>
              <p className="text-sm mt-2">
                <span className="font-semibold">Instructions:</span> Drag and drop your PDF file below, or click the area to select a file from your device.<br />
                <span className="font-semibold">Requirements:</span> PDF format only, maximum size 10MB.
              </p>
            </div>
            <div
              className={`relative backdrop-blur-md rounded-3xl p-10 h-fit shadow-2xl border transition-all duration-300 ${
                isDarkMode
                  ? "bg-gray-800/60 border-gray-700/50"
                  : "bg-white/90 border-black/10"
              }`}
            >
              <label
                htmlFor="pdf-upload"
                className={`flex flex-col items-center justify-center w-full h-48 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 outline-none
                  ${
                    dragActive
                      ? isDarkMode
                        ? "border-purple-500 bg-purple-900/20 scale-105"
                        : "border-purple-500 bg-purple-100 scale-105"
                      : isDarkMode
                      ? "border-gray-600 bg-gray-700/30 hover:bg-gray-700/50"
                      : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                  }
                `}
                tabIndex={0}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => inputRef.current?.focus()}
              >
                <Upload
                  className={`w-12 h-12 mb-2 transition-transform duration-300 ${
                    dragActive ? "scale-125 text-purple-500" : isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                />
                <span
                  className={`text-base font-medium transition-colors ${
                    dragActive
                      ? "text-purple-500"
                      : isDarkMode
                      ? "text-gray-300"
                      : "text-gray-700"
                  }`}
                >
                  {dragActive ? "Drop your PDF here" : "Drag & drop or click to select a PDF"}
                </span>
                <input
                  id="pdf-upload"
                  ref={inputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handlePdfChange}
                />
              </label>
              <div className="mt-4 flex flex-col items-center">
                {pdfFile && (
                  <div
                    className={`mb-2 text-xs px-3 py-1 rounded-full transition-all ${
                      isDarkMode ? "bg-gray-700 text-gray-200" : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    Selected: {pdfFile.name}
                  </div>
                )}
                <button
                  onClick={handlePdfUpload}
                  disabled={uploading || !pdfFile}
                  className={`relative mt-2 px-6 py-3 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center
                    ${
                      uploading || !pdfFile
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:scale-105 hover:shadow-2xl"
                    }
                  `}
                  style={{ minWidth: 140 }}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Upload PDF"
                  )}
                </button>
              </div>
            </div>
          </div>
          <style jsx global>{`
            @keyframes fade-in {
              from { opacity: 0; transform: translateY(10px);}
              to { opacity: 1; transform: translateY(0);}
            }
            .animate-fade-in {
              animation: fade-in 0.5s;
            }
          `}</style>
        </main>
      </div>
    </div>
  );
};

export default ResourceManagement;