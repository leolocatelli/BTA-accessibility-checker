"use client"; // Required for Next.js App Router

import { useState } from "react";
import Image from "next/image"; // ✅ Import Next.js Image component
import TabsNavigation from "@/components/TabsNavigation";
import AccessibilityChecker from "@/components/AccessibilityChecker";
import ImageAltGenerator from "@/components/ImageAltGenerator";
import ColorContrastChecker from "@/components/ColorContrastChecker";

export default function Home() {
  const [activeTab, setActiveTab] = useState("accessibility");

  return (
    <div className="p-6 mt-16 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      {/* 🔹 Fixed Title with Icon & Beta Badge */}
      <div className="text-center mb-20 flex items-center justify-center gap-3">
        {/* ✅ Accessibility Icon */}
        <Image src="/accessibility-icon.ico" alt="Accessibility Icon" width={32} height={32} />

        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          BTA Accessibility Tool
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 text-white">
            Beta
          </span>
        </h1>
      </div>

      {/* 🔹 Tabs Navigation */}
      <TabsNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 🔹 Content for Each Tab */}
      <div className="p-6 max-w-3xl mx-auto">
        {activeTab === "accessibility" && <AccessibilityChecker />}
        {activeTab === "image-alt" && <ImageAltGenerator />}
        {activeTab === "contrast" && <ColorContrastChecker />}
      </div>
    </div>
  );
}
