import { Link, useLocation, useParams } from 'react-router-dom';
import {
    AlertTriangle,
    BarChart3,
    BookOpenCheck,
    CalendarClock,
    CheckCircle2,
    ChevronRight,
    CircleDollarSign,
    Clock3,
    CreditCard,
    Database,
    FileSearch,
    Filter,
    Flag,
    Gamepad2,
    HardDrive,
    LifeBuoy,
    LockKeyhole,
    ReceiptText,
    RotateCw,
    Search,
    ShieldAlert,
    ShieldCheck,
    Sparkles,
    UserCog,
    UsersRound,
    Zap,
} from 'lucide-react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import {
    AdminCard,
    AdminSectionHeader,
    AdminTable,
    ActionButton,
    MiniMetric,
    StatusBadge,
} from '@/components/admin/AdminLayout';
import {
    adminAlerts,
    adminDocuments,
    adminOrders,
    adminOverviewStats,
    adminSessions,
    adminUsers,
    aiUsageRows,
    auditLogs,
    getContentById,
    getSessionById,
    getUserById,
    revenueSeries,
    supportTimeline,
    topTeachers,
    upcomingOps,
    usageSeries,
} from '@/data/adminMockData';

function useAdminBase() {
    const location = useLocation();
    return location.pathname.startsWith('/dev/admin') ? '/dev/admin' : '/admin';
}

function PageGrid({ children, className = '' }) {
    return <div className={`grid gap-6 ${className}`}>{children}</div>;
}

function ApiTag({ children }) {
    return (
        <span className="inline-flex rounded-full bg-[#EEF7FD] px-3 py-1 text-xs font-black text-[#2B7AB5]">
            {children}
        </span>
    );
}

function FilterBar({ placeholder = 'Tìm kiếm', filters = [] }) {
    return (
        <AdminCard className="p-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="relative min-w-0 flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7790A8]" />
                    <input
                        className="h-12 w-full rounded-full border border-[#D8E9F5] bg-white pl-11 pr-4 text-sm font-bold text-[#102744] outline-none placeholder:text-[#8EA1B4] focus:border-[#5BAED4] focus:ring-4 focus:ring-[#A8D8EA]/30"
                        placeholder={placeholder}
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {filters.map((filter) => (
                        <button key={filter} className="inline-flex h-11 items-center gap-2 rounded-full border border-[#D8E9F5] bg-white px-4 text-sm font-black text-[#52677F] transition hover:border-[#A8D8EA] hover:text-[#102744]">
                            <Filter className="h-4 w-4" />
                            {filter}
                        </button>
                    ))}
                </div>
            </div>
        </AdminCard>
    );
}

function StatCard({ stat }) {
    const tones = {
        blue: 'bg-[#DDF2FF] text-[#2B7AB5]',
        cyan: 'bg-[#E0F7FA] text-[#168AA2]',
        green: 'bg-[#E8FFD7] text-[#2D7A21]',
        peach: 'bg-[#FFE6D8] text-[#C55B24]',
    };

    return (
        <AdminCard className="relative overflow-hidden p-5">
            <div className="absolute -right-12 -top-10 h-36 w-36 rounded-full bg-white/60" />
            <div className="relative">
                <div className={`grid h-12 w-12 place-items-center rounded-2xl ${tones[stat.tone]}`}>
                    <BarChart3 className="h-6 w-6" />
                </div>
                <p className="mt-5 text-sm font-black text-[#63788F]">{stat.label}</p>
                <div className="mt-2 flex items-end justify-between gap-3">
                    <p className="text-[34px] font-black leading-none text-[#071D35]">{stat.value}</p>
                    <span className="rounded-full bg-[#102744] px-3 py-1.5 text-xs font-black text-white">{stat.delta}</span>
                </div>
                <p className="mt-3 text-sm font-bold text-[#6C8098]">{stat.note}</p>
                <div className="mt-4">
                    <ApiTag>{stat.api}</ApiTag>
                </div>
            </div>
        </AdminCard>
    );
}

