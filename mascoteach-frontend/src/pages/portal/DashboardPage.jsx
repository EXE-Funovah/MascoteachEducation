import { teacherProfile, dashboardStats } from '@/data/mockData';
import StatsCard from '@/components/portal/common/StatsCard';
import RecentGames from '@/components/portal/dashboard/RecentGames';
import QuickActions from '@/components/portal/dashboard/QuickActions';

/**
 * DashboardPage — Main landing page after login
 * Layout: Greeting → Stats strip → Quick actions → Recent games
 */
export default function DashboardPage() {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    return (
        <div className="space-y-8">
            {/* ── Page Header ── */}
            <header>
                <h1 className="text-2xl font-bold text-ink">
                    {greeting}, {teacherProfile.name} 👋
                </h1>
                <p className="text-sm text-ink-muted mt-1">
                    Here&apos;s what&apos;s happening with your classes today.
                </p>
            </header>

            {/* ── Stats Strip ── */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Dashboard statistics">
                {dashboardStats.map((stat) => (
                    <StatsCard key={stat.id} {...stat} />
                ))}
            </section>

            {/* ── Quick Actions ── */}
            <QuickActions />

            {/* ── Recent Games ── */}
            <RecentGames />
        </div>
    );
}
