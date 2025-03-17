import { useEffect } from "react";

export function useShortcutCheck(images, setCheckedImages) {
  useEffect(() => {
    let isHoldingI = false;

    const handleKeyDown = (event) => {
      if (event.key.toLowerCase() === "i") {
        isHoldingI = true;
      }
    };

    const handleKeyUp = (event) => {
      if (event.key.toLowerCase() === "i") {
        isHoldingI = false;
      }
    };

    const handleClick = () => {
      if (isHoldingI) {
        setCheckedImages((prev) => {
          const updatedChecked = { ...prev };

          images.forEach((img) => {
            if (img.alt?.trim() !== "(No ALT text)" && !prev[img.src]) {
              updatedChecked[img.src] = true;
            }
          });

          return updatedChecked;
        });
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("click", handleClick);
    };
  }, [images, setCheckedImages]);
}
