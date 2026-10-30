import api from "../api/axios";

export type StudyDifficulty = "easy" | "medium" | "hard";

export interface ShortNotesResponse {
  document_id: number;
  title: string;
  content: string;
  sources: StudySource[];
}

export interface StudySource {
  document_id: number;
  page: number;
  chunk_index: number;
  text: string;
  score: number;
}

export interface MCQItem {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  page: number | null;
}

export interface MCQResponse {
  document_id: number;
  title: string;
  questions: MCQItem[];
}

// ------------------------------------------------------------
// Short Notes
// ------------------------------------------------------------

export async function generateShortNotes(
  documentId: number
): Promise<ShortNotesResponse> {
  const response = await api.post<ShortNotesResponse>(
    "/study/short-notes",
    {
      document_id: documentId,
    }
  );

  return response.data;
}

// ------------------------------------------------------------
// MCQs
// ------------------------------------------------------------

export async function generateMCQs(
  documentId: number,
  count = 10,
  difficulty: StudyDifficulty = "medium"
): Promise<MCQResponse> {
  const response = await api.post<MCQResponse>(
    "/study/mcq",
    {
      document_id: documentId,
      count,
      difficulty,
    }
  );

  return response.data;
}

// ------------------------------------------------------------
// PDF Downloads
// ------------------------------------------------------------

export async function downloadShortNotesPDF(
  documentId: number
): Promise<Blob> {
  const response = await api.post(
    "/study/short-notes/pdf",
    {
      document_id: documentId,
    },
    {
      responseType: "blob",
    }
  );

  return response.data;
}

export async function downloadMCQPDF(
  documentId: number,
  count = 10,
  difficulty: StudyDifficulty = "medium"
): Promise<Blob> {
  const response = await api.post(
    "/study/mcq/pdf",
    {
      document_id: documentId,
      count,
      difficulty,
    },
    {
      responseType: "blob",
    }
  );

  return response.data;
}

// ------------------------------------------------------------
// Browser download helper
// ------------------------------------------------------------

export function saveBlobAsPDF(
  blob: Blob,
  filename: string
): void {
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);

  link.click();

  link.remove();

  window.URL.revokeObjectURL(url);
}