import axios from 'axios';

const isLocalHost = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);
const defaultServerUrl = import.meta.env.VITE_API_BASE_URL || (isLocalHost ? 'http://localhost:5000' : window.location.origin);

export const SERVER_URL = defaultServerUrl.replace(/\/+$/, '');
export const API_URL = `${SERVER_URL}/api`;

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 30000,
});

/** Normalises every failure into a single Error shape the UI can render. */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const payload = error.response?.data;
    const normalized = new Error(
      payload?.message ||
      (error.code === 'ECONNABORTED'
        ? 'The request timed out. Please try again.'
        : 'Unable to reach the server. Please check that the API is running.')
    );
    normalized.status = error.response?.status;
    normalized.errors = payload?.errors || [];
    return Promise.reject(normalized);
  }
);

/** Turns a stored path such as /uploads/file.pdf into an absolute URL. */
export function assetUrl(pathname) {
  if (!pathname) return '';
  if (/^https?:\/\//i.test(pathname)) return pathname;
  return `${SERVER_URL}${pathname.startsWith('/') ? '' : '/'}${pathname}`;
}

export default apiClient;
