/**
 * Mascoteach — LiveSession Service
 * Manage live game sessions.
 */

import api from './api';

export async function getAllSessions() {
    return api.get('/api/LiveSession');
}

export async function getMySessions() {
    return api.get('/api/LiveSession/my');
}

export async function getSessionById(id) {
    return api.get(`/api/LiveSession/${id}`);
}

export async function getSessionByPin(pin, options) {
    return api.get(`/api/LiveSession/pin/${pin}`, options);
}

export async function createSession(data) {
    return api.post('/api/LiveSession', {
        quizId: data.quizId,
        templateId: data.templateId,
    });
}

export async function updateSession(id, data) {
    return api.put(`/api/LiveSession/${id}`, { status: data.status });
}

export async function deleteSession(id) {
    return api.delete(`/api/LiveSession/${id}`);
}

export async function toggleDeleteSession(id) {
    return api.patch(`/api/LiveSession/${id}/toggle-delete`);
}
