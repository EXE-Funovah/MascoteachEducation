import { useState } from 'react';
import { Sparkles, Save, RotateCcw, Check, FileText, Loader2 } from 'lucide-react';
import FileUpload from '@/components/portal/create/FileUpload';
import QuestionEditor from '@/components/portal/create/QuestionEditor';
import { generatedQuestions as initialQuestions } from '@/data/mockData';

/**
 * CreatePage — AI-first question generation workflow
 * Flow: Upload → Generate → Edit → Save
 * Simulates AI processing with loading states
 */
export default function CreatePage() {
    const [step, setStep] = useState('upload'); // 'upload' | 'generating' | 'editing' | 'saved'
    const [file, setFile] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [setName, setSetName] = useState('');

    const handleFileSelect = (selectedFile) => {
        setFile(selectedFile);
    };

    const handleGenerate = () => {
        setStep('generating');
        // Simulate AI processing
        setTimeout(() => {
            setQuestions([...initialQuestions]);
            setSetName(file?.name?.replace(/\.[^/.]+$/, '') || 'Untitled Question Set');
            setStep('editing');
        }, 3000);
    };

    const handleSave = () => {
        setStep('saved');
        setTimeout(() => {
            // Reset after showing success
        }, 3000);
    };

    const handleReset = () => {
        setStep('upload');
        setFile(null);
        setQuestions([]);
        setSetName('');
    };

    return (
        <div className="space-y-8 max-w-4xl">
            {/* ── Page Header ── */}
            <header>
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-ink">Create with AI</h1>
                        <p className="text-sm text-ink-muted">Upload a document and let AI generate questions for you</p>
                    </div>
                </div>
            </header>

            {/* ── Step Indicator ── */}
            <nav className="flex items-center gap-2" aria-label="Creation steps">
                {['Upload', 'Generate', 'Review', 'Save'].map((label, idx) => {
                    const stepOrder = { upload: 0, generating: 1, editing: 2, saved: 3 };
                    const currentIdx = stepOrder[step];
                    const isActive = idx === currentIdx;
                    const isDone = idx < currentIdx;

                    return (
                        <div key={label} className="flex items-center gap-2">
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300
                              ${isDone ? 'bg-emerald-100 text-emerald-700' : isActive ? 'bg-brand-navy text-white' : 'bg-slate-100 text-ink-muted'}`}>
                                {isDone ? <Check className="w-3.5 h-3.5" /> : <span>{idx + 1}</span>}
                                <span>{label}</span>
                            </div>
                            {idx < 3 && (
                                <div className={`w-8 h-0.5 rounded transition-colors duration-300 ${idx < currentIdx ? 'bg-emerald-300' : 'bg-slate-200'}`} />
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* ════════════════════════════════════════ */}
            {/* STEP: Upload */}
            {/* ════════════════════════════════════════ */}
            {step === 'upload' && (
                <section className="space-y-6">
                    <FileUpload onFileSelect={handleFileSelect} />

                    {file && (
                        <div className="flex justify-end">
                            <button
                                onClick={handleGenerate}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white
                           bg-gradient-to-r from-violet-600 to-purple-600
                           shadow-lg hover:shadow-xl hover:brightness-110
                           transition-all duration-300 hover:scale-[1.02]"
                            >
                                <Sparkles className="w-5 h-5" />
                                Generate Questions
                            </button>
                        </div>
                    )}
                </section>
            )}

            {/* ════════════════════════════════════════ */}
            {/* STEP: Generating (Loading) */}
            {/* ════════════════════════════════════════ */}
            {step === 'generating' && (
                <section className="flex flex-col items-center justify-center py-20">
                    <div className="relative mb-8">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-xl">
                            <Sparkles className="w-10 h-10 text-white animate-pulse" />
                        </div>
                        {/* Orbiting dots */}
                        <div className="absolute inset-[-12px] animate-spin" style={{ animationDuration: '3s' }}>
                            <div className="w-3 h-3 rounded-full bg-violet-400 absolute top-0 left-1/2 -translate-x-1/2" />
                        </div>
                        <div className="absolute inset-[-20px] animate-spin" style={{ animationDuration: '5s', animationDirection: 'reverse' }}>
                            <div className="w-2 h-2 rounded-full bg-purple-300 absolute top-0 left-1/2 -translate-x-1/2" />
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-ink mb-2">AI is analyzing your document</h2>
                    <p className="text-sm text-ink-muted mb-6">Extracting key concepts and generating questions...</p>

                    <div className="w-64 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-600"
                            style={{
                                animation: 'loading-bar 3s ease-in-out',
                            }}
                        />
                    </div>

                    <style>{`
            @keyframes loading-bar {
              0% { width: 0%; }
              30% { width: 40%; }
              60% { width: 70%; }
              80% { width: 85%; }
              100% { width: 100%; }
            }
          `}</style>
                </section>
            )}

            {/* ════════════════════════════════════════ */}
            {/* STEP: Editing */}
            {/* ════════════════════════════════════════ */}
            {step === 'editing' && (
                <section className="space-y-6">
                    {/* Set name */}
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-100">
                        <FileText className="w-5 h-5 text-brand-blue flex-shrink-0" />
                        <input
                            type="text"
                            value={setName}
                            onChange={(e) => setSetName(e.target.value)}
                            className="flex-1 text-lg font-bold text-ink bg-transparent border-none
                         focus:outline-none placeholder:text-ink-muted"
                            placeholder="Question Set Name"
                        />
                        <span className="text-xs text-ink-muted bg-slate-50 px-3 py-1 rounded-lg">
                            {questions.length} questions
                        </span>
                    </div>

                    {/* Stats summary */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: 'Total', value: questions.length, color: 'bg-blue-100 text-blue-700' },
                            { label: 'Approved', value: questions.filter((q) => q.approved).length, color: 'bg-emerald-100 text-emerald-700' },
                            { label: 'Pending', value: questions.filter((q) => !q.approved).length, color: 'bg-amber-100 text-amber-700' },
                        ].map((s) => (
                            <div key={s.label} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100">
                                <span className={`text-xl font-bold ${s.color} px-3 py-1 rounded-lg`}>{s.value}</span>
                                <span className="text-sm text-ink-secondary font-medium">{s.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Question list */}
                    <QuestionEditor questions={questions} onUpdate={setQuestions} />

                    {/* Action bar */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <button
                            onClick={handleReset}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                         text-ink-secondary hover:bg-slate-100 transition-colors"
                        >
                            <RotateCcw className="w-4 h-4" /> Start Over
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={questions.filter((q) => q.approved).length === 0}
                            className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white
                         bg-gradient-to-r from-brand-navy to-brand-blue
                         shadow-gamma-btn hover:shadow-gamma-btn-hover
                         hover:brightness-110 transition-all duration-300
                         disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Save className="w-5 h-5" /> Save Question Set
                        </button>
                    </div>
                </section>
            )}

            {/* ════════════════════════════════════════ */}
            {/* STEP: Saved (Success) */}
            {/* ════════════════════════════════════════ */}
            {step === 'saved' && (
                <section className="flex flex-col items-center justify-center py-16">
                    <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
                        <Check className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h2 className="text-xl font-bold text-ink mb-2">Question Set Saved!</h2>
                    <p className="text-sm text-ink-muted mb-8">
                        {`"${setName}" with ${questions.filter((q) => q.approved).length} questions has been saved.`}
                    </p>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleReset}
                            className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-slate-200
                         text-ink-secondary hover:bg-slate-50 transition-colors"
                        >
                            Create Another
                        </button>
                        <a
                            href="/portal/games"
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white
                         bg-gradient-to-r from-brand-navy to-brand-blue shadow-gamma-btn
                         hover:shadow-gamma-btn-hover transition-all duration-300"
                        >
                            Start a Game
                        </a>
                    </div>
                </section>
            )}
        </div>
    );
}
