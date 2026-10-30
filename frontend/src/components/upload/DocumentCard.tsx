import {
  FileText,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  BookOpen,
  ListTree,
} from "lucide-react";

import type { Document } from "../../types";
import StudyTools from "../study/StudyTools";

export interface DocumentTopic {
  title: string;
  description: string | null;
  pages: number[];
}

interface Props {
  document: Document;
  onRemove?: () => void;
  onExplain?: () => void;
  onSummarize?: () => void;

  topics?: DocumentTopic[];
  topicsLoading?: boolean;
}

export default function DocumentCard({
  document,
  onRemove,
  onExplain,
  onSummarize,
  topics = [],
  topicsLoading = false,
}: Props) {
  // ----------------------------------------------------------
  // Status icon
  // ----------------------------------------------------------

  const getStatusIcon = () => {
    switch (document.status) {
      case "uploading":
      case "processing":
        return (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
        );

      case "indexed":
        return (
          <CheckCircle className="h-3.5 w-3.5 text-green-400" />
        );

      case "failed":
        return (
          <AlertCircle className="h-3.5 w-3.5 text-red-400" />
        );

      default:
        return null;
    }
  };

  const isReady = document.status === "indexed";

  const isStudyDocument =
    document.documentType === "study";

  return (
    <div className="w-full rounded-xl border border-[#303030] bg-[#181818] p-3">
      {/* ====================================================== */}
      {/* Document Information */}
      {/* ====================================================== */}

      <div className="flex items-center gap-3">
        {/* File icon */}

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10">
          <FileText className="h-5 w-5 text-cyan-400" />
        </div>

        {/* File details */}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium text-white">
              {document.filename}
            </p>

            {/* Study badge */}

            {isStudyDocument && (
              <span className="shrink-0 rounded-full bg-cyan-400/10 px-2 py-0.5 text-[9px] font-medium text-cyan-300">
                Study Material
              </span>
            )}

            {/* General badge */}

            {document.documentType === "general" && (
              <span className="shrink-0 rounded-full bg-slate-400/10 px-2 py-0.5 text-[9px] font-medium text-slate-400">
                General
              </span>
            )}
          </div>

          {/* File metadata */}

          <div className="mt-0.5 flex items-center gap-2 text-[10px] text-slate-500">
            <span>{document.fileSize}</span>

            {document.totalPages > 0 && (
              <>
                <span>•</span>

                <span>
                  {document.totalPages}{" "}
                  {document.totalPages === 1
                    ? "page"
                    : "pages"}
                </span>
              </>
            )}

            <span>•</span>

            <span className="flex items-center gap-1">
              {getStatusIcon()}
              {document.status}
            </span>
          </div>
        </div>

        {/* Remove */}

        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 rounded-md p-1.5 text-slate-500 transition-colors hover:bg-[#242424] hover:text-white"
            aria-label="Remove document"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ====================================================== */}
      {/* Ready Document Content */}
      {/* ====================================================== */}

      {isReady && (
        <>
          {/* -------------------------------------------------- */}
          {/* AI Actions */}
          {/* -------------------------------------------------- */}

          <div className="mt-3 flex items-center gap-2 border-t border-[#292929] pt-3">
            <button
              type="button"
              onClick={onExplain}
              className="flex items-center gap-1.5 rounded-lg border border-[#303030] bg-[#202020] px-3 py-1.5 text-[11px] font-medium text-slate-200 transition-colors hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300"
            >
              <Sparkles className="h-3.5 w-3.5" />

              Explain
            </button>

            <button
              type="button"
              onClick={onSummarize}
              className="flex items-center gap-1.5 rounded-lg border border-[#303030] bg-[#202020] px-3 py-1.5 text-[11px] font-medium text-slate-200 transition-colors hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300"
            >
              <BookOpen className="h-3.5 w-3.5" />

              Summarize
            </button>
          </div>

          {/* -------------------------------------------------- */}
          {/* Document Topics */}
          {/* -------------------------------------------------- */}

          <div className="mt-3 border-t border-[#292929] pt-3">
            <div className="mb-2 flex items-center gap-2">
              <ListTree className="h-3.5 w-3.5 text-cyan-400" />

              <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Document Topics
              </span>
            </div>

            {topicsLoading ? (
              <div className="flex items-center gap-2 py-2 text-[11px] text-slate-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />

                Analyzing document topics...
              </div>
            ) : topics.length > 0 ? (
              <div className="space-y-1.5">
                {topics.map((topic, index) => (
                  <div
                    key={`${topic.title}-${index}`}
                    className="rounded-lg bg-[#202020] px-3 py-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium text-slate-200">
                          {topic.title}
                        </p>

                        {topic.description && (
                          <p className="mt-0.5 text-[10px] leading-relaxed text-slate-500">
                            {topic.description}
                          </p>
                        )}
                      </div>

                      {topic.pages.length > 0 && (
                        <span className="shrink-0 text-[9px] text-slate-600">
                          p. {topic.pages.join(", ")}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-slate-600">
                No topics available.
              </p>
            )}
          </div>

          {/* -------------------------------------------------- */}
          {/* Study Tools */}
          {/* -------------------------------------------------- */}

          {isStudyDocument && (
            <StudyTools
              documentId={Number(document.id)}
              documentType={document.documentType}
            />
          )}
        </>
      )}
    </div>
  );
}