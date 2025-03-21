export function getSuggestedFix(violationId) {
    const fixes = {
      "color-contrast": "Ensure text and background colors have at least a 4.5:1 contrast ratio.",
      "heading-order": "Ensure headings follow correct semantic order (h1 > h2 > h3, etc.).",
      "image-alt": "Ensure all <img> elements have meaningful alt text or use `role='presentation'`.",
      label: "Ensure all form elements have associated `<label>` elements.",
    };
    return fixes[violationId] || "Refer to WCAG guidelines for further details.";
  }
  