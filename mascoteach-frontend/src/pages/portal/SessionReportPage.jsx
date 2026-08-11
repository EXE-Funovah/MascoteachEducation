import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
    AlertCircle,
    ArrowLeft,
    Award,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    CircleHelp,
    Clock3,
    Hash,
    Loader2,
    Medal,
    RefreshCw,
    Target,
    Users,
    XCircle,
} from 'lucide-react';
import { getSessionReport } from '@/services/sessionReportService';

const STATUS_META = {
    Waiting: { label: 'Chờ bắt đầu', className: 'border-sky-200 bg-sky-50 text-sky-700' },
    Active: { label: 'Đang diễn ra', className: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
    Running: { label: 'Đang diễn ra', className: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
    Ended: { label: 'Đã kết thúc', className: 'border-slate-200 bg-slate-50 text-slate-700' },
    Completed: { label: 'Đã kết thúc', className: 'border-slate-200 bg-slate-50 text-slate-700' },
};

function formatNumber(value) {
    return new Intl.NumberFormat('vi-VN').format(Number(value) || 0);
}

function formatPercent(value) {
    return `${Number(value || 0).toLocaleString('vi-VN', { maximumFractionDigits: 2 })}%`;
}

function formatDate(value) {
    if (!value) return 'Chưa có thời gian';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Chưa có thời gian';
    return date.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

export default function SessionReportPage() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeView, setActiveView] = useState('participants');
    const [expandedParticipantId, setExpandedParticipantId] = useState(null);
    const basePath = location.pathname.startsWith('/dev/teacher') ? '/dev/teacher' : '/teacher';

    async function loadReport(signal) {
        try {
            setLoading(true);
            setError('');
            setReport(await getSessionReport(sessionId, { signal }));
        } catch (requestError) {
            if (signal?.aborted) return;
            setError(requestError?.message || 'Không thể tải kết quả phiên chơi.');
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    }

    useEffect(() => {
        const controller = new AbortController();
        loadReport(controller.signal);
        return () => controller.abort();
    }, [sessionId]);

    const participants = useMemo(
        () => (Array.isArray(report?.participants) ? report.participants : []),
        [report]
    );
    const questions = useMemo(
        () => (Array.isArray(report?.questions) ? report.questions : []),
        [report]
    );

    if (loading) return <ReportLoading />;
    if (error || !report) {
        return (
            <ReportError
                message={error || 'Không tìm thấy kết quả phiên chơi.'}
                onBack={() => navigate(`${basePath}/sessions`)}
                onRetry={() => loadReport()}
            />
        );
    }

    const status = STATUS_META[report.status] || {
        label: report.status || 'Chưa rõ',
        className: 'border-slate-200 bg-slate-50 text-slate-700',
    };
    const possibleAnswers = (Number(report.totalParticipants) || 0) * (Number(report.totalQuestions) || 0);

    return (
        <div className="min-h-screen bg-[#f8fbff] px-5 py-6 text-slate-900 sm:px-8 lg:px-10">
            <div className="mx-auto max-w-[1500px]">
                <button
                    type="button"
                    onClick={() => navigate(`${basePath}/sessions`)}
                    className="mb-5 inline-flex items-center gap-2 rounded-xl px-1 py-2 text-sm font-extrabold text-slate-500 transition hover:text-brand-blue"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại lịch sử phiên chơi
                </button>

                <header className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.06)] sm:p-8">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className={`inline-flex rounded-lg border px-3 py-1.5 text-xs font-extrabold ${status.className}`}>
                            {status.label}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-extrabold text-slate-600">
                            <Hash className="h-3.5 w-3.5" /> PIN {report.gamePin}
                        </span>
                    </div>
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-brand-blue">Kết quả phiên chơi</p>
                    <h1 className="mt-2 text-3xl font-black tracking-[-0.025em] text-slate-950 sm:text-4xl">
                        {report.quizTitle || `Phiên chơi #${report.sessionId}`}
                    </h1>
                    <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
                        <Clock3 className="h-4 w-4" /> Bắt đầu lúc {formatDate(report.createdAt)}
                    </p>
                </header>

                <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard icon={Users} label="Người tham gia" value={formatNumber(report.totalParticipants)} tone="blue" />
                    <MetricCard icon={Award} label="Điểm trung bình" value={formatNumber(report.averageScore)} tone="amber" />
                    <MetricCard icon={Target} label="Tỷ lệ trả lời đúng" value={formatPercent(report.correctRate)} tone="emerald" />
                    <MetricCard icon={CircleHelp} label="Lượt trả lời" value={`${formatNumber(report.totalAnswers)} / ${formatNumber(possibleAnswers)}`} tone="violet" />
                </section>

                <section className="mt-6 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.05)]">
                    <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                        <div>
                            <h2 className="text-xl font-black text-slate-950">Chi tiết kết quả</h2>
                            <p className="mt-1 text-sm font-semibold text-slate-500">Thành tích người chơi và độ khó từng câu hỏi.</p>
                        </div>
                        <div className="inline-flex w-fit rounded-xl bg-slate-100 p-1">
                            <ViewTab active={activeView === 'participants'} onClick={() => setActiveView('participants')}>
                                Bảng xếp hạng ({participants.length})
                            </ViewTab>
                            <ViewTab active={activeView === 'questions'} onClick={() => setActiveView('questions')}>
                                Câu hỏi ({questions.length})
                            </ViewTab>
                        </div>
                    </div>

                    {activeView === 'participants' ? (
                        <ParticipantTable
                            participants={participants}
                            expandedParticipantId={expandedParticipantId}
                            onToggle={(participantId) => setExpandedParticipantId((current) => current === participantId ? null : participantId)}
                        />
                    ) : (
                        <QuestionTable questions={questions} />
                    )}
                </section>
            </div>
        </div>
    );
}

