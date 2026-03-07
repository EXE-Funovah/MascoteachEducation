import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Swords, Zap, Shield, Gem, Heart, Sparkles,
    Loader2, AlertCircle, ChevronLeft, Play,
    BookOpen, CheckCircle2
} from 'lucide-react';
import { getAllGameTemplates } from '@/services/gameTemplateService';
import { createSession } from '@/services/liveSessionService';

/**
 * GameTemplateSelectionPage — Final step: choose a game template and create a live session
 *
 * Flow: QuizPreviewPage → publish quiz → navigate here with { quizId, quizTitle, questionCount }
 *       → User picks a game template
 *       → POST /api/LiveSession { quizId, templateId }
 *       → Navigate to sessions or host page
 */

const modeIcons = {
    'Swords': Swords,
    'Zap': Zap,
    'Shield': Shield,
    'Gem': Gem,
    'Heart': Heart,
};

function getIconForTemplate(name) {
    const lower = (name || '').toLowerCase();
    if (lower.includes('battle') || lower.includes('chiến')) return Swords;
    if (lower.includes('speed') || lower.includes('nhanh') || lower.includes('đua')) return Zap;
    if (lower.includes('team') || lower.includes('đội')) return Shield;
    if (lower.includes('treasure') || lower.includes('kho')) return Gem;
    if (lower.includes('survival') || lower.includes('sinh tồn')) return Heart;
    return Sparkles;
}

