import apiClient from './api.js';

export async function login(payload) {
  const { data } = await apiClient.post('/auth/login', payload);
  return data.data;
}

export async function logout() {
  const { data } = await apiClient.post('/auth/logout');
  return data;
}

export async function fetchCurrentAdmin() {
  const { data } = await apiClient.get('/auth/me');
  return data.data.admin;
}
