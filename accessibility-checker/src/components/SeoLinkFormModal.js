"use client";

import { X, Trash2 } from "lucide-react";

export default function SeoLinkFormModal({
  isOpen,
  linkMode = "insert",
  linkForm,
  setLinkForm,
  onConfirm,
  onCancel,
  onRemove,
  suggestAriaLabel,
}) {
  if (!isOpen) return null;

  const overlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel?.();
    }
  };

  const typePill = (active) =>
    `px-3 py-1.5 text-sm rounded-md border transition ${
      active
        ? "bg-teal-600 text-white border-teal-600"
        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
    }`;

  const setType = (type) => {
    setLinkForm((prev) => ({
      ...prev,
      type,
      ariaLabel: suggestAriaLabel
        ? suggestAriaLabel(type, prev.selectedText || "", prev.value || "")
        : prev.ariaLabel,
    }));
  };

  const handleValueChange = (e) => {
    const nextValue = e.target.value;

    setLinkForm((prev) => ({
      ...prev,
      value: nextValue,
      ariaLabel: suggestAriaLabel
        ? suggestAriaLabel(prev.type, prev.selectedText || "", nextValue)
        : prev.ariaLabel,
    }));
  };

  const handleAriaChange = (e) => {
    const nextAria = e.target.value;

    setLinkForm((prev) => ({
      ...prev,
      ariaLabel: nextAria,
    }));
  };

  const handleMouseAction = (callback) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    callback?.();
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/45 backdrop-blur-sm p-4"
      onClick={overlayClick}
      aria-modal="true"
      role="dialog"
      aria-label={linkMode === "edit" ? "Edit link" : "Insert link"}
    >
      <div
        className="w-[420px] max-w-full bg-white border border-gray-200 rounded-2xl shadow-2xl p-4"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {" "}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">
              {linkMode === "edit" ? "Edit Link" : "Insert Link"}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Selected text:{" "}
              <span className="font-medium text-gray-700">
                {linkForm?.selectedText || "—"}
              </span>
            </p>
          </div>

          <button
            onMouseDown={handleMouseAction(onCancel)}
            className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
            title="Close"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            type="button"
            className={typePill(linkForm?.type === "category")}
            onMouseDown={handleMouseAction(() => setType("category"))}
          >
            Category
          </button>

          <button
            type="button"
            className={typePill(linkForm?.type === "product")}
            onMouseDown={handleMouseAction(() => setType("product"))}
          >
            Product
          </button>

          <button
            type="button"
            className={typePill(linkForm?.type === "asset")}
            onMouseDown={handleMouseAction(() => setType("asset"))}
          >
            Content Asset
          </button>

          <button
            type="button"
            className={typePill(linkForm?.type === "url")}
            onMouseDown={handleMouseAction(() => setType("url"))}
          >
            URL
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              {linkForm?.type === "url"
                ? "URL"
                : linkForm?.type === "category"
                  ? "Category ID"
                  : linkForm?.type === "product"
                    ? "Product ID"
                    : "Content Asset ID"}
            </label>

            <input
              type="text"
              value={linkForm?.value || ""}
              onChange={handleValueChange}
              placeholder={
                linkForm?.type === "url"
                  ? "https://example.com"
                  : linkForm?.type === "category"
                    ? "womens-clothing"
                    : linkForm?.type === "product"
                      ? "123456789"
                      : "mothers-day-guide"
              }
              className="w-full p-3 border rounded-md outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              ARIA Label
            </label>

            <input
              type="text"
              value={linkForm?.ariaLabel || ""}
              onChange={handleAriaChange}
              className="w-full p-3 border rounded-md outline-none text-sm"
            />

            <p className="mt-1 text-[11px] text-gray-500">
              Suggested automatically. You can edit it before confirming.
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onMouseDown={handleMouseAction(onConfirm)}
            className="px-4 py-2 bg-teal-600 text-white rounded-md text-sm hover:bg-teal-700 transition"
            type="button"
          >
            OK
          </button>

          {linkMode === "edit" && (
            <button
              onMouseDown={handleMouseAction(onRemove)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-md text-sm hover:bg-red-50 transition"
              type="button"
            >
              <Trash2 className="w-4 h-4" />
              Remove
            </button>
          )}

          <button
            onMouseDown={handleMouseAction(onCancel)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-100 transition"
            type="button"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
