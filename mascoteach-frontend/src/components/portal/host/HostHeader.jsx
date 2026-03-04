import GamePinDisplay from '@/components/portal/common/GamePinDisplay';
import { Users, Play, Radio } from 'lucide-react';

/**
 * HostHeader — Top bar on the host game screen
 * Shows: Game PIN, player count, live indicator, and start button
 */
export default function HostHeader({ pin, playerCount, totalPlayers, isLive, onStart }) {
    return (
        <header className="rounded-2xl bg-gradient-to-r from-brand-navy via-brand-blue to-brand-mid p-6 shadow-gamma-glow">
            <div className="flex items-center justify-between flex-wrap gap-4">
                {/* Left: Game PIN */}
                <GamePinDisplay pin={pin} />

                {/* Center: Status */}
                <div className="flex items-center gap-6">
                    {/* Player count */}
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{playerCount}</p>
                            <p className="text-xs text-brand-light">players joined</p>
                        </div>
                    </div>

                    {/* Live indicator */}
                    {isLive && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/20 border border-rose-400/30">
                            <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
                            <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">Live</span>
                        </div>
                    )}
                </div>

                {/* Right: Start button */}
                <button
                    onClick={onStart}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl
                     bg-white text-brand-navy font-bold text-sm
                     shadow-lg hover:shadow-xl
                     hover:scale-105 active:scale-95
                     transition-all duration-200"
                >
                    <Play className="w-5 h-5 fill-brand-navy" />
                    Start Game
                </button>
            </div>
        </header>
    );
}
