import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Mail } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthInput from '@/components/auth/AuthInput';
import { forgotPassword } from '@/services/authService';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');

        if (!email.trim()) {
            setError('Vui long nhap email.');
            return;
        }

        setSubmitting(true);
        try {
            await forgotPassword({ email: email.trim() });
            setSent(true);
        } catch (err) {
            setError(err.message || 'Khong the gui lien ket dat lai mat khau. Vui long thu lai.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AuthLayout>
            <header className="auth-form-header">
                <h1>Dat lai mat khau</h1>
                <p>Nhap email cua ban, Mascoteach se gui lien ket dat lai mat khau neu tai khoan ton tai.</p>
            </header>

            {!sent ? (
                <>
                    {error && (
                        <div className="auth-alert auth-alert--error" role="alert">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <AuthInput
                            id="forgot-email"
                            label="Email"
                            type="email"
                            placeholder="email@example.com"
                            value={email}
                            onChange={(event) => {
                                setEmail(event.target.value);
                                setError('');
                            }}
                            disabled={submitting}
                            required
                        />

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
                                    Dang gui
                                </span>
                            ) : (
                                <>
                                    Gui lien ket dat lai
                                    <ArrowRight size={17} strokeWidth={2.2} />
                                </>
                            )}
                        </motion.button>
                    </form>
                </>
            ) : (
                <motion.div
                    className="text-center py-6"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                        <Mail size={30} />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">Kiem tra email cua ban</h2>
                    <p className="mx-auto mt-2 max-w-xs text-sm text-slate-500">
                        Neu tai khoan ton tai, lien ket dat lai mat khau da duoc gui den{' '}
                        <span className="font-medium text-slate-700">{email}</span>.
                    </p>
                </motion.div>
            )}

            <div className="mt-8 text-center">
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
