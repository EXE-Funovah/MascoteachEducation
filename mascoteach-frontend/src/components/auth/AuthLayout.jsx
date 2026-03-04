import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

/**
 * Shared layout wrapper for all auth pages.
 * Renders a full-viewport gradient background with decorative floating
 * elements and a centered white card for form content.
 */
export default function AuthLayout({ children }) {
    return (
        <div className="auth-bg min-h-screen flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
            {/* ── Decorative floating blobs ── */}
            <div className="auth-blob auth-blob--1" aria-hidden="true" />
            <div className="auth-blob auth-blob--2" aria-hidden="true" />
            <div className="auth-blob auth-blob--3" aria-hidden="true" />

            {/* Subtle grid lines */}
            <div className="auth-grid" aria-hidden="true" />

            {/* ── Card ── */}
            <motion.div
                className="auth-card"
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
            >
                {/* Brand header */}
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 mb-2 text-sm font-semibold tracking-wide uppercase text-brand-blue hover:text-brand-navy transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 rounded"
                    aria-label="Go to homepage"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
                    </svg>
                    Mascoteach
                </Link>

                {children}
            </motion.div>

            {/* Footer */}
            <p className="mt-8 text-xs text-slate-400 relative z-10">
                © {new Date().getFullYear()} Mascoteach. All rights reserved.
            </p>
        </div>
    );
}
