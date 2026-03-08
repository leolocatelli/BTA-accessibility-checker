"use client";

import { Copy, CheckCircle, FileCode2 } from "lucide-react";
import { useState } from "react";

export default function SeoGeneratedHtml({ seoHtml }) {
  const [copied, setCopied] = useState(false);

  const copyHtml = async () => {
    if (!seoHtml) return;

    try {
      await navigator.clipboard.writeText(seoHtml);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  return (
    <div className="bg-gray-50 border rounded-xl p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileCode2 className="w-5 h-5 text-teal-700" />
          <h3 className="font-semibold text-gray-900 text-lg">
            Generated SEO Footer
          </h3>
        </div>

        <button
          onClick={copyHtml}
          disabled={!seoHtml}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-teal-600 text-teal-700 rounded-md hover:bg-teal-50 transition disabled:opacity-40"
        >
          {copied ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-600" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy HTML
            </>
          )}
        </button>
      </div>

      {/* HTML Preview */}
      <pre className="text-sm whitespace-pre-wrap break-words bg-white p-4 rounded-lg border overflow-auto min-h-[220px] leading-relaxed">
        {seoHtml || "Your SEO HTML will appear here."}
      </pre>
    </div>
  );
}