import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Clock, Users, Play, FileText, Sparkles, Search,
    CloudUpload, Loader2, AlertCircle, ArrowRight, CheckCircle2,
    X, ListChecks
} from 'lucide-react';
import CreateFlowModal from '@/components/portal/create/CreateFlowModal';
import { useAuth } from '@/contexts/AuthContext';
import { getMySessions } from '@/services/liveSessionService';
import { getMyDocuments } from '@/services/documentService';

/* ── Tab definitions ── */
const TABS = [
    { id: 'create', label: 'Tạo mới', Icon: Sparkles },
    { id: 'search', label: 'Tìm kiếm', Icon: Search },
    { id: 'upload', label: 'Tải lên', Icon: CloudUpload },
];

/* ── Activity types available (only Quiz for now) ── */
const ACTIVITY_TYPES = [
    {
        id: 'quiz',
        label: 'Trắc nghiệm',
        description: 'Tạo bộ câu hỏi trắc nghiệm từ tài liệu bằng AI',
        Icon: ListChecks,
        color: 'sky',
        available: true,
    },
];

const RECENT_DOCS_LIMIT = 5;

/**
 * Extract a human-readable file name from an S3 key or file URL.
 * E.g. "uploads/abc123-lecture_notes.pdf" → "lecture_notes.pdf"
 */
function extractFileName(doc) {
    if (doc.title) return doc.title;
    if (doc.fileName) return doc.fileName;
    const raw = doc.s3Key || doc.fileUrl || '';
    const segments = raw.split('/');
    const last = segments[segments.length - 1] || '';
    // Strip leading UUID prefix (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx-)
    const withoutUuid = last.replace(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-?/i,
        '',
    );
    return withoutUuid || last || `Tài liệu #${doc.id}`;
}

