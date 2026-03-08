/**
 * Mascoteach — Mascot Live Audio Service
 * 
 * Connects to the AI Service via WebSocket for real-time audio conversations
 * using Gemini Live API (audio-native model).
 * 
 * Architecture:
 *   Browser Mic → AudioWorklet (PCM 16kHz) → WebSocket → Backend → Gemini Live API
 *   Gemini Live API → Backend → WebSocket → AudioContext (PCM 24kHz) → Speaker
 */

const AI_WS_URL = import.meta.env.VITE_AI_WS_URL || 'https://ai.mascoteach.com';

// PCM Audio Worklet processor code (inline, loaded as a blob URL)
const AUDIO_WORKLET_CODE = `
class PCMProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this._bufferSize = 2048;
        this._buffer = new Float32Array(this._bufferSize);
        this._writeIndex = 0;
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];
        if (!input || !input[0]) return true;

        const channelData = input[0];
        for (let i = 0; i < channelData.length; i++) {
            this._buffer[this._writeIndex++] = channelData[i];
            if (this._writeIndex >= this._bufferSize) {
                // Convert float32 to int16 PCM
                const pcm16 = new Int16Array(this._bufferSize);
                for (let j = 0; j < this._bufferSize; j++) {
                    const s = Math.max(-1, Math.min(1, this._buffer[j]));
                    pcm16[j] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }
                this.port.postMessage({ pcmData: pcm16.buffer }, [pcm16.buffer]);
                this._buffer = new Float32Array(this._bufferSize);
                this._writeIndex = 0;
            }
        }
        return true;
    }
}
registerProcessor('pcm-processor', PCMProcessor);
`;

/**
 * MascotLiveAudioService — manages the full lifecycle of a live audio session.
 */
class MascotLiveAudioService {
    constructor() {
        /** @type {WebSocket|null} */
        this.ws = null;
        /** @type {AudioContext|null} */
        this.inputAudioContext = null;
        /** @type {MediaStream|null} */
        this.mediaStream = null;
        /** @type {AudioWorkletNode|null} */
        this.workletNode = null;
        /** @type {AudioContext|null} */
        this.playbackContext = null;
        /** @type {Array<Float32Array>} */
        this.audioQueue = [];
        /** @type {boolean} */
        this.isPlaying = false;
        /** @type {boolean} */
        this.isConnected = false;
        /** @type {boolean} */
        this.isSessionActive = false;

        // Callbacks
        /** @type {Function|null} */
        this.onSpeakingStart = null;
        /** @type {Function|null} */
        this.onSpeakingEnd = null;
        /** @type {Function|null} */
        this.onListeningStart = null;
        /** @type {Function|null} */
        this.onError = null;
        /** @type {Function|null} */
        this.onConnected = null;
        /** @type {Function|null} */
        this.onDisconnected = null;
        /** @type {Function|null} */
        this.onStatusChange = null;
    }

    /**
     * Connect to the backend WebSocket server.
     * @returns {Promise<void>}
     */
    async connect() {
        return new Promise((resolve, reject) => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                resolve();
                return;
            }

            const wsUrl = `${AI_WS_URL}/ws/mascot-live`;
            console.log('[MascotLive] Connecting to:', wsUrl);

            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                console.log('[MascotLive] WebSocket connected');
                this.isConnected = true;
                resolve();
            };

            this.ws.onmessage = (event) => {
                this._handleServerMessage(JSON.parse(event.data));
            };

            this.ws.onerror = (error) => {
                console.error('[MascotLive] WebSocket error:', error);
                this.onError?.('Connection error. Please try again.');
                reject(error);
            };

