import {
  LayoutGrid,
  Image,
  Droplet,
  Type,
  MonitorSmartphone,
} from "lucide-react";

export default function TabsNavigation({ activeTab, setActiveTab }) {
  const baseBtn =
    "flex items-center gap-2 px-5 py-3 text-base font-semibold transition whitespace-nowrap";

  return (
    <div className="flex justify-center bg-white shadow-md rounded-lg overflow-x-auto no-scrollbar">
      {/* Accessibility Tab */}
      <button
        className={`${baseBtn} ${
          activeTab === "accessibility"
            ? "border-b-4 border-blue-500 text-blue-600 bg-blue-50"
            : "text-gray-600 hover:text-blue-500"
        }`}
        onClick={() => setActiveTab("accessibility")}
      >
        <LayoutGrid className="w-5 h-5" />
        Checker
      </button>

      {/* Image ALT Tab */}
      <button
        className={`${baseBtn} ${
          activeTab === "image-alt"
            ? "border-b-4 border-blue-500 text-blue-600 bg-blue-50"
            : "text-gray-600 hover:text-blue-500"
        }`}
        onClick={() => setActiveTab("image-alt")}
      >
        <Image className="w-5 h-5" />
        Image ALT
      </button>

      {/* Contrast Checker Tab */}
      <button
        className={`${baseBtn} ${
          activeTab === "contrast"
            ? "border-b-4 border-blue-500 text-blue-600 bg-blue-50"
            : "text-gray-600 hover:text-blue-500"
        }`}
        onClick={() => setActiveTab("contrast")}
      >
        <Droplet className="w-5 h-5" />
        Contrast
      </button>

      {/* Character Counter Tab */}
      <button
        className={`${baseBtn} ${
          activeTab === "text-tools"
            ? "border-b-4 border-blue-500 text-blue-600 bg-blue-50"
            : "text-gray-600 hover:text-blue-500"
        }`}
        onClick={() => setActiveTab("text-tools")}
      >
        <Type className="w-5 h-5" />
        Text Tools
      </button>

      {/* <button
        className={`${baseBtn} ${
          activeTab === "responsive-preview"
            ? "border-b-4 border-blue-500 text-blue-600 bg-blue-50"
            : "text-gray-600 hover:text-blue-500"
        }`}
        onClick={() => setActiveTab("responsive-preview")}
      >
        <MonitorSmartphone className="w-5 h-5" />
        Responsive Preview
      </button> */}
    </div>
  );
}
