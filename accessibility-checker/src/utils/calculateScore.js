export function calculateScore(violations = [], images = [], checkedImages = {}, videos = [], checkedVideos = {}, textContent = [], checkedTexts = {}) {
  let score = 0;

  // Ensure checked objects are valid
  checkedImages = checkedImages || {};
  checkedVideos = checkedVideos || {};
  checkedTexts = checkedTexts || {};

  // 🔹 40% - Image ALT Validation
  const totalImages = images.length;
  const reviewedImages = Object.values(checkedImages).filter(Boolean).length;
  const imageScore = totalImages === 0 ? 45 : (reviewedImages / totalImages) * 45;
  score += imageScore;

  // 🔹 20% - WCAG Violations Impact (Lower is better)
  const totalViolations = violations.length;
  const wcagScore = totalViolations === 0 ? 10 : Math.max(0, 10 - totalViolations);
  score += wcagScore;

  // 🔹 10% - Video Caption Validation
  const totalVideos = videos.length;
  const reviewedVideos = Object.values(checkedVideos).filter(Boolean).length;
  const videoScore = totalVideos === 0 ? 10 : (reviewedVideos / totalVideos) * 10;
  score += videoScore;

  // 🔹 30% - Text Content Review
  const totalTexts = textContent.length;
  const reviewedTexts = Object.values(checkedTexts).filter(Boolean).length;
  const textScore = totalTexts === 0 ? 35 : (reviewedTexts / totalTexts) * 35;
  score += textScore;

  // 🔹 Ensure the score is within the valid range (0-100)
  return Math.min(100, Math.max(0, Math.round(score)));
}
