import { useState } from 'react';
import { Check, X, Edit3, ChevronDown, GripVertical } from 'lucide-react';

/**
 * QuestionEditor — Editable list of AI-generated questions
 * Features: inline edit, approve/delete, type & difficulty change
 */
const difficultyColors = {
    easy: 'bg-emerald-100 text-emerald-700',
    medium: 'bg-amber-100 text-amber-700',
    hard: 'bg-rose-100 text-rose-700',
};

const questionTypes = ['multiple-choice', 'true-false', 'short-answer', 'fill-blank'];

export default function QuestionEditor({ questions, onUpdate }) {
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');

    const startEdit = (q) => {
        setEditingId(q.id);
        setEditText(q.question);
    };

    const saveEdit = (id) => {
        onUpdate?.(questions.map((q) => (q.id === id ? { ...q, question: editText } : q)));
        setEditingId(null);
    };

    const toggleApprove = (id) => {
        onUpdate?.(questions.map((q) => (q.id === id ? { ...q, approved: !q.approved } : q)));
    };

    const deleteQuestion = (id) => {
        onUpdate?.(questions.filter((q) => q.id !== id));
    };

    const changeDifficulty = (id, difficulty) => {
        onUpdate?.(questions.map((q) => (q.id === id ? { ...q, difficulty } : q)));
    };

    const changeType = (id, type) => {
        onUpdate?.(questions.map((q) => (q.id === id ? { ...q, type } : q)));
    };

    return (
        <div className="space-y-3">
            {questions.map((q, idx) => (
                <article
                    key={q.id}
                    className={`rounded-xl border p-4 transition-all duration-200
                      ${q.approved
                            ? 'border-slate-100 bg-white hover:border-slate-200'
                            : 'border-amber-200 bg-amber-50/30'
                        }`}
                >
                    <div className="flex items-start gap-3">
                        {/* Drag handle */}
                        <div className="pt-1 text-ink-muted/40 cursor-grab" aria-hidden="true">
                            <GripVertical className="w-4 h-4" />
                        </div>

                        {/* Question number */}
                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-ink-secondary">{idx + 1}</span>
                        </div>

                        {/* Question content */}
                        <div className="flex-1 min-w-0">
                            {editingId === q.id ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && saveEdit(q.id)}
                                        className="flex-1 px-3 py-2 rounded-lg border border-brand-mid bg-white text-sm text-ink
                               focus:outline-none focus:ring-2 focus:ring-brand-mid/20"
                                        autoFocus
                                    />
                                    <button onClick={() => saveEdit(q.id)} className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors">
                                        <Check className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg bg-slate-100 text-ink-muted hover:bg-slate-200 transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <p className="text-sm font-medium text-ink leading-relaxed">{q.question}</p>
                            )}

                            {/* Options preview */}
                            {editingId !== q.id && q.options && (
                                <div className="flex flex-wrap gap-2 mt-2.5">
                                    {q.options.map((opt, optIdx) => (
                                        <span
                                            key={optIdx}
                                            className={`text-xs px-2.5 py-1 rounded-lg
                                  ${optIdx === q.correctAnswer
                                                    ? 'bg-emerald-100 text-emerald-700 font-semibold'
                                                    : 'bg-slate-50 text-ink-secondary'
                                                }`}
                                        >
                                            {opt}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Tags & actions row */}
                            <div className="flex items-center gap-2 mt-3 flex-wrap">
                                {/* Difficulty selector */}
                                <div className="relative group/diff">
                                    <button
                                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold
                                ${difficultyColors[q.difficulty]} transition-colors`}
                                    >
                                        {q.difficulty}
                                        <ChevronDown className="w-3 h-3 opacity-60" />
                                    </button>
                                    <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-10
                                  opacity-0 invisible group-hover/diff:opacity-100 group-hover/diff:visible transition-all duration-200">
                                        {['easy', 'medium', 'hard'].map((d) => (
                                            <button
                                                key={d}
                                                onClick={() => changeDifficulty(q.id, d)}
                                                className="block w-full text-left px-3 py-1.5 text-xs font-medium text-ink-secondary hover:bg-slate-50 capitalize"
                                            >
                                                {d}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Type selector */}
                                <div className="relative group/type">
                                    <button className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-ink-secondary">
                                        {q.type}
                                        <ChevronDown className="w-3 h-3 opacity-60" />
                                    </button>
                                    <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-10
                                  opacity-0 invisible group-hover/type:opacity-100 group-hover/type:visible transition-all duration-200">
                                        {questionTypes.map((t) => (
                                            <button
                                                key={t}
                                                onClick={() => changeType(q.id, t)}
                                                className="block w-full text-left px-3 py-1.5 text-xs font-medium text-ink-secondary hover:bg-slate-50"
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                                onClick={() => startEdit(q)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-ink-muted transition-colors"
                                aria-label="Edit question"
                            >
                                <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => toggleApprove(q.id)}
                                className={`p-1.5 rounded-lg transition-colors
                            ${q.approved ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-ink-muted hover:bg-emerald-50'}`}
                                aria-label={q.approved ? 'Unapprove' : 'Approve'}
                            >
                                <Check className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => deleteQuestion(q.id)}
                                className="p-1.5 rounded-lg hover:bg-rose-100 text-ink-muted hover:text-rose-500 transition-colors"
                                aria-label="Delete question"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </article>
            ))}
        </div>
    );
}
