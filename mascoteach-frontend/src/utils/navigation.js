const PORTAL_PATHS = {
    admin: '/admin',
    teacher: '/teacher',
    student: '/student',
    parent: '/parent',
};

export function getUserRole(user) {
    return String(user?.role || user?.roleName || '').toLowerCase();
}

export function getUserPortalPath(user) {
    return PORTAL_PATHS[getUserRole(user)] || null;
}

export function getGameExitPath(user, fallback = '/play') {
    return getUserPortalPath(user) || fallback;
}

export function getGameLobbyPath(user) {
    return getUserRole(user) === 'student' ? '/student/join-session' : '/play';
}
