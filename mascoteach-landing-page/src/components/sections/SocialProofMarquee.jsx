import { LOGOS } from '@/lib/constants';
import FadeInUp from '@/components/animations/FadeInUp';

export default function SocialProofMarquee() {
  const duplicatedLogos = [...LOGOS, ...LOGOS, ...LOGOS, ...LOGOS];

  return (
    <section className="py-12 md:py-16 bg-white/80 backdrop-blur-sm border-y border-slate-100/60" aria-label="Đối tác tin cậy">
      <div className="max-w-7xl mx-auto px-6">
        <FadeInUp>
          <p className="text-center text-xs font-semibold text-ink-muted tracking-widest uppercase mb-10">
            Được tin dùng bởi các trường học hàng đầu
          </p>
        </FadeInUp>

        <div className="marquee-container overflow-hidden">
          <div className="flex gap-12 md:gap-20 animate-marquee">
            {duplicatedLogos.map((logo, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 flex items-center justify-center h-10 px-4 opacity-30 hover:opacity-60 transition-all duration-500 grayscale hover:grayscale-0"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shadow-sm">
                    <span className="text-xs font-bold text-slate-500">
                      {logo.name.charAt(0)}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-slate-500 whitespace-nowrap tracking-tight">
                    {logo.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
