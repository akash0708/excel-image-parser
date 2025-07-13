"use client";
import React, { useRef, useState } from "react";

interface FileUploadZoneProps {
  file: File | null;
  loading: boolean;
  onFileSelect: (file: File) => void;
  onError: (error: string) => void;
}

export default function FileUploadZone({
  file,
  loading,
  onFileSelect,
  onError,
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (selectedFile: File) => {
    // Clear any previous errors
    onError("");

    // Validate file type
    if (!selectedFile.name.endsWith(".xlsx")) {
      onError("Please select a valid .xlsx file");
      return;
    }

    onFileSelect(selectedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const handleDropZoneClick = (e: React.MouseEvent) => {
    // Prevent the button's click from triggering if the hidden input was clicked
    if (e.target === inputRef.current) {
      return;
    }
    inputRef.current?.click();
  };

  const getDropZoneStyles = () => {
    if (isDragging) return "border-blue-500 bg-blue-50";
    if (file) return "border-green-500 bg-green-50";
    return "border-gray-300 hover:border-gray-400 bg-gray-50";
  };

  return (
    <button
      type="button"
      className={`
        relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 w-full
        ${getDropZoneStyles()}
        ${loading ? "pointer-events-none opacity-50" : ""}
      `}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleDropZoneClick}
      disabled={loading}
      aria-label="Upload Excel file by clicking or dragging and dropping"
      data-testid="file-upload-zone"
    >
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx"
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
        disabled={loading}
        tabIndex={-1}
        data-testid="file-input"
      />

      <div className="flex flex-col items-center space-y-2">
        {(() => {
          if (file) {
            return (
              <>
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  data-testid="success-icon"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div
                  className="text-sm font-medium text-green-700"
                  data-testid="file-name"
                >
                  {file.name}
                </div>
                <div className="text-xs text-green-600">
                  Click to change file
                </div>
              </>
            );
          }

          if (isDragging) {
            return (
              <>
                <svg
                  className="w-8 h-8 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  data-testid="dragging-icon"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <div
                  className="text-sm font-medium text-blue-700"
                  data-testid="drop-text"
                >
                  Drop your Excel file here
                </div>
              </>
            );
          }

          return (
            <>
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                data-testid="upload-icon"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <div
                className="text-sm font-medium text-gray-700"
                data-testid="upload-text"
              >
                Drag & drop your Excel file here
              </div>
              <div className="text-xs text-gray-500">
                or click to select (.xlsx files only)
              </div>
            </>
          );
        })()}
      </div>
    </button>
  );
}
