import { useState } from "react";
import InputField from "./InputField";
import SubmitButton from "./SubmitButton";
import Report from "./Report";

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
    <div className="flex flex-col gap-4 p-6">
      <InputField url={url} setUrl={setUrl} />
      <SubmitButton onClick={checkAccessibility} loading={loading} />
      {report && (
        <div className="mt-6">
          <Report report={report} />
        </div>
      )}
    </div>
  );
}
