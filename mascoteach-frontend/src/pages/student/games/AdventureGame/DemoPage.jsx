import { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import { createAdventureGame } from '@/game/adventureGame';
import GameHUD from './GameHUD';
import QuestionPopup from './QuestionPopup';
import ResultScreen from './ResultScreen';

/**
 * DemoPage — A standalone demo of the Adventure Game using mock data.
 * Route: /play/demo
 * 
 * This allows teachers to test the game immediately without needing
 * a real quiz session or PIN code.
 */

const DEMO_QUESTIONS = [
    {
        id: 1,
        text: 'Thủ đô của Việt Nam là gì?',
        options: ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Huế'],
        correctIndex: 0,
        explanation: 'Hà Nội là thủ đô của Việt Nam từ năm 1010.',
    },
    {
        id: 2,
        text: '2 + 2 bằng bao nhiêu?',
        options: ['3', '4', '5', '6'],
        correctIndex: 1,
        explanation: '2 + 2 = 4, đây là phép tính cơ bản.',
    },
    {
        id: 3,
        text: 'Hành tinh nào lớn nhất trong hệ Mặt Trời?',
        options: ['Trái Đất', 'Sao Hỏa', 'Sao Mộc', 'Sao Thổ'],
        correctIndex: 2,
        explanation: 'Sao Mộc (Jupiter) là hành tinh lớn nhất trong hệ Mặt Trời.',
    },
    {
        id: 4,
        text: 'Nước sôi ở bao nhiêu độ C?',
        options: ['50°C', '75°C', '100°C', '150°C'],
        correctIndex: 2,
        explanation: 'Nước sôi ở 100°C ở áp suất tiêu chuẩn.',
    },
    {
        id: 5,
        text: 'Con vật nào là biểu tượng của Mascoteach?',
        options: ['Mèo', 'Chó', 'Gấu mèo (Tanuki)', 'Thỏ'],
        correctIndex: 2,
        explanation: 'Mascoteach sử dụng gấu mèo Tanuki làm mascot chính! 🦝',
    },
];

export default function DemoPage() {
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const gameRef = useRef(null);

    const [phase, setPhase] = useState('playing');
    const [activeQuestionIdx, setActiveQuestionIdx] = useState(null);
    const [lives, setLives] = useState(3);
    const [score, setScore] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [wrongCount, setWrongCount] = useState(0);
    const [questionsDone, setQuestionsDone] = useState(0);

    const initGame = useCallback(() => {
        if (!containerRef.current) return;

        gameRef.current?.destroy();

        gameRef.current = createAdventureGame(containerRef.current, DEMO_QUESTIONS, {
            onQuestionTrigger(questionIndex) {
                setActiveQuestionIdx(questionIndex);
                setPhase('question');
            },
            onGameComplete() {
                setPhase('result');
            },
        });
    }, []);

    useEffect(() => {
        initGame();
        return () => {
            gameRef.current?.destroy();
            gameRef.current = null;
        };
    }, [initGame]);

    const handleAnswer = useCallback((isCorrect) => {
        if (isCorrect) {
            setScore((s) => s + 100);
            setCorrectCount((c) => c + 1);
        } else {
            setWrongCount((w) => w + 1);
            setLives((l) => {
                const next = Math.max(0, l - 1);
                if (next === 0) {
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
    }, []);

    const handlePlayAgain = useCallback(() => {
        setPhase('playing');
        setLives(3);
        setScore(0);
        setCorrectCount(0);
        setWrongCount(0);
        setQuestionsDone(0);
        setActiveQuestionIdx(null);
        setTimeout(initGame, 80);
    }, [initGame]);

    return (
        <div className="relative w-full h-screen bg-[#0a1230] flex flex-col overflow-hidden">
            {/* Demo badge */}
            <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 bg-amber-500/90 text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                🎮 CHẾ ĐỘ THỬ NGHIỆM
            </div>

            {/* Back button */}
            <button
                onClick={() => navigate(-1)}
                className="absolute top-14 left-3 z-50 text-white/40 hover:text-white/80 text-xs px-2 py-1 rounded transition-colors"
            >
                ← Thoát
            </button>

            {/* HUD */}
            {phase !== 'result' && (
                <GameHUD
                    lives={lives}
                    score={score}
                    questionsDone={questionsDone}
                    questionsTotal={DEMO_QUESTIONS.length}
                />
            )}

            {/* Game container — canvas will be created inside by Kaplay */}
            <div
                ref={containerRef}
                style={{ flex: 1, overflow: 'hidden' }}
            />

            {/* Keyboard hint */}
            {phase === 'playing' && questionsDone === 0 && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 pointer-events-none animate-pulse">
                    <kbd className="text-white/60 text-xs font-mono bg-white/10 rounded px-1.5 py-0.5">Space</kbd>
                    <span className="text-white/45 text-xs">hoặc chạm màn hình để nhảy</span>
                </div>
            )}

            {/* Question popup */}
            <AnimatePresence>
                {phase === 'question' && activeQuestionIdx !== null && (
                    <QuestionPopup
                        key={`question-${activeQuestionIdx}`}
                        question={DEMO_QUESTIONS[activeQuestionIdx]}
                        questionNumber={activeQuestionIdx + 1}
                        total={DEMO_QUESTIONS.length}
                        onAnswer={handleAnswer}
                    />
                )}
            </AnimatePresence>

            {/* Result screen */}
            <AnimatePresence>
                {phase === 'result' && (
                    <ResultScreen
                        score={score}
                        correctCount={correctCount}
                        wrongCount={wrongCount}
                        questionsTotal={DEMO_QUESTIONS.length}
                        onPlayAgain={handlePlayAgain}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
