import {
  DEFAULT_FAQ_HEADING,
  FAQ_SCRIPT,
  FAQ_STYLE,
  FAQ_STYLE_ARN,
  SEO_CONTENT_TEMPLATE_TYPES,
} from "./seoContentTemplates";

export const escapeHtml = (str = "") =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const decodeHtml = (str = "") =>
  str
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

export const normalizeWhitespace = (s = "") =>
  s
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

export const isLikelyHtml = (input = "") => /<\/?[a-z][\s\S]*>/i.test(input);

export const isLikelySeoFooterHtml = (input = "") =>
  /seo-wrapper|seo-title|seo-text|<section|<p|aria-level|role=["']heading["']/i.test(
    input,
  );

export const createBlock = (type, content = "") => ({
  id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  type,
  content,
});

export const buildAriaLabelFromBlocks = (blocks = []) => {
  const firstTitle =
    blocks.find((b) => b.type === "title")?.content?.trim() || "Footer Content";
  return `Seo Footer ${firstTitle}`;
};

export const buildHrefByType = (type, value) => {
  const safeValue = (value || "").trim();

  if (type === "category") {
    return `$url('Search-Show', 'cgid', '${safeValue}')$`;
  }

  if (type === "product") {
    return `$url('Product-Show', 'pid', '${safeValue}')$`;
  }

  if (type === "asset") {
    return `$url('Page-Show', 'cid', '${safeValue}')$`;
  }

  return safeValue;
};

export const detectLinkTypeFromHref = (href = "") => {
  if (href.includes("$url('Search-Show'") && href.includes("'cgid'")) {
    return "category";
  }

  if (href.includes("$url('Product-Show'") && href.includes("'pid'")) {
    return "product";
  }

  if (href.includes("$url('Page-Show'") && href.includes("'cid'")) {
    return "asset";
  }

  return "url";
};

export const extractValueFromHref = (href = "", type = "url") => {
  if (type === "category") {
    const match = href.match(/'cgid',\s*'([^']+)'/);
    return match?.[1] || "";
  }

  if (type === "product") {
    const match = href.match(/'pid',\s*'([^']+)'/);
    return match?.[1] || "";
  }

  if (type === "asset") {
    const match = href.match(/'cid',\s*'([^']+)'/);
    return match?.[1] || "";
  }

  return href;
};

export const toReadableText = (s = "") =>
  s
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (m) => m.toUpperCase());

export const suggestAriaLabel = (type, selectedText = "", value = "") => {
  const baseText = value?.trim() ? value : selectedText;
  const pretty = toReadableText(baseText);

  if (type === "category") return `Shop ${pretty}`;
  if (type === "product") return `View ${pretty}`;
  if (type === "asset") return `View ${pretty}`;
  return `Open ${pretty}`;
};

export const sanitizeParagraphHtml = (html = "") => {
  if (typeof window === "undefined") return html;

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");
  const root = doc.body.firstChild;

  if (!root) return "";

  const walk = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || "";
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return "";
    }

    const tag = node.tagName.toLowerCase();

    if (tag === "a") {
      const href = node.getAttribute("href") || "";
      const ariaLabel = node.getAttribute("aria-label") || "";
      const text = node.textContent || "";

      return `<a href="${href}" aria-label="${ariaLabel}" class="seo-link-underline">${text}</a>`;
    }

    if (tag === "br") {
      return "<br />";
    }

    return Array.from(node.childNodes).map(walk).join("");
  };

  return Array.from(root.childNodes).map(walk).join("").trim();
};

export const detectSeoFromPlainText = (input = "") => {
  const cleaned = normalizeWhitespace(input);
  if (!cleaned) return [];

  const groups = cleaned.split(/\n\s*\n/).filter(Boolean);
  const blocks = [];

  for (let i = 0; i < groups.length; i++) {
    const blockText = groups[i].trim();
    const lines = blockText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 1) {
      const one = lines[0];

      if (one.length <= 90 && i < groups.length - 1) {
        blocks.push(createBlock("title", escapeHtml(one)));
      } else {
        blocks.push(createBlock("paragraph", escapeHtml(one)));
      }
      continue;
    }

    const first = lines[0];
    const rest = lines.slice(1).join(" ").trim();

    if (first.length <= 90) {
      blocks.push(createBlock("title", escapeHtml(first)));
      if (rest) blocks.push(createBlock("paragraph", escapeHtml(rest)));
    } else {
      blocks.push(createBlock("paragraph", escapeHtml(lines.join(" ").trim())));
    }
  }

  return blocks;
};

