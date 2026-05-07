import { useState, useRef } from 'react';
import { translateToDialect, translatePigLatin, translatePootie } from 'yissian-engine';

function getTranslator(dialect) {
  if (dialect === 'Pig Latin') return translatePigLatin;
  if (dialect === 'Pootie Tang') return translatePootie;
  return translateToDialect;
}

function Block({ tag, original, translated }) {
  const [showOriginal, setShowOriginal] = useState(false);
  const text = showOriginal ? original : translated;

  const className =
    tag === 'h1' ? 'web-h1' :
    tag === 'h2' ? 'web-h2' :
    tag === 'h3' ? 'web-h3' :
    tag === 'li' ? 'web-li' :
    tag === 'blockquote' ? 'web-blockquote' :
    'web-p';

  return (
    <button className={`web-block ${className}`} onClick={() => setShowOriginal(v => !v)}>
      {tag === 'li' && <span className="web-li-bullet">•</span>}
      {text}
    </button>
  );
}

export default function WebTranslate({ dialect = 'Yissian' }) {
  const [url, setUrl] = useState('');
  const [blocks, setBlocks] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dynamicSite, setDynamicSite] = useState(false);
  const topRef = useRef(null);

  const handleFetch = async () => {
    const raw = url.trim();
    if (!raw) return;

    setLoading(true);
    setBlocks(null);
    setError(null);
    setDynamicSite(false);
    topRef.current?.scrollIntoView({ behavior: 'smooth' });

    try {
      const res = await fetch(`/fetch?url=${encodeURIComponent(raw)}`);
      const data = await res.json();

      if (!res.ok) {
        setError({ message: data.error ?? `HTTP ${res.status}`, url: raw });
        return;
      }

      if (data.blocks.length === 0) {
        setDynamicSite(true);
        return;
      }

      const translate = getTranslator(dialect);
      setBlocks(data.blocks.map(b => ({ ...b, translated: translate(b.text) })));
    } catch (e) {
      setError({ message: e.message, url: raw });
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === 'Enter') handleFetch(); };

  return (
    <div className="web-translate" ref={topRef}>
      <div className="web-bar">
        <input
          className="web-url-input"
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={handleKey}
          placeholder="https://en.wikipedia.org/wiki/…"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
        />
        <button
          className="web-go-btn"
          onClick={handleFetch}
          disabled={!url.trim() || loading}
        >
          {loading ? '…' : 'Go'}
        </button>
      </div>

      <p className="web-bar-hint">
        Works best with Wikipedia, news articles, and blogs — not apps like Twitter/X, Reddit, YouTube, or Gmail that load content dynamically.
      </p>

      <div className="web-content">
        {loading && (
          <div className="web-center">
            <span className="web-spinner" />
            <p className="web-loading-text">Fetching and translating…</p>
          </div>
        )}

        {error && (
          <div className="web-error-card">
            <div className="web-error-title">Couldn&apos;t load page</div>
            <div className="web-error-msg">{error.message}</div>
            <a className="web-error-url" href={error.url} target="_blank" rel="noopener noreferrer">
              {error.url}
            </a>
            <div className="web-error-hint">Open the link above to view it in your browser instead.</div>
          </div>
        )}

        {blocks && (
          <p className="web-tap-hint">Click any block to toggle original ↔ {dialect}</p>
        )}

        {blocks && blocks.map((b, i) => (
          <Block key={i} tag={b.tag} original={b.text} translated={b.translated} />
        ))}

        {dynamicSite && (
          <div className="web-center">
            <div className="web-empty-icon">⚙️</div>
            <div className="web-empty-title">No readable content</div>
            <p className="web-empty-hint">
              This site loads content with JavaScript, so the page arrives empty.
              <br /><br />
              Sites like these won&apos;t work:
              <br />
              Twitter/X · Reddit · YouTube · Gmail · Instagram
            </p>
            <p className="web-empty-works">Try a Wikipedia article or a news site instead.</p>
          </div>
        )}

        {!loading && !error && !blocks && !dynamicSite && (
          <div className="web-center">
            <div className="web-empty-icon">🌐</div>
            <div className="web-empty-title">Page Translator</div>
            <p className="web-empty-hint">
              Enter any article or blog URL above.<br />
              The page text will be rendered in {dialect} dialect.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
