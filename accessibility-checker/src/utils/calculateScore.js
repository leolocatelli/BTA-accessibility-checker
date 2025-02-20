export function calculateScore(violations) {
    let score = 100;
    const severityWeights = {
      critical: 20,
      serious: 10,
      moderate: 5,
      minor: 2,
    };
  
    violations.forEach((violation) => {
      const weight = severityWeights[violation.impact] || 5;
      score -= weight;
    });
  
    return Math.max(0, score);
  }
  