import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
    Bell,
    CalendarClock,
    CreditCard,
    FileSearch,
    LayoutDashboard,
    ListChecks,
    UsersRound,
} from 'lucide-react';

const navItems = [
    { label: 'Tổng quan', path: '/admin', icon: LayoutDashboard },
    { label: 'Người dùng', path: '/admin/users', icon: UsersRound },
    { label: 'Nội dung', path: '/admin/content', icon: FileSearch },
    { label: 'Phiên trực tiếp', path: '/admin/sessions', icon: CalendarClock },
    { label: 'Thanh toán', path: '/admin/billing', icon: CreditCard },
    { label: 'Nhật ký thao tác', path: '/admin/audit-logs', icon: ListChecks },
];

const devNavItems = navItems.map((item) => ({
    ...item,
    path: item.path.replace('/admin', '/dev/admin'),
}));

const pageMeta = {
    '/admin': { title: 'Bảng điều khiển quản trị', eyebrow: 'Vận hành Mascoteach', description: 'Theo dõi người dùng, nội dung học tập, phiên trực tiếp và doanh thu.' },
    '/admin/users': { title: 'Người dùng', eyebrow: 'Quản lý người dùng', description: 'Quản lý giáo viên, vai trò, gói trả phí và hoạt động gần đây.' },
    '/admin/content': { title: 'Nội dung học tập', eyebrow: 'Theo dõi nội dung', description: 'Theo dõi tài liệu, bộ câu hỏi, thẻ ghi nhớ và trạng thái xử lý nội dung.' },
    '/admin/sessions': { title: 'Phiên trực tiếp', eyebrow: 'Theo dõi phiên trực tiếp', description: 'Theo dõi phiên đang chạy, PIN, học sinh tham gia và lỗi thời gian thực.' },
    '/admin/billing': { title: 'Thanh toán', eyebrow: 'Vận hành thanh toán', description: 'Theo dõi đơn hàng, doanh thu, trạng thái gói trả phí và các đơn cần đối soát.' },
    '/admin/audit-logs': { title: 'Nhật ký thao tác', eyebrow: 'Theo dõi thay đổi', description: 'Ghi nhận các thao tác quan trọng trên người dùng, thanh toán, nội dung và hạn mức.' },
};

function getMeta(pathname) {
    const normalized = pathname.replace('/dev/admin', '/admin');
    const matchedKey = Object.keys(pageMeta)
        .sort((a, b) => b.length - a.length)
        .find((key) => normalized === key || normalized.startsWith(`${key}/`));

    return pageMeta[matchedKey] || pageMeta['/admin'];
}

export function formatAdminValue(value) {
    const labels = {
        Admin: 'Quản trị viên',
        Teacher: 'Giáo viên',
        Student: 'Học sinh',
        Parent: 'Phụ huynh',
        Owner: 'Chủ sở hữu',
        Internal: 'Nội bộ',
        Free: 'Miễn phí',
        Freemium: 'Miễn phí',
        Premium: 'Gói trả phí',
        Expired: 'Gói trả phí đã hết hạn',
        'Pro Yearly': 'Gói năm',
        'Pro Monthly': 'Gói tháng',
        PRO_YEARLY: 'Gói năm',
        PRO_MONTHLY: 'Gói tháng',
        Active: 'Đang hoạt động bình thường',
        Deleted: 'Đã xóa/ẩn',
        Review: 'Cần quản trị viên rà soát',
        'Quota Risk': 'Sắp chạm hạn mức sử dụng',
        Document: 'Tài liệu',
        Flashcards: 'Thẻ ghi nhớ',
        Ready: 'Sẵn sàng tạo nội dung',
        Processing: 'Đang xử lý nội dung',
        Failed: 'Xử lý thất bại',
        Teacher_Approved: 'Giáo viên đã duyệt',
        AI_Drafted: 'Hệ thống đã tạo bản nháp',
        Published: 'Đã xuất bản',
        Live: 'Đang diễn ra',
        Waiting: 'Đang chờ bắt đầu',
        Ended: 'Đã kết thúc',
        'Realtime Issue': 'Có lỗi kết nối thời gian thực',
        'Classic Quiz': 'Bộ câu hỏi cơ bản',
        'Treasure Hunt': 'Săn kho báu',
        Adventure: 'Phiêu lưu',
        'AI Generated': 'Hệ thống tạo',
        Quiz: 'Bộ câu hỏi',
        Paid: 'Đã thanh toán và đã kích hoạt',
        'Paid Unsynced': 'Đã thanh toán, chưa kích hoạt gói',
        Cancelled: 'Đã hủy',
        Healthy: 'Hoạt động ổn định',
        Watch: 'Cần theo dõi thêm',
        Risk: 'Có rủi ro cần xử lý',
        Low: 'Rủi ro thấp',
        Medium: 'Rủi ro trung bình',
        High: 'Rủi ro cao',
        Open: 'Chưa xử lý',
        Investigating: 'Đang kiểm tra nguyên nhân',
        Required: 'Bắt buộc',
        Done: 'Hoàn tất',
        Pending: 'Đang chờ xử lý',
        Connected: 'Đang kết nối trong phiên',
        Reconnected: 'Đã kết nối lại',
        OK: 'Hoạt động bình thường',
        warning: 'Cảnh báo cần xử lý',
        critical: 'Nghiêm trọng, cần xử lý sớm',
        info: 'Thông tin tham khảo',
        'Quiz generation': 'Tạo bộ câu hỏi',
        'Flashcard generation': 'Tạo thẻ ghi nhớ',
        'Document parsing': 'Đọc tài liệu',
        'Retry queue': 'Hàng đợi thử lại',
    };

    return labels[value] || value;
}

