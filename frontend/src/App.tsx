import { useEffect, useState } from "react";
import type { ChatMessage, Document, Conversation } from "./types";

import Sidebar from "./components/sidebar/Sidebar";
import Header from "./components/chat/Header";
import HeroSection from "./components/chat/HeroSection";
import SuggestionCards from "./components/chat/SuggestionCards";
import PromptInput from "./components/chat/PromptInput";
import ChatWindow from "./components/chat/ChatWindow";
import {
  sendMessage,
  type ChatResponse,
} from "./services/chatService";
import {
  getDocumentTopics,
  type DocumentTopic,
} from "./services/documentService";
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

  const [topics, setTopics] = useState<DocumentTopic[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);

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
  }, [conversations.length]);

  const currentConversation = conversations.find(
    (conversation) => conversation.id === currentConversationId
  );

  const messages = currentConversation?.messages ?? [];

  /**
   * Add a message to the currently active conversation.
   */
  const addMessageToConversation = (
    message: ChatMessage
  ) => {
    if (!currentConversationId) return;

    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === currentConversationId
          ? {
              ...conversation,
              messages: [
                ...conversation.messages,
                message,
              ],
            }
          : conversation
      )
    );
  };

  /**
   * Fetch topics for the uploaded document.
   */
  const loadDocumentTopics = async (
    document: Document
  ) => {
    if (document.status !== "indexed") {
      return;
    }

    setTopics([]);
    setTopicsLoading(true);

    try {
      const response = await getDocumentTopics(
        Number(document.id)
      );

      setTopics(response.topics);
    } catch (error) {
      console.error(
        "Failed to load document topics:",
        error
      );

      setTopics([]);
    } finally {
      setTopicsLoading(false);
    }
  };

  /**
   * Handle a successfully uploaded document.
   */
  const handleDocumentUpload = (
    document: Document
  ) => {
    setUploadedDocument(document);

    setTopics([]);

    if (document.status === "indexed") {
      loadDocumentTopics(document);
    }
  };

  /**
   * Ask the RAG backend.
   */
  const askDocument = async (
    question: string,
    userMessageContent?: string,
    mode: "ask" | "explain" | "summarize" = "ask"
  ) => {
    if (!currentConversationId || !uploadedDocument) {
      return;
    }

    if (userMessageContent) {
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "user",
        content: userMessageContent,
        timestamp: new Date().toISOString(),
      };

      addMessageToConversation(userMessage);
    }

    setIsTyping(true);

    try {
      const response: ChatResponse =
        await sendMessage(
          question,
          Number(uploadedDocument.id),
          mode
        );

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "assistant",
        content: response.answer,
        timestamp: new Date().toISOString(),
        sources: response.sources.map(
          (source) => ({
            documentName:
              uploadedDocument.filename,
            page: source.page,
            score: source.score,
          })
        ),
      };

      addMessageToConversation(
        assistantMessage
      );
    } catch (error) {
      console.error(error);

      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "assistant",
        content:
          "Unable to process the document right now. Please try again.",
        timestamp: new Date().toISOString(),
      };

      addMessageToConversation(
        errorMessage
      );
    } finally {
      setIsTyping(false);
    }
  };

  /**
   * Normal user question.
   */
  const handleSend = async () => {
    if (
      !prompt.trim() ||
      !currentConversationId
    ) {
      return;
    }

    const question = prompt.trim();

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      content: question,
      timestamp: new Date().toISOString(),
    };

    addMessageToConversation(userMessage);

    setPrompt("");
    setIsTyping(true);

    try {
      const response = await sendMessage(
        question,
        uploadedDocument
          ? Number(uploadedDocument.id)
          : undefined,
        "ask"
      );

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "assistant",
        content: response.answer,
        timestamp: new Date().toISOString(),
        sources: response.sources.map(
          (source) => ({
            documentName:
              uploadedDocument?.filename ??
              "Document",
            page: source.page,
            score: source.score,
          })
        ),
      };

      addMessageToConversation(
        assistantMessage
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

      addMessageToConversation(
        errorMessage
      );
    } finally {
      setIsTyping(false);
    }
  };

  /**
   * Explain the uploaded document.
   */
  const handleExplain = async () => {
    if (!uploadedDocument || isTyping) {
      return;
    }

    await askDocument(
      "Explain the content of this document.",
      "Explain this document",
      "explain"
    );
  };

  /**
   * Summarize the uploaded document.
   */
  const handleSummarize = async () => {
    if (!uploadedDocument || isTyping) {
      return;
    }

    await askDocument(
      "Summarize the content of this document.",
      "Summarize this document",
      "summarize"
    );
  };

  /**
   * Remove the current document.
   */
  const handleRemoveDocument = () => {
    setUploadedDocument(null);
    setTopics([]);
    setTopicsLoading(false);
  };

  /**
   * Create a new conversation.
   */
  const handleNewChat = () => {
    const id = crypto.randomUUID();

    const newConversation: Conversation = {
      id,
      title: "New Chat",
      createdAt: new Date().toISOString(),
      messages: [],
    };

    setConversations((prev) => [
      ...prev,
      newConversation,
    ]);

    setCurrentConversationId(id);
    setPrompt("");
  };

  return (
    <div className="relative h-screen">
      <DragDropOverlay
        onUploadSuccess={
          handleDocumentUpload
        }
      />

      <div className="flex h-screen bg-[#121212] text-slate-200 font-sans text-2xl antialiased overflow-hidden select-none">
        <Sidebar
          conversations={conversations}
          currentConversationId={
            currentConversationId
          }
          onSelectConversation={
            setCurrentConversationId
          }
          onNewChat={handleNewChat}
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
  onExplain={handleExplain}
  onSummarize={handleSummarize}
  isTyping={isTyping}
  topics={topics}
  topicsLoading={topicsLoading}
/>
        </div>
      </div>
    </div>
  );
}