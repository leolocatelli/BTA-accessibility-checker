"use client";

import { useState } from "react";

export default function LinkExtractor({ links }) {
  const [checkedLinks, setCheckedLinks] = useState({});

  if (!links || links.length === 0) return null;

  const toggleCheck = (href) => {
    setCheckedLinks((prev) => ({
      ...prev,
      [href]: !prev[href],
    }));
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold">🔗 Extracted Links</h3>
      <ul className="mt-2 space-y-3">
        {links.map((link, index) => (
          <li key={index} className="flex items-center justify-between bg-gray-100 p-3 rounded-lg shadow">
            <div>
              <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {link.text}
              </a>
              <span className="text-gray-500 text-sm block">{link.href}</span>
            </div>
            <button
              className={`px-3 py-1 rounded ${checkedLinks[link.href] ? "bg-green-400" : "bg-yellow-400"} text-white`}
              onClick={() => toggleCheck(link.href)}
            >
              {checkedLinks[link.href] ? "✔ Checked" : "Mark OK"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
