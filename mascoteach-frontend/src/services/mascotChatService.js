/**
 * Mascoteach - Mascot AI service
 *
 * This adapter keeps the MascotWidget callback contract intact while using
 * OpenAI Realtime over WebRTC via backend-issued ephemeral client secrets.
 */

import { resolveAiBaseUrl } from './baseUrls';

const AI_BASE_URL = resolveAiBaseUrl();

class MascotLiveAudioService {
    constructor() {
        this.sessionId = null;
        this.session = null;
        this.isConnected = false;
        this.isSessionActive = false;
        this.isPlaying = false;

        this.peerConnection = null;
        this.dataChannel = null;
        this.localStream = null;
        this.remoteAudio = null;
        this.connectionPromise = null;

        this.onSpeakingStart = null;
        this.onSpeakingEnd = null;
        this.onListeningStart = null;
        this.onError = null;
        this.onConnected = null;
        this.onDisconnected = null;
        this.onStatusChange = null;
    }

    async connect() {
        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        if (this.isConnected && this.sessionId && this.peerConnection) {
            return this.session;
        }

        this.connectionPromise = this.#connectInternal();

        try {
            return await this.connectionPromise;
        } finally {
            this.connectionPromise = null;
        }
    }

    async #connectInternal() {
        const response = await fetch(`${AI_BASE_URL}/api/v1/mascot-live/session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                displayName: 'Mascoteach learner',
                language: 'vi',
            }),
        });

        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload?.success || !payload?.data) {
            throw new Error(payload?.message || `Mascot live responded with status ${response.status}`);
        }

        const session = payload.data;
        const ephemeralKey = session?.clientSecret?.value || session?.clientSecret;
        if (!ephemeralKey) {
            throw new Error('Mascot live session did not include an OpenAI ephemeral client secret.');
        }

        const apiBaseUrl = session?.connection?.apiBaseUrl || 'https://api.openai.com';
        const callEndpoint = session?.connection?.callEndpoint || '/v1/realtime/calls';
        const dataChannelLabel = session?.connection?.dataChannelLabel || 'oai-events';

        const pc = new RTCPeerConnection();
        const remoteAudio = this.#ensureRemoteAudio();
        const localStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
            },
        });

        localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
        pc.ontrack = (event) => {
            remoteAudio.srcObject = event.streams[0];
        };
        pc.onconnectionstatechange = () => {
            if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected' || pc.connectionState === 'closed') {
                this.#handleDisconnect();
            }
        };

        remoteAudio.onplaying = () => {
            if (!this.isPlaying) {
                this.isPlaying = true;
                this.onSpeakingStart?.();
                this.onStatusChange?.('speaking');
            }
        };

        const dataChannel = pc.createDataChannel(dataChannelLabel);
        dataChannel.addEventListener('open', () => {
            this.onListeningStart?.();
            this.onStatusChange?.('listening');
        });
        dataChannel.addEventListener('message', (event) => {
            this.#handleRealtimeEvent(event.data);
        });
        dataChannel.addEventListener('close', () => {
            if (this.isSessionActive) {
                this.onStatusChange?.('idle');
            }
        });

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        const sdpResponse = await fetch(`${apiBaseUrl.replace(/\/+$/, '')}${callEndpoint}`, {
            method: 'POST',
            body: offer.sdp,
            headers: {
                Authorization: `Bearer ${ephemeralKey}`,
                'Content-Type': 'application/sdp',
            },
        });

        if (!sdpResponse.ok) {
            const errorText = await sdpResponse.text().catch(() => '');
            throw new Error(errorText || `OpenAI Realtime call setup failed (${sdpResponse.status}).`);
        }

        const answerSdp = await sdpResponse.text();
        await pc.setRemoteDescription({
            type: 'answer',
            sdp: answerSdp,
        });

        this.session = session;
        this.sessionId = session?.sessionId || null;
        this.peerConnection = pc;
        this.dataChannel = dataChannel;
        this.localStream = localStream;
        this.remoteAudio = remoteAudio;
        this.isConnected = true;
        this.isSessionActive = true;

        console.log('[MascotLive] OpenAI Realtime session created:', this.sessionId);
        this.onConnected?.(session);
        this.onStatusChange?.('connected');

        return session;
    }

    async startSession() {
        try {
            if (!this.isConnected) {
                await this.connect();
            }

            this.isSessionActive = true;
            this.onListeningStart?.();
            this.onStatusChange?.('listening');
            console.log('[MascotLive] Session started via OpenAI Realtime');
        } catch (error) {
            console.error('[MascotLive] Failed to start session:', error);
            this.#teardownConnection(false);
            this.onError?.(error.message || 'Failed to start mascot session.');
            this.onStatusChange?.('error');
            throw error;
        }
    }

    stopSession() {
        const currentSessionId = this.sessionId;
        this.#teardownConnection(true);

        if (currentSessionId) {
            fetch(`${AI_BASE_URL}/api/v1/mascot-live/session/${currentSessionId}/end`, {
                method: 'POST',
            }).catch(() => {});
        }

        this.onStatusChange?.('idle');
        console.log('[MascotLive] Session stopped');
    }

    async sendText(text) {
        if (this.dataChannel?.readyState === 'open') {
            this.#sendRealtimeEvent({
                type: 'conversation.item.create',
                item: {
                    type: 'message',
                    role: 'user',
                    content: [
                        {
                            type: 'input_text',
                            text,
                        },
                    ],
                },
            });
            this.#sendRealtimeEvent({ type: 'response.create' });
            return null;
        }

        return sendMascotMessage(text);
    }

    disconnect() {
        this.stopSession();
        this.sessionId = null;
        this.session = null;
        this.onDisconnected?.();
        this.onStatusChange?.('disconnected');
    }

    #handleRealtimeEvent(rawData) {
        try {
            const event = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;

            if (event?.type === 'response.created' || event?.type === 'response.output_item.added') {
                if (!this.isPlaying) {
                    this.isPlaying = true;
                    this.onSpeakingStart?.();
                    this.onStatusChange?.('speaking');
                }
            }

            if (
                event?.type === 'response.done' ||
                event?.type === 'output_audio_buffer.stopped' ||
                event?.type === 'response.completed'
            ) {
                if (this.isPlaying) {
                    this.isPlaying = false;
                    this.onSpeakingEnd?.();
                }

                if (this.isSessionActive) {
                    this.onListeningStart?.();
                    this.onStatusChange?.('listening');
                }
            }

            if (event?.type === 'error') {
                const message = event?.error?.message || event?.message || 'OpenAI Realtime error.';
                this.onError?.(message);
                this.onStatusChange?.('error');
            }
        } catch (error) {
            console.warn('[MascotLive] Failed to parse realtime event:', error);
        }
    }

    #sendRealtimeEvent(event) {
        if (this.dataChannel?.readyState !== 'open') {
            throw new Error('Realtime data channel is not open.');
        }

        this.dataChannel.send(JSON.stringify(event));
    }

    #ensureRemoteAudio() {
        if (this.remoteAudio) {
            return this.remoteAudio;
        }

        const audio = document.createElement('audio');
        audio.autoplay = true;
        audio.playsInline = true;
        audio.style.display = 'none';
        document.body.appendChild(audio);
        this.remoteAudio = audio;
        return audio;
    }

    #handleDisconnect() {
        this.#teardownConnection(false);
        this.onDisconnected?.();
        this.onStatusChange?.('disconnected');
    }

    #teardownConnection(clearSessionId) {
        this.isSessionActive = false;
        this.isConnected = false;

        if (this.isPlaying) {
            this.isPlaying = false;
            this.onSpeakingEnd?.();
        }

        if (this.dataChannel) {
            try {
                this.dataChannel.close();
            } catch { }
            this.dataChannel = null;
        }

        if (this.peerConnection) {
            try {
                this.peerConnection.getSenders().forEach((sender) => sender.track?.stop());
                this.peerConnection.close();
            } catch { }
            this.peerConnection = null;
        }

        if (this.localStream) {
            this.localStream.getTracks().forEach((track) => track.stop());
            this.localStream = null;
        }

        if (this.remoteAudio) {
            this.remoteAudio.pause?.();
            this.remoteAudio.srcObject = null;
        }

        if (clearSessionId) {
            this.sessionId = null;
            this.session = null;
        }
    }
}

export const mascotLiveService = new MascotLiveAudioService();

export async function sendMascotMessage(message, history = []) {
    try {
        const res = await fetch(`${AI_BASE_URL}/api/v1/ai/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, history }),
        });

        const data = await res.json().catch(() => null);
        if (!res.ok || data?.success === false) {
            throw new Error(data?.message || `AI responded with status ${res.status}`);
        }

        return data?.reply || data?.message || data?.data?.reply || getFallbackResponse(message);
    } catch (error) {
        console.warn('Mascot chat API error, using fallback:', error.message);
        return getFallbackResponse(message);
    }
}

