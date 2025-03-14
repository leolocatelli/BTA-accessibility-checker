export default function PerformanceSummary({ images, loadTime }) {
    // Estimate total image size (assuming 25KB per image)
    const totalSizeKB = images.length * 25;
    const totalSizeMB = (totalSizeKB / 1024).toFixed(2);
  
    return (
      <div className="grid grid-cols-3 gap-4 mt-6">
        {/* Number of Images */}
        <div className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-4">
          <div className="w-12 h-12 flex items-center justify-center bg-blue-300 rounded-full text-white text-lg font-bold">
            🖼️
          </div>
          <div>
            <p className="text-lg font-semibold">{images.length}</p>
            <p className="text-gray-600 text-sm">Images</p>
          </div>
        </div>
  
        {/* Total Image Size */}
        <div className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-4">
          <div className="w-12 h-12 flex items-center justify-center bg-teal-300 rounded-full text-white text-lg font-bold">
            🔄
          </div>
          <div>
            <p className="text-lg font-semibold">{totalSizeMB} MB</p>
            <p className="text-gray-600 text-sm">Total Image Size</p>
          </div>
        </div>
  
        {/* Page Load Time */}
        <div className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-4">
          <div className="w-12 h-12 flex items-center justify-center bg-purple-300 rounded-full text-white text-lg font-bold">
            ⏳
          </div>
          <div>
            <p className="text-lg font-semibold">{loadTime}s</p>
            <p className="text-gray-600 text-sm">Total Time to Load</p>
          </div>
        </div>
      </div>
    );
  }
  