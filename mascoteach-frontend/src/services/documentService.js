/**
 * Mascoteach — Document Service
 * CRUD operations for user documents (uploaded files).
 */

import api from './api';

/**
 * Get all documents (admin/public list)
 * @returns {Promise<object[]>}
 */
export async function getAllDocuments() {
    return api.get('/api/Document');
}

/**
 * Get documents owned by the current user
 * @returns {Promise<object[]>}
 */
export async function getMyDocuments() {
    return api.get('/api/Document/me');
}

/**
 * Get a single document by ID
 * @param {number} id
 * @returns {Promise<object>}
 */
export async function getDocumentById(id) {
    return api.get(`/api/Document/${id}`);
}

/**
 * Create a new document
 * @param {{ fileUrl: string }} data
 * @returns {Promise<object>}
 */
export async function createDocument(data) {
    return api.post('/api/Document', { fileUrl: data.fileUrl });
}

/**
 * Update a document's file URL
 * @param {number} id
 * @param {string} fileUrl
 * @returns {Promise<object>}
 */
export async function updateDocument(id, fileUrl) {
    return api.put(`/api/Document/${id}`, fileUrl);
}

/**
 * Hard delete a document
 * @param {number} id
 * @returns {Promise<void>}
 */
export async function deleteDocument(id) {
    return api.delete(`/api/Document/${id}`);
}

/**
 * Soft delete toggle
 * @param {number} id
 * @returns {Promise<void>}
 */
export async function toggleDeleteDocument(id) {
    return api.patch(`/api/Document/${id}/toggle-delete`);
}
