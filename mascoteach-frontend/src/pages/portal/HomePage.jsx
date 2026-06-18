import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    ArrowRight,
    CheckCircle2,
    Clock,
    CloudUpload,
    FileText,
    Layers,
    Library,
    ListChecks,
    Loader2,
    PencilLine,
    Plus,
    Presentation,
    Search,
    Sparkles,
    X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createDocument, generateUploadUrl, getMyDocuments } from '@/services/documentService';
import { getMySessions } from '@/services/liveSessionService';
import { zipFileForUpload } from '@/utils/zipFile';
import { getDocumentUploadErrorMessage } from '@/utils/documentLimitError';

const TABS = [
    { id: 'create', label: 'Tạo mới', hint: 'từ tài liệu', Icon: PencilLine },
    { id: 'search', label: 'Tìm kiếm', hint: 'trong thư viện', Icon: Search },
    { id: 'upload', label: 'Tải lên', hint: 'và tăng cường', Icon: CloudUpload },
];

const ACTIVITY_TYPES = [
    {
        id: 'quiz',
        label: 'Trắc nghiệm',
        description: 'Tạo bộ câu hỏi nhanh từ tài liệu bằng AI.',
        Icon: ListChecks,
        color: 'bg-[#5D9CEC]',
        available: true,
    },
    {
        id: 'flashcards',
        label: 'Thẻ ôn tập',
        description: 'Tạo thẻ ghi nhớ cho thuật ngữ, khái niệm và ôn tập.',
        Icon: Layers,
        color: 'bg-[#6F7DEB]',
        available: true,
    },
];

const DEMO_DOCS = [
    { id: 'demo-1', title: 'Sinh học 10 - Tế bào và trao đổi chất.pdf', uploadedAt: '2026-05-28T09:30:00Z' },
    { id: 'demo-2', title: 'Ôn tập lịch sử thế giới hiện đại.docx', uploadedAt: '2026-05-25T14:20:00Z' },
    { id: 'demo-3', title: 'Bài giảng phân số lớp 5.pptx', uploadedAt: '2026-05-21T07:10:00Z' },
];

const DEMO_SESSIONS = [
    { id: 's-1', title: 'Quiz Sinh học 10', participants: 31, createdAt: '2026-05-28T10:00:00Z' },
    { id: 's-2', title: 'Ôn tập phân số', participants: 24, createdAt: '2026-05-22T08:00:00Z' },
];

function extractFileName(doc) {
    if (doc.title) return doc.title;
    if (doc.fileName) return doc.fileName;
    const raw = doc.s3Key || doc.fileUrl || '';
    const last = raw.split('/').pop() || '';
    return last.replace(/^[0-9a-f-]{12,}-?/i, '') || `Tài liệu #${doc.id}`;
}

function uploadFileWithProgress(uploadUrl, file, onProgress) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

        xhr.upload.onprogress = (event) => {
            if (!event.lengthComputable) return;
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(Math.max(1, Math.min(99, percent)));
        };

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                onProgress(100);
                resolve();
                return;
            }
            reject(new Error(`S3 upload failed: ${xhr.status} ${xhr.statusText}`));
        };

        xhr.onerror = () => reject(new Error('Upload failed. Please try again.'));
        xhr.send(file);
    });
}

function UploadIllustration() {
    const orbitItems = [
        { label: 'PDF', className: 'teacher-orbit-item--pdf', Icon: FileText },
        { label: 'DOC', className: 'teacher-orbit-item--doc', Icon: FileText },
        { label: 'PPT', className: 'teacher-orbit-item--ppt', Icon: Presentation },
    ];

    return (
        <div className="teacher-upload-visual" aria-hidden="true">
            <div className="teacher-orbit teacher-orbit--outer" />
            <div className="teacher-orbit teacher-orbit--inner" />
            {orbitItems.map((item) => (
                <span key={item.label} className={`teacher-orbit-item ${item.className}`}>
                    <item.Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                </span>
            ))}
            <div className="teacher-file-stack">
                <div className="teacher-file-card teacher-file-card--back" />
                <div className="teacher-file-card teacher-file-card--mid" />
                <div className="teacher-file-card teacher-file-card--front">
                    <FileText className="h-7 w-7 text-[#5D9CEC]" />
                </div>
            </div>
        </div>
    );
}

