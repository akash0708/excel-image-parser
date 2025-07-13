"use client";
import React from "react";

interface ErrorMessageProps {
  error: string | null;
}

export default function ErrorMessage({ error }: ErrorMessageProps) {
  if (!error || error.trim() === "") {
    return null;
  }

  return (
    <div
      data-testid="error-message"
      className="text-red-600 text-sm text-center font-semibold mt-2"
    >
      {error}
    </div>
  );
}
