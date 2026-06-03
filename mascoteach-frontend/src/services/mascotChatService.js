/**
 * Mascoteach - Mascot AI service
 *
 * The AI service currently exposes Agora native ConvoAI through REST
 * (/api/v1/mascot-live/session), not the older /ws/mascot-live WebSocket.
 * This adapter keeps the MascotWidget callback contract intact while using
 * the backend route that actually exists.
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

        this.onSpeakingStart = null;
        this.onSpeakingEnd = null;
        this.onListeningStart = null;
        this.onError = null;
        this.onConnected = null;
        this.onDisconnected = null;
        this.onStatusChange = null;
    }

    async connect() {
        if (this.isConnected && this.sessionId) return;

        const response = await fetch(`${AI_BASE_URL}/api/v1/mascot-live/session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                displayName: 'Mascoteach learner',
                language: 'vi',
            }),
        });

        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload?.success) {
            throw new Error(payload?.message || `Mascot live responded with status ${response.status}`);
        }

        this.session = payload.data;
        this.sessionId = payload.data?.sessionId || null;
        this.isConnected = true;
        this.isSessionActive = payload.data?.status === 'active' || payload.data?.status === 'created';

        console.log('[MascotLive] Agora session created:', this.sessionId);
        this.onConnected?.(this.session);
        this.onStatusChange?.('connected');
    }

    async startSession() {
        try {
            if (!this.isConnected) {
                await this.connect();
            }

            this.isSessionActive = true;
            this.onListeningStart?.();
            this.onStatusChange?.('listening');
            console.log('[MascotLive] Session started via Agora REST');
        } catch (error) {
            console.error('[MascotLive] Failed to start session:', error);
            this.isConnected = false;
            this.isSessionActive = false;
            this.onError?.(error.message || 'Failed to start mascot session.');
            this.onStatusChange?.('error');
            throw error;
        }
    }

    stopSession() {
        if (this.sessionId) {
            fetch(`${AI_BASE_URL}/api/v1/mascot-live/session/${this.sessionId}/end`, {
                method: 'POST',
            }).catch(() => {});
        }

        this.isSessionActive = false;
        this.isPlaying = false;
        this.onSpeakingEnd?.();
        this.onStatusChange?.('idle');
        console.log('[MascotLive] Session stopped');
    }

    sendText(text) {
        return sendMascotMessage(text);
    }

    disconnect() {
        this.stopSession();
        this.sessionId = null;
        this.session = null;
        this.isConnected = false;
        this.isSessionActive = false;
        this.onDisconnected?.();
        this.onStatusChange?.('disconnected');
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
