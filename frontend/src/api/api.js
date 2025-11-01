import axios from "axios";

const API = axios.create({
  baseURL: "https://my-service-backend.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Ensure Content-Type is set for POST/PUT requests with data
    if ((config.method === "post" || config.method === "put") && config.data) {
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
