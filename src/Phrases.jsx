import { useState, useMemo } from 'react';
import { PHRASE_PACKS } from './data/phrases';
import { translateToDialect, translatePigLatin, translatePootie } from 'yissian-engine';

function getTranslator(dialect) {
  if (dialect === 'Pig Latin') return translatePigLatin;
  if (dialect === 'Pootie Tang') return translatePootie;
  return translateToDialect;
}

function buildSections(dialect) {
  const translate = getTranslator(dialect);
  return PHRASE_PACKS.map(pack => ({
    category: pack.category,
    items: pack.phrases.map(phrase => ({
      original: phrase,
      translated: translate(phrase),
    })),
  }));
}

export default function Phrases({ dialect = 'Yissian' }) {
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(null);

  const sections = useMemo(() => buildSections(dialect), [dialect]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return sections;
    return sections
      .map(s => ({
        ...s,
        items: s.items.filter(
          it => it.original.toLowerCase().includes(q) || it.translated.toLowerCase().includes(q),
        ),
      }))
      .filter(s => s.items.length > 0);
  }, [search, sections]);

  const copy = async (text, id) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="phrases">
      <div className="phrases-search-wrap">
        <input
          className="phrases-search"
          type="text"
          placeholder="Search phrases…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
        />
        {search && (
          <button className="phrases-clear" onClick={() => setSearch('')} aria-label="Clear search">✕</button>
        )}
      </div>

      {filtered.length === 0 && (
        <p className="phrases-empty">No phrases match &ldquo;{search}&rdquo;</p>
      )}

      {filtered.map(section => (
        <div key={section.category} className="phrases-section">
          <div className="phrases-section-header">{section.category}</div>
          {section.items.map((item, i) => {
            const id = `${section.category}-${i}`;
            return (
              <div key={id} className="phrase-item">
                <div className="phrase-texts">
                  <div className="phrase-original">{item.original}</div>
                  <div className="phrase-translated">{item.translated}</div>
                </div>
                <button className="phrase-copy-btn" onClick={() => copy(item.translated, id)}>
                  {copied === id ? 'Copied!' : 'Copy'}
                </button>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
