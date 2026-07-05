import React, { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Image as ImageIcon,
  Eraser,
} from "lucide-react";

import { apiClient } from "../helper/apiClient";

// Suppress harmless Tiptap duplicate extension warnings caused by React Strict Mode
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('Duplicate extension names found')) return;
  originalWarn(...args);
};

const ToolbarButton = ({ onClick, active, children }) => (
  <button
    type="button"
    onMouseDown={(e) => e.preventDefault()}
    onClick={(e) => {
      e.preventDefault();
      onClick();
    }}
    className={`p-2 rounded-md border transition flex items-center justify-center ${
      active
        ? "bg-[#132242] text-white border-[#132242]"
        : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
    }`}
  >
    <div className="pointer-events-none flex items-center justify-center">
      {children}
    </div>
  </button>
);

const extensions = [
  StarterKit,
  Underline,
  Link.configure({
    openOnClick: false,
    autolink: true,
    linkOnPaste: true,
  }),
  Image,
  Placeholder.configure({
    placeholder: "Start writing your article...",
  }),
];

const RichTextEditor = ({ value = "", onChange }) => {
  const timeoutRef = React.useRef(null);
  const [, setForceUpdate] = useState(0);

  const editor = useEditor({
    extensions,
    content: value || "",
    onUpdate: ({ editor }) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        onChange?.(editor.getHTML());
      }, 300);
    },
    onTransaction: () => {
      setForceUpdate(x => x + 1);
    }
  });

  // ✅ Update editor when value changes (Edit page load)
  useEffect(() => {
    if (!editor || editor.isFocused) return;

    const next = value || "";
    const current = editor.getHTML();

    if (current !== next) {
      editor.commands.setContent(next, false);
    }
  }, [value, editor]);

  // ✅ Handle image drop and paste
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    const handleUpload = async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await apiClient.post("/upload", formData);
        const url = res.data?.data?.url;
        const key = res.data?.data?.key;
        if (!url || !key) return;

        const proxyUrl = url;

        if (file.type.startsWith("video")) {
          editor.chain().focus().insertContent(
            `<video controls src="${proxyUrl}" class="my-4 rounded-lg w-full"></video>`
          ).run();
        } else {
          editor.chain().focus().setImage({ src: proxyUrl }).run();
        }
      } catch (error) {
        console.error("Upload failed", error);
      }
    };

    editor.setOptions({
      editorProps: {
        handleDrop: (view, event, slice, moved) => {
          if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            const file = event.dataTransfer.files[0];
            if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
              event.preventDefault();
              handleUpload(file);
              return true;
            }
          }
          return false;
        },
        handlePaste: (view, event, slice) => {
          if (event.clipboardData && event.clipboardData.files && event.clipboardData.files.length > 0) {
            const file = event.clipboardData.files[0];
            if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
              event.preventDefault();
              handleUpload(file);
              return true;
            }
          }
          return false;
        }
      }
    });
  }, [editor]);

  if (!editor) return null;

  // ✅ Upload image/video using apiClient baseURL (works in production)
  const addMedia = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,video/*";

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await apiClient.post("/upload", formData);

        // Backend wraps response: { success, data: { url, key, location } }
        const url = res.data?.data?.url;
        const key = res.data?.data?.key;
        if (!url || !key) {
          console.error("Upload response missing url/key", res.data);
          return;
        }

        const proxyUrl = url;

        if (file.type.startsWith("video")) {
          editor
            .chain()
            .focus()
            .insertContent(
              `<video controls src="${proxyUrl}" class="my-4 rounded-lg w-full"></video>`
            )
            .run();
        } else {
          editor.chain().focus().setImage({ src: proxyUrl }).run();
        }
      } catch (error) {
        console.error("Upload failed", error);
      }
    };

    input.click();
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL", previousUrl);

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="border rounded-xl shadow-sm bg-white overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 p-3 border-b bg-gray-50">
        {/* Headings */}
        <div className="flex gap-2">
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            active={editor.isActive("heading", { level: 1 })}
          >
            <Heading1 size={18} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            active={editor.isActive("heading", { level: 2 })}
          >
            <Heading2 size={18} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            active={editor.isActive("heading", { level: 3 })}
          >
            <Heading3 size={18} />
          </ToolbarButton>
        </div>

        {/* Text formatting */}
        <div className="flex gap-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
          >
            <Bold size={18} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
          >
            <Italic size={18} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}
          >
            <UnderlineIcon size={18} />
          </ToolbarButton>
        </div>

        {/* Lists */}
        <div className="flex gap-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
          >
            <List size={18} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
          >
            <ListOrdered size={18} />
          </ToolbarButton>
        </div>

        {/* Link + Media */}
        <div className="flex gap-2">
          <ToolbarButton onClick={setLink} active={editor.isActive("link")}>
            <LinkIcon size={18} />
          </ToolbarButton>

          <ToolbarButton onClick={addMedia}>
            <ImageIcon size={18} />
          </ToolbarButton>
        </div>

        {/* Clear formatting */}
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().clearNodes().unsetAllMarks().run()
          }
        >
          <Eraser size={18} />
        </ToolbarButton>
      </div>

      {/* Editor */}
      <div
        className="min-h-[300px] p-5 cursor-text"
        onClick={() => editor.chain().focus().run()}
      >
        <EditorContent
          editor={editor}
          className="prose max-w-none prose-p:my-1 prose-headings:my-2 focus:outline-none"
        />
      </div>
    </div>
  );
};

export default RichTextEditor;
