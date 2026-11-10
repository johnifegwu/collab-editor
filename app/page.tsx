"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DocumentList from "@/components/DocumentList";
import UserSwitcher from "@/components/UserSwitcher";
import FileUpload from "@/components/FileUpload";
import { MOCK_USERS, MockUserKey } from "@/lib/mockAuth";
import { Document } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const [activeUser, setActiveUser] = useState<MockUserKey>("alice");
  const [owned, setOwned] = useState<Document[]>([]);
  const [shared, setShared] = useState<Document[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const currentUser = MOCK_USERS[activeUser];

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/documents?userId=${currentUser.id}`);
    const data = await res.json();
    setOwned(data.owned ?? []);
    setShared(data.shared ?? []);
    setLoading(false);
  }, [currentUser.id]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const title = newTitle.trim() || "Untitled Document";
    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content: "", ownerId: currentUser.id }),
    });
    const doc = await res.json();
    router.push(`/editor/${doc.id}`);
  }

  function handleDocumentDeleted(id: string) {
    setOwned((prev) => prev.filter((d) => d.id !== id));
  }

  function handleDocumentRenamed(id: string, title: string) {
    setOwned((prev) =>
      prev.map((d) => (d.id === id ? { ...d, title } : d))
    );
  }

  function handleImport(title: string, docId: string) {
    router.push(`/editor/${docId}`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Collab Editor</h1>
            <p className="text-xs text-gray-500">Lightweight collaborative document editor</p>
          </div>
          <UserSwitcher currentUser={activeUser} onChange={setActiveUser} />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Create + Import row */}
        <div className="flex flex-wrap gap-3 mb-8">
          <form onSubmit={handleCreate} className="flex gap-2 flex-1 min-w-[280px]">
            <input
              type="text"
              placeholder="New document title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-400"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              + New
            </button>
          </form>
          <FileUpload
            currentUserId={currentUser.id}
            onImport={handleImport}
          />
        </div>

        {/* Document list */}
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Loading documents…</div>
        ) : (
          <DocumentList
            owned={owned}
            shared={shared}
            currentUserId={currentUser.id}
            onDocumentDeleted={handleDocumentDeleted}
            onDocumentRenamed={handleDocumentRenamed}
          />
        )}
      </main>
    </div>
  );
}