export default function GameTemplateSelectionPage() {
    const location = useLocation();
    const navigate = useNavigate();

    const quizId = location.state?.quizId;
    const quizTitle = location.state?.quizTitle || 'Bài kiểm tra';
    const questionCount = location.state?.questionCount || 0;

    const [gameTemplates, setGameTemplates] = useState([]);
    const [loadingTemplates, setLoadingTemplates] = useState(true);
    const [templatesError, setTemplatesError] = useState(null);

    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState(null);

    // Redirect if no quizId
    useEffect(() => {
        if (!quizId) {
            navigate('/teacher');
        }
    }, [quizId, navigate]);

    // Fetch game templates on mount
    useEffect(() => {
        async function fetchTemplates() {
            try {
                setLoadingTemplates(true);
                setTemplatesError(null);
                const data = await getAllGameTemplates();
                setGameTemplates(Array.isArray(data) ? data : []);
            } catch (err) {
                setTemplatesError(err.message || 'Không thể tải chế độ chơi');
            } finally {
                setLoadingTemplates(false);
            }
        }
        fetchTemplates();
    }, []);

    async function handleCreateSession() {
        if (!selectedTemplate || !quizId) return;

        setCreating(true);
        setCreateError(null);

        try {
            const session = await createSession({
                quizId: quizId,
                templateId: selectedTemplate,
            });

            // Navigate to sessions page (or host page if available)
            navigate('/teacher/sessions', {
                state: { newSessionId: session?.id },
            });
        } catch (err) {
            console.error('[GameTemplate] Create session error:', err);
            setCreateError(err.message || 'Không thể tạo phiên chơi. Vui lòng thử lại.');
            setCreating(false);
        }
    }

    function handleSkip() {
        // User can skip game selection and go to library
        navigate('/teacher/library');
    }

    if (!quizId) return null;

    return (
        <section className="max-w-3xl mx-auto px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                {/* ── Back & Header ── */}
                <header className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1.5 text-[13px] text-slate-400
                                   hover:text-slate-600 transition-colors mb-4"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Quay lại
                    </button>

                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                            <Play className="w-5 h-5 text-violet-500" />
                        </div>
                        <div>
                            <h1 className="text-[18px] font-bold text-slate-800">
                                Chọn chế độ chơi
                            </h1>
                            <p className="text-[13px] text-slate-400">
                                Bước cuối — Chọn template game cho phiên chơi
                            </p>
                        </div>
                    </div>

                    {/* Quiz summary */}
                    <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-emerald-700 truncate">
                                {quizTitle}
                            </p>
                            <p className="text-[11px] text-emerald-500">
                                {questionCount} câu hỏi đã được tạo thành công
                            </p>
                        </div>
                    </div>
                </header>

                {/* ── Error ── */}
                {createError && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-600 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {createError}
                    </div>
                )}

                {/* ── Templates Grid ── */}
                {loadingTemplates ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-6 h-6 text-sky-500 animate-spin" />
                        <span className="ml-3 text-sm text-slate-400">Đang tải chế độ chơi...</span>
                    </div>
                ) : templatesError ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <AlertCircle className="w-8 h-8 text-slate-300 mb-3" />
                        <p className="text-sm text-slate-400 mb-3">{templatesError}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-sky-600 bg-sky-50
                                       hover:bg-sky-100 transition-colors"
                        >
                            Thử lại
                        </button>
                    </div>
                ) : gameTemplates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <p className="text-sm text-slate-400 mb-4">
                            Chưa có chế độ chơi nào. Bạn có thể bỏ qua và quay lại sau.
                        </p>
                        <button
                            onClick={handleSkip}
                            className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-slate-600
                                       border border-slate-200 hover:bg-slate-50 transition-colors"
                        >
                            Đi đến thư viện
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                            {gameTemplates.map((template) => {
                                const IconComponent = modeIcons[template.icon] || getIconForTemplate(template.name);
                                const isSelected = selectedTemplate === template.id;

                                return (
                                    <motion.button
                                        key={template.id}
                                        onClick={() => setSelectedTemplate(template.id)}
                                        className={`group relative flex flex-col p-5 rounded-xl
                                                    border text-left transition-all duration-200
                                                    ${isSelected
                                                ? 'border-violet-400 bg-violet-50/50 ring-2 ring-violet-200/50'
                                                : 'border-slate-200/80 bg-white hover:border-violet-300 hover:bg-violet-50/20'
                                            }`}
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center
                                                             transition-colors duration-200
                                                             ${isSelected ? 'bg-violet-100' : 'bg-slate-50 group-hover:bg-violet-50'}`}>
                                                <IconComponent className={`w-5 h-5 transition-colors duration-200
                                                    ${isSelected ? 'text-violet-500' : 'text-slate-400 group-hover:text-violet-500'}`} />
                                            </div>
                                            <h3 className={`text-[14px] font-semibold transition-colors duration-200
                                                ${isSelected ? 'text-violet-600' : 'text-slate-700'}`}>
                                                {template.name}
                                            </h3>
                                        </div>

                                        {template.thumbnailUrl && (
                                            <div className="w-full h-24 rounded-lg bg-slate-50 overflow-hidden mb-3">
                                                <img
                                                    src={template.thumbnailUrl}
                                                    alt={template.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between mt-auto">
                                            <span className="text-[11px] text-slate-400">
                                                Template #{template.id}
                                            </span>
                                            <span className={`text-[12px] font-semibold transition-all duration-200
                                                ${isSelected
                                                    ? 'text-violet-500'
                                                    : 'text-slate-400 group-hover:text-violet-500'
                                                }`}>
                                                {isSelected ? '✓ Đã chọn' : 'Chọn →'}
                                            </span>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>

                        {/* ── Actions ── */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100/60">
                            <button
                                onClick={handleSkip}
                                className="text-[13px] font-medium text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                Bỏ qua, đi đến thư viện
                            </button>

                            <motion.button
                                onClick={handleCreateSession}
                                disabled={!selectedTemplate || creating}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl
                                           bg-gradient-to-r from-violet-500 to-purple-500 text-white text-[13px] font-bold
                                           hover:from-violet-600 hover:to-purple-600 transition-all duration-200
                                           shadow-md hover:shadow-lg
                                           disabled:opacity-60 disabled:cursor-not-allowed"
                                whileHover={!creating && selectedTemplate ? { scale: 1.02, y: -1 } : {}}
                                whileTap={!creating && selectedTemplate ? { scale: 0.98 } : {}}
                            >
                                {creating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Đang tạo phiên...
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-4 h-4" />
                                        Tạo phiên chơi
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </>
                )}
            </motion.div>
        </section>
    );
}
