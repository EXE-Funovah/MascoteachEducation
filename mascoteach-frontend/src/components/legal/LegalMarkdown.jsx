import { Fragment } from 'react';

const HEADING_STYLES = {
  h1: 'text-3xl font-black tracking-tight text-[#173154] md:text-4xl',
  h2: 'mt-12 text-2xl font-black tracking-tight text-[#173154] md:text-[2rem]',
  h3: 'mt-8 text-lg font-bold text-[#173154] md:text-xl',
};

const BLOCK_SPACING = {
  p: 'mt-5 text-base leading-8 text-slate-700 md:text-[1.05rem]',
  ul: 'mt-4 space-y-3 pl-6 text-base leading-8 text-slate-700 md:text-[1.05rem]',
  ol: 'mt-4 space-y-3 pl-6 text-base leading-8 text-slate-700 md:text-[1.05rem]',
  hr: 'my-10 border-slate-200',
};

const BLOCK_STARTERS = [/^#{1,3}\s+/, /^[-*]\s+/, /^\d+\.\s+/, /^---+$/];

function isBlockStart(line) {
  return BLOCK_STARTERS.some((pattern) => pattern.test(line));
}

function renderInline(text, keyPrefix) {
  const tokens = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|https?:\/\/[^\s)]+|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi);

  return tokens.filter(Boolean).map((token, index) => {
    const key = `${keyPrefix}-${index}`;

    if (/^\*\*[^*]+\*\*$/.test(token)) {
      return <strong key={key} className="font-bold text-slate-900">{token.slice(2, -2)}</strong>;
    }

    if (/^\*[^*]+\*$/.test(token)) {
      return <em key={key} className="italic text-slate-800">{token.slice(1, -1)}</em>;
    }

    if (/^`[^`]+`$/.test(token)) {
      return (
        <code key={key} className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[0.95em] text-slate-900">
          {token.slice(1, -1)}
        </code>
      );
    }

    if (/^https?:\/\//i.test(token)) {
      return (
        <a
          key={key}
          href={token}
          className="font-semibold text-[#2B7AB5] underline decoration-[#A8D8EA] underline-offset-4 transition-colors hover:text-[#173154]"
        >
          {token}
        </a>
      );
    }

    if (/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(token)) {
      return (
        <a
          key={key}
          href={`mailto:${token}`}
          className="font-semibold text-[#2B7AB5] underline decoration-[#A8D8EA] underline-offset-4 transition-colors hover:text-[#173154]"
        >
          {token}
        </a>
      );
    }

    return <Fragment key={key}>{token}</Fragment>;
  });
}

function parseMarkdown(markdown) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks = [];

  for (let index = 0; index < lines.length;) {
    const rawLine = lines[index];
    const line = rawLine.trim();

    if (!line) {
      index += 1;
      continue;
    }

    if (/^---+$/.test(line)) {
      blocks.push({ type: 'hr' });
      index += 1;
      continue;
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({
        type: `h${headingMatch[1].length}`,
        text: headingMatch[2].trim(),
      });
      index += 1;
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*]\s+/, ''));
        index += 1;
      }
      blocks.push({ type: 'ul', items });
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ''));
        index += 1;
      }
      blocks.push({ type: 'ol', items });
      continue;
    }

    const paragraph = [line];
    index += 1;

    while (index < lines.length) {
      const nextLine = lines[index].trim();
      if (!nextLine || isBlockStart(nextLine)) {
        break;
      }
      paragraph.push(nextLine);
      index += 1;
    }

    blocks.push({ type: 'p', text: paragraph.join(' ') });
  }

  return blocks;
}

export default function LegalMarkdown({ markdown }) {
  const blocks = parseMarkdown(markdown);

  return (
    <div>
      {blocks.map((block, index) => {
        if (block.type === 'hr') {
          return <hr key={`hr-${index}`} className={BLOCK_SPACING.hr} />;
        }

        if (block.type === 'ul') {
          return (
            <ul key={`ul-${index}`} className={`${BLOCK_SPACING.ul} list-disc`}>
              {block.items.map((item, itemIndex) => (
                <li key={`ul-${index}-${itemIndex}`}>{renderInline(item, `ul-${index}-${itemIndex}`)}</li>
              ))}
            </ul>
          );
        }

        if (block.type === 'ol') {
          return (
            <ol key={`ol-${index}`} className={`${BLOCK_SPACING.ol} list-decimal`}>
              {block.items.map((item, itemIndex) => (
                <li key={`ol-${index}-${itemIndex}`}>{renderInline(item, `ol-${index}-${itemIndex}`)}</li>
              ))}
            </ol>
          );
        }

        if (block.type === 'p') {
          return (
            <p key={`p-${index}`} className={BLOCK_SPACING.p}>
              {renderInline(block.text, `p-${index}`)}
            </p>
          );
        }

        const HeadingTag = block.type;
        return (
          <HeadingTag key={`${block.type}-${index}`} className={HEADING_STYLES[block.type]}>
            {renderInline(block.text, `${block.type}-${index}`)}
          </HeadingTag>
        );
      })}
    </div>
  );
}
