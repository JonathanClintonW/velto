import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        ...(API_KEY && { 'X-API-KEY': API_KEY })
    },
});

// Inject lead auth token from localStorage
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('velto_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Auto-logout on 401
        if (error.response?.status === 401 && typeof window !== 'undefined') {
            const code = error.response?.data?.code;
            if (code === 'TOKEN_EXPIRED' || code === 'INVALID_TOKEN' || code === 'LEAD_NOT_FOUND') {
                localStorage.removeItem('velto_token');
                localStorage.removeItem('velto_project');
                window.dispatchEvent(new CustomEvent('velto:logout'));
            }
        }
        return Promise.reject(error);
    }
);

export default api;
