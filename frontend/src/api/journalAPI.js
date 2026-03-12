import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const journalAPI = {
  // Create a new journal entry
  createEntry: async (entryData) => {
    const response = await api.post('/journal', entryData);
    return response.data;
  },

  // Get all entries for a user
  getUserEntries: async (userId) => {
    const response = await api.get(`/journal/${userId}`);
    return response.data;
  },

  // Analyze journal text
  analyzeEmotion: async (text) => {
    const response = await api.post('/journal/analyze', { text });
    return response.data;
  },

  // Get user insights
  getUserInsights: async (userId) => {
    const response = await api.get(`/journal/insights/${userId}`);
    return response.data;
  },

  // Update entry with analysis
  updateEntryWithAnalysis: async (entryId, analysisData) => {
    const response = await api.put(`/journal/${entryId}/analysis`, analysisData);
    return response.data;
  },
};

export default api;