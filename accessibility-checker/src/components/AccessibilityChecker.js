"use client";
import { useState } from "react";
import { useReport } from "../context/ReportContext";
import InputField from "../components/InputField";
import SubmitButton from "../components/SubmitButton";
import Report from "../components/Report";
import { Loader2 } from "lucide-react";

export default function AccessibilityChecker() {
  const { report, setReport, loading, setLoading } = useReport();
  const [url, setUrl] = useState("");
  const [deleteScheduled, setDeleteScheduled] = useState(false); // ✅ Prevent multiple delete requests

  const checkAccessibility = async () => {
    setLoading(true);
    setDeleteScheduled(false); // Reset delete scheduling

    try {
      const response = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setReport(data);

      console.log("✅ Accessibility check completed!");

      // ✅ Only schedule delete if it hasn’t been scheduled
      if (!deleteScheduled) {
        setDeleteScheduled(true);
        setTimeout(async () => {
          try {
            console.log("🗑️ Triggering screenshot deletion...");
            const deleteResponse = await fetch("/api/delete-screenshots", { method: "POST" });

            if (!deleteResponse.ok) {
              console.error("❌ Error deleting screenshots:", await deleteResponse.text());
            } else {
              console.log("✅ Screenshots deleted successfully");
            }
          } catch (error) {
            console.error("❌ Failed to call delete API:", error);
          }
        }, 180000); // ⏳ 180s delay
      }

    } catch (error) {
      console.error("❌ Error checking accessibility:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
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

