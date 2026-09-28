"use client";

import {
  Bold,
  Italic,
  Link2,
  List,
  ListOrdered,
  Undo2,
  Redo2,
  Eraser,
  Code2,
  Clipboard,
} from "lucide-react";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export default function RichTextEditor() {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4, 5],
        },
      }),
    ],
    content: "",
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,

    editorProps: {
      attributes: {
        class: "min-h-[280px] w-full p-4 text-sm text-gray-800 outline-none",
        role: "textbox",
        "aria-label": "Rich text editor",
        "aria-multiline": "true",
      },
    },
  });

  const toolbarButton =
    "flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-100 transition";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">
          Rich Text Editor
        </h2>

        <p className="mt-1 text-sm text-gray-600">
          Create formatted content and export clean, semantic HTML.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
        <select
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none"
          defaultValue="paragraph"
          aria-label="Text style"
        >
          <option value="paragraph">Paragraph</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="h5">Heading 5</option>
        </select>

        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          disabled={!editor}
          className={`${toolbarButton} ${
            editor?.isActive("bold")
              ? "bg-blue-50 border-blue-400 text-blue-600"
              : ""
          }`}
          title="Bold"
          aria-label="Bold"
          aria-pressed={editor?.isActive("bold") || false}
        >
          <Bold className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          disabled={!editor}
          className={`${toolbarButton} ${
            editor?.isActive("italic")
              ? "bg-blue-50 border-blue-400 text-blue-600"
              : ""
          }`}
          title="Italic"
          aria-label="Italic"
          aria-pressed={editor?.isActive("italic") || false}
        >
          <Italic className="h-4 w-4" />
        </button>

        <button
          type="button"
          className={toolbarButton}
          title="Add link"
          aria-label="Add link"
        >
          <Link2 className="h-4 w-4" />
        </button>

        <button
          type="button"
          className={toolbarButton}
          title="Bullet list"
          aria-label="Bullet list"
        >
          <List className="h-4 w-4" />
        </button>

        <button
          type="button"
          className={toolbarButton}
          title="Ordered list"
          aria-label="Ordered list"
        >
          <ListOrdered className="h-4 w-4" />
        </button>

        <div className="mx-1 h-6 w-px bg-gray-300" />

        <button
          type="button"
          className={toolbarButton}
          title="Undo"
          aria-label="Undo"
        >
          <Undo2 className="h-4 w-4" />
        </button>

        <button
          type="button"
          className={toolbarButton}
          title="Redo"
          aria-label="Redo"
        >
          <Redo2 className="h-4 w-4" />
        </button>

        <button
          type="button"
          className={toolbarButton}
          title="Clear formatting"
          aria-label="Clear formatting"
        >
          <Eraser className="h-4 w-4" />
          Clear
        </button>
      </div>

      {/* Editor */}
      <div className="overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
        <EditorContent editor={editor} />
      </div>

      {/* Accessibility status */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
        <p className="text-sm font-medium text-gray-700">Accessibility</p>

        <p className="mt-1 text-sm text-gray-500">
          Accessibility suggestions will appear here.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          className="flex items-center gap-2 rounded-md border border-blue-500 px-4 py-2 text-sm text-blue-600 transition hover:bg-blue-50"
        >
          <Code2 className="h-4 w-4" />
          View HTML
        </button>

        <button
          type="button"
          className="flex items-center gap-2 rounded-md bg-blue-500 px-4 py-2 text-sm text-white shadow transition hover:bg-blue-600"
        >
          <Clipboard className="h-4 w-4" />
          Copy HTML
        </button>
      </div>
    </div>
  );
}
