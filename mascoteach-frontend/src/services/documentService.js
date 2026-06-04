/**
 * Mascoteach — Document Service
 * CRUD operations for user documents (uploaded files).
 */

import JSZip from 'jszip';
import api from './api';

const ZIP_CONTENT_TYPE = 'application/zip';

function toZipFileName(fileName) {
    const safeName = (fileName || 'document').replace(/\.[^/.]+$/, '');
    return `${safeName || 'document'}.zip`;
}

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
 * @param {{ s3Key: string }} data
 * @returns {Promise<{ id: number, s3Key: string, presignedUrl: string }>}
 */
export async function createDocument(data) {
    return api.post('/api/Document', { s3Key: data.s3Key });
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
 * @returns {Promise<{ uploadUrl: string, s3Key: string, expiresAt: string }>}
 */
export async function generateUploadUrl(fileName, contentType) {
    return api.post('/api/Document/generate-upload-url', { fileName, contentType });
}

/**
 * Compress the selected document into a ZIP archive before S3 upload.
 * The backend stores .zip keys and the AI service extracts the original file
 * from the ZIP before processing.
 * @param {File} file
 * @param {(percent: number) => void} [onZipProgress]
 * @returns {Promise<File>}
 */
export async function zipDocumentForUpload(file, onZipProgress) {
    const zip = new JSZip();
    zip.file(file.name, file);

    const blob = await zip.generateAsync(
        {
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 },
            mimeType: ZIP_CONTENT_TYPE,
        },
        (metadata) => {
            if (onZipProgress) onZipProgress(Math.round(metadata.percent));
        },
    );

    return new File([blob], toZipFileName(file.name), { type: ZIP_CONTENT_TYPE });
}

/**
 * Step 2: Upload a ZIP file directly to S3 using a presigned PUT URL.
 * IMPORTANT: No Authorization header is sent — S3 rejects requests with extra auth headers.
 * @param {string} uploadUrl - Presigned S3 URL from generateUploadUrl
 * @param {File|Blob} file - The ZIP File/Blob to upload
 * @returns {Promise<void>}
 */
export async function uploadFileToS3(uploadUrl, file) {
    const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': ZIP_CONTENT_TYPE,
        },
        body: file,
    });
    if (!response.ok) {
        throw new Error(`S3 upload failed: ${response.status} ${response.statusText}`);
    }
}

/**
 * Upload a ZIP file to S3 with browser upload progress.
 * @param {string} uploadUrl
 * @param {File|Blob} file
 * @param {(percent: number) => void} [onProgress]
 * @returns {Promise<void>}
 */
export function uploadFileToS3WithProgress(uploadUrl, file, onProgress) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', ZIP_CONTENT_TYPE);

        xhr.upload.onprogress = (event) => {
            if (!event.lengthComputable) return;
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress?.(Math.max(1, Math.min(99, percent)));
        };

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                onProgress?.(100);
                resolve();
                return;
            }
            reject(new Error(`S3 upload failed: ${xhr.status} ${xhr.statusText}`));
        };

        xhr.onerror = () => reject(new Error('Upload failed. Please try again.'));
        xhr.send(file);
    });
}

/**
 * Upload a user-selected document using the backend contract:
 * original file -> browser ZIP -> presigned PUT -> S3.
 * @param {File} file
 * @param {(percent: number) => void} [onProgress]
 * @returns {Promise<{ uploadUrl: string, s3Key: string, expiresAt: string, zippedFile: File }>}
 */
export async function uploadDocumentFile(file, onProgress) {
    onProgress?.(1);
    const zippedFile = await zipDocumentForUpload(file, (zipPercent) => {
        onProgress?.(Math.max(1, Math.min(20, Math.round(zipPercent * 0.2))));
    });

    const presigned = await generateUploadUrl(zippedFile.name, ZIP_CONTENT_TYPE);
    await uploadFileToS3WithProgress(presigned.uploadUrl, zippedFile, (uploadPercent) => {
        onProgress?.(Math.max(21, Math.min(99, 20 + Math.round(uploadPercent * 0.79))));
    });
    onProgress?.(100);

    return { ...presigned, zippedFile };
}
