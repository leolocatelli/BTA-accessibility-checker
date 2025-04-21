function getSuggestedFix(violationId) {
  const fixes = {
    "color-contrast": {
      message:
        "The text and background colors on this element do not have enough contrast. Increase the contrast to make the content more readable.",
      wcagLink:
        "https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html", // 1.4.3
    },
    "heading-order": {
      message:
        "Headings are not in a proper order. Use them in a logical sequence (e.g., h1 followed by h2, then h3).",
      wcagLink:
        "https://www.w3.org/WAI/WCAG21/Understanding/headings-and-labels.html", // 2.4.6
    },
    "image-alt": {
      message:
        "This image is missing an alt attribute. Add a descriptive alt text to help screen readers understand its content.",
      wcagLink:
        "https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html", // 1.1.1
    },
    label: {
      message:
        "Form controls are missing associated labels. Make sure each input has a corresponding <label> for accessibility.",
      wcagLink:
        "https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions.html", // 3.3.2
    },
    region: {
      message:
        "The page is missing landmark elements like <main>, <nav>, or <aside>. Wrap your content in appropriate landmark tags to improve screen reader navigation.",
      wcagLink:
        "https://www.w3.org/WAI/WCAG21/Understanding/bypass-blocks.html", // 2.4.1 (landmark usage)
    },
    "page-has-heading-one": {
      message:
        "The page does not contain an <h1> heading. Add an <h1> to provide a clear title or main topic of the page.",
      wcagLink:
        "https://www.w3.org/WAI/WCAG21/Understanding/headings-and-labels.html", // 2.4.6
    },
    "link-name": {
      message:
        "Some links do not have visible or discernible text. Add text inside the <a> tag to describe the purpose of the link.",
      wcagLink:
        "https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html", // 4.1.2
    },
    "landmark-one-main": {
      message:
        "The page is missing a <main> landmark. Add a <main> tag to help users skip directly to the main content.",
      wcagLink:
        "https://www.w3.org/WAI/WCAG21/Understanding/bypass-blocks.html", // 2.4.1
    },
    "html-has-lang": {
      message:
        "The <html> tag is missing a 'lang' attribute. Add it to specify the language of the document (e.g., <html lang=\"en\">).",
      wcagLink:
        "https://www.w3.org/WAI/WCAG21/Understanding/language-of-page.html", // 3.1.1
    },
    "empty-heading": {
      message:
        "One or more heading elements (like <h1> to <h6>) are empty or do not contain meaningful text. Make sure all headings describe the section content clearly.",
      wcagLink:
        "https://www.w3.org/WAI/WCAG21/Understanding/headings-and-labels.html", // 2.4.6
    },
  };

  return (
    fixes[violationId] || {
      message:
        "No specific suggestion found. Refer to WCAG guidelines for more information.",
      wcagLink: "https://www.w3.org/WAI/WCAG21/Understanding/",
    }
  );
}

module.exports = { getSuggestedFix };
