import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthInput from '@/components/auth/AuthInput';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import { useAuth } from '@/contexts/AuthContext';
import { resendVerification } from '@/services/authService';

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const initialVerificationEmail = location.state?.verificationEmail || '';

    const [email, setEmail] = useState(initialVerificationEmail);
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [googleSubmitting, setGoogleSubmitting] = useState(false);
    const [googleError, setGoogleError] = useState('');
    const [verificationEmail, setVerificationEmail] = useState(initialVerificationEmail);
    const [resendStatus, setResendStatus] = useState('');
    const [resendError, setResendError] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);
    const [resending, setResending] = useState(false);

    const { login, googleLogin, error, clearError } = useAuth();

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

    useEffect(() => {
        if (resendCooldown <= 0) return undefined;

        const timer = window.setInterval(() => {
            setResendCooldown((current) => Math.max(0, current - 1));
        }, 1000);

        return () => window.clearInterval(timer);
    }, [resendCooldown]);

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
        } catch (err) {
            const message = String(err?.message || '').toLowerCase();
            if (message.includes('verify your email')) {
                setVerificationEmail(email.trim());
                setResendStatus('');
                setResendError('');
            }
        } finally {
            setSubmitting(false);
        }
    }

    async function handleResendVerification() {
        const targetEmail = verificationEmail || email.trim();
        if (!targetEmail || resending || resendCooldown > 0) return;

        setResending(true);
        setResendStatus('');
        setResendError('');
        try {
            await resendVerification({ email: targetEmail });
            setResendStatus('Đã gửi lại email xác minh. Vui lòng kiểm tra cả hộp thư rác.');
            setResendCooldown(60);
        } catch (err) {
            setResendError(err?.message || 'Không thể gửi lại email xác minh. Vui lòng thử lại sau.');
        } finally {
            setResending(false);
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

            {verificationEmail && (
                <div className="auth-alert auth-alert--success" role="status">
                    <p>Chưa nhận được email xác minh cho <strong>{verificationEmail}</strong>?</p>
                    <button
                        type="button"
                        className="mt-2 font-bold text-brand-blue underline underline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={handleResendVerification}
                        disabled={resending || resendCooldown > 0}
                    >
                        {resending
                            ? 'Đang gửi lại...'
                            : resendCooldown > 0
                                ? `Có thể gửi lại sau ${resendCooldown}s`
                                : 'Gửi lại email xác minh'}
                    </button>
                </div>
            )}

            {resendStatus && (
                <div className="auth-alert auth-alert--success" role="status">
                    {resendStatus}
                </div>
            )}

            {resendError && (
                <div className="auth-alert auth-alert--error" role="alert">
                    {resendError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
                <AuthInput
                    id="login-email"
                    label="Email"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        if (verificationEmail && e.target.value.trim() !== verificationEmail) {
                            setVerificationEmail('');
                            setResendStatus('');
                            setResendError('');
                        }
                    }}
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
