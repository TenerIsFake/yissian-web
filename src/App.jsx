import { useState, useEffect, useMemo } from 'react';
import { translateToDialect, translatePigLatin, translatePootie, mergeOverrides } from 'yissian-engine';
import About from './About';
import Read from './Read';
import Phrases from './Phrases';
import History, { saveHistoryEntry } from './History';
import WebTranslate from './WebTranslate';
import Rules from './Rules';
import './App.css';

const DIALECTS = ['Yissian', 'Pig Latin', 'Pootie Tang'];
const INTENSITY_STEPS = [0, 25, 50, 75, 100];
const INTENSITY_LABELS = ['Off', 'Light', 'Half', 'Most', 'Full'];

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

function getBaseTranslator(dialect) {
  if (dialect === 'Pig Latin') return translatePigLatin;
  if (dialect === 'Pootie Tang') return translatePootie;
  return translateToDialect;
}

function translateWithIntensity(text, intensity, translator) {
  if (!text) return '';
  if (intensity === 0) return text;
  if (intensity === 100) return translator(text);
  const level = INTENSITY_STEPS.indexOf(intensity);
  const tokens = text.split(/(\s+)/);
  let wordIdx = 0;
  return tokens.map(tok => {
    if (/^\s+$/.test(tok)) return tok;
    return (wordIdx++ % 4) < level ? translator(tok) : tok;
  }).join('');
}

function WordChips({ output, input }) {
  const [active, setActive] = useState(null);
  const outWords = output.split(' ').filter(Boolean);
  const inWords = input.split(' ').filter(Boolean);
  return (
    <div className="chips-wrap">
      {outWords.map((word, i) => {
        const orig = inWords[i] || word;
        const same = word.toLowerCase() === orig.toLowerCase();
        const isActive = active === i;
        return (
          <span key={i} className="chip-slot">
            <button
              className={`chip ${!same ? 'chip--translated' : ''} ${isActive ? 'chip--active' : ''}`}
              onClick={() => !same && setActive(isActive ? null : i)}
              disabled={same}
            >
              {word}
            </button>
            {isActive && !same && <span className="chip-tooltip">{orig}</span>}
          </span>
        );
      })}
    </div>
  );
}

function CopyButton({ text, onCopy }) {
  const [label, setLabel] = useState('Copy');
  const handle = async () => {
    await navigator.clipboard.writeText(text);
    setLabel('Copied!');
    setTimeout(() => setLabel('Copy'), 1500);
    onCopy?.();
  };
  return <button className="btn" onClick={handle} disabled={!text}>{label}</button>;
}

function ShareButton({ input, output }) {
  if (typeof navigator === 'undefined' || !navigator.share) return null;
  const card = `✨ Yissian Translator\n\n"${input}"\n  ↓\n"${output}"\n\nyissian-web`;
  return (
    <button className="btn" onClick={() => navigator.share({ text: card })} disabled={!output}>
      Share
    </button>
  );
}

const NAV = ['Translate', 'Phrases', 'Rules', 'History', 'Web', 'Read', 'About'];

