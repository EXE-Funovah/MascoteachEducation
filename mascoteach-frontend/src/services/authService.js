/**
 * Mascoteach — Auth Service
 * Handles login, register, and token management.
 */

import api, { getToken, setToken, clearAuth } from './api';

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

export async function forgotPassword(data) {
    return api.post('/api/Auth/forgot-password', {
        email: data.email,
    }, { skipAuth: true });
}

export async function resetPassword(data) {
    return api.post('/api/Auth/reset-password', {
        token: data.token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
    }, { skipAuth: true });
}

export async function verifyEmail(data) {
    return api.post('/api/Auth/verify-email', {
        token: data.token,
    }, { skipAuth: true });
}

function storeAuthToken(result, persist = true) {
    const token = result?.token || result?.accessToken || result;
    if (typeof token === 'string' && token.length > 0) {
        setToken(token, persist);
    }
}

/**
 * Login and store the auth token
 * @param {{ email: string, password: string, remember?: boolean }} credentials
 * @returns {Promise<{ token: string }>}
 */
export async function login(credentials) {
    const result = await api.post('/api/Auth/login', {
        email: credentials.email,
        password: credentials.password,
    }, { skipAuth: true });

    // Store token — backend may return it in different formats
    storeAuthToken(result, credentials.remember !== false);

    return result;
}

/**
 * Logout — clear all stored auth data
 */
export async function googleLogin(data) {
    const result = await api.post('/api/Auth/google-login', {
        credential: data.credential,
    }, { skipAuth: true });

    storeAuthToken(result, data.remember !== false);

    return result;
}

export function logout() {
    clearAuth();
    window.location.href = '/signin';
}

/**
 * Check if the user is currently authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
    return !!getToken();
}