            this.ws.onclose = () => {
                console.log('[MascotLive] WebSocket closed');
                this.isConnected = false;
                this.isSessionActive = false;
                this.onDisconnected?.();
                this.onStatusChange?.('disconnected');
            };
        });
    }

    /**
     * Handle messages from the backend WebSocket.
     * @param {{type: string, data?: string, message?: string}} msg
     */
    _handleServerMessage(msg) {
        switch (msg.type) {
            case 'connected':
                console.log('[MascotLive] Gemini session established');
                this.isSessionActive = true;
                this.onConnected?.();
                this.onStatusChange?.('connected');
                break;

            case 'audio':
                if (msg.data) {
                    this._enqueueAudio(msg.data);
                }
                break;

            case 'turn_complete':
                console.log('[MascotLive] Model turn complete');
                // Speaking end will fire when playback finishes
                break;

            case 'interrupted':
                console.log('[MascotLive] Model interrupted');
                this.audioQueue = [];
                this._stopPlayback();
                this.onSpeakingEnd?.();
                break;

            case 'error':
                console.error('[MascotLive] Server error:', msg.message);
                this.onError?.(msg.message || 'AI service error');
                break;

            case 'session_ended':
                console.log('[MascotLive] Session ended');
                this.isSessionActive = false;
                this.onStatusChange?.('session_ended');
                break;

            default:
                console.warn('[MascotLive] Unknown message type:', msg.type);
        }
    }

    /**
     * Start a live audio session:
     * 1. Connect WebSocket if needed
     * 2. Tell backend to create a Gemini session
     * 3. Start capturing mic audio
     */
    async startSession() {
        try {
            // Connect WebSocket first
            if (!this.isConnected) {
                await this.connect();
            }

            // Tell server to start Gemini session
            this._send({ type: 'start' });

            // Wait briefly for Gemini connection confirmation
            await new Promise((resolve) => {
                const checkInterval = setInterval(() => {
                    if (this.isSessionActive) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 100);
                // Timeout after 10 seconds
                setTimeout(() => {
                    clearInterval(checkInterval);
                    resolve(); // resolve anyway
                }, 10000);
            });

            // Start microphone capture
            await this._startMicCapture();

            this.onListeningStart?.();
            this.onStatusChange?.('listening');

            console.log('[MascotLive] Session started — listening');
        } catch (error) {
            console.error('[MascotLive] Failed to start session:', error);
            this.onError?.('Failed to start audio session. Please check microphone access.');
            throw error;
        }
    }

    /**
     * Stop the live audio session.
     */
    stopSession() {
        this._stopMicCapture();
        this._stopPlayback();
        this.audioQueue = [];

        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this._send({ type: 'stop' });
        }

        this.isSessionActive = false;
        this.onSpeakingEnd?.();
        this.onStatusChange?.('idle');
        console.log('[MascotLive] Session stopped');
    }

    /**
     * Send a text prompt to the AI model (e.g. for goodbye).
     * The model will respond with audio.
     * @param {string} text 
     */
    sendText(text) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN && this.isSessionActive) {
            this._send({ type: 'text', text });
        }
    }

    /**
     * Fully disconnect and clean up everything.
     */
    disconnect() {
        this.stopSession();
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.isConnected = false;
    }

    /**
     * Start capturing microphone audio via AudioWorklet.
     */
    async _startMicCapture() {
        // Request microphone
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                sampleRate: 16000,
                channelCount: 1,
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
            },
        });

        // Create AudioContext at 16kHz for input
        this.inputAudioContext = new AudioContext({ sampleRate: 16000 });

        // Load the AudioWorklet processor
        const blob = new Blob([AUDIO_WORKLET_CODE], { type: 'application/javascript' });
        const workletUrl = URL.createObjectURL(blob);
        await this.inputAudioContext.audioWorklet.addModule(workletUrl);
        URL.revokeObjectURL(workletUrl);

        // Create source and worklet node
        const source = this.inputAudioContext.createMediaStreamSource(this.mediaStream);
        this.workletNode = new AudioWorkletNode(this.inputAudioContext, 'pcm-processor');

        // When the worklet sends PCM data, forward it via WebSocket
        this.workletNode.port.onmessage = (event) => {
            if (event.data.pcmData && this.isSessionActive) {
                const base64 = this._arrayBufferToBase64(event.data.pcmData);
                this._send({ type: 'audio', data: base64 });
            }
        };

        source.connect(this.workletNode);
        this.workletNode.connect(this.inputAudioContext.destination);
        // Note: we connect to destination to keep the graph alive,
        // but the worklet node produces silence output
    }

    /**
     * Stop microphone capture.
     */
    _stopMicCapture() {
        if (this.workletNode) {
            this.workletNode.disconnect();
            this.workletNode = null;
        }
        if (this.inputAudioContext) {
            this.inputAudioContext.close().catch(() => { });
            this.inputAudioContext = null;
        }
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach((track) => track.stop());
            this.mediaStream = null;
        }
    }

    /**
     * Enqueue received base64 PCM audio for playback.
     * PCM format: 16-bit signed, 24kHz, mono
     * @param {string} base64Data 
     */
    _enqueueAudio(base64Data) {
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // Convert Int16 PCM to Float32
        const int16 = new Int16Array(bytes.buffer);
        const float32 = new Float32Array(int16.length);
        for (let i = 0; i < int16.length; i++) {
            float32[i] = int16[i] / 32768.0;
        }

        this.audioQueue.push(float32);

        if (!this.isPlaying) {
            this._playNextChunk();
        }
    }

    /**
    * Play audio chunks from the queue sequentially.
    */
    async _playNextChunk() {
        if (this.audioQueue.length === 0) {
            this.isPlaying = false;
            this.onSpeakingEnd?.();
            return;
        }

        this.isPlaying = true;
        this.onSpeakingStart?.();

        // Create playback context if needed (24kHz output from Gemini)
        if (!this.playbackContext || this.playbackContext.state === 'closed') {
            this.playbackContext = new AudioContext({ sampleRate: 24000 });
        }

        // Concatenate all queued chunks for smoother playback
        let totalLength = 0;
        const chunks = [];
        while (this.audioQueue.length > 0) {
            const chunk = this.audioQueue.shift();
            chunks.push(chunk);
            totalLength += chunk.length;
        }

        const combined = new Float32Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
            combined.set(chunk, offset);
            offset += chunk.length;
        }

        // Create an AudioBuffer and play it
        const audioBuffer = this.playbackContext.createBuffer(1, combined.length, 24000);
        audioBuffer.getChannelData(0).set(combined);

        const source = this.playbackContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.playbackContext.destination);

        source.onended = () => {
            // Check if more audio arrived while we were playing
            if (this.audioQueue.length > 0) {
                this._playNextChunk();
            } else {
                this.isPlaying = false;
                this.onSpeakingEnd?.();
            }
        };

        source.start();
    }

    /**
     * Stop any current audio playback.
     */
    _stopPlayback() {
        this.isPlaying = false;
        if (this.playbackContext && this.playbackContext.state !== 'closed') {
            this.playbackContext.close().catch(() => { });
            this.playbackContext = null;
        }
    }

    /**
     * Send a JSON message through the WebSocket.
     * @param {object} msg 
     */
    _send(msg) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(msg));
        }
    }

    /**
     * Convert an ArrayBuffer to a base64 string.
     * @param {ArrayBuffer} buffer
     * @returns {string}
     */
    _arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }
}

