/**
 * Mascoteach — User Service
 * Manage user profile data.
 */

import api from './api';

/**
 * Get the currently logged-in user's profile
 * @returns {Promise<object>}
 */
export async function getMyProfile() {
    return api.get('/api/User/me');
}

/**
 * Get a specific user by ID
 * @param {number} id
 * @returns {Promise<object>}
 */
export async function getUserById(id) {
    return api.get(`/api/User/${id}`);
}

/**
 * Update a user's profile
 * @param {number} id
 * @param {{ fullName: string, email: string, role: string, subscriptionTier: string }} data
 * @returns {Promise<object>}
 */
export async function updateUser(id, data) {
    return api.put(`/api/User/${id}`, data);
}

/**
 * Permanently delete the current user's account.
 * @param {number} id
 * @returns {Promise<void>}
 */
export async function deleteUser(id) {
    return api.delete(`/api/User/${id}`);
}

/**
 * Get all users (admin)
 * @returns {Promise<object[]>}
 */
export async function getAllUsers() {
    return api.get('/api/User');
}

/**
 * Request a presigned avatar upload URL for direct S3 upload.
 * @param {string} fileName
 * @param {string} contentType
 * @returns {Promise<{ uploadUrl: string, s3Key: string, expiresAt: string }>}
 */
export async function generateAvatarUploadUrl(fileName, contentType) {
    return api.post('/api/User/avatar-upload-url', {
        fileName,
        contentType,
    });
}

/**
 * Upload an avatar file directly to S3 using the presigned PUT URL.
 * @param {string} uploadUrl
 * @param {File} file
 * @returns {Promise<void>}
 */
export async function uploadAvatarToS3(uploadUrl, file) {
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

/**
 * Save or remove the current user's avatar.
 * @param {string | null} avatarUrl
 * @returns {Promise<object>}
 */
export async function updateMyAvatar(avatarUrl) {
    return api.patch('/api/User/avatar', { avatarUrl });
}
