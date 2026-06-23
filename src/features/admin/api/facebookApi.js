// 📁 src/features/admin/api/facebookApi.js

import apiClient from '../../../services/apiClient';

// POST /api/v1/facebook/fetch-and-import
// Returns 202 immediately with { batchId } — import runs in background.
export const fetchFacebookImport = async (maxPosts = 30) => {
  const { data } = await apiClient.post('/facebook/fetch-and-import', { maxPosts });
  return data?.data ?? data;
};

// GET /api/v1/facebook/import/status?status=&page=&limit=
// Track per-post progress. status: queued | processing | completed | filtered | failed
export const fetchImportStatus = async (params = {}) => {
  const { data } = await apiClient.get('/facebook/import/status', { params });
  return data?.data ?? data;
};

// DELETE /api/v1/facebook/import/:batchId
// Stops fetching new pages from Facebook. Posts already queued keep processing.
// batchId is only valid for 1 hour after the import was started.
export const cancelImportBatch = async (batchId) => {
  const { data } = await apiClient.delete(`/facebook/import/${batchId}`);
  return data?.data ?? data;
};

// POST /api/v1/admin/facebook/post-property/:id
// Post an existing property to the Facebook Page
export const postPropertyToFacebook = async (propertyId) => {
  const { data } = await apiClient.post(`/admin/facebook/post-property/${propertyId}`);
  return data?.data ?? data;
};
