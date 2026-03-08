import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMascot } from '@/contexts/MascotContext';
import { useAuth } from '@/contexts/AuthContext';
import { mascotLiveService } from '@/services/mascotChatService';
import './MascotWidget.css';

// Mascot sprite images (swap PNGs keeping these names)
const MASCOT_IDLE = '/images/mascot-idle.png';
const MASCOT_SPEAKING = '/images/mascot-speaking.png';
const MASCOT_HEAD = '/images/mascot-head.png';

/**
 * Radial menu options — arranged in a Sims-style fan.
 * Each has an id, label, icon (SVG path data), and an action key.
 */
const MENU_OPTIONS = [
    {
        id: 'talk',
        label: 'Nói chuyện',
        action: 'talk',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
        ),
    },
    {
        id: 'help',
        label: 'Trợ giúp',
        action: 'help',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
        ),
    },
    {
        id: 'quiz',
        label: 'Làm Quiz',
        action: 'quiz',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
            </svg>
        ),
    },
    {
        id: 'tip',
        label: 'Mẹo hay',
        action: 'tip',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="9" y1="18" x2="15" y2="18" />
                <line x1="10" y1="22" x2="14" y2="22" />
                <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
            </svg>
        ),
    },
    {
        id: 'dismiss',
        label: 'Tạm biệt',
        action: 'dismiss',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
            </svg>
        ),
    },
];

/**
 * Status labels for the live audio session
 */
const STATUS_LABELS = {
    idle: '',
    connecting: 'Đang kết nối...',
    connected: 'Sẵn sàng!',
    listening: '🎤 Đang nghe...',
    speaking: '🔊 Đang nói...',
    error: '⚠️ Lỗi',
    disconnected: 'Đã ngắt kết nối',
};

