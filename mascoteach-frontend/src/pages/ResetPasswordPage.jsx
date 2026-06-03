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
            setError('Lien ket dat lai mat khau khong hop le hoac thieu token.');
            return;
        }

        if (!form.newPassword || !form.confirmPassword) {
            setError('Vui long nhap day du mat khau moi.');
            return;
        }

        if (form.newPassword.length < 6) {
            setError('Mat khau moi phai co it nhat 6 ky tu.');
            return;
        }

        if (form.newPassword !== form.confirmPassword) {
            setError('Mat khau xac nhan khong khop.');
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
                    state: { message: 'Dat lai mat khau thanh cong. Vui long dang nhap lai.' },
                });
            }, 1400);
        } catch (err) {
            setError(err.message || 'Khong the dat lai mat khau. Vui long thu lai.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AuthLayout>
            <header className="auth-form-header">
                <h1>Dat lai mat khau</h1>
                <p>
                    Nhap mat khau moi cho tai khoan Mascoteach cua ban.
                </p>
            </header>

            {!token && (
                <div className="auth-alert auth-alert--error" role="alert">
                    Lien ket dat lai mat khau khong hop le. Vui long yeu cau mot lien ket moi.
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
                        Mat khau da duoc cap nhat.
                    </span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
                <AuthInput
                    id="reset-new-password"
                    label="Mat khau moi"
                    type="password"
                    placeholder="........"
                    value={form.newPassword}
                    onChange={update('newPassword')}
                    disabled={!token || submitting || success}
                    required
                />

                <AuthInput
                    id="reset-confirm-password"
                    label="Xac nhan mat khau moi"
                    type="password"
                    placeholder="........"
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
                            Dang cap nhat
                        </span>
                    ) : (
                        <>
                            Cap nhat mat khau
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
                    Quay ve dang nhap
                </Link>
            </div>
        </AuthLayout>
    );
}
