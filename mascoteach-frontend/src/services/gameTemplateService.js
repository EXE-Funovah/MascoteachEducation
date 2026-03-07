/**
 * Mascoteach — GameTemplate Service
 * Manage game mode templates.
 */

import api from './api';

/**
 * Get all game templates
 * @returns {Promise<object[]>}
 */
export async function getAllGameTemplates() {
    return api.get('/api/GameTemplate');
}

/**
 * Get a single game template by ID
 * @param {number} id
 * @returns {Promise<object>}
 */
export async function getGameTemplateById(id) {
    return api.get(`/api/GameTemplate/${id}`);
}

/**
 * Create a game template
 * @param {{ name: string, jsBundleUrl: string, thumbnailUrl?: string }} data
 * @returns {Promise<object>}
 */
export async function createGameTemplate(data) {
    return api.post('/api/GameTemplate', data);
}

/**
 * Update a game template
 * @param {number} id
 * @param {{ name: string, jsBundleUrl: string, thumbnailUrl?: string }} data
 * @returns {Promise<object>}
 */
export async function updateGameTemplate(id, data) {
    return api.put(`/api/GameTemplate/${id}`, data);
}

/**
 * Delete a game template
 * @param {number} id
 * @returns {Promise<void>}
 */
export async function deleteGameTemplate(id) {
    return api.delete(`/api/GameTemplate/${id}`);
}

/**
 * Soft delete toggle
 * @param {number} id
 * @returns {Promise<void>}
 */
export async function toggleDeleteGameTemplate(id) {
    return api.patch(`/api/GameTemplate/${id}/toggle-delete`);
}
