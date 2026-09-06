// frontend/src/api/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.1.28:5000/api', // Base URL for all endpoints
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Optional 10-second timeout
});

export default api;