export default function HomePage() {
    const navigate = useNavigate();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [activeTab, setActiveTab] = useState('search');
    const [animKey, setAnimKey] = useState(0);

    // ── Sessions ──
    const [recentSessions, setRecentSessions] = useState([]);
    const [loadingSessions, setLoadingSessions] = useState(true);
    const [sessionsError, setSessionsError] = useState(null);

    // ── Documents ──
    const [documents, setDocuments] = useState([]);
    const [loadingDocs, setLoadingDocs] = useState(true);
    const [docsError, setDocsError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // ── Document → Activity type selection (overlay) ──
    const [selectedDoc, setSelectedDoc] = useState(null);

    // ── Create flow: step-based ──
    const [createStep, setCreateStep] = useState('type'); // 'type' | 'document'
    const [selectedType, setSelectedType] = useState(null);

    const { user } = useAuth();
    const displayName = user?.fullName || user?.name || 'Giáo viên';

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 17 ? 'Chào buổi chiều' : 'Chào buổi tối';

    // ── Fetch sessions ──
    useEffect(() => {
        async function fetchSessions() {
            try {
                setLoadingSessions(true);
                const data = await getMySessions();
                setRecentSessions(Array.isArray(data) ? data.slice(0, 5) : []);
            } catch (err) {
                setSessionsError(err.message || 'Không thể tải hoạt động gần đây');
            } finally {
                setLoadingSessions(false);
            }
        }
        fetchSessions();
    }, []);

    // ── Fetch user documents ──
    useEffect(() => {
        async function fetchDocs() {
            try {
                setLoadingDocs(true);
                const data = await getMyDocuments();
                const docs = Array.isArray(data) ? data.filter((d) => !d.isDeleted) : [];
                // Sort by uploadedAt descending (newest first)
                docs.sort((a, b) => new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0));
                setDocuments(docs);
            } catch (err) {
                setDocsError(err.message || 'Không thể tải tài liệu');
            } finally {
                setLoadingDocs(false);
            }
        }
        fetchDocs();
    }, []);

    // ── Re-trigger mount animation when tab changes ──
    useEffect(() => {
        setAnimKey((k) => k + 1);
    }, [activeTab]);

    // ── Reset create step when switching away from create tab ──
    useEffect(() => {
        if (activeTab !== 'create') {
            setCreateStep('type');
            setSelectedType(null);
        }
    }, [activeTab]);

    // ── Filtered documents for search ──
    const filteredDocuments = useMemo(() => {
        if (!searchQuery.trim()) return documents.slice(0, RECENT_DOCS_LIMIT);
        const q = searchQuery.toLowerCase().trim();
        return documents.filter((doc) => {
            const name = extractFileName(doc).toLowerCase();
            return name.includes(q);
        });
    }, [documents, searchQuery]);

    // ── Navigate to quiz settings with a doc ──
    function navigateToQuizSettings(doc) {
        navigate('/teacher/quiz-settings', {
            state: {
                fileName: extractFileName(doc),
                documentId: doc.id,
                fileUrl: doc.presignedUrl || null,
            },
        });
    }

    // ── Handle document click from search (show type picker) ──
    function handleDocClickFromSearch(doc) {
        setSelectedDoc(doc);
    }

    // ── Handle type selection from search overlay ──
    function handleTypeFromSearch(typeId) {
        if (typeId === 'quiz' && selectedDoc) {
            navigateToQuizSettings(selectedDoc);
        }
        setSelectedDoc(null);
    }

    // ── Handle document click from create flow step 2 ──
    function handleDocClickFromCreate(doc) {
        if (selectedType === 'quiz') {
            navigateToQuizSettings(doc);
        }
    }

    /* SEARCH TAB — Quick actions: recent docs + search */
    const renderSearchContent = () => (
        <section aria-label="Tìm kiếm tài liệu" className="space-y-6">
            {/* Search bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm tài liệu theo tên..."
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200
                               bg-white text-sm text-slate-700 placeholder:text-slate-400
                               focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300
                               transition-all duration-200"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400
                                   hover:text-slate-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Section title */}
            <div className="flex items-center justify-between">
                <h2 className="text-[14px] font-semibold text-slate-600">
                    {searchQuery.trim()
                        ? `Kết quả tìm kiếm "${searchQuery}"`
                        : 'Tài liệu gần đây'}
                </h2>
                {!searchQuery.trim() && documents.length > RECENT_DOCS_LIMIT && (
                    <span className="text-[12px] text-slate-400">
                        {RECENT_DOCS_LIMIT} / {documents.length} tài liệu
                    </span>
                )}
            </div>

            {/* Document list */}
            {loadingDocs ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 text-sky-500 animate-spin" />
                    <span className="ml-3 text-sm text-slate-400">Đang tải tài liệu...</span>
                </div>
            ) : docsError ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <AlertCircle className="w-8 h-8 text-slate-300 mb-3" />
                    <p className="text-sm text-slate-400">{docsError}</p>
                </div>
            ) : filteredDocuments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                        <FileText className="w-7 h-7 text-slate-300" />
                    </div>
                    {searchQuery.trim() ? (
                        <>
                            <h3 className="text-[14px] font-medium text-slate-500 mb-1">
                                Không tìm thấy tài liệu
                            </h3>
                            <p className="text-[13px] text-slate-400">
                                Thử tìm kiếm với từ khóa khác
                            </p>
                        </>
                    ) : (
                        <>
                            <h3 className="text-[14px] font-medium text-slate-500 mb-1">
                                Chưa có tài liệu nào
                            </h3>
                            <p className="text-[13px] text-slate-400 mb-4">
                                Tải lên tài liệu để bắt đầu tạo quiz
                            </p>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="px-5 py-2.5 rounded-xl text-[13px] font-semibold
                                           bg-sky-500 text-white hover:bg-sky-600
                                           transition-all duration-200 cursor-pointer"
                            >
                                Tải lên tài liệu
                            </button>
                        </>
                    )}
                </div>
            ) : (
                <div className="space-y-2">
                    {filteredDocuments.map((doc) => {
                        const name = extractFileName(doc);
                        return (
                            <article
                                key={doc.id}
                                onClick={() => handleDocClickFromSearch(doc)}
                                className="flex items-center justify-between p-4 rounded-xl
                                           border border-slate-100/80 bg-white
                                           hover:border-sky-200 hover:bg-sky-50/30
                                           hover:shadow-sm
                                           transition-all duration-200 group cursor-pointer"
                            >
                                <div className="flex items-center gap-4 min-w-0 flex-1">
                                    <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center
                                                    justify-center flex-shrink-0
                                                    group-hover:bg-sky-100 transition-colors">
                                        <FileText className="w-5 h-5 text-sky-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-[13px] font-medium text-slate-700
                                                       group-hover:text-sky-700 transition-colors
                                                       truncate">
                                            {name}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            {doc.uploadedAt && (
                                                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(doc.uploadedAt).toLocaleDateString('vi-VN', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                    })}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-sky-500
                                                       transition-colors flex-shrink-0" />
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );

    /* CREATE TAB — Step 1: choose type, Step 2: choose document */
    const renderCreateContent = () => (
        <section aria-label="Tạo mới" className="space-y-6">
            {/* Step indicator */}
            <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-semibold
                                transition-all duration-200
                                ${createStep === 'type'
                        ? 'bg-sky-100 text-sky-700 border border-sky-200'
                        : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}
                >
                    {createStep === 'type' ? (
                        <span className="w-5 h-5 rounded-full bg-sky-500 text-white
                                         flex items-center justify-center text-[11px] font-bold">1</span>
                    ) : (
                        <CheckCircle2 className="w-4 h-4" />
                    )}
                    Chọn loại
                </div>
                <div className="w-6 h-px bg-slate-200" />
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-semibold
                                transition-all duration-200
                                ${createStep === 'document'
                        ? 'bg-sky-100 text-sky-700 border border-sky-200'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center
                                      text-[11px] font-bold
                                      ${createStep === 'document'
                            ? 'bg-sky-500 text-white'
                            : 'bg-slate-300 text-white'
                        }`}>2</span>
                    Chọn tài liệu
                </div>
            </div>

            {/* Step 1: Choose activity type */}
            {createStep === 'type' && (
                <div className="space-y-3">
                    <p className="text-[13px] text-slate-500">
                        Chọn loại nội dung bạn muốn tạo từ tài liệu
                    </p>
                    <div className="grid gap-3">
                        {ACTIVITY_TYPES.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => {
                                    if (!type.available) return;
                                    setSelectedType(type.id);
                                    setCreateStep('document');
                                }}
                                disabled={!type.available}
                                className={`flex items-center gap-4 p-5 rounded-xl border-2
                                           text-left transition-all duration-200 group
                                           ${type.available
                                        ? 'border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50/40 hover:shadow-sm cursor-pointer'
                                        : 'border-slate-100 bg-slate-50/50 cursor-not-allowed opacity-60'
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center
                                                flex-shrink-0 transition-colors
                                                ${type.available
                                        ? 'bg-sky-50 group-hover:bg-sky-100'
                                        : 'bg-slate-100'
                                    }`}>
                                    <type.Icon className={`w-6 h-6 ${type.available ? 'text-sky-500' : 'text-slate-400'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className={`text-[14px] font-semibold mb-0.5
                                                   ${type.available
                                            ? 'text-slate-700 group-hover:text-sky-700'
                                            : 'text-slate-400'
                                        }`}>
                                        {type.label}
                                    </h3>
                                    <p className="text-[12px] text-slate-400">
                                        {type.description}
                                    </p>
                                </div>
                                <ArrowRight className={`w-5 h-5 flex-shrink-0 transition-colors
                                                       ${type.available
                                        ? 'text-slate-300 group-hover:text-sky-500'
                                        : 'text-slate-200'
                                    }`} />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 2: Choose document */}
            {createStep === 'document' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-[13px] text-slate-500">
                            Chọn tài liệu để tạo <span className="font-semibold text-sky-600">
                                {ACTIVITY_TYPES.find((t) => t.id === selectedType)?.label}
                            </span>
                        </p>
                        <button
                            onClick={() => {
                                setCreateStep('type');
                                setSelectedType(null);
                            }}
                            className="text-[12px] text-slate-400 hover:text-slate-600
                                       transition-colors cursor-pointer"
                        >
                            ← Quay lại
                        </button>
                    </div>

                    {/* Option to upload new doc */}
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-3 w-full p-4 rounded-xl
                                   border-2 border-dashed border-slate-200
                                   bg-slate-50/50 hover:border-sky-300 hover:bg-sky-50/30
                                   transition-all duration-200 cursor-pointer group"
                    >
                        <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center
                                        group-hover:bg-sky-100 transition-colors">
                            <Plus className="w-5 h-5 text-sky-500" />
                        </div>
                        <div className="text-left">
                            <p className="text-[13px] font-medium text-slate-600
                                          group-hover:text-sky-700 transition-colors">
                                Tải lên tài liệu mới
                            </p>
                            <p className="text-[11px] text-slate-400">PDF, DOCX, PPTX</p>
                        </div>
                    </button>

                    {/* Existing documents */}
                    {loadingDocs ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-5 h-5 text-sky-500 animate-spin" />
                            <span className="ml-3 text-sm text-slate-400">Đang tải...</span>
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="flex flex-col items-center py-12 text-center">
                            <FileText className="w-8 h-8 text-slate-300 mb-3" />
                            <p className="text-[13px] text-slate-400">
                                Chưa có tài liệu. Hãy tải lên tài liệu mới.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-[12px] text-slate-400 font-medium">
                                Hoặc chọn tài liệu có sẵn
                            </p>
                            {documents.map((doc) => {
                                const name = extractFileName(doc);
                                return (
                                    <article
                                        key={doc.id}
                                        onClick={() => handleDocClickFromCreate(doc)}
                                        className="flex items-center justify-between p-4 rounded-xl
                                                   border border-slate-100/80 bg-white
                                                   hover:border-sky-200 hover:bg-sky-50/30
                                                   hover:shadow-sm
                                                   transition-all duration-200 group cursor-pointer"
                                    >
                                        <div className="flex items-center gap-4 min-w-0 flex-1">
                                            <div className="w-10 h-10 rounded-lg bg-sky-50
                                                            flex items-center justify-center flex-shrink-0
                                                            group-hover:bg-sky-100 transition-colors">
                                                <FileText className="w-5 h-5 text-sky-500" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-[13px] font-medium text-slate-700
                                                               group-hover:text-sky-700 transition-colors
                                                               truncate">
                                                    {name}
                                                </h3>
                                                {doc.uploadedAt && (
                                                    <span className="flex items-center gap-1 mt-1
                                                                     text-[11px] text-slate-400">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(doc.uploadedAt).toLocaleDateString('vi-VN', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                        })}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-slate-300
                                                               group-hover:text-sky-500
                                                               transition-colors flex-shrink-0" />
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </section>
    );

    /* UPLOAD TAB — drag & drop (existing) */
    const renderUploadContent = () => (
        <section aria-label="Tải lên">
            <div className="flex flex-col items-center justify-center py-16 px-6
                            rounded-2xl border-2 border-dashed border-slate-200
                            bg-slate-50/50 hover:border-sky-300 hover:bg-sky-50/30
                            transition-all duration-300 cursor-pointer group">
                <div className="w-14 h-14 rounded-2xl bg-sky-50 flex items-center justify-center mb-4
                                group-hover:bg-sky-100 transition-colors duration-300">
                    <CloudUpload className="w-7 h-7 text-sky-500" />
                </div>
                <p className="text-[15px] font-semibold text-slate-700 mb-1">
                    Tải lên tài liệu của bạn
                </p>
                <p className="text-[13px] text-slate-400 mb-5">
                    Kéo thả hoặc nhấn để chọn PDF, DOCX, PPTX
                </p>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-5 py-2.5 rounded-xl text-[13px] font-semibold
                               bg-sky-500 text-white shadow-gamma-btn
                               hover:bg-sky-600 hover:shadow-gamma-btn-hover
                               transition-all duration-200 cursor-pointer"
                >
                    Chọn tệp
                </button>
            </div>
        </section>
    );

    const contentMap = {
        search: renderSearchContent,
        create: renderCreateContent,
        upload: renderUploadContent,
    };

    return (
        <>
            <div className="space-y-10">
                {/* ── Centered Hero / Greeting ── */}
                <header className="flex flex-col items-center text-center pt-4">
                    <h1 className="text-2xl font-bold text-slate-800">
                        {greeting}, {displayName} 👋
                    </h1>
                    <p className="text-sm text-slate-400 mt-1.5 max-w-md">
                        Bắt đầu tạo quiz hoặc xem lại hoạt động gần đây.
                    </p>
                </header>

                {/* ── Compact Tab Row ── */}
                <nav aria-label="Chức năng chính" className="flex justify-center">
                    <div className="inline-flex items-center gap-1 p-1.5 rounded-2xl bg-slate-100/60">
                        {TABS.map(({ id, label, Icon }) => {
                            const isActive = activeTab === id;
                            return (
                                <button
                                    key={id}
                                    onClick={() => setActiveTab(id)}
                                    className={`
                                        relative flex flex-col items-center gap-1 px-6 py-3 rounded-xl
                                        text-[13px] font-medium transition-all duration-250 cursor-pointer
                                        ${isActive
                                            ? 'bg-white text-sky-600 shadow-gamma-soft border-b-2 border-sky-500'
                                            : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                                        }
                                    `}
                                >
                                    <Icon className={`w-5 h-5 transition-colors duration-250 ${isActive ? 'text-sky-500' : 'text-slate-400'}`} />
                                    <span>{label}</span>
                                </button>
                            );
                        })}
                    </div>
                </nav>

                {/* ── Dynamic Content Area (animated) ── */}
                <div
                    key={animKey}
                    className="animate-fade-slide-up"
                >
                    {contentMap[activeTab]()}
                </div>
            </div>

            {/* ── Create Flow Modal ── */}
            {showCreateModal && (
                <CreateFlowModal onClose={() => setShowCreateModal(false)} />
            )}

            {/* ── Activity Type Selection Overlay ── */}
            {selectedDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                        onClick={() => setSelectedDoc(null)}
                        aria-hidden="true"
                    />

                    {/* Modal */}
                    <div className="relative w-full max-w-md bg-white rounded-2xl
                                    border border-slate-200/80 shadow-xl overflow-hidden
                                    animate-in"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Chọn loại nội dung"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5
                                        border-b border-slate-100/60">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center
                                                justify-center flex-shrink-0">
                                    <FileText className="w-[18px] h-[18px] text-sky-500" />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-[14px] font-bold text-slate-800 truncate">
                                        {extractFileName(selectedDoc)}
                                    </h2>
                                    <p className="text-[12px] text-slate-400 mt-0.5">
                                        Chọn loại nội dung muốn tạo
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedDoc(null)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center
                                           text-slate-400 hover:text-slate-600 hover:bg-slate-100
                                           transition-all duration-200"
                                aria-label="Đóng"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Activity type options */}
                        <div className="px-6 py-5 space-y-3">
                            {ACTIVITY_TYPES.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => handleTypeFromSearch(type.id)}
                                    disabled={!type.available}
                                    className={`flex items-center gap-4 w-full p-4 rounded-xl border-2
                                               text-left transition-all duration-200 group
                                               ${type.available
                                            ? 'border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50/40 hover:shadow-sm cursor-pointer'
                                            : 'border-slate-100 bg-slate-50/50 cursor-not-allowed opacity-60'
                                        }`}
                                >
                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center
                                                    flex-shrink-0 transition-colors
                                                    ${type.available
                                            ? 'bg-sky-50 group-hover:bg-sky-100'
                                            : 'bg-slate-100'
                                        }`}>
                                        <type.Icon className={`w-5 h-5 ${type.available ? 'text-sky-500' : 'text-slate-400'}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className={`text-[14px] font-semibold mb-0.5
                                                       ${type.available
                                                ? 'text-slate-700 group-hover:text-sky-700'
                                                : 'text-slate-400'
                                            }`}>
                                            {type.label}
                                        </h3>
                                        <p className="text-[12px] text-slate-400">
                                            {type.description}
                                        </p>
                                    </div>
                                    <ArrowRight className={`w-5 h-5 flex-shrink-0 transition-colors
                                                           ${type.available
                                            ? 'text-slate-300 group-hover:text-sky-500'
                                            : 'text-slate-200'
                                        }`} />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
