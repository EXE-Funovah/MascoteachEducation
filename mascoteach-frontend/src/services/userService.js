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
 * Get all users (admin)
 * @returns {Promise<object[]>}
 */
export async function getAllUsers() {
    return api.get('/api/User');
}
