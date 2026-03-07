/**
 * Mascoteach — AI Service
 * Calls the deployed AI Module at ai-mascoteach.com
 * Endpoints:
 *   POST /api/v1/ai/generate-for-backend — Generate MCQ from file
 *   GET  /api/v1/ai/health               — Health check
 */

const AI_BASE_URL = import.meta.env.VITE_AI_BASE_URL || 'https://ai-mascoteach.com';

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
 * Generate MCQ questions from an uploaded file
 *
 * @param {File} file — The document file (PDF, DOCX, image)
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
export async function generateMCQFromFile(file, options = {}) {
    const { documentId, quizTitle, numberOfQuestions = 5 } = options;

    const formData = new FormData();
    formData.append('document', file);

    if (documentId !== undefined && documentId !== null) {
        formData.append('documentId', String(documentId));
    }
    if (quizTitle) {
        formData.append('quizTitle', quizTitle);
    }
    formData.append('numberOfQuestions', String(numberOfQuestions));

    const res = await fetch(`${AI_BASE_URL}/api/v1/ai/generate-for-backend`, {
        method: 'POST',
        body: formData,
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `AI Module trả về lỗi ${res.status}`);
    }

    return res.json();
}
