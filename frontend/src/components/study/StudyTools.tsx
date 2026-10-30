import { useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  Loader2,
  Sparkles,
} from "lucide-react";

import {
  downloadMCQPDF,
  downloadShortNotesPDF,
  generateMCQs,
  generateShortNotes,
  saveBlobAsPDF,
  type MCQResponse,
  type ShortNotesResponse,
  type StudyDifficulty,
} from "../../services/studyService";

interface StudyToolsProps {
  documentId: number;
  documentType: "study" | "general" | "empty";
}

export default function StudyTools({
  documentId,
  documentType,
}: StudyToolsProps) {
  const [activeTool, setActiveTool] = useState<
    "notes" | "mcq" | null
  >(null);

  const [notes, setNotes] =
    useState<ShortNotesResponse | null>(null);

  const [mcqs, setMcqs] =
    useState<MCQResponse | null>(null);

  const [notesLoading, setNotesLoading] =
    useState(false);

  const [mcqLoading, setMcqLoading] =
    useState(false);

  const [notesDownloading, setNotesDownloading] =
    useState(false);

  const [mcqDownloading, setMcqDownloading] =
    useState(false);

  const [mcqCount, setMcqCount] =
    useState(10);

  const [difficulty, setDifficulty] =
    useState<StudyDifficulty>("medium");

  const [expandedQuestion, setExpandedQuestion] =
    useState<number | null>(null);

  // Study tools are currently intended for
  // study-classified documents.
  if (documentType !== "study") {
    return null;
  }

  // ----------------------------------------------------------
  // Generate Short Notes
  // ----------------------------------------------------------

  const handleGenerateNotes = async () => {
    try {
      setNotesLoading(true);
      setActiveTool("notes");

      const result =
        await generateShortNotes(documentId);

      setNotes(result);
    } catch (error) {
      console.error(
        "Failed to generate short notes:",
        error
      );
    } finally {
      setNotesLoading(false);
    }
  };

  // ----------------------------------------------------------
  // Download Short Notes
  // ----------------------------------------------------------

  const handleDownloadNotes = async () => {
    try {
      setNotesDownloading(true);

      const blob =
        await downloadShortNotesPDF(documentId);

      saveBlobAsPDF(
        blob,
        "aureum-short-notes.pdf"
      );
    } catch (error) {
      console.error(
        "Failed to download short notes:",
        error
      );
    } finally {
      setNotesDownloading(false);
    }
  };

  // ----------------------------------------------------------
  // Generate MCQs
  // ----------------------------------------------------------

  const handleGenerateMCQs = async () => {
    try {
      setMcqLoading(true);
      setActiveTool("mcq");

      const result =
        await generateMCQs(
          documentId,
          mcqCount,
          difficulty
        );

      setMcqs(result);
    } catch (error) {
      console.error(
        "Failed to generate MCQs:",
        error
      );
    } finally {
      setMcqLoading(false);
    }
  };

  // ----------------------------------------------------------
  // Download MCQs
  // ----------------------------------------------------------

  const handleDownloadMCQs = async () => {
    try {
      setMcqDownloading(true);

      const blob =
        await downloadMCQPDF(
          documentId,
          mcqCount,
          difficulty
        );

      saveBlobAsPDF(
        blob,
        "aureum-mcqs.pdf"
      );
    } catch (error) {
      console.error(
        "Failed to download MCQs:",
        error
      );
    } finally {
      setMcqDownloading(false);
    }
  };

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      {/* ---------------------------------------------------- */}
      {/* Header */}
      {/* ---------------------------------------------------- */}

      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
          <Sparkles
            size={18}
            className="text-emerald-400"
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white">
            Study Tools
          </h3>

          <p className="text-xs text-gray-500">
            Learn, practice and revise this document
          </p>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* Tool Buttons */}
      {/* ---------------------------------------------------- */}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleGenerateNotes}
          className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
            activeTool === "notes"
              ? "border-emerald-500/40 bg-emerald-500/10"
              : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
          }`}
        >
          <div className="flex items-center gap-3">
            <FileText
              size={18}
              className="text-emerald-400"
            />

            <div>
              <p className="text-sm font-medium text-white">
                Short Notes
              </p>

              <p className="text-xs text-gray-500">
                Create revision notes
              </p>
            </div>
          </div>

          {activeTool === "notes" ? (
            <ChevronUp
              size={16}
              className="text-gray-500"
            />
          ) : (
            <ChevronDown
              size={16}
              className="text-gray-500"
            />
          )}
        </button>

        <button
          type="button"
          onClick={handleGenerateMCQs}
          className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
            activeTool === "mcq"
              ? "border-emerald-500/40 bg-emerald-500/10"
              : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
          }`}
        >
          <div className="flex items-center gap-3">
            <CheckCircle2
              size={18}
              className="text-emerald-400"
            />

            <div>
              <p className="text-sm font-medium text-white">
                MCQ Practice
              </p>

              <p className="text-xs text-gray-500">
                Generate practice questions
              </p>
            </div>
          </div>

          {activeTool === "mcq" ? (
            <ChevronUp
              size={16}
              className="text-gray-500"
            />
          ) : (
            <ChevronDown
              size={16}
              className="text-gray-500"
            />
          )}
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* Short Notes */}
      {/* ---------------------------------------------------- */}

      {activeTool === "notes" && (
        <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
          {notesLoading ? (
            <div className="flex items-center gap-3 py-6 text-sm text-gray-400">
              <Loader2
                size={18}
                className="animate-spin text-emerald-400"
              />

              Generating your short notes...
            </div>
          ) : notes ? (
            <>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    {notes.title}
                  </h4>

                  <p className="mt-1 text-xs text-gray-500">
                    Generated from the uploaded document
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadNotes}
                  disabled={notesDownloading}
                  className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-gray-200 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {notesDownloading ? (
                    <Loader2
                      size={14}
                      className="animate-spin"
                    />
                  ) : (
                    <Download size={14} />
                  )}

                  Download PDF
                </button>
              </div>

              <div className="max-h-[500px] overflow-y-auto rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="whitespace-pre-wrap text-sm leading-7 text-gray-300">
                  {notes.content}
                </div>
              </div>
            </>
          ) : (
            <div className="py-4">
              <p className="mb-4 text-sm text-gray-400">
                Generate concise revision notes from this
                document.
              </p>

              <button
                type="button"
                onClick={handleGenerateNotes}
                className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-emerald-400"
              >
                <BookOpen size={16} />

                Generate Short Notes
              </button>
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MCQs */}
      {/* ---------------------------------------------------- */}

      {activeTool === "mcq" && (
        <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
          {/* MCQ Settings */}

          {!mcqs && !mcqLoading && (
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs text-gray-500">
                  Number of questions
                </label>

                <select
                  value={mcqCount}
                  onChange={(event) =>
                    setMcqCount(
                      Number(event.target.value)
                    )
                  }
                  className="
                    w-full
                    appearance-none
                    rounded-lg
                    border border-[#2a2a2a]
                    bg-[#181818]
                    px-3 py-2
                    text-sm text-slate-200
                    outline-none
                    transition-colors
                    hover:border-[#3a3a3a]
                    focus:border-emerald-500/60
                    focus:ring-1
                    focus:ring-emerald-500/20
                    cursor-pointer
                  "
                >
                  <option value={5} className="bg-[#181818] text-slate-200">
                    5 Questions
                  </option>

                  <option value={10} className="bg-[#181818] text-slate-200">
                    10 Questions
                  </option>

                  <option value={15} className="bg-[#181818] text-slate-200">
                    15 Questions
                  </option>

                  <option value={20} className="bg-[#181818] text-slate-200">
                    20 Questions
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs text-gray-500">
                  Difficulty
                </label>

                <select
                  value={difficulty}
                  onChange={(event) =>
                    setDifficulty(
                      event.target
                        .value as StudyDifficulty
                    )
                  }
                  className="
                    w-full
                    appearance-none
                    rounded-lg
                    border border-[#2a2a2a]
                    bg-[#181818]
                    px-3 py-2
                    text-sm text-slate-200
                    outline-none
                    transition-colors
                    hover:border-[#3a3a3a]
                    focus:border-emerald-500/60
                    focus:ring-1
                    focus:ring-emerald-500/20
                    cursor-pointer
                  "
                >
                  <option value="easy" className="bg-[#181818] text-slate-200">
                    Easy
                  </option>

                  <option value="medium" className="bg-[#181818] text-slate-200">
                    Medium
                  </option>

                  <option value="hard" className="bg-[#181818] text-slate-200">
                    Hard
                  </option>
                </select>
              </div>
            </div>
          )}

          {mcqLoading ? (
            <div className="flex items-center gap-3 py-6 text-sm text-gray-400">
              <Loader2
                size={18}
                className="animate-spin text-emerald-400"
              />

              Generating MCQs...
            </div>
          ) : mcqs ? (
            <>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    {mcqs.title}
                  </h4>

                  <p className="mt-1 text-xs text-gray-500">
                    {mcqs.questions.length} questions
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadMCQs}
                  disabled={mcqDownloading}
                  className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-gray-200 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {mcqDownloading ? (
                    <Loader2
                      size={14}
                      className="animate-spin"
                    />
                  ) : (
                    <Download size={14} />
                  )}

                  Download PDF
                </button>
              </div>

              <div className="space-y-2">
                {mcqs.questions.map(
                  (question, index) => {
                    const isExpanded =
                      expandedQuestion === index;

                    return (
                      <div
                        key={`${question.question}-${index}`}
                        className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedQuestion(
                              isExpanded
                                ? null
                                : index
                            )
                          }
                          className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left"
                        >
                          <div className="flex gap-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-xs font-semibold text-emerald-400">
                              {index + 1}
                            </span>

                            <span className="text-sm leading-6 text-gray-200">
                              {question.question}
                            </span>
                          </div>

                          {isExpanded ? (
                            <ChevronUp
                              size={16}
                              className="mt-1 shrink-0 text-gray-500"
                            />
                          ) : (
                            <ChevronDown
                              size={16}
                              className="mt-1 shrink-0 text-gray-500"
                            />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="border-t border-white/10 px-4 pb-4 pt-3">
                            <div className="space-y-2">
                              {question.options.map(
                                (
                                  option,
                                  optionIndex
                                ) => {
                                  const isAnswer =
                                    option ===
                                    question.answer;

                                  return (
                                    <div
                                      key={option}
                                      className={`rounded-lg border px-3 py-2 text-sm ${
                                        isAnswer
                                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                          : "border-white/5 bg-white/[0.02] text-gray-400"
                                      }`}
                                    >
                                      <span className="mr-2 font-medium">
                                        {String.fromCharCode(
                                          65 +
                                            optionIndex
                                        )}
                                        .
                                      </span>

                                      {option}

                                      {isAnswer && (
                                        <span className="ml-2 text-xs">
                                          ✓ Correct
                                        </span>
                                      )}
                                    </div>
                                  );
                                }
                              )}
                            </div>

                            {question.explanation && (
                              <div className="mt-4 rounded-lg bg-white/[0.03] p-3">
                                <p className="mb-1 text-xs font-semibold text-gray-400">
                                  Explanation
                                </p>

                                <p className="text-sm leading-6 text-gray-400">
                                  {question.explanation}
                                </p>
                              </div>
                            )}

                            {question.page && (
                              <p className="mt-3 text-xs text-gray-600">
                                Source: Page{" "}
                                {question.page}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setMcqs(null);
                  setExpandedQuestion(null);
                }}
                className="mt-4 text-xs text-gray-500 transition hover:text-gray-300"
              >
                Generate a new set
              </button>
            </>
          ) : (
            <div className="py-2">
              <p className="mb-4 text-sm text-gray-400">
                Generate multiple-choice questions from
                this document.
              </p>

              <button
                type="button"
                onClick={handleGenerateMCQs}
                className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-emerald-400"
              >
                <CheckCircle2 size={16} />

                Generate MCQs
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}