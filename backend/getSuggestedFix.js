function getSuggestedFix(violationId) {
  const fixes = {
    "color-contrast": {
      message:
        "The text and background colors on this element do not have enough contrast. Increase the contrast to meet accessibility standards.",
      wcagLink:
        "https://dequeuniversity.com/rules/axe/4.8/color-contrast?application=axeAPI",
    },
    "heading-order": {
      message:
        "Headings are not in a proper order. Use heading tags in a logical sequence (e.g., <h1> followed by <h2>, then <h3>).",
      wcagLink:
        "https://dequeuniversity.com/rules/axe/4.8/heading-order?application=axeAPI",
    },
    "image-alt": {
      message:
        "This image is missing an alt attribute. Add a descriptive alt text to help screen readers understand its content.",
      wcagLink:
        "https://dequeuniversity.com/rules/axe/4.8/image-alt?application=axeAPI",
    },
    label: {
      message:
        "Form controls are missing associated labels. Add a <label> element to each form input.",
      wcagLink:
        "https://dequeuniversity.com/rules/axe/4.8/label?application=axeAPI",
    },
    region: {
      message:
        "Use landmark elements like <main>, <nav>, or <aside> to define regions of the page and improve navigation for assistive technologies.",
      wcagLink:
        "https://dequeuniversity.com/rules/axe/4.8/region?application=axeAPI",
    },
    "page-has-heading-one": {
      message:
        "The page does not have an <h1> heading. Add an <h1> to define the main topic.",
      wcagLink:
        "https://dequeuniversity.com/rules/axe/4.8/page-has-heading-one?application=axeAPI",
    },
    "link-name": {
      message:
        "Some links do not have visible or descriptive text. Ensure each <a> tag contains meaningful text.",
      wcagLink:
        "https://dequeuniversity.com/rules/axe/4.8/link-name?application=axeAPI",
    },
    "landmark-one-main": {
      message:
        "The page should contain one <main> landmark. Use <main> to wrap the primary content.",
      wcagLink:
        "https://dequeuniversity.com/rules/axe/4.8/landmark-one-main?application=axeAPI",
    },
    "html-has-lang": {
      message:
        "The <html> tag must have a 'lang' attribute. Add it to define the language (e.g., <html lang=\"en\">).",
      wcagLink:
        "https://dequeuniversity.com/rules/axe/4.8/html-has-lang?application=axeAPI",
    },
    "empty-heading": {
      message:
        "Avoid empty heading tags. All heading elements (<h1> to <h6>) should include descriptive text.",
      wcagLink:
        "https://dequeuniversity.com/rules/axe/4.8/empty-heading?application=axeAPI",
    },
    "table-headers": {
      message:
        "Ensure all <th> elements have descriptive text and are properly associated with table content.",
      wcagLink:
        "https://dequeuniversity.com/rules/axe/4.8/table-headers?application=axeAPI",
    },
    "aria-progressbar-name": {
      message:
        "ARIA progressbar elements must have an accessible name. Use aria-label or a visible label.",
      wcagLink:
        "https://dequeuniversity.com/rules/axe/4.8/aria-progressbar-name?application=axeAPI",
    },
    list: {
      message:
        "List item elements (<li>) must be within a parent <ul> or <ol>.",
      wcagLink:
        "https://dequeuniversity.com/rules/axe/4.8/list?application=axeAPI",
    },
    listitem: {
      message:
        "List items must be properly placed inside <ul> or <ol> elements.",
      wcagLink:
        "https://dequeuniversity.com/rules/axe/4.8/listitem?application=axeAPI",
    },
    "aria-prohibited-attr": {
      message:
        "An ARIA attribute is used on an element that does not support it. Remove or replace the ARIA attribute.",
      wcagLink:
        "https://dequeuniversity.com/rules/axe/4.8/aria-prohibited-attr?application=axeAPI",
    },
    "frame-title": {
      message:
        "Inline frames (<iframe>) must have a non-empty title attribute that describes the content or purpose of the frame.",
      wcagLink:
        "https://dequeuniversity.com/rules/axe/4.8/frame-title?application=axeAPI",
    },
    "button-name": {
      message:
        "Buttons must have discernible text to indicate their purpose. Add visible text or aria-label to buttons.",
      wcagLink:
        "https://dequeuniversity.com/rules/axe/4.8/button-name?application=axeAPI",
    },
    "form-field-multiple-labels": {
      message:
        "Form fields should not have multiple label elements. Ensure that each input is associated with only one label.",
      wcagLink:
        "https://dequeuniversity.com/rules/axe/4.8/form-field-multiple-labels?application=axeAPI",
    },
    "html-dup-id": {
      message:
        "Each HTML element must have a unique ID. Duplicate IDs can cause confusion for assistive technologies.",
      wcagLink:
        "https://dequeuniversity.com/rules/axe/4.8/html-dup-id?application=axeAPI",
    },
    "aria-hidden-focus": {
      message:
        "Elements that can receive focus must not be hidden from assistive technologies using aria-hidden='true'.",
      wcagLink:
        "https://dequeuniversity.com/rules/axe/4.8/aria-hidden-focus?application=axeAPI",
    },
    "aria-input-field-name": {
      message:
        "ARIA input fields must have an accessible name. Use aria-label or aria-labelledby to provide one.",
      wcagLink:
        "https://dequeuniversity.com/rules/axe/4.8/aria-input-field-name?application=axeAPI",
    },
    "label-title-only": {
      message:
        "Do not use only the title attribute to label form fields. Use a <label> or aria-label instead.",
      wcagLink:
        "https://dequeuniversity.com/rules/axe/4.8/label-title-only?application=axeAPI",
    },
    "duplicate-id": {
      message:
        "Each ID must be unique within the HTML document. Remove or rename duplicate IDs.",
      wcagLink:
        "https://dequeuniversity.com/rules/axe/4.8/duplicate-id?application=axeAPI",
    },
    "skip-link": {
      message:
        "Provide a skip link to allow users to jump directly to the main content of the page.",
      wcagLink:
        "https://dequeuniversity.com/rules/axe/4.8/skip-link?application=axeAPI",
    },
    "label-content-name-mismatch": {
      message:
        "The visible label and the accessible name do not match. Ensure consistency to avoid confusion.",
      wcagLink:
        "https://dequeuniversity.com/rules/axe/4.8/label-content-name-mismatch?application=axeAPI",
    },
    "link-in-text-block": {
      message:
        "Links inside large blocks of text should be separated for clarity and better navigation.",
      wcagLink:
        "https://dequeuniversity.com/rules/axe/4.8/link-in-text-block?application=axeAPI",
    },
    "document-title": {
      message:
        "The document must have a <title> element that describes the page's purpose.",
      wcagLink:
        "https://dequeuniversity.com/rules/axe/4.8/document-title?application=axeAPI",
    },
    "aria-valid-attr-value": {
      message:
        "One or more ARIA attributes have invalid values. Correct them based on WAI-ARIA specifications.",
      wcagLink:
        "https://dequeuniversity.com/rules/axe/4.8/aria-valid-attr-value?application=axeAPI",
    },

    "th-has-visible-text": {
      message:
        "Table headers (<th>) must contain visible and descriptive text to help users understand the table structure.",
      wcagLink:
        "https://dequeuniversity.com/rules/axe/4.8/th-has-visible-text?application=axeAPI",
    },

    "aria-required-children": {
      message:
        "An element with a specific ARIA role requires certain child elements. Add the required child roles.",
      wcagLink:
        "https://dequeuniversity.com/rules/axe/4.8/aria-required-children?application=axeAPI",
    },

"meta-viewport": {
  message:
    "The <meta name='viewport'> tag should not prevent users from zooming. Avoid using 'maximum-scale=1' or 'user-scalable=no'.",
  wcagLink:
    "https://dequeuniversity.com/rules/axe/4.8/meta-viewport?application=axeAPI",
},

"landmark-main-is-top-level": {
  message:
    "The <main> element must be at the top level of the page's structure. Avoid nesting it inside other elements like <div>.",
  wcagLink:
    "https://dequeuniversity.com/rules/axe/4.8/landmark-main-is-top-level?application=axeAPI",
},


  };

  return (
    fixes[violationId] || {
      message:
        "No specific suggestion found. Refer to WCAG guidelines for more information.",
      wcagLink: "https://dequeuniversity.com/rules/axe/4.8?application=axeAPI",
    }
  );
}

module.exports = { getSuggestedFix };
