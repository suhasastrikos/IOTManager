import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

class AssetProfileService {
  async getAll() {
    try {
      const response = await axios.get(`${API_BASE_URL}/asset-profiles`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message);
    }
  }

  async getById(id) {
    try {
      const response = await axios.get(`${API_BASE_URL}/asset-profiles/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message);
    }
  }

  async create(assetProfile) {
    try {
      const response = await axios.post(`${API_BASE_URL}/asset-profiles`, assetProfile);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message);
    }
  }

  async update(id, assetProfile) {
    try {
      const response = await axios.put(`${API_BASE_URL}/asset-profiles/${id}`, assetProfile);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message);
    }
  }

  async delete(id) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/asset-profiles/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message);
    }
  }

  async importProfiles(data, format) {
    try {
      const response = await axios.post(`${API_BASE_URL}/asset-profiles/import`, {
        data,
        format
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message);
    }
  }

  async exportProfiles(format = 'json') {
    try {
      const response = await axios.get(`${API_BASE_URL}/asset-profiles/export?format=${format}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message);
    }
  }
}

export const assetProfileService = new AssetProfileService();