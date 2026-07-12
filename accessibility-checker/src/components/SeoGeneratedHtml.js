"use client";

import { useMemo, useState } from "react";
import { CheckCircle, Copy, FileCode2 } from "lucide-react";

import {
  SEO_CONTENT_TEMPLATE_OPTIONS,
  SEO_CONTENT_TEMPLATE_TYPES,
} from "./seoContentTemplates";

import { generateSeoContentHtml } from "./seoFooterUtils";

export default function SeoGeneratedHtml({
  seoBlocks = [],
  seoHtml = "",
  selectedTemplate,
  setSelectedTemplate,
  templateSettings,
  setTemplateSettings,
}) {
  const [copied, setCopied] = useState(false);

  // const [selectedTemplate, setSelectedTemplate] = useState(
  //   SEO_CONTENT_TEMPLATE_TYPES.SEO_FOOTER,
  // );

  // const [faqSettings, setFaqSettings] = useState({
  //   ...DEFAULT_FAQ_SETTINGS,
  // });

  const selectedTemplateOption =
    SEO_CONTENT_TEMPLATE_OPTIONS.find(
      (option) => option.id === selectedTemplate,
    ) || SEO_CONTENT_TEMPLATE_OPTIONS[0];

  const generatedHtml = useMemo(() => {
    /*
     * Once the blocks are available, generation will be performed
     * dynamically for any selected template.
     */
    if (seoBlocks.length > 0) {
      return generateSeoContentHtml(
        seoBlocks,
        selectedTemplate,
        templateSettings,
      );
    }

    /*
     * Temporary fallback to maintain compatibility with the current
     * implementation, which still sends only the seoHtml property.
     */
    if (selectedTemplate === SEO_CONTENT_TEMPLATE_TYPES.SEO_FOOTER) {
      return seoHtml;
    }

    return "";
 }, [seoBlocks, seoHtml, selectedTemplate, templateSettings]);

  const selectTemplate = (templateId) => {
    setSelectedTemplate(templateId);
    setCopied(false);
  };

  const copyHtml = async () => {
    if (!generatedHtml) return;

    try {
      await navigator.clipboard.writeText(generatedHtml);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error("Copy failed", error);
    }
  };

  return (
    <div className="bg-gray-50 border rounded-xl p-4 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-teal-700" />

            <h3 className="font-semibold text-gray-900 text-lg">
              {selectedTemplateOption.generatedTitle}
            </h3>
          </div>

          <p className="mt-1 text-sm text-gray-600">
            Select the content format you want to generate and copy.
          </p>
        </div>

        <button
          type="button"
          onClick={copyHtml}
          disabled={!generatedHtml}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-teal-600 text-teal-700 rounded-md hover:bg-teal-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {copied ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-600" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy HTML
            </>
          )}
        </button>
      </div>

      {/* Template selector */}
      <div
        className="inline-flex flex-wrap gap-1 rounded-lg border border-gray-300 bg-white p-1 mb-4"
        role="group"
        aria-label="Generated content template"
      >
        {SEO_CONTENT_TEMPLATE_OPTIONS.map((option) => {
          const isSelected = selectedTemplate === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => selectTemplate(option.id)}
              aria-pressed={isSelected}
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                isSelected
                  ? "bg-teal-700 text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {selectedTemplate === SEO_CONTENT_TEMPLATE_TYPES.FAQ && (
        <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4">
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-gray-900">
              FAQ Settings
            </h4>

            <p className="mt-1 text-xs text-gray-500">
              Leave the heading empty to remove it from the generated HTML.
            </p>
          </div>

          <label
            htmlFor="faq-heading"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            FAQ Heading
          </label>

          <input
            id="faq-heading"
            type="text"
            value={templateSettings.heading}
            onChange={(event) =>
              setTemplateSettings((currentSettings) => ({
                ...currentSettings,
                heading: event.target.value,
              }))
            }
            placeholder="Frequently Asked Questions"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          />
        </div>
      )}

      {/* HTML Preview */}
      <pre className="text-sm whitespace-pre-wrap break-words bg-white p-4 rounded-lg border overflow-auto min-h-[220px] max-h-[620px] leading-relaxed">
        {generatedHtml || selectedTemplateOption.emptyMessage}
      </pre>
    </div>
  );
}
