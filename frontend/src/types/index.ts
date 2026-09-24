export type DocumentType = "study" | "general" | "empty";

export interface Source {
  documentName: string;
  page: number;
  score: number;
}

export interface Document {
  id: string;
  title: string;
  filename: string;
  fileSize: string;
  uploadedAt: string;

  status:
    | "uploading"
    | "processing"
    | "uploaded"
    | "indexed"
    | "failed";

  documentType: DocumentType;

  totalPages: number;

  progress?: number;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  content: string;
  timestamp: string;
  sources?: Source[];
  document?: Document;
}

export interface SearchResult {
  id: string;
  documentTitle: string;
  snippet: string;
  score: number;
}

export interface DashboardStats {
  totalDocuments: number;
  totalQueries: number;
  indexedPages: number;
  activeUsers: number;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
}