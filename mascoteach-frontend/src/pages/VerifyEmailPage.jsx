import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, MailWarning } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import { verifyEmail } from '@/services/authService';

export default function VerifyEmailPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = useMemo(() => searchParams.get('token') || '', [searchParams]);
    const [status, setStatus] = useState(token ? 'verifying' : 'error');
    const [message, setMessage] = useState(
        token
            ? 'Mascoteach đang xác thực email của bạn.'
            : 'Mascoteach chưa thể xác thực email từ liên kết này. Vui lòng mở lại email xác thực mới nhất hoặc tạo tài khoản lại nếu liên kết đã cũ.'
    );

    useEffect(() => {
        if (!token) return;

        let active = true;

        async function confirmEmail() {
            try {
                const result = await verifyEmail({ token });
                if (!active) return;

                setStatus('success');
                setMessage(result?.message || 'Email đã được xác thực thành công. Bạn có thể đăng nhập ngay bây giờ.');

                window.setTimeout(() => {
                    navigate('/signin', {
                        replace: true,
                        state: { message: 'Email đã được xác thực. Vui lòng đăng nhập để tiếp tục.' },
                    });
                }, 1800);
            } catch (err) {
                if (!active) return;

                setStatus('error');
                setMessage('Mascoteach chưa thể xác thực email từ liên kết này. Vui lòng mở lại email xác thực mới nhất hoặc tạo tài khoản lại nếu liên kết đã cũ.');
            }
        }

        confirmEmail();

        return () => {
            active = false;
        };
    }, [navigate, token]);

    const isVerifying = status === 'verifying';
    const isSuccess = status === 'success';

    return (
        <AuthLayout>
            <motion.div
                className="py-6 text-center"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div
                    className={
                        isSuccess
                            ? 'mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500'
                            : isVerifying
                                ? 'mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-sky-50 text-brand-blue'
                                : 'mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-500'
                    }
                >
                    {isSuccess && <CheckCircle2 size={32} strokeWidth={2.2} />}
                    {isVerifying && <Loader2 size={31} strokeWidth={2.2} className="animate-spin" />}
                    {!isSuccess && !isVerifying && <MailWarning size={31} strokeWidth={2.2} />}
                </div>

                <header className="auth-form-header">
                    <h1>
                        {isSuccess
                            ? 'Xác thực email thành công'
                            : isVerifying
                                ? 'Đang xác thực email'
                                : 'Không thể xác thực email'}
                    </h1>
                    <p>{message}</p>
                </header>

                {isSuccess && (
                    <div className="auth-alert auth-alert--success mt-5" role="status">
                        Bạn sẽ được chuyển về trang đăng nhập trong giây lát.
                    </div>
                )}

                {!isVerifying && (
                    <div className="mt-7 flex flex-col gap-3">
                        <Link to="/signin" className="auth-btn auth-btn--primary">
                            Đến trang đăng nhập
                            <ArrowRight size={17} strokeWidth={2.2} />
                        </Link>
                        {!isSuccess && (
                            <Link
                                to="/register"
                                className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-brand-blue transition-colors hover:text-brand-navy"
                            >
                                <ArrowLeft size={16} />
                                Tạo tài khoản mới
                            </Link>
                        )}
                    </div>
                )}
            </motion.div>
        </AuthLayout>
    );
}
