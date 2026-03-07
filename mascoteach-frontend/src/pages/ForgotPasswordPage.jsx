import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthInput from '@/components/auth/AuthInput';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);

    function handleSubmit(e) {
        e.preventDefault();
        // TODO: tích hợp API gửi email reset mật khẩu
        console.log('Gửi yêu cầu đặt lại mật khẩu →', email);
        setSent(true);
    }

    return (
        <AuthLayout>
            <header className="text-center mb-8">
                <div className="mx-auto mb-5 w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-blue/15 to-brand-light/30 flex items-center justify-center">
                    <svg className="w-7 h-7 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                    Đặt lại mật khẩu
                </h1>
                <p className="mt-2 text-sm text-slate-500 max-w-xs mx-auto">
                    Nhập email của bạn, chúng tôi sẽ gửi liên kết để đặt lại mật khẩu.
                </p>
            </header>

            {!sent ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                    <AuthInput
                        id="forgot-email"
                        label="Địa chỉ Email"
                        type="email"
                        placeholder="email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <motion.button
                        type="submit"
                        className="auth-btn auth-btn--primary"
                        whileHover={{ scale: 1.015, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Gửi liên kết đặt lại
                    </motion.button>
                </form>
            ) : (
                <motion.div
                    className="text-center py-6"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                        <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                        </svg>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">Kiểm tra email của bạn</h2>
                    <p className="mt-2 text-sm text-slate-500 max-w-xs mx-auto">
                        Chúng tôi đã gửi liên kết đặt lại mật khẩu đến <span className="font-medium text-slate-700">{email}</span>.
                    </p>
                </motion.div>
            )}

            {/* Quay về đăng nhập */}
            <div className="mt-8 text-center">
                <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-brand-blue hover:text-brand-navy transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Quay về Đăng nhập
                </Link>
            </div>
        </AuthLayout>
    );
}
