"use client";

import { useMemo, useRef, useState } from "react";
import { PencilLine } from "lucide-react";

import {
  isConvertibleBrandUrl,
  suggestContentLinkFromUrl,
} from "@/utils/seo-footer/seoFooterLinkConversion";

import SeoBlockCard from "./SeoBlockCard";
import SeoLinkTypeModal from "./SeoLinkTypeModal";
import SeoLinkFormModal from "./SeoLinkFormModal";
import SeoGeneratedHtml from "./SeoGeneratedHtml";

import {
  createBlock,
  decodeHtml,
  buildHrefByType,
  detectLinkTypeFromHref,
  extractValueFromHref,
  suggestAriaLabel,
} from "./seoFooterUtils";

export default function SeoFooterEditor({
  seoBlocks,
  setSeoBlocks,
  seoHtml,
  onBack,
  onAnnounce,
}) {
  const paragraphRefs = useRef({});

  const [linkTypeModalOpen, setLinkTypeModalOpen] = useState(false);
  const [linkFormModalOpen, setLinkFormModalOpen] = useState(false);
  const [linkMode, setLinkMode] = useState("insert");

  const [editTarget, setEditTarget] = useState({
    blockId: null,
    originalHref: "",
    originalText: "",
    originalAriaLabel: "",
  });

  const [linkContext, setLinkContext] = useState({
    blockId: null,
    selectedText: "",
  });

  const [selectionData, setSelectionData] = useState({
    blockId: null,
    start: null,
    end: null,
    text: "",
  });

  const [linkForm, setLinkForm] = useState({
    type: "category",
    value: "",
    ariaLabel: "",
    selectedText: "",
    blockId: null,
  });

  const [hoverTooltip, setHoverTooltip] = useState({
    open: false,
    x: 0,
    y: 0,
    type: "",
    value: "",
    ariaLabel: "",
  });

  const [conversionModal, setConversionModal] = useState({
    open: false,
    blockId: null,
    originalUrl: "",
    suggestedHref: "",
    linkText: "",
  });

  const compactActionBtn =
    "inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-gray-300 text-gray-700 text-xs rounded-md hover:bg-gray-100 transition";

  const closeAllLinkUi = () => {
    setLinkTypeModalOpen(false);
    setLinkFormModalOpen(false);
    setEditTarget({
      blockId: null,
      originalHref: "",
      originalText: "",
      originalAriaLabel: "",
    });
    setHoverTooltip({
      open: false,
      x: 0,
      y: 0,
      type: "",
      value: "",
      ariaLabel: "",
    });

    setConversionModal({
      open: false,
      blockId: null,
      originalUrl: "",
      suggestedHref: "",
      linkText: "",
    });

    setLinkContext({
      blockId: null,
      selectedText: "",
    });
    setSelectionData({
      blockId: null,
      start: null,
      end: null,
      text: "",
    });

    try {
      window.getSelection()?.removeAllRanges();
    } catch {}
  };

  const updateSeoBlock = (id, value) => {
    setSeoBlocks((prev) =>
      prev.map((block) =>
        block.id === id ? { ...block, content: value } : block,
      ),
    );
  };

  const convertBlockType = (id, nextType) => {
    setSeoBlocks((prev) =>
      prev.map((block) =>
        block.id === id ? { ...block, type: nextType } : block,
      ),
    );
    onAnnounce?.(`Converted to ${nextType}`);
  };

  const moveBlock = (index, direction) => {
    setSeoBlocks((prev) => {
      const next = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;

      if (target < 0 || target >= next.length) return prev;

      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const addBlock = (type = "paragraph") => {
    setSeoBlocks((prev) => [...prev, createBlock(type, "")]);
    onAnnounce?.(`${type === "title" ? "Title" : "Paragraph"} block added`);
  };

  const removeBlock = (id) => {
    setSeoBlocks((prev) => prev.filter((block) => block.id !== id));
    onAnnounce?.("Block removed");
  };

  const syncParagraphHtmlFromDom = (blockId) => {
    const el = paragraphRefs.current[blockId];
    if (!el) return;
    updateSeoBlock(blockId, el.innerHTML);
  };

  const normalizePastedClickUpHtml = (html) => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;

    wrapper.querySelectorAll("*").forEach((el) => {
      if (el.tagName.toLowerCase() === "a") {
        const href = el.getAttribute("href") || "";
        const text = el.textContent || "";

        el.setAttribute("href", href);
        el.setAttribute("aria-label", `View ${text.trim()}`);
        if (isConvertibleBrandUrl(href)) {
          const suggestion = suggestContentLinkFromUrl(href);

          el.setAttribute("class", "seo-link-underline seo-link-warning");
          el.setAttribute("data-needs-conversion", "true");
          el.setAttribute("data-original-url", href);
          el.setAttribute("data-suggested-href", suggestion.suggestedHref);
          el.setAttribute("data-conversion-source", suggestion.source);
        } else {
          el.setAttribute("class", "seo-link-underline");
          el.setAttribute("data-needs-conversion", "false");
        }
        el.setAttribute("data-link-type", detectLinkTypeFromHref(href));
        el.setAttribute(
          "data-link-value",
          extractValueFromHref(href, detectLinkTypeFromHref(href)),
        );

        return;
      }

      el.replaceWith(document.createTextNode(el.textContent || ""));
    });

    return wrapper.innerHTML;
  };

  const handleParagraphPaste = (event, blockId) => {
    const html = event.clipboardData.getData("text/html");
    const plainText = event.clipboardData.getData("text/plain");

    if (!html) {
      return;
    }

    event.preventDefault();

    const normalizedHtml = normalizePastedClickUpHtml(html);
    const currentBlock = seoBlocks.find((block) => block.id === blockId);

    const nextHtml = currentBlock?.content
      ? `${currentBlock.content} ${normalizedHtml}`
      : normalizedHtml || plainText;

    updateSeoBlock(blockId, nextHtml);

    onAnnounce?.("Pasted content with embedded links detected");
  };

  const selectionBelongsToBlock = (range, blockId) => {
    const container = paragraphRefs.current[blockId];
    if (!container) return false;

    return (
      container.contains(range.startContainer) &&
      container.contains(range.endContainer)
    );
  };

  const getTextOffsetWithin = (container, targetNode, targetOffset) => {
    let offset = 0;

    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      null,
    );

    let currentNode = walker.nextNode();

    while (currentNode) {
      if (currentNode === targetNode) {
        return offset + targetOffset;
      }

      offset += currentNode.textContent?.length || 0;
      currentNode = walker.nextNode();
    }

    return offset;
  };

  const getSelectionOffsetsInBlock = (range, blockId) => {
    const container = paragraphRefs.current[blockId];
    if (!container) return null;

    const start = getTextOffsetWithin(
      container,
      range.startContainer,
      range.startOffset,
    );

    const end = getTextOffsetWithin(
      container,
      range.endContainer,
      range.endOffset,
    );

    return {
      start: Math.min(start, end),
      end: Math.max(start, end),
      text: range.toString(),
    };
  };

  const buildLinkedHtmlFromOffsets = ({
    html,
    start,
    end,
    href,
    ariaLabel,
    type,
    value,
  }) => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;

    let currentOffset = 0;
    let startNode = null;
    let endNode = null;
    let startNodeOffset = 0;
    let endNodeOffset = 0;

    const walker = document.createTreeWalker(
      wrapper,
      NodeFilter.SHOW_TEXT,
      null,
    );
    let node = walker.nextNode();

    while (node) {
      const len = node.textContent?.length || 0;
      const nextOffset = currentOffset + len;

      if (!startNode && start >= currentOffset && start <= nextOffset) {
        startNode = node;
        startNodeOffset = start - currentOffset;
      }

      if (!endNode && end >= currentOffset && end <= nextOffset) {
        endNode = node;
        endNodeOffset = end - currentOffset;
        break;
      }

      currentOffset = nextOffset;
      node = walker.nextNode();
    }

    if (!startNode || !endNode) return html;

    const range = document.createRange();
    range.setStart(startNode, startNodeOffset);
    range.setEnd(endNode, endNodeOffset);

    const selectedText = range.toString();
    if (!selectedText.trim()) return html;

    const anchor = document.createElement("a");
    anchor.setAttribute("href", href);
    anchor.setAttribute("aria-label", ariaLabel);
    anchor.setAttribute("class", "seo-link-underline");
    anchor.setAttribute("data-link-type", type);
    anchor.setAttribute("data-link-value", value);
    anchor.textContent = selectedText;

    range.deleteContents();
    range.insertNode(anchor);

    return wrapper.innerHTML;
  };

  const updateExistingLinkInHtml = ({
    html,
    originalHref,
    originalText,
    originalAriaLabel,
    nextHref,
    nextAriaLabel,
    nextType,
    nextValue,
  }) => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;

    const anchors = Array.from(wrapper.querySelectorAll("a"));

    const target = anchors.find((a) => {
      const href = a.getAttribute("href") || "";
      const text = a.textContent || "";
      const aria = a.getAttribute("aria-label") || "";

      return (
        href === originalHref &&
        text === originalText &&
        aria === originalAriaLabel
      );
    });

    if (!target) return html;

    target.setAttribute("href", nextHref);
    target.setAttribute("aria-label", nextAriaLabel);
    target.setAttribute("class", "seo-link-underline");
    target.setAttribute("data-link-type", nextType);
    const cgidMatch = suggestedHref.match(/'cgid',\s*'([^']+)'/);
    const categoryId = cgidMatch?.[1] || "";

    target.setAttribute("data-link-value", categoryId);

    return wrapper.innerHTML;
  };

  const removeExistingLinkFromHtml = ({
    html,
    originalHref,
    originalText,
    originalAriaLabel,
  }) => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;

    const anchors = Array.from(wrapper.querySelectorAll("a"));

    const target = anchors.find((a) => {
      const href = a.getAttribute("href") || "";
      const text = a.textContent || "";
      const aria = a.getAttribute("aria-label") || "";

      return (
        href === originalHref &&
        text === originalText &&
        aria === originalAriaLabel
      );
    });

    if (!target) return html;

    const textNode = document.createTextNode(target.textContent || "");
    target.replaceWith(textNode);

    return wrapper.innerHTML;
  };

  const handleParagraphSelection = (_event, blockId) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (!selectionBelongsToBlock(range, blockId)) return;
    if (range.collapsed) return;

    const selectedText = range.toString().trim();
    if (!selectedText) return;

    const startAnchor =
      range.startContainer?.nodeType === Node.ELEMENT_NODE
        ? range.startContainer.closest?.("a")
        : range.startContainer?.parentElement?.closest?.("a");

    const endAnchor =
      range.endContainer?.nodeType === Node.ELEMENT_NODE
        ? range.endContainer.closest?.("a")
        : range.endContainer?.parentElement?.closest?.("a");

    if (startAnchor || endAnchor) return;

    const offsets = getSelectionOffsetsInBlock(range, blockId);
    if (!offsets) return;

    setEditTarget({
      blockId: null,
      originalHref: "",
      originalText: "",
      originalAriaLabel: "",
    });

    setSelectionData({
      blockId,
      start: offsets.start,
      end: offsets.end,
      text: offsets.text,
    });

    setLinkContext({
      blockId,
      selectedText,
    });

    setLinkTypeModalOpen(true);
    setLinkFormModalOpen(false);
  };

  const handleParagraphClick = (event, blockId) => {
    const anchor = event.target.closest("a");
    if (!anchor) return;

    event.preventDefault();
    event.stopPropagation();

    setHoverTooltip({
      open: false,
      x: 0,
      y: 0,
      type: "",
      value: "",
      ariaLabel: "",
    });

    setLinkTypeModalOpen(false);

    const href = anchor.getAttribute("href") || "";
    const needsConversion =
      anchor.getAttribute("data-needs-conversion") === "true";

    if (needsConversion) {
      const originalUrl = anchor.getAttribute("data-original-url") || href;
      const suggestedHref =
        anchor.getAttribute("data-suggested-href") ||
        suggestContentLinkFromUrl(originalUrl).suggestedHref;

      setConversionModal({
        open: true,
        blockId,
        originalUrl,
        suggestedHref,
        linkText: anchor.textContent || "",
      });

      return;
    }
    const type =
      anchor.getAttribute("data-link-type") || detectLinkTypeFromHref(href);
    const value =
      anchor.getAttribute("data-link-value") ||
      extractValueFromHref(href, type);
    const selectedText = anchor.textContent || "";
    const ariaLabel =
      anchor.getAttribute("aria-label") ||
      suggestAriaLabel(type, selectedText, value);

    setEditTarget({
      blockId,
      originalHref: href,
      originalText: selectedText,
      originalAriaLabel: ariaLabel,
    });

    setLinkForm({
      type,
      value,
      ariaLabel,
      selectedText,
      blockId,
    });

    setLinkContext({
      blockId,
      selectedText,
    });

    setSelectionData({
      blockId: null,
      start: null,
      end: null,
      text: "",
    });

    setLinkMode("edit");
    setLinkFormModalOpen(true);
  };
  const closeConversionModal = () => {
    setConversionModal({
      open: false,
      blockId: null,
      originalUrl: "",
      suggestedHref: "",
      linkText: "",
    });
  };

  const confirmContentLinkConversion = () => {
    const { blockId, originalUrl, suggestedHref, linkText } = conversionModal;

    if (!blockId || !originalUrl || !suggestedHref) return;

    const currentBlock = seoBlocks.find((block) => block.id === blockId);
    if (!currentBlock) return;

    const wrapper = document.createElement("div");
    wrapper.innerHTML = currentBlock.content;

    const target = Array.from(wrapper.querySelectorAll("a")).find((a) => {
      return (
        (a.getAttribute("data-original-url") || a.getAttribute("href")) ===
          originalUrl && (a.textContent || "") === linkText
      );
    });

    if (!target) return;

    target.setAttribute("href", suggestedHref);
    target.setAttribute("class", "seo-link-underline");
    target.setAttribute("data-needs-conversion", "false");
    target.setAttribute("data-link-type", "category");
    target.setAttribute("data-link-value", suggestedHref);

    target.removeAttribute("data-suggested-href");
    target.removeAttribute("data-conversion-source");

    updateSeoBlock(blockId, wrapper.innerHTML);
    closeConversionModal();
    onAnnounce?.("Link converted to content link function");
  };

  const openLinkForm = (type) => {
    setLinkForm({
      type,
      value: "",
      ariaLabel: suggestAriaLabel(type, linkContext.selectedText || "", ""),
      selectedText: linkContext.selectedText || "",
      blockId: linkContext.blockId,
    });

    setLinkMode("insert");
    setLinkTypeModalOpen(false);
    setLinkFormModalOpen(true);
  };

  const insertOrUpdateLink = () => {
    const { type, value, ariaLabel, blockId } = linkForm;

    const trimmedValue = value.trim();
    if (!trimmedValue) {
      onAnnounce?.("Add an ID or URL");
      return;
    }

    const href = buildHrefByType(type, trimmedValue);

    if (linkMode === "edit") {
      const currentBlock = seoBlocks.find((b) => b.id === blockId);
      if (!currentBlock) {
        onAnnounce?.("Block not found");
        return;
      }

      const nextHtml = updateExistingLinkInHtml({
        html: currentBlock.content,
        originalHref: editTarget.originalHref,
        originalText: editTarget.originalText,
        originalAriaLabel: editTarget.originalAriaLabel,
        nextHref: href,
        nextAriaLabel: ariaLabel,
        nextType: type,
        nextValue: trimmedValue,
      });

      updateSeoBlock(blockId, nextHtml);
      onAnnounce?.("Link updated");
      closeAllLinkUi();
      return;
    }

    if (
      selectionData.blockId !== blockId ||
      selectionData.start == null ||
      selectionData.end == null
    ) {
      onAnnounce?.("Select text first");
      return;
    }

    const currentBlock = seoBlocks.find((b) => b.id === blockId);
    if (!currentBlock) {
      onAnnounce?.("Block not found");
      return;
    }

    const nextHtml = buildLinkedHtmlFromOffsets({
      html: currentBlock.content,
      start: selectionData.start,
      end: selectionData.end,
      href,
      ariaLabel,
      type,
      value: trimmedValue,
    });

    updateSeoBlock(blockId, nextHtml);
    onAnnounce?.("Link inserted");
    closeAllLinkUi();
  };

  const removeCurrentLink = () => {
    const { blockId } = linkForm;
    if (!blockId) return;

    const currentBlock = seoBlocks.find((b) => b.id === blockId);
    if (!currentBlock) {
      onAnnounce?.("Block not found");
      return;
    }

    const nextHtml = removeExistingLinkFromHtml({
      html: currentBlock.content,
      originalHref: editTarget.originalHref,
      originalText: editTarget.originalText,
      originalAriaLabel: editTarget.originalAriaLabel,
    });

    updateSeoBlock(blockId, nextHtml);
    onAnnounce?.("Link removed");
    closeAllLinkUi();
  };

  const showTooltip = (event) => {
    const anchor = event.target.closest("a");
    if (!anchor) return;

    const type = anchor.getAttribute("data-link-type") || "";
    const value = anchor.getAttribute("data-link-value") || "";
    const ariaLabel = anchor.getAttribute("aria-label") || "";

    setHoverTooltip({
      open: true,
      x: event.clientX + 14,
      y: event.clientY + 14,
      type,
      value,
      ariaLabel,
    });
  };

  const moveTooltip = (event) => {
    setHoverTooltip((prev) =>
      prev.open
        ? {
            ...prev,
            x: event.clientX + 14,
            y: event.clientY + 14,
          }
        : prev,
    );
  };

  const hideTooltip = () => {
    setHoverTooltip({
      open: false,
      x: 0,
      y: 0,
      type: "",
      value: "",
      ariaLabel: "",
    });
  };

  const renderedBlocks = useMemo(() => seoBlocks || [], [seoBlocks]);

  return (
    <div className="space-y-5">
      <style jsx global>{`
        .seo-link-underline {
          color: rgb(13 148 136);
          background: rgba(20, 184, 166, 0.14);
          border-bottom: 2px solid rgba(13, 148, 136, 0.9);
          text-decoration: none;
          padding: 0 3px;
          border-radius: 4px;
          cursor: pointer;
          transition:
            background 0.18s ease,
            border-color 0.18s ease,
            color 0.18s ease,
            box-shadow 0.18s ease;
        }

        .seo-link-underline:hover {
          color: rgb(15 118 110);
          background: rgba(20, 184, 166, 0.22);
          border-bottom-color: rgb(15 118 110);
          box-shadow: inset 0 -1px 0 rgba(15, 118, 110, 0.15);
        }

        .seo-link-underline:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(45, 212, 191, 0.28);
        }

        .seo-link-warning {
          color: rgb(194 65 12);
          background: rgba(251, 146, 60, 0.08);
          border-bottom-color: rgba(234, 88, 12, 0.55);
          position: relative;
          border-bottom-width: 1.5px;
        }

        .seo-link-warning::after {
          content: "!";
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 11px;
          height: 11px;
          margin-left: 3px;
          border-radius: 999px;
          background: rgba(234, 88, 12, 0.75);
          color: white;
          font-size: 8px;
          font-weight: 700;
          line-height: 1;
          vertical-align: super;
          transform: translateY(-1px);
        }

        .seo-link-warning:hover {
          color: rgb(154 52 18);
          background: rgba(251, 146, 60, 0.12);
          border-bottom-color: rgba(194, 65, 12, 0.75);
        }
      `}</style>

      <div className="flex flex-wrap gap-3 justify-between items-start">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            SEO Footer Tool
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Select text inside paragraph blocks to insert links. Hover linked
            text to preview details. Click linked text to edit.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => addBlock("title")}
            className={compactActionBtn}
            title="Add title block"
            type="button"
          >
            + Title
          </button>

          <button
            onClick={() => addBlock("paragraph")}
            className={compactActionBtn}
            title="Add paragraph block"
            type="button"
          >
            + Paragraph
          </button>

          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 border border-blue-500 text-blue-600 text-sm rounded-md hover:bg-blue-100 transition"
            title="Back to text tools"
            type="button"
          >
            Back
          </button>
        </div>
      </div>

      <SeoLinkTypeModal
        isOpen={linkTypeModalOpen}
        onSelectType={openLinkForm}
        onCancel={closeAllLinkUi}
      />

      <SeoLinkFormModal
        isOpen={linkFormModalOpen}
        linkMode={linkMode}
        linkForm={linkForm}
        setLinkForm={setLinkForm}
        onConfirm={insertOrUpdateLink}
        onCancel={closeAllLinkUi}
        onRemove={removeCurrentLink}
        suggestAriaLabel={suggestAriaLabel}
      />

      {conversionModal.open && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Content Link Function Suggested
            </h3>

            <p className="mt-2 text-sm text-gray-600">
              This Brown Thomas/Arnotts URL can be converted into a content link
              function.
            </p>

            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="font-semibold text-gray-700">Original URL</p>
                <p className="mt-1 break-all rounded-lg bg-gray-50 p-2 text-gray-700">
                  {conversionModal.originalUrl}
                </p>
              </div>

              <div>
                <p className="font-semibold text-gray-700">Suggested href</p>
                <p className="mt-1 break-all rounded-lg bg-orange-50 p-2 text-orange-800">
                  {conversionModal.suggestedHref}
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeConversionModal}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
              >
                Keep URL
              </button>

              <button
                type="button"
                onClick={confirmContentLinkConversion}
                className="rounded-md bg-orange-600 px-4 py-2 text-sm text-white hover:bg-orange-700 transition"
              >
                Convert Link
              </button>
            </div>
          </div>
        </div>
      )}

      {hoverTooltip.open && (
        <div
          className="fixed z-[120] max-w-[320px] bg-white border border-gray-200 text-gray-800 text-xs rounded-xl shadow-xl px-3 py-3 pointer-events-none"
          style={{
            left: Math.min(hoverTooltip.x, window.innerWidth - 340),
            top: Math.min(hoverTooltip.y, window.innerHeight - 150),
          }}
        >
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              Linked text
            </span>
            <span className="text-[11px] font-medium text-teal-700">
              Click text to edit
            </span>
          </div>

          <div className="space-y-1.5">
            <div>
              <span className="font-semibold text-gray-700">Type:</span>{" "}
              <span className="text-gray-900">{hoverTooltip.type || "—"}</span>
            </div>

            <div className="break-words">
              <span className="font-semibold text-gray-700">ID/URL:</span>{" "}
              <span className="text-gray-900">{hoverTooltip.value || "—"}</span>
            </div>

            <div className="break-words">
              <span className="font-semibold text-gray-700">Aria Label:</span>{" "}
              <span className="text-gray-900">
                {hoverTooltip.ariaLabel || "—"}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-50 border rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <PencilLine className="w-5 h-5 text-teal-700" />
          <h3 className="font-semibold text-gray-900 text-lg">
            SEO Visual Editor
          </h3>
        </div>

        <div className="space-y-3">
          {renderedBlocks.map((block, index) => (
            <SeoBlockCard
              key={block.id}
              block={{
                ...block,
                content:
                  block.type === "title"
                    ? decodeHtml(block.content)
                    : block.content,
              }}
              index={index}
              totalBlocks={renderedBlocks.length}
              paragraphRef={(el) => {
                paragraphRefs.current[block.id] = el;
              }}
              onMoveUp={() => moveBlock(index, "up")}
              onMoveDown={() => moveBlock(index, "down")}
              onConvert={() =>
                convertBlockType(
                  block.id,
                  block.type === "title" ? "paragraph" : "title",
                )
              }
              onRemove={() => removeBlock(block.id)}
              onTitleChange={(value) => updateSeoBlock(block.id, value)}
              onParagraphInput={(e) =>
                updateSeoBlock(block.id, e.currentTarget.innerHTML)
              }
              onParagraphPaste={(e) => handleParagraphPaste(e, block.id)}
              onParagraphMouseUp={(e) => handleParagraphSelection(e, block.id)}
              onParagraphClick={(e) => handleParagraphClick(e, block.id)}
              onParagraphMouseOver={showTooltip}
              onParagraphMouseMove={moveTooltip}
              onParagraphMouseOut={hideTooltip}
            />
          ))}
        </div>
      </div>

      <SeoGeneratedHtml seoHtml={seoHtml} />
    </div>
  );
}
