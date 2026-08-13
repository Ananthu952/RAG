import React, { useRef } from "react";
import { Paperclip, Mic, ArrowRight } from "lucide-react";
import { uploadDocument } from "../../services/documentService";
import type { Document } from "../../types";
import DocumentCard from "../upload/DocumentCard";

interface PromptInputProps {
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  onSend: () => void;

  uploadedDocument: Document | null;
  setUploadedDocument: React.Dispatch<
    React.SetStateAction<Document | null>
  >;
}

export default function PromptInput({
  prompt,
  setPrompt,
  onSend,
  uploadedDocument,
  setUploadedDocument,
}: PromptInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      await uploadDocument(file);

      setUploadedDocument({
        id: Date.now().toString(),
        title: file.name,
        filename: file.name,
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        uploadedAt: new Date().toISOString(),
        status: "indexed",
      });
    } catch (error) {
      console.error(error);
      alert("❌ Upload failed.");
    }

    e.target.value = "";
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-6 pb-8">

      {/* Uploaded Document Preview */}
      {uploadedDocument && (
        <div className="mb-4">
          <DocumentCard
            document={uploadedDocument}
            onRemove={() => setUploadedDocument(null)}
          />
        </div>
      )}

      {/* Input Box */}
      <div className="relative bg-[#181818] border border-[#2a2a2a] rounded-xl p-2 flex items-center gap-3 shadow-2xl">

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          hidden
          onChange={handleUpload}
        />

        {/* Upload Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 bg-[#00E5FF] hover:bg-[#33ECFF] text-black rounded-lg transition-colors"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        {/* Chat Input */}
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSend();
            }
          }}
          placeholder="Ask Aureum about your documents..."
          className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
        />

        {/* Microphone */}
        <button className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-[#242424] transition-colors">
          <Mic className="w-4 h-4" />
        </button>

        {/* Send Button */}
        <button
          onClick={onSend}
          className="p-2.5 bg-[#00E5FF] hover:bg-[#33ECFF] text-black rounded-lg transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <p className="text-[10px] text-slate-600 text-center mt-3">
        Aureum AI can make mistakes. Verify critical document data.
      </p>
    </div>
  );
}