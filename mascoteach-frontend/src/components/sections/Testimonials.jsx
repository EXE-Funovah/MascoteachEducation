import { useEffect, useState } from 'react';
import FadeInUp from '@/components/animations/FadeInUp';
import Carousel from '@/components/animations/Carousel';
import StickerPeel from '@/components/animations/StickerPeel';
import Badge from '@/components/common/Badge';
import { TESTIMONIALS } from '@/lib/constants';

const STICKERS = [
  {
    src: '/images/happy_face.png',
    width: 120,
    rotate: -12,
    peelDirection: -15,
    style: { top: '6%', left: '4%' },
  },
  {
    src: '/images/happy_face.png',
    width: 100,
    rotate: 18,
    peelDirection: 10,
    style: { bottom: '8%', right: '5%' },
  },
  {
    src: '/images/happy_face.png',
    width: 100,
    rotate: 8,
    peelDirection: 10,
    style: { top: '10%', right: '6%' },
  },
  {
    src: '/images/happy_face.png',
    width: 90,
    rotate: -20,
    peelDirection: -10,
    style: { bottom: '12%', left: '6%' },
  },
  {
    src: '/images/happy_face.png',
    width: 110,
    rotate: 15,
    peelDirection: -20,
    style: { top: '50%', left: '3%' },
  },
  {
    src: '/images/happy_face.png',
    width: 95,
    rotate: -8,
    peelDirection: 15,
    style: { top: '45%', right: '4%' },
  },
];

const AVATAR_GRADIENTS = [
  'from-brand-navy to-brand-blue',
  'from-brand-blue to-brand-mid',
  'from-brand-mid to-brand-light',
  'from-sky-400 to-blue-500',
  'from-amber-300 to-orange-400',
  'from-emerald-300 to-teal-400',
];

function StarRating() {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className="h-5 w-5 text-amber-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const [baseWidth, setBaseWidth] = useState(550);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 640) setBaseWidth(w - 48);
      else if (w < 1024) setBaseWidth(480);
      else setBaseWidth(550);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderTestimonialCard = (item, index) => (
    <div className="flex min-h-[320px] h-full w-full flex-col justify-between rounded-xl bg-white/95 backdrop-blur-sm p-8 shadow-card-pastel border border-gray-100/80">
      <div>
        <StarRating />
        <p className="mt-5 text-lg leading-relaxed text-ink-secondary">
          &ldquo;{item.quote}&rdquo;
        </p>
      </div>
      <div className="mt-6 flex items-center gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length]}`}
        >
          <span className="text-base font-bold text-white">
            {item.name.charAt(0)}
          </span>
        </div>
        <div>
          <p className="text-base font-semibold text-ink">{item.name}</p>
          <p className="text-sm text-ink-muted">{item.role}</p>
        </div>
      </div>
    </div>
  );

  return (
    <section
      id="testimonials"
      className="py-24 md:py-32 mesh-testimonials relative overflow-hidden"
      aria-label="Đánh giá"
    >
      <div className="orb orb-lavender w-[350px] h-[350px] top-10 -right-20 opacity-25" />
      <div className="orb orb-peach w-[250px] h-[250px] bottom-20 -left-16 opacity-20" />

      {/* Stickers — draggable within the entire section */}
      {STICKERS.map((sticker, i) => (
        <StickerPeel
          key={i}
          imageSrc={sticker.src}
          width={sticker.width}
          rotate={sticker.rotate}
          peelBackHoverPct={30}
          peelBackActivePct={40}
          shadowIntensity={0.5}
          lightingIntensity={0.1}
          initialPosition="center"
          peelDirection={sticker.peelDirection}
          className={`hidden lg:block`}
          style={sticker.style}
        />
      ))}

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <FadeInUp>
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <Badge color="orange" className="mb-4">
              Đánh giá
            </Badge>
            <h2 className="text-display-md md:text-display-lg">
              Được yêu thích bởi
              <br className="hidden md:block" />
              <span className="md:whitespace-nowrap">giáo viên thực thụ</span>
            </h2>
            <p className="mt-6 text-body-lg text-ink-secondary">
              Những câu chuyện từ các giáo viên, phụ huynh và nhà quản lý
              trường học.
            </p>
          </div>
        </FadeInUp>

        <FadeInUp delay={0.2}>
          <div className="flex justify-center">
            <Carousel
              items={TESTIMONIALS}
              baseWidth={baseWidth}
              autoplay
              autoplayDelay={4000}
              pauseOnHover
              loop
              renderItem={renderTestimonialCard}
            />
          </div>
        </FadeInUp>
      </div>
    </section>
  );
}


