import {
  LayoutGrid,
  Image,
  Droplet,
  Type,
  MonitorSmartphone,
  Eye,
  Layers,
  Captions,
} from "lucide-react";

export default function TabsNavigation({ activeTab, setActiveTab }) {
  const baseBtn =
    "flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold transition whitespace-nowrap";

  return (
    <div className="flex w-full items-center justify-center overflow-x-auto rounded-lg bg-white shadow-md">
      {" "}
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
      {/* Video Transcript Tab */}
      <button
        className={`${baseBtn} ${
          activeTab === "video-transcript"
            ? "border-b-4 border-blue-500 text-blue-600 bg-blue-50"
            : "text-gray-600 hover:text-blue-500"
        }`}
        onClick={() => setActiveTab("video-transcript")}
      >
        <Captions className="w-5 h-5" />
        Video Transcript
        <span className="ml-1 rounded-full bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
          NEW
        </span>
      </button>
      {/* ARIA & Tab Inspector Tab */}
      <button
        className={`${baseBtn} ${
          activeTab === "inspector"
            ? "border-b-4 border-blue-500 text-blue-600 bg-blue-50"
            : "text-gray-600 hover:text-blue-500"
        }`}
        onClick={() => setActiveTab("inspector")}
      >
        <Eye className="w-5 h-5" />
        ARIA & Tab Inspector
      </button>
      {/* Unified Checker Tab */}
      {/* <button
        className={`${baseBtn} ${
          activeTab === "unified"
            ? "border-b-4 border-blue-500 text-blue-600 bg-blue-50"
            : "text-gray-600 hover:text-blue-500"
        }`}
        onClick={() => setActiveTab("unified")}
      >
        <Layers className="w-5 h-5" />
        Unified Checker
        <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-900 text-white">
          BETA
        </span>
      </button> */}
    </div>
  );
}
