import { useState } from 'react';
import { Plus, Upload, Clock, Users, Play, FileText, Sparkles } from 'lucide-react';
import { teacherProfile, recentActivities } from '@/data/mockData';
import CreateFlowModal from '@/components/portal/create/CreateFlowModal';

/**
 * HomePage — "Trang chủ" — Redesigned dashboard
 * Layout: Greeting → Quick Actions (Wayground-style) → Recent Activities
 * Clean, spacious, minimalist with light sky blue accents
 */
export default function HomePage() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 17 ? 'Chào buổi chiều' : 'Chào buổi tối';

    return (
        <>
            <div className="space-y-10">
                {/* ── Greeting Header ── */}
                <header>
                    <h1 className="text-2xl font-bold text-slate-800">
                        {greeting}, {teacherProfile.name} 👋
                    </h1>
                    <p className="text-sm text-slate-400 mt-1.5">
                        Bắt đầu tạo quiz hoặc xem lại hoạt động gần đây.
                    </p>
                </header>

                {/* ── Quick Actions (Wayground-style) ── */}
                <section aria-label="Hành động nhanh">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Create New */}
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="group relative flex items-center gap-5 p-6 rounded-2xl
                                       border border-slate-200/80 bg-white
                                       hover:border-sky-300 hover:bg-sky-50/30
                                       transition-all duration-300 text-left cursor-pointer"
                        >
                            <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center
                                            group-hover:bg-sky-100 transition-colors duration-300 flex-shrink-0">
                                <Plus className="w-6 h-6 text-sky-500" />
                            </div>
                            <div>
                                <h3 className="text-[15px] font-semibold text-slate-700 group-hover:text-sky-600
                                               transition-colors duration-200">
                                    Tạo mới
                                </h3>
                                <p className="text-[13px] text-slate-400 mt-0.5">
                                    Tạo quiz với AI từ tài liệu của bạn
                                </p>
                            </div>
                            <Sparkles className="w-4 h-4 text-sky-300 absolute top-5 right-5
                                                 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </button>

                        {/* Upload */}
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="group relative flex items-center gap-5 p-6 rounded-2xl
                                       border border-slate-200/80 bg-white
                                       hover:border-sky-300 hover:bg-sky-50/30
                                       transition-all duration-300 text-left cursor-pointer"
                        >
                            <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center
                                            group-hover:bg-sky-100 transition-colors duration-300 flex-shrink-0">
                                <Upload className="w-6 h-6 text-sky-500" />
                            </div>
                            <div>
                                <h3 className="text-[15px] font-semibold text-slate-700 group-hover:text-sky-600
                                               transition-colors duration-200">
                                    Tải lên
                                </h3>
                                <p className="text-[13px] text-slate-400 mt-0.5">
                                    Tải lên PDF, Doc để bắt đầu
                                </p>
                            </div>
                            <FileText className="w-4 h-4 text-sky-300 absolute top-5 right-5
                                                 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </button>
                    </div>
                </section>

                {/* ── Recent Activities ── */}
                <section aria-label="Hoạt động gần đây">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-[15px] font-semibold text-slate-700">
                            Hoạt động gần đây
                        </h2>
                    </div>

                    <div className="space-y-2">
                        {recentActivities.map((activity) => (
                            <article
                                key={activity.id}
                                className="flex items-center justify-between p-4 rounded-xl
                                           border border-slate-100/80 bg-white
                                           hover:border-slate-200 hover:bg-slate-50/30
                                           transition-all duration-200 group cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0">
                                        {activity.action === 'đã chơi' ? (
                                            <Play className="w-4 h-4 text-sky-500" />
                                        ) : activity.action === 'đã tạo' ? (
                                            <Plus className="w-4 h-4 text-sky-500" />
                                        ) : (
                                            <FileText className="w-4 h-4 text-sky-500" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-[13px] font-medium text-slate-700 group-hover:text-slate-800
                                                       transition-colors">
                                            {activity.title}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md
                                                             bg-sky-50 text-sky-600 text-[11px] font-medium">
                                                {activity.mode}
                                            </span>
                                            <span className="text-[11px] text-slate-400">
                                                {activity.action}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-5 text-right">
                                    {activity.players && (
                                        <div className="flex items-center gap-1.5">
                                            <Users className="w-3.5 h-3.5 text-slate-400" />
                                            <span className="text-[12px] text-slate-500 font-medium">{activity.players}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="text-[12px] text-slate-400">
                                            {activity.time}
                                        </span>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </div>

            {/* ── Create Flow Modal ── */}
            {showCreateModal && (
                <CreateFlowModal onClose={() => setShowCreateModal(false)} />
            )}
        </>
    );
}
