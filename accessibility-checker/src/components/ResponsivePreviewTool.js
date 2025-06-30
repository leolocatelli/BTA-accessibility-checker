"use client";
import { useState, useEffect } from "react";
import {
  Smartphone,
  TabletSmartphone,
  Monitor,
  MonitorSmartphone,
} from "lucide-react";

export default function ResponsivePreviewTool({ initialUrl = "" }) {
  const [url, setUrl] = useState(initialUrl);
  const [previewUrl, setPreviewUrl] = useState(initialUrl);

  useEffect(() => {
    if (initialUrl) {
      setUrl(initialUrl);
      setPreviewUrl(initialUrl);
    }
  }, [initialUrl]);

  const handlePreview = () => {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      alert("Please enter a valid URL starting with http:// or https://");
      return;
    }
    setPreviewUrl(url);
  };

  return (
    <div className="p-6 mt-16 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      {/* 🔹 Title with icon */}

      {/* 🔹 URL Input */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Enter URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-grow px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handlePreview}
          className="px-6 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition"
        >
          Check Preview
        </button>
      </div>

      {/* 🔹 Preview Windows */}
      {previewUrl && (
        <div className="space-y-12">
          {/* Mobile */}
          <div className="text-center">
            <div className="flex justify-center items-center gap-2 mb-2 text-gray-700">
              <Smartphone className="w-5 h-5" />
              <h3 className="font-medium">Mobile (375px)</h3>
            </div>
            <div className="border rounded-xl overflow-hidden shadow-inner mx-auto w-[375px] h-[667px]">
              <iframe
                src={previewUrl}
                title="Mobile Preview"
                className="w-full h-full"
                sandbox=""
              />
            </div>
          </div>

          {/* Tablet */}
          <div className="text-center">
            <div className="flex justify-center items-center gap-2 mb-2 text-gray-700">
              <TabletSmartphone className="w-5 h-5" />
              <h3 className="font-medium">Tablet (768px)</h3>
            </div>
            <div className="border rounded-xl overflow-hidden shadow-inner mx-auto w-[768px] h-[1024px]">
              <iframe
                src={previewUrl}
                title="Tablet Preview"
                className="w-full h-full"
                sandbox=""
              />
            </div>
          </div>

          {/* Desktop */}
          <div className="text-center">
            <div className="flex justify-center items-center gap-2 mb-2 text-gray-700">
              <Monitor className="w-5 h-5" />
              <h3 className="font-medium">Desktop (1280px)</h3>
            </div>
            <div className="border rounded-xl overflow-hidden shadow-inner mx-auto w-[1280px] h-[800px]">
              <iframe
                src={previewUrl}
                title="Desktop Preview"
                className="w-full h-full"
                sandbox=""
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
