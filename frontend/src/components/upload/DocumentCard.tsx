import {
  FileText,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import type { Document } from "../../types";

interface Props {
  document: Document;
  onRemove?: () => void;
}

export default function DocumentCard({
  document,
  onRemove,
}: Props) {
  const getStatusIcon = () => {
    switch (document.status) {
      case "uploading":
      case "processing":
        return (
          <Loader2 className="w-3 h-3 text-cyan-400 animate-spin" />
        );

      case "indexed":
        return (
          <CheckCircle className="w-3 h-3 text-green-400" />
        );

      case "failed":
        return (
          <AlertCircle className="w-3 h-3 text-red-400" />
        );

      default:
        return null;
    }
  };

  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-[#303030] bg-[#1a1a1a] px-3 py-2 max-w-xs">

      <FileText className="w-4 h-4 text-cyan-400 shrink-0" />

      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-white">
          {document.filename}
        </p>

        <p className="text-[10px] text-slate-500">
          {document.fileSize}
        </p>
      </div>

      {getStatusIcon()}

      {onRemove && (
        <button
          onClick={onRemove}
          className="text-slate-500 hover:text-white"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}