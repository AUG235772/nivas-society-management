
import axios from 'axios';

// Backend URL set kar rahe hain
const API = axios.create({ baseURL: 'https://nivas-api.onrender.com/api' });

// Har request ke pehle ye check karega ki Token hai ya nahi
API.interceptors.request.use((req) => {
  if (localStorage.getItem('token')) {
    req.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
  }
  return req;
});

export default API;
