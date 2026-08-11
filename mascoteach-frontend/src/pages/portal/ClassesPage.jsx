import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
    AlertCircle,
    BookOpenCheck,
    Check,
    Clipboard,
    Clock3,
    GraduationCap,
    Layers3,
    Loader2,
    LockKeyhole,
    Plus,
    Trash2,
    UserRound,
    Users,
    X,
} from 'lucide-react';
import { getMyQuizzes } from '@/services/quizService';
import {
    assignFlashcard,
    createClass,
    getClassDetail,
    getClassFlashcards,
    getMyClasses,
    removeClassMember,
} from '@/services/flashcardClassService';

function formatDate(value, includeTime = false) {
    if (!value) return 'Không giới hạn';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Không giới hạn';
    return date.toLocaleString('vi-VN', includeTime
        ? { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }
        : { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function ClassesPage() {
    const location = useLocation();
    const requestedQuizId = Number(location.state?.quizId) || null;
    const [classes, setClasses] = useState([]);
    const [flashcards, setFlashcards] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState(null);
    const [classDetail, setClassDetail] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [showAssign, setShowAssign] = useState(Boolean(requestedQuizId));
    const [creating, setCreating] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [createForm, setCreateForm] = useState({ name: '', description: '', password: '' });
    const [assignForm, setAssignForm] = useState({
        quizId: requestedQuizId ? String(requestedQuizId) : '',
        instructions: '',
        dueAt: '',
    });

    useEffect(() => {
        const controller = new AbortController();
        Promise.all([
            getMyClasses({ signal: controller.signal }),
            getMyQuizzes('Flashcard'),
        ])
            .then(([classData, flashcardData]) => {
                const nextClasses = Array.isArray(classData) ? classData : [];
                setClasses(nextClasses);
                setFlashcards(Array.isArray(flashcardData) ? flashcardData : []);
                setSelectedClassId((current) => current || nextClasses[0]?.id || null);
            })
            .catch((requestError) => {
                if (!controller.signal.aborted) {
                    setError(requestError?.message || 'Không thể tải danh sách lớp học.');
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort();
    }, []);

    useEffect(() => {
        if (!selectedClassId) {
            setClassDetail(null);
            setAssignments([]);
            return undefined;
        }

        const controller = new AbortController();
        setDetailLoading(true);
        setError('');
        Promise.all([
            getClassDetail(selectedClassId, { signal: controller.signal }),
            getClassFlashcards(selectedClassId, { signal: controller.signal }),
        ])
            .then(([detail, assignmentData]) => {
                setClassDetail(detail);
                setAssignments(Array.isArray(assignmentData) ? assignmentData : []);
            })
            .catch((requestError) => {
                if (!controller.signal.aborted) {
                    setError(requestError?.message || 'Không thể tải chi tiết lớp học.');
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) setDetailLoading(false);
            });
        return () => controller.abort();
    }, [selectedClassId]);

    const selectedFlashcard = useMemo(
        () => flashcards.find((item) => item.id === Number(assignForm.quizId)),
        [assignForm.quizId, flashcards]
    );

    async function handleCreate(event) {
        event.preventDefault();
        if (!createForm.name.trim() || createForm.password.length < 6) return;
        setCreating(true);
        setError('');
        try {
            const created = await createClass(createForm);
            setClasses((current) => [created, ...current]);
            setSelectedClassId(created.id);
            setCreateForm({ name: '', description: '', password: '' });
            setShowCreate(false);
            setNotice(`Đã tạo lớp “${created.name}”.`);
        } catch (requestError) {
            setError(requestError?.message || 'Không thể tạo lớp học.');
        } finally {
            setCreating(false);
        }
    }

    async function handleAssign(event) {
        event.preventDefault();
        if (!selectedClassId || !assignForm.quizId) return;
        setAssigning(true);
        setError('');
        try {
            const created = await assignFlashcard(selectedClassId, {
                ...assignForm,
                dueAt: assignForm.dueAt ? new Date(assignForm.dueAt).toISOString() : null,
            });
            setAssignments((current) => [created, ...current]);
            setAssignForm({ quizId: '', instructions: '', dueAt: '' });
            setShowAssign(false);
            setNotice(`Đã giao “${created.title}” cho lớp ${created.className}.`);
        } catch (requestError) {
            setError(requestError?.message || 'Không thể giao bộ thẻ cho lớp.');
        } finally {
            setAssigning(false);
        }
    }

    async function handleRemoveMember(member) {
        if (!window.confirm(`Xóa ${member.fullName} khỏi lớp?`)) return;
        try {
            await removeClassMember(selectedClassId, member.studentId);
            setClassDetail((current) => ({
                ...current,
                memberCount: Math.max(0, (current?.memberCount || 0) - 1),
                members: current.members.filter((item) => item.studentId !== member.studentId),
            }));
        } catch (requestError) {
            setError(requestError?.message || 'Không thể xóa học sinh khỏi lớp.');
        }
    }

    return (
        <div className="min-h-screen bg-[#f8fbff] px-5 py-6 text-slate-900 sm:px-8 lg:px-10">
            <div className="mx-auto max-w-[1500px]">
                <header className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-brand-blue">Không gian lớp học</p>
                        <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-950 sm:text-4xl">Lớp & bài flashcard</h1>
                        <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
                            Tạo lớp có mật khẩu, quản lý học sinh và giao các bộ thẻ đã xuất bản.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button type="button" onClick={() => setShowCreate(true)} className="inline-flex h-11 items-center gap-2 rounded-xl border border-brand-light bg-white px-4 text-sm font-extrabold text-brand-blue shadow-sm transition hover:bg-brand-light/20">
                            <Plus className="h-4 w-4" /> Tạo lớp
                        </button>
                        <button type="button" onClick={() => setShowAssign(true)} disabled={!selectedClassId || flashcards.length === 0} className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-navy px-4 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(27,58,107,0.2)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45">
                            <Layers3 className="h-4 w-4" /> Giao flashcard
                        </button>
                    </div>
                </header>

                {(error || notice) && (
                    <div className={`mt-5 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-bold ${error ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
                        {error ? <AlertCircle className="mt-0.5 h-4 w-4 flex-none" /> : <Check className="mt-0.5 h-4 w-4 flex-none" />}
                        <span>{error || notice}</span>
                        <button type="button" onClick={() => { setError(''); setNotice(''); }} className="ml-auto"><X className="h-4 w-4" /></button>
                    </div>
                )}

                {loading ? (
                    <LoadingState />
                ) : classes.length === 0 ? (
                    <EmptyClasses onCreate={() => setShowCreate(true)} />
                ) : (
                    <div className="mt-7 grid gap-6 xl:grid-cols-[330px_minmax(0,1fr)]">
                        <aside className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_18px_55px_rgba(15,23,42,0.05)]">
                            <div className="mb-3 flex items-center justify-between px-2">
                                <h2 className="text-base font-black text-slate-950">Lớp của tôi</h2>
                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-500">{classes.length}</span>
                            </div>
                            <div className="space-y-2">
                                {classes.map((classroom) => (
                                    <button key={classroom.id} type="button" onClick={() => setSelectedClassId(classroom.id)} className={`w-full rounded-2xl border p-4 text-left transition ${selectedClassId === classroom.id ? 'border-brand-mid bg-brand-light/20 shadow-sm' : 'border-transparent bg-slate-50 hover:border-slate-200 hover:bg-white'}`}>
                                        <p className="truncate text-[15px] font-black text-slate-900">{classroom.name}</p>
                                        <div className="mt-2 flex items-center gap-3 text-xs font-bold text-slate-500">
                                            <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {classroom.memberCount}</span>
                                            <span className="inline-flex items-center gap-1"><Layers3 className="h-3.5 w-3.5" /> {classroom.flashcardAssignmentCount}</span>
                                            <span className="ml-auto inline-flex items-center gap-1 font-black text-brand-blue"><LockKeyhole className="h-3.5 w-3.5" /> Có mật khẩu</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </aside>

                        <main className="min-w-0">
                            {detailLoading || !classDetail ? <LoadingPanel /> : (
                                <>
                                    <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.05)] sm:p-7">
                                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                            <div>
                                                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-light/25 text-brand-blue"><GraduationCap className="h-6 w-6" /></div>
                                                <h2 className="mt-4 text-2xl font-black text-slate-950">{classDetail.name}</h2>
                                                <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">{classDetail.description || 'Chưa có mô tả cho lớp học này.'}</p>
                                            </div>
                                            <div className="flex min-w-[240px] items-center gap-3 rounded-2xl border border-brand-light bg-[#f4faff] px-4 py-3">
                                                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-brand-blue"><LockKeyhole className="h-5 w-5" /></span>
                                                <span><span className="block text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Cách tham gia</span><strong className="mt-1 block text-sm text-brand-navy">Tìm lớp và nhập mật khẩu</strong></span>
                                            </div>
                                        </div>
                                    </section>

                                    <div className="mt-6 grid gap-6 2xl:grid-cols-2">
                                        <Panel title={`Học sinh (${classDetail.members?.length || 0})`} icon={Users}>
                                            {!classDetail.members?.length ? <PanelEmpty text="Chưa có học sinh. Hãy gửi tên lớp và mật khẩu để các em tìm kiếm, tham gia." /> : (
                                                <div className="divide-y divide-slate-100">
                                                    {classDetail.members.map((member) => (
                                                        <div key={member.studentId} className="flex items-center gap-3 py-3.5">
                                                            <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-sky-50 text-sm font-black text-sky-700">{member.fullName?.charAt(0)?.toUpperCase() || 'H'}</span>
                                                            <div className="min-w-0"><p className="truncate text-sm font-black text-slate-900">{member.fullName}</p><p className="truncate text-xs font-semibold text-slate-500">{member.email}</p></div>
                                                            <button type="button" onClick={() => handleRemoveMember(member)} className="ml-auto grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-600" aria-label={`Xóa ${member.fullName}`}><Trash2 className="h-4 w-4" /></button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </Panel>

                                        <Panel title={`Flashcard đã giao (${assignments.length})`} icon={BookOpenCheck}>
                                            {!assignments.length ? <PanelEmpty text="Chưa giao bộ thẻ nào cho lớp này." /> : (
                                                <div className="space-y-3">
                                                    {assignments.map((assignment) => (
                                                        <article key={assignment.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                                                            <div className="flex items-start gap-3"><span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-violet-50 text-violet-600"><Layers3 className="h-5 w-5" /></span><div className="min-w-0"><h3 className="truncate text-sm font-black text-slate-900">{assignment.title}</h3><p className="mt-1 text-xs font-bold text-slate-500">{assignment.cardCount} thẻ · Giao {formatDate(assignment.assignedAt)}</p></div></div>
                                                            {assignment.instructions && <p className="mt-3 text-xs font-semibold leading-5 text-slate-600">{assignment.instructions}</p>}
                                                            <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500"><Clock3 className="h-3.5 w-3.5" /> Hạn: {formatDate(assignment.dueAt, true)}</p>
                                                        </article>
                                                    ))}
                                                </div>
                                            )}
                                        </Panel>
                                    </div>
                                </>
                            )}
                        </main>
                    </div>
                )}
            </div>

            {showCreate && <CreateClassModal form={createForm} setForm={setCreateForm} submitting={creating} onClose={() => setShowCreate(false)} onSubmit={handleCreate} />}
            {showAssign && <AssignModal form={assignForm} setForm={setAssignForm} flashcards={flashcards} selectedFlashcard={selectedFlashcard} className={classDetail?.name} submitting={assigning} onClose={() => setShowAssign(false)} onSubmit={handleAssign} />}
        </div>
    );
}

function Panel({ title, icon: Icon, children }) {
    return <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.05)]"><div className="mb-4 flex items-center gap-2"><Icon className="h-5 w-5 text-brand-blue" /><h2 className="text-lg font-black text-slate-950">{title}</h2></div>{children}</section>;
}

function PanelEmpty({ text }) { return <div className="grid min-h-36 place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center text-sm font-semibold leading-6 text-slate-500">{text}</div>; }
function LoadingState() { return <div className="mt-16 flex items-center justify-center gap-3 text-sm font-bold text-slate-500"><Loader2 className="h-6 w-6 animate-spin text-brand-blue" /> Đang tải lớp học...</div>; }
function LoadingPanel() { return <div className="flex min-h-[420px] items-center justify-center rounded-[24px] border border-slate-200 bg-white"><Loader2 className="h-7 w-7 animate-spin text-brand-blue" /></div>; }
function EmptyClasses({ onCreate }) { return <div className="mt-8 grid min-h-[430px] place-items-center rounded-[28px] border border-dashed border-brand-light bg-white px-6 text-center"><div><span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand-light/25 text-brand-blue"><Users className="h-8 w-8" /></span><h2 className="mt-5 text-xl font-black text-slate-950">Bạn chưa có lớp học</h2><p className="mt-2 text-sm font-semibold text-slate-500">Tạo lớp đầu tiên để giao flashcard cho học sinh.</p><button type="button" onClick={onCreate} className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-brand-navy px-5 text-sm font-extrabold text-white"><Plus className="h-4 w-4" /> Tạo lớp đầu tiên</button></div></div>; }

function ModalShell({ title, description, onClose, children }) {
    return <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-slate-950/40 p-4 backdrop-blur-sm"><div className="w-full max-w-xl rounded-[26px] border border-white/70 bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.25)] sm:p-7"><div className="flex items-start justify-between gap-4"><div><h2 className="text-2xl font-black text-slate-950">{title}</h2><p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{description}</p></div><button type="button" onClick={onClose} className="grid h-10 w-10 flex-none place-items-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"><X className="h-5 w-5" /></button></div>{children}</div></div>;
}

function Field({ label, children }) { return <label className="block"><span className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-slate-500">{label}</span>{children}</label>; }
const inputClass = 'h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none transition focus:border-brand-mid focus:ring-4 focus:ring-brand-light/25';

function CreateClassModal({ form, setForm, submitting, onClose, onSubmit }) {
    return <ModalShell title="Tạo lớp học" description="Học sinh sẽ tìm lớp theo tên hoặc giáo viên, sau đó nhập mật khẩu để tham gia."><form onSubmit={onSubmit} className="mt-6 space-y-4"><Field label="Tên lớp"><input autoFocus className={inputClass} value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Ví dụ: Toán 10A" maxLength={255} required /></Field><Field label="Mật khẩu tham gia"><input type="password" className={inputClass} value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} placeholder="Tối thiểu 6 ký tự" minLength={6} maxLength={72} autoComplete="new-password" required /></Field><Field label="Mô tả"><textarea className={`${inputClass} h-28 resize-none py-3`} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Nội dung hoặc mục tiêu của lớp" maxLength={1000} /></Field><button disabled={submitting || form.password.length < 6} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-navy text-sm font-black text-white disabled:opacity-60">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} {submitting ? 'Đang tạo...' : 'Tạo lớp'}</button></form></ModalShell>;
}

function AssignModal({ form, setForm, flashcards, selectedFlashcard, className, submitting, onClose, onSubmit }) {
    return <ModalShell title="Giao flashcard" description={`Chọn bộ thẻ để giao cho ${className || 'lớp đã chọn'}.`}><form onSubmit={onSubmit} className="mt-6 space-y-4"><Field label="Bộ flashcard"><select className={inputClass} value={form.quizId} onChange={(event) => setForm((current) => ({ ...current, quizId: event.target.value }))} required><option value="">Chọn bộ thẻ</option>{flashcards.map((item) => <option key={item.id} value={item.id}>{item.title} ({item.questionCount || 0} thẻ)</option>)}</select></Field>{selectedFlashcard && <div className="flex items-center gap-3 rounded-xl bg-violet-50 px-4 py-3 text-sm font-bold text-violet-700"><Clipboard className="h-4 w-4" /> {selectedFlashcard.questionCount || 0} thẻ sẵn sàng giao</div>}<Field label="Hướng dẫn"><textarea className={`${inputClass} h-24 resize-none py-3`} value={form.instructions} onChange={(event) => setForm((current) => ({ ...current, instructions: event.target.value }))} placeholder="Ví dụ: Học trước buổi học thứ hai" maxLength={1000} /></Field><Field label="Hạn hoàn thành (không bắt buộc)"><input type="datetime-local" className={inputClass} value={form.dueAt} onChange={(event) => setForm((current) => ({ ...current, dueAt: event.target.value }))} /></Field><button disabled={submitting || !form.quizId} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-navy text-sm font-black text-white disabled:opacity-60">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookOpenCheck className="h-4 w-4" />} {submitting ? 'Đang giao...' : 'Giao cho lớp'}</button></form></ModalShell>;
}
