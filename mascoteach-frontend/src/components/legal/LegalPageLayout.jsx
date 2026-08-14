import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function LegalPageLayout({
  eyebrow,
  title,
  summary,
  actions,
  backHomeLabel = 'Quay lại trang chủ',
  children,
}) {
  return (
    <div className="min-h-screen bg-surface font-sans antialiased">
      <Header />
      <main className="relative overflow-hidden px-6 pb-20 pt-32 md:pt-36">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[320px] bg-[radial-gradient(circle_at_top,rgba(91,174,212,0.16),transparent_62%)]" />
        <div className="relative mx-auto max-w-5xl">
          <div className="rounded-[32px] border border-white/80 bg-white/92 p-8 shadow-[0_28px_90px_rgba(15,23,42,0.08)] backdrop-blur-xl md:p-12">
            <div className="max-w-3xl">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#2B7AB5]">{eyebrow}</p>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-[#173154] md:text-5xl">{title}</h1>
              {summary && <p className="mt-5 text-base leading-8 text-slate-600 md:text-lg">{summary}</p>}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  to="/"
                  className="inline-flex items-center rounded-full border border-[#D8E5F2] bg-[#F7FBFF] px-4 py-2 text-sm font-bold text-[#173154] transition-colors hover:border-[#BFD8FA] hover:bg-white"
                >
                  {backHomeLabel}
                </Link>
                {actions}
              </div>
            </div>

            <div className="mt-12 rounded-[28px] border border-slate-100 bg-[#FCFEFF] p-6 md:p-10">
              {children}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
