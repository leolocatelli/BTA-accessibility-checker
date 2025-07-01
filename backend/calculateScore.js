function calculateScore(
  violations = [],
  images = [],
  checkedImages = {},
  videos = [],
  checkedVideos = {},
  textContent = [],
  checkedTexts = {}
) {
  // Validar dados
  checkedImages = checkedImages || {};
  checkedVideos = checkedVideos || {};
  checkedTexts = checkedTexts || {};

  // 1. Score base
  let baseScore = 100;

  // 2. Penalidade por violações (máximo 30 pontos)
  const maxViolationPenalty = 30;
  const totalViolations = violations.length;
  const penaltyPerViolation = 3; // 10 violações = 30 pontos

  const totalPenalty = Math.min(totalViolations * penaltyPerViolation, maxViolationPenalty);
  baseScore -= totalPenalty;

  // 3. Recuperação por conteúdo validado

  // 🖼️ Imagens - até 45%
  const totalImages = images.length;
  const reviewedImages = Object.values(checkedImages).filter(Boolean).length;
  const imageScore = totalImages === 0 ? 45 : (reviewedImages / totalImages) * 45;

  // 📄 Textos - até 15%
  const totalTexts = textContent.length;
  const reviewedTexts = Object.values(checkedTexts).filter(Boolean).length;
  const textScore = totalTexts === 0 ? 15 : (reviewedTexts / totalTexts) * 15;

  // 🎥 Vídeos - até 10%
  const totalVideos = videos.length;
  const reviewedVideos = Object.values(checkedVideos).filter(Boolean).length;
  const videoScore = totalVideos === 0 ? 10 : (reviewedVideos / totalVideos) * 10;

  // 4. Somar ao score base
  const finalScore = Math.min(100, Math.max(0, Math.round(baseScore * ((imageScore + textScore + videoScore) / 70))));

  return finalScore;
}

module.exports = { calculateScore };
