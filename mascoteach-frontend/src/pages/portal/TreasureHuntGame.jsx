import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getQuizWithQuestions } from '@/services/quizService';
import { createLiveSessionConnection } from '@/services/liveSessionRealtime';
import './TreasureHuntGame.css';

/**
 * TreasureHuntGame — Pirate-themed adventure quiz game
 *
 * Supports two modes:
 *   1. HOST MODE (teacher): Shows map + question text only. No answer options.
 *      Teacher clicks a node → broadcasts QuestionRevealed to students via SignalR.
 *   2. SOLO MODE (legacy): Player answers questions themselves (original behavior).
 */

const MASCOT_HEAD = '/images/mascot-head.png';
const TREASURE_MAP = '/images/treasure-map.jpg';
const WOODEN_PLANK = '/images/wooden-plank.png';
const MAX_QUESTIONS = 20;

/* ─────────────────────────────────────────────
   Generate node positions along a winding path
   ───────────────────────────────────────────── */
function generateNodePositions(count) {
    if (count <= 1) return [{ x: 50, y: 85 }];

    const waypoints = [
        { x: 30, y: 90 }, { x: 42, y: 85 }, { x: 55, y: 85 },
        { x: 68, y: 82 }, { x: 75, y: 69 }, { x: 72, y: 58 },
        { x: 65, y: 54 }, { x: 59, y: 56 }, { x: 52, y: 61 },
        { x: 44, y: 65 }, { x: 36, y: 67 }, { x: 27, y: 64 },
        { x: 23, y: 55 }, { x: 23, y: 42 }, { x: 28, y: 32 },
        { x: 36, y: 26 }, { x: 45, y: 26 }, { x: 55, y: 28 },
        { x: 65, y: 32 }, { x: 77, y: 33 },
    ];

    const positions = [];
    for (let i = 0; i < count; i++) {
        const t = i / (count - 1);
        const segIndex = t * (waypoints.length - 1);
        const lo = Math.floor(segIndex);
        const hi = Math.min(lo + 1, waypoints.length - 1);
        const frac = segIndex - lo;
        positions.push({
            x: waypoints[lo].x + (waypoints[hi].x - waypoints[lo].x) * frac,
            y: waypoints[lo].y + (waypoints[hi].y - waypoints[lo].y) * frac,
        });
    }
    return positions;
}

/* ── Option label colors ── */
const OPTION_COLORS = [
    { bg: '#2563eb', hover: '#1d4ed8', label: 'A' },
    { bg: '#dc2626', hover: '#b91c1c', label: 'B' },
    { bg: '#d97706', hover: '#b45309', label: 'C' },
    { bg: '#059669', hover: '#047857', label: 'D' },
    { bg: '#7c3aed', hover: '#6d28d9', label: 'E' },
    { bg: '#0891b2', hover: '#0e7490', label: 'F' },
];