function ActivityCard({ type, onSelect }) {
    return (
        <button
            type="button"
            onClick={() => {
                if (type.available) onSelect(type.id);
            }}
            disabled={!type.available}
            className={[
                'group flex flex-col items-center justify-center gap-3 rounded-[18px] px-5 py-6 text-center transition duration-300',
                type.available
                    ? 'bg-white text-slate-800 hover:-translate-y-1 hover:shadow-[0_18px_46px_rgba(93,156,236,0.16)]'
                    : 'bg-slate-50 text-slate-400 cursor-not-allowed',
            ].join(' ')}
        >
            <span className={`grid h-16 w-16 place-items-center rounded-[16px] text-white shadow-[0_14px_30px_rgba(15,23,42,0.14)] ${type.color}`}>
                <type.Icon className="h-8 w-8" />
            </span>
            <span className="text-[15px] font-bold">{type.label}</span>
            <span className="max-w-[190px] text-[12px] leading-5 text-slate-500">{type.description}</span>
            {type.badge && (
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-bold text-slate-500">
                    {type.badge}
                </span>
            )}
        </button>
    );
}

export default function HomePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const isDevPreview = location.pathname.startsWith('/dev/teacher');
    const fileInputRef = useRef(null);
    const [activeTab, setActiveTab] = useState('create');
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [documents, setDocuments] = useState(isDevPreview ? DEMO_DOCS : []);
    const [recentSessions, setRecentSessions] = useState(isDevPreview ? DEMO_SESSIONS : []);
    const [loadingDocs, setLoadingDocs] = useState(!isDevPreview);
    const [loadingSessions, setLoadingSessions] = useState(!isDevPreview);
    const [docsError, setDocsError] = useState('');
    const [uploadError, setUploadError] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [pendingUpload, setPendingUpload] = useState(null);
    const [pendingType, setPendingType] = useState('quiz');
    const [searchQuery, setSearchQuery] = useState('');

    const { user } = useAuth();
    const displayName = user?.fullName || user?.name || (isDevPreview ? 'Minh Anh' : 'Giáo viên');
    const greeting = new Date().getHours() < 18 ? 'Chào ngày mới' : 'Chào buổi tối';

    useEffect(() => {
        if (isDevPreview) return;

        async function loadDashboardData() {
            try {
                setLoadingDocs(true);
                const docs = await getMyDocuments();
                setDocuments(Array.isArray(docs) ? docs.filter((doc) => !doc.isDeleted) : []);
            } catch (err) {
                setDocsError(err.message || 'Không thể tải tài liệu');
            } finally {
                setLoadingDocs(false);
            }

            try {
                setLoadingSessions(true);
                const sessions = await getMySessions();
                setRecentSessions(Array.isArray(sessions) ? sessions.slice(0, 4) : []);
            } catch {
                setRecentSessions([]);
            } finally {
                setLoadingSessions(false);
            }
        }

        loadDashboardData();
    }, [isDevPreview]);

    const filteredDocuments = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return documents;
        return documents.filter((doc) => extractFileName(doc).toLowerCase().includes(query));
    }, [documents, searchQuery]);

    function routeFor(path) {
        return isDevPreview ? path.replace('/teacher', '/dev/teacher') : path;
    }

    function handleTypeSelection(typeId) {
        setSelectedType(typeId);
        setActiveTab('upload');
    }

    function navigateToCustomizer(upload, typeId) {
        navigate(routeFor('/teacher/quiz-settings'), {
            state: {
                fileName: upload.fileName,
                fileSize: upload.fileSize,
                documentId: upload.documentId,
                fileUrl: upload.fileUrl,
                activityType: typeId,
            },
        });
    }

    function handleDocumentAction(doc) {
        const upload = {
            fileName: extractFileName(doc),
            fileSize: doc.fileSize || null,
            documentId: doc.id,
            fileUrl: doc.presignedUrl || null,
        };

        if (selectedType) {
            navigateToCustomizer(upload, selectedType);
            return;
        }

        setPendingType('quiz');
        setPendingUpload(upload);
    }

    async function handleDirectUpload(event) {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file || isUploading) return;

        setUploadError('');
        setUploadProgress(0);

        if (isDevPreview) {
            setIsUploading(true);
            for (const value of [16, 38, 62, 84, 100]) {
                await new Promise((resolve) => setTimeout(resolve, 120));
                setUploadProgress(value);
            }
            setIsUploading(false);

            const upload = {
                fileName: file.name,
                fileSize: file.size,
                documentId: 'dev-upload',
                fileUrl: null,
            };

            if (selectedType) {
                navigateToCustomizer(upload, selectedType);
            } else {
                setPendingType('quiz');
                setPendingUpload(upload);
            }
            return;
        }

        setIsUploading(true);
        try {
            const zippedFile = await zipFileForUpload(file);
            const { uploadUrl, s3Key } = await generateUploadUrl(file.name);
            await uploadFileWithProgress(uploadUrl, zippedFile, setUploadProgress);
            const doc = await createDocument({ s3Key, fileName: file.name });

            const upload = {
                fileName: file.name,
                fileSize: file.size,
                documentId: doc?.id ?? doc?.documentId ?? null,
                fileUrl: doc?.presignedUrl ?? null,
            };

            if (selectedType) {
                navigateToCustomizer(upload, selectedType);
            } else {
                setPendingType('quiz');
                setPendingUpload(upload);
            }
        } catch (err) {
            setUploadError(getDocumentUploadErrorMessage(err));
        } finally {
            setIsUploading(false);
        }
    }

    const renderCreate = () => (
        <section className="teacher-panel" aria-label="Tạo nội dung mới">
            <div className="mb-8 text-center">
                <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#5D9CEC]">Chọn định dạng</p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.02em] text-slate-900">
                    Bạn muốn tạo gì hôm nay?
                </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
                {ACTIVITY_TYPES.map((type) => (
                    <ActivityCard key={type.id} type={type} onSelect={handleTypeSelection} />
                ))}
            </div>
        </section>
    );

    const renderSearch = () => (
        <section className="teacher-panel" aria-label="Tìm kiếm tài liệu">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#5D9CEC]">Thư viện</p>
                    <h2 className="mt-1 text-2xl font-extrabold tracking-[-0.02em] text-slate-900">Chọn tài liệu để bắt đầu</h2>
                </div>
                <button
                    type="button"
                    onClick={() => setActiveTab('upload')}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1E293B] px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5"
                >
                    <Plus className="h-4 w-4" />
                    Tải tài liệu mới
                </button>
            </div>

            <div className="relative mt-6">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Tìm theo tên tài liệu..."
                    className="h-[52px] w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-11 text-sm font-medium text-slate-700 outline-none transition focus:border-[#5D9CEC] focus:ring-4 focus:ring-[#5D9CEC]/12"
                />
                {searchQuery && (
                    <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                        aria-label="Xóa tìm kiếm"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            <div className="mt-5 space-y-3">
                {loadingDocs ? (
                    <div className="flex items-center justify-center gap-3 py-12 text-sm font-semibold text-slate-500">
                        <Loader2 className="h-5 w-5 animate-spin text-[#5D9CEC]" />
                        Đang tải tài liệu...
                    </div>
                ) : docsError ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-500">{docsError}</div>
                ) : filteredDocuments.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
                        <Library className="mx-auto h-8 w-8 text-slate-300" />
                        <p className="mt-3 text-sm font-semibold text-slate-600">Chưa có tài liệu phù hợp</p>
                    </div>
                ) : (
                    filteredDocuments.map((doc) => (
                        <button
                            key={doc.id}
                            type="button"
                            onClick={() => handleDocumentAction(doc)}
                            className="group flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-[#BFD8FA] hover:shadow-[0_14px_38px_rgba(93,156,236,0.12)]"
                        >
                            <span className="flex min-w-0 items-center gap-4">
                                <span className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-[#F0F7FF] text-[#5D9CEC]">
                                    <FileText className="h-5 w-5" />
                                </span>
                                <span className="min-w-0">
                                    <span className="block truncate text-sm font-bold text-slate-800">{extractFileName(doc)}</span>
                                    <span className="mt-1 flex items-center gap-1 text-xs font-medium text-slate-400">
                                        <Clock className="h-3 w-3" />
                                        {doc.uploadedAt
                                            ? new Date(doc.uploadedAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' })
                                            : 'Mới tải lên'}
                                    </span>
                                </span>
                            </span>
                            <ArrowRight className="h-4 w-4 flex-none text-slate-300 transition group-hover:text-[#5D9CEC]" />
                        </button>
                    ))
                )}
            </div>
        </section>
    );

    const renderUpload = () => (
        <section className="teacher-upload-shell" aria-label="Tải tài liệu">
            <div className="teacher-upload-dropzone">
                <UploadIllustration />
                <div className="min-w-0">
                    <h2 className="text-2xl font-extrabold tracking-[-0.02em] text-slate-950">
                        Biến tài liệu thành hoạt động tương tác
                    </h2>
                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                        Tải lên PDF, DOCX hoặc PPTX. Mascoteach sẽ chuẩn bị nội dung để tạo trắc nghiệm hoặc thẻ ôn tập.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-3">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx,.pptx"
                            className="hidden"
                            onChange={handleDirectUpload}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#1E293B] px-5 py-3 text-sm font-bold text-white shadow-[0_14px_34px_rgba(30,41,59,0.18)] transition hover:-translate-y-0.5"
                        >
                            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CloudUpload className="h-4 w-4" />}
                            {isUploading ? 'Đang tải lên...' : 'Tải lên tài liệu'}
                        </button>
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:border-[#BFD8FA] hover:text-[#5D9CEC]"
                        >
                            <img src="/images/Google_Drive.svg" alt="" className="h-5 w-5" aria-hidden="true" />
                            Google Drive
                        </button>
                    </div>
                    {uploadError && (
                        <p className="mt-3 text-sm font-semibold text-rose-500">
                            {uploadError}
                        </p>
                    )}
                    {isUploading && (
                        <div className="mt-4 max-w-sm">
                            <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-500">
                                <span>Đang tải tài liệu</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                <div
                                    className="h-full rounded-full bg-[#5D9CEC] transition-all duration-300 ease-out"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );

    const content = {
        create: renderCreate,
        search: renderSearch,
        upload: renderUpload,
    };

    return (
        <>
            <div className="teacher-home">
                <header className="teacher-hero">
                    <p className="text-[15px] font-semibold text-slate-600">
                        {greeting}, {displayName}. Bắt đầu nhé.
                    </p>

                    <nav className="teacher-tab-strip" aria-label="Chức năng chính">
                        {TABS.map(({ id, label, hint, Icon }) => {
                            const active = activeTab === id;
                            return (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => setActiveTab(id)}
                                    className={`teacher-tab-card ${active ? 'is-active' : ''}`}
                                >
                                    <span className="teacher-tab-icon">
                                        <Icon className="h-5 w-5" />
                                    </span>
                                    <span className="text-sm font-extrabold">{label}</span>
                                    <span className="text-xs font-semibold text-slate-400">{hint}</span>
                                </button>
                            );
                        })}
                    </nav>
                </header>

                <div className="teacher-content animate-fade-slide-up" key={activeTab}>
                    {content[activeTab]()}
                </div>

                {recentSessions.length > 0 && (
                    <section className="mx-auto mt-10 max-w-4xl">
                        <h2 className="mb-3 text-sm font-extrabold uppercase tracking-[0.1em] text-slate-400">Hoạt động gần đây</h2>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {recentSessions.map((session) => (
                                <article key={session.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                                    <p className="text-sm font-bold text-slate-800">{session.title || `Phiên #${session.id}`}</p>
                                    <p className="mt-1 text-xs font-medium text-slate-400">{session.participants || 0} học sinh đã tham gia</p>
                                </article>
                            ))}
                        </div>
                    </section>
                )}
                {loadingSessions && null}
            </div>

            {selectedDoc && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/20 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm font-extrabold text-slate-900">{extractFileName(selectedDoc)}</p>
                                <p className="mt-1 text-xs font-medium text-slate-400">Chọn định dạng muốn tạo</p>
                            </div>
                            <button type="button" onClick={() => setSelectedDoc(null)} className="text-slate-400">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="mt-5 grid gap-3">
                            {ACTIVITY_TYPES.map((type) => (
                                <ActivityCard key={type.id} type={type} onSelect={handleTypeSelection} />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {pendingUpload && !selectedType && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 px-4 py-6 backdrop-blur-sm">
                    <div className="teacher-resource-modal" role="dialog" aria-modal="true" aria-labelledby="resource-modal-title">
                        <header className="teacher-resource-modal__header">
                            <div className="flex items-center gap-3">
                                <span className="teacher-resource-sparkle">
                                    <Sparkles className="h-7 w-7" />
                                </span>
                                <h2 id="resource-modal-title" className="text-[22px] font-extrabold tracking-[-0.02em] text-slate-950">
                                    Tạo hoạt động học tập
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setPendingUpload(null)}
                                className="teacher-resource-close"
                                aria-label="Đóng"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </header>

                        <div className="teacher-resource-modal__body">
                            <div className="teacher-resource-timeline" aria-hidden="true">
                                <span className="teacher-resource-dot teacher-resource-dot--file" />
                                <span className="teacher-resource-line" />
                                <span className="teacher-resource-dot teacher-resource-dot--active" />
                            </div>

                            <div className="teacher-resource-file-row">
                                <span className="teacher-resource-file-icon">
                                    <FileText className="h-4 w-4" />
                                </span>
                                <span className="min-w-0 truncate text-sm font-semibold text-slate-500">
                                    {pendingUpload.fileName}
                                </span>
                                <button type="button" className="teacher-resource-edit" aria-label="Đổi tên tài liệu">
                                    <PencilLine className="h-4 w-4" />
                                </button>
                            </div>

                            <section className="teacher-resource-section">
                                <p className="teacher-resource-section__title">Chọn loại nội dung</p>
                                <div className="teacher-resource-grid">
                                    {ACTIVITY_TYPES.map((type) => {
                                        const active = pendingType === type.id;
                                        return (
                                            <button
                                                key={type.id}
                                                type="button"
                                                onClick={() => setPendingType(type.id)}
                                                className={`teacher-resource-card ${active ? 'is-selected' : ''}`}
                                            >
                                                <span className={`teacher-resource-card__icon ${type.color}`}>
                                                    <type.Icon className="h-10 w-10" />
                                                </span>
                                                <span className="teacher-resource-card__label">{type.label}</span>
                                                <span className="teacher-resource-card__description">
                                                    {type.id === 'quiz'
                                                        ? 'Câu hỏi nhanh và tương tác'
                                                        : 'Thẻ ghi nhớ để ôn tập'}
                                                </span>
                                                {active && (
                                                    <span className="teacher-resource-card__check">
                                                        <CheckCircle2 className="h-5 w-5" />
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </section>
                        </div>

                        <footer className="teacher-resource-modal__footer">
                            <p>AI có thể mắc lỗi. Hãy xem lại và tùy chỉnh hoạt động trước khi dùng trong lớp.</p>
                            <button
                                type="button"
                                className="teacher-resource-next"
                                onClick={() => {
                                    navigateToCustomizer(pendingUpload, pendingType);
                                    setPendingUpload(null);
                                }}
                            >
                                Tiếp tục
                            </button>
                        </footer>
                    </div>
                </div>
            )}

            {false && pendingUpload && !selectedType && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/20 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm font-extrabold text-slate-900">
                                    {pendingUpload.fileName}
                                </p>
                                <p className="mt-1 text-xs font-medium text-slate-400">
                                    Tài liệu đã tải lên. Chọn định dạng muốn tạo.
                                </p>
                            </div>
                            <button type="button" onClick={() => setPendingUpload(null)} className="text-slate-400">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            {ACTIVITY_TYPES.map((type) => (
                                <ActivityCard
                                    key={type.id}
                                    type={type}
                                    onSelect={(typeId) => {
                                        navigateToCustomizer(pendingUpload, typeId);
                                        setPendingUpload(null);
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
