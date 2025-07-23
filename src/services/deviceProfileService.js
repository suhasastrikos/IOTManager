import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

class DeviceProfileService {
  async getAll() {
    try {
      const response = await axios.get(`${API_BASE_URL}/device-profiles`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message);
    }
  }

  async getById(id) {
    try {
      const response = await axios.get(`${API_BASE_URL}/device-profiles/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message);
    }
  }

  async create(deviceProfile) {
    try {
      const response = await axios.post(`${API_BASE_URL}/device-profiles`, deviceProfile);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message);
    }
  }

  async update(id, deviceProfile) {
    try {
      const response = await axios.put(`${API_BASE_URL}/device-profiles/${id}`, deviceProfile);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message);
    }
  }

  async delete(id) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/device-profiles/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message);
    }
  }

  async importProfiles(data, format) {
    try {
      const response = await axios.post(`${API_BASE_URL}/device-profiles/import`, {
        data,
        format
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message);
    }
  }
}

export const deviceProfileService = new DeviceProfileService();