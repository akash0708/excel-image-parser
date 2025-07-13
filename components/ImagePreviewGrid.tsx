"use client";
import React from "react";

interface ImagePreview {
  name: string;
  preview: string;
}

interface ImagePreviewGridProps {
  images: ImagePreview[] | null;
  editedNames: Record<string, string>;
  loading: boolean;
  downloadReady: boolean;
  isClient: boolean;
  onNameChange: (originalName: string, newName: string) => void;
  onDownload: () => void;
}

export default function ImagePreviewGrid({
  images,
  editedNames,
  loading,
  downloadReady,
  isClient,
  onNameChange,
  onDownload,
}: ImagePreviewGridProps) {
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div
      className="bg-gray-50 border border-gray-300 rounded-lg p-4 mt-2"
      data-testid="image-preview-grid"
    >
      <div className="font-semibold mb-2 text-center text-gray-800">
        Images to be extracted:
      </div>
      <div
        className="grid grid-cols-3 gap-4 max-h-60 overflow-y-auto"
        data-testid="images-grid"
      >
        {images.map((img) => (
          <div
            key={img.name}
            className="flex flex-col items-center text-center"
            data-testid={`image-item-${img.name}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.preview}
              alt={img.name}
              className="w-16 h-16 object-contain rounded border border-gray-200 bg-white mb-1 shadow-sm"
              data-testid={`image-preview-${img.name}`}
            />
            <input
              type="text"
              value={editedNames[img.name] ?? img.name}
              onChange={(e) => onNameChange(img.name, e.target.value)}
              className="text-xs text-gray-700 break-all max-w-[4.5rem] text-center border border-gray-300 rounded px-1 py-0.5 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={loading}
              data-testid={`name-input-${img.name}`}
              placeholder="Enter filename"
            />
          </div>
        ))}
      </div>
      <button
        className="mt-4 w-full bg-green-600 text-white text-base font-semibold px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 shadow"
        disabled={!downloadReady || loading || !isClient}
        onClick={onDownload}
        data-testid="download-button"
      >
        {loading ? "Downloading..." : "Download ZIP"}
      </button>
    </div>
  );
}
