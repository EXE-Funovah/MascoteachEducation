import FadeInUp from '@/components/animations/FadeInUp';
import Iridescence from '@/components/animations/Iridescence';
import RotatingText from '@/components/animations/RotatingText';
import Button from '@/components/common/Button';
import { CTA } from '@/lib/constants';

export default function CTASection() {
  return (
    <section className="relative overflow-hidden" aria-label="Kêu gọi hành động">
      {/* ── Iridescence WebGL background ── */}
      <div className="py-24 md:py-32 lg:py-40 relative">
        {/* WebGL canvas layer */}
        <div className="absolute inset-0 z-0">
          <Iridescence
            color={[0.2, 0.4, 0.7]}
            mouseReact
            amplitude={0.1}
            speed={0.5}
          />
        </div>

        {/* ── Content ── */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <FadeInUp>

            <h2 className="text-display-sm md:text-display-md lg:text-display-lg text-white mx-auto leading-tight">
              <span className="block sm:whitespace-nowrap">Biến học tập thành Trải nghiệm,</span>
              <span className="block sm:whitespace-nowrap">Biến giảng dạy thành</span>
              <span className="flex justify-center mt-2">
                <RotatingText
                texts={['Nghệ thuật', 'Đam mê', 'Sự thăng hoa', 'Nguồn cảm hứng']}
                mainClassName="inline-flex px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-xl overflow-hidden"
                splitLevelClassName="overflow-hidden"
                staggerFrom="last"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '-120%' }}
                staggerDuration={0.025}
                transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                rotationInterval={2500}
              />
              </span>
            </h2>

            <p className="mt-6 md:mt-8 text-body-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
              Ứng dụng AI thông minh giúp giáo viên tinh gọn quá trình chuẩn bị, mang đến không gian
              tương tác sinh động để học sinh chủ động tiếp thu kiến thức.
            </p>

            <div className="mt-10 md:mt-12 flex items-center justify-center">
              <Button
                variant="secondary"
                size="xl"
                className="bg-white text-brand-navy border-white/20 hover:bg-white/90 hover:text-brand-navy shadow-lg hover:shadow-xl font-bold"
                href="/signup"
              >
                {CTA.cta_primary}
              </Button>
            </div>

            {/* Trust stats */}
            <div className="mt-8 flex items-center justify-center gap-4 text-sm text-white/70">
              <span>Miễn phí 14 ngày</span>
              <span className="text-white/30">|</span>
              <span>Không cần thẻ tín dụng</span>
            </div>
          </FadeInUp>
        </div>
      </div>
    </section>
  );
}