// Export a singleton instance
export const mascotLiveService = new MascotLiveAudioService();

/**
 * Legacy fallback: Send a text chat message to the AI via REST.
 * Used if audio is not available.
 */
const AI_BASE_URL = import.meta.env.VITE_AI_BASE_URL || 'https://ai.mascoteach.com';

export async function sendMascotMessage(message, history = []) {
    try {
        const res = await fetch(`${AI_BASE_URL}/api/v1/ai/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, history }),
        });

        if (!res.ok) {
            throw new Error(`AI responded with status ${res.status}`);
        }

        const data = await res.json();
        return data.reply || data.message || data.data?.reply || 'Hmm, I didn\'t quite get that. Try again?';
    } catch (error) {
        console.warn('Mascot chat API error, using fallback:', error.message);
        return getFallbackResponse(message);
    }
}

/**
 * Fallback responses when the AI endpoint is unavailable.
 */
function getFallbackResponse(message) {
    const lower = message.toLowerCase();

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('xin chào')) {
        return 'Hey there! 👋 I\'m your Mascoteach assistant! I can help you navigate the platform, explain features, or just chat. What would you like to know?';
    }
    if (lower.includes('quiz') || lower.includes('question')) {
        return 'Want to create a quiz? Head over to the Library page, upload a document, and I\'ll help generate questions automatically! 📝';
    }
    if (lower.includes('help')) {
        return 'I\'m here to help! You can ask me about creating quizzes, managing sessions, or navigating the platform. What do you need? 🤔';
    }
    if (lower.includes('game') || lower.includes('play')) {
        return 'Games are a great way to learn! Once you\'ve created a quiz, you can select a game template and start a live session for your students. 🎮';
    }
    if (lower.includes('thank')) {
        return 'You\'re welcome! Always happy to help! 😊 Let me know if you need anything else.';
    }

    const genericResponses = [
        'That\'s interesting! Tell me more about what you\'re working on. 🌟',
        'I\'m still learning, but I\'m here to help with anything about Mascoteach! 💡',
        'Great question! Feel free to explore the platform — I\'ll be right here if you need me. 🎯',
        'I love chatting! Ask me about quizzes, sessions, or anything else on the platform. 📚',
    ];

    return genericResponses[Math.floor(Math.random() * genericResponses.length)];
}
