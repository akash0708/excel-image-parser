"use client";
import React from "react";

interface ActionButtonsProps {
  file: File | null;
  loading: boolean;
  onPreview: () => void;
}

export default function ActionButtons({
  file,
  loading,
  onPreview,
}: ActionButtonsProps) {
  return (
    <button
      type="button"
      data-testid="preview-button"
      className="bg-blue-600 text-white text-base font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 w-full shadow"
      disabled={loading || !file}
      onClick={onPreview}
    >
      {loading ? "Processing..." : "Preview Images"}
    </button>
  );
}
