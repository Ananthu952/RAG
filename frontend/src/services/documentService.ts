import api from "../api/axios";
import type { Document } from "../types";

/* =========================================================
   Backend document types
   ========================================================= */

interface BackendDocumentResponse {
  id: number;
  filename: string;
  original_filename: string;
  total_pages: number;
  file_size: number;
  status: string;
  document_type:
    | "study"
    | "general"
    | "empty";
  upload_time: string;
}

interface BackendUploadResponse {
  success: boolean;
  message: string;
  document: BackendDocumentResponse;
}

/* =========================================================
   Document topics
   ========================================================= */

export interface DocumentTopic {
  title: string;
  description: string | null;
  pages: number[];
}

export interface DocumentTopicsResponse {
  document_id: number;
  topics: DocumentTopic[];
}

/* =========================================================
   Map backend document → frontend document
   ========================================================= */

function mapBackendDocument(
  doc: BackendDocumentResponse
): Document {
  return {
    id: String(doc.id),

    title: doc.original_filename,

    filename: doc.original_filename,

    fileSize: `${(
      doc.file_size /
      1024 /
      1024
    ).toFixed(2)} MB`,

    uploadedAt: doc.upload_time,

    status:
      doc.status as Document["status"],

    documentType: doc.document_type,

    totalPages: doc.total_pages,
  };
}

/* =========================================================
   Upload document
   ========================================================= */

export async function uploadDocument(
  file: File
): Promise<Document> {
  const formData = new FormData();

  formData.append("file", file);

  const response =
    await api.post<BackendUploadResponse>(
      "/documents/upload",
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );

  return mapBackendDocument(
    response.data.document
  );
}

/* =========================================================
   Get document topics
   ========================================================= */

export async function getDocumentTopics(
  documentId: number
): Promise<DocumentTopicsResponse> {
  const response =
    await api.get<DocumentTopicsResponse>(
      `/documents/${documentId}/topics`
    );

  return response.data;
}