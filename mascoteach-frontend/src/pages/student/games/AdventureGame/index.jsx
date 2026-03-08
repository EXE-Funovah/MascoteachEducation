import { useEffect, useRef, useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import { createAdventureGame } from '@/game/adventureGame';
import GameHUD from './GameHUD';
import QuestionPopup from './QuestionPopup';
import ResultScreen from './ResultScreen';

/**
 * AdventureGamePage — Main React wrapper for the Kaplay adventure game.
 *
 * Route: /play/adventure
 * Expects route state: { session: object, questions: NormalizedQuestion[] }
 *
 * Architecture:
 *   ┌──────────────────────────────────────────┐
 *   │  GameHUD (React overlay — top)           │
 *   │──────────────────────────────────────────│
 *   │  <canvas> — Kaplay renders here          │
 *   │──────────────────────────────────────────│
 *   │  QuestionPopup (React overlay — bottom)  │  ← visible when phase='question'
 *   │  ResultScreen  (React overlay — center)  │  ← visible when phase='result'
 *   └──────────────────────────────────────────┘
 *
 * Communication flow:
 *   Kaplay emits → onQuestionTrigger(idx) → React shows QuestionPopup
 *   Student answers → onAnswer(isCorrect) → update state → game.resumeAfterAnswer()
 *   Kaplay emits → onGameComplete() → React shows ResultScreen
 */
export default function AdventureGamePage() {
    const location = useLocation();
    const navigate = useNavigate();

    const canvasRef = useRef(null);
    const gameRef = useRef(null);   // Kaplay game API handle

    // Pull data passed from GameLobby
    const questions = location.state?.questions ?? [];
    const session = location.state?.session ?? null;

    // ── Game UI state ─────────────────────────────────────────────────────────
    const [phase, setPhase] = useState('playing');        // 'playing' | 'question' | 'result'
    const [activeQuestionIdx, setActiveQuestionIdx] = useState(null);
    const [lives, setLives] = useState(3);
    const [score, setScore] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [wrongCount, setWrongCount] = useState(0);
    const [questionsDone, setQuestionsDone] = useState(0);

    // Guard: redirect if no questions (direct URL access)
    useEffect(() => {
        if (!questions.length) {
            navigate('/play', { replace: true });
        }
    }, [questions, navigate]);

    // ── Initialize Kaplay game ────────────────────────────────────────────────
    const initGame = useCallback(() => {
        if (!canvasRef.current || !questions.length) return;

        // Destroy previous instance if replaying
        gameRef.current?.destroy();

        gameRef.current = createAdventureGame(canvasRef.current, questions, {
            onQuestionTrigger(questionIndex) {
                setActiveQuestionIdx(questionIndex);
                setPhase('question');
            },
            onGameComplete() {
                setPhase('result');
            },
        });
    }, [questions]);

    useEffect(() => {
        initGame();
        return () => {
            gameRef.current?.destroy();
            gameRef.current = null;
        };
    }, [initGame]);

    // ── Handle student answer ─────────────────────────────────────────────────
    const handleAnswer = useCallback(
        (isCorrect) => {
            if (isCorrect) {
                setScore((s) => s + 100);
                setCorrectCount((c) => c + 1);
            } else {
                setWrongCount((w) => w + 1);
                setLives((l) => {
                    const next = Math.max(0, l - 1);
                    if (next === 0) {
                        // No lives left → force end
                        gameRef.current?.destroy();
                        gameRef.current = null;
                        setPhase('result');
                    }
                    return next;
                });
            }
            setQuestionsDone((d) => d + 1);
            setPhase('playing');
            gameRef.current?.resumeAfterAnswer(isCorrect);
        },
        [],
    );

    // ── Play again: reset all state and reinitialise game ────────────────────
    const handlePlayAgain = useCallback(() => {
        setPhase('playing');
        setLives(3);
        setScore(0);
        setCorrectCount(0);
        setWrongCount(0);
        setQuestionsDone(0);
        setActiveQuestionIdx(null);
        // Small timeout so React flushes state before we re-init the canvas
        setTimeout(initGame, 80);
    }, [initGame]);

    return (
        <div className="relative w-full h-screen bg-[#0a1230] flex flex-col overflow-hidden">

            {/* ── HUD overlay (top bar) ── */}
            {phase !== 'result' && (
                <GameHUD
                    lives={lives}
                    score={score}
                    questionsDone={questionsDone}
                    questionsTotal={questions.length}
                />
            )}

            {/* ── Kaplay canvas ── */}
            <canvas
                ref={canvasRef}
                className="flex-1 w-full h-full"
                style={{ display: 'block', touchAction: 'none' }}
            />

            {/* ── Keyboard hint (fades out after 4s) ── */}
            {phase === 'playing' && questionsDone === 0 && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 pointer-events-none animate-pulse">
                    <kbd className="text-white/60 text-xs font-mono bg-white/10 rounded px-1.5 py-0.5">Space</kbd>
                    <span className="text-white/45 text-xs">hoặc chạm màn hình để nhảy</span>
                </div>
            )}

            {/* ── Question popup (bottom sheet) ── */}
            <AnimatePresence>
                {phase === 'question' && activeQuestionIdx !== null && (
                    <QuestionPopup
                        key={`question-${activeQuestionIdx}`}
                        question={questions[activeQuestionIdx]}
                        questionNumber={activeQuestionIdx + 1}
                        total={questions.length}
                        onAnswer={handleAnswer}
                    />
                )}
            </AnimatePresence>

            {/* ── Result screen ── */}
            <AnimatePresence>
                {phase === 'result' && (
                    <ResultScreen
                        score={score}
                        correctCount={correctCount}
                        wrongCount={wrongCount}
                        questionsTotal={questions.length}
                        onPlayAgain={handlePlayAgain}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
