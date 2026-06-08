export const YISSIAN_RULES = [
  {
    suffix: '-iss',
    when: 'Short / front vowels',
    detail: 'a, e, i, bare-u, oo, ea, ei, ie, ai, ay',
    examples: [['hell', 'hiss'], ['moon', 'miss'], ['yeah', 'yiss']],
  },
  {
    suffix: '-riss',
    when: 'Back / round vowels',
    detail: 'o, ou, ow, ue, ui, ew, au, aw, oi, oy — r-glide suppressed if onset ends in r',
    examples: [['go', 'griss'], ['boy', 'briss'], ['dark', 'driss']],
  },
  {
    suffix: '-rid',
    when: 'Completive class',
    detail: '-er, -le, -ness, -ment, -ful stripped → stem + rid · -ies/-ied/-ed/consonant+y → onset + id · r-colored short vowel (arm, park) → word + rid · n\'t contractions → no-apo form + rid · magic-e long-u (cute, tube) → stem + rid',
    examples: [['better', 'bettrid'], ['arm', 'armrid'], ['cute', 'cutrid']],
  },
  {
    suffix: "-issin'",
    when: 'Gerunds',
    detail: "Words ending -ing or -in'",
    examples: [['fucking', "fissin'"], ['downloading', "dissin'"]],
  },
  {
    suffix: 'base + -ly',
    when: 'Adverbs',
    detail: 'Transform the base word, then re-attach -ly',
    examples: [['really', 'rissly'], ['quickly', 'quickridly']],
  },
  {
    suffix: 'stem + -riss',
    when: 'Magic-e long vowel (a / i / o)',
    detail: 'VCe words: keep full stem, append -riss (or -iss if onset ends in r)',
    examples: [['blade', 'bladriss'], ['bite', 'bitriss'], ['mode', 'modriss']],
  },
];

function RuleCard({ rule }) {
  return (
    <section className="rules-card">
      <div className="rule-head">
        <span className="suffix">{rule.suffix}</span>
        <span className="rule-note">{rule.when}</span>
      </div>
      <p className="rule-detail">{rule.detail}</p>
      <div className="rule-examples">
        {rule.examples.map(([a, b]) => (
          <span key={a} className="rule-pair">
            <span className="rule-ex-in">{a}</span>
            <span className="rule-arrow"> → </span>
            <em>{b}</em>
          </span>
        ))}
      </div>
    </section>
  );
}

export default function Rules() {
  return (
    <article className="about">
      <h2 className="about-h2">Dialect Rules</h2>
      <p>
        Every word keeps its <em>onset</em> — the initial consonant cluster before the first vowel.
        The vowel nucleus and coda are replaced by a suffix chosen by the table below.
        Function words, numbers, IPs, and URLs pass through unchanged.
      </p>

      <div className="rules-page-grid">
        {YISSIAN_RULES.map(r => <RuleCard key={r.suffix} rule={r} />)}

        <section className="rules-card">
          <div className="rule-head">
            <span className="suffix">preserved</span>
            <span className="rule-note">verbatim pass-through</span>
          </div>
          <p className="rule-detail">Function words, numbers, IPs, and URLs are always passed through unchanged.</p>
          <div className="rule-examples">
            <span className="rule-pair">
              <span className="rule-ex-in">a, an, the, and, or, I, you, he, she, it, is, be, was…</span>
            </span>
          </div>
        </section>
      </div>

      <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>
        ~45 hand-tuned override words (steak, night, can&apos;t, it&apos;s, etc.) fetched from yissian.json and merged at startup.
      </p>
    </article>
  );
}
