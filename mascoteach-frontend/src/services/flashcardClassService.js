import api from './api';

export function createClass(data) {
    return api.post('/api/classes', {
        name: data.name,
        description: data.description || null,
        password: data.password,
    });
}

export function getMyClasses(options) {
    return api.get('/api/classes/mine', options);
}

export function getClassDetail(classId, options) {
    return api.get(`/api/classes/${classId}`, options);
}

export function removeClassMember(classId, studentId) {
    return api.delete(`/api/classes/${classId}/members/${studentId}`);
}

export function updateClass(classId, data) {
    return api.put(`/api/classes/${classId}`, {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        password: data.password || null,
    });
}

export function addClassTeacher(classId, email) {
    return api.post(`/api/classes/${classId}/teachers`, { email: email.trim() });
}

export function removeClassTeacher(classId, teacherId) {
    return api.delete(`/api/classes/${classId}/teachers/${teacherId}`);
}

export function transferClassOwnership(classId, teacherId) {
    return api.put(`/api/classes/${classId}/owner`, { teacherId: Number(teacherId) });
}

export function leaveClassAsTeacher(classId) {
    return api.delete(`/api/classes/${classId}/teachers/me`);
}

export function assignFlashcard(classId, data) {
    return api.post(`/api/classes/${classId}/flashcards`, {
        quizId: Number(data.quizId),
        instructions: data.instructions || null,
        dueAt: data.dueAt || null,
    });
}

export function getClassFlashcards(classId, options) {
    return api.get(`/api/classes/${classId}/flashcards`, options);
}

export function removeFlashcardAssignment(classId, assignmentId) {
    return api.delete(`/api/classes/${classId}/flashcards/${assignmentId}`);
}

export function searchClasses(query, options) {
    return api.get(`/api/classes/search?q=${encodeURIComponent(query)}`, options);
}

export function joinClass(classId, password) {
    return api.post('/api/classes/join', { classId: Number(classId), password });
}

export function getEnrolledClasses(options) {
    return api.get('/api/classes/enrolled', options);
}

export function leaveClassAsStudent(classId) {
    return api.delete(`/api/classes/${classId}/leave`);
}

export function getMyFlashcardAssignments(options) {
    return api.get('/api/flashcard-assignments/me', options);
}

export function getFlashcardStudy(assignmentId, options) {
    return api.get(`/api/flashcard-assignments/${assignmentId}/study`, options);
}

export function updateFlashcardProgress(assignmentId, questionId, isKnown) {
    return api.put(
        `/api/flashcard-assignments/${assignmentId}/cards/${questionId}/progress`,
        { isKnown }
    );
}
