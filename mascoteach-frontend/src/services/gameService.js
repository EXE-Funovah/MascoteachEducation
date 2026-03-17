/**
 * Mascoteach — Game Service
 * Handles fetching and normalizing game data for the Adventure Game mode.
 */

import { getSessionByPin } from './liveSessionService';
import { getQuestionsByQuiz } from './questionService';
import { joinSession, updateParticipant } from './sessionParticipantService';

export async function loadGameByPin(pin, options = {}) {
    const requestOptions = { skipAuth: true, ...options };

    const session = await getSessionByPin(pin, requestOptions);
    if (!session) throw new Error('Không tìm th?y phiên choi v?i mã PIN này.');

    const raw = await getQuestionsByQuiz(session.quizId, requestOptions);
    const questions = Array.isArray(raw) ? raw : [];

    if (!questions.length) throw new Error('Bài quiz này chua có câu h?i nào.');

    return {
        session,
        questions: questions.map(normalizeQuestion),
    };
}

export async function joinGame(sessionId, studentName, options = {}) {
    return joinSession({ sessionId, studentName }, { skipAuth: true, ...options });
}

export async function saveGameResult(participantId, totalScore) {
    return updateParticipant(participantId, { totalScore });
}

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
