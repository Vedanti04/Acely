import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
  timeout: 120000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("acely_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      "API ERROR:",
      error.response?.status,
      error.response?.data || error.message
    );

    return Promise.reject(error);
  }
);

const data = (request) =>
  request.then((response) => response.data);

// =========================================================
// AUTH
// =========================================================

export const registerUser = (payload) =>
  data(api.post("/auth/register", payload));

export const loginUser = (payload) =>
  data(api.post("/auth/login", payload));

export const getCurrentUser = () =>
  data(api.get("/auth/me"));

export const logoutUser = () => {
  localStorage.removeItem("acely_token");
  localStorage.removeItem("acely_user");
  localStorage.removeItem("acely_document_id");
};

// =========================================================
// DOCUMENTS
// =========================================================

export const uploadDocument = (file) => {
  const form = new FormData();
  form.append("file", file);

  return data(
    api.post("/documents/upload", form, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  );
};

export const getDocuments = () =>
  data(api.get("/documents"));

export const getDocument = (id) =>
  data(api.get(`/documents/${id}`));

export const deleteDocument = (id) =>
  data(api.delete(`/documents/${id}`));

// =========================================================
// GENERATE RESOURCES
// =========================================================

export const generateResources = (id) =>
  data(api.post(`/documents/${id}/generate`));

export const regenerateResources = (id) =>
  data(api.post(`/documents/${id}/regenerate`));

export const generateNotes = (id) =>
  data(api.post(`/documents/${id}/generate/notes`));

export const generateFlashcards = (id) =>
  data(api.post(`/documents/${id}/generate/flashcards`));

export const generateQuiz = (id) =>
  data(api.post(`/documents/${id}/generate/quiz`));

export const generateMindMap = (id) =>
  data(api.post(`/documents/${id}/generate/mindmap`));

// =========================================================
// GET RESOURCES
// =========================================================

export const getNotes = (id) =>
  data(api.get(`/documents/${id}/notes`));

export const getFlashcards = (id) =>
  data(api.get(`/documents/${id}/flashcards`));

export const getQuiz = (id) =>
  data(api.get(`/documents/${id}/quiz`));

export const getMindMap = (id) =>
  data(api.get(`/documents/${id}/mindmap`));

export default api;