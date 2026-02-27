import { LOGOS } from '@/lib/constants';
import FadeInUp from '@/components/animations/FadeInUp';

export default function SocialProofMarquee() {
  const duplicatedLogos = [...LOGOS, ...LOGOS, ...LOGOS, ...LOGOS];

  return (
    <section className="py-20 bg-white border-y border-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <FadeInUp>
          <p className="text-center text-sm font-medium text-ink-muted tracking-wide uppercase mb-12">
            Được tin dùng bởi các trường học hàng đầu
          </p>
        </FadeInUp>

        <div className="marquee-container overflow-hidden">
          <div className="flex gap-16 animate-marquee">
            {duplicatedLogos.map((logo, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 flex items-center justify-center h-10 px-6 opacity-40 hover:opacity-70 transition-opacity duration-300 grayscale hover:grayscale-0"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center">
                    <span className="text-xs font-bold text-slate-500">
                      {logo.name.charAt(0)}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-slate-400 whitespace-nowrap">
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
