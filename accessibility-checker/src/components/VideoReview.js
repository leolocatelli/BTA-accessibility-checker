import { useState } from "react";

export default function VideoReview({ videos, checkedVideos, setCheckedVideos }) {
  const [selectedVideo, setSelectedVideo] = useState(null);

  if (!videos.length) return null;

  const getColor = (video) => {
    return checkedVideos[video.src] ? "bg-green-200" : "bg-yellow-100"; // ✅ Turns green when checked
  };

  const toggleCheck = (videoSrc) => {
    setCheckedVideos((prev) => ({
      ...prev,
      [videoSrc]: true, // ✅ Mark as checked
    }));
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold">Video Caption Review:</h3>
      <div className="grid grid-cols-2 gap-4 mt-2">
        {videos.map((video, index) => (
          <div key={index} className={`border p-2 rounded-lg ${getColor(video)}`}>
            {/* Video Preview */}
            <video
              src={video.src}
              controls
              className="w-full h-64 object-cover rounded-md cursor-pointer"
              onClick={() => setSelectedVideo(video)}
            />
            <p className="text-sm mt-1 text-gray-600">
              <strong>Captions:</strong> {video.hasCaptions ? "✅ Yes" : "❌ No"}
            </p>

            {/* ✔ Ok Button (Only shows if not checked) */}
            {!checkedVideos[video.src] && (
              <button
                className="mt-2 px-3 py-1 bg-green-400 text-white rounded hover:bg-green-500"
                onClick={() => toggleCheck(video.src)}
              >
                ✔ Ok
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full overflow-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-gray-600 text-xl"
              onClick={() => setSelectedVideo(null)}
            >
              ✖
            </button>
            <video src={selectedVideo.src} controls className="w-full h-auto rounded-lg" />
          </div>
        </div>
      )}
    </div>
  );
}
