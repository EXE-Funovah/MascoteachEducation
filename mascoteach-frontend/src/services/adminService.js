import api, { getToken } from './api';

function buildQuery(params = {}) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        searchParams.set(key, value);
    });

    const query = searchParams.toString();
    return query ? `?${query}` : '';
}

export function hasAdminApiToken() {
    return Boolean(getToken());
}

export function getAdminOverview(params = {}, options = {}) {
    return api.get(`/api/Admin/overview${buildQuery({ range: '30d', ...params })}`, options);
}

export function getAdminUsers(params = {}, options = {}) {
    return api.get(`/api/Admin/users${buildQuery({ page: 1, pageSize: 20, ...params })}`, options);
}

export function getAdminUserById(id, options = {}) {
    return api.get(`/api/Admin/users/${id}`, options);
}

export function getAdminDocuments(params = {}, options = {}) {
    return api.get(`/api/Admin/documents${buildQuery({ page: 1, pageSize: 20, ...params })}`, options);
}

export function getAdminDocumentById(id, options = {}) {
    return api.get(`/api/Admin/documents/${id}`, options);
}

export function getAdminQuizzes(params = {}, options = {}) {
    return api.get(`/api/Admin/quizzes${buildQuery({ page: 1, pageSize: 20, ...params })}`, options);
}

export function getAdminQuizById(id, options = {}) {
    return api.get(`/api/Admin/quizzes/${id}`, options);
}

export function getAdminSessions(params = {}, options = {}) {
    return api.get(`/api/Admin/sessions${buildQuery({ page: 1, pageSize: 20, ...params })}`, options);
}

export function getAdminSessionById(id, options = {}) {
    return api.get(`/api/Admin/sessions/${id}`, options);
}

export function getAdminSessionParticipants(id, params = {}, options = {}) {
    return api.get(`/api/Admin/sessions/${id}/participants${buildQuery({ page: 1, pageSize: 20, ...params })}`, options);
}

export function getAdminBillingOrders(params = {}, options = {}) {
    return api.get(`/api/Admin/billing/orders${buildQuery({ page: 1, pageSize: 20, ...params })}`, options);
}

export function getAdminBillingOrderById(id, options = {}) {
    return api.get(`/api/Admin/billing/orders/${id}`, options);
}

export function getAdminBillingWebhookEvents(params = {}, options = {}) {
    return api.get(`/api/Admin/billing/webhook-events${buildQuery({ page: 1, pageSize: 20, ...params })}`, options);
}
