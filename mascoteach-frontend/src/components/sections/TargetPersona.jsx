import { motion, useReducedMotion } from 'framer-motion';
import FadeInUp from '@/components/animations/FadeInUp';
import { TARGET_PERSONA } from '@/lib/constants';

function PersonaPortrait({ persona }) {
  return (
    <div className="target-persona-photo">
      <img
        src={persona.image}
        alt={`${persona.name} - ${persona.role}`}
        className="h-full w-full object-cover"
      />

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#071426]/58 via-[#071426]/18 to-transparent px-3.5 pb-3 pt-14 text-white">
        <h3 className="text-lg font-semibold leading-none tracking-normal drop-shadow-sm md:text-xl">
          {persona.name}
        </h3>
        <div className="mt-2 flex max-w-[92%] flex-wrap gap-1.5">
          {persona.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="rounded-full bg-white px-2.5 py-1 text-xs font-medium leading-none text-[#0F172A] shadow-[0_6px_18px_rgba(15,23,42,0.12)]">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function MiniList({ title, items }) {
  return (
    <div>
      <p className="text-base font-semibold text-sky-500 md:text-lg">{title}</p>
      <ul className="mt-2.5 space-y-2">
        {items.slice(0, 2).map((item) => (
          <li key={item} className="flex gap-2 text-base font-medium leading-8 text-ink/72 md:text-lg">
            <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-sky-300" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PersonaCard({ persona, index }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.article
      initial={shouldReduceMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      whileHover={shouldReduceMotion ? undefined : { y: -3 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{
        delay: shouldReduceMotion ? 0 : index * 0.12,
        duration: shouldReduceMotion ? 0 : 0.58,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="target-persona-card"
    >
      <PersonaPortrait persona={persona} />

      <div className="grid min-w-0 content-between gap-5 py-1">
        <p className="rounded-[1.5rem] bg-white px-5 py-3.5 text-base font-semibold leading-8 text-ink/82 shadow-[0_14px_38px_rgba(63,133,181,0.08)] md:text-lg">
          {persona.quote}
        </p>

        <div className="grid gap-6 lg:grid-cols-2">
          <MiniList title="Nỗi đau" items={persona.painpoints} />
          <MiniList title="Nhu cầu" items={persona.needs} />
        </div>

        <div className="border-t border-sky-200/70 pt-4">
          <p className="text-base font-semibold text-sky-500 md:text-lg">Tình huống sử dụng</p>
          <p className="mt-2 text-base font-medium leading-8 text-ink/72 md:text-lg">
            {persona.scenario}
          </p>
        </div>
      </div>
    </motion.article>
  );
}

export default function TargetPersona() {
  const { eyebrow, title, subtitle, personas } = TARGET_PERSONA;

  return (
    <section id="targeting" className="relative overflow-hidden bg-white py-20 md:py-28" aria-label="Đối tượng mục tiêu">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[360px] bg-gradient-to-b from-sky-50/70 via-white to-white" />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <FadeInUp>
          <div className="max-w-[820px]">
            <p className="text-base font-semibold text-sky-400 md:text-lg">{eyebrow}</p>
            <h2 className="mt-5 max-w-[900px] text-4xl font-bold leading-tight text-ink md:text-[42px] lg:text-5xl">
              {title}
            </h2>
            <p className="mt-6 max-w-3xl text-base font-medium leading-8 text-ink/70 md:text-lg">
              {subtitle}
            </p>
          </div>
        </FadeInUp>

        <div className="mt-12 space-y-7">
          {personas.map((persona, index) => (
            <PersonaCard key={persona.id} persona={persona} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
