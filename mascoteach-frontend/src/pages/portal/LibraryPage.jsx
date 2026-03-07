import { useState, useEffect } from 'react';
import { FileText, Edit3, Plus, Sparkles, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import CreateFlowModal from '@/components/portal/create/CreateFlowModal';
import { getMyDocuments, deleteDocument } from '@/services/documentService';

/**
 * LibraryPage — "Thư viện của tôi" — Main resource management
 * Now fetches real documents from the backend API
 * Wayground-inspired clean list with bordered cards
 */
export default function LibraryPage() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch documents from API
    useEffect(() => {
        fetchDocuments();
    }, []);

    async function fetchDocuments() {
        try {
            setLoading(true);
            setError(null);
            const data = await getMyDocuments();
            setDocuments(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || 'Không thể tải tài liệu');
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id) {
        if (!confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) return;
        try {
            await deleteDocument(id);
            setDocuments((prev) => prev.filter((doc) => doc.id !== id));
        } catch (err) {
            alert(err.message || 'Xóa thất bại');
        }
    }

    // Refresh documents when modal closes (in case a new document was created)
    function handleModalClose() {
        setShowCreateModal(false);
        fetchDocuments();
    }

    return (
        <>
            <div className="space-y-8">
                {/* ── Page Header ── */}
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            Thư viện
                        </h1>
                        <p className="text-sm text-slate-400 mt-1">
                            Quản lý tất cả tài liệu và tài nguyên của bạn
                        </p>
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl
                                   bg-sky-500 text-white text-[13px] font-semibold
                                   hover:bg-sky-600 transition-colors duration-200
                                   shadow-sm hover:shadow-md"
                    >
                        <Plus className="w-4 h-4" />
                        Thêm tài nguyên
                    </button>
                </header>

                {/* ── Document count ── */}
                {!loading && !error && (
                    <div className="flex items-center gap-1 border-b border-slate-100 pb-3">
                        <span className="px-4 py-3 text-[13px] font-medium border-b-2 border-sky-500 text-sky-600">
                            Tất cả
                            <span className="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5
                                             rounded-md text-[11px] font-semibold bg-sky-100 text-sky-600">
                                {documents.length}
                            </span>
                        </span>
                    </div>
                )}

                {/* ── Content Area ── */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-6 h-6 text-sky-500 animate-spin" />
                        <span className="ml-3 text-sm text-slate-400">Đang tải tài liệu...</span>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <AlertCircle className="w-10 h-10 text-slate-300 mb-3" />
                        <p className="text-sm text-slate-500 mb-4">{error}</p>
                        <button
                            onClick={fetchDocuments}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-sky-600 bg-sky-50
                                       hover:bg-sky-100 transition-colors"
                        >
                            Thử lại
                        </button>
                    </div>
                ) : documents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                            <FileText className="w-7 h-7 text-slate-300" />
                        </div>
                        <h3 className="text-[14px] font-medium text-slate-500 mb-1">
                            Chưa có tài nguyên nào
                        </h3>
                        <p className="text-[13px] text-slate-400 mb-4">
                            Bắt đầu bằng cách tải lên tài liệu mới
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-5 py-2.5 rounded-xl text-[13px] font-semibold
                                       bg-sky-500 text-white hover:bg-sky-600 transition-colors"
                        >
                            Tải lên tài liệu
                        </button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {documents.map((doc) => (
                            <article
                                key={doc.id}
                                className="flex items-center justify-between p-5 rounded-xl
                                           border border-slate-100/80 bg-white
                                           hover:border-slate-200 hover:bg-slate-50/30
                                           transition-all duration-200 group"
                            >
                                {/* Left: Icon + Info */}
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0">
                                        <FileText className="w-[18px] h-[18px] text-sky-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-[14px] font-medium text-slate-700 truncate
                                                       group-hover:text-slate-800 transition-colors">
                                            {doc.title || doc.fileName || doc.fileUrl?.split('/').pop() || `Tài liệu #${doc.id}`}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            {doc.fileUrl && (
                                                <span className="text-[12px] text-slate-400 truncate max-w-[200px]">
                                                    {doc.fileUrl.split('/').pop()}
                                                </span>
                                            )}
                                            {doc.isDeleted && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md
                                                                 bg-rose-50 text-rose-500 text-[11px] font-medium">
                                                    Đã xóa
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Date + Actions */}
                                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                                    {doc.createdAt && (
                                        <span className="text-[12px] text-slate-400 hidden sm:block">
                                            {new Date(doc.createdAt).toLocaleDateString('vi-VN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </span>
                                    )}
                                    <button
                                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg
                                                   border border-slate-200/80 bg-white
                                                   text-[12px] font-medium text-slate-500
                                                   hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50/50
                                                   transition-all duration-200"
                                    >
                                        <Edit3 className="w-3.5 h-3.5" />
                                        Chỉnh sửa
                                    </button>
                                    <button
                                        onClick={() => handleDelete(doc.id)}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg
                                                   border border-slate-200/80 bg-white
                                                   text-[12px] font-medium text-slate-400
                                                   hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50/50
                                                   transition-all duration-200"
                                        aria-label="Xóa tài liệu"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Create Flow Modal ── */}
            {showCreateModal && (
                <CreateFlowModal onClose={handleModalClose} />
            )}
        </>
    );
}
