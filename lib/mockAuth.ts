/**
 * Mock authentication using a simple cookie/localStorage approach.
 * Two seeded users: alice@example.com and bob@example.com.
 */

export const MOCK_USERS = {
  alice: { id: "user_alice", email: "alice@example.com", name: "Alice" },
  bob: { id: "user_bob", email: "bob@example.com", name: "Bob" },
} as const;

export type MockUserKey = keyof typeof MOCK_USERS;

export function getMockUser(key: MockUserKey) {
  return MOCK_USERS[key];
}
