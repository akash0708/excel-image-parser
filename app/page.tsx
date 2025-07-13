"use client";
import React, { useState, useEffect } from "react";
import FileUploadZone from "../components/FileUploadZone";
import ImagePreviewGrid from "../components/ImagePreviewGrid";
import ActionButtons from "../components/ActionButtons";
import ErrorMessage from "../components/ErrorMessage";
import Footer from "../components/Footer";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreviews, setImagePreviews] = useState<
    { name: string; preview: string }[] | null
  >(null);
  const [editedNames, setEditedNames] = useState<Record<string, string>>({});
  const [downloadReady, setDownloadReady] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setImagePreviews(null);
    setDownloadReady(false);
  };

  const handleFileError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handlePreview = async () => {
    setError(null);
    setImagePreviews(null);
    setDownloadReady(false);
    if (!file) {
      setError("Please select an .xlsx file.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/process?preview=1", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        let errorMsg = "Failed to process file";
        try {
          const data = await response.json();
          errorMsg = data.error || errorMsg;
        } catch {}
        setError(errorMsg);
        return;
      }
      const data = await response.json();
      setImagePreviews(data.images || []);
      setDownloadReady(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "An error occurred");
      } else {
        setError("An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (originalName: string, newName: string) => {
    setEditedNames((prev) => ({ ...prev, [originalName]: newName }));
  };

  const handleDownload = async () => {
    if (!isClient) return;

    setError(null);
    setLoading(true);
    try {
      const formData = new FormData();
      if (file) formData.append("file", file);
      if (imagePreviews) {
        const mapping: Record<string, string> = {};
        imagePreviews.forEach((img) => {
          const newName = editedNames[img.name]?.trim();
          if (newName && newName !== img.name) {
            mapping[img.name] = newName;
          }
        });
        formData.append("nameMapping", JSON.stringify(mapping));
      }
      const response = await fetch("/api/process", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        let errorMsg = "Failed to process file";
        try {
          const data = await response.json();
          errorMsg = data.error || errorMsg;
        } catch {}
        setError(errorMsg);
        return;
      }
      const blob = await response.blob();

      // Only use browser APIs on client side
      if (typeof window !== "undefined") {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "images.zip";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }

      setFile(null);
      setImagePreviews(null);
      setEditedNames({});
      setDownloadReady(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "An error occurred");
      } else {
        setError("An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f7f8fa] p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 flex flex-col gap-6 border border-gray-200">
        <h1 className="text-2xl font-extrabold text-gray-900 text-center mb-2 tracking-tight">
          Excel Image Extractor
        </h1>

        <FileUploadZone
          file={file}
          loading={loading}
          onFileSelect={handleFileSelect}
          onError={handleFileError}
        />
        <ActionButtons
          file={file}
          loading={loading}
          onPreview={handlePreview}
        />
        <ImagePreviewGrid
          images={imagePreviews}
          editedNames={editedNames}
          loading={loading}
          downloadReady={downloadReady}
          isClient={isClient}
          onNameChange={handleNameChange}
          onDownload={handleDownload}
        />
        <ErrorMessage error={error} />
        <Footer />
      </div>
    </div>
  );
}
