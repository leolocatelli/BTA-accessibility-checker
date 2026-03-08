"use client";

import {
  Folder,
  Package,
  Image,
  Link as LinkIcon,
  X,
} from "lucide-react";

export default function SeoLinkTypeModal({
  isOpen,
  onSelectType,
  onCancel,
}) {
  if (!isOpen) return null;

  const overlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel?.();
    }
  };

  const option =
    "flex items-start gap-3 w-full px-4 py-3 rounded-lg hover:bg-gray-50 transition text-left";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onMouseDown={overlayClick}
      aria-modal="true"
      role="dialog"
      aria-label="Insert link type"
    >
      <div className="w-[340px] max-w-full bg-white border border-gray-200 rounded-xl shadow-2xl p-4">

        {/* Header */}
        <div className="text-sm font-semibold text-gray-600 mb-3">
          Insert Link
        </div>

        {/* Category */}
        <button
          className={option}
          onClick={() => onSelectType?.("category")}
          type="button"
        >
          <Folder className="w-5 h-5 text-gray-500 mt-0.5" />
          <div>
            <div className="text-sm font-medium text-gray-800">
              Category
            </div>
            <div className="text-xs text-gray-500">
              Link to a category page
            </div>
          </div>
        </button>

        {/* Product */}
        <button
          className={option}
          onClick={() => onSelectType?.("product")}
          type="button"
        >
          <Package className="w-5 h-5 text-gray-500 mt-0.5" />
          <div>
            <div className="text-sm font-medium text-gray-800">
              Product
            </div>
            <div className="text-xs text-gray-500">
              Link to a product page
            </div>
          </div>
        </button>

        {/* Asset */}
        <button
          className={option}
          onClick={() => onSelectType?.("asset")}
          type="button"
        >
          <Image className="w-5 h-5 text-gray-500 mt-0.5" />
          <div>
            <div className="text-sm font-medium text-gray-800">
              Content Asset
            </div>
            <div className="text-xs text-gray-500">
              Link to media or asset
            </div>
          </div>
        </button>

        {/* URL */}
        <button
          className={option}
          onClick={() => onSelectType?.("url")}
          type="button"
        >
          <LinkIcon className="w-5 h-5 text-gray-500 mt-0.5" />
          <div>
            <div className="text-sm font-medium text-gray-800">
              URL
            </div>
            <div className="text-xs text-gray-500">
              External website link
            </div>
          </div>
        </button>

        {/* Cancel */}
        <div className="mt-3 pt-3 border-t">
          <button
            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
            onClick={onCancel}
            type="button"
          >
            <X size={16} />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}