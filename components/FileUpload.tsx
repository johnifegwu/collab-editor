"use client";

import { useRef } from "react";

interface FileUploadProps {
  currentUserId: string;
  onImport: (title: string, content: string) => void;
}

export default function FileUpload({ currentUserId, onImport }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error ?? "Failed to import file");
      return;
    }

    const { title, content } = await res.json();

    // Create a new document with the imported content
    const createRes = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, ownerId: currentUserId }),
    });

    if (!createRes.ok) {
      alert("Failed to create document from file");
      return;
    }

    const doc = await createRes.json();
    onImport(doc.title, doc.id);

    // Reset input
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <label
        htmlFor="file-import"
        className="inline-flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        Import File
      </label>
      <input
        id="file-import"
        ref={inputRef}
        type="file"
        accept=".txt,.md,.docx"
        className="hidden"
        onChange={handleFileChange}
      />
      <p className="text-xs text-gray-400 mt-1">Supports .txt, .md, .docx</p>
    </div>
  );
}
