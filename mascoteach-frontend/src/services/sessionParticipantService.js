/**
 * Mascoteach — SessionParticipant Service
 * Manage participants in live game sessions.
 */

import api from './api';

/**
 * Get all participants (admin)
 * @returns {Promise<object[]>}
 */
export async function getAllParticipants() {
    return api.get('/api/SessionParticipant');
}

/**
 * Get all participants for a specific session
 * @param {number} sessionId
 * @returns {Promise<object[]>}
 */
export async function getParticipantsBySession(sessionId) {
    return api.get(`/api/SessionParticipant/session/${sessionId}`);
}

/**
 * Get a specific participant by ID
 * @param {number} id
 * @returns {Promise<object>}
 */
export async function getParticipantById(id) {
    return api.get(`/api/SessionParticipant/${id}`);
}

/**
 * Join a session as a participant
 * @param {{ sessionId: number, studentName: string }} data
 * @returns {Promise<object>}
 */
export async function joinSession(data) {
    return api.post('/api/SessionParticipant', {
        sessionId: data.sessionId,
        studentName: data.studentName,
    });
}

/**
 * Update participant info (e.g. score update)
 * @param {number} id
 * @param {{ studentName: string, totalScore?: number }} data
 * @returns {Promise<object>}
 */
export async function updateParticipant(id, data) {
    return api.put(`/api/SessionParticipant/${id}`, data);
}

/**
 * Remove a participant
 * @param {number} id
 * @returns {Promise<void>}
 */
export async function deleteParticipant(id) {
    return api.delete(`/api/SessionParticipant/${id}`);
}

/**
 * Soft delete toggle
 * @param {number} id
 * @returns {Promise<void>}
 */
export async function toggleDeleteParticipant(id) {
    return api.patch(`/api/SessionParticipant/${id}/toggle-delete`);
}
