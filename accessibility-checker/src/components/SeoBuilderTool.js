"use client";

import { useMemo, useState } from "react";

import SeoFooterEditor from "./SeoFooterEditor";
import {
  DEFAULT_FAQ_SETTINGS,
  SEO_CONTENT_TEMPLATE_TYPES,
} from "./seoContentTemplates";

import {
  buildSeoDocument,
  createBlock,
  generateSeoHtml,
} from "./seoFooterUtils";

export default function SeoBuilderTool() {
  const [text, setText] = useState("");
  const [richHtml, setRichHtml] = useState("");
  const [seoMode, setSeoMode] = useState(false);
  const [seoBlocks, setSeoBlocks] = useState([]);
  const [detectedTemplateLabel, setDetectedTemplateLabel] = useState("");

  const [seoTemplate, setSeoTemplate] = useState(
    SEO_CONTENT_TEMPLATE_TYPES.SEO_FOOTER,
  );

  const [seoTemplateSettings, setSeoTemplateSettings] = useState({
    ...DEFAULT_FAQ_SETTINGS,
  });

  const handlePaste = (e) => {
    const html = e.clipboardData?.getData("text/html") || "";
    const plain = e.clipboardData?.getData("text/plain") || "";

    if (html && plain) {
      setRichHtml(html);
    }
  };

  const activateSeoMode = () => {
    if (!text.trim()) {
      setSeoBlocks([createBlock("title", ""), createBlock("paragraph", "")]);

      setSeoTemplate(SEO_CONTENT_TEMPLATE_TYPES.SEO_FOOTER);

      setSeoTemplateSettings({
        ...DEFAULT_FAQ_SETTINGS,
      });

      setDetectedTemplateLabel("");
      setSeoMode(true);
      return;
    }

    const document = buildSeoDocument(text, richHtml);

    setSeoBlocks(document.blocks);
    setSeoTemplate(document.templateType);

    setSeoTemplateSettings({
      ...DEFAULT_FAQ_SETTINGS,
      ...document.templateSettings,
    });

    const detectedLabel =
      document.templateType === SEO_CONTENT_TEMPLATE_TYPES.FAQ
        ? "FAQ"
        : "SEO Footer";

    setDetectedTemplateLabel(detectedLabel);
    setSeoMode(true);
  };

  const exitSeoMode = () => {
    setSeoMode(false);
    setSeoBlocks([]);
    setDetectedTemplateLabel("");
  };

  const seoHtml = useMemo(() => generateSeoHtml(seoBlocks), [seoBlocks]);
  if (seoMode) {
    return (
      <div className="p-6 max-w-6xl mx-auto bg-white rounded-lg shadow-md">
        <SeoFooterEditor
          seoBlocks={seoBlocks}
          setSeoBlocks={setSeoBlocks}
          seoHtml={seoHtml}
          selectedTemplate={seoTemplate}
          setSelectedTemplate={setSeoTemplate}
          templateSettings={seoTemplateSettings}
          setTemplateSettings={setSeoTemplateSettings}
          detectedTemplateLabel={detectedTemplateLabel}
          onBack={exitSeoMode}
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-lg shadow-md">
      {/* <h2 className="text-2xl font-semibold text-gray-900 mb-2">
        SEO Builder Tool
      </h2> */}

      <p className="text-sm text-gray-600 mb-4">
        Paste existing SEO content below, or leave it empty to start a new one.
      </p>

      <textarea
        rows={8}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onPaste={handlePaste}
        className="w-full p-3 border rounded text-sm shadow mb-4 outline-none"
        placeholder="Paste existing HTML or content here..."
        aria-label="SEO Builder content"
      />

      <button
        type="button"
        onClick={activateSeoMode}
        className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm rounded-md shadow hover:bg-teal-700 transition"
      >
        Start SEO Builder Tool
      </button>
    </div>
  );
}
