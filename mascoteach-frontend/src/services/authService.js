/**
 * Mascoteach — Auth Service
 * Handles login, register, and token management.
 */

import api, { setToken, clearAuth } from './api';

/**
 * Register a new user
 * @param {{ fullName: string, email: string, password: string, role?: string }} data
 * @returns {Promise<any>}
 */
export async function register(data) {
    const result = await api.post('/api/Auth/register', {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        role: data.role || 'Teacher',
    }, { skipAuth: true });

    return result;
}

/**
 * Login and store the auth token
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ token: string }>}
 */
export async function login(credentials) {
    const result = await api.post('/api/Auth/login', {
        email: credentials.email,
        password: credentials.password,
    }, { skipAuth: true });

    // Store token — backend may return it in different formats
    const token = result?.token || result?.accessToken || result;
    if (typeof token === 'string' && token.length > 0) {
        setToken(token);
    }

    return result;
}

/**
 * Logout — clear all stored auth data
 */
export function logout() {
    clearAuth();
    window.location.href = '/login';
}

/**
 * Check if the user is currently authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
    return !!localStorage.getItem('mascoteach_token');
}
