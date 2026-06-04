function getRuntimeHostname() {
    if (typeof window === 'undefined') return '';
    return window.location.hostname || '';
}

function isLocalHostname(hostname) {
    return hostname === 'localhost'
        || hostname === '127.0.0.1'
        || hostname === '0.0.0.0';
}

function isDevLikeHostname(hostname) {
    return hostname.startsWith('dev.')
        || hostname.startsWith('dev-')
        || hostname.includes('-git-')
        || hostname.endsWith('.vercel.app');
}

export function resolveApiBaseUrl() {
    if (import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL;
    }

    const hostname = getRuntimeHostname();

    if (isLocalHostname(hostname)) {
        return 'https://localhost:7108';
    }

    if (isDevLikeHostname(hostname)) {
        return 'https://dev-api.mascoteach.com';
    }

    return 'https://api.mascoteach.com';
}

export function resolveAiBaseUrl() {
    if (import.meta.env.VITE_AI_BASE_URL) {
        return import.meta.env.VITE_AI_BASE_URL;
    }

    const hostname = getRuntimeHostname();

    if (isDevLikeHostname(hostname) && !isLocalHostname(hostname)) {
        return 'https://ai-dev.mascoteach.com';
    }

    return 'https://ai.mascoteach.com';
}
