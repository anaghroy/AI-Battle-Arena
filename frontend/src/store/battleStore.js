import { create } from "zustand";
import { battleService } from "../services/battle.service";

const useBattleStore = create((set, get) => ({
  messages: [],
  currentChatId: null,
  history: [],
  isLoading: false,
  activeMode: "text", // 'text', 'voice', 'image', 'pdf'

  setActiveMode: (mode) => set({ activeMode: mode }),

  addMessage: (msg) => {
    const newMessage = {
      ...msg,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    set((state) => {
      const updatedMessages = [...state.messages, newMessage];
      // Async sync without blocking UI
      get().syncCurrentChat(updatedMessages);
      return { messages: updatedMessages };
    });
  },

  syncCurrentChat: async (updatedMessages) => {
    const { currentChatId, fetchHistory } = get();
    try {
      const chat = await battleService.syncChat(currentChatId, updatedMessages);
      if (!currentChatId && chat._id) {
        set({ currentChatId: chat._id });
        fetchHistory(); // Refresh sidebar list
      }
    } catch (error) {
      console.error("Failed to sync chat:", error);
    }
  },

  fetchHistory: async () => {
    try {
      const history = await battleService.getChats();
      set({ history });
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  },

  loadChat: async (id) => {
    set({ isLoading: true });
    try {
      const chat = await battleService.getChatById(id);
      set({ currentChatId: chat._id, messages: chat.messages || [] });
    } catch (error) {
      console.error("Failed to load chat:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  removeHistory: async (id) => {
    try {
      await battleService.deleteChat(id);
      set((state) => {
        const resetCurrent = state.currentChatId === id;
        return {
          history: state.history.filter((chat) => chat._id !== id),
          currentChatId: resetCurrent ? null : state.currentChatId,
          messages: resetCurrent ? [] : state.messages,
        };
      });
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
  },

  sendMessage: async (inputData) => {
    const { activeMode } = get();

    set({ isLoading: true });

    try {
      // Create user message instantly for UI responsivenes
      let userMessageText = "";
      if (activeMode === "text") userMessageText = inputData;
      else if (activeMode === "voice")
        userMessageText = "Transcribing voice message...";
      else if (activeMode === "image")
        userMessageText = `Generating image for: ${inputData}`;
      else if (activeMode === "pdf")
        userMessageText = `Analyzing PDF: ${inputData.name}`;

      const userMsgId = Date.now().toString();
      const userMsg = {
        id: userMsgId,
        type: "user",
        text: userMessageText,
        mode: activeMode,
        timestamp: new Date().toISOString(),
      };

      set((state) => {
        const msgs = [...state.messages, userMsg];
        get().syncCurrentChat(msgs);
        return { messages: msgs };
      });

      let responseData = null;

      // Make API call based on activeMode
      switch (activeMode) {
        case "text":
          responseData = await battleService.sendText(inputData);
          break;
        case "voice":
          responseData = await battleService.sendVoice(inputData); // inputData is audio Blob
          // Update user message with transcribed text if available
          if (responseData.input) {
            set((state) => {
              const updated = state.messages.map((m) =>
                m.id === userMsgId
                  ? { ...m, text: `🎙️ ${responseData.input}` }
                  : m,
              );
              get().syncCurrentChat(updated);
              return { messages: updated };
            });
          }
          break;
        case "image":
          responseData = await battleService.sendImage(inputData);
          break;
        case "pdf":
          responseData = await battleService.sendPdf(inputData);
          break;
        case "video":
          responseData = await battleService.sendVideo(inputData);
          break;
        default:
          throw new Error(`Unknown mode: ${activeMode}`);
      }

      // Add AI response parsing real data
      if (responseData && responseData.solutionA && responseData.solutionB) {
        get().addMessage({
          type: "ai-battle",
          data: responseData,
          mode: activeMode,
        });
      } else {
        const aiResponseText =
          typeof responseData === "string"
            ? responseData
            : responseData?.response ||
              responseData?.text ||
              JSON.stringify(responseData);

        get().addMessage({
          type: "ai",
          text: aiResponseText,
          mode: activeMode,
        });
      }
    } catch (error) {
      console.error("Battle interaction failed:", error);
      get().addMessage({
        type: "error",
        text: "Sorry, there was an error processing your request.",
        mode: activeMode,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  clearChat: () => set({ messages: [], currentChatId: null }),
}));

export default useBattleStore;
