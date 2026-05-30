import { Heart, MessageCircle, Sprout } from 'lucide-react';

const HIGHLIGHTS = [
  {
    title: 'Học tập cá nhân hóa',
    description: 'Nội dung phù hợp với năng lực và mục tiêu của từng học sinh.',
    icon: Sprout,
  },
  {
    title: 'Hiểu mạch học của từng em',
    description: 'Nhìn vào tiến độ bài học để nhắc đúng lúc, đúng phần kiến thức cần ôn lại.',
    icon: MessageCircle,
  },
  {
    title: 'Xây dựng thói quen tốt',
    description: 'Đồng hành mỗi ngày để hình thành thói quen tự học bền vững.',
    icon: Heart,
  },
];

export default function UnderHeroImage() {
  return (
    <section className="relative overflow-hidden bg-[#FFFDF7]" aria-labelledby="sumadi-intro-title">
      <img
        src="/images/herosection/under_hero.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full select-none object-cover object-bottom"
        draggable="false"
      />
      <div className="relative w-full px-6 pb-20 pt-14 sm:pb-24 sm:pt-18 lg:px-[clamp(4rem,7.2vw,9rem)] lg:pb-28 lg:pt-20">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[minmax(0,0.53fr)_minmax(560px,0.47fr)] lg:gap-[5vw]">
          <div>
            <h2
              id="sumadi-intro-title"
              className="max-w-[920px] text-[clamp(2.35rem,3.7vw,4.65rem)] font-extrabold leading-[1.08] tracking-normal text-[#173154]"
            >
              <span className="text-[#6DA6E8]">Sumadi:</span>
              <span className="block">Người bạn đồng hành học tập tương tác cho học sinh</span>
            </h2>

            <div className="mt-8 max-w-[830px] space-y-4 text-base font-medium leading-8 text-[#2F3D52] sm:text-lg">
              <p>
                Nhiều học sinh gặp khó khăn trong việc duy trì động lực, sự tập trung và thói quen học tập mỗi ngày.
              </p>
              <p>
                Sumadi là người bạn học tập thông minh, biết học sinh đang ở đâu trong bài và nhẹ nhàng gợi ý khi các em bắt đầu chậm nhịp.
              </p>
              <p>
                Từ việc khám phá kiến thức mới đến xây dựng thói quen tự học, Sumadi giúp việc học trở nên thú vị và gần gũi hơn.
              </p>
            </div>
          </div>

          <div className="grid w-full max-w-[780px] justify-self-center">
            {HIGHLIGHTS.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="grid grid-cols-[96px_1fr] items-center gap-6 border-b border-[#DCEEFF] py-7 first:pt-0 last:border-b-0 last:pb-0"
                >
                  <div className="flex h-[84px] w-[84px] items-center justify-center rounded-full bg-[#9BC7F4] text-white shadow-[0_16px_34px_rgba(109,166,232,0.24)]">
                    <Icon className="h-10 w-10" strokeWidth={2.7} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold leading-snug tracking-normal text-[#6DA6E8]">
                      {item.title}
                    </h3>
                    <p className="mt-1 max-w-[650px] text-base font-medium leading-7 text-[#2F3D52] sm:text-lg">
                      {item.description}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
