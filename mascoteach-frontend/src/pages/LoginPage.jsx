import { useCallback, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthInput from '@/components/auth/AuthInput';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [googleSubmitting, setGoogleSubmitting] = useState(false);
    const [googleError, setGoogleError] = useState('');

    const { login, googleLogin, error, clearError } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const successMessage = location.state?.message;

    function getRedirectTarget(from) {
        if (!from) return { path: '', state: undefined };
        if (typeof from === 'string') return { path: from, state: undefined };

        const pathname = from.pathname || '';
        const search = from.search || '';
        const hash = from.hash || '';
        return { path: `${pathname}${search}${hash}`, state: from.state };
    }

    const redirectTarget = getRedirectTarget(location.state?.from);

    function getDashboard(user) {
        const role = String(user?.role || user?.roleName || '').toLowerCase();
        if (role === 'admin') return '/admin';
        if (role === 'student') return '/student/flashcards';
        if (role === 'parent') return '/parent';
        if (role === 'teacher') return '/teacher';
        return '/';
    }

    async function handleSubmit(e) {
        e.preventDefault();
        clearError();
        setGoogleError('');

        if (!email || !password) return;

        setSubmitting(true);
        try {
            const profile = await login(email, password, remember);
            navigate(redirectTarget.path || getDashboard(profile), { replace: true, state: redirectTarget.state });
        } catch {
            // AuthContext owns the visible error message.
        } finally {
            setSubmitting(false);
        }
    }

    const handleGoogleCredential = useCallback(async (credential) => {
        clearError();
        setGoogleError('');
        setGoogleSubmitting(true);
        try {
            const profile = await googleLogin(credential, remember);
            navigate(redirectTarget.path || getDashboard(profile), { replace: true, state: redirectTarget.state });
        } catch (err) {
            setGoogleError(err.message || 'Đăng nhập Google thất bại. Vui lòng thử lại.');
        } finally {
            setGoogleSubmitting(false);
        }
    }, [clearError, googleLogin, navigate, redirectTarget.path, redirectTarget.state, remember]);

    return (
        <AuthLayout>
            <header className="auth-form-header">
                <h1>Đăng nhập vào Mascoteach</h1>
                <p>
                    Chưa có tài khoản?{' '}
                    <Link to="/register">Tạo tài khoản miễn phí</Link>
                </p>
            </header>

            {successMessage && (
                <div className="auth-alert auth-alert--success" role="status">
                    {successMessage}
                </div>
            )}

            {error && (
                <div className="auth-alert auth-alert--error" role="alert">
                    {error}
                </div>
            )}

            {googleError && (
                <div className="auth-alert auth-alert--error" role="alert">
                    {googleError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
                <AuthInput
                    id="login-email"
                    label="Email"
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
                    showPasswordToggle
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <div className="auth-options">
                    <label htmlFor="remember-me" className="auth-check-row">
                        <input
                            id="remember-me"
                            type="checkbox"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                            className="auth-checkbox"
                        />
                        <span>Ghi nhớ đăng nhập</span>
                    </label>

                    <Link to="/forgot-password">Quên mật khẩu?</Link>
                </div>

                <motion.button
                    type="submit"
                    className="auth-btn auth-btn--primary disabled:opacity-60 disabled:cursor-not-allowed"
                    whileHover={!submitting ? { y: -1 } : {}}
                    whileTap={!submitting ? { scale: 0.985 } : {}}
                    disabled={submitting}
                >
                    {submitting ? (
                        <span className="auth-loading">
                            <span />
                            Đang đăng nhập
                        </span>
                    ) : (
                        <>
                            Đăng nhập
                            <ArrowRight size={17} strokeWidth={2.2} />
                        </>
                    )}
                </motion.button>
            </form>

            <div className="auth-divider">
                <span>Phương thức khác</span>
            </div>

            <GoogleSignInButton
                onCredential={handleGoogleCredential}
                disabled={googleSubmitting}
            />
        </AuthLayout>
    );
}