export default function App() {
  const [input, setInput] = useState('');
  const [page, setPage] = useState('Translate');
  const [dialect, setDialect] = useState('Yissian');
  const [intensity, setIntensity] = useState(100);
  const [wordMode, setWordMode] = useState(false);

  useEffect(() => { loadOverrides(); }, []);

  const output = useMemo(() => {
    const tr = getBaseTranslator(dialect);
    return translateWithIntensity(input, intensity, tr);
  }, [input, intensity, dialect]);

  const wordCountBadge = useMemo(() => {
    const level = INTENSITY_STEPS.indexOf(intensity);
    if (level <= 0 || level >= INTENSITY_STEPS.length - 1) return null;
    const words = input.trim().split(/\s+/).filter(Boolean);
    if (!words.length) return null;
    const count = words.filter((_, i) => (i % 4) < level).length;
    return `~${count} of ${words.length} words translated`;
  }, [input, intensity]);

  const handleSave = () => {
    if (input && output && output !== input) {
      saveHistoryEntry({ input, output, dialect, intensity });
    }
  };

  const handleRestore = (entry) => {
    setInput(entry.input);
    setDialect(entry.dialect ?? 'Yissian');
    setIntensity(entry.intensity ?? 100);
    setPage('Translate');
  };

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
        <div className="dialect-nav">
          {DIALECTS.map(d => (
            <button
              key={d}
              className={`nav-btn dialect-btn ${dialect === d ? 'nav-btn--active' : ''}`}
              onClick={() => setDialect(d)}
            >{d}</button>
          ))}
        </div>
      </header>

      {page === 'About' && <About />}
      {page === 'Read' && <Read dialect={dialect} />}
      {page === 'Rules' && <Rules />}
      {page === 'Phrases' && <Phrases dialect={dialect} />}
      {page === 'History' && <History onRestore={handleRestore} />}
      {page === 'Web' && <WebTranslate dialect={dialect} />}

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

          <div className="intensity-row">
            {INTENSITY_STEPS.map((step, idx) => (
              <button
                key={step}
                className={`intensity-btn ${intensity === step ? 'intensity-btn--active' : ''}`}
                onClick={() => setIntensity(step)}
              >
                {INTENSITY_LABELS[idx]}
              </button>
            ))}
          </div>
          {wordCountBadge && <p className="word-count-badge">{wordCountBadge}</p>}

          <div className="output-header">
            <label className="field-label">{dialect}</label>
            {output && (
              <button
                className={`word-mode-toggle ${wordMode ? 'word-mode-toggle--active' : ''}`}
                onClick={() => setWordMode(v => !v)}
              >
                Word mode
              </button>
            )}
          </div>

          <div className="output-box">
            {output
              ? wordMode
                ? <WordChips output={output} input={input} />
                : <p className="output-text">{output}</p>
              : <p className="placeholder" title="Translation appears here">Triss iss hererid</p>
            }
          </div>

          <div className="actions">
            <CopyButton text={output} onCopy={handleSave} />
            <ShareButton input={input} output={output} />
            <button className="btn btn-muted" onClick={() => setInput('')} disabled={!input}>Clear</button>
          </div>
        </section>

        <aside className="sidebar">
          {dialect === 'Yissian' && <>
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
          </>}

          {dialect === 'Pig Latin' && <section className="rules-card">
            <h2 className="rules-title">Pig Latin Rules</h2>
            <div className="rule-blocks">
              <div className="rule-block">
                <div className="rule-head"><span className="suffix">+way</span><span className="rule-note">word starts with a vowel</span></div>
                <div className="rule-ex">apple → <em>appleway</em> · over → <em>overway</em></div>
              </div>
              <div className="rule-block">
                <div className="rule-head"><span className="suffix">cluster+ay</span><span className="rule-note">consonant cluster moves to end</span></div>
                <div className="rule-ex">hello → <em>ellohay</em> · string → <em>ingstray</em></div>
              </div>
              <div className="rule-block">
                <div className="rule-head"><span className="suffix">qu → unit</span><span className="rule-note">&ldquo;qu&rdquo; treated as one consonant</span></div>
                <div className="rule-ex">queen → <em>eenquay</em> · quiet → <em>ietquay</em></div>
              </div>
            </div>
          </section>}

          {dialect === 'Pootie Tang' && <section className="rules-card">
            <h2 className="rules-title">Pootie Tang Lexicon</h2>
            <table className="rules-table">
              <tbody>
                <tr><td className="suffix">sa da tay</td><td>yes · okay · good</td></tr>
                <tr><td className="suffix">wa da tah</td><td>hello · hi</td></tr>
                <tr><td className="suffix">cole</td><td>cool · give</td></tr>
                <tr><td className="suffix">sepatown</td><td>stop · separate</td></tr>
                <tr><td className="suffix">nah</td><td>no</td></tr>
                <tr><td className="suffix">kine</td><td>time · know</td></tr>
                <tr><td className="suffix">mamadee</td><td>mom · mommy</td></tr>
                <tr><td className="suffix">dame</td><td>have</td></tr>
                <tr><td className="suffix">cherries</td><td>peas</td></tr>
              </tbody>
            </table>
            <p className="rule-note" style={{marginTop:'0.75rem'}}>Unmapped words pass through unchanged — that&apos;s authentic Pootie.</p>
          </section>}
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
