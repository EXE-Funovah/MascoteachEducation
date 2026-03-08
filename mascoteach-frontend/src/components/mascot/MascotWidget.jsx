import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMascot } from '@/contexts/MascotContext';
import { sendMascotMessage } from '@/services/mascotChatService';
import './MascotWidget.css';

// Mascot sprite images (swap PNGs keeping these names)
const MASCOT_IDLE = '/images/mascot-idle.png';
const MASCOT_SPEAKING = '/images/mascot-speaking.png';

/**
 * Radial menu options — arranged in a Sims-style fan.
 * Each has an id, label, icon (SVG path data), and an action key.
 */
const MENU_OPTIONS = [
    {
        id: 'talk',
        label: 'Talk',
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
        label: 'Help',
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
        label: 'Quiz Me',
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
        label: 'Give Tip',
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
        label: 'Bye!',
        action: 'dismiss',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
            </svg>
        ),
    },
];

export default function MascotWidget() {
    const {
        isOpen,
        isSpeaking,
        messages,
        toggleMascot,
        closeMascot,
        addMessage,
        setIsSpeaking,
    } = useMascot();

    const [menuOpen, setMenuOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [speechBubble, setSpeechBubble] = useState('');
    const [bubbleVisible, setBubbleVisible] = useState(false);
    const recognitionRef = useRef(null);
    const synthRef = useRef(window.speechSynthesis);
    const speakingTimeoutRef = useRef(null);
    const bubbleTimeoutRef = useRef(null);

    // ── Cleanup ──
    useEffect(() => {
        return () => {
            recognitionRef.current?.abort?.();
            synthRef.current?.cancel();
            clearTimeout(speakingTimeoutRef.current);
            clearTimeout(bubbleTimeoutRef.current);
        };
    }, []);

    // ── Stop everything when mascot hides ──
    useEffect(() => {
        if (!isOpen) {
            synthRef.current?.cancel();
            recognitionRef.current?.abort?.();
            setIsListening(false);
            setIsSpeaking(false);
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
     * Speak text aloud via TTS + show in speech bubble
     */
    const speak = useCallback((text) => {
        if (!synthRef.current) return;
        synthRef.current.cancel();

        showBubble(text, 0); // keep visible until done speaking

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1;
        utterance.pitch = 1.1;
        utterance.volume = 0.9;

        const voices = synthRef.current.getVoices();
        const preferred = voices.find(
            (v) =>
                v.lang.startsWith('en') &&
                (v.name.includes('Female') ||
                    v.name.includes('Samantha') ||
                    v.name.includes('Google') ||
                    v.name.includes('Microsoft Zira') ||
                    v.name.includes('Aria'))
        );
        if (preferred) utterance.voice = preferred;

        utterance.onstart = () => {
            setIsSpeaking(true);
        };

        utterance.onend = () => {
            speakingTimeoutRef.current = setTimeout(() => {
                setIsSpeaking(false);
                // Hide bubble after a short delay post-speaking
                bubbleTimeoutRef.current = setTimeout(() => {
                    setBubbleVisible(false);
                }, 3000);
            }, 400);
        };

        utterance.onerror = () => {
            setIsSpeaking(false);
            setBubbleVisible(false);
        };

        synthRef.current.speak(utterance);
    }, [setIsSpeaking, showBubble]);

    /**
     * Start voice recognition → AI → TTS response
     */
    const startListening = useCallback(() => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            showBubble('Speech recognition is not supported in this browser.');
            return;
        }

        if (isListening && recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
            return;
        }

        synthRef.current?.cancel();
        setIsSpeaking(false);
        setMenuOpen(false);

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognitionRef.current = recognition;

        setIsListening(true);
        showBubble('Listening...', 0);

        let finalTranscript = '';

        recognition.onresult = (event) => {
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const t = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += t;
                } else {
                    interim = t;
                }
            }
            showBubble(finalTranscript || interim || 'Listening...', 0);
        };

        recognition.onend = async () => {
            setIsListening(false);
            const userText = finalTranscript.trim();

            if (!userText) {
                showBubble("I didn't catch that. Click me to try again!", 4000);
                return;
            }

            showBubble('Hmm, let me think...', 0);
            setIsSpeaking(true);
            addMessage('user', userText);

            try {
                const history = messages.slice(-10).map((m) => ({
                    role: m.role,
                    content: m.content,
                }));
                const reply = await sendMascotMessage(userText, history);
                addMessage('assistant', reply);
                speak(reply);
            } catch {
                const fallback = "Oops! Something went wrong. Try again!";
                addMessage('assistant', fallback);
                speak(fallback);
            }
        };

        recognition.onerror = (event) => {
            setIsListening(false);
            if (event.error === 'no-speech') {
                showBubble("I didn't hear anything. Try again!", 4000);
            } else if (event.error === 'not-allowed') {
                showBubble('Please allow microphone access!', 4000);
            } else {
                showBubble('Something went wrong. Try again!', 4000);
            }
        };

        recognition.start();
    }, [isListening, messages, addMessage, setIsSpeaking, speak, showBubble]);

    /**
     * Handle radial menu option selection
     */
    const handleMenuAction = useCallback((action) => {
        setMenuOpen(false);
        switch (action) {
            case 'talk':
                startListening();
                break;
            case 'help':
                speak("I'm your Mascoteach buddy! Click Talk to chat with me using your voice, or Quiz Me for a quick quiz!");
                break;
            case 'quiz':
                speak("Let's do a quiz! Head over to the Library, upload a document, and I'll generate questions for you!");
                break;
            case 'tip':
                speak("Here's a tip: You can create live game sessions from your quizzes to make learning super fun for your students!");
                break;
            case 'dismiss':
                speak("See you later!");
                setTimeout(() => closeMascot(), 2000);
                break;
            default:
                break;
        }
    }, [startListening, speak, closeMascot]);

    const handleMascotClick = () => {
        if (isListening || isSpeaking) return; // don't open menu while active
        setMenuOpen((prev) => !prev);
    };

    const mascotImage = isSpeaking ? MASCOT_SPEAKING : MASCOT_IDLE;

    // ── Hardcoded positions for Sims-style fan (left of mascot) ──
    // Each position is [x, y] offset from mascot center, going LEFT and UP
    const RADIAL_POSITIONS = [
        { x: -80, y: -190 },   // Talk — upper, slightly left
        { x: -160, y: -150 },  // Help — upper-left
        { x: -195, y: -80 },   // Quiz Me — mid-left
        { x: -185, y: 0 },     // Give Tip — left
        { x: -140, y: 70 },    // Bye! — lower-left
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
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        aria-label="Summon Mascot"
                    >
                        <img
                            src={MASCOT_IDLE}
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
                                    className="mascot-bubble"
                                    initial={{ opacity: 0, scale: 0.7, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.7, y: 10 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                >
                                    <p>{speechBubble}</p>
                                    <div className="mascot-bubble-tail" />

                                    {isListening && (
                                        <div className="mascot-listening-bars">
                                            <span /><span /><span /><span />
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Sims-style radial menu */}
                        <AnimatePresence>
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
                            className="mascot-character"
                            id="mascot-character"
                            initial={{ y: 300, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 300, opacity: 0 }}
                            transition={{
                                type: 'spring',
                                stiffness: 160,
                                damping: 14,
                            }}
                            onClick={handleMascotClick}
                            role="button"
                            tabIndex={0}
                            aria-label="Interact with mascot"
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
