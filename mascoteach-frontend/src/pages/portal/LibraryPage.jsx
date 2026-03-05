import { useState } from 'react';
import { FileText, Edit3, Plus, Sparkles } from 'lucide-react';
import { libraryResources } from '@/data/mockData';
import CreateFlowModal from '@/components/portal/create/CreateFlowModal';

/**
 * LibraryPage — "Thư viện của tôi" — Main resource management
 * Tabs: Đã tạo (Created), Bản nháp (Drafts)
 * Wayground-inspired clean list with bordered cards
 */
const tabs = [
    { key: 'created', label: 'Đã tạo', count: libraryResources.created.length },
    { key: 'drafts', label: 'Bản nháp', count: libraryResources.drafts.length },
];

export default function LibraryPage() {
    const [activeTab, setActiveTab] = useState('created');
    const [showCreateModal, setShowCreateModal] = useState(false);

    const currentResources = activeTab === 'created'
        ? libraryResources.created
        : libraryResources.drafts;

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
                            Quản lý tất cả quiz và tài nguyên của bạn
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

                {/* ── Tabs ── */}
                <nav className="flex items-center gap-1 border-b border-slate-100">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-3 text-[13px] font-medium border-b-2 transition-all duration-200
                                        ${activeTab === tab.key
                                    ? 'border-sky-500 text-sky-600'
                                    : 'border-transparent text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            {tab.label}
                            <span className={`ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5
                                              rounded-md text-[11px] font-semibold
                                              ${activeTab === tab.key
                                    ? 'bg-sky-100 text-sky-600'
                                    : 'bg-slate-100 text-slate-400'
                                }`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </nav>

                {/* ── Resource List ── */}
                <div className="space-y-2">
                    {currentResources.map((resource) => (
                        <article
                            key={resource.id}
                            className="flex items-center justify-between p-5 rounded-xl
                                       border border-slate-100/80 bg-white
                                       hover:border-slate-200 hover:bg-slate-50/30
                                       transition-all duration-200 group"
                        >
                            {/* Left: Icon + Info */}
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0">
                                    {resource.source === 'AI' ? (
                                        <Sparkles className="w-[18px] h-[18px] text-sky-500" />
                                    ) : (
                                        <FileText className="w-[18px] h-[18px] text-sky-500" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-[14px] font-medium text-slate-700 truncate
                                                   group-hover:text-slate-800 transition-colors">
                                        {resource.title}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <span className="text-[12px] text-slate-400">
                                            {resource.questionCount} câu hỏi
                                        </span>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md
                                                         bg-sky-50 text-sky-600 text-[11px] font-medium">
                                            {resource.grade}
                                        </span>
                                        {resource.source === 'AI' && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md
                                                             bg-violet-50 text-violet-500 text-[11px] font-medium">
                                                <Sparkles className="w-3 h-3" />
                                                AI
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Date + Edit button */}
                            <div className="flex items-center gap-5 flex-shrink-0 ml-4">
                                <span className="text-[12px] text-slate-400 hidden sm:block">
                                    {new Date(resource.createdAt).toLocaleDateString('vi-VN', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                    })}
                                </span>
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
                            </div>
                        </article>
                    ))}

                    {currentResources.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                                <FileText className="w-7 h-7 text-slate-300" />
                            </div>
                            <h3 className="text-[14px] font-medium text-slate-500 mb-1">
                                Chưa có tài nguyên nào
                            </h3>
                            <p className="text-[13px] text-slate-400">
                                Bắt đầu bằng cách tạo quiz mới
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Create Flow Modal ── */}
            {showCreateModal && (
                <CreateFlowModal onClose={() => setShowCreateModal(false)} />
            )}
        </>
    );
}
