"use client";

import { MOCK_USERS, MockUserKey } from "@/lib/mockAuth";

interface UserSwitcherProps {
  currentUser: MockUserKey;
  onChange: (user: MockUserKey) => void;
}

export default function UserSwitcher({ currentUser, onChange }: UserSwitcherProps) {
  const user = MOCK_USERS[currentUser];

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-500">Signed in as:</span>
      <div className="flex gap-2">
        {(Object.keys(MOCK_USERS) as MockUserKey[]).map((key) => {
          const u = MOCK_USERS[key];
          const active = key === currentUser;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                active
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-600"
              }`}
            >
              {u.name}
            </button>
          );
        })}
      </div>
      <span className="text-xs text-gray-400">({user.email})</span>
    </div>
  );
}
