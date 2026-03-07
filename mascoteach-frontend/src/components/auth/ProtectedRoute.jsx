import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * ProtectedRoute — Wraps routes that require authentication.
 * Redirects to /login if not authenticated.
 * Shows a loading spinner while checking auth state.
 */
export default function ProtectedRoute({ children }) {
    const { isLoggedIn, loading } = useAuth();
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
        // Save the attempted URL for redirect after login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}
