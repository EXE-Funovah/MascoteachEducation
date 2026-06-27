import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
    Activity,
    Bell,
    CalendarClock,
    CreditCard,
    FileSearch,
    LayoutDashboard,
    LifeBuoy,
    ListChecks,
    Search,
    Settings,
    ShieldCheck,
    Sparkles,
    UsersRound,
} from 'lucide-react';

const navItems = [
    { label: 'Tổng quan', path: '/admin', icon: LayoutDashboard },
    { label: 'Người dùng', path: '/admin/users', icon: UsersRound },
    { label: 'Nội dung', path: '/admin/content', icon: FileSearch },
    { label: 'Phiên live', path: '/admin/sessions', icon: CalendarClock },
    { label: 'Thanh toán', path: '/admin/billing', icon: CreditCard },
    { label: 'AI usage', path: '/admin/ai-usage', icon: Sparkles },
    { label: 'Support', path: '/admin/support', icon: LifeBuoy },
    { label: 'Audit', path: '/admin/audit-logs', icon: ListChecks },
    { label: 'Cài đặt', path: '/admin/settings', icon: Settings },
];

const devNavItems = navItems.map((item) => ({
    ...item,
    path: item.path.replace('/admin', '/dev/admin'),
}));

const pageMeta = {
    '/admin': { title: 'Dashboard Admin', eyebrow: 'Mascoteach Operations', description: 'Theo dõi người dùng, nội dung AI, phiên live và doanh thu.' },
    '/admin/users': { title: 'Người dùng', eyebrow: 'User Management', description: 'Quản lý giáo viên, vai trò, gói Pro và hoạt động gần đây.' },
    '/admin/content': { title: 'Nội dung & AI', eyebrow: 'Content Monitoring', description: 'Theo dõi tài liệu, quiz, flashcard và trạng thái xử lý AI.' },
    '/admin/sessions': { title: 'Phiên live', eyebrow: 'Live Game Monitoring', description: 'Theo dõi phiên đang chạy, PIN, học sinh tham gia và lỗi realtime.' },
    '/admin/billing': { title: 'Thanh toán', eyebrow: 'Billing Operations', description: 'Theo dõi đơn hàng, doanh thu, trạng thái Pro và các đơn cần sync.' },
    '/admin/ai-usage': { title: 'AI usage & quota', eyebrow: 'AI Operations', description: 'Theo dõi lượt generate, lỗi AI, chi phí và quota người dùng.' },
    '/admin/support': { title: 'Support console', eyebrow: 'Customer Operations', description: 'Tra cứu user, timeline sự cố và các case cần xử lý.' },
    '/admin/audit-logs': { title: 'Audit logs', eyebrow: 'Security & Compliance', description: 'Ghi nhận hành động admin trên user, billing, content và quota.' },
    '/admin/settings': { title: 'Cài đặt Admin', eyebrow: 'System Settings', description: 'Feature flags, ngưỡng cảnh báo, quyền admin và quota mặc định.' },
};

function getMeta(pathname) {
    const normalized = pathname.replace('/dev/admin', '/admin');
    const matchedKey = Object.keys(pageMeta)
        .sort((a, b) => b.length - a.length)
        .find((key) => normalized === key || normalized.startsWith(`${key}/`));

    return pageMeta[matchedKey] || pageMeta['/admin'];
}