export default function AdminLayout() {
    const location = useLocation();
    const isDevPreview = location.pathname.startsWith('/dev/admin');
    const items = isDevPreview ? devNavItems : navItems;
    const meta = getMeta(location.pathname);

    return (
        <div className="min-h-screen bg-[#F7FCFF] text-[#102744]">
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute left-[-8%] top-[-14%] h-[520px] w-[520px] rounded-full bg-white blur-3xl" />
                <div className="absolute right-[-10%] top-[8%] h-[560px] w-[560px] rounded-full bg-[#DCF4FF]/70 blur-3xl" />
                <div className="absolute bottom-[-18%] left-[12%] h-[520px] w-[640px] rounded-full bg-[#F8EEF4]/70 blur-3xl" />
            </div>

            <div className="relative flex min-h-screen w-full">
                <aside className="sticky top-0 hidden h-screen w-[300px] shrink-0 p-4 lg:block xl:w-[316px] xl:p-6">
                    <div className="flex h-full flex-col rounded-[30px] border border-[#E0EEF8] bg-white/90 p-3 shadow-[0_20px_55px_rgba(43,122,181,0.10)] backdrop-blur-xl">
                        <NavLink to={isDevPreview ? '/dev/admin' : '/admin'} className="mb-6 flex items-center px-2 pt-1">
                            <img src="/images/Logo_Redesign_Text.webp" alt="Mascoteach" className="h-12 w-auto max-w-[210px] object-contain" />
                        </NavLink>

                        <div className="space-y-1">
                            {items.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        end={item.path.endsWith('/admin')}
                                        className={({ isActive }) => [
                                            'flex items-center gap-3 rounded-[18px] px-4 py-3.5 text-sm font-black transition-all duration-200',
                                            isActive
                                                ? 'bg-[#173154] text-white shadow-[0_14px_30px_rgba(23,49,84,0.18)]'
                                                : 'text-[#60758D] hover:bg-[#F0F8FE] hover:text-[#102744]',
                                        ].join(' ')}
                                    >
                                        <Icon className="h-5 w-5" />
                                        {item.label}
                                    </NavLink>
                                );
                            })}
                        </div>

                        <div className="mt-auto" />
                    </div>
                </aside>

                <section className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-2 lg:py-6 xl:px-4 2xl:px-6">
                    <div className="mb-7 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,520px)] xl:items-start">
                        <div>
                            <div className="mb-4 flex items-center gap-3 lg:hidden">
                                <img src="/images/Logo_Redesign_Text.webp" alt="Mascoteach" className="h-10 w-auto" />
                                <span className="rounded-full border border-[#B9DFF3] bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-[#2B7AB5]">
                                    Quản trị
                                </span>
                            </div>
                            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#2B7AB5]">{meta.eyebrow}</p>
                            <h1 className="mt-2 text-[34px] font-black leading-tight text-[#071D35] sm:text-[42px]">{meta.title}</h1>
                            <p className="mt-2 max-w-3xl text-base font-semibold leading-7 text-[#5E7289]">{meta.description}</p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row xl:justify-end">
                            <button className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-[#E0EEF8] bg-white text-[#102744] shadow-[0_12px_28px_rgba(43,122,181,0.08)] transition hover:-translate-y-0.5">
                                <Bell className="h-5 w-5" />
                            </button>
                            <div className="flex h-14 shrink-0 items-center gap-3 rounded-full border border-[#E0EEF8] bg-white px-3 shadow-[0_12px_28px_rgba(43,122,181,0.08)]">
                                <div className="grid h-10 w-10 place-items-center rounded-full bg-[#173154] text-sm font-black text-white">AD</div>
                                <div className="hidden pr-2 sm:block">
                                    <p className="text-sm font-black text-[#102744]">Quản trị Mascoteach</p>
                                    <p className="text-xs font-bold text-[#6C8098]">Chủ sở hữu</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Outlet />
                </section>
            </div>
        </div>
    );
}

