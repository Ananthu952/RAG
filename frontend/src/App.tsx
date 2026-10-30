import { useEffect, useState } from "react";
import type {
  ChatMessage,
  Document,
  Conversation,
} from "./types";

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

import {
  createConversation,
  getConversations,
  getConversation,
  addConversationMessage,
  updateConversationTitle,
  deleteConversation,
} from "./services/conversationService";

import { suggestions } from "./constants/suggestions";
import DragDropOverlay from "./components/upload/DragDropOverlay";


export default function App() {
  // --------------------------------------------------
  // Active application tab
  // --------------------------------------------------

  const [activeTab, setActiveTab] = useState<
    "Research" | "Analytics" | "Workspace"
  >("Research");


  // --------------------------------------------------
  // Prompt
  // --------------------------------------------------

  const [prompt, setPrompt] = useState("");


  // --------------------------------------------------
  // Persistent conversations
  // --------------------------------------------------

  const [conversations, setConversations] = useState<
    Conversation[]
  >([]);

  const [currentConversationId, setCurrentConversationId] =
    useState<number | null>(null);

  const [conversationsLoading, setConversationsLoading] =
    useState(true);


  // --------------------------------------------------
  // Chat state
  // --------------------------------------------------

  const [isTyping, setIsTyping] = useState(false);


  // --------------------------------------------------
  // Uploaded document
  // --------------------------------------------------

  const [uploadedDocument, setUploadedDocument] =
    useState<Document | null>(null);


  // --------------------------------------------------
  // Document topics
  // --------------------------------------------------

  const [topics, setTopics] = useState<DocumentTopic[]>([]);

  const [topicsLoading, setTopicsLoading] =
    useState(false);


  // --------------------------------------------------
  // Load conversations on application startup
  // --------------------------------------------------

  useEffect(() => {
    const loadConversations = async () => {
      try {
        setConversationsLoading(true);

        const backendConversations =
          await getConversations();

        /*
         * If the database has no conversations,
         * create the first one.
         */
        if (backendConversations.length === 0) {
          const newConversation =
            await createConversation("New Chat");

          setConversations([
            {
              id: newConversation.id,
              title: newConversation.title,
              createdAt: newConversation.created_at,
              updatedAt: newConversation.updated_at,
              messages: [],
            },
          ]);

          setCurrentConversationId(
            newConversation.id
          );

          return;
        }

        /*
         * Convert backend conversations into
         * the frontend Conversation structure.
         */
        const mappedConversations: Conversation[] =
          backendConversations.map(
            (conversation) => ({
              id: conversation.id,
              title: conversation.title,
              createdAt:
                conversation.created_at,
              updatedAt:
                conversation.updated_at,
              messages: [],
            })
          );

        setConversations(
          mappedConversations
        );

        /*
         * Open the most recently updated
         * conversation.
         */
        const latestConversation =
          mappedConversations[0];

        setCurrentConversationId(
          latestConversation.id
        );

        /*
         * Load messages for the latest conversation.
         */
        const detail =
          await getConversation(
            latestConversation.id
          );

        const messages: ChatMessage[] =
          detail.messages.map(
            (message) => ({
              id: String(message.id),
              sender: message.sender,
              content: message.content,
              timestamp:
                message.created_at,
            })
          );

        setConversations((prev) =>
          prev.map((conversation) =>
            conversation.id ===
            latestConversation.id
              ? {
                  ...conversation,
                  messages,
                }
              : conversation
          )
        );
      } catch (error) {
        console.error(
          "Failed to load conversations:",
          error
        );
      } finally {
        setConversationsLoading(false);
      }
    };

    loadConversations();
  }, []);


  // --------------------------------------------------
  // Current conversation
  // --------------------------------------------------

  const currentConversation =
    conversations.find(
      (conversation) =>
        conversation.id ===
        currentConversationId
    );

  const messages =
    currentConversation?.messages ?? [];


  // --------------------------------------------------
  // Add message locally
  // --------------------------------------------------

  const addMessageToConversation = (
    message: ChatMessage
  ) => {
    if (!currentConversationId) {
      return;
    }

    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id ===
        currentConversationId
          ? {
              ...conversation,
              messages: [
                ...conversation.messages,
                message,
              ],
              updatedAt:
                new Date().toISOString(),
            }
          : conversation
      )
    );
  };


  // --------------------------------------------------
  // Generate sidebar conversation title
  // --------------------------------------------------

  const generateConversationTitle = (
    message: string
  ) => {
    const cleanedMessage =
      message.trim();

    if (!cleanedMessage) {
      return "New Chat";
    }

    if (cleanedMessage.length <= 40) {
      return cleanedMessage;
    }

    return (
      cleanedMessage.substring(0, 40) +
      "..."
    );
  };


  // --------------------------------------------------
  // Update conversation title
  // --------------------------------------------------

  const updateCurrentConversationTitle =
    async (message: string) => {
      if (!currentConversationId) {
        return;
      }

      const conversation =
        conversations.find(
          (item) =>
            item.id ===
            currentConversationId
        );

      if (!conversation) {
        return;
      }

      /*
       * Only automatically rename a brand-new
       * conversation.
       */
      if (
        conversation.title !==
        "New Chat"
      ) {
        return;
      }

      const title =
        generateConversationTitle(
          message
        );

      /*
       * Update the sidebar immediately.
       */
      setConversations((prev) =>
        prev.map((item) =>
          item.id ===
          currentConversationId
            ? {
                ...item,
                title,
                updatedAt:
                  new Date().toISOString(),
              }
            : item
        )
      );

      /*
       * Persist the new title in the backend.
       */
      try {
        const updated =
          await updateConversationTitle(
            currentConversationId,
            title
          );

        /*
         * Synchronize frontend with
         * the backend response.
         */
        setConversations((prev) =>
          prev.map((item) =>
            item.id ===
            currentConversationId
              ? {
                  ...item,
                  title:
                    updated.title,
                  updatedAt:
                    updated.updated_at,
                }
              : item
          )
        );
      } catch (error) {
        console.error(
          "Failed to update conversation title:",
          error
        );
      }
    };


  // --------------------------------------------------
  // Select existing conversation
  // --------------------------------------------------

  const handleSelectConversation =
    async (
      conversationId: number
    ) => {
      if (
        conversationId ===
        currentConversationId
      ) {
        return;
      }

      try {
        setCurrentConversationId(
          conversationId
        );

        setPrompt("");

        const detail =
          await getConversation(
            conversationId
          );

        const messages: ChatMessage[] =
          detail.messages.map(
            (message) => ({
              id: String(message.id),
              sender: message.sender,
              content: message.content,
              timestamp:
                message.created_at,
            })
          );

        setConversations((prev) =>
          prev.map((conversation) =>
            conversation.id ===
            conversationId
              ? {
                  ...conversation,
                  title:
                    detail.title,
                  createdAt:
                    detail.created_at,
                  updatedAt:
                    detail.updated_at,
                  messages,
                }
              : conversation
          )
        );
      } catch (error) {
        console.error(
          "Failed to load conversation:",
          error
        );
      }
    };


  // --------------------------------------------------
  // Load document topics
  // --------------------------------------------------

  const loadDocumentTopics = async (
    document: Document
  ) => {
    if (
      document.status !==
      "indexed"
    ) {
      return;
    }

    setTopics([]);
    setTopicsLoading(true);

    try {
      const response =
        await getDocumentTopics(
          Number(document.id)
        );

      setTopics(
        response.topics
      );
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


  // --------------------------------------------------
  // Handle uploaded document
  // --------------------------------------------------

  const handleDocumentUpload = (
    document: Document
  ) => {
    setUploadedDocument(document);

    setTopics([]);

    if (
      document.status ===
      "indexed"
    ) {
      loadDocumentTopics(
        document
      );
    }
  };


  // --------------------------------------------------
  // Ask document
  // --------------------------------------------------

  const askDocument = async (
  question: string,
  userMessageContent?: string,
  mode:
    | "ask"
    | "explain"
    | "summarize" = "ask"
) => {
  if (
    !currentConversationId ||
    !uploadedDocument
  ) {
    return;
  }

  /*
   * Determine the message that will be shown
   * to the user and used as the conversation title.
   */
  const displayMessage =
    userMessageContent ||
    question;

  /*
   * Rename a brand-new conversation immediately.
   */
  await updateCurrentConversationTitle(
    displayMessage
  );

  /*
   * Save user message locally.
   */
  if (userMessageContent) {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      content:
        userMessageContent,
      timestamp:
        new Date().toISOString(),
    };

    addMessageToConversation(
      userMessage
    );

    /*
     * Persist user message.
     */
    try {
      await addConversationMessage(
        currentConversationId,
        "user",
        userMessageContent
      );
    } catch (error) {
      console.error(
        "Failed to save user message:",
        error
      );
    }
  }

  setIsTyping(true);

  try {
    /*
     * Ask the RAG backend.
     */
    const response: ChatResponse =
      await sendMessage(
        question,
        Number(
          uploadedDocument.id
        ),
        mode
      );

    /*
     * Create assistant message.
     */
    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: "assistant",
      content:
        response.answer,
      timestamp:
        new Date().toISOString(),
      sources:
        response.sources.map(
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

    /*
     * Persist assistant message.
     */
    try {
      await addConversationMessage(
        currentConversationId,
        "assistant",
        response.answer
      );
    } catch (error) {
      console.error(
        "Failed to save assistant message:",
        error
      );
    }
  } catch (error) {
    console.error(error);

    const errorMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: "assistant",
      content:
        "Unable to process the document right now. Please try again.",
      timestamp:
        new Date().toISOString(),
    };

    addMessageToConversation(
      errorMessage
    );

    /*
     * Persist error message too.
     */
    try {
      await addConversationMessage(
        currentConversationId,
        "assistant",
        errorMessage.content
      );
    } catch (error) {
      console.error(
        "Failed to save error message:",
        error
      );
    }
  } finally {
    setIsTyping(false);
  }
};

  // --------------------------------------------------
  // Normal question
  // --------------------------------------------------

  const handleSend = async () => {
    if (
      !prompt.trim() ||
      !currentConversationId
    ) {
      return;
    }

    const question =
      prompt.trim();

    /*
     * Rename the conversation immediately.
     *
     * This happens before the API call so the
     * sidebar changes without waiting for LLM/RAG.
     */
    await updateCurrentConversationTitle(
      question
    );

    /*
     * Add user message to UI.
     */
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      content: question,
      timestamp:
        new Date().toISOString(),
    };

    addMessageToConversation(
      userMessage
    );

    setPrompt("");
    setIsTyping(true);

    /*
     * Save user message to database.
     */
    try {
      await addConversationMessage(
        currentConversationId,
        "user",
        question
      );
    } catch (error) {
      console.error(
        "Failed to save user message:",
        error
      );
    }

    try {
      /*
       * Ask the RAG backend.
       */
      const response =
        await sendMessage(
          question,
          uploadedDocument
            ? Number(
                uploadedDocument.id
              )
            : undefined,
          "ask"
        );

      /*
       * Create assistant message.
       */
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "assistant",
        content:
          response.answer,
        timestamp:
          new Date().toISOString(),
        sources:
          response.sources.map(
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

      /*
       * Save assistant message.
       */
      try {
        await addConversationMessage(
          currentConversationId,
          "assistant",
          response.answer
        );
      } catch (error) {
        console.error(
          "Failed to save assistant message:",
          error
        );
      }
    } catch (error) {
      console.error(error);

      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "assistant",
        content:
          "Unable to connect to the server. Please try again later.",
        timestamp:
          new Date().toISOString(),
      };

      addMessageToConversation(
        errorMessage
      );

      /*
       * Save error message too, so the
       * conversation remains consistent.
       */
      try {
        await addConversationMessage(
          currentConversationId,
          "assistant",
          errorMessage.content
        );
      } catch (error) {
        console.error(
          "Failed to save error message:",
          error
        );
      }
    } finally {
      setIsTyping(false);
    }
  };


  // --------------------------------------------------
  // Explain document
  // --------------------------------------------------

  const handleExplain = async () => {
    if (
      !uploadedDocument ||
      isTyping
    ) {
      return;
    }

    await askDocument(
      "Explain the content of this document.",
      "Explain this document",
      "explain"
    );
  };


  // --------------------------------------------------
  // Summarize document
  // --------------------------------------------------

  const handleSummarize = async () => {
    if (
      !uploadedDocument ||
      isTyping
    ) {
      return;
    }

    await askDocument(
      "Summarize the content of this document.",
      "Summarize this document",
      "summarize"
    );
  };


  // --------------------------------------------------
  // Remove document
  // --------------------------------------------------

  const handleRemoveDocument = () => {
    setUploadedDocument(null);
    setTopics([]);
    setTopicsLoading(false);
  };


  // --------------------------------------------------
  // Create new persistent chat
  // --------------------------------------------------

  const handleNewChat = async () => {
    if (isTyping) {
      return;
    }

    try {
      const newConversation =
        await createConversation(
          "New Chat"
        );

      const conversation: Conversation =
        {
          id:
            newConversation.id,
          title:
            newConversation.title,
          createdAt:
            newConversation.created_at,
          updatedAt:
            newConversation.updated_at,
          messages: [],
        };

      setConversations((prev) => [
        conversation,
        ...prev,
      ]);

      setCurrentConversationId(
        conversation.id
      );

      setPrompt("");

      /*
       * A new conversation starts without
       * the previous document context.
       */
      handleRemoveDocument();
    } catch (error) {
      console.error(
        "Failed to create new conversation:",
        error
      );
    }
  };

