import { create } from 'zustand';
import { battleService } from '../services/battle.service';

const useBattleStore = create((set, get) => ({
  messages: [
    {
      id: 'initial-msg',
      type: 'ai',
      text: 'Hi there! How can I help you today?',
      mode: 'text',
      timestamp: new Date().toISOString(),
      agent: 'A', // Assuming from screenshots we might have Agent A or similar later, default ai for now
    }
  ],
  isLoading: false,
  activeMode: 'text', // 'text', 'voice', 'image', 'pdf'
  
  setActiveMode: (mode) => set({ activeMode: mode }),

  addMessage: (msg) => set((state) => ({
    messages: [...state.messages, { ...msg, id: Date.now().toString(), timestamp: new Date().toISOString() }]
  })),

  sendMessage: async (inputData) => {
    const { activeMode, addMessage } = get();
    
    set({ isLoading: true });
    
    try {
      // Create user message instantly for UI responsivenes
      let userMessageText = '';
      if (activeMode === 'text') userMessageText = inputData;
      else if (activeMode === 'voice') userMessageText = '🎙️ Transcribing voice message...';
      else if (activeMode === 'image') userMessageText = `🖼️ Generating image for: ${inputData}`;
      else if (activeMode === 'pdf') userMessageText = `📄 Analyzing PDF: ${inputData.name}`;

      const userMsgId = Date.now().toString();
      set((state) => ({
        messages: [...state.messages, { 
          id: userMsgId, 
          type: 'user', 
          text: userMessageText, 
          mode: activeMode, 
          timestamp: new Date().toISOString() 
        }]
      }));

      let responseData = null;

      // Make API call based on activeMode
      switch (activeMode) {
        case 'text':
          responseData = await battleService.sendText(inputData);
          break;
        case 'voice':
          responseData = await battleService.sendVoice(inputData); // inputData is audio Blob
          // Update user message with transcribed text if available
          if (responseData.input) {
             set((state) => ({
               messages: state.messages.map(m => 
                 m.id === userMsgId ? { ...m, text: `🎙️ ${responseData.input}` } : m
               )
             }));
          }
          break;
        case 'image':
          responseData = await battleService.sendImage(inputData);
          break;
        case 'pdf':
          responseData = await battleService.sendPdf(inputData); // inputData is File
          break;
        default:
          throw new Error('Unknown mode');
      }

      // Add AI response
      // Assuming responseData structure contains 'text' or specific fields based on your backend integration logic.
      // E.g., if multiple models return response, structure it. For now, pushing raw string based on standard completion.
      const aiResponseText = typeof responseData === 'string' ? responseData : 
                             (responseData.response || responseData.text || JSON.stringify(responseData));

      addMessage({
        type: 'ai',
        text: aiResponseText,
        mode: activeMode,
      });

    } catch (error) {
      console.error("Battle interaction failed:", error);
      addMessage({
        type: 'error',
        text: 'Sorry, there was an error processing your request.',
        mode: activeMode,
      });
    } finally {
      set({ isLoading: false });
    }
  },
  
  clearChat: () => set({ messages: [] })
}));

export default useBattleStore;
