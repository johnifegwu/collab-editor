export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  ownerId: string;
  ownerName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentAccess {
  id: string;
  documentId: string;
  userId: string;
  createdAt: string;
}

export type MockUser = "alice" | "bob";
