/**
 * Mascoteach — AI Service
 * Calls the deployed AI Module at ai.mascoteach.com
 * Endpoints:
 *   POST /api/v1/ai/generate-for-backend — Generate MCQ from S3 file URL
 *   GET  /api/v1/ai/health               — Health check
 */

const AI_BASE_URL = import.meta.env.VITE_AI_BASE_URL || 'https://ai.mascoteach.com';

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
export async function generateMCQFromUrl(fileUrl, options = {}) {
    const { documentId, quizTitle, numberOfQuestions = 5 } = options;

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

    const res = await fetch(`${AI_BASE_URL}/api/v1/ai/generate-for-backend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `AI Module trả về lỗi ${res.status}`);
    }

    return res.json();
}
