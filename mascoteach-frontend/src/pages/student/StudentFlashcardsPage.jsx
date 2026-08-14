import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AlertCircle,
    ArrowRight,
    BookOpenCheck,
    Check,
    Clock3,
    GraduationCap,
    Layers3,
    Loader2,
    LockKeyhole,
    LogOut,
    School,
    Search,
    Sparkles,
} from 'lucide-react';
import {
    getEnrolledClasses,
    getMyFlashcardAssignments,
    joinClass,
    leaveClassAsStudent,
    searchClasses,
} from '@/services/flashcardClassService';
import { confirmAction } from '@/components/shared/GlobalConfirmDialog';
import PortalModal from '@/components/shared/PortalModal';

function formatDate(value) {
    if (!value) return 'Không giới hạn';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Không giới hạn';
    return date.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

export default function StudentFlashcardsPage() {
    const navigate = useNavigate();
    const [classes, setClasses] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [activeClassId, setActiveClassId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [joinPassword, setJoinPassword] = useState('');
    const [searching, setSearching] = useState(false);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');

    async function loadData(signal) {
        try {
            setLoading(true);
            setError('');
            const [classData, assignmentData] = await Promise.all([
                getEnrolledClasses({ signal }),
                getMyFlashcardAssignments({ signal }),
            ]);
            const nextClasses = Array.isArray(classData) ? classData : [];
            setClasses(nextClasses);
            setActiveClassId((current) => (
                nextClasses.some((item) => item.id === current)
                    ? current
                    : nextClasses[0]?.id ?? null
            ));
            setAssignments(Array.isArray(assignmentData) ? assignmentData : []);
        } catch (requestError) {
            if (!signal?.aborted) setError(requestError?.message || 'Không thể tải flashcard của bạn.');
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    }

    useEffect(() => {
        const controller = new AbortController();
        loadData(controller.signal);
        return () => controller.abort();
    }, []);

    async function handleSearch(event) {
        event.preventDefault();
        const query = searchQuery.trim();
        if (query.length < 2) return;
        setSearching(true);
        setError('');
        setNotice('');
        try {
            const result = await searchClasses(query);
            setSearchResults(Array.isArray(result) ? result : []);
        } catch (requestError) {
            setError(requestError?.message || 'Không thể tìm lớp học.');
        } finally {
            setSearching(false);
        }
    }

    async function handleJoin(event) {
        event.preventDefault();
        if (!selectedClass || !joinPassword) return;
        setJoining(true);
        setError('');
        setNotice('');
        try {
            const classroom = await joinClass(selectedClass.id, joinPassword);
            setSelectedClass(null);
            setJoinPassword('');
            setSearchResults((current) => current.filter((item) => item.id !== classroom.id));
            setNotice(`Bạn đã tham gia lớp “${classroom.name}”.`);
            await loadData();
        } catch (requestError) {
            setError(requestError?.message || 'Mật khẩu không đúng hoặc lớp không còn tồn tại.');
        } finally {
            setJoining(false);
        }
    }

    async function handleLeaveClass() {
        if (!activeClass) return;
        const confirmed = await confirmAction({
            title: 'Rời lớp học?',
            message: `Bạn sẽ không còn thấy các flashcard của lớp “${activeClass.name}”. Bạn vẫn có thể tham gia lại bằng mật khẩu lớp.`,
            confirmLabel: 'Rời lớp',
        });
        if (!confirmed) return;

        setError('');
        try {
            await leaveClassAsStudent(activeClass.id);
            const nextClasses = classes.filter((item) => item.id !== activeClass.id);
            setClasses(nextClasses);
            setAssignments((current) => current.filter((item) => item.classId !== activeClass.id));
            setActiveClassId(nextClasses[0]?.id ?? null);
            setNotice(`Bạn đã rời lớp “${activeClass.name}”.`);
        } catch (requestError) {
            setError(requestError?.message || 'Không thể rời lớp học.');
        }
    }

    const stats = useMemo(() => {
        const totalCards = assignments.reduce((sum, item) => sum + (Number(item.cardCount) || 0), 0);
        const mastered = assignments.reduce((sum, item) => sum + (Number(item.masteredCount) || 0), 0);
        return { totalCards, mastered };
    }, [assignments]);

    const activeClass = useMemo(
        () => classes.find((item) => item.id === activeClassId) || null,
        [activeClassId, classes]
    );

    const visibleAssignments = useMemo(
        () => assignments.filter((item) => item.classId === activeClassId),
        [activeClassId, assignments]
    );

    return (
        <div className="min-h-screen bg-[#f8fbff] px-5 py-6 text-slate-900 sm:px-8 lg:px-10">
            <div className="mx-auto max-w-[1450px]">
                <header className="overflow-hidden rounded-[28px] border border-brand-light/70 bg-gradient-to-br from-white via-[#f4faff] to-[#e9f5ff] p-6 shadow-[0_20px_65px_rgba(43,122,181,0.09)] sm:p-8">
                    <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_430px] xl:items-center">
                        <div>
                            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-brand-blue shadow-sm"><Sparkles className="h-3.5 w-3.5" /> Góc học tập</span>
                            <h1 className="mt-4 text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl">Flashcard của tôi</h1>
                            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-600">Tìm lớp của giáo viên, nhập mật khẩu tham gia và học các bộ thẻ được giao theo tiến độ của riêng bạn.</p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <StatPill icon={School} value={classes.length} label="Lớp đã tham gia" />
                                <StatPill icon={Layers3} value={assignments.length} label="Bộ thẻ được giao" />
                                <StatPill icon={Check} value={`${stats.mastered}/${stats.totalCards}`} label="Thẻ đã biết" />
                            </div>
                        </div>
                        <form onSubmit={handleSearch} className="rounded-[22px] border border-white/80 bg-white/90 p-5 shadow-[0_18px_46px_rgba(15,23,42,0.08)]">
                            <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-light/25 text-brand-blue"><Search className="h-5 w-5" /></span><div><h2 className="text-base font-black text-slate-950">Tìm lớp học</h2><p className="text-xs font-semibold text-slate-500">Tìm theo tên lớp hoặc tên giáo viên</p></div></div>
                            <div className="mt-4 flex gap-2"><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Ví dụ: Toán 10A" aria-label="Tìm lớp học" minLength={2} maxLength={100} className="h-12 min-w-0 flex-1 rounded-xl border border-slate-200 px-4 text-sm font-bold text-brand-navy outline-none focus:border-brand-mid focus:ring-4 focus:ring-brand-light/25" /><button disabled={searching || searchQuery.trim().length < 2} className="inline-flex h-12 items-center gap-2 rounded-xl bg-brand-navy px-4 text-sm font-black text-white disabled:opacity-50">{searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Tìm</button></div>
                            {searchResults.length > 0 && <div className="mt-3 max-h-52 space-y-2 overflow-y-auto">{searchResults.map((item) => <button key={item.id} type="button" onClick={() => { setSelectedClass(item); setJoinPassword(''); }} className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-brand-mid hover:bg-brand-light/10"><span className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-white text-brand-blue"><School className="h-4 w-4" /></span><span className="min-w-0"><strong className="block truncate text-sm text-slate-900">{item.name}</strong><span className="block truncate text-xs font-semibold text-slate-500">{item.teacherName} · {item.memberCount} học sinh</span></span><span className="ml-auto text-xs font-black text-brand-blue">Chọn</span></button>)}</div>}
                            {!searching && searchQuery.trim().length >= 2 && searchResults.length === 0 && <p className="mt-3 text-center text-xs font-semibold text-slate-500">Nhấn “Tìm” để xem các lớp phù hợp.</p>}
                        </form>
                    </div>
                </header>

                {(error || notice) && <div className={`mt-5 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-bold ${error ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>{error ? <AlertCircle className="h-4 w-4" /> : <Check className="h-4 w-4" />} {error || notice}</div>}

                {loading ? <div className="flex min-h-[360px] items-center justify-center gap-3 text-sm font-bold text-slate-500"><Loader2 className="h-6 w-6 animate-spin text-brand-blue" /> Đang tải bài học...</div> : (
                    <div className="mt-7 grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
                        <aside className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.05)]">
                            <div className="flex items-center gap-2"><GraduationCap className="h-5 w-5 text-brand-blue" /><h2 className="text-lg font-black text-slate-950">Lớp của bạn</h2></div>
                            {!classes.length ? <p className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-sm font-semibold leading-6 text-slate-500">Bạn chưa tham gia lớp nào.</p> : <div className="mt-4 space-y-2">{classes.map((classroom) => <button key={classroom.id} type="button" onClick={() => setActiveClassId(classroom.id)} className={`w-full rounded-2xl border p-4 text-left transition ${activeClassId === classroom.id ? 'border-brand-mid bg-brand-light/20 shadow-sm' : 'border-slate-200 bg-slate-50/70 hover:border-brand-light hover:bg-white'}`}><div className="flex items-start gap-3"><span className={`mt-0.5 grid h-9 w-9 flex-none place-items-center rounded-xl ${activeClassId === classroom.id ? 'bg-white text-brand-blue' : 'bg-slate-100 text-slate-500'}`}><School className="h-4 w-4" /></span><span className="min-w-0"><h3 className="truncate text-sm font-black text-slate-900">{classroom.name}</h3><p className="mt-1 truncate text-xs font-semibold text-slate-500">Giáo viên: {classroom.teacherName || 'Mascoteach'}</p><p className="mt-2 inline-flex items-center gap-1 text-xs font-black text-brand-blue"><Layers3 className="h-3.5 w-3.5" /> {assignments.filter((item) => item.classId === classroom.id).length} bộ thẻ</p></span></div></button>)}</div>}
                        </aside>

                        <main>
                            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-2xl font-black text-slate-950">{activeClass ? `Flashcard lớp ${activeClass.name}` : 'Bài được giao'}</h2><p className="mt-1 text-sm font-semibold text-slate-500">{activeClass ? 'Chỉ hiển thị các bộ thẻ giáo viên đã giao cho lớp này.' : 'Chọn một lớp để xem flashcard.'}</p></div><div className="flex items-center gap-2"><span className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-slate-500 shadow-sm">{visibleAssignments.length} bộ</span>{activeClass && <button type="button" onClick={handleLeaveClass} className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 text-xs font-black text-rose-700 transition hover:bg-rose-100 active:scale-[0.98]"><LogOut className="h-3.5 w-3.5" /> Rời lớp</button>}</div></div>
                            {!visibleAssignments.length ? <EmptyAssignments hasClass={classes.length > 0} /> : <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">{visibleAssignments.map((assignment) => {
                                const percent = assignment.cardCount ? Math.round((assignment.masteredCount / assignment.cardCount) * 100) : 0;
                                return <button key={assignment.id} type="button" onClick={() => navigate(`/student/flashcards/${assignment.id}`)} className="group rounded-[22px] border border-slate-200 bg-white p-5 text-left shadow-[0_14px_42px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:border-brand-mid hover:shadow-[0_22px_52px_rgba(43,122,181,0.13)]"><div className="flex items-start justify-between gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-50 text-violet-600"><Layers3 className="h-6 w-6" /></span><ArrowRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-brand-blue" /></div><p className="mt-5 text-xs font-black uppercase tracking-[0.1em] text-brand-blue">{assignment.className}</p><h3 className="mt-2 line-clamp-2 text-lg font-black leading-6 text-slate-950">{assignment.title}</h3>{assignment.assignedByName && <p className="mt-2 text-xs font-bold text-slate-500">Giáo viên: <span className="text-slate-700">{assignment.assignedByName}</span></p>}{assignment.instructions && <p className="mt-2 line-clamp-2 text-sm font-semibold leading-5 text-slate-500">{assignment.instructions}</p>}<div className="mt-5 flex items-center justify-between text-xs font-bold text-slate-500"><span>{assignment.masteredCount}/{assignment.cardCount} thẻ đã biết</span><span>{percent}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-brand-blue to-cyan-400 transition-all" style={{ width: `${percent}%` }} /></div><p className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500"><Clock3 className="h-3.5 w-3.5" /> Hạn: {formatDate(assignment.dueAt)}</p></button>;
                            })}</div>}
                        </main>
                    </div>
                )}
            </div>
            <PortalModal open={Boolean(selectedClass)} title={selectedClass?.name || 'Tham gia lớp'} description={`Giáo viên: ${selectedClass?.teacherName || 'Mascoteach'}`} icon={LockKeyhole} maxWidth="max-w-md" closeDisabled={joining} onClose={() => setSelectedClass(null)}><form onSubmit={handleJoin}><label className="block"><span className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-slate-500">Mật khẩu lớp</span><input autoFocus type="password" value={joinPassword} onChange={(event) => setJoinPassword(event.target.value)} maxLength={72} autoComplete="current-password" className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-bold outline-none transition focus:border-brand-mid focus:ring-4 focus:ring-brand-light/25" placeholder="Nhập mật khẩu giáo viên cung cấp" required /></label><button disabled={joining || !joinPassword} className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-navy text-sm font-black text-white transition hover:bg-brand-blue active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-light/30 disabled:opacity-50">{joining && <Loader2 className="h-4 w-4 animate-spin" />} {joining ? 'Đang tham gia...' : 'Tham gia lớp'}</button></form></PortalModal>
        </div>
    );
}

function StatPill({ icon: Icon, value, label }) { return <div className="inline-flex items-center gap-3 rounded-2xl border border-white/80 bg-white/80 px-4 py-3 shadow-sm"><Icon className="h-5 w-5 text-brand-blue" /><span><strong className="block text-base font-black text-slate-950">{value}</strong><span className="text-[11px] font-bold text-slate-500">{label}</span></span></div>; }
function EmptyAssignments({ hasClass }) { return <div className="grid min-h-[330px] place-items-center rounded-[24px] border border-dashed border-slate-200 bg-white px-6 text-center"><div><span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand-light/20 text-brand-blue"><BookOpenCheck className="h-8 w-8" /></span><h3 className="mt-5 text-lg font-black text-slate-950">Chưa có bài flashcard</h3><p className="mt-2 max-w-sm text-sm font-semibold leading-6 text-slate-500">{hasClass ? 'Giáo viên chưa giao bộ thẻ nào cho lớp của bạn.' : 'Hãy tìm và tham gia lớp ở phía trên để nhận bài từ giáo viên.'}</p></div></div>; }
