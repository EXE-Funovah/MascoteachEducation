import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Hourglass, Trophy, Flame, Star, CheckCircle2 } from 'lucide-react';
import { createLiveSessionConnection } from '@/services/liveSessionRealtime';
import './StudentLiveGame.css';

/**
 * StudentLiveGamePage — Student view for host-driven live games
 *
 * Flow:
 *   1. Student enters after joining via PIN and waiting
 *   2. Listens for QuestionRevealed events from teacher via SignalR
 *   3. When question is revealed → shows answer options
 *   4. Student selects an answer → sends AnswerSubmitted via SignalR
 *   5. When teacher moves to next → QuestionClosed event → back to waiting
 */

const OPTION_COLORS = [
    { bg: '#2563eb', hover: '#1d4ed8', label: 'A', gradient: 'linear-gradient(135deg, #2563eb, #1e40af)' },
    { bg: '#dc2626', hover: '#b91c1c', label: 'B', gradient: 'linear-gradient(135deg, #dc2626, #991b1b)' },
    { bg: '#d97706', hover: '#b45309', label: 'C', gradient: 'linear-gradient(135deg, #d97706, #92400e)' },
    { bg: '#059669', hover: '#047857', label: 'D', gradient: 'linear-gradient(135deg, #059669, #065f46)' },
    { bg: '#7c3aed', hover: '#6d28d9', label: 'E', gradient: 'linear-gradient(135deg, #7c3aed, #5b21b6)' },
    { bg: '#0891b2', hover: '#0e7490', label: 'F', gradient: 'linear-gradient(135deg, #0891b2, #155e75)' },
];

