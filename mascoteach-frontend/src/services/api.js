/**
 * Mascoteach — Central API Client
 * Base configuration for all API calls to the backend.
 * Uses native fetch with interceptors pattern.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api-elearning.purintech.id.vn';

/**
 * Get stored auth token
 */
function getToken() {
    return localStorage.getItem('mascoteach_token');
}

/**
 * Set auth token
 */
export function setToken(token) {
    if (token) {
        localStorage.setItem('mascoteach_token', token);
    } else {
        localStorage.removeItem('mascoteach_token');
    }
}

/**
 * Clear all auth data
 */
export function clearAuth() {
    localStorage.removeItem('mascoteach_token');
    localStorage.removeItem('mascoteach_user');
}

/**
 * Core fetch wrapper with auth headers, error handling, and JSON parsing.
 *
 * @param {string} endpoint - API path (e.g. '/api/Auth/login')
 * @param {object} options - fetch options
 * @param {string} [options.method='GET'] - HTTP method
 * @param {object} [options.body] - Request body (will be JSON.stringify'd)
 * @param {object} [options.headers] - Additional headers
 * @param {boolean} [options.skipAuth=false] - Skip auth header
 * @returns {Promise<any>} Parsed JSON response
 */
export async function apiRequest(endpoint, options = {}) {
    const {
        method = 'GET',
        body,
        headers = {},
        skipAuth = false,
    } = options;

    const config = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
    };

    // Attach auth token if available and not skipped
    if (!skipAuth) {
        const token = getToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
    }

    // Attach body for non-GET requests
    if (body && method !== 'GET') {
        config.headers['Content-Type'] = 'application/json';
        config.body = JSON.stringify(body);
    }

    const url = `${API_BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, config);

        // Handle 401 — Unauthorized
        if (response.status === 401) {
            const isAuthRequest = endpoint.toLowerCase().includes('/auth/') || skipAuth;

            if (isAuthRequest) {
                // For login/register, 401 means bad credentials
                throw new ApiError('Email hoặc mật khẩu không chính xác. Vui lòng thử lại.', 401);
            }

            // Otherwise, it means the token is invalid or expired
            clearAuth();

            // Only redirect if currently on a protected route (not public pages)
            const publicPaths = ['/', '/pricing', '/login', '/signup', '/forgot-password'];
            const isPublicPage = publicPaths.includes(window.location.pathname)
                || window.location.pathname.startsWith('/play');
            if (!isPublicPage) {
                window.location.href = '/login';
            }
            throw new ApiError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', 401);
        }

        // Handle empty responses (204 No Content, etc.)
        if (response.status === 204 || response.headers.get('content-length') === '0') {
            return null;
        }

        // Try to parse JSON
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        // Handle error responses
        if (!response.ok) {
            const message = typeof data === 'object' && data !== null
                ? data.message || data.title || JSON.stringify(data)
                : data || `Request failed with status ${response.status}`;
            throw new ApiError(message, response.status, data);
        }

        return data;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        // Network error
        throw new ApiError(
            'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
            0,
            error
        );
    }
}

/**
 * Custom API Error class with status code and response data
 */
export class ApiError extends Error {
    constructor(message, status, data = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

// ── Convenience methods ──

export const api = {
    get: (endpoint, options) => apiRequest(endpoint, { ...options, method: 'GET' }),
    post: (endpoint, body, options) => apiRequest(endpoint, { ...options, method: 'POST', body }),
    put: (endpoint, body, options) => apiRequest(endpoint, { ...options, method: 'PUT', body }),
    patch: (endpoint, body, options) => apiRequest(endpoint, { ...options, method: 'PATCH', body }),
    delete: (endpoint, options) => apiRequest(endpoint, { ...options, method: 'DELETE' }),
};

export default api;
