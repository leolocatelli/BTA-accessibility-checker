import React from "react";

export default function SubmitButton({ onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="mt-4 w-full px-4 py-3 text-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition flex items-center justify-center"
    >
      {loading ? "Checking..." : "Check Accessibility"}
    </button>
  );
}
