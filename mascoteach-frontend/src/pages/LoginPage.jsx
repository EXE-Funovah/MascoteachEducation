import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthInput from '@/components/auth/AuthInput';
import GoogleLogo from '@/components/auth/GoogleLogo';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const { login, error, clearError } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Redirect sau khi đăng nhập — dựa trên role
    const from = location.state?.from?.pathname;
    // Thông báo thành công từ trang đăng ký
    const successMessage = location.state?.message;

    function getRoleRedirect(profile) {
        const role = (profile?.role || profile?.roleName || '').toLowerCase();
        if (role === 'student') return '/student';
        if (role === 'parent') return '/parent';
        return '/teacher'; // default
    }

    async function handleSubmit(e) {
        e.preventDefault();
        clearError();

        if (!email || !password) return;

        setSubmitting(true);
        try {
            const profile = await login(email, password);
            const redirectTo = from || getRoleRedirect(profile);
            navigate(redirectTo, { replace: true });
        } catch {
            // Error đã được set trong AuthContext
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AuthLayout>
            <header className="text-center mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                    Chào mừng đến Mascoteach
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                    Đăng nhập để tiếp tục trải nghiệm lớp học thông minh.
                </p>
            </header>

            {/* Thông báo đăng ký thành công */}
            {successMessage && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-600 text-center"
                    role="status">
                    {successMessage}
                </div>
            )}

            {/* Thông báo lỗi */}
            {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-600 text-center"
                    role="alert">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <AuthInput
                    id="login-email"
                    label="Địa chỉ Email"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <AuthInput
                    id="login-password"
                    label="Mật khẩu"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                {/* Ghi nhớ + Quên mật khẩu */}
                <div className="flex items-center justify-between">
                    <label htmlFor="remember-me" className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            id="remember-me"
                            type="checkbox"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                            className="auth-checkbox"
                        />
                        <span className="text-sm text-slate-500">Ghi nhớ đăng nhập</span>
                    </label>

                    <Link
                        to="/forgot-password"
                        className="text-sm font-semibold text-brand-blue hover:text-brand-navy transition-colors"
                    >
                        Quên mật khẩu?
                    </Link>
                </div>

                {/* Nút đăng nhập */}
                <motion.button
                    type="submit"
                    className="auth-btn auth-btn--primary disabled:opacity-60 disabled:cursor-not-allowed"
                    whileHover={!submitting ? { scale: 1.015, y: -1 } : {}}
                    whileTap={!submitting ? { scale: 0.98 } : {}}
                    disabled={submitting}
                >
                    {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Đang đăng nhập...
                        </span>
                    ) : (
                        'Đăng nhập'
                    )}
                </motion.button>

                {/* Đường phân cách */}
                <div className="flex items-center gap-4">
                    <span className="flex-1 h-px bg-slate-200" />
                    <span className="text-xs text-slate-400 font-medium">hoặc</span>
                    <span className="flex-1 h-px bg-slate-200" />
                </div>

                {/* Google */}
                <motion.button
                    type="button"
                    className="auth-btn auth-btn--google"
                    whileHover={{ scale: 1.015, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <GoogleLogo />
                    Tiếp tục với Google
                </motion.button>
            </form>

            {/* Chuyển sang đăng ký */}
            <p className="mt-8 text-center text-sm text-slate-500">
                Chưa có tài khoản?{' '}
                <Link to="/signup" className="font-semibold text-brand-blue hover:text-brand-navy transition-colors">
                    Đăng ký ngay
                </Link>
            </p>
        </AuthLayout>
    );
}