// --------------------------------------------------
// Rename conversation
// --------------------------------------------------

const handleRenameConversation = async (
  conversationId: number,
  title: string
) => {
  const cleanedTitle = title.trim();

  if (!cleanedTitle) {
    return;
  }

  try {
    const updated =
      await updateConversationTitle(
        conversationId,
        cleanedTitle
      );

    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id ===
        conversationId
          ? {
              ...conversation,
              title: updated.title,
              updatedAt:
                updated.updated_at,
            }
          : conversation
      )
    );
  } catch (error) {
    console.error(
      "Failed to rename conversation:",
      error
    );
  }
};


// --------------------------------------------------
// Delete conversation
// --------------------------------------------------

const handleDeleteConversation = async (
  conversationId: number
) => {
  try {
    await deleteConversation(
      conversationId
    );

    const remaining =
      conversations.filter(
        (conversation) =>
          conversation.id !==
          conversationId
      );

    /*
     * If deleting the currently active chat,
     * switch to another existing chat.
     */
    if (
      currentConversationId ===
      conversationId
    ) {
      if (remaining.length > 0) {
        const nextConversation =
          remaining[0];

        setConversations(
          remaining
        );

        setCurrentConversationId(
          nextConversation.id
        );

        setPrompt("");
      } else {
        /*
         * If there are no conversations left,
         * create a fresh persistent chat.
         */
        const newConversation =
          await createConversation(
            "New Chat"
          );

        const conversation:
          Conversation = {
          id: newConversation.id,
          title:
            newConversation.title,
          createdAt:
            newConversation.created_at,
          updatedAt:
            newConversation.updated_at,
          messages: [],
        };

        setConversations([
          conversation,
        ]);

        setCurrentConversationId(
          conversation.id
        );

        setPrompt("");
      }

      return;
    }

    /*
     * Normal deletion of a non-active chat.
     */
    setConversations(
      remaining
    );
  } catch (error) {
    console.error(
      "Failed to delete conversation:",
      error
    );
  }
};
  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className="relative h-screen">

      <DragDropOverlay
        onUploadSuccess={
          handleDocumentUpload
        }
      />

      <div className="flex h-screen bg-[#121212] text-slate-200 font-sans text-2xl antialiased overflow-hidden select-none">

        {/* Sidebar */}

        <Sidebar
          conversations={
            conversations
          }
          currentConversationId={
            currentConversationId
          }
          onSelectConversation={
            handleSelectConversation
          }
          onNewChat={
            handleNewChat
          }
          onRenameConversation={
    handleRenameConversation
  }
  onDeleteConversation={
    handleDeleteConversation
  }
        />


        {/* Main application */}

        <div className="flex-1 flex flex-col h-screen bg-[#121212] overflow-hidden">

          <Header
            activeTab={
              activeTab
            }
            setActiveTab={
              setActiveTab
            }
          />


          {/* Main content */}

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
                  suggestions={
                    suggestions
                  }
                  setPrompt={
                    setPrompt
                  }
                />
              </>
            ) : (
              <ChatWindow
                messages={
                  messages
                }
                isTyping={
                  isTyping
                }
              />
            )}

          </main>


          {/* Prompt input */}

          <PromptInput
            prompt={prompt}
            setPrompt={setPrompt}
            onSend={handleSend}
            uploadedDocument={
              uploadedDocument
            }
            setUploadedDocument={
              setUploadedDocument
            }
            onExplain={
              handleExplain
            }
            onSummarize={
              handleSummarize
            }
            isTyping={
              isTyping
            }
            topics={topics}
            topicsLoading={
              topicsLoading
            }
          />

        </div>
      </div>
    </div>
  );
}