function CalendarCard() {
    const days = Array.from({ length: 30 }, (_, index) => index + 1);
    return (
        <AdminCard className="p-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-[#071D35]">Lịch vận hành</h2>
                <CalendarClock className="h-6 w-6 text-[#2B7AB5]" />
            </div>
            <div className="mt-5 grid grid-cols-7 gap-2 text-center text-xs font-black text-[#60758D]">
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => <span key={day}>{day}</span>)}
                {days.map((day) => (
                    <span
                        key={day}
                        className={[
                            'grid h-9 place-items-center rounded-full text-sm font-black',
                            day === 27 ? 'bg-[#2B7AB5] text-white shadow-[0_10px_24px_rgba(43,122,181,0.28)]' : '',
                            [6, 13, 20].includes(day) ? 'bg-[#EFF8FE] text-[#2B7AB5]' : '',
                        ].join(' ')}
                    >
                        {day}
                    </span>
                ))}
            </div>
            <div className="mt-6 space-y-3">
                {upcomingOps.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 rounded-[18px] bg-[#F7FBFE] p-3">
                        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-sm font-black text-[#2B7AB5]">{item.time}</span>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-black text-[#102744]">{item.title}</p>
                            <p className="text-xs font-bold text-[#7C91A8]">{item.meta}</p>
                        </div>
                    </div>
                ))}
            </div>
        </AdminCard>
    );
}

