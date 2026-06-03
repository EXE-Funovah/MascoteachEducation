import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthInput from '@/components/auth/AuthInput';
import { resetPassword } from '@/services/authService';

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

    const [form, setForm] = useState({
        newPassword: '',
        confirmPassword: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    function update(field) {
        return (event) => {
            setForm((prev) => ({ ...prev, [field]: event.target.value }));
            setError('');
        };
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');

        if (!token) {
            setError('Liên kết đặt lại mật khẩu không hợp lệ hoặc thiếu token.');
            return;
        }

        if (!form.newPassword || !form.confirmPassword) {
            setError('Vui lòng nhập đầy đủ mật khẩu mới.');
            return;
        }

        if (form.newPassword.length < 6) {
            setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
            return;
        }

        if (form.newPassword !== form.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            return;
        }

        setSubmitting(true);
        try {
            await resetPassword({
                token,
                newPassword: form.newPassword,
                confirmPassword: form.confirmPassword,
            });
            setSuccess(true);
            window.setTimeout(() => {
                navigate('/signin', {
                    replace: true,
                    state: { message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.' },
                });
            }, 1400);
        } catch (err) {
            setError(err.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AuthLayout>
            <header className="auth-form-header">
                <h1>Đặt lại mật khẩu</h1>
                <p>
                    Nhập mật khẩu mới cho tài khoản Mascoteach của bạn.
                </p>
            </header>

            {!token && (
                <div className="auth-alert auth-alert--error" role="alert">
                    Liên kết đặt lại mật khẩu không hợp lệ. Vui lòng yêu cầu một liên kết mới.
                </div>
            )}

            {error && (
                <div className="auth-alert auth-alert--error" role="alert">
                    {error}
                </div>
            )}

            {success && (
                <div className="auth-alert auth-alert--success" role="status">
                    <span className="inline-flex items-center gap-2">
                        <CheckCircle2 size={17} />
                        Mật khẩu đã được cập nhật.
                    </span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
                <AuthInput
                    id="reset-new-password"
                    label="Mật khẩu mới"
                    type="password"
                    placeholder="••••••••"
                    value={form.newPassword}
                    onChange={update('newPassword')}
                    disabled={!token || submitting || success}
                    required
                />

                <AuthInput
                    id="reset-confirm-password"
                    label="Xác nhận mật khẩu mới"
                    type="password"
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={update('confirmPassword')}
                    disabled={!token || submitting || success}
                    required
                />

                <motion.button
                    type="submit"
                    className="auth-btn auth-btn--primary disabled:opacity-60 disabled:cursor-not-allowed"
                    whileHover={!submitting && token && !success ? { y: -1 } : {}}
                    whileTap={!submitting && token && !success ? { scale: 0.985 } : {}}
                    disabled={!token || submitting || success}
                >
                    {submitting ? (
                            <span className="auth-loading">
                                <span />
                                Đang cập nhật
                            </span>
                        ) : (
                            <>
                                Cập nhật mật khẩu
                            <ArrowRight size={17} strokeWidth={2.2} />
                            </>
                        )}
                </motion.button>
            </form>

            <div className="mt-7 text-center">
                <Link
                    to="/signin"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-brand-blue transition-colors hover:text-brand-navy"
                >
                    <ArrowLeft size={16} />
                    Quay về đăng nhập
                </Link>
            </div>
        </AuthLayout>
    );
}