export function AdminCard({ children, className = '' }) {
    return (
        <div className={`rounded-[28px] border border-[#E0EEF8] bg-white/90 shadow-[0_18px_48px_rgba(43,122,181,0.08)] backdrop-blur-xl ${className}`}>
            {children}
        </div>
    );
}

export function AdminSectionHeader({ title, description, action }) {
    return (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
                <h2 className="text-2xl font-black text-[#071D35]">{title}</h2>
                {description && <p className="mt-1 text-sm font-semibold leading-6 text-[#6C8098]">{description}</p>}
            </div>
            {action}
        </div>
    );
}

export function StatusBadge({ value }) {
    const status = String(value || '').toLowerCase();
    const tone = status.includes('paid unsynced') || status.includes('critical') || status.includes('failed') || status.includes('risk') || status.includes('issue') || status.includes('deleted')
        ? 'border-[#FFD3D8] bg-[#FFF1F3] text-[#C2293A]'
        : status.includes('processing') || status.includes('pending') || status.includes('review') || status.includes('watch') || status.includes('quota') || status.includes('warning')
            ? 'border-[#FFE2B8] bg-[#FFF7E8] text-[#B76A00]'
            : status.includes('live') || status.includes('active') || status.includes('healthy') || status.includes('ready') || status.includes('paid')
                ? 'border-[#BFECD8] bg-[#EEFFF7] text-[#137A4B]'
                : 'border-[#D7E4F0] bg-[#F4F8FB] text-[#53677E]';

    return (
        <span className={`inline-flex items-center whitespace-nowrap rounded-full border px-3 py-1 text-xs font-black ${tone}`}>
            {formatAdminValue(value)}
        </span>
    );
}

export function AdminTable({ columns, rows, rowHref, emptyLabel = 'Chưa có dữ liệu' }) {
    return (
        <div className="overflow-hidden rounded-[24px] border border-[#D8E9F5] bg-white">
            <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-0">
                    <thead>
                        <tr className="bg-[#F8FCFF]">
                            {columns.map((column) => (
                                <th key={column.key} className="whitespace-nowrap px-5 py-4 text-left text-xs font-black uppercase tracking-[0.1em] text-[#60758D]">
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 ? (
                            <tr>
                                <td className="px-5 py-10 text-center text-sm font-bold text-[#6C8098]" colSpan={columns.length}>{emptyLabel}</td>
                            </tr>
                        ) : rows.map((row) => {
                            const href = rowHref?.(row);
                            const content = columns.map((column) => (
                                <td key={column.key} className="border-t border-[#E5F0F8] px-5 py-4 text-sm font-bold text-[#243B55]">
                                    {column.render ? column.render(row) : formatAdminValue(row[column.key])}
                                </td>
                            ));

                            return href ? (
                                <tr
                                    key={row.id}
                                    className="cursor-pointer transition hover:bg-[#F7FCFF]"
                                    onClick={() => { window.location.href = href; }}
                                >
                                    {content}
                                </tr>
                            ) : (
                                <tr key={row.id} className="transition hover:bg-[#F7FCFF]">
                                    {content}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function MiniMetric({ label, value, icon: Icon, tone = 'blue' }) {
    const tones = {
        blue: 'bg-[#EEF8FF] text-[#2B7AB5]',
        navy: 'bg-[#EEF3FA] text-[#1B3A6B]',
        green: 'bg-[#F1FFF8] text-[#137A4B]',
        orange: 'bg-[#FFF7EF] text-[#CF5B1B]',
        red: 'bg-[#FFF4F6] text-[#C2293A]',
    };

    return (
        <div className="rounded-[22px] border border-[#D8E9F5] bg-white p-4">
            <div className={`grid h-11 w-11 place-items-center rounded-2xl ${tones[tone] || tones.blue}`}>
                <Icon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-2xl font-black text-[#071D35]">{value}</p>
            <p className="mt-1 text-sm font-bold text-[#6C8098]">{label}</p>
        </div>
    );
}

export function ActionButton({ children, tone = 'primary', className = '', ...props }) {
    const styles = tone === 'danger'
        ? 'bg-[#FFF1F3] text-[#C2293A] hover:bg-[#FFE5E9]'
        : tone === 'ghost'
            ? 'bg-white text-[#102744] hover:bg-[#F3FAFF]'
            : 'bg-[#173154] text-white hover:bg-[#1B3A6B]';

    return (
        <button
            className={`inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-black shadow-[0_10px_28px_rgba(16,39,68,0.10)] transition hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 ${styles} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
