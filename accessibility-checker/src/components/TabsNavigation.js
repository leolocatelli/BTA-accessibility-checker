import { LayoutGrid, Image, Droplet } from "lucide-react";

export default function TabsNavigation({ activeTab, setActiveTab }) {
  return (
    <div className="flex justify-center bg-white shadow-md rounded-lg overflow-hidden">
      <button
        className={`flex items-center gap-2 px-6 py-3 text-lg font-semibold transition ${
          activeTab === "accessibility"
            ? "border-b-4 border-blue-500 text-blue-600 bg-blue-50"
            : "text-gray-600 hover:text-blue-500"
        }`}
        onClick={() => setActiveTab("accessibility")}
      >
        <LayoutGrid className="w-5 h-5" />
        Accessibility Checker
      </button>

      <button
        className={`flex items-center gap-2 px-6 py-3 text-lg font-semibold transition ${
          activeTab === "image-alt"
            ? "border-b-4 border-blue-500 text-blue-600 bg-blue-50"
            : "text-gray-600 hover:text-blue-500"
        }`}
        onClick={() => setActiveTab("image-alt")}
      >
        <Image className="w-5 h-5" />
        Image ALT Generator
      </button>

      <button
        className={`flex items-center gap-2 px-6 py-3 text-lg font-semibold transition ${
          activeTab === "contrast"
            ? "border-b-4 border-blue-500 text-blue-600 bg-blue-50"
            : "text-gray-600 hover:text-blue-500"
        }`}
        onClick={() => setActiveTab("contrast")}
      >
        <Droplet className="w-5 h-5" />
        Color Contrast Checker
      </button>
    </div>
  );
}
