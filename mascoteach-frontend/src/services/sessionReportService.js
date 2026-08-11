import api from './api';

export async function getSessionReport(id, options) {
    return api.get(`/api/LiveSession/${id}/report`, options);
}
