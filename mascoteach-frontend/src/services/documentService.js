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

/**
 * Step 1: Request a presigned S3 upload URL from the backend
 * @param {string} fileName - Original file name (e.g. "lecture.pdf")
 * @param {string} contentType - MIME type (e.g. "application/pdf")
 * @returns {Promise<{ uploadUrl: string, s3Key: string, fileUrl: string, expiresAt: string }>}
 */
export async function generateUploadUrl(fileName, contentType) {
    return api.post('/api/Document/generate-upload-url', { fileName, contentType });
}

/**
 * Step 2: Upload a file directly to S3 using a presigned PUT URL.
 * IMPORTANT: No Authorization header is sent — S3 rejects requests with extra auth headers.
 * @param {string} uploadUrl - Presigned S3 URL from generateUploadUrl
 * @param {File} file - The raw File object to upload
 * @returns {Promise<void>}
 */
export async function uploadFileToS3(uploadUrl, file) {
    const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': file.type,
        },
        body: file,
    });
    if (!response.ok) {
        throw new Error(`S3 upload failed: ${response.status} ${response.statusText}`);
    }
}
