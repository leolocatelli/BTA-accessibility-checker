"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Clipboard,
  CheckCircle,
  Undo2,
  Redo2,
  Eraser,
  Wand2,
} from "lucide-react";

import SeoFooterEditor from "./SeoFooterEditor";
import {
  buildSeoBlocks,
  generateSeoHtml,
} from "./seoFooterUtils";

export default function CharacterCounter({ cta_desc }) {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);

  const [seoMode, setSeoMode] = useState(false);
  const [seoBlocks, setSeoBlocks] = useState([]);

  const textareaRef = useRef(null);

  const announce = (msg) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(""), 1000);
  };

  const pushHistory = (val) => setHistory((h) => [...h.slice(-29), val]);

  // -----------------------------
  // Text transforms
  // -----------------------------
  const removeDiacritics = (s) =>
    s.normalize("NFD").replace(/\p{Diacritic}/gu, "");

  const wordsFromText = (s) =>
    removeDiacritics(s).toLowerCase().match(/[a-z0-9]+/g) || [];

  const toTitleSmart = (s) => {
    const small = new Set([
      "a",
      "an",
      "and",
      "as",
      "at",
      "but",
      "by",
      "for",
      "in",
      "of",
      "on",
      "or",
      "the",
      "to",
      "vs",
      "via",
    ]);

    const tokens = s.toLowerCase().split(/\s+/);
    return tokens
      .map((w, i) =>
        i === 0 || i === tokens.length - 1 || !small.has(w)
          ? w.charAt(0).toUpperCase() + w.slice(1)
          : w
      )
      .join(" ");
  };

  const toSentenceAll = (s) =>
    s
      .toLowerCase()
      .replace(/(^\s*\p{L}|[.!?]\s+\p{L})/gu, (m) => m.toUpperCase());

  const toSnake = (s) => wordsFromText(s).join("_");
  const toKebab = (s) => wordsFromText(s).join("-");
  const toCamel = (s) => {
    const w = wordsFromText(s);
    if (w.length === 0) return "";
    return (
      w[0] +
      w
        .slice(1)
        .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
        .join("")
    );
  };

  const toPascal = (s) =>
    wordsFromText(s)
      .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
      .join("");

  const transforms = {
    sentence: (txt) => toSentenceAll(txt),
    lower: (txt) => txt.toLowerCase(),
    upper: (txt) => txt.toUpperCase(),
    titleSmart: (txt) => toTitleSmart(txt),
    slug: (txt) => toKebab(txt).replace(/-+/g, "-").replace(/^-|-$/g, ""),
    snake: (txt) => toSnake(txt),
    camel: (txt) => toCamel(txt),
    pascal: (txt) => toPascal(txt),
    removeExtraSpaces: (s) => s.replace(/\s+/g, " ").trim(),
  };

  const updateText = (transformFn) => {
    const textarea = textareaRef.current || document.getElementById("text-area");
    if (!textarea) return;

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;

    let next;
    pushHistory(text);
    setFuture([]);

    if (start !== end) {
      const before = text.slice(0, start);
      const selected = text.slice(start, end);
      const after = text.slice(end);
      const transformed = transformFn(selected);
      next = before + transformed + after;
      setText(next);

      queueMicrotask(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start + transformed.length);
      });
    } else {
      const transformed = transformFn(text);
      next = transformed;
      setText(next);

      queueMicrotask(() => {
        textarea.focus();
        textarea.setSelectionRange(0, next.length);
      });
    }
  };

  const copyText = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    announce("Copied to clipboard");
    setTimeout(() => setCopied(false), 1500);
  };

  const copySlug = async () => {
    const s = transforms.slug(text);
    await navigator.clipboard.writeText(s);
    setCopied(true);
    announce("Slug copied to clipboard");
    setTimeout(() => setCopied(false), 1500);
  };

  const undo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setFuture((f) => [text, ...f]);
    setText(prev);
    announce("Undone");
  };

  const redo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((f) => f.slice(1));
    pushHistory(text);
    setText(next);
    announce("Redone");
  };

  // -----------------------------
  // SEO mode controls
  // -----------------------------
  const activateSeoMode = () => {
    const blocks = buildSeoBlocks(text);

    if (!blocks.length) {
      announce("Paste some text first");
      return;
    }

    setSeoBlocks(blocks);
    setSeoMode(true);
    announce("SEO Footer Tool activated");
  };

  const exitSeoMode = () => {
    setSeoMode(false);
    setSeoBlocks([]);
    announce("SEO mode closed");
  };

  const seoHtml = useMemo(() => generateSeoHtml(seoBlocks), [seoBlocks]);

  // -----------------------------
  // Stats
  // -----------------------------
  const stats = useMemo(() => {
    const words = (text.trim().match(/\S+/g) || []).length;
    const chars = text.length;
    const lines = text.split("\n").length;
    const charsNoSpaces = text.replace(/\s/g, "").length;
    const bytes = new Blob([text]).size;
    const readTimeMin = Math.max(1, Math.round(words / 200));
    return { words, chars, lines, charsNoSpaces, bytes, readTimeMin };
  }, [text]);

  // -----------------------------
  // Hotkeys
  // -----------------------------
  useEffect(() => {
    const onKey = (e) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      const k = e.key.toLowerCase();

      if (k === "u") {
        e.preventDefault();
        updateText(transforms.upper);
        announce("Converted to UPPERCASE");
      }
      if (k === "l") {
        e.preventDefault();
        updateText(transforms.lower);
        announce("Converted to lowercase");
      }
      if (k === "t") {
        e.preventDefault();
        updateText(transforms.titleSmart);
        announce("Converted to Title Case");
      }
      if (k === "k") {
        e.preventDefault();
        updateText(transforms.slug);
        announce("Converted to slug-case");
      }
      if (k === "z") {
        e.preventDefault();
        undo();
      }
      if (k === "y") {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [text, history, future]);

  const buttonStyle =
    "flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm rounded-md shadow hover:bg-blue-600 transition";

  const seoBtnStyle =
    "flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm rounded-md shadow hover:bg-teal-700 transition";

  const ghostBtn =
    "flex items-center gap-2 px-4 py-2 border border-blue-500 text-blue-600 text-sm rounded-md hover:bg-blue-100 transition disabled:opacity-50";

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-lg shadow-md">
      <span className="sr-only" aria-live="polite">
        {statusMsg}
      </span>

      {!seoMode && (
        <>
          <textarea
            id="text-area"
            ref={textareaRef}
            rows={8}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-3 border rounded text-sm shadow mb-4 outline-none"
            placeholder="Type or paste your text here..."
            aria-label={cta_desc ? `${cta_desc}: text editor` : "Text editor"}
          />

          <div className="flex flex-wrap gap-2 justify-center mb-3">
            <button
              onClick={() => updateText(transforms.sentence)}
              className={buttonStyle}
              aria-label={cta_desc ? `${cta_desc}: sentence case` : "Sentence case"}
              title="Sentence case"
            >
              Sentence case
            </button>

            <button
              onClick={() => updateText(transforms.lower)}
              className={buttonStyle}
              aria-label={cta_desc ? `${cta_desc}: lowercase` : "lower case"}
              title="lower case (Cmd/Ctrl+L)"
            >
              lower case
            </button>

            <button
              onClick={() => updateText(transforms.upper)}
              className={buttonStyle}
              aria-label={cta_desc ? `${cta_desc}: uppercase` : "UPPER CASE"}
              title="UPPER CASE (Cmd/Ctrl+U)"
            >
              UPPER CASE
            </button>

            <button
              onClick={() => updateText(transforms.titleSmart)}
              className={buttonStyle}
              aria-label={cta_desc ? `${cta_desc}: title case` : "Title Case"}
              title="Title Case (Cmd/Ctrl+T)"
            >
              Title Case
            </button>

            <button
              onClick={() => updateText(transforms.slug)}
              className={buttonStyle}
              aria-label={cta_desc ? `${cta_desc}: slug-case` : "slug-case"}
              title="slug-case (Cmd/Ctrl+K)"
            >
              slug-case
            </button>


          </div>

          <div className="flex flex-wrap gap-2 justify-center mb-6">
            <button
              onClick={() => updateText(transforms.snake)}
              className={buttonStyle}
              aria-label="snake_case"
              title="snake_case"
            >
              snake_case
            </button>

            <button
              onClick={() => updateText(transforms.camel)}
              className={buttonStyle}
              aria-label="camelCase"
              title="camelCase"
            >
              camelCase
            </button>

            <button
              onClick={() => updateText(transforms.pascal)}
              className={buttonStyle}
              aria-label="PascalCase"
              title="PascalCase"
            >
              PascalCase
            </button>

            <button
              onClick={() => updateText(transforms.removeExtraSpaces)}
              className={buttonStyle}
              aria-label="Remove extra spaces"
              title="Remove extra spaces"
            >
              <Eraser className="w-4 h-4" />
              Spaces
            </button>
                        <button
              onClick={activateSeoMode}
              className={seoBtnStyle}
              aria-label="SEO Footer Tool"
              title="SEO Footer Tool"
            >
              <Wand2 className="w-4 h-4" />
              SEO Footer Tool
            </button>
          </div>

          <div className="flex flex-wrap gap-2 justify-center mb-6">
            <button
              onClick={undo}
              disabled={!history.length}
              className={ghostBtn}
              aria-label="Undo"
              title="Undo (Cmd/Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" /> Undo
            </button>

            <button
              onClick={redo}
              disabled={!future.length}
              className={ghostBtn}
              aria-label="Redo"
              title="Redo (Cmd/Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" /> Redo
            </button>

            <button
              onClick={() => {
                pushHistory(text);
                setText("");
                setFuture([]);
                announce("Cleared");
              }}
              className={ghostBtn}
              aria-label="Clear text"
              title="Clear"
            >
              Clear
            </button>

            <button
              onClick={copyText}
              className={ghostBtn}
              aria-label="Copy all text"
              title="Copy all"
              disabled={!text}
            >
              {copied ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <Clipboard className="w-4 h-4" />
              )}
              {copied ? "Copied!" : "Copy All"}
            </button>

            <button
              onClick={copySlug}
              className={ghostBtn}
              aria-label="Copy slug"
              title="Copy slug"
              disabled={!text.trim()}
            >
              <Clipboard className="w-4 h-4" /> Copy Slug
            </button>
          </div>

          <div className="text-sm text-gray-700 text-center space-y-1">
            <p>
              <strong>Characters:</strong> {stats.chars} &nbsp;•&nbsp;
              <strong> Chars (no spaces):</strong> {stats.charsNoSpaces}
            </p>
            <p>
              <strong>Words:</strong> {stats.words} &nbsp;•&nbsp;
              <strong> Lines:</strong> {stats.lines}
            </p>
            <p>
              <strong>Size:</strong> {stats.bytes} bytes &nbsp;•&nbsp;
              <strong> ~{stats.readTimeMin} min</strong> read
            </p>
          </div>
        </>
      )}

      {seoMode && (
        <SeoFooterEditor
          seoBlocks={seoBlocks}
          setSeoBlocks={setSeoBlocks}
          seoHtml={seoHtml}
          onBack={exitSeoMode}
          onAnnounce={announce}
        />
      )}
    </div>
  );
}