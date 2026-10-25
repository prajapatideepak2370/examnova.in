import apiClient from './api.js';

export async function fetchCategories() {
  const { data } = await apiClient.get('/categories');
  return data.data.categories;
}

export async function createCategory(payload) {
  const { data } = await apiClient.post('/categories', payload);
  return data.data.category;
}
