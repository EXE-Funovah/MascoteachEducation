import * as signalR from '@microsoft/signalr';
import { resolveApiBaseUrl } from './baseUrls';
import { getToken } from './api';

const API_BASE_URL = resolveApiBaseUrl();
const HUB_CANDIDATES = [
    import.meta.env.VITE_SIGNALR_HUB_URL,
    `${API_BASE_URL}/hubs/game`,
].filter((url, index, urls) => url && urls.indexOf(url) === index);

const EVENT_NAMES = [
    'HostJoined',
    'PlayerJoined',
    'GameStarted',
    'NewQuestion',
    'QuestionClosed',
    'AnswerResult',
    'AnswerSubmitted',
    'ScoresUpdated',
    'GameEnded',
];

async function joinGroup(connection, { role, gamePin, participantId, joinToken }) {
    if (role === 'host' && gamePin) {
        await connection.invoke('JoinAsHost', gamePin);
        return;
    }

    if (role === 'student' && gamePin && participantId && joinToken) {
        await connection.invoke('JoinAsStudent', gamePin, participantId, joinToken);
        return;
    }

    throw new Error('Missing SignalR group identity.');
}

export function createLiveSessionConnection({
    gamePin,
    sessionId,
    role,
    participantId,
    joinToken,
    onEvent,
    onError,
}) {
    if (!gamePin && !sessionId) return null;

    let stopped = false;
    let currentConnection = null;
    const joinOptions = { role, gamePin, participantId, joinToken };

    async function connect(urlIndex = 0) {
        if (stopped || urlIndex >= HUB_CANDIDATES.length) return null;

        const authToken = getToken();
        const connection = new signalR.HubConnectionBuilder()
            .withUrl(HUB_CANDIDATES[urlIndex], {
                accessTokenFactory: authToken ? () => authToken : undefined,
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Warning)
            .build();

        EVENT_NAMES.forEach((eventName) => {
            connection.on(eventName, (payload) => onEvent?.(eventName, payload));
        });

        connection.onreconnected(async () => {
            try {
                await joinGroup(connection, joinOptions);
            } catch (error) {
                onError?.(error);
            }
        });

        try {
            await connection.start();
            if (stopped) {
                await connection.stop().catch(() => {});
                return null;
            }

            currentConnection = connection;
            await joinGroup(connection, joinOptions);
            return connection;
        } catch (error) {
            await connection.stop().catch(() => {});
            if (urlIndex === HUB_CANDIDATES.length - 1) onError?.(error);
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
            const connection = currentConnection || await startPromise;
            if (connection?.state !== signalR.HubConnectionState.Connected) {
                throw new Error(`Cannot invoke ${method}: SignalR is not connected.`);
            }

            return connection.invoke(method, ...args);
        },
        async stop() {
            stopped = true;
            if (currentConnection) await currentConnection.stop().catch(() => {});
        },
    };
}
