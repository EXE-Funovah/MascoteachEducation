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
    LogOut,
    LockKeyhole,
    Mail,
    Pencil,
    Plus,
    RefreshCw,
    Trash2,
    UserRound,
    UserPlus,
    Users,
    X,
} from 'lucide-react';
import { getMyQuizzes } from '@/services/quizService';
import { confirmAction } from '@/components/shared/GlobalConfirmDialog';
import PortalModal from '@/components/shared/PortalModal';
import {
    addClassTeacher,
    assignFlashcard,
    createClass,
    getClassDetail,
    getClassFlashcards,
    getMyClasses,
    leaveClassAsTeacher,
    removeFlashcardAssignment,
    removeClassMember,
    removeClassTeacher,
    transferClassOwnership,
    updateClass,
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
    const [showAddTeacher, setShowAddTeacher] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [creating, setCreating] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [addingTeacher, setAddingTeacher] = useState(false);
    const [editing, setEditing] = useState(false);
    const [teacherEmail, setTeacherEmail] = useState('');
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
                setFlashcards(Array.isArray(flashcardData)
                    ? flashcardData.filter((item) => item.status === 'Teacher_Approved')
                    : []);
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
            setClassDetail((current) => current ? {
                ...current,
                flashcardAssignmentCount: (current.flashcardAssignmentCount || 0) + 1,
            } : current);
            setClasses((current) => current.map((item) => item.id === selectedClassId
                ? { ...item, flashcardAssignmentCount: (item.flashcardAssignmentCount || 0) + 1 }
                : item));
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
        const confirmed = await confirmAction({
            title: 'Xóa học sinh khỏi lớp?',
            message: `${member.fullName} sẽ không còn nhận được flashcard mới của lớp này.`,
            confirmLabel: 'Xóa khỏi lớp',
        });
        if (!confirmed) return;
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

    async function handleAddTeacher(event) {
        event.preventDefault();
        if (!selectedClassId || !teacherEmail.trim()) return;
        setAddingTeacher(true);
        setError('');
        try {
            const teacher = await addClassTeacher(selectedClassId, teacherEmail);
            setClassDetail((current) => ({
                ...current,
                teacherCount: (current?.teacherCount || current?.teachers?.length || 0) + 1,
                teachers: [...(current?.teachers || []), teacher],
            }));
            setClasses((current) => current.map((item) => item.id === selectedClassId
                ? { ...item, teacherCount: (item.teacherCount || 1) + 1 }
                : item));
            setTeacherEmail('');
            setShowAddTeacher(false);
            setNotice(`Đã thêm ${teacher.fullName} vào lớp.`);
        } catch (requestError) {
            setError(requestError?.message || 'Không thể thêm giáo viên vào lớp.');
        } finally {
            setAddingTeacher(false);
        }
    }

    async function handleRemoveTeacher(teacher) {
        const confirmed = await confirmAction({
            title: 'Xóa giáo viên khỏi lớp?',
            message: `${teacher.fullName} sẽ không thể xem lớp hoặc giao flashcard mới.`,
            confirmLabel: 'Xóa khỏi lớp',
        });
        if (!confirmed) return;
        try {
            await removeClassTeacher(selectedClassId, teacher.teacherId);
            setClassDetail((current) => ({
                ...current,
                teacherCount: Math.max(1, (current?.teacherCount || 1) - 1),
                teachers: current.teachers.filter((item) => item.teacherId !== teacher.teacherId),
            }));
            setClasses((current) => current.map((item) => item.id === selectedClassId
                ? { ...item, teacherCount: Math.max(1, (item.teacherCount || 1) - 1) }
                : item));
            setNotice(`Đã xóa ${teacher.fullName} khỏi lớp.`);
        } catch (requestError) {
            setError(requestError?.message || 'Không thể xóa giáo viên khỏi lớp.');
        }
    }

    async function handleUpdateClass(form) {
        if (!selectedClassId) return;
        setEditing(true);
        setError('');
        try {
            const updated = await updateClass(selectedClassId, form);
            setClassDetail((current) => ({ ...current, ...updated }));
            setClasses((current) => current.map((item) => (
                item.id === selectedClassId ? { ...item, ...updated } : item
            )));
            setShowEdit(false);
            setNotice(`Đã cập nhật lớp “${updated.name}”.`);
        } catch (requestError) {
            setError(requestError?.message || 'Không thể cập nhật lớp học.');
        } finally {
            setEditing(false);
        }
    }

    async function handleTransferOwnership(teacher) {
        const confirmed = await confirmAction({
            title: 'Chuyển quyền chủ lớp?',
            message: `${teacher.fullName} sẽ trở thành giáo viên chủ nhiệm và quản lý thành viên lớp. Bạn vẫn ở lại với vai trò giáo viên cộng tác.`,
            confirmLabel: 'Chuyển quyền',
            tone: 'primary',
        });
        if (!confirmed) return;
        setError('');
        try {
            await transferClassOwnership(selectedClassId, teacher.teacherId);
            setClassDetail((current) => ({
                ...current,
                teacherId: teacher.teacherId,
                teacherName: teacher.fullName,
                isOwner: false,
                teachers: current.teachers.map((item) => ({
                    ...item,
                    role: item.teacherId === teacher.teacherId ? 'Owner' : 'Teacher',
                })),
            }));
            setClasses((current) => current.map((item) => item.id === selectedClassId
                ? { ...item, teacherId: teacher.teacherId, teacherName: teacher.fullName, isOwner: false }
                : item));
            setNotice(`Đã chuyển quyền chủ lớp cho ${teacher.fullName}.`);
        } catch (requestError) {
            setError(requestError?.message || 'Không thể chuyển quyền chủ lớp.');
        }
    }

    async function handleLeaveTeacher() {
        const confirmed = await confirmAction({
            title: 'Rời lớp học?',
            message: 'Bạn sẽ không còn xem lớp hoặc giao flashcard mới. Các bài đã giao vẫn được giữ lại cho học sinh.',
            confirmLabel: 'Rời lớp',
        });
        if (!confirmed) return;
        try {
            await leaveClassAsTeacher(selectedClassId);
            const nextClasses = classes.filter((item) => item.id !== selectedClassId);
            setClasses(nextClasses);
            setSelectedClassId(nextClasses[0]?.id || null);
            setNotice('Bạn đã rời lớp.');
        } catch (requestError) {
            setError(requestError?.message || 'Không thể rời lớp học.');
        }
    }

    async function handleRemoveAssignment(assignment) {
        const confirmed = await confirmAction({
            title: 'Thu hồi flashcard?',
            message: `Học sinh sẽ không còn thấy “${assignment.title}”. Tiến độ cũ vẫn được lưu trong hệ thống.`,
            confirmLabel: 'Thu hồi',
        });
        if (!confirmed) return;
        try {
            await removeFlashcardAssignment(selectedClassId, assignment.id);
            setAssignments((current) => current.filter((item) => item.id !== assignment.id));
            setClassDetail((current) => current ? {
                ...current,
                flashcardAssignmentCount: Math.max(0, (current.flashcardAssignmentCount || 1) - 1),
            } : current);
            setClasses((current) => current.map((item) => item.id === selectedClassId
                ? { ...item, flashcardAssignmentCount: Math.max(0, (item.flashcardAssignmentCount || 1) - 1) }
                : item));
            setNotice(`Đã thu hồi “${assignment.title}”.`);
        } catch (requestError) {
            setError(requestError?.message || 'Không thể thu hồi flashcard.');
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
                            Cùng giáo viên trong lớp quản lý học sinh và giao các bộ thẻ đã xuất bản.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button type="button" onClick={() => setShowCreate(true)} className="inline-flex h-11 items-center gap-2 rounded-xl border border-brand-light bg-white px-4 text-sm font-extrabold text-brand-blue shadow-sm transition hover:bg-brand-light/20">
                            <Plus className="h-4 w-4" /> Tạo lớp
                        </button>
                        <button type="button" onClick={() => setShowAssign(true)} disabled={!selectedClassId || flashcards.length === 0} title={flashcards.length === 0 ? 'Hãy xuất bản ít nhất một bộ flashcard trước khi giao bài.' : undefined} className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-navy px-4 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(27,58,107,0.2)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45">
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
                                            <span className="inline-flex items-center gap-1"><UserRound className="h-3.5 w-3.5" /> {classroom.teacherCount || 1}</span>
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
                                            <div className="flex flex-col items-stretch gap-3 sm:flex-row lg:flex-col">
                                                <div className="flex min-w-[240px] items-center gap-3 rounded-2xl border border-brand-light bg-[#f4faff] px-4 py-3">
                                                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-brand-blue"><LockKeyhole className="h-5 w-5" /></span>
                                                    <span><span className="block text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Cách tham gia</span><strong className="mt-1 block text-sm text-brand-navy">Tìm lớp và nhập mật khẩu</strong></span>
                                                </div>
                                                {classDetail.isOwner ? (
                                                    <button type="button" onClick={() => setShowEdit(true)} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-brand-mid hover:text-brand-blue active:scale-[0.98]">
                                                        <Pencil className="h-4 w-4" /> Sửa thông tin lớp
                                                    </button>
                                                ) : (
                                                    <button type="button" onClick={handleLeaveTeacher} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 text-sm font-black text-rose-700 transition hover:bg-rose-100 active:scale-[0.98]">
                                                        <LogOut className="h-4 w-4" /> Rời lớp
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </section>

                                    <div className="mt-6 grid gap-6 2xl:grid-cols-2">
                                        <Panel title={`Giáo viên (${classDetail.teachers?.length || 0})`} icon={UserRound}>
                                            {classDetail.isOwner && (
                                                <button type="button" onClick={() => setShowAddTeacher(true)} className="mb-3 inline-flex h-10 items-center gap-2 rounded-xl bg-brand-light/20 px-3.5 text-xs font-black text-brand-blue transition hover:bg-brand-light/35">
                                                    <UserPlus className="h-4 w-4" /> Thêm giáo viên
                                                </button>
                                            )}
                                            <div className="divide-y divide-slate-100">
                                                {(classDetail.teachers || []).map((teacher) => (
                                                    <div key={teacher.teacherId} className="flex flex-wrap items-center gap-3 py-3.5">
                                                        <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-brand-light/20 text-sm font-black text-brand-blue">{teacher.fullName?.charAt(0)?.toUpperCase() || 'G'}</span>
                                                        <div className="min-w-[140px] flex-1"><p className="truncate text-sm font-black text-slate-900">{teacher.fullName}</p><p className="truncate text-xs font-semibold text-slate-500">{teacher.email}</p></div>
                                                        <span className="ml-auto rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-black uppercase tracking-[0.06em] text-slate-500">{teacher.role === 'Owner' ? 'Chủ lớp' : 'Giáo viên'}</span>
                                                        {classDetail.isOwner && teacher.role !== 'Owner' && <div className="flex w-full items-center justify-end gap-1 sm:w-auto"><button type="button" onClick={() => handleTransferOwnership(teacher)} className="inline-flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-xs font-black text-brand-blue transition hover:bg-brand-light/20 active:scale-[0.98]" aria-label={`Chuyển quyền cho ${teacher.fullName}`}><RefreshCw className="h-3.5 w-3.5" /> Chuyển quyền</button><button type="button" onClick={() => handleRemoveTeacher(teacher)} className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 active:scale-[0.98]" aria-label={`Xóa ${teacher.fullName}`}><Trash2 className="h-4 w-4" /></button></div>}
                                                    </div>
                                                ))}
                                            </div>
                                        </Panel>

                                        <Panel title={`Học sinh (${classDetail.members?.length || 0})`} icon={Users}>
                                            {!classDetail.members?.length ? <PanelEmpty text="Chưa có học sinh. Hãy gửi tên lớp và mật khẩu để các em tìm kiếm, tham gia." /> : (
                                                <div className="divide-y divide-slate-100">
                                                    {classDetail.members.map((member) => (
                                                        <div key={member.studentId} className="flex items-center gap-3 py-3.5">
                                                            <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-sky-50 text-sm font-black text-sky-700">{member.fullName?.charAt(0)?.toUpperCase() || 'H'}</span>
                                                            <div className="min-w-0"><p className="truncate text-sm font-black text-slate-900">{member.fullName}</p><p className="truncate text-xs font-semibold text-slate-500">{member.email}</p></div>
                                                            {classDetail.isOwner && <button type="button" onClick={() => handleRemoveMember(member)} className="ml-auto grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-600" aria-label={`Xóa ${member.fullName}`}><Trash2 className="h-4 w-4" /></button>}
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
                                                            <div className="flex items-start gap-3"><span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-violet-50 text-violet-600"><Layers3 className="h-5 w-5" /></span><div className="min-w-0"><h3 className="truncate text-sm font-black text-slate-900">{assignment.title}</h3><p className="mt-1 text-xs font-bold text-slate-500">{assignment.cardCount} thẻ · {assignment.assignedByName ? `${assignment.assignedByName} giao ` : 'Giao '}{formatDate(assignment.assignedAt)}</p></div>{assignment.canManage && <button type="button" onClick={() => handleRemoveAssignment(assignment)} className="ml-auto grid h-9 w-9 flex-none place-items-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-600" aria-label={`Thu hồi ${assignment.title}`} title="Thu hồi flashcard"><Trash2 className="h-4 w-4" /></button>}</div>
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

            <CreateClassModal open={showCreate} form={createForm} setForm={setCreateForm} submitting={creating} onClose={() => setShowCreate(false)} onSubmit={handleCreate} />
            <EditClassModal open={showEdit && Boolean(classDetail)} classroom={classDetail} submitting={editing} onClose={() => setShowEdit(false)} onSubmit={handleUpdateClass} />
            <AssignModal open={showAssign} form={assignForm} setForm={setAssignForm} flashcards={flashcards} selectedFlashcard={selectedFlashcard} className={classDetail?.name} submitting={assigning} onClose={() => setShowAssign(false)} onSubmit={handleAssign} />
            <AddTeacherModal open={showAddTeacher} email={teacherEmail} setEmail={setTeacherEmail} submitting={addingTeacher} onClose={() => setShowAddTeacher(false)} onSubmit={handleAddTeacher} />
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

function ModalShell({ open, title, description, onClose, closeDisabled, children }) {
    return <PortalModal open={open} title={title} description={description} onClose={onClose} closeDisabled={closeDisabled}>{children}</PortalModal>;
}

function Field({ label, children }) { return <label className="block"><span className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-slate-500">{label}</span>{children}</label>; }
const inputClass = 'h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none transition focus:border-brand-mid focus:ring-4 focus:ring-brand-light/25';

function CreateClassModal({ open, form, setForm, submitting, onClose, onSubmit }) {
    return <ModalShell open={open} title="Tạo lớp học" description="Học sinh sẽ tìm lớp theo tên hoặc giáo viên, sau đó nhập mật khẩu để tham gia." onClose={onClose} closeDisabled={submitting}><form onSubmit={onSubmit} className="space-y-4"><Field label="Tên lớp"><input autoFocus className={inputClass} value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Ví dụ: Toán 10A" maxLength={255} required /></Field><Field label="Mật khẩu tham gia"><input type="password" className={inputClass} value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} placeholder="Tối thiểu 6 ký tự" minLength={6} maxLength={72} autoComplete="new-password" required /></Field><Field label="Mô tả"><textarea className={`${inputClass} h-28 resize-none py-3`} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Nội dung hoặc mục tiêu của lớp" maxLength={1000} /></Field><button disabled={submitting || form.password.length < 6} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-navy text-sm font-black text-white transition hover:bg-brand-blue active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-light/30 disabled:opacity-60">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} {submitting ? 'Đang tạo...' : 'Tạo lớp'}</button></form></ModalShell>;
}

function EditClassModal({ open, classroom, submitting, onClose, onSubmit }) {
    const [form, setForm] = useState({
        name: classroom?.name || '',
        description: classroom?.description || '',
        password: '',
    });

    useEffect(() => {
        if (!open || !classroom) return;
        setForm({ name: classroom.name || '', description: classroom.description || '', password: '' });
    }, [open, classroom]);

    function handleSubmit(event) {
        event.preventDefault();
        onSubmit(form);
    }

    return <ModalShell open={open} title="Sửa thông tin lớp" description="Để trống mật khẩu nếu bạn chỉ muốn đổi tên hoặc mô tả lớp." onClose={onClose} closeDisabled={submitting}><form onSubmit={handleSubmit} className="space-y-4"><Field label="Tên lớp"><input autoFocus className={inputClass} value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} maxLength={255} required /></Field><Field label="Mô tả"><textarea className={`${inputClass} h-28 resize-none py-3`} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Nội dung hoặc mục tiêu của lớp" maxLength={1000} /></Field><Field label="Mật khẩu mới"><input type="password" className={inputClass} value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} placeholder="Để trống nếu không thay đổi" minLength={form.password ? 6 : undefined} maxLength={72} autoComplete="new-password" /></Field><button disabled={submitting || !form.name.trim() || (form.password && form.password.length < 6)} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-navy text-sm font-black text-white transition hover:bg-brand-blue active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-light/30 disabled:opacity-60">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4" />} {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}</button></form></ModalShell>;
}

function AddTeacherModal({ open, email, setEmail, submitting, onClose, onSubmit }) {
    return <ModalShell open={open} title="Thêm giáo viên" description="Nhập email tài khoản giáo viên đã đăng ký Mascoteach." onClose={onClose} closeDisabled={submitting}><form onSubmit={onSubmit} className="space-y-4"><Field label="Email giáo viên"><div className="relative"><Mail className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-brand-blue" /><input autoFocus type="email" className={`${inputClass} pl-11`} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="giaovien@truong.edu.vn" maxLength={255} required /></div></Field><button disabled={submitting || !email.trim()} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-navy text-sm font-black text-white transition hover:bg-brand-blue active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-light/30 disabled:opacity-60">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />} {submitting ? 'Đang thêm...' : 'Thêm vào lớp'}</button></form></ModalShell>;
}

function AssignModal({ open, form, setForm, flashcards, selectedFlashcard, className, submitting, onClose, onSubmit }) {
    return <ModalShell open={open} title="Giao flashcard" description={`Chọn bộ thẻ để giao cho ${className || 'lớp đã chọn'}.`} onClose={onClose} closeDisabled={submitting}><form onSubmit={onSubmit} className="space-y-4"><Field label="Bộ flashcard"><select autoFocus className={inputClass} value={form.quizId} onChange={(event) => setForm((current) => ({ ...current, quizId: event.target.value }))} required><option value="">Chọn bộ thẻ</option>{flashcards.map((item) => <option key={item.id} value={item.id}>{item.title} ({item.questionCount || 0} thẻ)</option>)}</select></Field>{selectedFlashcard && <div className="flex items-center gap-3 rounded-xl bg-violet-50 px-4 py-3 text-sm font-bold text-violet-700"><Clipboard className="h-4 w-4" /> {selectedFlashcard.questionCount || 0} thẻ sẵn sàng giao</div>}<Field label="Hướng dẫn"><textarea className={`${inputClass} h-24 resize-none py-3`} value={form.instructions} onChange={(event) => setForm((current) => ({ ...current, instructions: event.target.value }))} placeholder="Ví dụ: Học trước buổi học thứ hai" maxLength={1000} /></Field><Field label="Hạn hoàn thành (không bắt buộc)"><input type="datetime-local" className={inputClass} value={form.dueAt} onChange={(event) => setForm((current) => ({ ...current, dueAt: event.target.value }))} /></Field><button disabled={submitting || !form.quizId} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-navy text-sm font-black text-white transition hover:bg-brand-blue active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-light/30 disabled:opacity-60">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookOpenCheck className="h-4 w-4" />} {submitting ? 'Đang giao...' : 'Giao cho lớp'}</button></form></ModalShell>;
}
