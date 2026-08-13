import { useEffect, useState } from "react";
import type { ChatMessage, Document, Conversation } from "./types";

import Sidebar from "./components/sidebar/Sidebar";
import Header from "./components/chat/Header";
import HeroSection from "./components/chat/HeroSection";
import SuggestionCards from "./components/chat/SuggestionCards";
import PromptInput from "./components/chat/PromptInput";
import ChatWindow from "./components/chat/ChatWindow";
import { sendMessage } from "./services/chatService";
import { suggestions } from "./constants/suggestions";
import DragDropOverlay from "./components/upload/DragDropOverlay";

export default function App() {
  const [activeTab, setActiveTab] = useState<
    "Research" | "Analytics" | "Workspace"
  >("Research");

  const [prompt, setPrompt] = useState("");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] =
    useState<string | null>(null);

  const [isTyping, setIsTyping] = useState(false);

  const [uploadedDocument, setUploadedDocument] =
    useState<Document | null>(null);

  useEffect(() => {
    if (conversations.length === 0) {
      const id = crypto.randomUUID();

      setConversations([
        {
          id,
          title: "New Chat",
          createdAt: new Date().toISOString(),
          messages: [],
        },
      ]);

      setCurrentConversationId(id);
    }
  }, []);

  const currentConversation = conversations.find(
    (conversation) => conversation.id === currentConversationId
  );

  const messages = currentConversation?.messages ?? [];

  const handleSend = async () => {
    if (!prompt.trim() || !currentConversationId) return;

    const question = prompt;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      content: question,
      timestamp: new Date().toISOString(),
    };

    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === currentConversationId
          ? {
              ...conversation,
              messages: [...conversation.messages, userMessage],
            }
          : conversation
      )
    );

    setPrompt("");
    setIsTyping(true);

    try {
      const response = await sendMessage(question);

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "assistant",
        content: response.answer,
        timestamp: new Date().toISOString(),
        sources: response.sources,
      };

      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === currentConversationId
            ? {
                ...conversation,
                messages: [...conversation.messages, assistantMessage],
              }
            : conversation
        )
      );
    } catch (error) {
      console.error(error);

      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "assistant",
        content:
          "Unable to connect to the server. Please try again later.",
        timestamp: new Date().toISOString(),
      };

      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === currentConversationId
            ? {
                ...conversation,
                messages: [...conversation.messages, errorMessage],
              }
            : conversation
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="relative h-screen">
      <DragDropOverlay
        onUploadSuccess={(file) => {
          setUploadedDocument({
            id: crypto.randomUUID(),
            title: file.name,
            filename: file.name,
            fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
            uploadedAt: new Date().toISOString(),
            status: "indexed",
          });
        }}
      />

      <div className="flex h-screen bg-[#121212] text-slate-200 font-sans text-2xl antialiased overflow-hidden select-none">
        <Sidebar
  conversations={conversations}
  currentConversationId={currentConversationId}
  onSelectConversation={setCurrentConversationId}
  onNewChat={() => {
    const id = crypto.randomUUID();

    const newConversation: Conversation = {
      id,
      title: "New Chat",
      createdAt: new Date().toISOString(),
      messages: [],
    };

    setConversations((prev) => [...prev, newConversation]);
    setCurrentConversationId(id);
    setPrompt("");
  }}
/>

        <div className="flex-1 flex flex-col h-screen bg-[#121212] overflow-hidden">
          <Header
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          <main
            className={`flex-1 flex flex-col overflow-hidden px-6 max-w-4xl mx-auto w-full ${
              messages.length === 0
                ? "items-center justify-center"
                : "pt-6"
            }`}
          >
            {messages.length === 0 ? (
              <>
                <HeroSection />
                <SuggestionCards
                  suggestions={suggestions}
                  setPrompt={setPrompt}
                />
              </>
            ) : (
              <ChatWindow
                messages={messages}
                isTyping={isTyping}
              />
            )}
          </main>

          <PromptInput
            prompt={prompt}
            setPrompt={setPrompt}
            onSend={handleSend}
            uploadedDocument={uploadedDocument}
            setUploadedDocument={setUploadedDocument}
          />
        </div>
      </div>
    </div>
  );
}