/**
 * Mascoteach — Question Service
 * CRUD operations for quiz questions.
 */

import api from './api';

/**
 * Get all questions for a specific quiz
 * @param {number} quizId
 * @param {object} [options]
 * @returns {Promise<object[]>}
 */
export async function getQuestionsByQuiz(quizId, options) {
    return api.get(`/api/Question/quiz/${quizId}`, options);
}

/**
 * Get a single question by ID
 * @param {number} id
 * @returns {Promise<object>}
 */
export async function getQuestionById(id) {
    return api.get(`/api/Question/${id}`);
}

/**
 * Create a new question
 * @param {{ quizId: number, questionText: string, questionType?: string, options?: Array<{ optionText: string, isCorrect: boolean }> }} data
 * @returns {Promise<object>}
 */
export async function createQuestion(data) {
    return api.post('/api/Question', {
        quizId: data.quizId,
        questionText: data.questionText,
        questionType: data.questionType || null,
        options: data.options || null,
    });
}

/**
 * Update a question
 * @param {number} id
 * @param {{ questionText?: string, questionType?: string }} data
 * @returns {Promise<object>}
 */
export async function updateQuestion(id, data) {
    return api.put(`/api/Question/${id}`, data);
}

/**
 * Delete a question
 * @param {number} id
 * @returns {Promise<void>}
 */
export async function deleteQuestion(id) {
    return api.delete(`/api/Question/${id}`);
}

/**
 * Soft delete toggle
 * @param {number} id
 * @returns {Promise<void>}
 */
export async function toggleDeleteQuestion(id) {
    return api.patch(`/api/Question/${id}/toggle-delete`);
}
