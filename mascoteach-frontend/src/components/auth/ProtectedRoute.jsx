import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * ProtectedRoute — Wraps routes that require authentication + role check.
 * @param {string[]} [allowedRoles] — If provided, only these roles can access.
 *   Role values from backend: 'Teacher', 'Student', 'Parent'
 */
export default function ProtectedRoute({ children, allowedRoles }) {
    const { user, isLoggedIn, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
                    <p className="text-sm text-slate-400 font-medium">Đang tải...</p>
                </div>
            </div>
        );
    }

    if (!isLoggedIn) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Role check — if allowedRoles specified, verify user has the right role
    if (allowedRoles && allowedRoles.length > 0) {
        const userRole = user?.role || user?.roleName || '';
        const hasAccess = allowedRoles.some(
            role => role.toLowerCase() === userRole.toLowerCase()
        );

        if (!hasAccess) {
            // Redirect to appropriate dashboard based on actual role
            const roleRedirects = {
                teacher: '/teacher',
                student: '/student',
                parent: '/parent',
            };
            const redirectTo = roleRedirects[userRole.toLowerCase()] || '/';
            return <Navigate to={redirectTo} replace />;
        }
    }

    return children;
}
