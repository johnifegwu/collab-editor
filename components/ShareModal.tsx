"use client";

import { useState, useEffect } from "react";

interface ShareModalProps {
  documentId: string;
  documentTitle: string;
  currentUserId: string;
  onClose: () => void;
}

interface AccessUser {
  id: string;
  name: string;
  email: string;
}

export default function ShareModal({
  documentId,
  documentTitle,
  currentUserId,
  onClose,
}: ShareModalProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [accessList, setAccessList] = useState<AccessUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/share?documentId=${documentId}`)
      .then((r) => r.json())
      .then((d) => setAccessList(d.access ?? []));
  }, [documentId]);

  async function handleShare(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    const res = await fetch("/api/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId, email, requesterId: currentUserId }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setStatus({ type: "error", msg: data.error });
    } else {
      setStatus({ type: "success", msg: `Shared with ${email}` });
      setEmail("");
      // Refresh access list
      const refreshed = await fetch(`/api/share?documentId=${documentId}`);
      const d = await refreshed.json();
      setAccessList(d.access ?? []);
    }
  }

  async function handleRevoke(userId: string) {
    await fetch("/api/share", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId, userId, requesterId: currentUserId }),
    });
    setAccessList((prev) => prev.filter((u) => u.id !== userId));
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Share Document</h2>
            <p className="text-xs text-gray-500 truncate mt-0.5">{documentTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-light"
          >
            ×
          </button>
        </div>

        {/* Invite form */}
        <div className="px-6 py-4">
          <form onSubmit={handleShare} className="flex gap-2">
            <input
              type="email"
              placeholder="Enter email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-400"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "…" : "Share"}
            </button>
          </form>

          {status && (
            <p
              className={`text-xs mt-2 ${
                status.type === "success" ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {status.msg}
            </p>
          )}

          <p className="text-xs text-gray-400 mt-2">
            Available users: alice@example.com, bob@example.com
          </p>
        </div>

        {/* Access list */}
        {accessList.length > 0 && (
          <div className="px-6 pb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              People with access
            </h3>
            <ul className="space-y-2">
              {accessList.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-700">
                    {u.name}{" "}
                    <span className="text-gray-400">({u.email})</span>
                  </span>
                  <button
                    onClick={() => handleRevoke(u.id)}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
