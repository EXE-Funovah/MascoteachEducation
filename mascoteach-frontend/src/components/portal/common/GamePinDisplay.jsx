import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

/**
 * GamePinDisplay — Large, prominent game PIN for the host screen
 * Includes copy-to-clipboard functionality
 */
export default function GamePinDisplay({ pin = '482 915' }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(pin.replace(/\s/g, ''));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex items-center gap-4">
            <div>
                <p className="text-xs font-semibold text-brand-mid uppercase tracking-widest mb-1">Game PIN</p>
                <p className="text-4xl md:text-5xl font-extrabold tracking-[0.15em] text-white font-display">
                    {pin}
                </p>
            </div>
            <button
                onClick={handleCopy}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20
                   transition-all duration-200"
                aria-label="Copy game PIN"
            >
                {copied ? (
                    <Check className="w-5 h-5 text-emerald-400" />
                ) : (
                    <Copy className="w-5 h-5 text-white/80" />
                )}
            </button>
        </div>
    );
}
