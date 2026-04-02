import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/api/v1";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

export const analyzeResume = async (text, targetCategory = null) => {
  const response = await api.post("/analyze-and-recommend", {
    text,
    target_category: targetCategory,
  });
  return response.data;
};

export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getCategories = async () => {
  const response = await api.get("/categories");
  return response.data;
};

export default api;
