"use client";
import React, { useState, useRef } from "react";
import { Upload } from "lucide-react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Toaster, toast } from "react-hot-toast";

const ResourceManagement: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  // 📂 Handle file selection
  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
    }
  };

  // 📥 Drag and Drop logic
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

  // 🚀 Handle upload logic
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
    setProgress(0);
    const toastId = toast.loading("Uploading PDF...");

    try {
      const formData = new FormData();
      formData.append("file", pdfFile);

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "https://rafikeybot.onrender.com/pdf/upload", true);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setProgress(percent);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            let data;
            try {
              data = JSON.parse(xhr.responseText);
            } catch {
              data = { message: "Upload complete", chunks_processed: "?" };
            }
            toast.success(
              `Success: ${data.message} (Chunks: ${data.chunks_processed})`,
              { id: toastId }
            );
            setPdfFile(null);
            resolve();
          } else {
            let errMsg = "Upload failed";
            try {
              const err = JSON.parse(xhr.responseText);
              errMsg = err.detail || errMsg;
            } catch {}
            reject(new Error(errMsg));
          }
        };

        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(formData);
      });
    } catch (err: unknown) {
      let message = "Upload failed";
      if (
        err &&
        typeof err === "object" &&
        "message" in err &&
        typeof (err as { message?: unknown }).message === "string"
      ) {
        message = (err as { message: string }).message;
      }
      toast.error(message, { id: toastId });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  // 🌗 Theme & Sidebar
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
            {/* 📝 Instructions */}
            <div
              className={`mb-8 text-center transition-colors ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              <p className="text-base sm:text-lg font-medium">
                Upload a PDF document to process and store it in the system.
              </p>
              <p className="text-sm mt-2">
                <span className="font-semibold">Instructions:</span> Drag and
                drop your PDF file below, or click the area to select a file
                from your device.
                <br />
                <span className="font-semibold">Requirements:</span> PDF format
                only, maximum size 10MB.
              </p>
            </div>

            {/* 📤 Upload Section */}
            <div
              className={`relative backdrop-blur-md rounded-3xl p-10 shadow-2xl border transition-all duration-300 ${
                isDarkMode
                  ? "bg-gray-800/60 border-gray-700/50"
                  : "bg-white/90 border-black/10"
              }`}
            >
              <label
                htmlFor="pdf-upload"
                className={`flex flex-col items-center justify-center w-full h-48 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 outline-none ${
                  dragActive
                    ? isDarkMode
                      ? "border-purple-500 bg-purple-900/20 scale-105"
                      : "border-purple-500 bg-purple-100 scale-105"
                    : isDarkMode
                    ? "border-gray-600 bg-gray-700/30 hover:bg-gray-700/50"
                    : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                }`}
                tabIndex={0}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => inputRef.current?.focus()}
              >
                <Upload
                  className={`w-12 h-12 mb-2 transition-transform duration-300 ${
                    dragActive
                      ? "scale-125 text-purple-500"
                      : isDarkMode
                      ? "text-gray-400"
                      : "text-gray-500"
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
                  {dragActive
                    ? "Drop your PDF here"
                    : "Drag & drop or click to select a PDF"}
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

              {/* 📦 Upload Info */}
              <div className="mt-4 flex flex-col items-center">
                {pdfFile && (
                  <div
                    className={`mb-2 text-xs px-3 py-1 rounded-full transition-all ${
                      isDarkMode
                        ? "bg-gray-700 text-gray-200"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    Selected: {pdfFile.name}
                  </div>
                )}

                {uploading && (
                  <div className="w-full flex flex-col items-center mb-2">
                    <div className="w-64 h-3 bg-gray-300 rounded-full overflow-hidden mb-1">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-200"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        isDarkMode ? "text-gray-200" : "text-gray-700"
                      }`}
                    >
                      {progress}%
                    </span>
                  </div>
                )}

                {/* 🧠 Processing feedback */}
                {uploading && progress === 100 && (
                  <div className="w-full flex flex-col items-center mb-2 animate-fade-in">
                    <span
                      className={`text-sm font-semibold ${
                        isDarkMode ? "text-purple-300" : "text-purple-700"
                      }`}
                    >
                      Processing & Training in Progress...
                    </span>
                    <span
                      className={`text-xs ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      This usually takes ~2–3 minutes.
                    </span>
                  </div>
                )}

                {/* ✅ Confirmation */}
                {!uploading && progress === 100 && (
                  <div className="w-full flex flex-col items-center mb-2 animate-fade-in">
                    <span
                      className={`text-sm font-semibold ${
                        isDarkMode ? "text-green-300" : "text-green-700"
                      }`}
                    >
                      Content successfully uploaded. Bot has been retrained with
                      ‘Types of HIV tests and their effectiveness’.
                    </span>
                    <span
                      className={`text-xs ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Version: v2.0 &nbsp;|&nbsp; Uploaded:{" "}
                      {new Date().toLocaleString()}
                    </span>
                  </div>
                )}

                {/* 🕓 Upload History */}
                {!uploading && (
                  <div className="w-full mt-4">
                    <h2
                      className={`text-base font-semibold mb-2 ${
                        isDarkMode ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      Upload History
                    </h2>
                    <ul className="text-xs">
                      <li>
                        <span className="font-bold">2025-10-07 09:00</span> —
                        Types of HIV tests and their effectiveness
                        <span className="ml-2 px-2 py-0.5 rounded bg-green-200 text-green-800 text-[10px]">
                          Active
                        </span>
                        <button className="ml-2 text-blue-500 underline text-[10px]">
                          Rollback
                        </button>
                      </li>
                      <li>
                        <span className="font-bold">2025-09-30 14:30</span> —
                        HIV/AIDS Awareness Brochure
                        <span className="ml-2 px-2 py-0.5 rounded bg-gray-200 text-gray-800 text-[10px]">
                          Archived
                        </span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* 📤 Upload button */}
              <div className="flex justify-center mt-6">
                <button
                  onClick={handlePdfUpload}
                  disabled={!pdfFile || uploading}
                  className={`px-6 py-2 rounded-xl font-semibold transition-all duration-300 ${
                    uploading
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-purple-600 hover:bg-purple-700 text-white"
                  }`}
                >
                  {uploading ? "Uploading..." : "Upload PDF"}
                </button>
              </div>
            </div>
          </div>

          {/* 🔄 Animation */}
          <style jsx global>{`
            @keyframes fade-in {
              from {
                opacity: 0;
                transform: translateY(10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
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