export default function AdminLayout() {
    const location = useLocation();
    const isDevPreview = location.pathname.startsWith('/dev/admin');
    const items = isDevPreview ? devNavItems : navItems;
    const meta = getMeta(location.pathname);

    return (
        <div className="min-h-screen bg-[#EAF6FF] text-[#102744]">
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute left-[-10%] top-[-15%] h-[420px] w-[420px] rounded-full bg-white/80 blur-3xl" />
                <div className="absolute right-[-8%] top-[12%] h-[460px] w-[460px] rounded-full bg-[#BFE8FA]/70 blur-3xl" />
                <div className="absolute bottom-[-18%] left-[20%] h-[420px] w-[520px] rounded-full bg-[#F7E7EC]/70 blur-3xl" />
            </div>

            <div className="relative mx-auto flex min-h-screen w-full max-w-[1540px] flex-col px-4 py-5 sm:px-6 lg:px-8">
                <header className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <NavLink to={isDevPreview ? '/dev/admin' : '/admin'} className="flex items-center gap-3">
                        <img src="/images/Logo_Redesign_Text.webp" alt="Mascoteach" className="h-10 w-auto" />
                        <span className="rounded-full border border-[#B9DFF3] bg-white/70 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-[#2B7AB5]">
                            Admin
                        </span>
                    </NavLink>

                    <nav className="flex max-w-full items-center gap-2 overflow-x-auto rounded-full border border-white/80 bg-white/70 p-2 shadow-[0_18px_50px_rgba(43,122,181,0.12)] backdrop-blur-xl">
                        {items.slice(0, 7).map((item) => {
                            const Icon = item.icon;
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.path.endsWith('/admin')}
                                    className={({ isActive }) => [
                                        'group grid h-12 w-12 flex-none place-items-center rounded-full text-[#52677F] transition-all duration-200 hover:bg-[#EAF6FF] hover:text-[#1B3A6B] sm:h-14 sm:w-14',
                                        isActive ? 'bg-[#102744] text-white shadow-[0_12px_28px_rgba(16,39,68,0.24)] hover:bg-[#102744] hover:text-white' : '',
                                    ].join(' ')}
                                    title={item.label}
                                >
                                    <Icon className="h-5 w-5" strokeWidth={2.3} />
                                </NavLink>
                            );
                        })}
                    </nav>

                    <div className="flex items-center justify-between gap-3 lg:justify-end">
                        <button className="grid h-12 w-12 place-items-center rounded-full border border-white/80 bg-white text-[#102744] shadow-[0_12px_28px_rgba(43,122,181,0.12)] transition hover:-translate-y-0.5">
                            <Bell className="h-5 w-5" />
                        </button>
                        <div className="flex items-center gap-3 rounded-full border border-white/80 bg-white px-3 py-2 shadow-[0_12px_28px_rgba(43,122,181,0.12)]">
                            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#102744] text-sm font-black text-white">AD</div>
                            <div className="hidden pr-2 sm:block">
                                <p className="text-sm font-black text-[#102744]">Admin Mascoteach</p>
                                <p className="text-xs font-bold text-[#6C8098]">Owner</p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="mt-7 grid flex-1 gap-6 lg:grid-cols-[236px_minmax(0,1fr)]">
                    <aside className="hidden rounded-[28px] border border-white/80 bg-white/72 p-3 shadow-[0_24px_70px_rgba(43,122,181,0.12)] backdrop-blur-xl lg:block">
                        <div className="space-y-1">
                            {items.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        end={item.path.endsWith('/admin')}
                                        className={({ isActive }) => [
                                            'flex items-center gap-3 rounded-[18px] px-4 py-3 text-sm font-black transition-all duration-200',
                                            isActive
                                                ? 'bg-[#102744] text-white shadow-[0_16px_32px_rgba(16,39,68,0.22)]'
                                                : 'text-[#566B83] hover:bg-[#EDF7FE] hover:text-[#102744]',
                                        ].join(' ')}
                                    >
                                        <Icon className="h-5 w-5" />
                                        {item.label}
                                    </NavLink>
                                );
                            })}
                        </div>

                        <div className="mt-8 rounded-[24px] bg-[#102744] p-5 text-white">
                            <div className="grid h-12 w-12 place-items-center rounded-full bg-white/12">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <p className="mt-4 text-base font-black">API readiness</p>
                            <p className="mt-2 text-sm font-semibold leading-6 text-white/72">
                                Các trang đang dùng mock data đúng shape để backend map endpoint sau.
                            </p>
                            <button className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-black text-[#102744]">
                                <Activity className="h-4 w-4" />
                                Xem contract
                            </button>
                        </div>
                    </aside>

                    <section className="min-w-0">
                        <div className="mb-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                            <div>
                                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#2B7AB5]">{meta.eyebrow}</p>
                                <h1 className="mt-2 text-[34px] font-black leading-tight text-[#071D35] sm:text-[42px]">{meta.title}</h1>
                                <p className="mt-2 max-w-3xl text-base font-semibold leading-7 text-[#5E7289]">{meta.description}</p>
                            </div>
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7790A8]" />
                                <input
                                    className="h-14 w-full rounded-full border border-white/80 bg-white/80 pl-12 pr-5 text-sm font-bold text-[#102744] outline-none shadow-[0_14px_36px_rgba(43,122,181,0.10)] placeholder:text-[#8EA1B4] focus:border-[#5BAED4] focus:ring-4 focus:ring-[#A8D8EA]/35"
                                    placeholder="Tìm user, tài liệu, PIN, đơn hàng..."
                                />
                            </div>
                        </div>

                        <Outlet />
                    </section>
                </main>
            </div>
        </div>
    );
}

export function AdminCard({ children, className = '' }) {
    return (
        <div className={`rounded-[28px] border border-white/80 bg-white/82 shadow-[0_22px_64px_rgba(43,122,181,0.10)] backdrop-blur-xl ${className}`}>
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
    const tone = status.includes('paid unsynced') || status.includes('critical') || status.includes('failed') || status.includes('risk') || status.includes('issue')
        ? 'border-[#FFD3D8] bg-[#FFF1F3] text-[#C2293A]'
        : status.includes('processing') || status.includes('pending') || status.includes('review') || status.includes('watch') || status.includes('quota')
            ? 'border-[#FFE2B8] bg-[#FFF7E8] text-[#B76A00]'
            : status.includes('live') || status.includes('active') || status.includes('healthy') || status.includes('ready') || status.includes('paid')
                ? 'border-[#BFECD8] bg-[#EEFFF7] text-[#137A4B]'
                : 'border-[#D7E4F0] bg-[#F4F8FB] text-[#53677E]';

    return (
        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-black ${tone}`}>
            {value}
        </span>
    );
}

export function AdminTable({ columns, rows, rowHref, emptyLabel = 'Chưa có dữ liệu' }) {
    return (
        <div className="overflow-hidden rounded-[24px] border border-[#D8E9F5] bg-white">
            <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-0">
                    <thead>
                        <tr className="bg-[#F4FAFE]">
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
                                    {column.render ? column.render(row) : row[column.key]}
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
        blue: 'bg-[#EAF6FF] text-[#2B7AB5]',
        navy: 'bg-[#E8EEF8] text-[#1B3A6B]',
        green: 'bg-[#EEFFF7] text-[#137A4B]',
        orange: 'bg-[#FFF4EA] text-[#CF5B1B]',
        red: 'bg-[#FFF1F3] text-[#C2293A]',
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

export function ActionButton({ children, tone = 'primary' }) {
    const styles = tone === 'danger'
        ? 'bg-[#FFF1F3] text-[#C2293A] hover:bg-[#FFE5E9]'
        : tone === 'ghost'
            ? 'bg-white text-[#102744] hover:bg-[#F3FAFF]'
            : 'bg-[#102744] text-white hover:bg-[#1B3A6B]';

    return (
        <button className={`inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-black shadow-[0_10px_28px_rgba(16,39,68,0.12)] transition hover:-translate-y-0.5 active:translate-y-0 ${styles}`}>
            {children}
        </button>
    );
}
