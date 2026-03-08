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

export const buildSeoBlocks = (input = "") => {
  if (!input.trim()) return [];

  if (isLikelyHtml(input) || isLikelySeoFooterHtml(input)) {
    return detectSeoFromHtml(input);
  }

  return detectSeoFromPlainText(input);
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