export function AdminOverviewPage() {
    const base = useAdminBase();

    return (
        <PageGrid>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {adminOverviewStats.map((stat) => <StatCard key={stat.id} stat={stat} />)}
            </div>

            <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_380px]">
                <PageGrid>
                    <AdminCard className="p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-[#071D35]">Doanh thu & chi phí AI</h2>
                                <p className="mt-1 text-sm font-semibold text-[#6C8098]">Theo dõi doanh thu collected, revenue ghi nhận và chi phí AI ước tính.</p>
                            </div>
                            <div className="rounded-full bg-[#102744] px-4 py-2 text-sm font-black text-white">
                                Collected: 344M
                            </div>
                        </div>
                        <div className="mt-6 h-[330px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueSeries}>
                                    <defs>
                                        <linearGradient id="adminRevenue" x1="0" x2="0" y1="0" y2="1">
                                            <stop offset="5%" stopColor="#2B7AB5" stopOpacity={0.28} />
                                            <stop offset="95%" stopColor="#2B7AB5" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="adminCost" x1="0" x2="0" y1="0" y2="1">
                                            <stop offset="5%" stopColor="#FB923C" stopOpacity={0.24} />
                                            <stop offset="95%" stopColor="#FB923C" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid stroke="#E5F0F8" vertical={false} />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#7C91A8', fontSize: 12, fontWeight: 700 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#7C91A8', fontSize: 12, fontWeight: 700 }} />
                                    <Tooltip contentStyle={{ borderRadius: 18, border: '1px solid #D8E9F5', boxShadow: '0 18px 50px rgba(43,122,181,.16)' }} />
                                    <Area type="monotone" dataKey="revenue" stroke="#2B7AB5" strokeWidth={4} fill="url(#adminRevenue)" />
                                    <Line type="monotone" dataKey="collected" stroke="#1B3A6B" strokeWidth={3} dot={false} />
                                    <Area type="monotone" dataKey="aiCost" stroke="#FB923C" strokeWidth={3} fill="url(#adminCost)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </AdminCard>

                    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                        <AdminCard className="p-6">
                            <AdminSectionHeader title="Top giáo viên" description="Xếp theo mức độ sử dụng lành mạnh, Pro status và phiên học hoàn tất." />
                            <div className="space-y-3">
                                {topTeachers.map((teacher) => (
                                    <Link key={teacher.id} to={`${base}/users/${teacher.id}`} className="flex items-center gap-3 rounded-[18px] bg-[#F7FBFE] p-3 transition hover:-translate-y-0.5 hover:bg-[#EEF7FD]">
                                        <span className="grid h-11 w-11 place-items-center rounded-full bg-[#DDF2FF] text-sm font-black text-[#2B7AB5]">{teacher.avatar}</span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-sm font-black text-[#102744]">{teacher.name}</span>
                                            <span className="block truncate text-xs font-bold text-[#7C91A8]">{teacher.email}</span>
                                        </span>
                                        <span className="text-sm font-black text-[#102744]">{teacher.score}</span>
                                    </Link>
                                ))}
                            </div>
                        </AdminCard>

                        <AdminCard className="p-6">
                            <AdminSectionHeader title="Việc cần xử lý" description="Các cảnh báo vận hành ưu tiên trong ngày." />
                            <div className="space-y-3">
                                {adminAlerts.map((alert) => (
                                    <div key={alert.id} className="rounded-[20px] border border-[#D8E9F5] bg-white p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#FFF4EA] text-[#CF5B1B]">
                                                <AlertTriangle className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-black text-[#102744]">{alert.title}</p>
                                                <p className="mt-1 text-sm font-semibold leading-6 text-[#6C8098]">{alert.description}</p>
                                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                                    <StatusBadge value={alert.severity} />
                                                    <ApiTag>{alert.api}</ApiTag>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </AdminCard>
                    </div>
                </PageGrid>

                <PageGrid>
                    <CalendarCard />
                    <AdminCard className="overflow-hidden bg-[#071D35] p-6 text-white">
                        <div className="grid h-14 w-14 place-items-center rounded-full bg-white/12">
                            <Sparkles className="h-7 w-7 text-[#A8D8EA]" />
                        </div>
                        <h2 className="mt-6 text-2xl font-black">API contract đã rõ</h2>
                        <p className="mt-2 text-sm font-semibold leading-6 text-white/72">
                            Mỗi card, table và action đều có dữ liệu mock theo đúng module backend cần triển khai.
                        </p>
                        <Link to={`${base}/settings`} className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-black text-[#071D35]">
                            Xem cấu hình
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    </AdminCard>
                </PageGrid>
            </div>
        </PageGrid>
    );
}

export function AdminUsersPage() {
    const base = useAdminBase();
    const columns = [
        { key: 'name', label: 'Người dùng', render: (row) => <UserCell row={row} /> },
        { key: 'role', label: 'Role' },
        { key: 'plan', label: 'Gói' },
        { key: 'status', label: 'Trạng thái', render: (row) => <StatusBadge value={row.status} /> },
        { key: 'documents', label: 'Tài liệu' },
        { key: 'sessions', label: 'Session' },
        { key: 'lastActive', label: 'Hoạt động gần nhất' },
    ];

    return (
        <PageGrid>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MiniMetric icon={UsersRound} label="Tổng user" value="51,420" />
                <MiniMetric icon={UserCog} label="Giáo viên" value="2,840" tone="navy" />
                <MiniMetric icon={ShieldCheck} label="Pro active" value="1,126" tone="green" />
                <MiniMetric icon={AlertTriangle} label="Cần review" value="8" tone="orange" />
            </div>
            <FilterBar placeholder="Tìm theo tên, email, role..." filters={['Role', 'Gói Pro', 'Trạng thái', 'Ngày tạo']} />
            <AdminCard className="p-5">
                <AdminSectionHeader title="Danh sách người dùng" description="Backend nên hỗ trợ pagination, search, sort và filter role/subscription/status." action={<ApiTag>GET /api/Admin/users</ApiTag>} />
                <AdminTable columns={columns} rows={adminUsers} rowHref={(row) => `${base}/users/${row.id}`} />
            </AdminCard>
        </PageGrid>
    );
}

function UserCell({ row }) {
    return (
        <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-[#DDF2FF] text-sm font-black text-[#2B7AB5]">
                {row.name.split(' ').slice(-2).map((part) => part[0]).join('')}
            </span>
            <span>
                <span className="block font-black text-[#102744]">{row.name}</span>
                <span className="block text-xs font-bold text-[#7C91A8]">{row.email}</span>
            </span>
        </div>
    );
}

export function AdminUserDetailPage() {
    const base = useAdminBase();
    const { userId } = useParams();
    const user = getUserById(userId);
    const userContent = adminDocuments.filter((item) => item.ownerId === user.id);
    const userSessions = adminSessions.filter((session) => session.teacher === user.name);

    return (
        <PageGrid>
            <DetailHero
                backTo={`${base}/users`}
                title={user.name}
                subtitle={user.email}
                status={user.status}
                icon={UsersRound}
                actions={<><ActionButton>Chỉnh subscription</ActionButton><ActionButton tone="ghost">Gửi email</ActionButton></>}
            />

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <MiniMetric icon={FileSearch} label="Tài liệu" value={user.documents} />
                <MiniMetric icon={BookOpenCheck} label="Quiz" value={user.quizzes} tone="navy" />
                <MiniMetric icon={Sparkles} label="Flashcard" value={user.flashcards} tone="green" />
                <MiniMetric icon={Gamepad2} label="Session" value={user.sessions} tone="orange" />
                <MiniMetric icon={HardDrive} label="Storage" value={user.storage} />
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                <AdminCard className="p-5">
                    <AdminSectionHeader title="Nội dung của giáo viên" description="Admin xem metadata, trạng thái xử lý và lỗi. Không sửa nội dung học tập trong MVP." action={<ApiTag>GET /api/Admin/users/{'{id}'}/content</ApiTag>} />
                    <AdminTable
                        columns={[
                            { key: 'title', label: 'Nội dung' },
                            { key: 'type', label: 'Loại' },
                            { key: 'status', label: 'Trạng thái', render: (row) => <StatusBadge value={row.status} /> },
                            { key: 'size', label: 'Dung lượng' },
                            { key: 'createdAt', label: 'Ngày tạo' },
                        ]}
                        rows={userContent}
                        rowHref={(row) => `${base}/content/${row.id}`}
                    />
                </AdminCard>

                <AdminCard className="p-6">
                    <AdminSectionHeader title="Hồ sơ vận hành" description="Các trường backend cần trả về cho support." />
                    <InfoList items={[
                        ['Role', user.role],
                        ['Gói', user.plan],
                        ['Ngày tham gia', user.joinedAt],
                        ['Hoạt động gần nhất', user.lastActive],
                        ['Doanh thu', user.revenue],
                    ]} />
                    <div className="mt-6 grid gap-3">
                        <ActionButton tone="ghost">Reset quota</ActionButton>
                        <ActionButton tone="ghost">Khoá tài khoản</ActionButton>
                        <ActionButton tone="danger">Soft delete user</ActionButton>
                    </div>
                </AdminCard>
            </div>

            <AdminCard className="p-5">
                <AdminSectionHeader title="Session gần đây" action={<ApiTag>GET /api/Admin/users/{'{id}'}/sessions</ApiTag>} />
                <AdminTable
                    columns={[
                        { key: 'pin', label: 'PIN' },
                        { key: 'title', label: 'Tên phiên' },
                        { key: 'mode', label: 'Game mode' },
                        { key: 'status', label: 'Trạng thái', render: (row) => <StatusBadge value={row.status} /> },
                        { key: 'participants', label: 'Học sinh' },
                        { key: 'startedAt', label: 'Bắt đầu' },
                    ]}
                    rows={userSessions}
                    rowHref={(row) => `${base}/sessions/${row.id}`}
                />
            </AdminCard>
        </PageGrid>
    );
}

export function AdminContentPage() {
    const base = useAdminBase();
    return (
        <PageGrid>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MiniMetric icon={FileSearch} label="Documents" value="6,820" />
                <MiniMetric icon={BookOpenCheck} label="Quiz" value="9,460" tone="navy" />
                <MiniMetric icon={Sparkles} label="Flashcards" value="3,126" tone="green" />
                <MiniMetric icon={AlertTriangle} label="Processing issues" value="18" tone="orange" />
            </div>
            <FilterBar placeholder="Tìm tài liệu, quiz, flashcard, giáo viên..." filters={['Loại nội dung', 'Trạng thái', 'Owner', 'Ngày tạo']} />
            <AdminCard className="p-5">
                <AdminSectionHeader title="Content monitoring" description="Trang này là vận hành và moderation, không phải CMS chỉnh nội dung giáo viên." action={<ApiTag>GET /api/Admin/content</ApiTag>} />
                <AdminTable
                    columns={[
                        { key: 'title', label: 'Tên nội dung' },
                        { key: 'owner', label: 'Giáo viên' },
                        { key: 'type', label: 'Loại' },
                        { key: 'source', label: 'Nguồn' },
                        { key: 'status', label: 'Trạng thái', render: (row) => <StatusBadge value={row.status} /> },
                        { key: 'size', label: 'Kích thước' },
                        { key: 'createdAt', label: 'Ngày tạo' },
                    ]}
                    rows={adminDocuments}
                    rowHref={(row) => `${base}/content/${row.id}`}
                />
            </AdminCard>
        </PageGrid>
    );
}

export function AdminContentDetailPage() {
    const base = useAdminBase();
    const { contentId } = useParams();
    const content = getContentById(contentId);

    return (
        <PageGrid>
            <DetailHero
                backTo={`${base}/content`}
                title={content.title}
                subtitle={`${content.type} của ${content.owner}`}
                status={content.status}
                icon={FileSearch}
                actions={<><ActionButton><RotateCw className="mr-2 h-4 w-4" />Retry</ActionButton><ActionButton tone="danger">Ẩn nội dung</ActionButton></>}
            />
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                <AdminCard className="p-6">
                    <AdminSectionHeader title="Metadata" action={<ApiTag>GET /api/Admin/content/{'{id}'}</ApiTag>} />
                    <div className="grid gap-4 md:grid-cols-2">
                        <InfoBlock label="Owner" value={content.owner} />
                        <InfoBlock label="Loại" value={content.type} />
                        <InfoBlock label="Nguồn" value={content.source} />
                        <InfoBlock label="Ngày tạo" value={content.createdAt} />
                        <InfoBlock label="Kích thước" value={content.size} />
                        <InfoBlock label="Generated items" value={content.generated} />
                    </div>
                    {content.lastError && (
                        <div className="mt-5 rounded-[20px] border border-[#FFD3D8] bg-[#FFF1F3] p-4">
                            <p className="text-sm font-black text-[#C2293A]">Lỗi gần nhất</p>
                            <p className="mt-1 text-sm font-bold text-[#7A3440]">{content.lastError}</p>
                        </div>
                    )}
                </AdminCard>
                <AdminCard className="p-6">
                    <AdminSectionHeader title="Action backend cần có" />
                    <div className="space-y-3">
                        <ApiTag>POST /api/Admin/content/{'{id}'}/retry</ApiTag>
                        <ApiTag>PATCH /api/Admin/content/{'{id}'}/hide</ApiTag>
                        <ApiTag>PATCH /api/Admin/content/{'{id}'}/restore</ApiTag>
                        <ApiTag>GET /api/Admin/content/{'{id}'}/logs</ApiTag>
                    </div>
                </AdminCard>
            </div>
            <AdminCard className="p-5">
                <AdminSectionHeader title="Log xử lý" description="Timeline này giúp support biết file bị lỗi ở parser, AI worker hay storage." />
                <Timeline items={[
                    ['Upload received', 'Storage nhận file và tạo document metadata.', 'Done'],
                    ['AI parsing', content.status === 'Failed' ? content.lastError : 'Trích xuất nội dung thành công.', content.status === 'Failed' ? 'Failed' : 'Done'],
                    ['Generation queue', 'Đẩy job tạo quiz/flashcard vào queue.', content.generated > 0 ? 'Done' : 'Pending'],
                ]} />
            </AdminCard>
        </PageGrid>
    );
}

export function AdminSessionsPage() {
    const base = useAdminBase();
    return (
        <PageGrid>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MiniMetric icon={Gamepad2} label="Session hôm nay" value="428" />
                <MiniMetric icon={UsersRound} label="Học sinh tham gia" value="8,920" tone="navy" />
                <MiniMetric icon={CheckCircle2} label="Hoàn tất ổn định" value="96.8%" tone="green" />
                <MiniMetric icon={ShieldAlert} label="Realtime issue" value="7" tone="red" />
            </div>
            <FilterBar placeholder="Tìm theo PIN, giáo viên, quiz..." filters={['Trạng thái', 'Game mode', 'Ngày', 'Teacher']} />
            <AdminCard className="p-5">
                <AdminSectionHeader title="Live sessions" action={<ApiTag>GET /api/Admin/sessions</ApiTag>} />
                <AdminTable
                    columns={[
                        { key: 'pin', label: 'PIN' },
                        { key: 'title', label: 'Tên phiên' },
                        { key: 'teacher', label: 'Giáo viên' },
                        { key: 'mode', label: 'Mode' },
                        { key: 'status', label: 'Trạng thái', render: (row) => <StatusBadge value={row.status} /> },
                        { key: 'participants', label: 'Học sinh' },
                        { key: 'accuracy', label: 'Đúng' },
                        { key: 'startedAt', label: 'Bắt đầu' },
                    ]}
                    rows={adminSessions}
                    rowHref={(row) => `${base}/sessions/${row.id}`}
                />
            </AdminCard>
        </PageGrid>
    );
}

export function AdminSessionDetailPage() {
    const base = useAdminBase();
    const { sessionId } = useParams();
    const session = getSessionById(sessionId);

    return (
        <PageGrid>
            <DetailHero
                backTo={`${base}/sessions`}
                title={session.title}
                subtitle={`PIN ${session.pin} • ${session.teacher}`}
                status={session.status}
                icon={Gamepad2}
                actions={<><ActionButton>Yêu cầu trạng thái mới</ActionButton><ActionButton tone="danger">Kết thúc phiên</ActionButton></>}
            />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <MiniMetric icon={UsersRound} label="Participants" value={session.participants} />
                <MiniMetric icon={CheckCircle2} label="Accuracy" value={session.accuracy} tone="green" />
                <MiniMetric icon={Clock3} label="Duration" value={session.duration} tone="navy" />
                <MiniMetric icon={Gamepad2} label="Mode" value={session.mode} tone="orange" />
                <MiniMetric icon={Zap} label="Realtime" value={session.status === 'Realtime Issue' ? 'Watch' : 'OK'} tone={session.status === 'Realtime Issue' ? 'red' : 'green'} />
            </div>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                <AdminCard className="p-5">
                    <AdminSectionHeader title="Participant snapshot" action={<ApiTag>GET /api/Admin/sessions/{'{id}'}/participants</ApiTag>} />
                    <AdminTable
                        columns={[
                            { key: 'name', label: 'Học sinh' },
                            { key: 'score', label: 'Điểm' },
                            { key: 'answers', label: 'Câu trả lời' },
                            { key: 'status', label: 'Trạng thái', render: (row) => <StatusBadge value={row.status} /> },
                        ]}
                        rows={[
                            { id: 'p-1', name: 'Lan Anh', score: 920, answers: '12/14', status: 'Connected' },
                            { id: 'p-2', name: 'Minh Khang', score: 860, answers: '11/14', status: 'Connected' },
                            { id: 'p-3', name: 'Gia Huy', score: 640, answers: '8/14', status: 'Reconnected' },
                        ]}
                    />
                </AdminCard>
                <AdminCard className="p-6">
                    <AdminSectionHeader title="Session APIs" />
                    <div className="space-y-3">
                        <ApiTag>GET /api/Admin/sessions/{'{id}'}</ApiTag>
                        <ApiTag>POST /api/Admin/sessions/{'{id}'}/end</ApiTag>
                        <ApiTag>GET /api/Admin/sessions/{'{id}'}/events</ApiTag>
                    </div>
                </AdminCard>
            </div>
        </PageGrid>
    );
}

export function AdminBillingPage() {
    return (
        <PageGrid>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MiniMetric icon={CircleDollarSign} label="MRR" value="284.6M" />
                <MiniMetric icon={CreditCard} label="Paid orders" value="1,428" tone="green" />
                <MiniMetric icon={ReceiptText} label="Pending" value="36" tone="orange" />
                <MiniMetric icon={AlertTriangle} label="Paid unsynced" value="3" tone="red" />
            </div>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                <AdminCard className="p-6">
                    <AdminSectionHeader title="Revenue trend" action={<ApiTag>GET /api/Admin/billing/revenue</ApiTag>} />
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueSeries}>
                                <CartesianGrid stroke="#E5F0F8" vertical={false} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Line type="monotone" dataKey="collected" stroke="#2B7AB5" strokeWidth={4} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </AdminCard>
                <AdminCard className="p-6">
                    <AdminSectionHeader title="Billing actions" description="Các action cần audit log." />
                    <div className="grid gap-3">
                        <ActionButton>Sync paid orders</ActionButton>
                        <ActionButton tone="ghost">Gia hạn Pro thủ công</ActionButton>
                        <ActionButton tone="ghost">Export doanh thu</ActionButton>
                    </div>
                </AdminCard>
            </div>
            <AdminCard className="p-5">
                <AdminSectionHeader title="Orders" action={<ApiTag>GET /api/Admin/billing/orders</ApiTag>} />
                <AdminTable
                    columns={[
                        { key: 'id', label: 'Order' },
                        { key: 'user', label: 'User' },
                        { key: 'plan', label: 'Plan' },
                        { key: 'amount', label: 'Amount' },
                        { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
                        { key: 'paidAt', label: 'Paid at' },
                        { key: 'expiresAt', label: 'Expires' },
                    ]}
                    rows={adminOrders}
                />
            </AdminCard>
        </PageGrid>
    );
}

export function AdminAiUsagePage() {
    return (
        <PageGrid>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MiniMetric icon={Sparkles} label="Generate requests" value="4,082" />
                <MiniMetric icon={CheckCircle2} label="Success rate" value="96.1%" tone="green" />
                <MiniMetric icon={Clock3} label="Avg latency" value="18.4s" tone="navy" />
                <MiniMetric icon={AlertTriangle} label="Failed jobs" value="162" tone="orange" />
            </div>
            <AdminCard className="p-6">
                <AdminSectionHeader title="Usage tuần này" action={<ApiTag>GET /api/Admin/ai-usage</ApiTag>} />
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={usageSeries}>
                            <CartesianGrid stroke="#E5F0F8" vertical={false} />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Bar dataKey="documents" radius={[12, 12, 0, 0]} fill="#A8D8EA" />
                            <Bar dataKey="quizzes" radius={[12, 12, 0, 0]} fill="#2B7AB5" />
                            <Bar dataKey="sessions" radius={[12, 12, 0, 0]} fill="#1B3A6B" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </AdminCard>
            <AdminCard className="p-5">
                <AdminSectionHeader title="AI pipelines" description="Backend nên trả success rate, avg time, cost estimate và trạng thái pipeline." />
                <AdminTable
                    columns={[
                        { key: 'type', label: 'Pipeline' },
                        { key: 'requests', label: 'Requests' },
                        { key: 'success', label: 'Success' },
                        { key: 'avgTime', label: 'Avg time' },
                        { key: 'cost', label: 'Cost estimate' },
                        { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
                    ]}
                    rows={aiUsageRows}
                />
            </AdminCard>
        </PageGrid>
    );
}

export function AdminSupportPage() {
    return (
        <PageGrid>
            <AdminCard className="p-6">
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <div>
                        <h2 className="text-2xl font-black text-[#071D35]">Tra cứu support</h2>
                        <p className="mt-1 text-sm font-semibold text-[#6C8098]">Tìm user bằng email, PIN session, document id hoặc order id.</p>
                        <div className="relative mt-5">
                            <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7790A8]" />
                            <input className="h-14 w-full rounded-full border border-[#D8E9F5] bg-white pl-12 pr-5 text-sm font-bold outline-none focus:border-[#5BAED4] focus:ring-4 focus:ring-[#A8D8EA]/30" placeholder="Ví dụ: huong.le@school.vn hoặc PIN 183650" />
                        </div>
                    </div>
                    <div className="rounded-[24px] bg-[#102744] p-5 text-white">
                        <LifeBuoy className="h-8 w-8 text-[#A8D8EA]" />
                        <p className="mt-4 text-xl font-black">Support API</p>
                        <p className="mt-2 text-sm font-semibold leading-6 text-white/72">GET /api/Admin/support/search?q=</p>
                    </div>
                </div>
            </AdminCard>
            <div className="grid gap-6 xl:grid-cols-2">
                <AdminCard className="p-6">
                    <AdminSectionHeader title="Timeline case hôm nay" />
                    <div className="space-y-4">
                        {supportTimeline.map((item) => (
                            <div key={item.id} className="flex gap-4 rounded-[20px] bg-[#F7FBFE] p-4">
                                <span className="text-sm font-black text-[#2B7AB5]">{item.time}</span>
                                <div className="min-w-0">
                                    <p className="text-sm font-black text-[#102744]">{item.title}</p>
                                    <p className="mt-1 text-xs font-bold text-[#7C91A8]">{item.meta}</p>
                                    <div className="mt-2"><StatusBadge value={item.status} /></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </AdminCard>
                <AdminCard className="p-6">
                    <AdminSectionHeader title="Checklist support" />
                    <Timeline items={[
                        ['Xác minh user', 'Email, role, subscription, quota hiện tại.', 'Required'],
                        ['Xem content/session liên quan', 'Chỉ xem metadata trước, mở detail khi cần.', 'Required'],
                        ['Ghi audit note', 'Mọi action billing, quota, hide content cần log.', 'Required'],
                    ]} />
                </AdminCard>
            </div>
        </PageGrid>
    );
}

export function AdminAuditLogsPage() {
    return (
        <PageGrid>
            <FilterBar placeholder="Tìm actor, target, action..." filters={['Actor', 'Risk', 'Action', 'Ngày']} />
            <AdminCard className="p-5">
                <AdminSectionHeader title="Audit logs" description="Mọi hành động admin có tác động đến user, billing, content, quota cần được ghi lại." action={<ApiTag>GET /api/Admin/audit-logs</ApiTag>} />
                <AdminTable
                    columns={[
                        { key: 'time', label: 'Thời gian' },
                        { key: 'actor', label: 'Actor' },
                        { key: 'action', label: 'Action' },
                        { key: 'target', label: 'Target' },
                        { key: 'risk', label: 'Risk', render: (row) => <StatusBadge value={row.risk} /> },
                    ]}
                    rows={auditLogs}
                />
            </AdminCard>
        </PageGrid>
    );
}

export function AdminSettingsPage() {
    const settings = [
        { id: 'set-1', title: 'Quota Free', description: 'Giới hạn tài liệu, quiz, flashcard và session cho tài khoản Free.', icon: Database, api: 'PATCH /api/Admin/settings/quota' },
        { id: 'set-2', title: 'Feature flags', description: 'Bật tắt flashcard, adventure game, analytics và thử nghiệm mới.', icon: Flag, api: 'PATCH /api/Admin/settings/feature-flags' },
        { id: 'set-3', title: 'Alert thresholds', description: 'Ngưỡng cảnh báo AI failure, paid unsynced, realtime issue.', icon: ShieldAlert, api: 'PATCH /api/Admin/settings/alerts' },
        { id: 'set-4', title: 'Admin roles', description: 'Owner, Admin, Support, Content Moderator, Billing Manager.', icon: LockKeyhole, api: 'PATCH /api/Admin/settings/roles' },
    ];

    return (
        <PageGrid className="xl:grid-cols-2">
            {settings.map((item) => {
                const Icon = item.icon;
                return (
                    <AdminCard key={item.id} className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="grid h-14 w-14 place-items-center rounded-[20px] bg-[#DDF2FF] text-[#2B7AB5]">
                                <Icon className="h-7 w-7" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h2 className="text-xl font-black text-[#071D35]">{item.title}</h2>
                                <p className="mt-2 text-sm font-semibold leading-6 text-[#6C8098]">{item.description}</p>
                                <div className="mt-4"><ApiTag>{item.api}</ApiTag></div>
                            </div>
                        </div>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <ActionButton>Chỉnh cấu hình</ActionButton>
                            <ActionButton tone="ghost">Xem lịch sử</ActionButton>
                        </div>
                    </AdminCard>
                );
            })}
        </PageGrid>
    );
}

function DetailHero({ backTo, title, subtitle, status, icon: Icon, actions }) {
    return (
        <AdminCard className="p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-start gap-4">
                    <div className="grid h-16 w-16 place-items-center rounded-[24px] bg-[#102744] text-white">
                        <Icon className="h-8 w-8" />
                    </div>
                    <div className="min-w-0">
                        <Link to={backTo} className="text-sm font-black text-[#2B7AB5] hover:text-[#1B3A6B]">Quay lại</Link>
                        <h2 className="mt-2 text-3xl font-black text-[#071D35]">{title}</h2>
                        <p className="mt-1 text-sm font-bold text-[#6C8098]">{subtitle}</p>
                        <div className="mt-3"><StatusBadge value={status} /></div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3">{actions}</div>
            </div>
        </AdminCard>
    );
}

function InfoBlock({ label, value }) {
    return (
        <div className="rounded-[20px] bg-[#F7FBFE] p-4">
            <p className="text-xs font-black uppercase tracking-[0.1em] text-[#7C91A8]">{label}</p>
            <p className="mt-2 text-base font-black text-[#102744]">{value}</p>
        </div>
    );
}

function InfoList({ items }) {
    return (
        <div className="divide-y divide-[#E5F0F8] rounded-[20px] border border-[#D8E9F5] bg-white">
            {items.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 px-4 py-3">
                    <span className="text-sm font-bold text-[#6C8098]">{label}</span>
                    <span className="text-right text-sm font-black text-[#102744]">{value}</span>
                </div>
            ))}
        </div>
    );
}

function Timeline({ items }) {
    return (
        <div className="space-y-3">
            {items.map(([title, description, status]) => (
                <div key={title} className="flex gap-4 rounded-[20px] bg-[#F7FBFE] p-4">
                    <span className="mt-1 h-3 w-3 rounded-full bg-[#2B7AB5]" />
                    <div>
                        <p className="text-sm font-black text-[#102744]">{title}</p>
                        <p className="mt-1 text-sm font-semibold leading-6 text-[#6C8098]">{description}</p>
                        <div className="mt-2"><StatusBadge value={status} /></div>
                    </div>
                </div>
            ))}
        </div>
    );
}
