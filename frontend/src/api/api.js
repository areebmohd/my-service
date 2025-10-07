import axios from "axios";

// ✅ Base URL of your backend
// change this to your deployed backend URL when hosting (e.g., https://your-backend.onrender.com)
const API = axios.create({
  baseURL: "http://localhost:3000/api", 
});

// ✅ Automatically attach JWT token if user is logged in
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // stored after login
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
