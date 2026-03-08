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
 * Get all quizzes for a specific user (via their documents).
 * Backend returns quizzes under each document → we flatten.
 * Alternatively, if Backend has GET /api/Quiz/me, use that directly.
 *
 * This fetches all documents and their quizzes concurrently.
 * @param {Array<{id: number}>} documents — user's documents list
 * @returns {Promise<object[]>} — flat list of quizzes
 */
export async function getQuizzesByDocuments(documents) {
    if (!documents?.length) return [];
    const results = await Promise.all(
        documents.map(doc => api.get(`/api/Quiz/document/${doc.id}`).catch(() => []))
    );
    return results.flat();
}

/**
 * Get a single quiz with its full questions + options
 * @param {number} quizId
 * @returns {Promise<{ quiz: object, questions: object[] }>}
 */
export async function getQuizWithQuestions(quizId) {
    const [quiz, questions] = await Promise.all([
        api.get(`/api/Quiz/${quizId}`),
        api.get(`/api/Question/quiz/${quizId}`),
    ]);
    return { quiz, questions };
}
