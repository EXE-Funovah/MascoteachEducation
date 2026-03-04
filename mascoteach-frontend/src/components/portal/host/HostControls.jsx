import { Pause, SkipForward, StopCircle, Play } from 'lucide-react';
import { useState } from 'react';

/**
 * HostControls — Bottom control bar for the host game screen
 * Pause, Skip, End game with confirmation for destructive actions
 */
export default function HostControls({ onPause, onSkip, onEnd }) {
    const [isPaused, setIsPaused] = useState(false);
    const [showEndConfirm, setShowEndConfirm] = useState(false);

    const handlePause = () => {
        setIsPaused(!isPaused);
        onPause?.(!isPaused);
    };

    return (
        <footer className="rounded-2xl bg-white border border-slate-100 px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Pause / Resume */}
                    <button
                        onClick={handlePause}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                       border transition-all duration-200
                       ${isPaused
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                            }`}
                    >
                        {isPaused ? (
                            <>
                                <Play className="w-4 h-4 fill-emerald-600" /> Resume
                            </>
                        ) : (
                            <>
                                <Pause className="w-4 h-4" /> Pause
                            </>
                        )}
                    </button>

                    {/* Skip */}
                    <button
                        onClick={onSkip}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                       bg-slate-50 border border-slate-200 text-ink-secondary
                       hover:bg-slate-100 transition-all duration-200"
                    >
                        <SkipForward className="w-4 h-4" /> Skip
                    </button>
                </div>

                {/* End Game */}
                <div className="relative">
                    {showEndConfirm ? (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-ink-secondary">End the game?</span>
                            <button
                                onClick={() => { onEnd?.(); setShowEndConfirm(false); }}
                                className="px-4 py-2 rounded-xl text-sm font-semibold bg-rose-500 text-white
                           hover:bg-rose-600 transition-colors"
                            >
                                Yes, end it
                            </button>
                            <button
                                onClick={() => setShowEndConfirm(false)}
                                className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-100 text-ink-secondary
                           hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowEndConfirm(true)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                         bg-rose-50 border border-rose-200 text-rose-600
                         hover:bg-rose-100 transition-all duration-200"
                        >
                            <StopCircle className="w-4 h-4" /> End Game
                        </button>
                    )}
                </div>
            </div>
        </footer>
    );
}