export default function MascotWidget() {
    const { isLoggedIn } = useAuth();
    const { pathname } = useLocation();
    const {
        isOpen,
        isSpeaking,
        toggleMascot,
        closeMascot,
        setIsSpeaking,
    } = useMascot();

    const [menuOpen, setMenuOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [speechBubble, setSpeechBubble] = useState('');
    const [bubbleVisible, setBubbleVisible] = useState(false);
    const bubbleTimeoutRef = useRef(null);
    const speakTimeoutRef = useRef(null);
    const liveServiceRef = useRef(mascotLiveService);
    // Tracks whether a dismiss was triggered so onExitComplete can fire closeMascot
    const isPendingCloseRef = useRef(false);

    // ── Wire up the live audio service callbacks ──
    useEffect(() => {
        const service = liveServiceRef.current;

        service.onSpeakingStart = () => {
            setIsSpeaking(true);
            showBubble('🔊 Đang nói...', 0);
        };

        service.onSpeakingEnd = () => {
            setIsSpeaking(false);
            // Keep the "listening" bubble if session is active
            if (service.isSessionActive) {
                showBubble('🎤 Đang nghe...', 0);
            } else {
                setBubbleVisible(false);
            }
        };

        service.onListeningStart = () => {
            setIsListening(true);
        };

        service.onError = (message) => {
            console.error('[MascotWidget] Error:', message);
            showBubble(`Ôi! ${message}`, 5000);
            setIsListening(false);
            setIsSpeaking(false);
        };

        service.onConnected = () => {
            console.log('[MascotWidget] Gemini connected');
        };

        service.onDisconnected = () => {
            setIsSessionActive(false);
            setIsListening(false);
            setIsSpeaking(false);
        };

        service.onStatusChange = (status) => {
            if (status === 'connected' || status === 'listening') {
                setIsSessionActive(true);
            } else if (status === 'session_ended' || status === 'disconnected') {
                setIsSessionActive(false);
                setIsListening(false);
            }
        };

        return () => {
            // Clean up callbacks
            service.onSpeakingStart = null;
            service.onSpeakingEnd = null;
            service.onListeningStart = null;
            service.onError = null;
            service.onConnected = null;
            service.onDisconnected = null;
            service.onStatusChange = null;
        };
    }, [setIsSpeaking]);

    // ── Cleanup on unmount ──
    useEffect(() => {
        return () => {
            clearTimeout(bubbleTimeoutRef.current);
            clearTimeout(speakTimeoutRef.current);
            liveServiceRef.current.disconnect();
        };
    }, []);

    // ── Stop everything when mascot hides ──
    // TODO: Play a static greeting sound file when isOpen becomes true
    useEffect(() => {
        if (!isOpen) {
            liveServiceRef.current.stopSession();
            setIsListening(false);
            setIsSpeaking(false);
            setIsSessionActive(false);
            setMenuOpen(false);
            setBubbleVisible(false);
        }
    }, [isOpen, setIsSpeaking]);

    // Close menu when clicking outside
    useEffect(() => {
        if (!menuOpen) return;
        const handleClick = (e) => {
            if (!e.target.closest('.mascot-area')) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [menuOpen]);

    /**
     * Show a temporary speech bubble above the mascot
     */
    const showBubble = useCallback((text, duration = 5000) => {
        clearTimeout(bubbleTimeoutRef.current);
        setSpeechBubble(text);
        setBubbleVisible(true);
        if (duration > 0) {
            bubbleTimeoutRef.current = setTimeout(() => {
                setBubbleVisible(false);
            }, duration);
        }
    }, []);

    /**
     * Toggle the live audio session (Talk button).
     * If a session is active, stop it. Otherwise, start one.
     */
    const toggleLiveSession = useCallback(async () => {
        setMenuOpen(false);

        if (isSessionActive) {
            // Stop the active session
            liveServiceRef.current.stopSession();
            setIsSessionActive(false);
            setIsListening(false);
            setIsSpeaking(false);
            showBubble('Đã kết thúc. Bấm Nói chuyện để trò chuyện lại!', 4000);
            return;
        }

        // Guard: microphone + AudioWorklet require a secure context (HTTPS or localhost)
        if (!window.isSecureContext) {
            showBubble('⚠️ Tính năng giọng nói chỉ hoạt động trên HTTPS. Vui lòng truy cập qua mascoteach.com!', 6000);
            return;
        }

        // Guard: AudioWorklet support (not available on old iOS Safari)
        if (!window.AudioContext && !window.webkitAudioContext) {
            showBubble('⚠️ Trình duyệt của bạn không hỗ trợ tính năng giọng nói. Hãy dùng Chrome hoặc Edge!', 6000);
            return;
        }

        try {
            showBubble('Đang kết nối với Tanuki...', 0);
            setIsSpeaking(true); // Show as "thinking" while connecting

            await liveServiceRef.current.startSession();

            setIsSessionActive(true);
            setIsListening(true);
            setIsSpeaking(false);
            showBubble('🎤 Đang nghe... Hãy nói với Tanuki!', 0);
        } catch (error) {
            console.error('[MascotWidget] Failed to start session:', error);
            setIsSpeaking(false);
            showBubble('Không thể kết nối. Vui lòng thử lại!', 5000);
        }
    }, [isSessionActive, setIsSpeaking, showBubble]);

    /**
     * Handle dismiss — simple close, no AI call.
     * TODO: Play a static goodbye sound file here later.
     */
    const handleDismiss = useCallback(() => {
        liveServiceRef.current.disconnect();
        setIsSessionActive(false);
        setIsListening(false);
        setIsSpeaking(false);
        setBubbleVisible(false);
        if (menuOpen) {
            // Menu is open — let it animate out first, then drop mascot via onExitComplete
            setMenuOpen(false);
            isPendingCloseRef.current = true;
        } else {
            closeMascot();
        }
    }, [closeMascot, menuOpen, setIsSpeaking]);

    /**
     * Briefly put the mascot into speaking mode for `ms` milliseconds.
     * Used by non-live menu actions to animate the sprite while the bubble shows.
     */
    const speakForDuration = useCallback((ms = 2000) => {
        clearTimeout(speakTimeoutRef.current);
        setIsSpeaking(true);
        speakTimeoutRef.current = setTimeout(() => setIsSpeaking(false), ms);
    }, [setIsSpeaking]);

    /**
     * Handle radial menu option selection
     */
    const handleMenuAction = useCallback((action) => {
        setMenuOpen(false);
        switch (action) {
            case 'talk':
                toggleLiveSession();
                break;
            case 'help':
                speakForDuration(2000);
                showBubble('Mình là Tanuki! 🦝 Bấm Nói chuyện để trò chuyện bằng giọng nói nhé!', 4000);
                break;
            case 'quiz':
                speakForDuration(2000);
                showBubble('Vào Thư viện, tải tài liệu lên, mình sẽ tạo câu hỏi quiz cho bạn! 📝', 4000);
                break;
            case 'tip':
                speakForDuration(2000);
                showBubble('Mẹo: Tạo phiên chơi trực tiếp từ quiz để học vui hơn! 🎮', 4000);
                break;
            case 'dismiss':
                handleDismiss();
                break;
            default:
                break;
        }
    }, [toggleLiveSession, speakForDuration, showBubble, handleDismiss]);

    const handleMascotClick = () => {
        if (isSessionActive) {
            // If session is active, clicking the mascot stops it
            toggleLiveSession();
            return;
        }
        // Hide bubble when opening menu so it doesn't overlap
        setBubbleVisible(false);
        setMenuOpen((prev) => !prev);
    };

    const mascotImage = isSpeaking ? MASCOT_SPEAKING : MASCOT_IDLE;

    // Hide on public/auth pages and when not logged in
    const PUBLIC_PATHS = ['/', '/login', '/signup', '/forgot-password'];
    if (!isLoggedIn || PUBLIC_PATHS.includes(pathname)) return null;

    // ── Hardcoded positions for Sims-style fan (left of mascot) ──
    const RADIAL_POSITIONS = [
        { x: -130, y: -190 },  // Talk — upper, slightly left
        { x: -210, y: -150 },  // Help — upper-left
        { x: -245, y: -80 },   // Quiz Me — mid-left
        { x: -235, y: 0 },     // Give Tip — left
        { x: -190, y: 70 },    // Bye! — lower-left
    ];

    return (
        <div className="mascot-widget" id="mascot-widget">
            {/* ── Trigger Button (rounded square, brand-themed) ── */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        className="mascot-trigger-btn"
                        id="mascot-trigger-button"
                        onClick={toggleMascot}
                        variants={{
                            hidden: { scale: 0, opacity: 0 },
                            visible: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 400, damping: 20 } },
                            exit: { scale: [1, 1.18, 0], opacity: [1, 1, 0], transition: { duration: 0.35, times: [0, 0.32, 1], ease: 'easeInOut' } },
                        }}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        aria-label="Gọi Tanuki"
                    >
                        <img
                            src={MASCOT_HEAD}
                            alt="Mascoteach"
                            className="mascot-trigger-img"
                        />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* ── Mascot Character (living on the page, no box) ── */}
            <AnimatePresence>
                {isOpen && (
                    <div className="mascot-area">
                        {/* Speech bubble */}
                        <AnimatePresence>
                            {bubbleVisible && speechBubble && (
                                <motion.div
                                    className={`mascot-bubble ${isSessionActive ? 'mascot-bubble--live' : ''}`}
                                    initial={{ opacity: 0, scale: 0.7, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.7, y: 10 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                >
                                    <p>{speechBubble}</p>
                                    <div className="mascot-bubble-tail" />

                                    {isListening && isSessionActive && (
                                        <div className="mascot-listening-bars">
                                            <span /><span /><span /><span />
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Live session indicator */}
                        <AnimatePresence>
                            {isSessionActive && (
                                <motion.div
                                    className="mascot-live-indicator"
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                >
                                    <span className="mascot-live-dot" />
                                    <span className="mascot-live-text">LIVE</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Sims-style radial menu */}
                        <AnimatePresence onExitComplete={() => {
                            if (isPendingCloseRef.current) {
                                isPendingCloseRef.current = false;
                                closeMascot();
                            }
                        }}>
                            {menuOpen && (
                                <div className="mascot-radial-menu">
                                    {MENU_OPTIONS.map((opt, i) => {
                                        const pos = RADIAL_POSITIONS[i];
                                        return (
                                            <motion.button
                                                key={opt.id}
                                                className="mascot-radial-option"
                                                id={`mascot-option-${opt.id}`}
                                                onClick={() => handleMenuAction(opt.action)}
                                                initial={{ opacity: 0, x: 0, y: 0, scale: 0.3 }}
                                                animate={{
                                                    opacity: 1,
                                                    x: pos.x,
                                                    y: pos.y,
                                                    scale: 1,
                                                }}
                                                exit={{ opacity: 0, x: 0, y: 0, scale: 0.3 }}
                                                transition={{
                                                    type: 'spring',
                                                    stiffness: 350,
                                                    damping: 22,
                                                    delay: i * 0.04,
                                                }}
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <span className="mascot-radial-icon">{opt.icon}</span>
                                                <span className="mascot-radial-label">{opt.label}</span>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            )}
                        </AnimatePresence>

                        {/* Mascot character sprite */}
                        <motion.div
                            className={`mascot-character ${isSessionActive ? 'mascot-character--live' : ''}`}
                            id="mascot-character"
                            variants={{
                                hidden: { y: 300, opacity: 0 },
                                visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 160, damping: 14 } },
                                exit: { y: [0, -18, 300], opacity: [1, 1, 0], transition: { duration: 0.45, times: [0, 0.2, 1], ease: 'easeIn' } },
                            }}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            onClick={handleMascotClick}
                            role="button"
                            tabIndex={0}
                            aria-label={isSessionActive ? "Dừng nói chuyện với Tanuki" : "Tương tác với Tanuki"}
                        >
                            <motion.img
                                key={mascotImage}
                                src={mascotImage}
                                alt="Mascoteach Character"
                                className="mascot-sprite"
                                initial={{ opacity: 0 }}
                                animate={{
                                    opacity: 1,
                                    y: isSpeaking ? [0, -4, 0] : [0, -6, 0],
                                }}
                                transition={{
                                    opacity: { duration: 0.15 },
                                    y: {
                                        duration: isSpeaking ? 0.5 : 3,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    },
                                }}
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
