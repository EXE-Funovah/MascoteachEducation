import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getQuizWithQuestions } from '@/services/quizService';
import './TreasureHuntGame.css';

/**
 * TreasureHuntGame — Pirate-themed adventure quiz game
 *
 * Flow:
 *   GameTemplateSelectionPage passes { quizId, quizTitle, questionCount, questions? } via route state
 *   → Fetches quiz questions from backend if not provided
 *   → Player navigates a treasure map by answering MCQ questions correctly
 *   → Wrong answers trigger a shake animation + try-again
 *   → Reaching the final node shows a treasure celebration
 */

const MASCOT_HEAD = '/images/mascot-head.png';
const TREASURE_MAP = '/images/treasure-map.jpg';
const WOODEN_PLANK = '/images/wooden-plank.png';
const MAX_QUESTIONS = 20;

/* ──────────────────────────────────────
   Generate node positions along a winding path
   across the map (percentage-based for responsiveness)
   Path: Ship → sharp right to mountains → up → left U-turn
         → palm trees → right U-turn → straight to treasure
   ────────────────────────────────────── */
function generateNodePositions(count) {
    if (count <= 1) return [{ x: 50, y: 85 }];

    // 20 waypoints for max 20 questions, tracing the red dashed trail:
    // Pass 1 (bottom): Ship → sharp right to mountains
    // Pass 2 (middle, right→left): U-turn left across to palm trees
    // Pass 3 (top, left→right): U-turn right → straight to treasure
    const waypoints = [
        // Pass 1: Ship → sharp right → mountains
        { x: 30, y: 90 },  //  1. Ship at bottom
        { x: 35, y: 90 },  //  2. Sharp right along the beach
        { x: 50, y: 90 },  //  3. Continue right
        { x: 70, y: 73 },  //  4. Reaching the small mountains
        { x: 78, y: 66 },  //  5. Into the mountain area
        { x: 70, y: 58 },  //  6. Moving up through mountains
        // Pass 2: Left U-turn → across to palm trees
        { x: 67, y: 50 },  //  7. Starting the U-turn left
        { x: 60, y: 46 },  //  8. Heading left
        { x: 52, y: 44 },  //  9. Past the lake area
        { x: 44, y: 46 },  // 10. Center of the map
        { x: 36, y: 50 },  // 11. Approaching palm trees
        { x: 28, y: 54 },  // 12. In the palm tree area
        { x: 22, y: 50 },  // 13. Deep in the palms
        // Pass 3: Right U-turn → straight to treasure
        { x: 22, y: 42 },  // 14. Starting U-turn right
        { x: 28, y: 36 },  // 15. Heading back right
        { x: 36, y: 30 },  // 16. Past the pirate flag
        { x: 45, y: 26 },  // 17. Upper middle area
        { x: 55, y: 24 },  // 18. Heading toward treasure
        { x: 65, y: 22 },  // 19. Almost there
        { x: 76, y: 20 },  // 20. Treasure chest X mark!
    ];

    // Interpolate positions for any question count (up to MAX_QUESTIONS)
    const positions = [];
    for (let i = 0; i < count; i++) {
        const t = i / (count - 1); // 0..1
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

    const mapRef = useRef(null);

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
                // Cap at MAX_QUESTIONS (20)
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

    /* Normalize different question formats */
    function normalizeQuestions(raw) {
        if (!Array.isArray(raw)) return [];
        return raw.map((q, i) => ({
            id: q.id || i,
            text: q.questionText || q.question || `Câu ${i + 1}`,
            options: (q.options || []).map((o) => ({
                text: o.optionText || o.text || '',
                isCorrect: o.isCorrect ?? false,
            })),
        }));
    }

    const nodePositions = generateNodePositions(questions.length);

    /* ── Handle clicking a node ── */
    const handleNodeClick = useCallback((index) => {
        if (index !== currentNode || completed) return;
        setShowQuestion(true);
        setSelectedOption(null);
        setIsCorrect(null);
    }, [currentNode, completed]);

    /* ── Handle answering ── */
    const handleAnswer = useCallback((optIdx) => {
        if (selectedOption !== null) return;

        const question = questions[currentNode];
        const correct = question.options[optIdx]?.isCorrect;
        setSelectedOption(optIdx);
        setIsCorrect(correct);

        if (correct) {
            setScore(s => s + 1000 + streak * 200);
            setStreak(s => s + 1);
            setAnsweredNodes(prev => [...prev, currentNode]);

            setTimeout(() => {
                setShowQuestion(false);
                if (currentNode >= questions.length - 1) {
                    // Game complete!
                    setTimeout(() => setCompleted(true), 600);
                } else {
                    setCurrentNode(n => n + 1);
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
    }, [selectedOption, currentNode, questions, streak]);

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
                    <div className="th-intro-icon">🗺️</div>
                    <h1 className="th-intro-title">Treasure Hunt</h1>
                    <h2 className="th-intro-subtitle">{quizTitle}</h2>
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
                            <span className="th-intro-stat-num">🏴‍☠️</span>
                            <span className="th-intro-stat-label">Phiêu lưu</span>
                        </div>
                    </div>
                    <p className="th-intro-desc">
                        Trả lời đúng các câu hỏi để di chuyển trên bản đồ.
                        Tìm kho báu ẩn giấu ở cuối hành trình!
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
                        ⚓ Bắt đầu phiêu lưu!
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
                    <span className="th-hud-icon">🗺️</span>
                    <span>{quizTitle}</span>
                </div>
                <div className="th-hud-stats">
                    <div className="th-hud-stat">
                        <span className="th-hud-stat-icon">⭐</span>
                        <span className="th-hud-stat-value">{score.toLocaleString()}</span>
                    </div>
                    <div className="th-hud-stat">
                        <span className="th-hud-stat-icon">🔥</span>
                        <span className="th-hud-stat-value">{streak}x</span>
                    </div>
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
                                <span className="th-node-icon">🏴‍☠️</span>
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
                                            : '💥 Sai rồi! Thử lại nào!'}
                                    </motion.div>
                                )}
                            </AnimatePresence>
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
                        {confettiPieces.current.map(p => (
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
                            <div className="th-victory-chest">💰</div>
                            <h1 className="th-victory-title">Tìm thấy kho báu!</h1>
                            <p className="th-victory-subtitle">{quizTitle}</p>

                            <div className="th-victory-stats">
                                <div className="th-victory-stat">
                                    <span className="th-victory-stat-num">{score.toLocaleString()}</span>
                                    <span className="th-victory-stat-label">Điểm số</span>
                                </div>
                                <div className="th-victory-stat">
                                    <span className="th-victory-stat-num">{questions.length}/{questions.length}</span>
                                    <span className="th-victory-stat-label">Câu đúng</span>
                                </div>
                            </div>

                            <div className="th-victory-actions">
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
                                <motion.button
                                    className="th-victory-btn th-victory-btn--secondary"
                                    onClick={() => navigate(-1)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    ← Thoát
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
