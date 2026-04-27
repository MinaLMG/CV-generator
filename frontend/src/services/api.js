import axios from 'axios';
console.log("process.env.REACT_APP_API_URL", process.env.REACT_APP_API_URL)
const API = axios.create({ baseURL: process.env.REACT_APP_API_URL });

// Attach JWT token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;
