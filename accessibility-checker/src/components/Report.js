import React, { useState } from "react";
import ViolationsList from "./ViolationsList";
import ImageAltReview from "./ImageAltReview";
import ImagePreviewModal from "./ImagePreviewModal";
import PerformanceSummary from "./PerformanceSummary";

export default function Report({ report }) {
  if (!report) return null;

  const { violations = [], images = [], loadTime = 0 } = report;

  const [selectedImage, setSelectedImage] = useState(null);
  const [filter, setFilter] = useState("none");
  const [checkedImages, setCheckedImages] = useState({});
  const [imageSizes, setImageSizes] = useState({});

  return (
    <div className="mt-6 p-4 bg-gray-100 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
      {/* ✅ Violations List */}
      {violations.length > 0 && <ViolationsList violations={violations} />}

      {images.length > 0 && (
        <>
          {/* 🛠️ Performance Summary Section */}
          <PerformanceSummary
            images={images}
            imageSizes={imageSizes}
            loadTime={loadTime}
          />

          {/* 🖼️ Image ALT Review */}
          <ImageAltReview
            images={images}
            checkedImages={checkedImages}
            setCheckedImages={setCheckedImages}
            setSelectedImage={setSelectedImage}
            setImageSizes={setImageSizes}
          />
        </>
      )}

      {/* 🖼️ Image Preview Modal */}
      <ImagePreviewModal
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
        filter={filter}
        setFilter={setFilter}
        checkedImages={checkedImages}
        toggleCheck={(imgSrc) =>
          setCheckedImages((prev) => ({ ...prev, [imgSrc]: !prev[imgSrc] }))
        }
      />
    </div>
  );
}
