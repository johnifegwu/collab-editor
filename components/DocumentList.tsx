"use client";

import { Document } from "@/lib/types";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface DocumentListProps {
  owned: Document[];
  shared: Document[];
  currentUserId: string;
  onDocumentDeleted: (id: string) => void;
  onDocumentRenamed: (id: string, title: string) => void;
}

export default function DocumentList({
  owned,
  shared,
  currentUserId,
  onDocumentDeleted,
  onDocumentRenamed,
}: DocumentListProps) {
  const router = useRouter();
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  function startRename(doc: Document) {
    setRenamingId(doc.id);
    setRenameValue(doc.title);
  }

  async function submitRename(id: string) {
    if (!renameValue.trim()) return;
    await fetch(`/api/documents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: renameValue.trim() }),
    });
    onDocumentRenamed(id, renameValue.trim());
    setRenamingId(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this document?")) return;
    await fetch(`/api/documents/${id}`, { method: "DELETE" });
    onDocumentDeleted(id);
  }

  function DocRow({ doc, isShared }: { doc: Document; isShared?: boolean }) {
    const isRenaming = renamingId === doc.id;
    return (
      <div className="group flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all">
        <div className="flex-1 min-w-0">
          {isRenaming ? (
            <input
              autoFocus
              className="w-full text-sm border border-blue-400 rounded px-2 py-1 outline-none"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitRename(doc.id);
                if (e.key === "Escape") setRenamingId(null);
              }}
              onBlur={() => submitRename(doc.id)}
            />
          ) : (
            <button
              className="text-sm font-medium text-gray-800 hover:text-blue-600 truncate text-left w-full"
              onClick={() => router.push(`/editor/${doc.id}`)}
            >
              {doc.title}
            </button>
          )}
          <div className="text-xs text-gray-400 mt-0.5">
            {isShared ? (
              <span>Shared by <span className="font-medium">{doc.ownerName}</span></span>
            ) : (
              <span>Updated {new Date(doc.updatedAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>
        {!isShared && (
          <div className="flex gap-2 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => startRename(doc)}
              className="text-xs text-gray-500 hover:text-blue-600 px-2 py-1 rounded hover:bg-blue-50"
            >
              Rename
            </button>
            <button
              onClick={() => handleDelete(doc.id)}
              className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Owned Documents */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            My Documents
          </h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {owned.length}
          </span>
        </div>
        {owned.length === 0 ? (
          <p className="text-sm text-gray-400 px-4 py-6 text-center border border-dashed border-gray-200 rounded-lg">
            No documents yet. Create your first document above.
          </p>
        ) : (
          <div className="space-y-2">
            {owned.map((doc) => (
              <DocRow key={doc.id} doc={doc} />
            ))}
          </div>
        )}
      </section>

      {/* Shared Documents */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Shared with Me
          </h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {shared.length}
          </span>
        </div>
        {shared.length === 0 ? (
          <p className="text-sm text-gray-400 px-4 py-6 text-center border border-dashed border-gray-200 rounded-lg">
            No documents have been shared with you yet.
          </p>
        ) : (
          <div className="space-y-2">
            {shared.map((doc) => (
              <DocRow key={doc.id} doc={doc} isShared />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
