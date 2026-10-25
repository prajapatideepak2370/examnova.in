import apiClient from './api.js';

/** Public catalogue – published documents only. */
export async function fetchDocuments(params = {}, config = {}) {
  const { data } = await apiClient.get('/documents', { params, ...config });
  return { documents: data.data.documents, meta: data.meta, message: data.message };
}

/** Admin catalogue – includes drafts. */
export async function fetchAdminDocuments(params = {}) {
  const { data } = await apiClient.get('/documents/admin', { params });
  return { documents: data.data.documents, meta: data.meta };
}

export async function fetchDocument(idOrSlug) {
  const { data } = await apiClient.get(`/documents/${idOrSlug}`);
  return data.data;
}

export async function fetchRelatedDocuments(idOrSlug) {
  const { data } = await apiClient.get(`/documents/${idOrSlug}/related`);
  return data.data.documents;
}

export async function recordDocumentView(idOrSlug) {
  try {
    const { data } = await apiClient.post(`/documents/${idOrSlug}/view`);
    return data.data.viewCount;
  } catch {
    return null; // view tracking must never break reading
  }
}

export async function createDocument(formData, onUploadProgress) {
  const { data } = await apiClient.post('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
    timeout: 120000,
  });
  return { document: data.data.document, message: data.message };
}

export async function updateDocument(id, formData, onUploadProgress) {
  const { data } = await apiClient.put(`/documents/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
    timeout: 120000,
  });
  return { document: data.data.document, message: data.message };
}

export async function updateDocumentStatus(id, status) {
  const { data } = await apiClient.patch(`/documents/${id}/status`, { status });
  return { document: data.data.document, message: data.message };
}

export async function deleteDocument(id) {
  const { data } = await apiClient.delete(`/documents/${id}`);
  return data.message;
}
