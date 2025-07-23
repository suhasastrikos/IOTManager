import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

class DeviceService {
  async getAll() {
    try {
      const response = await axios.get(`${API_BASE_URL}/devices`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message);
    }
  }

  async getById(id) {
    try {
      const response = await axios.get(`${API_BASE_URL}/devices/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message);
    }
  }

  async create(device) {
    try {
      const response = await axios.post(`${API_BASE_URL}/devices`, device);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message);
    }
  }

  async update(id, device) {
    try {
      const response = await axios.put(`${API_BASE_URL}/devices/${id}`, device);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message);
    }
  }

  async delete(id) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/devices/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message);
    }
  }

  async importDevices(data, format) {
    try {
      const response = await axios.post(`${API_BASE_URL}/devices/import`, {
        data,
        format
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message);
    }
  }
}

export const deviceService = new DeviceService();