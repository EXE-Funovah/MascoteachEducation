import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
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

    const from = location.state?.from?.pathname;
    const successMessage = location.state?.message;

    function getRoleRedirect(profile) {
        const role = (profile?.role || profile?.roleName || '').toLowerCase();
        if (role === 'student') return '/student';
        if (role === 'parent') return '/parent';
        return '/teacher';
    }

    async function handleSubmit(e) {
        e.preventDefault();
        clearError();

        if (!email || !password) return;

        setSubmitting(true);
        try {
            const profile = await login(email, password);
            navigate(from || getRoleRedirect(profile), { replace: true });
        } catch {
            // AuthContext owns the visible error message.
        } finally {
            setSubmitting(false);
        }
    }

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

            <motion.button
                type="button"
                className="auth-provider"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.985 }}
            >
                <GoogleLogo />
                <span>Tiếp tục với Google</span>
                <ArrowRight size={17} strokeWidth={2.2} />
            </motion.button>
        </AuthLayout>
    );
}
