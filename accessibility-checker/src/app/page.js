"use client"; // Necessário para Next.js App Router

import React, { useState } from "react";
import InputField from "@/components/InputField";
import SubmitButton from "@/components/SubmitButton";
import Report from "@/components/Report";

export default function Home() {
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
    <div className="p-6 mt-40 max-w-2xl mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-xl font-bold mb-4 p-2 text-center">Accessibility Checker</h1>
      <div className=" flex flex-col gap-4 ">
      <InputField url={url} setUrl={setUrl} />
      <SubmitButton onClick={checkAccessibility} loading={loading} />
      <Report report={report} />
      </div>
    </div>
  );
}
