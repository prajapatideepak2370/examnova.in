import apiClient from './api.js';

export async function fetchDashboardStats() {
  const { data } = await apiClient.get('/stats/dashboard');
  return data.data;
}
