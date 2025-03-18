import { useTotalImageSize } from "@/app/hooks/useTotalImageSize";
import { useTotalResourceSize } from "@/app/hooks/useTotalResourceSize";
import { Image, Layers, Clock, Package } from "lucide-react";

export default function PerformanceSummary({ images, imageSizes, loadTime }) {
  const totalImageSize = useTotalImageSize(imageSizes);
  const { totalSize: totalResourceSize, resourceBreakdown } = useTotalResourceSize();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
      {/* 🖼️ Number of Images */}
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center">
        <div className="w-12 h-12 flex items-center justify-center bg-blue-400 rounded-full text-white">
          <Image className="w-6 h-6" />
        </div>
        <p className="text-lg font-semibold">{images.length}</p>
        <p className="text-gray-600 text-sm">Images</p>
      </div>

      {/* 🔄 Total Image Size */}
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center">
        <div className="w-12 h-12 flex items-center justify-center bg-teal-400 rounded-full text-white">
          <Layers className="w-6 h-6" />
        </div>
        <p className="text-lg font-semibold">{totalImageSize}</p>
        <p className="text-gray-600 text-sm">Total Image Size</p>
      </div>

      {/* 📦 Total Resources Size */}
      {/* <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center">
        <div className="w-12 h-12 flex items-center justify-center bg-red-400 rounded-full text-white">
          <Package className="w-6 h-6" />
        </div>
        <p className="text-lg font-semibold">{totalResourceSize}</p>
        <p className="text-gray-600 text-sm">Total Resources Size</p>
      </div> */}

      {/* ⏳ Full Load Time */}
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center">
        <div className="w-12 h-12 flex items-center justify-center bg-purple-400 rounded-full text-white">
          <Clock className="w-6 h-6" />
        </div>
        <p className="text-lg font-semibold">{loadTime}s</p>
        <p className="text-gray-600 text-sm">Full Load Time</p>
      </div>

      {/* 🔍 Resource Breakdown */}
      <div className="col-span-2 md:col-span-3 bg-gray-50 p-5 rounded-lg shadow-md mt-4">
        <h3 className="text-lg font-semibold mb-3">Resource Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(resourceBreakdown).map(([key, size]) => (
            <div key={key} className="flex justify-between bg-white p-3 rounded shadow-sm border">
              <span className="text-gray-700 font-medium">{key}</span>
              <span className="text-gray-600">{size}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
