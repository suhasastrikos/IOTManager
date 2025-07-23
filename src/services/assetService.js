import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

class AssetService {
  async getAll() {
    try {
      const response = await axios.get(`${API_BASE_URL}/assets`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message);
    }
  }

  async getById(id) {
    try {
      const response = await axios.get(`${API_BASE_URL}/assets/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message);
    }
  }

  async create(asset) {
    try {
      const response = await axios.post(`${API_BASE_URL}/assets`, asset);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message);
    }
  }

  async update(id, asset) {
    try {
      const response = await axios.put(`${API_BASE_URL}/assets/${id}`, asset);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message);
    }
  }

  async delete(id) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/assets/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message);
    }
  }

  async importAssets(data, format) {
    try {
      const response = await axios.post(`${API_BASE_URL}/assets/import`, {
        data,
        format
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message);
    }
  }
}

export const assetService = new AssetService();