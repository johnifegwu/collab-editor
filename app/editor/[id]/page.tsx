"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import RichTextEditor from "@/components/Editor";
import ShareModal from "@/components/ShareModal";
import { MOCK_USERS, MockUserKey } from "@/lib/mockAuth";
import { Document } from "@/lib/types";
import UserSwitcher from "@/components/UserSwitcher";

function EditorPageInner() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [activeUser, setActiveUser] = useState<MockUserKey>("alice");
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "">("");
  const [titleEdit, setTitleEdit] = useState(false);
  const [titleValue, setTitleValue] = useState("");

  const currentUser = MOCK_USERS[activeUser];

  const loadDoc = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/documents/${id}`);
    if (!res.ok) {
      setError("Document not found");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setDoc(data);
    setTitleValue(data.title);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadDoc();
  }, [loadDoc]);

  const isOwner = doc?.ownerId === currentUser.id;

  async function saveTitle() {
    if (!doc || !titleValue.trim()) return;
    setTitleEdit(false);
    if (titleValue === doc.title) return;
    await fetch(`/api/documents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: titleValue.trim() }),
    });
    setDoc((prev) => prev ? { ...prev, title: titleValue.trim() } : prev);
  }

  function handleSave() {
    setSaveStatus("saving");
    setTimeout(() => setSaveStatus("saved"), 500);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading…</p>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-red-500 text-sm">{error ?? "Document not found"}</p>
        <button
          onClick={() => router.push("/")}
          className="text-blue-600 text-sm underline"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              onClick={() => router.push("/")}
              className="text-gray-400 hover:text-gray-600 text-sm shrink-0"
              title="Back to dashboard"
            >
              ← Back
            </button>

            {/* Editable title */}
            {titleEdit && isOwner ? (
              <input
                autoFocus
                className="text-base font-semibold border border-blue-400 rounded px-2 py-0.5 outline-none min-w-0 flex-1"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveTitle();
                  if (e.key === "Escape") {
                    setTitleEdit(false);
                    setTitleValue(doc.title);
                  }
                }}
                onBlur={saveTitle}
              />
            ) : (
              <h1
                className={`text-base font-semibold text-gray-900 truncate ${
                  isOwner ? "cursor-pointer hover:text-blue-600" : ""
                }`}
                title={isOwner ? "Click to rename" : undefined}
                onClick={() => isOwner && setTitleEdit(true)}
              >
                {doc.title}
              </h1>
            )}

            {/* Role badge */}
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                isOwner
                  ? "bg-blue-100 text-blue-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {isOwner ? "Owner" : "Shared"}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {saveStatus === "saving" && (
              <span className="text-xs text-gray-400">Saving…</span>
            )}
            {saveStatus === "saved" && (
              <span className="text-xs text-emerald-600">Saved ✓</span>
            )}
            {isOwner && (
              <button
                onClick={() => setShowShare(true)}
                className="px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Share
              </button>
            )}
            <UserSwitcher currentUser={activeUser} onChange={setActiveUser} />
          </div>
        </div>
      </header>

      {/* Editor */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-6">
        <RichTextEditor
          key={doc.id}
          documentId={doc.id}
          initialContent={doc.content}
          readOnly={!isOwner}
          onSave={handleSave}
        />
        {!isOwner && (
          <p className="text-xs text-center text-amber-600 mt-3">
            You have view-only access to this document.
          </p>
        )}
      </main>

      {/* Share modal */}
      {showShare && (
        <ShareModal
          documentId={doc.id}
          documentTitle={doc.title}
          currentUserId={currentUser.id}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading…</p>
      </div>
    }>
      <EditorPageInner />
    </Suspense>
  );
}