function MetricCard({ icon: Icon, label, value, tone }) {
    const tones = {
        blue: 'bg-sky-50 text-sky-600',
        amber: 'bg-amber-50 text-amber-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        violet: 'bg-violet-50 text-violet-600',
    };
    return (
        <motion.article
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_14px_38px_rgba(15,23,42,0.05)]"
        >
            <span className={`grid h-11 w-11 place-items-center rounded-xl ${tones[tone]}`}><Icon className="h-5 w-5" /></span>
            <p className="mt-5 text-2xl font-black text-slate-950">{value}</p>
            <p className="mt-1 text-sm font-bold text-slate-500">{label}</p>
        </motion.article>
    );
}

function ViewTab({ active, onClick, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-lg px-4 py-2 text-xs font-extrabold transition sm:text-sm ${active ? 'bg-white text-brand-navy shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
        >
            {children}
        </button>
    );
}

function ParticipantTable({ participants, expandedParticipantId, onToggle }) {
    if (participants.length === 0) return <EmptyDetail icon={Users} message="Phiên này chưa có người tham gia." />;
    return (
        <div>
            <div className="hidden grid-cols-[80px_minmax(220px,1fr)_130px_130px_150px_40px] gap-4 bg-slate-50 px-7 py-3 text-xs font-black uppercase tracking-[0.08em] text-slate-500 lg:grid">
                <span>Hạng</span><span>Người chơi</span><span>Điểm</span><span>Đúng / Sai</span><span>Độ chính xác</span><span />
            </div>
            {participants.map((participant) => {
                const expanded = expandedParticipantId === participant.participantId;
                return (
                    <div key={participant.participantId} className="border-t border-slate-100 first:border-t-0">
                        <button
                            type="button"
                            onClick={() => onToggle(participant.participantId)}
                            className="grid w-full grid-cols-[56px_minmax(0,1fr)_32px] items-center gap-3 px-5 py-4 text-left transition hover:bg-sky-50/40 lg:grid-cols-[80px_minmax(220px,1fr)_130px_130px_150px_40px] lg:gap-4 lg:px-7"
                        >
                            <RankBadge rank={participant.rank} />
                            <div className="min-w-0">
                                <p className="truncate text-sm font-extrabold text-slate-900">{participant.studentName}</p>
                                <p className="mt-1 text-xs font-semibold text-slate-500 lg:hidden">{formatNumber(participant.totalScore)} điểm · {formatPercent(participant.accuracyRate)}</p>
                            </div>
                            <span className="hidden text-sm font-black text-brand-navy lg:block">{formatNumber(participant.totalScore)}</span>
                            <span className="hidden text-sm font-bold text-slate-600 lg:block"><span className="text-emerald-600">{participant.correctCount}</span> / <span className="text-rose-500">{participant.incorrectCount}</span></span>
                            <div className="hidden items-center gap-3 lg:flex">
                                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, Number(participant.accuracyRate) || 0)}%` }} /></div>
                                <span className="w-12 text-right text-xs font-extrabold text-slate-600">{formatPercent(participant.accuracyRate)}</span>
                            </div>
                            {expanded ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                        </button>
                        {expanded && <ParticipantAnswers participant={participant} />}
                    </div>
                );
            })}
        </div>
    );
}

function RankBadge({ rank }) {
    if (rank <= 3) {
        const colors = ['bg-amber-100 text-amber-700', 'bg-slate-200 text-slate-700', 'bg-orange-100 text-orange-700'];
        return <span className={`grid h-9 w-9 place-items-center rounded-full ${colors[rank - 1]}`}><Medal className="h-5 w-5" /></span>;
    }
    return <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-sm font-black text-slate-600">{rank}</span>;
}

function ParticipantAnswers({ participant }) {
    const answers = Array.isArray(participant.answers) ? participant.answers : [];
    return (
        <div className="bg-slate-50/80 px-5 py-4 lg:px-7">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.08em] text-slate-500">Câu trả lời của {participant.studentName}</p>
            {answers.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-5 text-sm font-semibold text-slate-500">Người chơi chưa trả lời câu nào.</p>
            ) : (
                <div className="grid gap-3 xl:grid-cols-2">
                    {answers.map((answer) => (
                        <article key={answer.questionId} className="rounded-xl border border-slate-200 bg-white p-4">
                            <div className="flex items-start gap-3">
                                {answer.isCorrect ? <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-emerald-500" /> : <XCircle className="mt-0.5 h-5 w-5 flex-none text-rose-500" />}
                                <div className="min-w-0">
                                    <p className="text-sm font-extrabold text-slate-900">Câu {(answer.position ?? 0) + 1}: {answer.questionText}</p>
                                    <p className={`mt-2 text-sm font-bold ${answer.isCorrect ? 'text-emerald-700' : 'text-rose-600'}`}>Đã chọn: {answer.selectedOptionText}</p>
                                    <p className="mt-1 text-xs font-semibold text-slate-400">+{formatNumber(answer.scoreAwarded)} điểm · {formatDate(answer.answeredAt)}</p>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}

function QuestionTable({ questions }) {
    if (questions.length === 0) return <EmptyDetail icon={CircleHelp} message="Phiên này chưa có dữ liệu câu hỏi." />;
    return (
        <div className="divide-y divide-slate-100">
            {questions.map((question) => (
                <article key={question.questionId} className="grid gap-4 px-5 py-5 lg:grid-cols-[minmax(0,1fr)_120px_120px_220px] lg:items-center lg:px-7">
                    <div className="flex min-w-0 gap-3">
                        <span className="grid h-9 w-9 flex-none place-items-center rounded-lg bg-sky-50 text-sm font-black text-brand-blue">{(question.position ?? 0) + 1}</span>
                        <div className="min-w-0">
                            <p className="text-sm font-extrabold text-slate-900">{question.questionText}</p>
                            <p className="mt-1 text-xs font-semibold text-slate-500">{question.answeredCount} lượt trả lời · {question.unansweredCount} chưa trả lời</p>
                        </div>
                    </div>
                    <span className="inline-flex items-center gap-2 text-sm font-extrabold text-emerald-600"><CheckCircle2 className="h-4 w-4" /> {question.correctCount} đúng</span>
                    <span className="inline-flex items-center gap-2 text-sm font-extrabold text-rose-500"><XCircle className="h-4 w-4" /> {question.incorrectCount} sai</span>
                    <div className="flex items-center gap-3">
                        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand-blue" style={{ width: `${Math.min(100, Number(question.correctRate) || 0)}%` }} /></div>
                        <span className="w-14 text-right text-sm font-black text-slate-700">{formatPercent(question.correctRate)}</span>
                    </div>
                </article>
            ))}
        </div>
    );
}

function EmptyDetail({ icon: Icon, message }) {
    return (
        <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400"><Icon className="h-7 w-7" /></span>
            <p className="mt-4 text-sm font-bold text-slate-500">{message}</p>
        </div>
    );
}

function ReportLoading() {
    return (
        <div className="flex min-h-[70vh] items-center justify-center bg-[#f8fbff]">
            <div className="text-center"><Loader2 className="mx-auto h-9 w-9 animate-spin text-brand-blue" /><p className="mt-4 text-sm font-extrabold text-slate-500">Đang tổng hợp kết quả phiên chơi...</p></div>
        </div>
    );
}

function ReportError({ message, onBack, onRetry }) {
    return (
        <div className="flex min-h-[70vh] items-center justify-center bg-[#f8fbff] px-6">
            <div className="w-full max-w-lg rounded-[24px] border border-slate-200 bg-white p-8 text-center shadow-[0_18px_55px_rgba(15,23,42,0.07)]">
                <AlertCircle className="mx-auto h-12 w-12 text-rose-500" />
                <h1 className="mt-4 text-xl font-black text-slate-950">Không thể mở kết quả phiên chơi</h1>
                <p className="mt-2 text-sm font-semibold text-slate-500">{message}</p>
                <div className="mt-6 flex justify-center gap-3">
                    <button onClick={onBack} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-extrabold text-slate-700 hover:bg-slate-50">Quay lại</button>
                    <button onClick={onRetry} className="inline-flex items-center gap-2 rounded-xl bg-brand-blue px-4 py-2.5 text-sm font-extrabold text-white hover:bg-brand-navy"><RefreshCw className="h-4 w-4" /> Thử lại</button>
                </div>
            </div>
        </div>
    );
}
