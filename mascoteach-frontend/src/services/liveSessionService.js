/**
 * Mascoteach — LiveSession Service
 * Manage live game sessions.
 */

import api from './api';

/**
 * Get all live sessions
 * @returns {Promise<object[]>}
 */
export async function getAllSessions() {
    return api.get('/api/LiveSession');
}

/**
 * Get sessions owned by the current user
 * @returns {Promise<object[]>}
 */
export async function getMySessions() {
    return api.get('/api/LiveSession/my');
}

/**
 * Get a single session by ID
 * @param {number} id
 * @returns {Promise<object>}
 */
export async function getSessionById(id) {
    return api.get(`/api/LiveSession/${id}`);
}

/**
 * Find a session by its PIN code (for students joining)
 * @param {string} pin
 * @returns {Promise<object>}
 */
export async function getSessionByPin(pin) {
    return api.get(`/api/LiveSession/pin/${pin}`);
}

/**
 * Create a new live session
 * @param {{ quizId: number, templateId: number }} data
 * @returns {Promise<object>}
 */
export async function createSession(data) {
    return api.post('/api/LiveSession', {
        quizId: data.quizId,
        templateId: data.templateId,
    });
}

/**
 * Update a live session status
 * @param {number} id
 * @param {{ status: string }} data
 * @returns {Promise<object>}
 */
export async function updateSession(id, data) {
    return api.put(`/api/LiveSession/${id}`, { status: data.status });
}

/**
 * Delete a session
 * @param {number} id
 * @returns {Promise<void>}
 */
export async function deleteSession(id) {
    return api.delete(`/api/LiveSession/${id}`);
}

/**
 * Soft delete toggle
 * @param {number} id
 * @returns {Promise<void>}
 */
export async function toggleDeleteSession(id) {
    return api.patch(`/api/LiveSession/${id}/toggle-delete`);
}
