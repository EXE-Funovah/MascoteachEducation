import * as signalR from '@microsoft/signalr';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7108';

const HUB_CANDIDATES = [
    import.meta.env.VITE_SIGNALR_HUB_URL,
    `${API_BASE_URL}/hubs/game`,
    `${API_BASE_URL}/hubs/liveSession`,
    `${API_BASE_URL}/liveSessionHub`,
    `${API_BASE_URL}/gameHub`,
].filter(Boolean);

/**
 * All events the backend GameHub can send to clients.
 * Maps to: HostJoined, PlayerJoined, GameStarted,
 *          NewQuestion, QuestionClosed, AnswerSubmitted,
 *          ScoresUpdated, GameEnded
 *          + legacy events for backwards compat
 */
const EVENT_NAMES = [
    // ── GameHub events (match backend exactly) ──
    'HostJoined',
    'PlayerJoined',
    'GameStarted',
    'NewQuestion',
    'QuestionClosed',
    'AnswerSubmitted',
    'ScoresUpdated',
    'GameEnded',
    // ── Legacy/LiveSession events (keep for safety) ──
    'ParticipantJoined',
    'ParticipantLeft',
    'ParticipantsUpdated',
    'ParticipantListUpdated',
    'SessionUpdated',
];

/**
 * Create a SignalR connection to the GameHub.
 *
 * @param {Object} options
 * @param {string} [options.gamePin]     - Game PIN to join (used by GameHub)
 * @param {number} [options.sessionId]   - Session ID (legacy, for LiveSession hub)
 * @param {'host'|'student'} [options.role] - Role: 'host' or 'student'
 * @param {string} [options.studentName] - Student display name (required for role='student')
 * @param {Function} options.onEvent     - Callback: (eventName, payload) => void
 * @param {Function} [options.onError]   - Callback on connection failure
 */
export function createLiveSessionConnection({ gamePin, sessionId, role, studentName, onEvent, onError }) {
    const joinKey = gamePin || sessionId;
    if (!joinKey) return null;

    let stopped = false;
    let currentConnection = null;

    async function connect(urlIndex = 0) {
        if (stopped || urlIndex >= HUB_CANDIDATES.length) {
            return null;
        }

        const token = localStorage.getItem('mascoteach_token');
        const connection = new signalR.HubConnectionBuilder()
            .withUrl(HUB_CANDIDATES[urlIndex], {
                accessTokenFactory: token ? () => token : undefined,
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Warning)
            .build();

        EVENT_NAMES.forEach((eventName) => {
            connection.on(eventName, (payload) => {
                if (typeof onEvent === 'function') {
                    onEvent(eventName, payload);
                }
            });
        });

        try {
            await connection.start();
            currentConnection = connection;

            // ── Join the correct group based on role ──
            if (role === 'host' && gamePin) {
                // Teacher joins as host with gamePin
                await connection.invoke('JoinAsHost', gamePin).catch((err) => {
                    console.warn('[SignalR] JoinAsHost failed:', err.message);
                });
            } else if (role === 'student' && gamePin && studentName) {
                // Student joins with gamePin + name
                await connection.invoke('JoinAsStudent', gamePin, studentName).catch((err) => {
                    console.warn('[SignalR] JoinAsStudent failed:', err.message);
                });
            } else if (sessionId) {
                // Legacy: try old join methods for LiveSession hub
                await Promise.allSettled([
                    connection.invoke('JoinSessionRoom', sessionId),
                    connection.invoke('JoinSessionGroup', sessionId),
                    connection.invoke('JoinLiveSession', sessionId),
                    connection.invoke('SubscribeSession', sessionId),
                ]);
            }

            return connection;
        } catch (error) {
            await connection.stop().catch(() => { });

            if (urlIndex === HUB_CANDIDATES.length - 1 && typeof onError === 'function') {
                onError(error);
            }

            return connect(urlIndex + 1);
        }
    }

    const startPromise = connect();

    return {
        startPromise,
        getConnection() {
            return currentConnection;
        },
        async invoke(method, ...args) {
            if (currentConnection?.state === signalR.HubConnectionState.Connected) {
                return currentConnection.invoke(method, ...args);
            }
            console.warn(`[SignalR] Cannot invoke ${method}: not connected`);
        },
        async stop() {
            stopped = true;
            if (currentConnection) {
                await currentConnection.stop().catch(() => { });
            }
        },
    };
}
