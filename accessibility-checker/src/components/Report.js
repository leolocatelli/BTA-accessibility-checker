import React, { useState } from "react";
import ScoreBar from "./ScoreBar";
import ViolationsList from "./ViolationsList";
import ImageAltReview from "./ImageAltReview";
import ImagePreviewModal from "./ImagePreviewModal";

export default function Report({ report }) {
  if (!report) return null;

  const { score, violations = [], images = [] } = report;
  const [selectedImage, setSelectedImage] = useState(null);
  const [filter, setFilter] = useState("none");
  const [checkedImages, setCheckedImages] = useState({});

  const toggleCheck = (imgSrc) => {
    setCheckedImages((prev) => ({
      ...prev,
      [imgSrc]: !prev[imgSrc],
    }));
  };

  return (
    <div className="mt-6 p-4 bg-gray-100 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-2">Accessibility Report</h2>
      <ScoreBar score={score} />
      <ViolationsList violations={violations} />
      <ImageAltReview images={images} checkedImages={checkedImages} setCheckedImages={setCheckedImages} setSelectedImage={setSelectedImage} />
      <ImagePreviewModal selectedImage={selectedImage} setSelectedImage={setSelectedImage} filter={filter} setFilter={setFilter} checkedImages={checkedImages} toggleCheck={toggleCheck} />
    </div>
  );
}
