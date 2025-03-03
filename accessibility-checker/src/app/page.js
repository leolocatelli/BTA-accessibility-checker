"use client"; // Required for Next.js App Router

import React, { useState } from "react";
import InputField from "@/components/InputField";
import SubmitButton from "@/components/SubmitButton";
import Report from "@/components/Report";
import ImageAltGenerator from "@/components/ImageAltGenerator";

export default function Home() {
  const [url, setUrl] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("accessibility"); // Default to Accessibility Checker

  const checkAccessibility = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      setReport(data);
    } catch (error) {
      console.error("Error checking accessibility", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 mt-20 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      {/* <h1 className="text-3xl font-bold mb-6 text-center">🛠️ Accessibility Tools</h1> */}

      {/* 🔹 Tabs Navigation */}
      <div className="flex justify-center border-b">
        <button
          className={`py-2 px-6 text-lg font-semibold ${activeTab === "accessibility" ? "border-b-4 border-blue-500 text-blue-600" : "text-gray-500"}`}
          onClick={() => setActiveTab("accessibility")}
        >
          Accessibility Checker
        </button>
        <button
          className={`py-2 px-6 text-lg font-semibold ${activeTab === "image-alt" ? "border-b-4 border-blue-500 text-blue-600" : "text-gray-500"}`}
          onClick={() => setActiveTab("image-alt")}
        >
          Image ALT Generator
        </button>
      </div>

      {/* 🔹 Content for Each Tab */}
      <div className="mt-6">
        {activeTab === "accessibility" && (
          <div>
            {/* <h2 className="text-xl font-semibold text-center mb-4">🔍 Accessibility Checker</h2> */}
            <span className="mb-4"></span>
            <div className="flex flex-col gap-4 p-6 mt-10">
              <InputField url={url} setUrl={setUrl} />
              <SubmitButton onClick={checkAccessibility} loading={loading} />
            </div>
            {report && (
              <div className="mt-6">
                <Report report={report} />
              </div>
            )}
          </div>
        )}

        {activeTab === "image-alt" && (
          <div>
            {/* <h2 className="text-xl font-semibold text-center mb-4">🖼️ Image ALT Generator</h2> */}
            <ImageAltGenerator />
          </div>
        )}
      </div>
    </div>
  );
}
