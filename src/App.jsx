import { useState, useEffect } from 'react';
import { translateToDialect, mergeOverrides } from 'yissian-engine';
import './App.css';

const OVERRIDES_URL =
  'https://raw.githubusercontent.com/TenerIsFake/homepage-claude/master/yissian.json';
const CACHE_KEY = 'yissian_overrides_web';
const CACHE_TTL = 24 * 60 * 60 * 1000;

async function loadOverrides() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { fetchedAt, overrides } = JSON.parse(cached);
      if (Date.now() - fetchedAt < CACHE_TTL) { mergeOverrides(overrides); return; }
    }
    const res = await fetch(OVERRIDES_URL);
    if (!res.ok) return;
    const data = await res.json();
    if (data?.overrides && typeof data.overrides === 'object' && !Array.isArray(data.overrides)) {
      mergeOverrides(data.overrides);
      localStorage.setItem(CACHE_KEY, JSON.stringify({ fetchedAt: Date.now(), overrides: data.overrides }));
    }
  } catch { /* use bundled defaults */ }
}

function CopyButton({ text }) {
  const [label, setLabel] = useState('Copy');
  const handle = async () => {
    await navigator.clipboard.writeText(text);
    setLabel('Copied!');
    setTimeout(() => setLabel('Copy'), 1500);
  };
  return <button className="btn" onClick={handle} disabled={!text}>{label}</button>;
}

function ShareButton({ text }) {
  if (typeof navigator === 'undefined' || !navigator.share) return null;
  return <button className="btn" onClick={() => navigator.share({ text })} disabled={!text}>Share</button>;
}

export default function App() {
  const [input, setInput] = useState('');
  const output = input ? translateToDialect(input) : '';

  useEffect(() => { loadOverrides(); }, []);

  return (
    <div className="app">
      <header className="header">
        <h1 className="logo">Yissian <span className="accent">Translator</span></h1>
        <p className="tagline">Preserve the onset. Replace the nucleus.</p>
      </header>

      <main className="main">
        <section className="card">
          <label className="field-label">Input</label>
          <textarea
            className="textarea"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type anything…"
            rows={5}
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
          />

          <label className="field-label">Yissian</label>
          <div className="output-box">
            {output
              ? <p className="output-text">{output}</p>
              : <p className="placeholder">Translation appears here</p>
            }
          </div>

          <div className="actions">
            <CopyButton text={output} />
            <ShareButton text={output} />
            <button className="btn btn-muted" onClick={() => setInput('')} disabled={!input}>Clear</button>
          </div>
        </section>

        <aside className="sidebar">
          <section className="rules-card">
            <h2 className="rules-title">Quick Reference</h2>
            <table className="rules-table">
              <tbody>
                <tr><td className="suffix">-iss</td><td>Short/front vowels — hell → <em>hiss</em></td></tr>
                <tr><td className="suffix">-riss</td><td>Round/back vowels — go → <em>griss</em></td></tr>
                <tr><td className="suffix">-rid</td><td>Completive — better → <em>bettrid</em></td></tr>
                <tr><td className="suffix">-issin&apos;</td><td>Gerunds — fucking → <em>fissin&apos;</em></td></tr>
                <tr><td className="suffix">+ly</td><td>Adverbs — really → <em>rissly</em></td></tr>
              </tbody>
            </table>
          </section>

          {/* AdSense — replace publisher/slot IDs after AdSense approval */}
          <div className="ad-unit" aria-label="Advertisement">
            <ins
              className="adsbygoogle"
              style={{ display: 'block' }}
              data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
              data-ad-slot="XXXXXXXXXX"
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          </div>
        </aside>
      </main>

      <footer className="footer">
        <a href="https://tenerisfake.github.io/privacy.html">Privacy Policy</a>
        {' · '}
        <a href="https://github.com/TenerIsFake/yissian-engine">Open Source</a>
        {' · '}
        No data collected. Runs entirely in your browser.
      </footer>
    </div>
  );
}
