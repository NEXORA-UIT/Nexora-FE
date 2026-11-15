import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  Sparkles,
  Kanban,
  Trash2,
  Share2,
  ExternalLink,
  Bot,
} from "lucide-react";
import { toast } from "sonner";
import { useAiCopilotStore } from "@/stores/ai-copilot.store";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { boardApi } from "@/apis/board.api";
import {
  ChatMessageItem,
  ChatInputBar,
  PromptSuggestionsBar,
  PromptSuggestionsGrid,
} from "@/components/ai-copilot";
import type { Board } from "@/types";

export const AiAssistantPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeWorkspace = useWorkspaceStore((state) => state.getActiveWorkspace());
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);

  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoadingBoards, setIsLoadingBoards] = useState(false);

  const urlBoardId = searchParams.get("boardId");

  const {
    activeBoardId: storeBoardId,
    setActiveBoardId,
    threads,
    isThinking,
    thinkingStep,
    sendMessage,
    clearThread,
  } = useAiCopilotStore();

  // Determine current active board
  const currentBoardId = urlBoardId || storeBoardId || boards[0]?.id || "";

  // Fetch boards of current workspace
  useEffect(() => {
    let isMounted = true;
    if (!activeWorkspaceId) return;

    setIsLoadingBoards(true);
    boardApi
      .getBoards(activeWorkspaceId)
      .then((data) => {
        if (!isMounted) return;
        setBoards(data);
      })
      .catch((_err) => {
        if (!isMounted) return;
        toast.error("Failed to load boards.");
      })
      .finally(() => {
        if (isMounted) setIsLoadingBoards(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeWorkspaceId]);

  // Sync board id to URL and store
  useEffect(() => {
    if (currentBoardId) {
      setActiveBoardId(currentBoardId);
      if (urlBoardId !== currentBoardId) {
        setSearchParams({ boardId: currentBoardId }, { replace: true });
      }
    }
  }, [currentBoardId, urlBoardId, setActiveBoardId, setSearchParams]);

  const messages = threads[currentBoardId] || [];
  const currentBoard = boards.find((b) => b.id === currentBoardId);

  // Auto-scroll to bottom on new messages or thinking change
  useEffect(() => {
    if (typeof messagesEndRef.current?.scrollIntoView === "function") {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, isThinking]);

  const handleBoardChange = (newBoardId: string) => {
    setActiveBoardId(newBoardId);
    setSearchParams({ boardId: newBoardId });
  };

  const handleSend = (text: string) => {
    if (!currentBoardId) {
      toast.warning("Please select a board first.");
      return;
    }
    sendMessage(text, currentBoardId);
  };

  const handleClear = () => {
    if (currentBoardId) {
      clearThread(currentBoardId);
      toast.success("Conversation cleared.");
    }
  };

  const handleExport = async () => {
    if (messages.length === 0) {
      toast.info("No messages to export.");
      return;
    }

    const markdownText = messages
      .map((m) => `**${m.sender === "user" ? "User" : "AI Copilot"}** (${m.timestamp}):\n${m.text}\n`)
      .join("\n---\n\n");

    try {
      await navigator.clipboard.writeText(markdownText);
      toast.success("Conversation copied to clipboard!");
    } catch {
      toast.info("Failed to copy automatically.");
    }
  };

  const handleSelectCard = (cardId: string) => {
    if (currentBoardId) {
      navigate(`/boards/${currentBoardId}?cardId=${cardId}`);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-6xl mx-auto px-4 py-3">
      {/* Header Bar */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white border border-neutral-200/90 rounded-2xl shadow-xs shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-neutral-900">AI Assistant</h1>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-primary-100 text-primary-700 rounded-md">
                COPILOT
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              {activeWorkspace ? `Workspace: ${activeWorkspace.name}` : "Intelligent Project Assistant"}
            </p>
          </div>
        </div>

        {/* Board Context Selector & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200/90 px-3 py-1.5 rounded-xl">
            <Kanban className="w-4 h-4 text-neutral-500 shrink-0" />
            <span className="text-xs text-neutral-500 font-medium shrink-0">Board context:</span>
            <select
              value={currentBoardId}
              onChange={(e) => handleBoardChange(e.target.value)}
              disabled={isLoadingBoards || boards.length === 0}
              className="bg-transparent text-xs font-semibold text-neutral-800 outline-none cursor-pointer pr-2"
              aria-label="Select board"
            >
              {boards.length === 0 ? (
                <option value="">{isLoadingBoards ? "Loading boards..." : "No boards available"}</option>
              ) : (
                boards.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {currentBoardId && (
            <Link
              to={`/boards/${currentBoardId}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors"
              title="Go to Kanban Board"
            >
              <span>View Board</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}

          {messages.length > 0 && (
            <>
              <button
                type="button"
                onClick={handleExport}
                className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
                title="Copy conversation"
                aria-label="Copy conversation"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="p-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                title="Clear conversation"
                aria-label="Clear conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Chat Container */}
      <div className="flex-1 flex flex-col bg-white border border-neutral-200/90 rounded-2xl shadow-xs mt-3 overflow-hidden">
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-xl mx-auto">
              <div className="w-14 h-14 rounded-3xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4 shadow-xs">
                <Bot className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-bold text-neutral-800">
                AI Copilot for Board: {currentBoard?.name || "Kanban"}
              </h2>
              <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
                Ask questions about progress, tasks, assignees, or overdue risks on this board. AI
                retrieves live board data with verified evidence.
              </p>

              <PromptSuggestionsGrid onSelectPrompt={handleSend} className="mt-6" />
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <ChatMessageItem key={msg.id} message={msg} onSelectCard={handleSelectCard} />
              ))}

              {/* Thinking Indicator */}
              {isThinking && (
                <div className="flex items-start gap-2.5 mb-4 animate-in fade-in duration-200">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-500 text-white flex items-center justify-center shrink-0 shadow-xs animate-pulse">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="bg-neutral-50 border border-neutral-200/80 rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs">
                    <div className="flex items-center gap-2 text-xs font-medium text-primary-700">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-600" />
                      </span>
                      <span>{thinkingStep || "AI is analyzing board data..."}</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Footer Area */}
        <div className="shrink-0 bg-white border-t border-neutral-100">
          {messages.length > 0 && <PromptSuggestionsBar onSelectPrompt={handleSend} />}
          <ChatInputBar
            onSendMessage={handleSend}
            isThinking={isThinking}
            disabled={!currentBoardId}
            placeholder={
              !currentBoardId
                ? "Please select a board to start chatting..."
                : currentBoard
                ? `Ask AI Copilot about "${currentBoard.name}"...`
                : "Ask AI Copilot..."
            }
          />
        </div>
      </div>
    </div>
  );
};
