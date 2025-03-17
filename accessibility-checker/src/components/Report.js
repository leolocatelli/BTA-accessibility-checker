import React, { useState, useEffect } from "react";
import ScoreBar from "./ScoreBar";
import ViolationsList from "./ViolationsList";
import ImageAltReview from "./ImageAltReview";
import ImagePreviewModal from "./ImagePreviewModal";
import VideoReview from "./VideoReview";
import TextReview from "./TextReview";
import PerformanceSummary from "./PerformanceSummary";
import { calculateScore } from "@/utils/calculateScore";

export default function Report({ report }) {
  if (!report) return null;

  const { violations = [], images = [], videos = [], textContent = [], loadTime = 0 } = report;
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [filter, setFilter] = useState("none");
  const [checkedImages, setCheckedImages] = useState({});
  const [checkedVideos, setCheckedVideos] = useState({});
  const [checkedTexts, setCheckedTexts] = useState({});
  const [imageSizes, setImageSizes] = useState({});
  const [score, setScore] = useState(0);

  // 🔹 Dynamically update score based on reviewed elements
  useEffect(() => {
    const newScore = calculateScore(violations, images, checkedImages, videos, checkedVideos, textContent, checkedTexts);
    setScore(newScore);
  }, [violations, images, checkedImages, videos, checkedVideos, textContent, checkedTexts]);

  return (
    <div className="mt-6 p-4 bg-gray-100 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-2">Accessibility Report</h2>

      {/* 🛠️ Performance Summary Section */}
      <PerformanceSummary images={images} imageSizes={imageSizes} loadTime={loadTime} />

      {/* 🖼️ Image ALT Review */}
      {images.length > 0 && (
        <ImageAltReview
          images={images}
          checkedImages={checkedImages}
          setCheckedImages={setCheckedImages}
          setSelectedImage={setSelectedImage}
          setImageSizes={setImageSizes} // ✅ Armazena os tamanhos
        />
      )}

      {/* 🖼️ Image Preview Modal */}
      <ImagePreviewModal
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
        filter={filter}
        setFilter={setFilter}
        checkedImages={checkedImages}
        toggleCheck={(imgSrc) => setCheckedImages((prev) => ({ ...prev, [imgSrc]: !prev[imgSrc] }))}
      />

      {/* 🎥 Video Caption Review */}
      {videos.length > 0 && (
        <VideoReview
          videos={videos}
          checkedVideos={checkedVideos}
          setCheckedVideos={setCheckedVideos}
        />
      )}

      {/* 📝 Text Content Review */}
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
