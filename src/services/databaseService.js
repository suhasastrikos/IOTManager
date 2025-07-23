import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

class DatabaseService {
  async testConnection(config) {
    try {
      const response = await axios.post(`${API_BASE_URL}/database/test-connection`, config);
      return response.data;    
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  async initializeSchema() {
    try {
      const response = await axios.post(`${API_BASE_URL}/database/initialize-schema`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message);
    }
  }
}

export const databaseService = new DatabaseService();