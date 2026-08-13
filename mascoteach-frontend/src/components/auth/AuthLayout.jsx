import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

export default function AuthLayout({ children }) {
    const location = useLocation();
    const isRegister = location.pathname.includes('register') || location.pathname.includes('signup');

    return (
        <main className="auth-bg relative min-h-dvh overflow-hidden px-5 py-5 font-sans text-ink">
            <picture className="auth-side auth-side--left" aria-hidden="true">
                <img src="/images/auth/auth-side-left.webp" alt="" />
            </picture>
            <picture className="auth-side auth-side--right" aria-hidden="true">
                <img src="/images/auth/auth-side-right.webp" alt="" />
            </picture>

            <header className="auth-topbar">
                <Link to="/" className="auth-logo" aria-label="Về trang chủ Mascoteach">
                    <img src="/images/Logo_Redesign_Text.webp" alt="Mascoteach" />
                </Link>

                <div className="auth-top-actions">
                    <Link
                        to={isRegister ? '/signin' : '/register'}
                        className="auth-top-action auth-top-action--primary"
                    >
                        {isRegister ? 'Đăng nhập' : 'Đăng ký'}
                    </Link>
                </div>
            </header>

            <motion.section
                className="auth-card"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.42, ease: [0.25, 0.4, 0.25, 1] }}
            >
                {children}
            </motion.section>
        </main>
    );
}
