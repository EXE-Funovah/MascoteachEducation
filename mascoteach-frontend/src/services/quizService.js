/**
 * Mascoteach — Quiz Service
 * CRUD operations for quizzes.
 */

import api from './api';

/**
 * Get all quizzes for a specific document
 * @param {number} documentId
 * @returns {Promise<object[]>}
 */
export async function getQuizzesByDocument(documentId) {
    return api.get(`/api/Quiz/document/${documentId}`);
}

/**
 * Get a single quiz by ID
 * @param {number} id
 * @returns {Promise<object>}
 */
export async function getQuizById(id) {
    return api.get(`/api/Quiz/${id}`);
}

/**
 * Create a new quiz
 * @param {{ documentId: number, title: string }} data
 * @returns {Promise<object>}
 */
export async function createQuiz(data) {
    return api.post('/api/Quiz', {
        documentId: data.documentId,
        title: data.title,
    });
}

/**
 * Update a quiz
 * @param {number} id
 * @param {{ title: string, status: string }} data
 * @returns {Promise<object>}
 */
export async function updateQuiz(id, data) {
    return api.put(`/api/Quiz/${id}`, {
        title: data.title,
        status: data.status,
    });
}

/**
 * Delete a quiz
 * @param {number} id
 * @returns {Promise<void>}
 */
export async function deleteQuiz(id) {
    return api.delete(`/api/Quiz/${id}`);
}

/**
 * Soft delete toggle
 * @param {number} id
 * @returns {Promise<void>}
 */
export async function toggleDeleteQuiz(id) {
    return api.patch(`/api/Quiz/${id}/toggle-delete`);
}

/**
 * Generate quiz from AI (Phase 4 — for future use with AI module)
 * @param {{ documentId: number, quizTitle: string, questions: Array }} data
 * @returns {Promise<object>}
 */
export async function generateQuizFromAI(data) {
    return api.post('/api/Quiz/generate-from-ai', {
        documentId: data.documentId,
        quizTitle: data.quizTitle,
        questions: data.questions,
    });
}
