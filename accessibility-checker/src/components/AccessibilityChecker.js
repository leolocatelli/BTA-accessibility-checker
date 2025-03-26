"use client";
import { useState, useEffect } from "react";
import { useReport } from "../context/ReportContext";
import InputField from "../components/InputField";
import SubmitButton from "../components/SubmitButton";
import Report from "../components/Report";

export default function AccessibilityChecker() {
  const { report, setReport, loading, setLoading } = useReport();
  const [url, setUrl] = useState("");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("Starting analysis...");
  const [deleteScheduled, setDeleteScheduled] = useState(false);

  // ✅ Dynamic loading messages based on Puppeteer stages
  const getMessageForProgress = (value) => {
    if (value < 20) return "Launching headless browser...";
    if (value < 40) return "Navigating to website...";
    if (value < 60) return "Scanning DOM for accessibility issues...";
    if (value < 80) return "Evaluating contrast and ARIA roles...";
    if (value < 95) return "Finalizing accessibility report...";
    return "Done! Almost there...";
  };

  useEffect(() => {
    let interval;
    if (loading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          const next = prev < 95 ? prev + 5 : prev;
          setMessage(getMessageForProgress(next));
          return next;
        });
      }, 300);
    } else {
      setProgress(100);
      setMessage("Done!");
      const timeout = setTimeout(() => setProgress(0), 500);
      return () => clearTimeout(timeout);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const isValidUrl = (str) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  const checkAccessibility = async () => {
    if (!isValidUrl(url)) {
      alert("Please enter a valid URL.");
      return;
    }

    setReport(null); // ✅ Clear old report
    setLoading(true);
    setDeleteScheduled(false);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/check`, {
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

      if (!deleteScheduled) {
        setDeleteScheduled(true);
        setTimeout(async () => {
          try {
            console.log("🗑️ Triggering screenshot deletion...");
            const deleteResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/delete-screenshots`, {
              method: "POST",
            });
            if (!deleteResponse.ok) {
              console.error("❌ Error deleting screenshots:", await deleteResponse.text());
            } else {
              console.log("✅ Screenshots deleted successfully");
            }
          } catch (error) {
            console.error("❌ Failed to call delete API:", error);
          }
        }, 180000);
      }
    } catch (error) {
      console.error("❌ Error checking accessibility:", error);
      alert("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex flex-col items-center justify-center z-50 px-6">
          {/* ✅ Dynamic Progress Message */}
          <p className="text-white text-lg mb-6 text-center animate-pulse">{message}</p>

          {/* ✅ Progress Bar */}
          <div className="w-full max-w-md h-4 bg-gray-800 rounded-full shadow-inner overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-200"
              style={{ width: `${progress}%` }}
            ></div>
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
