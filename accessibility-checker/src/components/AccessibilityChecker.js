"use client";

import { useState } from "react";
import InputField from "@/components/InputField";
import SubmitButton from "@/components/SubmitButton";
import Report from "@/components/Report";
import LinkExtractor from "@/components/LinkExtractor"; // ✅ Import LinkExtractor

export default function AccessibilityChecker() {
  const [url, setUrl] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

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
    <div className="p-6">
      <div className="flex flex-col gap-4">
        <InputField url={url} setUrl={setUrl} />
        <SubmitButton onClick={checkAccessibility} loading={loading} />
      </div>

      {report && (
        <div className="mt-6">
          <Report report={report} />
          <div className="mt-6">
            <LinkExtractor links={report.links} /> {/* ✅ Display links */}
          </div>
        </div>
      )}
    </div>
  );
}