export default function StudentLiveGamePage() {
    const location = useLocation();
    const navigate = useNavigate();

    const session = location.state?.session;
    const participant = location.state?.participant;
    const playerName = location.state?.playerName || participant?.studentName || 'Guest';
    const sessionId = session?.id;
    const gamePin = session?.gamePin || session?.pin || session?.pinCode;

    /* ── State ── */
    const [gameState, setGameState] = useState('waiting'); // waiting | answering | answered | ended
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [questionsAnswered, setQuestionsAnswered] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [connected, setConnected] = useState(false);

    const realtimeRef = useRef(null);

    /* ── Connect SignalR ── */
    useEffect(() => {
        if (!gamePin && !sessionId) {
            navigate('/play');
            return undefined;
        }

        const realtime = createLiveSessionConnection({
            gamePin,
            sessionId,
            role: 'student',
            studentName: playerName,
            onEvent: (eventName, payload) => {
                console.log('[StudentLive] Event:', eventName, payload);

                // Backend sends "NewQuestion" when teacher calls SendQuestion
                if (eventName === 'NewQuestion') {
                    try {
                        const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
                        
                        const rawOptions = data.options || data.Options || [];
                        const parsedOptions = rawOptions.map(o => {
                            const isCorrectVal = o.isCorrect ?? o.IsCorrect ?? false;
                            return {
                                text: o.text || o.Text || '',
                                isCorrect: isCorrectVal === 'true' || isCorrectVal === true
                            };
                        });

                        setCurrentQuestion({
                            index: data.questionIndex ?? data.QuestionIndex,
                            text: data.questionText ?? data.QuestionText ?? '',
                            options: parsedOptions,
                            totalQuestions: data.totalQuestions ?? data.TotalQuestions,
                        });
                        setTotalQuestions(data.totalQuestions || 0);
                        setSelectedOption(null);
                        setIsCorrect(null);
                        setGameState('answering');
                    } catch (err) {
                        console.error('[StudentLive] Parse error:', err);
                    }
                }

                if (eventName === 'GameStarted') {
                    console.log('[StudentLive] Game started!');
                }

                if (eventName === 'QuestionClosed') {
                    setGameState('waiting');
                    setCurrentQuestion(null);
                    setSelectedOption(null);
                    setIsCorrect(null);
                }

                if (eventName === 'GameEnded') {
                    setGameState('ended');
                }
            },
            onError: (err) => {
                console.warn('[StudentLive] SignalR error:', err);
            },
        });

        realtimeRef.current = realtime;

        /* Wait for connection to be ready, then re-join group to ensure we're in */
        realtime?.startPromise?.then((connection) => {
            if (connection) {
                setConnected(true);
                console.log('[StudentLive] SignalR connected, re-joining group...');
                /* Re-invoke JoinAsStudent to make sure we're in the group,
                   since the previous connection from WaitingPage was stopped */
                if (gamePin && playerName) {
                    connection.invoke('JoinAsStudent', gamePin, playerName)
                        .then(() => {
                            console.log('[StudentLive] Joined group successfully');
                            /* Ask backend to re-send current question if one is active */
                            connection.invoke('RequestCurrentQuestion', gamePin).catch(() => {
                                /* Backend may not support this method — that's OK */
                                console.log('[StudentLive] RequestCurrentQuestion not supported or no active question');
                            });
                        })
                        .catch((err) => {
                            console.warn('[StudentLive] Re-join failed:', err.message);
                        });
                }
            }
        }).catch((err) => {
            console.warn('[StudentLive] Connection failed:', err);
        });

        /* Retry: if still waiting after 3s, try re-joining */
        const retryTimer = window.setTimeout(() => {
            const conn = realtime?.getConnection?.();
            if (conn?.state === 'Connected' && gamePin && playerName) {
                console.log('[StudentLive] Retry: re-joining group...');
                conn.invoke('JoinAsStudent', gamePin, playerName).catch(() => {});
                conn.invoke('RequestCurrentQuestion', gamePin).catch(() => {});
            }
        }, 3000);

        return () => {
            window.clearTimeout(retryTimer);
            realtime?.stop();
        };
    }, [gamePin, sessionId, playerName, navigate]);

    /* ── Handle answer selection ── */
    const handleAnswer = useCallback((optIdx) => {
        if (selectedOption !== null || gameState !== 'answering' || !currentQuestion) return;

        const option = currentQuestion.options[optIdx];
        const correct = option?.isCorrect ?? false;

        setSelectedOption(optIdx);
        setIsCorrect(correct);
        setQuestionsAnswered((q) => q + 1);
        setGameState('answered');

        if (correct) {
            setCorrectAnswers((c) => c + 1);
            setScore((s) => s + 1000 + streak * 200);
            setStreak((s) => s + 1);
        } else {
            setStreak(0);
        }

        /* Send answer to teacher via SignalR */
        // Backend: SubmitAnswer(gamePin, studentName, questionId, optionId)
        if (realtimeRef.current && gamePin) {
            realtimeRef.current.invoke(
                'SubmitAnswer',
                gamePin,
                playerName,
                currentQuestion.index,   // questionId
                optIdx                   // optionId
            ).catch((err) => {
                console.warn('[StudentLive] Failed to submit answer:', err);
            });
        }
    }, [selectedOption, gameState, currentQuestion, streak, gamePin, playerName]);

    /* ── Waiting Screen ── */
    if (gameState === 'waiting' && !currentQuestion) {
        return (
            <div className="slg-screen slg-waiting">
                <div className="slg-waiting-glow slg-waiting-glow--1" />
                <div className="slg-waiting-glow slg-waiting-glow--2" />

                <motion.div
                    className="slg-waiting-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <motion.div
                        className="slg-waiting-icon"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <Hourglass className="w-10 h-10" />
                    </motion.div>

                    <h1 className="slg-waiting-title">Chờ giáo viên...</h1>
                    <p className="slg-waiting-sub">
                        Giáo viên đang điều khiển game. Câu hỏi sẽ hiện lên khi giáo viên chọn câu tiếp theo.
                    </p>

                    <div className="slg-waiting-info">
                        <div className="slg-waiting-info-item">
                            <span className="slg-waiting-info-label">Tên</span>
                            <span className="slg-waiting-info-value">{playerName}</span>
                        </div>
                        {questionsAnswered > 0 && (
                            <>
                                <div className="slg-waiting-info-divider" />
                                <div className="slg-waiting-info-item">
                                    <span className="slg-waiting-info-label">Điểm</span>
                                    <span className="slg-waiting-info-value">{score.toLocaleString()}</span>
                                </div>
                                <div className="slg-waiting-info-divider" />
                                <div className="slg-waiting-info-item">
                                    <span className="slg-waiting-info-label">Đúng</span>
                                    <span className="slg-waiting-info-value">{correctAnswers}/{questionsAnswered}</span>
                                </div>
                            </>
                        )}
                    </div>

                    <motion.div
                        className="slg-waiting-pulse"
                        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        <div className="slg-waiting-pulse-dot" style={connected ? { background: '#22c55e' } : {}} />
                        <span>{connected ? 'Đã kết nối — chờ câu hỏi' : 'Đang kết nối...'}</span>
                    </motion.div>
                </motion.div>
            </div>
        );
    }

    /* ── Game Ended Screen ── */
    if (gameState === 'ended') {
        return (
            <div className="slg-screen slg-ended">
                <motion.div
                    className="slg-ended-card"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                >
                    <div className="slg-ended-trophy">
                        <Trophy className="w-16 h-16 text-amber-300" />
                    </div>
                    <h1 className="slg-ended-title">Game đã kết thúc!</h1>
                    <p className="slg-ended-sub">{session?.title || 'Mascoteach Live Game'}</p>

                    <div className="slg-ended-stats">
                        <div className="slg-ended-stat">
                            <span className="slg-ended-stat-num">{score.toLocaleString()}</span>
                            <span className="slg-ended-stat-label">Điểm</span>
                        </div>
                        <div className="slg-ended-stat">
                            <span className="slg-ended-stat-num">{correctAnswers}/{questionsAnswered}</span>
                            <span className="slg-ended-stat-label">Đúng</span>
                        </div>
                    </div>

                    <motion.button
                        className="slg-ended-btn"
                        onClick={() => navigate('/play')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        ← Về trang chủ
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    /* ── Question / Answer Screen ── */
    return (
        <div className="slg-screen slg-game">
            {/* Top bar */}
            <header className="slg-header">
                <div className="slg-header-left">
                    <Star className="w-4 h-4 text-amber-400" />
                    <span className="slg-header-score">{score.toLocaleString()}</span>
                </div>

                <div className="slg-header-center">
                    {currentQuestion && (
                        <span className="slg-header-qnum">
                            Câu {(currentQuestion.index || 0) + 1}
                            {totalQuestions > 0 ? ` / ${totalQuestions}` : ''}
                        </span>
                    )}
                </div>

                <div className="slg-header-right">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span className="slg-header-streak">{streak}x</span>
                </div>
            </header>

            {/* Question text */}
            <div className="slg-question-area">
                <motion.h1
                    className="slg-question-text"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={currentQuestion?.index}
                >
                    {currentQuestion?.text || 'Đang tải câu hỏi...'}
                </motion.h1>
            </div>

            {/* Answer options */}
            <div className="slg-options">
                {(currentQuestion?.options || []).map((opt, optIdx) => {
                    const color = OPTION_COLORS[optIdx % OPTION_COLORS.length];
                    const isSelected = selectedOption === optIdx;
                    const showResult = selectedOption !== null;
                    const optionCorrect = opt.isCorrect;

                    let optionClass = 'slg-option';
                    if (showResult) {
                        if (isSelected) {
                            optionClass += isCorrect ? ' slg-option--correct' : ' slg-option--wrong';
                        } else if (optionCorrect) {
                            optionClass += ' slg-option--reveal-correct';
                        } else {
                            optionClass += ' slg-option--dimmed';
                        }
                    }

                    return (
                        <motion.button
                            key={optIdx}
                            className={optionClass}
                            style={{ '--opt-gradient': color.gradient, '--opt-bg': color.bg }}
                            onClick={() => handleAnswer(optIdx)}
                            disabled={selectedOption !== null}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: optIdx * 0.08 }}
                            whileHover={selectedOption === null ? { scale: 1.02, y: -2 } : {}}
                            whileTap={selectedOption === null ? { scale: 0.97 } : {}}
                        >
                            <div className="slg-option-label" style={{ background: color.bg }}>
                                {color.label}
                            </div>
                            <span className="slg-option-text">{opt.text}</span>
                            {showResult && isSelected && (
                                <span className="slg-option-feedback">
                                    {isCorrect ? <CheckCircle2 className="w-6 h-6" /> : '✗'}
                                </span>
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Feedback bar */}
            <AnimatePresence>
                {selectedOption !== null && (
                    <motion.div
                        className={`slg-feedback ${isCorrect ? 'slg-feedback--correct' : 'slg-feedback--wrong'}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                    >
                        <span className="slg-feedback-icon">{isCorrect ? '🎉' : '💀'}</span>
                        <span className="slg-feedback-text">
                            {isCorrect ? 'Chính xác!' : 'Sai rồi!'}
                        </span>
                        {isCorrect && (
                            <span className="slg-feedback-score">+{1000 + (streak - 1) * 200}</span>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
