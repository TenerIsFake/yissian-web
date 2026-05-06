import { useState, useEffect } from 'react';
import { translateToDialect, mergeOverrides } from 'yissian-engine';
import About from './About';
import Read from './Read';
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

const NAV = ['Translate', 'Read', 'About'];

export default function App() {
  const [input, setInput] = useState('');
  const [page, setPage] = useState('Translate');
  const output = input ? translateToDialect(input) : '';

  useEffect(() => { loadOverrides(); }, []);

  return (
    <div className="app">
      <header className="header">
        <div className="header-top">
          <div>
            <h1 className="logo">Yissian <span className="accent">Translator</span></h1>
            <p className="tagline" title="Preserve the onset. Replace the nucleus.">Priss the Onsetrid; Repliss the Niss. Yiss!</p>
          </div>
          <nav className="nav">
            {NAV.map(p => (
              <button
                key={p}
                className={`nav-btn ${page === p ? 'nav-btn--active' : ''}`}
                onClick={() => setPage(p)}
              >{p}</button>
            ))}
          </nav>
        </div>
      </header>

      {page === 'About' && <About />}
      {page === 'Read' && <Read />}

      <main className="main" style={page !== 'Translate' ? { display: 'none' } : {}}>
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
              : <p className="placeholder" title="Translation appears here">Triss iss hererid</p>
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
                <tr><td className="suffix">y&apos;all</td><td>Lexical — y&apos;all → <em>yinz</em></td></tr>
              </tbody>
            </table>
          </section>

          <section className="rules-card">
            <h2 className="rules-title">Rules & Examples</h2>
            <div className="rule-blocks">
              <div className="rule-block">
                <div className="rule-head"><span className="suffix">-iss</span><span className="rule-note">front vowels — a, e, i</span></div>
                <div className="rule-ex">hell → <em>hiss</em> · think → <em>thiss</em> · win → <em>wiss</em></div>
              </div>
              <div className="rule-block">
                <div className="rule-head"><span className="suffix">-riss</span><span className="rule-note">back/round vowels — o, ou, oo…</span></div>
                <div className="rule-ex">go → <em>griss</em> · bold → <em>briss</em> · cool → <em>criss</em></div>
              </div>
              <div className="rule-block">
                <div className="rule-head"><span className="suffix">-rid</span><span className="rule-note">completive — -er, -le, -ness, -ful…</span></div>
                <div className="rule-ex">better → <em>bettrid</em> · apple → <em>apprid</em> · darkness → <em>darkrid</em></div>
              </div>
              <div className="rule-block">
                <div className="rule-head"><span className="suffix">-issin&apos;</span><span className="rule-note">gerunds — -ing / -in&apos;</span></div>
                <div className="rule-ex">going → <em>gissin&apos;</em> · running → <em>rissin&apos;</em> · fucking → <em>fissin&apos;</em></div>
              </div>
              <div className="rule-block">
                <div className="rule-head"><span className="suffix">magic-e</span><span className="rule-note">VCe keeps vowel class</span></div>
                <div className="rule-ex">blade → <em>bladriss</em> · cute → <em>cutrid</em> · white → <em>wiss</em></div>
              </div>
              <div className="rule-block">
                <div className="rule-head"><span className="suffix">+ly</span><span className="rule-note">adverbs re-attach -ly</span></div>
                <div className="rule-ex">really → <em>rissly</em> · badly → <em>bissly</em></div>
              </div>
              <div className="rule-block">
                <div className="rule-head"><span className="suffix">lexical</span><span className="rule-note">fixed substitutions</span></div>
                <div className="rule-ex">y&apos;all → <em>yinz</em> · yeah → <em>yiss</em> · right → <em>riss</em></div>
              </div>
            </div>
          </section>
        </aside>
      </main>

      <footer className="footer">
        <a href="https://tenerisfake.github.io/privacy.html">Privacy Policy</a>
        {' · '}
        <a href="https://github.com/TenerIsFake/yissian-engine">Open Source</a>
        {' · '}
        No data collected. Runs entirely in your browser.
        <br />
        <span className="footer-credit">app by Tendrid</span>
      </footer>
    </div>
  );
}
