import { motion, useReducedMotion } from 'framer-motion';
import { Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SITE } from '@/lib/constants';

const FOOTER_COLUMNS = [
  {
    title: 'Khám phá',
    links: [
      { label: 'Cách hoạt động', href: '/#how-it-works' },
      { label: 'Dành cho ai', href: '/#targeting' },
      { label: 'Bảng giá', href: '/pricing' },
    ],
  },
  {
    title: 'Bắt đầu',
    links: [
      { label: 'Đăng ký giáo viên', href: '/register' },
      { label: 'Đăng nhập', href: '/signin' },
      { label: 'Tham gia phòng', href: '/play' },
    ],
  },
];

const SOCIAL_LINKS = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/profile.php?id=61589751325252',
    icon: '/images/facebook_logo.webp',
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@mascoteach',
    icon: '/images/tiktok_logo.webp',
  },
];

export default function Footer({ withOverlappingCta = false }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.footer
      className={`bg-[#EAF4FF] ${withOverlappingCta ? 'pt-36 md:pt-44' : 'pt-12 md:pt-16'}`}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="w-full overflow-hidden bg-white shadow-[0_-18px_70px_rgba(27,58,107,0.10)]">
        <div className={`mx-auto grid max-w-7xl gap-10 px-6 pb-14 sm:px-10 md:grid-cols-2 lg:grid-cols-[1.7fr_1fr_1fr_1.4fr] lg:px-16 ${withOverlappingCta ? 'pt-24 md:pt-28' : 'pt-14'}`}>
          <div className="md:col-span-2 lg:col-span-1">
            <Link to="/" className="mb-5 inline-block">
              <img src="/images/Logo_Redesign.webp" alt={SITE.name} className="h-14 w-auto max-w-[240px] object-contain" />
            </Link>
            <p className="max-w-[340px] text-base font-medium leading-8 text-ink/70 md:text-lg">
              {SITE.description}
            </p>
            <div className="mt-7 flex gap-3">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(43,122,181,0.16)]"
                  aria-label={social.label}
                >
                  <img src={social.icon} alt="" className="h-full w-full rounded-full object-cover" />
                </a>
              ))}
            </div>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h4 className="mb-5 text-base font-semibold text-ink md:text-lg">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-base font-medium text-ink/72 transition-colors hover:text-brand-blue md:text-lg"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h4 className="mb-5 text-base font-semibold text-ink md:text-lg">Liên hệ</h4>
            <ul className="space-y-4 text-base font-medium text-ink/72 md:text-lg">
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 flex-none text-[#4E79E6]" strokeWidth={2.4} />
                <a href="mailto:support@mascoteach.com" className="transition-colors hover:text-brand-blue">
                  support@mascoteach.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 flex-none text-[#4E79E6]" strokeWidth={2.4} />
                <span>FPT University, TP. Hồ Chí Minh</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 border-t border-[#E5EAF1] px-6 py-7 text-center sm:px-10 md:flex-row md:text-left lg:px-16">
          <p className="text-[15px] font-medium text-ink/66 md:text-base">
            © Copyright by Mascoteach. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[15px] font-medium text-ink/66 md:text-base">
            <Link to="/privacy" className="transition-colors hover:text-brand-blue">
              Chính sách bảo mật
            </Link>
            <Link to="/terms" className="transition-colors hover:text-brand-blue">
              Điều khoản sử dụng
            </Link>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
