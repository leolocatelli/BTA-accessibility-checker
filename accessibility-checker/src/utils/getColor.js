// utils/getColor.js
export function getColor(img, checkedImages) {
  const altText = img.alt ? img.alt.trim().toLowerCase() : "";

  // If the image is already checked, return green
  if (checkedImages[img.src]) return "#C6F6D5"; // Tailwind's bg-green-200

  // If there's no ALT text, return red (cannot be marked as OK)
  if (!altText || altText === "(no alt text)") return "#FEB2B2"; // Tailwind's bg-red-400

  // If the ALT text is too generic or contains only one word, return orange
  const weakAlts = ["image", "photo", "picture", "logo", "icon"];
  if (altText.split(" ").length === 1 || weakAlts.includes(altText)) return "#ffcc8f"; // Tailwind's bg-orange-300

  // Otherwise, it's a valid ALT but unreviewed, return yellow
  return "#FEFCBF"; // Tailwind's bg-yellow-100
}
