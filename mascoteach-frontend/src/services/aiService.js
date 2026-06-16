/**
 * Mascoteach — AI Service
 * Calls the deployed AI Module at ai.mascoteach.com
 * Endpoints:
 *   POST /api/v1/ai/generate-for-backend — Generate MCQ from S3 file URL
 *   POST /api/v1/ai/generate-flashcards-for-backend — Generate flashcards from S3 file URL
 *   GET  /api/v1/ai/health               — Health check
 */

import { resolveAiBaseUrl } from './baseUrls';

const AI_BASE_URL = resolveAiBaseUrl();

/**
 * Health check — verify AI Module is running
 * @returns {Promise<object>}
 */
export async function aiHealthCheck() {
    const res = await fetch(`${AI_BASE_URL}/api/v1/ai/health`);
    if (!res.ok) throw new Error('AI Module không phản hồi');
    return res.json();
}

/**
 * Generate MCQ questions from a file URL (already uploaded to S3).
 * AI service sẽ download file từ S3 URL và xử lý.
 *
 * @param {string} fileUrl — The S3 URL of the uploaded document
 * @param {object} options
 * @param {number} [options.documentId] — Document ID from backend
 * @param {string} [options.quizTitle] — Title for the quiz
 * @param {number} [options.numberOfQuestions=5] — How many questions to generate
 * @param {object} [options.difficultyDistribution] — Difficulty distribution percentages,
 *  * @param {string} [options.language='vi'] — Language for questions: 'vi' or 'en'
 * @returns {Promise<{
 *   success: boolean,
 *   message: string,
 *   data: {
 *     documentId?: number,
 *     quizTitle: string,
 *     questions: Array<{
 *       questionText: string,
 *       questionType: string,
 *       options: Array<{ optionText: string, isCorrect: boolean }>
 *     }>
 *   },
 *   metadata: { generatedAt: string, questionCount: number, model: string }
 * }>}
 */
export async function generateMCQFromUrl(fileUrl, options = {}, signal) {
    const { documentId, quizTitle, numberOfQuestions = 5, difficultyDistribution, language } = options;

    const body = {
        fileUrl,
        numberOfQuestions,
    };
    if (documentId !== undefined && documentId !== null) {
        body.documentId = documentId;
    }
    if (quizTitle) {
        body.quizTitle = quizTitle;
    }
    if (difficultyDistribution) {
        body.difficultyDistribution = difficultyDistribution;
    }
    if (language) {
        body.language = language;
    }

    const res = await fetch(`${AI_BASE_URL}/api/v1/ai/generate-for-backend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal,
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `AI Module trả về lỗi ${res.status}`);
    }

    return res.json();
}

/**
 * Generate flashcards from a file URL (already uploaded to S3).
 *
 * Backend storage convention:
 * - questionType: "Flashcard"
 * - questionText: front
 * - first correct option: back
 *
 * @param {string} fileUrl
 * @param {object} options
 * @param {number} [options.documentId]
 * @param {string} [options.quizTitle]
 * @param {number} [options.numberOfCards=5]
 * @param {number} [options.numberOfQuestions]
 * @param {object} [options.difficultyDistribution]
 * @param {string} [options.language='vi']
 */
export async function generateFlashcardsFromUrl(fileUrl, options = {}, signal) {
    const {
        documentId,
        quizTitle,
        numberOfCards,
        numberOfQuestions = 5,
        difficultyDistribution,
        language,
    } = options;

    const body = {
        fileUrl,
        numberOfCards: numberOfCards ?? numberOfQuestions,
    };
    if (documentId !== undefined && documentId !== null) {
        body.documentId = documentId;
    }
    if (quizTitle) {
        body.quizTitle = quizTitle;
    }
    if (difficultyDistribution) {
        body.difficultyDistribution = difficultyDistribution;
    }
    if (language) {
        body.language = language;
    }

    const res = await fetch(`${AI_BASE_URL}/api/v1/ai/generate-flashcards-for-backend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal,
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `AI Module trả về lỗi ${res.status}`);
    }

    return res.json();
}