function getFallbackResponse(message) {
    const lower = String(message || '').toLowerCase();

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('xin chao') || lower.includes('xin chào')) {
        return 'Chào bạn! Mình là Sumadi, trợ lý Mascoteach. Mình có thể giúp bạn tạo quiz, mở live game hoặc gợi ý cách tổ chức lớp học.';
    }
    if (lower.includes('quiz') || lower.includes('question') || lower.includes('câu hỏi')) {
        return 'Để tạo quiz, vào Thư viện, tải tài liệu lên, chọn cấu hình rồi để AI sinh câu hỏi. Sau đó bạn có thể xem lại và xuất bản.';
    }
    if (lower.includes('help') || lower.includes('trợ giúp')) {
        return 'Bạn có thể hỏi mình về upload tài liệu, tạo bộ câu hỏi, mở phiên live hoặc cách học sinh tham gia bằng PIN.';
    }
    if (lower.includes('game') || lower.includes('play')) {
        return 'Sau khi có quiz, chọn mẫu game trong thư viện để tạo phòng live, lấy PIN và chia sẻ cho học sinh.';
    }
    if (lower.includes('thank') || lower.includes('cảm ơn')) {
        return 'Không có gì. Mình ở đây để giúp lớp học chạy mượt hơn.';
    }

    return 'Mình đang sẵn sàng hỗ trợ Mascoteach. Bạn muốn tạo quiz, mở game hay xem lại báo cáo buổi học?';
}
