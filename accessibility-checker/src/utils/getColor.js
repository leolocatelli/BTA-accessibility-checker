export function getColor(img, checkedImages) {
    if (checkedImages[img.src]) return "bg-green-200"; // ✅ Marcado como OK
    return img.alt?.trim() === "(No ALT text)" ? "bg-red-200" : "bg-yellow-100";
  }
  