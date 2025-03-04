"use client"; // Required for Next.js App Router

import { useState } from "react";
import TabsNavigation from "@/components/TabsNavigation";
import AccessibilityChecker from "@/components/AccessibilityChecker";
import ImageAltGenerator from "@/components/ImageAltGenerator";
import ColorContrastChecker from "@/components/ColorContrastChecker";

export default function Home() {
  const [activeTab, setActiveTab] = useState("accessibility");

  return (
    <div className="p-6 mt-20 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
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
