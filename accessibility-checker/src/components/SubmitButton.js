import React from "react";

export default function SubmitButton({ onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? "Checking..." : "Check Accessibility"}
    </button>
  );
}
