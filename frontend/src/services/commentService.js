import apiClient from './api.js';

/** Public list – the server always returns newest first. */
export async function fetchComments(params = {}) {
  const { data } = await apiClient.get('/comments', { params });
  return { comments: data.data.comments, meta: data.meta, message: data.message };
}

/**
 * `website` is the hidden honeypot field. Real visitors never fill it in, so
 * the server silently discards anything that does.
 */
export async function createComment({ name, message, website = '' }) {
  const { data } = await apiClient.post('/comments', { name, message, website });
  return { comment: data.data.comment, message: data.message };
}

/** Administrator moderation – the session cookie carries the authorisation. */
export async function deleteComment(id) {
  const { data } = await apiClient.delete(`/comments/${id}`);
  return data.message;
}
