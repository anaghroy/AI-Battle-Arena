import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const battleService = {
  // Search Search Engine
  searchChats: async (q, category) => {
    const response = await api.get('/chats/search', { params: { q, category } });
    return response.data;
  },

  // Text Battle
  sendText: async (input) => {
    const response = await api.post('/battle', { input });
    return response.data;
  },

  // Voice Battle
  sendVoice: async (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice.webm'); 
    
    const response = await api.post('/battle/voice', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Image Battle
  sendImage: async (prompt) => {
    const response = await api.post('/battle/image', { prompt });
    return response.data;
  },

  // PDF Battle
  sendPdf: async (pdfFile) => {
    const formData = new FormData();
    formData.append('file', pdfFile);

    const response = await api.post('/battle/pdf', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // --- Chat Session Endpoints ---
  getChats: async () => {
    const res = await api.get('/chats');
    return res.data;
  },

  getChatById: async (id) => {
    const res = await api.get(`/chats/${id}`);
    return res.data;
  },

  syncChat: async (chatId, messages) => {
    const res = await api.post('/chats/sync', { chatId, messages });
    return res.data;
  },

  deleteChat: async (id) => {
    const res = await api.delete(`/chats/${id}`);
    return res.data;
  }
};
