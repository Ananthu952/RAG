import { useEffect, useRef } from "react";
import type { ChatMessage } from "../../types";
import TypingIndicator from "./TypingIndicator";
import { Bot, User } from "lucide-react";

interface ChatWindowProps {
  messages: ChatMessage[];
  isTyping: boolean;
}

export default function ChatWindow({
  messages,
  isTyping,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  return (
    <div className="w-full max-w-4xl mx-auto flex-1 overflow-y-auto px-6 py-8 space-y-6 no-scrollbar">
      <div className="space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${
              message.sender === "user"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            {/* AI Avatar */}
            {message.sender === "assistant" && (
              <div className="w-10 h-10 rounded-full bg-[#00E5FF] flex items-center justify-center shrink-0">
  <Bot size={20} className="text-black" />
</div>
            )}

            {/* Message Bubble */}
            <div
              className={`max-w-3xl rounded-2xl px-5 py-4 ${
                message.sender === "user"
                  ? "bg-[#00E5FF] text-black"
                  : "bg-[#1b1b1b] border border-[#2a2a2a] text-slate-200"
              }`}
            >
              <p className="text-xs opacity-60 mb-2 font-medium">
                {message.sender === "user" ? "You" : "Aureum AI"}
              </p>

              <p className="text-sm leading-7 whitespace-pre-wrap">
                {message.content}
              </p>

              {/* Source cards will be added here later */}
            </div>

            {/* User Avatar */}
            {message.sender === "user" && (
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
  <User size={20} className="text-white" />
</div>
            )}
          </div>
        ))}

        {/* AI Typing Indicator */}
        {isTyping && (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#00E5FF] flex items-center justify-center shrink-0">
  <Bot size={20} className="text-black" />
</div>

            <TypingIndicator />
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}