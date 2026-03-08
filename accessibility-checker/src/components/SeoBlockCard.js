"use client";

import {
  ArrowUp,
  ArrowDown,
  Repeat,
  Trash2,
} from "lucide-react";

export default function SeoBlockCard({
  block,
  index,
  totalBlocks,
  paragraphRef,
  onMoveUp,
  onMoveDown,
  onConvert,
  onRemove,
  onTitleChange,
  onParagraphInput,
  onParagraphMouseUp,
  onParagraphClick,
  onParagraphMouseOver,
  onParagraphMouseMove,
  onParagraphMouseOut,
}) {
  const compactIconBtn =
    "inline-flex items-center justify-center w-8 h-8 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-100 transition disabled:opacity-50";

  const compactActionBtn =
    "inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-gray-300 text-gray-700 text-xs rounded-md hover:bg-gray-100 transition";

  const compactDangerBtn =
    "inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-red-300 text-red-600 text-xs rounded-md hover:bg-red-50 transition";

  return (
    <div
      className={`rounded-xl border p-3 shadow-sm ${
        block.type === "title"
          ? "bg-blue-50 border-blue-200"
          : "bg-white border-gray-200"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <span
          className={`text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${
            block.type === "title"
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {block.type}
        </span>

        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={onMoveUp}
            className={compactIconBtn}
            disabled={index === 0}
            title="Move up"
            type="button"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onMoveDown}
            className={compactIconBtn}
            disabled={index === totalBlocks - 1}
            title="Move down"
            type="button"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onConvert}
            className={compactActionBtn}
            title={block.type === "title" ? "Convert to Paragraph" : "Convert to Title"}
            type="button"
          >
            <Repeat className="w-3.5 h-3.5" />
            {block.type === "title" ? "To Paragraph" : "To Title"}
          </button>

          <button
            onClick={onRemove}
            className={compactDangerBtn}
            title="Remove block"
            type="button"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Remove
          </button>
        </div>
      </div>

      {block.type === "title" ? (
        <input
          type="text"
          value={block.content}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full p-3 border rounded-md text-xl font-semibold outline-none"
          placeholder="Title block"
        />
      ) : (
        <div
          ref={paragraphRef}
          data-seo-paragraph="true"
          contentEditable
          suppressContentEditableWarning
          onInput={onParagraphInput}
          onMouseUp={onParagraphMouseUp}
          onMouseDown={onParagraphClick}
          onMouseOver={onParagraphMouseOver}
          onMouseMove={onParagraphMouseMove}
          onMouseOut={onParagraphMouseOut}
          className="w-full min-h-[95px] p-3 border rounded-md text-base outline-none whitespace-pre-wrap leading-7"
          dangerouslySetInnerHTML={{ __html: block.content }}
        />
      )}
    </div>
  );
}