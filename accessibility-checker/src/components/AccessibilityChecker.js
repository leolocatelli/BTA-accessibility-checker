
"use client"; // ✅ Mark as a client component
import { useState } from "react";
import { useReport } from "@/context/ReportContext"; // ✅ Import useReport hook
import InputField from "@/components/InputField";
import SubmitButton from "@/components/SubmitButton";
import Report from "@/components/Report";
import { Loader2 } from "lucide-react";

export default function AccessibilityChecker() {
  const { report, setReport, loading, setLoading } = useReport(); // ✅ Use global state
  const [url, setUrl] = useState("");

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
    <div className="relative">
      {/* Full-Screen Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 animate-spin text-white" />
            <p className="mt-3 text-white font-semibold">Checking accessibility...</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 p-6">
        <InputField url={url} setUrl={setUrl} />
        <SubmitButton onClick={checkAccessibility} loading={loading} />
      </div>

      {report && (
        <div className="mt-6">
          <Report report={report} />
        </div>
      )}
    </div>
  );
}
