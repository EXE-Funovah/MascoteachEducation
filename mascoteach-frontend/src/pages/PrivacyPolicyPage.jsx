import { useState } from 'react';
import LegalPageLayout from '@/components/legal/LegalPageLayout';
import { privacyPolicyContent, privacyPolicyEffectiveDate } from '@/content/privacyPolicyContent';

const LANGUAGES = ['vi', 'en'];

export default function PrivacyPolicyPage() {
  const [language, setLanguage] = useState('vi');
  const content = privacyPolicyContent[language];

  return (
    <LegalPageLayout
      eyebrow={content.eyebrow}
      title={content.title}
      summary={content.summary}
      backHomeLabel={content.backHomeLabel}
      actions={
        <div
          className="inline-flex rounded-full border border-[#D8E5F2] bg-white p-1 shadow-[0_10px_24px_rgba(23,49,84,0.06)]"
          role="tablist"
          aria-label="Privacy policy language"
        >
          {LANGUAGES.map((lang) => {
            const active = lang === language;
            const label = privacyPolicyContent[lang].languageLabel;

            return (
              <button
                key={lang}
                type="button"
                role="tab"
                aria-selected={active}
                className={[
                  'rounded-full px-4 py-2 text-sm font-bold transition-colors',
                  active ? 'bg-[#173154] text-white' : 'text-[#173154] hover:bg-[#F7FBFF]',
                ].join(' ')}
                onClick={() => setLanguage(lang)}
              >
                {label}
              </button>
            );
          })}
        </div>
      }
    >
      <div className="mb-8 rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-3 text-sm font-semibold text-slate-700">
        {content.effectiveDateLabel}: <span className="text-slate-900">{privacyPolicyEffectiveDate}</span>
      </div>

      <div className="space-y-10">
        {content.sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-2xl font-black tracking-tight text-[#173154]">{section.title}</h2>

            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph} className="mt-4 text-base leading-8 text-slate-700 md:text-[1.05rem]">
                {paragraph}
              </p>
            ))}

            {section.bullets?.length ? (
              <ul className="mt-4 list-disc space-y-3 pl-6 text-base leading-8 text-slate-700 md:text-[1.05rem]">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>
    </LegalPageLayout>
  );
}
