"use client"; // ✅ Mark as a client component

import { createContext, useState, useContext } from "react";

const ReportContext = createContext();

export function ReportProvider({ children }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <ReportContext.Provider value={{ report, setReport, loading, setLoading }}>
      {children}
    </ReportContext.Provider>
  );
}

export function useReport() {
  return useContext(ReportContext);
}
