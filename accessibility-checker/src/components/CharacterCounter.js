"use client";
import { useState } from "react";
import { Clipboard, CheckCircle, Type } from "lucide-react";

export default function CharacterCounter() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  const lineCount = text.split("\n").length;

  const updateText = (transformFn) => {
    const textarea = document.getElementById("text-area");
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end) {
      const before = text.slice(0, start);
      const selected = text.slice(start, end);
      const after = text.slice(end);
      const transformed = transformFn(selected);
      setText(before + transformed + after);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start + transformed.length);
      }, 0);
    } else {
      const transformed = transformFn(text);
      setText(transformed);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(0, transformed.length);
      }, 0);
    }
  };

  const copyText = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const transforms = {
    sentence: (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase(),
    lower: (txt) => txt.toLowerCase(),
    upper: (txt) => txt.toUpperCase(),
    capitalized: (txt) => txt.replace(/\b\w/g, (l) => l.toUpperCase()).toLowerCase(),
    title: (txt) => txt.replace(/\w\S*/g, (word) => word[0].toUpperCase() + word.slice(1).toLowerCase()),
  };

  const buttonStyle =
    "flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm rounded-md shadow hover:bg-blue-600 transition";

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-lg shadow-md">
      <textarea
        id="text-area"
        rows={5}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full p-3 border rounded text-sm shadow mb-4"
        placeholder="Type or paste your text here..."
      />

      <div className="flex flex-wrap gap-2 justify-center mb-6">
        <button onClick={() => updateText(transforms.sentence)} className={buttonStyle}>
          Sentence case
        </button>
        <button onClick={() => updateText(transforms.lower)} className={buttonStyle}>
          lower case
        </button>
        <button onClick={() => updateText(transforms.upper)} className={buttonStyle}>
          UPPER CASE
        </button>
        <button onClick={() => updateText(transforms.title)} className={buttonStyle}>
          Title Case
        </button>
        <button onClick={copyText} className="flex items-center gap-2 px-4 py-2 border border-blue-500 text-blue-600 text-sm rounded-md hover:bg-blue-100 transition">
          {copied ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-600" /> Copied!
            </>
          ) : (
            <>
              <Clipboard className="w-4 h-4" /> Copy All
            </>
          )}
        </button>
      </div>

      <div className="text-sm text-gray-700 text-center space-y-1">
        <p><strong>Characters:</strong> {charCount}</p>
        <p><strong>Words:</strong> {wordCount}</p>
        <p><strong>Lines:</strong> {lineCount}</p>
      </div>
    </div>
  );
}
