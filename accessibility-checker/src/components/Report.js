import React, { useState } from "react";
import ScoreBar from "./ScoreBar";
import ViolationsList from "./ViolationsList";
import ImageAltReview from "./ImageAltReview";
import ImagePreviewModal from "./ImagePreviewModal";
import VideoReview from "./VideoReview";
import TextReview from "./TextReview";

export default function Report({ report }) {
  if (!report) return null;

  // ✅ Ensure videos are included
  const {
    score,
    violations = [],
    images = [],
    videos = [],
    textContent = [],
  } = report;
  const [selectedImage, setSelectedImage] = useState(null);
  const [filter, setFilter] = useState("none");
  const [checkedImages, setCheckedImages] = useState({});
  const [checkedVideos, setCheckedVideos] = useState({});
  const [checkedTexts, setCheckedTexts] = useState({});

  const toggleCheck = (imgSrc) => {
    setCheckedImages((prev) => ({
      ...prev,
      [imgSrc]: !prev[imgSrc],
    }));
  };

  return (
    <div className="mt-6 p-4 bg-gray-100 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-2">Accessibility Report</h2>

      {/* Score Bar */}
      <ScoreBar score={score} />

      {/* WCAG Violations */}
      <ViolationsList violations={violations} />

      {/* Image ALT Review */}
      {images.length > 0 && (
        <ImageAltReview
          images={images}
          checkedImages={checkedImages}
          setCheckedImages={setCheckedImages}
          setSelectedImage={setSelectedImage}
        />
      )}

      {/* Image Preview Modal */}
      <ImagePreviewModal
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
        filter={filter}
        setFilter={setFilter}
        checkedImages={checkedImages}
        toggleCheck={toggleCheck}
      />

      {/* ✅ Video Caption Review (Now inside return statement) */}
      {videos.length > 0 && (
        <VideoReview
          videos={videos}
          checkedVideos={checkedVideos}
          setCheckedVideos={setCheckedVideos}
        />
      )}

      {/* ✅ Text Review Section */}
      {textContent.length > 0 && (
        <TextReview
          texts={textContent}
          checkedTexts={checkedTexts}
          setCheckedTexts={setCheckedTexts}
        />
      )}
    </div>
  );
}
