/**
 * Mascoteach - Quiz Service
 * CRUD operations for quizzes.
 */

import api from './api';

export function toBackendActivityType(activityType) {
    return activityType === 'flashcards' || activityType === 'Flashcard'
        ? 'Flashcard'
        : 'Quiz';
}

export function toFrontendActivityType(activityType) {
    return activityType === 'Flashcard' ? 'flashcards' : 'quiz';
}

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
 * @param {{ documentId: number, title: string, activityType?: string }} data
 * @returns {Promise<object>}
 */
export async function createQuiz(data) {
    return api.post('/api/Quiz', {
        documentId: data.documentId,
        title: data.title,
        activityType: toBackendActivityType(data.activityType),
    });
}

/**
 * Publish a whole quiz/flashcard set in one request
 * @param {{
 *   documentId: number,
 *   title: string,
 *   activityType: string,
 *   questions: Array<{
 *     questionText: string,
 *     questionType: string,
 *     position: number,
 *     options: Array<{ optionText: string, isCorrect: boolean }>
 *   }>
 * }} data
 * @returns {Promise<object>}
 */
export async function publishQuiz(data) {
    return api.post('/api/Quiz/publish', {
        ...data,
        activityType: toBackendActivityType(data.activityType),
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
 * Get current user's quizzes, optionally filtered by activity type
 * @param {string} [activityType]
 * @returns {Promise<object[]>}
 */
export async function getMyQuizzes(activityType) {
    const query = activityType
        ? `?activityType=${encodeURIComponent(toBackendActivityType(activityType))}`
        : '';

    return api.get(`/api/Quiz/me${query}`);
}

/**
 * Backward-compatible alias while old callers are being migrated
 * @param {Array<{id: number}>} _documents
 * @param {string} [activityType]
 * @returns {Promise<object[]>}
 */
export async function getQuizzesByDocuments(_documents, activityType) {
    return getMyQuizzes(activityType);
}

/**
 * Get a single quiz detail with ordered questions + options
 * @param {number} id
 * @param {object} [options]
 * @returns {Promise<object>}
 */
export async function getQuizDetail(id, options) {
    return api.get(`/api/Quiz/${id}/detail`, options);
}

/**
 * Get a single quiz with its full questions + options
 * @param {number} quizId
 * @param {object} [options]
 * @returns {Promise<{ quiz: object, questions: object[] }>}
 */
export async function getQuizWithQuestions(quizId, options) {
    const detail = await getQuizDetail(quizId, options);
    return {
        quiz: detail,
        questions: Array.isArray(detail?.questions) ? detail.questions : [],
    };
}

/**
 * Get ordered questions for a quiz from the detail endpoint
 * @param {number} quizId
 * @param {object} [options]
 * @returns {Promise<object[]>}
 */
export async function getQuizQuestions(quizId, options) {
    const detail = await getQuizDetail(quizId, options);
    return Array.isArray(detail?.questions) ? detail.questions : [];
}
