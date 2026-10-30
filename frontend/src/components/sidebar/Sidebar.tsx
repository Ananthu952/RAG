import React, { useState } from "react";
import {
  Sparkles,
  Plus,
  MessageSquare,
  FileText,
  Settings,
  HelpCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";

import type { Conversation } from "../../types";

interface SidebarProps {
  conversations: Conversation[];
  currentConversationId: number | null;
  onSelectConversation: (
    conversationId: number
  ) => void;
  onNewChat: () => void;
  onRenameConversation: (
    conversationId: number,
    title: string
  ) => void;
  onDeleteConversation: (
    conversationId: number
  ) => void;
}

export default function Sidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewChat,
  onRenameConversation,
  onDeleteConversation,
}: SidebarProps) {
  const [openMenuId, setOpenMenuId] =
    useState<number | null>(null);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [editingTitle, setEditingTitle] =
    useState("");

  const startRename = (
    conversation: Conversation
  ) => {
    setEditingId(conversation.id);
    setEditingTitle(conversation.title);
    setOpenMenuId(null);
  };

  const cancelRename = () => {
    setEditingId(null);
    setEditingTitle("");
  };

  const saveRename = (
    conversationId: number
  ) => {
    const title = editingTitle.trim();

    if (!title) {
      return;
    }

    onRenameConversation(
      conversationId,
      title
    );

    cancelRename();
  };

  const handleDelete = (
    conversationId: number
  ) => {
    setOpenMenuId(null);

    const confirmed = window.confirm(
      "Delete this conversation? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    onDeleteConversation(
      conversationId
    );
  };

  /*
   * Most recently updated conversations
   * appear first.
   */
  const sortedConversations = [
    ...conversations,
  ].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() -
      new Date(a.updatedAt).getTime()
  );

  return (
    <aside className="w-64 bg-[#181818] border-r border-[#262626] flex flex-col justify-between h-full">

      {/* Main Sidebar */}
      <div className="p-4 space-y-6 overflow-y-auto">

        {/* Brand */}
        <div className="flex items-center gap-2 px-2 py-1">
          <Sparkles className="w-5 h-5 text-[#00E5FF] fill-[#00E5FF]/20" />

          <span className="font-semibold text-white text-lg tracking-tight">
            Aureum Search
          </span>
        </div>

        {/* New Chat */}
        <button
          type="button"
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-transparent border border-[#00E5FF]/40 hover:border-[#00E5FF] rounded-lg text-[#00E5FF] font-medium text-xs tracking-wide transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>

        {/* Recent Chats */}
        <div className="space-y-1">

          <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase px-2 mb-2">
            Recent
          </p>

          {sortedConversations.length === 0 ? (
            <div className="px-2 py-3 text-[11px] text-slate-600">
              No conversations yet.
            </div>
          ) : (
            sortedConversations.map(
              (conversation) => {
                const isActive =
                  conversation.id ===
                  currentConversationId;

                const isEditing =
                  editingId ===
                  conversation.id;

                return (
                  <div
                    key={conversation.id}
                    className={`group relative rounded-lg ${
                      isActive
                        ? "bg-[#242424]"
                        : "hover:bg-[#222222]"
                    }`}
                  >

                    {/* Conversation */}
                    {isEditing ? (
                      <div className="flex items-center gap-1 px-2 py-2">

                        <input
                          autoFocus
                          value={editingTitle}
                          onChange={(event) =>
                            setEditingTitle(
                              event.target.value
                            )
                          }
                          onKeyDown={(event) => {
                            if (
                              event.key ===
                              "Enter"
                            ) {
                              saveRename(
                                conversation.id
                              );
                            }

                            if (
                              event.key ===
                              "Escape"
                            ) {
                              cancelRename();
                            }
                          }}
                          className="min-w-0 flex-1 bg-[#151515] border border-[#00E5FF]/40 rounded px-2 py-1 text-xs text-slate-200 outline-none"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            saveRename(
                              conversation.id
                            )
                          }
                          className="p-1 text-[#00E5FF] hover:bg-[#303030] rounded"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={
                            cancelRename
                          }
                          className="p-1 text-slate-500 hover:text-slate-300 hover:bg-[#303030] rounded"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          onSelectConversation(
                            conversation.id
                          )
                        }
                        className="w-full flex items-center gap-3 px-2 py-2 pr-8 text-xs font-medium transition-colors truncate text-left"
                      >
                        <MessageSquare
                          className={`w-4 h-4 shrink-0 ${
                            isActive
                              ? "text-[#00E5FF]"
                              : "text-slate-400"
                          }`}
                        />

                        <span
                          className={`truncate ${
                            isActive
                              ? "text-slate-100"
                              : "text-slate-300"
                          }`}
                        >
                          {conversation.title}
                        </span>
                      </button>
                    )}

                    {/* Three-dot menu */}
                    {!isEditing && (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();

                          setOpenMenuId(
                            openMenuId ===
                              conversation.id
                              ? null
                              : conversation.id
                          );
                        }}
                        className={`absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded text-slate-500 hover:text-slate-200 hover:bg-[#333333] ${
                          openMenuId ===
                          conversation.id
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100"
                        } transition-opacity`}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    )}

                    {/* Menu */}
                    {openMenuId ===
                      conversation.id && (
                      <div className="absolute right-1 top-full mt-1 z-50 w-32 bg-[#202020] border border-[#303030] rounded-lg shadow-xl p-1">

                        <button
                          type="button"
                          onClick={() =>
                            startRename(
                              conversation
                            )
                          }
                          className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-xs text-slate-300 hover:bg-[#303030] hover:text-white"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Rename
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              conversation.id
                            )
                          }
                          className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-xs text-red-400 hover:bg-[#303030] hover:text-red-300"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>

                      </div>
                    )}

                  </div>
                );
              }
            )
          )}
        </div>

        {/* Documents */}
        <div className="space-y-1 pt-2">

          <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase px-2 mb-2">
            Documents
          </p>

          <div className="flex items-center gap-3 p-2.5 rounded-lg text-xs text-slate-500">
            <FileText className="w-4 h-4 text-slate-600 shrink-0" />

            <div className="truncate">
              <p className="font-medium truncate">
                Documents
              </p>

              <p className="text-[10px] text-slate-600">
                Uploaded documents appear here
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[#262626] space-y-1">

        <button
          type="button"
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-[#222222] transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>

        <button
          type="button"
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-[#222222] transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Support</span>
        </button>

        {/* Profile */}
        <div className="pt-2">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#202020] border border-[#2a2a2a]">

            <div className="w-8 h-8 rounded-full bg-[#00E5FF]/20 text-white flex items-center justify-center font-bold text-xs">
              JD
            </div>

            <div className="truncate">
              <p className="text-xs font-semibold text-slate-200 truncate">
                John Doe
              </p>

              <p className="text-[10px] text-slate-500 truncate">
                Enterprise Pro
              </p>
            </div>

          </div>
        </div>

      </div>
    </aside>
  );
}