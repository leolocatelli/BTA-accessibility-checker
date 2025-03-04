export default function TabsNavigation({ activeTab, setActiveTab }) {
    return (
      <div className="flex justify-center border-b">
        <button
          className={`py-2 px-6 text-lg font-semibold ${activeTab === "accessibility" ? "border-b-4 border-blue-500 text-blue-600" : "text-gray-500"}`}
          onClick={() => setActiveTab("accessibility")}
        >
          Accessibility Checker
        </button>
        <button
          className={`py-2 px-6 text-lg font-semibold ${activeTab === "image-alt" ? "border-b-4 border-blue-500 text-blue-600" : "text-gray-500"}`}
          onClick={() => setActiveTab("image-alt")}
        >
          Image ALT Generator
        </button>
        <button
          className={`py-2 px-6 text-lg font-semibold ${activeTab === "contrast" ? "border-b-4 border-blue-500 text-blue-600" : "text-gray-500"}`}
          onClick={() => setActiveTab("contrast")}
        >
          Color Contrast Checker
        </button>
      </div>
    );
  }
  