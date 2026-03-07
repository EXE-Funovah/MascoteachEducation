import { LOGOS } from '@/lib/constants';
import FadeInUp from '@/components/animations/FadeInUp';

export default function SocialProofMarquee() {
  const duplicatedLogos = [...LOGOS, ...LOGOS, ...LOGOS, ...LOGOS, ...LOGOS, ...LOGOS];

  return (
    <section className="py-12 md:py-16 bg-white/80 backdrop-blur-sm border-y border-slate-100/60" aria-label="Đối tác tin cậy">
      <div className="max-w-7xl mx-auto px-6">
        <FadeInUp>
          <p className="text-center text-xs font-semibold text-ink-muted tracking-widest uppercase mb-10">
            Được tin dùng bởi các trường học hàng đầu
          </p>
        </FadeInUp>

        <div className="marquee-container overflow-hidden">
          <div className="flex gap-16 md:gap-24 animate-marquee items-center">
            {duplicatedLogos.map((logo, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 flex items-center justify-center px-4 opacity-70 hover:opacity-100 transition-all duration-500"
              >
                <img
                  src={logo.src}
                  alt={logo.name}
                  className="h-14 md:h-16 w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
