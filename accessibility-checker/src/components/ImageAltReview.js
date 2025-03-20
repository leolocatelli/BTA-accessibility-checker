import { useImageSizes } from "../app/hooks/useImageSizes";
import { useShortcutCheck } from "../app/hooks/useShortcutCheck";
import ImageCard from "./ImageCard";
import { useEffect, useState } from "react";


export default function ImageAltReview({ images, checkedImages, setCheckedImages, setSelectedImage, setImageSizes }) {
  const imageSizes = useImageSizes(images);
  useShortcutCheck(images, setCheckedImages);

  useEffect(() => {
    setImageSizes(imageSizes);
  }, [imageSizes, setImageSizes]);

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold"> Image ALT Review</h3>
      <div className="grid grid-cols-3 gap-4 mt-2">
        {images.map((img, index) => (
          <ImageCard
            key={index}
            img={img}
            imageSizes={imageSizes}
            checkedImages={checkedImages}
            setCheckedImages={setCheckedImages}
            setSelectedImage={setSelectedImage}
          />
        ))}
      </div>
    </div>
  );
}
