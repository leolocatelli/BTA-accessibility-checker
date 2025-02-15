import React from "react";

export default function Report({ report }) {
  if (!report) return null;

  return (
    <div className="mt-4 p-4 bg-gray-100 rounded-lg">
      <h2 className="text-lg font-semibold">Report</h2>
      <pre className="text-sm text-gray-950">{JSON.stringify(report, null, 2)}</pre>
    </div>
  );
}
