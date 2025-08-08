function calculateScore(
  violations = [],
  images = [],
  checkedImages = {},
  videos = [],
  checkedVideos = {},
  textContent = [],
  checkedTexts = {}
) {
  // Validate input data
  checkedImages = checkedImages || {};
  checkedVideos = checkedVideos || {};
  checkedTexts = checkedTexts || {};

  // 1. Base score
  let baseScore = 100;

  // 2. Penalty for violations (maximum of 30 points)
  const maxViolationPenalty = 30;
  const totalViolations = violations.length;
  const penaltyPerViolation = 3; // 10 violations = 30 points

  const totalPenalty = Math.min(totalViolations * penaltyPerViolation, maxViolationPenalty);
  baseScore -= totalPenalty;

  // 3. Recovery through reviewed content

  // 🖼️ Images - up to 45%
  const totalImages = images.length;
  const reviewedImages = Object.values(checkedImages).filter(Boolean).length;
  const imageScore = totalImages === 0 ? 45 : (reviewedImages / totalImages) * 45;

  // 📄 Texts - up to 15%
  const totalTexts = textContent.length;
  const reviewedTexts = Object.values(checkedTexts).filter(Boolean).length;
  const textScore = totalTexts === 0 ? 15 : (reviewedTexts / totalTexts) * 15;

  // 🎥 Videos - up to 10%
  const totalVideos = videos.length;
  const reviewedVideos = Object.values(checkedVideos).filter(Boolean).length;
  const videoScore = totalVideos === 0 ? 10 : (reviewedVideos / totalVideos) * 10;

  // 4. Final score calculation
  const finalScore = Math.min(100, Math.max(0, Math.round(baseScore * ((imageScore + textScore + videoScore) / 70))));

  return finalScore;
}

module.exports = { calculateScore };
