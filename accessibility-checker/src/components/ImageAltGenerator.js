"use client";
import { useState, useRef, useEffect } from "react";
import {
  Loader2,
  XCircle,
  AlertTriangle,
  Clipboard,
  CheckCircle,
  ImagePlus,
} from "lucide-react";

const altCache = {};
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB

function convertGoogleDriveLink(url) {
  const match = url.match(/\/d\/([^/]+)\//);
  return match ? `https://drive.google.com/uc?export=view&id=${match[1]}` : url;
}

function generateBTAssetURL(value) {
  if (!value || typeof value !== "string") return "";

  const trimmed = value.trim();

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  const hasExtension = /\.[a-zA-Z0-9]+$/.test(trimmed);
  const assetName = hasExtension ? trimmed : `${trimmed}.jpg`;

  return `https://images.brownthomas.com/bta/${assetName}`;
}

const uid = () => Math.random().toString(36).slice(2);

export default function ImageAltGenerator() {
  const [imageInputs, setImageInputs] = useState([]);
  const [altResults, setAltResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState("");
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const CHARACTER_LIMIT = 150;

  const fileInputRef = useRef(null);
  const pasteAreaRef = useRef(null);

  const addFilesToImageInputs = (files) => {
    const fileList = Array.from(files || []);
    if (!fileList.length) return;

    const imageFiles = fileList.filter((file) =>
      file.type.startsWith("image/")
    );

    if (!imageFiles.length) {
      setWarning("No valid image file was found.");
      return;
    }

    const tooBig = imageFiles.filter((file) => file.size > MAX_FILE_BYTES);
    if (tooBig.length) {
      setWarning(
        `Some files exceeded ${Math.round(
          MAX_FILE_BYTES / 1024 / 1024
        )}MB and were skipped.`
      );
    }

    const accepted = imageFiles.filter((file) => file.size <= MAX_FILE_BYTES);

    setImageInputs((prev) => {
      const newItems = accepted
        .filter(
          (file) =>
            !prev.some(
              (inp) =>
                inp.type === "file" &&
                inp.file?.name === file.name &&
                inp.file?.size === file.size
            )
        )
        .map((file) => ({
          id: uid(),
          type: "file",
          file,
          preview: URL.createObjectURL(file),
          keyword: "",
        }));

      if (!newItems.length) {
        setWarning("This image was already added.");
        return prev;
      }

      setWarning("");
      return [...prev, ...newItems];
    });
  };

  const handleUrlInput = (e) => {
    const rawInputs = e.target.value
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url)
      .map((url) => convertGoogleDriveLink(url));

    const processedUrls = rawInputs.map((value) => generateBTAssetURL(value));

    setImageInputs((prev) => {
      const newInputs = processedUrls
        .filter(
          (url) =>
            !prev.some((input) => input.type === "url" && input.url === url)
        )
        .map((url) => ({
          id: uid(),
          type: "url",
          url,
          keyword: "",
        }));

      setWarning(
        newInputs.length < processedUrls.length
          ? "Some images were already added and were skipped."
          : ""
      );

      return [...prev, ...newInputs];
    });
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    addFilesToImageInputs(files);
    e.target.value = "";
  };

  const handlePaste = (event) => {
    const items = event.clipboardData?.items;
    if (!items || !items.length) return;

    const pastedFiles = [];

    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          const extension = file.type.split("/")[1] || "png";
          const wrappedFile = new File(
            [file],
            `pasted-image-${Date.now()}.${extension}`,
            {
              type: file.type,
            }
          );
          pastedFiles.push(wrappedFile);
        }
      }
    }

    if (pastedFiles.length > 0) {
      event.preventDefault();
      addFilesToImageInputs(pastedFiles);
    }
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.currentTarget.contains(event.relatedTarget)) return;

    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const files = Array.from(event.dataTransfer?.files || []);
    if (!files.length) return;

    addFilesToImageInputs(files);
  };

  useEffect(() => {
    const onPaste = (event) => {
      const activeElement = document.activeElement;
      const tagName = activeElement?.tagName?.toLowerCase();

      const isTypingField =
        tagName === "input" ||
        tagName === "textarea" ||
        activeElement?.isContentEditable;

      if (isTypingField) return;

      handlePaste(event);
    };

    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, []);

  useEffect(() => {
    return () => {
      imageInputs.forEach((item) => {
        if (item?.type === "file" && item.preview) {
          try {
            URL.revokeObjectURL(item.preview);
          } catch {}
        }
      });
    };
  }, [imageInputs]);

  const removeImage = (indexToRemove) => {
    setImageInputs((prev) => {
      const clone = [...prev];
      const item = clone[indexToRemove];

      if (item?.type === "file" && item.preview) {
        try {
          URL.revokeObjectURL(item.preview);
        } catch {}
      }

      clone.splice(indexToRemove, 1);
      return clone;
    });
  };

  const generateAltTexts = async () => {
    if (imageInputs.length === 0) return;

    setLoading(true);
    setAltResults([]);
    setError("");
    setWarning("");

    const newResults = [];

    try {
      for (const item of imageInputs) {
        const keyword = item.keyword || "";
        let altText = "";

        if (item.type === "url") {
          const cacheKey = keyword ? `${item.url}|${keyword}` : item.url;

          if (altCache[cacheKey]) {
            altText = altCache[cacheKey];
          } else {
            const response = await fetch("/api/generate-alt", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                imageUrl: item.url,
                keyword,
                charLimit: CHARACTER_LIMIT,
              }),
            });

            if (!response.ok) {
              throw new Error(
                `Server error: ${response.status} ${response.statusText}`
              );
            }

            const data = await response.json();
            altText = data.altText || "";
            altCache[cacheKey] = altText;
          }

          newResults.push({
            id: item.id,
            preview: item.url.includes("drive.google.com")
              ? "https://upload.wikimedia.org/wikipedia/commons/d/da/Google_Drive_logo.png"
              : item.url,
            altText,
          });
        } else if (item.type === "file") {
          const form = new FormData();
          form.append("file", item.file);
          form.append("keyword", keyword);
          form.append("charLimit", String(CHARACTER_LIMIT));

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/alt-from-upload`,
            { method: "POST", body: form }
          );

          if (!response.ok) {
            throw new Error(
              `Server error: ${response.status} ${response.statusText}`
            );
          }

          const data = await response.json();
          altText = data.altText || data.alt || "";

          newResults.push({
            id: item.id,
            preview: item.preview || item.file.name,
            altText,
          });
        }
      }

      setAltResults(newResults);
    } catch (err) {
      console.error("❌ Error generating ALT texts:", err);
      setError("Some items failed. Check file types, sizes, or try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (index, altText) => {
    try {
      await navigator.clipboard.writeText(altText);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  return (
    <div
      ref={pasteAreaRef}
      onPaste={handlePaste}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      tabIndex={0}
      className={`p-6 max-w-4xl mx-auto bg-white rounded-2xl shadow-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        isDragging ? "ring-2 ring-blue-500 bg-blue-50" : ""
      }`}
      aria-label="Image ALT Generator area"
    >
      <label
        htmlFor="alt-urls"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        Image URLs (one per line)
      </label>

      <textarea
        id="alt-urls"
        rows="4"
        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="https://example.com/image-1.jpg&#10;https://example.com/image-2.png"
        onChange={handleUrlInput}
      />

      <div
        className={`mt-3 rounded-xl border-2 border-dashed p-5 text-center transition ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-gray-50"
        }`}
      >
        <p className="text-sm font-medium text-gray-700">
          Drag and drop images here
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Or paste with <strong>Ctrl + V</strong> / <strong>Cmd + V</strong>,
          including screenshots from Windows Snipping Tool
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="text-xs text-gray-500">
          Accepted: JPG, PNG, WEBP, GIF • Max{" "}
          {Math.round(MAX_FILE_BYTES / 1024 / 1024)}MB per file
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={handleFileInput}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Upload images"
          >
            <ImagePlus className="w-4 h-4" />
            Upload images
          </button>
        </div>
      </div>

      {warning && (
        <div className="mt-3 text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg p-2.5 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          {warning}
        </div>
      )}

      {error && (
        <p
          className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-2"
          aria-live="polite"
        >
          {error}
        </p>
      )}

      {imageInputs.length > 0 && (
        <div className="mt-5 bg-gray-50 p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold">
              Selected Images ({imageInputs.length})
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {imageInputs.map((input, index) => {
              const previewSrc =
                input.type === "file"
                  ? input.preview
                  : input.url.includes("drive.google.com")
                  ? "https://upload.wikimedia.org/wikipedia/commons/d/da/Google_Drive_logo.png"
                  : input.url;

              return (
                <div
                  key={input.id}
                  className="relative group flex flex-col items-stretch rounded-lg bg-white shadow-sm border border-gray-200"
                >
                  <div className="relative w-full h-36 flex items-center justify-center bg-gray-100 rounded-t-lg overflow-hidden">
                    <img
                      src={previewSrc}
                      alt="Selected preview"
                      className="w-auto max-h-full object-contain"
                      onError={(e) => {
                        if (input.type === "file") return;
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                          "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg";
                      }}
                    />

                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-gray-800/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      aria-label="Remove image"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-3">
                    <label className="sr-only" htmlFor={`kw-${input.id}`}>
                      Optional keyword
                    </label>
                    <input
                      id={`kw-${input.id}`}
                      type="text"
                      placeholder="Optional keyword..."
                      className="p-2 border rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={input.keyword}
                      onChange={(e) => {
                        setImageInputs((prev) =>
                          prev.map((item, i) =>
                            i === index
                              ? { ...item, keyword: e.target.value }
                              : item
                          )
                        );
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-5">
        <button
          className="w-full md:w-auto px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition inline-flex items-center gap-2 disabled:opacity-60"
          onClick={generateAltTexts}
          disabled={loading || imageInputs.length === 0}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin w-4 h-4" />
              Generating...
            </>
          ) : (
            "Generate ALT Texts"
          )}
        </button>
      </div>

      {altResults.length > 0 && (
        <div className="mt-6 p-5 bg-gray-50 rounded-2xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Generated ALT Texts ({altResults.length})
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {altResults.map((result, index) => (
              <div
                key={result.id}
                className="p-4 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row items-stretch gap-4"
              >
                <div className="relative w-full md:w-56 h-40 flex items-center justify-center rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={result.preview}
                    alt="Result preview"
                    className="w-auto max-h-full object-contain"
                  />
                </div>

                <div className="flex-1 flex flex-col">
                  <p className="text-gray-800 text-sm leading-6">
                    {result.altText}
                  </p>

                  <div className="mt-3">
                    <button
                      className="inline-flex items-center gap-2 text-blue-600 text-xs border border-blue-500 px-3 py-1.5 rounded-md hover:bg-blue-50 transition"
                      onClick={() => handleCopy(index, result.altText)}
                      aria-label="Copy ALT text"
                    >
                      {copiedIndex === index ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Clipboard className="w-4 h-4" />
                          Copy ALT Text
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}