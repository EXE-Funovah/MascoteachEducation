import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Mic, Send, Sparkles } from 'lucide-react';
import { mascotMessages } from '@/data/mockData';

/**
 * MascotPanel — Floating AI assistant (the "beyond Blooket" layer)
 * Features: toggle visibility, chat interface, mood-based avatar states,
 * mic button, and animated transitions
 */
const moodEmojis = {
    idle: '🤖',
    excited: '🎉',
    thinking: '🤔',
    celebrating: '🥳',
    supportive: '💪',
    listening: '👂',
    speaking: '💬',
};

export default function MascotPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 'welcome', from: 'mascot', text: 'Hey there! I\'m Cosmo, your AI teaching assistant. How can I help? 📚', mood: 'idle' },
    ]);
    const [input, setInput] = useState('');
    const [mood, setMood] = useState('idle');
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), from: 'user', text: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setMood('thinking');

        // Simulate AI response
        setTimeout(() => {
            const randomReply = mascotMessages[Math.floor(Math.random() * mascotMessages.length)];
            setMessages((prev) => [...prev, { id: Date.now() + 1, from: 'mascot', text: randomReply.text, mood: randomReply.mood }]);
            setMood(randomReply.mood);
        }, 1200);
    };

    return (
        <>
            {/* ── Floating Toggle Button ── */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full
                    bg-gradient-to-br from-brand-navy to-brand-blue
                    shadow-gamma-btn hover:shadow-gamma-btn-hover
                    flex items-center justify-center
                    transition-all duration-300 hover:scale-105
                    ${isOpen ? 'rotate-0' : ''}`}
                aria-label={isOpen ? 'Close mascot assistant' : 'Open mascot assistant'}
            >
                {isOpen ? (
                    <X className="w-6 h-6 text-white" />
                ) : (
                    <MessageCircle className="w-6 h-6 text-white" />
                )}
            </button>

            {/* ── Chat Panel ── */}
            {isOpen && (
                <aside
                    className="fixed bottom-24 right-6 z-50 w-[360px] max-h-[520px] rounded-2xl
                     bg-white border border-slate-200 shadow-gamma-float
                     flex flex-col overflow-hidden
                     animate-in slide-in-from-bottom-4"
                    role="dialog"
                    aria-label="Mascot AI Assistant"
                >
                    {/* Header */}
                    <header className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-brand-navy to-brand-blue">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">
                            {moodEmojis[mood] || '🤖'}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-white">Cosmo</h3>
                            <p className="text-xs text-brand-light">AI Teaching Assistant</p>
                        </div>
                        <Sparkles className="w-5 h-5 text-brand-light animate-pulse" />
                    </header>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-[280px]">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                    ${msg.from === 'user'
                                            ? 'bg-gradient-to-r from-brand-navy to-brand-blue text-white rounded-br-md'
                                            : 'bg-slate-100 text-ink rounded-bl-md'
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input */}
                    <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-2">
                            <button
                                className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
                                aria-label="Voice input"
                            >
                                <Mic className="w-5 h-5 text-ink-muted" />
                            </button>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask Cosmo anything..."
                                className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-slate-200
                           text-sm text-ink placeholder:text-ink-muted
                           focus:outline-none focus:border-brand-mid focus:ring-2 focus:ring-brand-mid/20
                           transition-all duration-200"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim()}
                                className="p-2.5 rounded-xl bg-gradient-to-r from-brand-navy to-brand-blue
                           text-white shadow-sm hover:shadow-md
                           disabled:opacity-40 disabled:cursor-not-allowed
                           transition-all duration-200"
                                aria-label="Send message"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </aside>
            )}
        </>
    );
}