export default function TreasureHuntGame() {
    const location = useLocation();
    const navigate = useNavigate();

    const quizId = location.state?.quizId;
    const quizTitle = location.state?.quizTitle || 'Treasure Hunt';
    const passedQuestions = location.state?.questions;
    const hostMode = location.state?.hostMode || false;
    const sessionId = location.state?.sessionId;
    const gamePin = location.state?.gamePin;

    /* ── State ── */
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentNode, setCurrentNode] = useState(0);
    const [showQuestion, setShowQuestion] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);
    const [shaking, setShaking] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [answeredNodes, setAnsweredNodes] = useState([]);
    const [showIntro, setShowIntro] = useState(true);

    /* ── Host mode: student answer stats ── */
    const [answerStats, setAnswerStats] = useState({ total: 0, correct: 0 });

    const mapRef = useRef(null);
    const realtimeRef = useRef(null);

    /* ── Fetch questions ── */
    useEffect(() => {
        if (!quizId && !passedQuestions) {
            setError('Không tìm thấy quiz. Vui lòng quay lại.');
            setLoading(false);
            return;
        }

        async function loadQuestions() {
            try {
                setLoading(true);
                let normalized;
                if (passedQuestions && passedQuestions.length > 0) {
                    normalized = normalizeQuestions(passedQuestions);
                } else {
                    const { questions: raw } = await getQuizWithQuestions(quizId);
                    normalized = normalizeQuestions(raw);
                }
                setQuestions(normalized.slice(0, MAX_QUESTIONS));
            } catch (err) {
                console.error('[TreasureHunt] Load error:', err);
                setError('Không thể tải câu hỏi. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        }
        loadQuestions();
    }, [quizId, passedQuestions]);

    /* ── Connect SignalR in host mode ── */
    useEffect(() => {
        if (!hostMode || !gamePin) return undefined;

        const realtime = createLiveSessionConnection({
            gamePin,
            sessionId,
            role: 'host',
            onEvent: (eventName, payload) => {
                if (eventName === 'AnswerSubmitted') {
                    setAnswerStats((prev) => ({
                        total: prev.total + 1,
                        correct: prev.correct + (payload?.isCorrect ? 1 : 0),
                    }));
                }
            },
            onError: (err) => {
                console.warn('[TreasureHunt Host] SignalR error:', err);
            },
        });

        realtimeRef.current = realtime;

        return () => {
            realtime?.stop();
        };
    }, [hostMode, gamePin, sessionId]);

    /* Normalize different question formats */
    function normalizeQuestions(raw) {
        if (!Array.isArray(raw)) return [];
        return raw.map((q, i) => ({
            id: q.id || q.Id || i,
            text: q.questionText || q.question || q.QuestionText || `Câu ${i + 1}`,
            options: (q.options || q.questionOptions || q.Options || q.QuestionOptions || []).map((o) => {
                const isCorrectVal = o.isCorrect ?? o.IsCorrect ?? false;
                return {
                    text: o.optionText || o.text || o.OptionText || o.Text || '',
                    isCorrect: isCorrectVal === 'true' || isCorrectVal === true,
                };
            }),
        }));
    }

    const nodePositions = generateNodePositions(questions.length);

    /* ── Handle clicking a node ── */
    const handleNodeClick = useCallback((index) => {
        if (index !== currentNode || completed) return;
        setShowQuestion(true);
        setSelectedOption(null);
        setIsCorrect(null);
        setAnswerStats({ total: 0, correct: 0 });

        /* HOST MODE: Broadcast question to students via SignalR */
        if (hostMode && realtimeRef.current && questions[index]) {
            const q = questions[index];
            // Backend: SendQuestion(gamePin, questionData) → sends "NewQuestion" to group
            realtimeRef.current.invoke('SendQuestion', gamePin, {
                questionIndex: index,
                questionText: q.text,
                options: q.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
                totalQuestions: questions.length,
            }).catch((err) => {
                console.warn('[TreasureHunt Host] Failed to broadcast question:', err);
            });
        }
    }, [currentNode, completed, hostMode, gamePin, questions]);

    /* ── Host mode: move to next question ── */
    const handleHostNext = useCallback(() => {
        setShowQuestion(false);
        setAnsweredNodes((prev) => [...prev, currentNode]);

        if (hostMode && realtimeRef.current && gamePin) {
            // Backend: CloseQuestion(gamePin) → sends "QuestionClosed" to group
            realtimeRef.current.invoke('CloseQuestion', gamePin).catch(() => { });
        }

        if (currentNode >= questions.length - 1) {
            // Game complete — notify students
            if (hostMode && realtimeRef.current && gamePin) {
                realtimeRef.current.invoke('EndGame', gamePin).catch(() => { });
            }
            setTimeout(() => setCompleted(true), 600);
        } else {
            setCurrentNode((n) => n + 1);
        }
    }, [currentNode, questions.length, hostMode, gamePin]);

    /* ── Handle answering (solo mode only) ── */
    const handleAnswer = useCallback((optIdx) => {
        if (selectedOption !== null || hostMode) return;

        const question = questions[currentNode];
        const correct = question.options[optIdx]?.isCorrect;
        setSelectedOption(optIdx);
        setIsCorrect(correct);

        if (correct) {
            setScore((s) => s + 1000 + streak * 200);
            setStreak((s) => s + 1);
            setAnsweredNodes((prev) => [...prev, currentNode]);

            setTimeout(() => {
                setShowQuestion(false);
                if (currentNode >= questions.length - 1) {
                    setTimeout(() => setCompleted(true), 600);
                } else {
                    setCurrentNode((n) => n + 1);
                }
            }, 1200);
        } else {
            setStreak(0);
            setShaking(true);
            setTimeout(() => {
                setShaking(false);
                setSelectedOption(null);
                setIsCorrect(null);
            }, 800);
        }
    }, [selectedOption, currentNode, questions, streak, hostMode]);

    /* ── Celebration confetti effect ── */
    const confettiPieces = useRef(
        Array.from({ length: 60 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            delay: Math.random() * 2,
            duration: 2 + Math.random() * 2,
            color: ['#FFD700', '#FF6B35', '#E91E63', '#4CAF50', '#2196F3', '#9C27B0'][i % 6],
            size: 6 + Math.random() * 8,
        }))
    );

    /* ── Loading ── */
    if (loading) {
        return (
            <div className="th-loading-screen">
                <div className="th-loading-spinner" />
                <p className="th-loading-text">Đang chuẩn bị bản đồ kho báu...</p>
                <p className="th-loading-sub">Vui lòng đợi trong giây lát</p>
            </div>
        );
    }

    /* ── Error ── */
    if (error || questions.length === 0) {
        return (
            <div className="th-loading-screen">
                <p className="th-loading-text" style={{ color: '#e74c3c' }}>
                    {error || 'Không có câu hỏi nào.'}
                </p>
                <button className="th-btn-back" onClick={() => navigate(-1)}>
                    ← Quay lại
                </button>
            </div>
        );
    }

    /* ── Intro Screen ── */
    if (showIntro) {
        return (
            <div className="th-intro-screen">
                <div className="th-intro-card">
                    <div className="th-intro-icon">🏴‍☠️</div>
                    <h1 className="th-intro-title">Treasure Hunt</h1>
                    <h2 className="th-intro-subtitle">{quizTitle}</h2>

                    {hostMode && (
                        <div style={{
                            background: 'rgba(255,215,0,0.15)',
                            border: '1px solid rgba(255,215,0,0.3)',
                            borderRadius: 12,
                            padding: '10px 16px',
                            marginBottom: 20,
                            fontSize: 13,
                            color: '#ffd700',
                            fontFamily: 'Montserrat, sans-serif',
                            fontWeight: 600,
                        }}>
                            🎓 Chế độ Host — Bạn đang điều khiển game cho học sinh
                        </div>
                    )}

                    <div className="th-intro-stats">
                        <div className="th-intro-stat">
                            <span className="th-intro-stat-num">{questions.length}</span>
                            <span className="th-intro-stat-label">Câu hỏi</span>
                        </div>
                        <div className="th-intro-stat-divider" />
                        <div className="th-intro-stat">
                            <span className="th-intro-stat-num">{questions.length}</span>
                            <span className="th-intro-stat-label">Trạm dừng</span>
                        </div>
                        <div className="th-intro-stat-divider" />
                        <div className="th-intro-stat">
                            <span className="th-intro-stat-num">🗺️</span>
                            <span className="th-intro-stat-label">Phiêu lưu</span>
                        </div>
                    </div>
                    <p className="th-intro-desc">
                        {hostMode
                            ? 'Ấn vào từng trạm trên bản đồ để hiện câu hỏi cho học sinh trả lời.'
                            : 'Trả lời đúng các câu hỏi để di chuyển trên bản đồ. Tìm kho báu ẩn giấu ở cuối hành trình!'}
                    </p>
                    <p className="th-intro-limit">
                        Tối đa {MAX_QUESTIONS} câu hỏi mỗi lượt chơi
                    </p>
                    <motion.button
                        className="th-intro-start-btn"
                        onClick={() => setShowIntro(false)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {hostMode ? '🎮 Bắt đầu điều khiển!' : '⚓ Bắt đầu phiêu lưu!'}
                    </motion.button>
                </div>
            </div>
        );
    }

    return (
        <div className="th-game-container">
            {/* ── Top HUD ── */}
            <header className="th-hud">
                <button className="th-hud-back" onClick={() => navigate(-1)}>
                    ← Quay lại
                </button>
                <div className="th-hud-title">
                    <span className="th-hud-icon">🏴‍☠️</span>
                    <span>{quizTitle}</span>
                    {hostMode && (
                        <span style={{
                            fontSize: 11,
                            background: 'rgba(255,215,0,0.2)',
                            color: '#ffd700',
                            padding: '2px 10px',
                            borderRadius: 8,
                            fontFamily: 'Montserrat, sans-serif',
                            fontWeight: 700,
                            marginLeft: 8,
                        }}>
                            HOST
                        </span>
                    )}
                </div>
                <div className="th-hud-stats">
                    {!hostMode && (
                        <>
                            <div className="th-hud-stat">
                                <span className="th-hud-stat-icon">⭐</span>
                                <span className="th-hud-stat-value">{score.toLocaleString()}</span>
                            </div>
                            <div className="th-hud-stat">
                                <span className="th-hud-stat-icon">🔥</span>
                                <span className="th-hud-stat-value">{streak}x</span>
                            </div>
                        </>
                    )}
                    <div className="th-hud-stat">
                        <span className="th-hud-stat-icon">📍</span>
                        <span className="th-hud-stat-value">{currentNode + 1}/{questions.length}</span>
                    </div>
                </div>
            </header>

            {/* ── Map Area ── */}
            <div className="th-map-wrapper" ref={mapRef}>
                <img
                    src={TREASURE_MAP}
                    alt="Treasure Map"
                    className="th-map-image"
                    draggable={false}
                />

                {/* Path lines between nodes */}
                <svg className="th-path-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {nodePositions.map((pos, i) => {
                        if (i === 0) return null;
                        const prev = nodePositions[i - 1];
                        const isTraversed = answeredNodes.includes(i - 1);
                        return (
                            <line
                                key={`line-${i}`}
                                x1={prev.x}
                                y1={prev.y}
                                x2={pos.x}
                                y2={pos.y}
                                className={`th-path-line ${isTraversed ? 'th-path-line--done' : ''}`}
                            />
                        );
                    })}
                </svg>

                {/* Nodes */}
                {nodePositions.map((pos, i) => {
                    const isCompleted = answeredNodes.includes(i);
                    const isCurrent = i === currentNode && !completed;
                    const isLocked = i > currentNode;
                    const isFinal = i === questions.length - 1;

                    return (
                        <motion.div
                            key={`node-${i}`}
                            className={`th-node 
                                ${isCompleted ? 'th-node--done' : ''}
                                ${isCurrent ? 'th-node--current' : ''}
                                ${isLocked ? 'th-node--locked' : ''}
                                ${isFinal ? 'th-node--treasure' : ''}
                            `}
                            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                            onClick={() => handleNodeClick(i)}
                            animate={isCurrent ? { scale: [1, 1.15, 1] } : {}}
                            transition={isCurrent ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : {}}
                        >
                            {isCompleted ? (
                                <span className="th-node-icon">✅</span>
                            ) : isFinal ? (
                                <span className="th-node-icon">💎🗝️</span>
                            ) : isCurrent ? (
                                <img src={MASCOT_HEAD} alt="Player" className="th-node-mascot" />
                            ) : (
                                <span className="th-node-number">{i + 1}</span>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* ── Question Modal ── */}
            <AnimatePresence>
                {showQuestion && questions[currentNode] && (
                    <motion.div
                        className="th-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className={`th-modal ${shaking ? 'th-modal--shake' : ''}`}
                            initial={{ scale: 0.8, y: 40 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 40 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        >
                            {/* Wooden plank question board */}
                            <div className="th-plank-board">
                                <img src={WOODEN_PLANK} alt="" className="th-plank-bg" draggable={false} />
                                <div className="th-plank-content">
                                    <span className="th-modal-qnum">⚓ Câu {currentNode + 1}/{questions.length}</span>
                                    <h2 className="th-modal-question">
                                        {questions[currentNode].text}
                                    </h2>
                                </div>
                            </div>

                            {hostMode ? (
                                /* ══════════════════════════════════════════
                                   HOST MODE: Show question text only + stats
                                   No answer options for teacher
                                   ══════════════════════════════════════════ */
                                <div style={{ textAlign: 'center' }}>
                                    {/* Student answer stats */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        gap: 24,
                                        marginBottom: 20,
                                        padding: '14px 20px',
                                        background: 'rgba(26,26,46,0.8)',
                                        borderRadius: 16,
                                        border: '1px solid rgba(255,215,0,0.15)',
                                    }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: 28, fontWeight: 800, color: '#ffd700', fontFamily: "'Pirata One', serif" }}>
                                                {answerStats.total}
                                            </div>
                                            <div style={{ fontSize: 11, color: 'rgba(245,230,200,0.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                                                Đã trả lời
                                            </div>
                                        </div>
                                        <div style={{ width: 1, background: 'rgba(255,215,0,0.2)' }} />
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: 28, fontWeight: 800, color: '#27ae60', fontFamily: "'Pirata One', serif" }}>
                                                {answerStats.correct}
                                            </div>
                                            <div style={{ fontSize: 11, color: 'rgba(245,230,200,0.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                                                Trả lời đúng
                                            </div>
                                        </div>
                                    </div>

                                    <p style={{
                                        fontSize: 13,
                                        color: 'rgba(245,230,200,0.5)',
                                        fontFamily: 'Montserrat, sans-serif',
                                        marginBottom: 16,
                                    }}>
                                        Học sinh đang trả lời câu hỏi này trên thiết bị của họ...
                                    </p>

                                    <motion.button
                                        onClick={handleHostNext}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            padding: '14px 32px',
                                            border: 'none',
                                            borderRadius: 14,
                                            background: 'linear-gradient(135deg, #b8860b, #ffd700)',
                                            color: '#1a1a2e',
                                            fontFamily: "'Pirata One', serif",
                                            fontSize: 18,
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 24px rgba(255,215,0,0.3)',
                                        }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {currentNode >= questions.length - 1 ? '🏆 Kết thúc game' : '➡️ Câu tiếp theo'}
                                    </motion.button>
                                </div>
                            ) : (
                                /* ══════════════════════════════════════════
                                   SOLO MODE: Show answer options (original)
                                   ══════════════════════════════════════════ */
                                <>
                                    {/* Combo indicator */}
                                    <div className="th-modal-header">
                                        <span className="th-modal-streak">🔥 {streak}x combo</span>
                                    </div>

                                    {/* Answer options on wooden planks */}
                                    <div className="th-modal-options">
                                        {questions[currentNode].options.map((opt, optIdx) => {
                                            const color = OPTION_COLORS[optIdx % OPTION_COLORS.length];
                                            let optClass = 'th-option';
                                            if (selectedOption !== null) {
                                                if (optIdx === selectedOption) {
                                                    optClass += isCorrect ? ' th-option--correct' : ' th-option--wrong';
                                                }
                                            }

                                            return (
                                                <motion.button
                                                    key={optIdx}
                                                    className={optClass}
                                                    style={{
                                                        '--opt-bg': color.bg,
                                                        '--opt-hover': color.hover,
                                                    }}
                                                    onClick={() => handleAnswer(optIdx)}
                                                    disabled={selectedOption !== null && isCorrect}
                                                    whileHover={selectedOption === null ? { scale: 1.03, y: -2 } : {}}
                                                    whileTap={selectedOption === null ? { scale: 0.97 } : {}}
                                                >
                                                    <img src={WOODEN_PLANK} alt="" className="th-option-plank-bg" draggable={false} />
                                                    <div className="th-option-inner">
                                                        <span className="th-option-label">{color.label}</span>
                                                        <span className="th-option-text">{opt.text}</span>
                                                        {selectedOption === optIdx && isCorrect && (
                                                            <span className="th-option-feedback">✓</span>
                                                        )}
                                                        {selectedOption === optIdx && isCorrect === false && (
                                                            <span className="th-option-feedback">✗</span>
                                                        )}
                                                    </div>
                                                </motion.button>
                                            );
                                        })}
                                    </div>

                                    {/* Feedback message */}
                                    <AnimatePresence>
                                        {selectedOption !== null && (
                                            <motion.div
                                                className={`th-feedback ${isCorrect ? 'th-feedback--correct' : 'th-feedback--wrong'}`}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                            >
                                                {isCorrect
                                                    ? '🎉 Chính xác! Tiến lên phía trước!'
                                                    : '💀 Sai rồi! Thử lại nào!'}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Victory Screen ── */}
            <AnimatePresence>
                {completed && (
                    <motion.div
                        className="th-victory-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Confetti */}
                        {confettiPieces.current.map((p) => (
                            <motion.div
                                key={p.id}
                                className="th-confetti"
                                style={{
                                    left: `${p.x}%`,
                                    width: p.size,
                                    height: p.size,
                                    backgroundColor: p.color,
                                    borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                                }}
                                initial={{ y: -20, opacity: 1, rotate: 0 }}
                                animate={{
                                    y: '100vh',
                                    opacity: [1, 1, 0],
                                    rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
                                }}
                                transition={{
                                    duration: p.duration,
                                    delay: p.delay,
                                    repeat: Infinity,
                                    ease: 'linear',
                                }}
                            />
                        ))}

                        <motion.div
                            className="th-victory-card"
                            initial={{ scale: 0.5, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.3 }}
                        >
                            <div className="th-victory-chest">🎁</div>
                            <h1 className="th-victory-title">
                                {hostMode ? 'Game đã kết thúc!' : 'Tìm thấy kho báu!'}
                            </h1>
                            <p className="th-victory-subtitle">{quizTitle}</p>

                            <div className="th-victory-stats">
                                {hostMode ? (
                                    <div className="th-victory-stat">
                                        <span className="th-victory-stat-num">{questions.length}</span>
                                        <span className="th-victory-stat-label">Câu hỏi</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="th-victory-stat">
                                            <span className="th-victory-stat-num">{score.toLocaleString()}</span>
                                            <span className="th-victory-stat-label">Điểm số</span>
                                        </div>
                                        <div className="th-victory-stat">
                                            <span className="th-victory-stat-num">{questions.length}/{questions.length}</span>
                                            <span className="th-victory-stat-label">Câu đúng</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="th-victory-actions">
                                {!hostMode && (
                                    <motion.button
                                        className="th-victory-btn th-victory-btn--primary"
                                        onClick={() => {
                                            setCurrentNode(0);
                                            setScore(0);
                                            setStreak(0);
                                            setAnsweredNodes([]);
                                            setCompleted(false);
                                            setShowQuestion(false);
                                        }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        🔄 Chơi lại
                                    </motion.button>
                                )}
                                <motion.button
                                    className="th-victory-btn th-victory-btn--secondary"
                                    onClick={() => navigate(hostMode ? '/teacher/sessions' : -1)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {hostMode ? '📋 Về danh sách' : '← Thoát'}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