export const detectSeoFromHtml = (input = "") => {
  if (typeof window === "undefined") return [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(input, "text/html");
  const blocks = [];

  const section =
    doc.querySelector(".seo-wrapper") ||
    doc.querySelector("section") ||
    doc.body;

  const children = Array.from(section.children || []);

  children.forEach((el) => {
    const className = el.className || "";
    const tag = el.tagName?.toLowerCase();
    const textContent = (el.textContent || "").trim();
    if (!textContent) return;

    const isTitle =
      className.includes("seo-title") ||
      tag === "h1" ||
      tag === "h2" ||
      tag === "h3" ||
      el.getAttribute("role") === "heading" ||
      (tag === "p" && textContent.length <= 90 && !el.querySelector("a"));

    if (isTitle) {
      blocks.push(createBlock("title", escapeHtml(textContent)));
    } else {
      blocks.push(createBlock("paragraph", el.innerHTML.trim()));
    }
  });

  if (blocks.length === 0) {
    return detectSeoFromPlainText(doc.body.textContent || "");
  }

  return blocks;
};
export const buildSeoBlocks = (input = "", richHtml = "") => {
  const plainInput = input || "";
  const htmlInput = richHtml || "";

  if (!plainInput.trim() && !htmlInput.trim()) return [];

  // 1. First priority: HTML pasted directly into Text Tool
  // Example: existing SEO footer code from the website
  if (
    plainInput.trim() &&
    (isLikelyHtml(plainInput) || isLikelySeoFooterHtml(plainInput))
  ) {
    const htmlBlocks = detectSeoFromHtml(plainInput);

    if (htmlBlocks.length) {
      return htmlBlocks;
    }
  }

  // 2. Second priority: rich HTML captured from clipboard
  // Example: ClickUp rich paste
  if (htmlInput.trim() && isLikelyHtml(htmlInput)) {
    const richBlocks = detectSeoFromHtml(htmlInput);

    if (richBlocks.length) {
      return richBlocks;
    }
  }

  // 3. Fallback: plain text detection
  return detectSeoFromPlainText(plainInput);
};

export const buildSeoDocument = (input = "", richHtml = "") => {
  const plainInput = input || "";
  const htmlInput = richHtml || "";

  const sourceHtml =
    plainInput.trim() && isLikelyHtml(plainInput)
      ? plainInput
      : htmlInput.trim() && isLikelyHtml(htmlInput)
        ? htmlInput
        : "";

  if (sourceHtml && isLikelyFaqHtml(sourceHtml)) {
    const faqDocument = detectFaqFromHtml(sourceHtml);

    if (faqDocument.blocks.length > 0) {
      return {
        blocks: faqDocument.blocks,
        templateType: SEO_CONTENT_TEMPLATE_TYPES.FAQ,
        templateSettings: {
          heading: faqDocument.heading,
          faqBrand: faqDocument.faqBrand || "bt",
        },
      };
    }
  }

  const blocks = buildSeoBlocks(plainInput, htmlInput);

  return {
    blocks,
    templateType: SEO_CONTENT_TEMPLATE_TYPES.SEO_FOOTER,
    templateSettings: {},
  };
};

export const isLikelyFaqHtml = (input = "") =>
  /class=["'][^"']*\baccordion\b[^"']*["']|class=["'][^"']*\baccordion__panel\b[^"']*["']|class=["'][^"']*\btab-label\b[^"']*["']/i.test(
    input,
  ) &&
  /<details\b/i.test(input) &&
  /<summary\b/i.test(input);

export const detectFaqFromHtml = (input = "") => {
  if (typeof window === "undefined") {
    return {
      blocks: [],
      heading: "",
    };
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(input, "text/html");

  const faqSection =
    doc.querySelector("section.sections-content") ||
    doc.querySelector("section[aria-labelledby]") ||
    doc.querySelector("section");

  const accordion =
    faqSection?.querySelector(".accordion") || doc.querySelector(".accordion");

  if (!accordion) {
    return {
      blocks: [],
      heading: "",
    };
  }

  const headingElement =
    faqSection?.querySelector("#faq-heading") ||
    faqSection?.querySelector(":scope > h1, :scope > h2, :scope > h3") ||
    null;

  const heading = (headingElement?.textContent || "").trim();

  const faqBrand = doc.querySelector(".arn-tab-label") ? "arn" : "bt";

  const blocks = [];

  accordion.querySelectorAll("details").forEach((details) => {
    const summary = details.querySelector("summary");

    const questionElement =
      summary?.querySelector("h1, h2, h3, h4, h5, h6") || summary;

    const question = (questionElement?.textContent || "").trim();

    if (!question) return;

    blocks.push(createBlock("title", escapeHtml(question)));

    const panel =
      details.querySelector(".accordion__panel") ||
      Array.from(details.children).find(
        (child) => child.tagName?.toLowerCase() !== "summary",
      );

    if (!panel) {
      blocks.push(createBlock("paragraph", ""));
      return;
    }

    const paragraphs = Array.from(panel.querySelectorAll(":scope > p"));

    if (paragraphs.length > 0) {
      paragraphs.forEach((paragraph) => {
        blocks.push(createBlock("paragraph", paragraph.innerHTML.trim()));
      });

      return;
    }

    const fallbackContent = panel.innerHTML.trim();

    if (fallbackContent) {
      blocks.push(createBlock("paragraph", fallbackContent));
    } else {
      blocks.push(createBlock("paragraph", ""));
    }
  });

  return {
    blocks,
    heading,
    faqBrand,
  };
};

export const generateSeoHtml = (blocks = []) => {
  if (!blocks.length) return "";

  const normalizedBlocks = blocks.map((b) => ({
    ...b,
    content: b.type === "title" ? decodeHtml(b.content) : decodeHtml(b.content),
  }));

  const ariaLabel = buildAriaLabelFromBlocks(normalizedBlocks);

  const html = [
    `<section class="seo-wrapper" aria-label="${escapeHtml(ariaLabel)}">`,
    ...normalizedBlocks.map((block) => {
      if (block.type === "title") {
        return `    <p role="heading" aria-level="2" class="seo-title">${block.content}</p>`;
      }

      return `    <p class="seo-text">${sanitizeParagraphHtml(block.content)}</p>`;
    }),
    `</section>`,
  ];

  return html.join("\n");
};

const groupBlocksIntoFaqItems = (blocks = []) => {
  const items = [];
  let currentItem = null;

  blocks.forEach((block) => {
    if (block.type === "title") {
      const title = decodeHtml(block.content || "").trim();

      if (!title) {
        currentItem = null;
        return;
      }

      currentItem = {
        title,
        paragraphs: [],
      };

      items.push(currentItem);
      return;
    }

    if (block.type === "paragraph" && currentItem) {
      const paragraph = sanitizeParagraphHtml(
        decodeHtml(block.content || ""),
      ).trim();

      if (paragraph) {
        currentItem.paragraphs.push(paragraph);
      }
    }
  });

  return items;
};

export const generateFaqHtml = (blocks = [], settings = {}) => {
  if (!blocks.length) return "";

  const faqItems = groupBlocksIntoFaqItems(blocks);

  if (!faqItems.length) return "";

  const heading =
    typeof settings.heading === "string"
      ? settings.heading.trim()
      : DEFAULT_FAQ_HEADING;

  const isArnotts = settings.faqBrand === "arn";

  const faqStyle = isArnotts ? FAQ_STYLE_ARN : FAQ_STYLE;

  const summaryClass = isArnotts ? "arn-tab-label" : "tab-label";

  const faqItemsHtml = faqItems
    .map((item) => {
      const paragraphsHtml =
        item.paragraphs.length > 0
          ? item.paragraphs
              .map((paragraph) => `        <p>${paragraph}</p>`)
              .join("\n")
          : "        <p></p>";

      return [
        `    <details class="tab">`,
        `      <summary class="${summaryClass}"><h5>${escapeHtml(item.title)}</h5></summary>`,
        `      <div class="accordion__panel">`,
        paragraphsHtml,
        `      </div>`,
        `    </details>`,
      ].join("\n");
    })
    .join("\n");

  const sectionAttributes = heading
    ? ` class="sections-content" aria-labelledby="faq-heading"`
    : ` class="sections-content"`;

  const sectionLines = [`<section${sectionAttributes}>`];

  if (heading) {
    sectionLines.push(
      `  <h2 id="faq-heading" style="margin-bottom:60px;text-align:center;text-transform:uppercase;">`,
      `    ${escapeHtml(heading)}`,
      `  </h2>`,
    );
  }

  sectionLines.push(
    `  <div class="accordion">`,
    faqItemsHtml,
    `  </div>`,
    `</section>`,
  );

  const sectionHtml = sectionLines.join("\n");

  return [faqStyle, sectionHtml, FAQ_SCRIPT].join("\n\n");
};

export const generateSeoContentHtml = (
  blocks = [],
  templateType = SEO_CONTENT_TEMPLATE_TYPES.SEO_FOOTER,
  templateSettings = {},
) => {
  switch (templateType) {
    case SEO_CONTENT_TEMPLATE_TYPES.FAQ:
      return generateFaqHtml(blocks, templateSettings);

    case SEO_CONTENT_TEMPLATE_TYPES.SEO_FOOTER:
    default:
      return generateSeoHtml(blocks);
  }
};
