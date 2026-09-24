import React, { useRef } from "react";
import { Paperclip, Mic, ArrowRight } from "lucide-react";

import { uploadDocument } from "../../services/documentService";
import type { Document } from "../../types";

import DocumentCard from "../upload/DocumentCard";
import type { DocumentTopic } from "../upload/DocumentCard";

interface PromptInputProps {
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  onSend: () => void;

  uploadedDocument: Document | null;
  setUploadedDocument: React.Dispatch<
    React.SetStateAction<Document | null>
  >;

  onExplain: () => void;
  onSummarize: () => void;

  isTyping: boolean;

  topics: DocumentTopic[];
  topicsLoading: boolean;
}

export default function PromptInput({
  prompt,
  setPrompt,
  onSend,
  uploadedDocument,
  setUploadedDocument,
  onExplain,
  onSummarize,
  isTyping,
  topics,
  topicsLoading,
}: PromptInputProps) {
  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      alert("Please select a PDF file.");
      e.target.value = "";
      return;
    }

    try {
      const document = await uploadDocument(file);

      setUploadedDocument(document);
    } catch (error) {
      console.error(
        "Document upload failed:",
        error
      );

      alert(
        "❌ Upload failed. Please try again."
      );
    }

    e.target.value = "";
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-6 pb-8">
      {/* Uploaded document */}
      {uploadedDocument && (
        <div className="mb-4">
          <DocumentCard
            document={uploadedDocument}
            onRemove={() =>
              setUploadedDocument(null)
            }
            onExplain={onExplain}
            onSummarize={onSummarize}
            topics={topics}
            topicsLoading={topicsLoading}
          />
        </div>
      )}

      {/* Prompt input */}
      <div className="relative bg-[#181818] border border-[#2a2a2a] rounded-xl p-2 flex items-center gap-3 shadow-2xl">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          hidden
          onChange={handleUpload}
        />

        {/* Upload */}
        <button
          type="button"
          onClick={() =>
            fileInputRef.current?.click()
          }
          disabled={isTyping}
          className="p-2.5 bg-[#00E5FF] hover:bg-[#33ECFF] disabled:opacity-40 disabled:cursor-not-allowed text-black rounded-lg transition-colors"
          aria-label="Upload PDF"
          title="Upload PDF"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        {/* Text input */}
        <input
          type="text"
          value={prompt}
          onChange={(e) =>
            setPrompt(e.target.value)
          }
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey
            ) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder={
            uploadedDocument
              ? "Ask anything about this document..."
              : "Ask Aureum about your documents..."
          }
          disabled={isTyping}
          className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none disabled:opacity-50"
        />

        {/* Voice */}
        <button
          type="button"
          disabled
          className="p-2 text-slate-500 rounded-lg cursor-not-allowed"
          aria-label="Voice input"
          title="Voice input coming soon"
        >
          <Mic className="w-4 h-4" />
        </button>

        {/* Send */}
        <button
          type="button"
          onClick={onSend}
          disabled={
            !prompt.trim() || isTyping
          }
          className="p-2.5 bg-[#00E5FF] hover:bg-[#33ECFF] disabled:opacity-40 disabled:cursor-not-allowed text-black rounded-lg transition-colors"
          aria-label="Send message"
          title="Send"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <p className="text-[10px] text-slate-600 text-center mt-3">
        Aureum AI can make mistakes. Verify
        critical document data.
      </p>
    </div>
  );
}