"use client";
import React from "react";

export default function Footer() {
  return (
    <div
      data-testid="app-footer"
      className="text-xs text-gray-500 mt-2 text-center"
    >
      Upload an Excel (.xlsx) file with images in cells or embedded. Images will
      be extracted, compressed, and returned as a ZIP.
    </div>
  );
}
