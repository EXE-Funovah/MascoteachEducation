import { Link } from 'react-router-dom';
import FadeInUp from '@/components/animations/FadeInUp';
import Iridescence from '@/components/animations/Iridescence';
import Button from '@/components/common/Button';
import { CTA } from '@/lib/constants';

const CTA_LINKS = [
  { label: 'Dành cho giáo viên', href: '/product' },
  { label: 'Khám phá tính năng', href: '/features' },
  { label: 'Xem bảng giá', href: '/pricing' },
];

export default function CTASection() {
  return (
    <section className="relative overflow-hidden" aria-label="Kêu gọi hành động">
      <div className="relative py-24 md:py-32 lg:py-40">
        <div className="absolute inset-0 z-0">
          <Iridescence
            color={[0.2, 0.4, 0.7]}
            mouseReact
            amplitude={0.1}
            speed={0.5}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          <FadeInUp>
            <h2 className="mx-auto max-w-4xl text-display-sm leading-tight text-white md:text-display-md lg:text-display-lg">
              {CTA.headline}
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-body-lg leading-relaxed text-white/80 md:mt-8">
              {CTA.subheadline}
            </p>

            <div className="mt-10 flex items-center justify-center md:mt-12">
              <Button
                variant="secondary"
                size="xl"
                className="bg-white font-bold text-brand-navy shadow-lg hover:bg-white/90 hover:text-brand-navy hover:shadow-xl"
                href="/register"
              >
                {CTA.cta_primary}
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-medium text-white/72">
              {CTA_LINKS.map((link) => (
                <Link key={link.href} to={link.href} className="transition-colors hover:text-white">
                  {link.label}
                </Link>
              ))}
            </div>
          </FadeInUp>
        </div>
      </div>
    </section>
  );
}
