import axios from "axios";
const api = axios.create({ baseURL: "http://localhost:8080/api" });
api.interceptors.request.use((config) => { const token = localStorage.getItem("acely_token"); if (token) config.headers.Authorization = `Bearer ${token}`; return config; });
const data = (request) => request.then((response) => response.data);
export const uploadDocument = (file) => { const form = new FormData(); form.append("file", file); return data(api.post("/documents/upload", form)); };
export const getDocuments = () => data(api.get("/documents")); export const getDocument = (id) => data(api.get(`/documents/${id}`)); export const deleteDocument = (id) => data(api.delete(`/documents/${id}`));
export const generateResources = (id) => data(api.post(`/documents/${id}/generate`)); export const generateNotes = (id) => data(api.post(`/documents/${id}/generate/notes`)); export const generateFlashcards = (id) => data(api.post(`/documents/${id}/generate/flashcards`)); export const generateQuiz = (id) => data(api.post(`/documents/${id}/generate/quiz`)); export const generateMindMap = (id) => data(api.post(`/documents/${id}/generate/mindmap`));
export const getNotes = (id) => data(api.get(`/documents/${id}/notes`)); export const getFlashcards = (id) => data(api.get(`/documents/${id}/flashcards`)); export const getQuiz = (id) => data(api.get(`/documents/${id}/quiz`)); export const getMindMap = (id) => data(api.get(`/documents/${id}/mindmap`));
export default api;
