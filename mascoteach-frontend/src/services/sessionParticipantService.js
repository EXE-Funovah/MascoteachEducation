/**
 * Mascoteach — SessionParticipant Service
 * Manage participants in live game sessions.
 */

import api from './api';

export async function getAllParticipants() {
    return api.get('/api/SessionParticipant');
}

export async function getParticipantsBySession(sessionId) {
    return api.get(`/api/SessionParticipant/session/${sessionId}`);
}

export async function getParticipantById(id) {
    return api.get(`/api/SessionParticipant/${id}`);
}

export async function joinSession(data, options) {
    return api.post('/api/SessionParticipant', {
        sessionId: data.sessionId,
        studentName: data.studentName,
    }, options);
}

export async function updateParticipant(id, data) {
    return api.put(`/api/SessionParticipant/${id}`, data);
}

export async function deleteParticipant(id) {
    return api.delete(`/api/SessionParticipant/${id}`);
}

export async function toggleDeleteParticipant(id) {
    return api.patch(`/api/SessionParticipant/${id}/toggle-delete`);
}
