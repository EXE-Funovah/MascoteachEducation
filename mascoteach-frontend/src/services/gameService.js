/**
 * Mascoteach — Game Service
 * Handles fetching and normalizing game data for the Adventure Game mode.
 */

import { getSessionByPin } from './liveSessionService';
import { getQuestionsByQuiz } from './questionService';
import { joinSession, updateParticipant } from './sessionParticipantService';

/**
 * Load game session + questions by PIN code
 * @param {string} pin
 * @returns {Promise<{ session: object, questions: object[] }>}
 */
export async function loadGameByPin(pin) {
    const session = await getSessionByPin(pin);
    if (!session) throw new Error('Không tìm thấy phiên chơi với mã PIN này.');

    const raw = await getQuestionsByQuiz(session.quizId);
    const questions = Array.isArray(raw) ? raw : [];

    if (!questions.length) throw new Error('Bài quiz này chưa có câu hỏi nào.');

    return {
        session,
        questions: questions.map(normalizeQuestion),
    };
}

/**
 * Join a game session as a named participant
 * @param {number} sessionId
 * @param {string} studentName
 * @returns {Promise<object>} participant record
 */
export async function joinGame(sessionId, studentName) {
    return joinSession({ sessionId, studentName });
}

/**
 * Save final score for a participant
 * @param {number} participantId
 * @param {number} totalScore
 */
export async function saveGameResult(participantId, totalScore) {
    return updateParticipant(participantId, { totalScore });
}

/**
 * Normalize a raw API question to the game's internal format.
 *
 * API shape (from /api/Question/quiz/:quizId):
 *   { id, quizId, questionText, questionType, options: [{ id, optionText, isCorrect }] }
 *
 * Game shape:
 *   { id, text, options: string[], correctIndex: number, explanation: string }
 *
 * @param {object} q  Raw API question
 * @returns {object}  Normalized game question
 */
export function normalizeQuestion(q) {
    const rawOptions = q.options || q.questionOptions || [];

    const options = rawOptions.map((o) => ({
        text: o.optionText || o.text || '',
        isCorrect: !!o.isCorrect,
    }));

    const correctIndex = options.findIndex((o) => o.isCorrect);

    return {
        id: q.id ?? q.questionId,
        text: q.questionText || q.question || '',
        options: options.map((o) => o.text),
        correctIndex: correctIndex >= 0 ? correctIndex : 0,
        explanation: q.explanation || '',
    };
}
