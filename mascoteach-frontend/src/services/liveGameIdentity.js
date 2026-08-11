const LIVE_GAME_IDENTITY_KEY = 'mascoteach.liveGameIdentity';

export function saveLiveGameIdentity(session, participant) {
    if (!session?.id || !participant?.id || !participant?.joinToken) return;

    window.sessionStorage.setItem(
        LIVE_GAME_IDENTITY_KEY,
        JSON.stringify({ session, participant })
    );
}

export function loadLiveGameIdentity() {
    try {
        const value = window.sessionStorage.getItem(LIVE_GAME_IDENTITY_KEY);
        return value ? JSON.parse(value) : null;
    } catch {
        return null;
    }
}

export function clearLiveGameIdentity() {
    window.sessionStorage.removeItem(LIVE_GAME_IDENTITY_KEY);
}
