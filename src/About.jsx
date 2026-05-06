export default function About() {
  return (
    <article className="about">
      <h2 className="about-h2">What is Yissian?</h2>
      <p>
        Yissian is a constructed phonological dialect — a systematic set of sound-substitution
        rules applied to standard English text. Unlike slang or argot, which replace words
        arbitrarily, Yissian operates on the <em>structure</em> of each word: it preserves
        whatever comes before the first vowel (the <strong>onset</strong>), then replaces
        the vowel nucleus and everything after it with one of four suffixes. The result is a
        dialect that sounds unmistakably alien yet remains phonetically consistent — once you
        know the rules, you can read and produce it fluently.
      </p>

      <h2 className="about-h2">The Core Rules</h2>
      <p>
        Every word in Yissian is transformed by the same four-step process. First, the
        consonant cluster at the start of the word is identified and kept intact — this is
        the onset. Then the vowel nucleus (the main vowel sound of the word) determines
        which suffix gets appended:
      </p>
      <ul className="about-list">
        <li>
          <strong>-iss</strong> replaces front and short vowels (a, e, i). Words like
          <em> hell</em>, <em>think</em>, and <em>win</em> become <em>hiss</em>,{' '}
          <em>thiss</em>, and <em>wiss</em>.
        </li>
        <li>
          <strong>-riss</strong> replaces round and back vowels (o, ou, oo, ow). Words
          like <em>go</em>, <em>bold</em>, and <em>cool</em> become <em>griss</em>,{' '}
          <em>briss</em>, and <em>criss</em>.
        </li>
        <li>
          <strong>-rid</strong> is the completive suffix — it applies to words with
          morphological endings like -er, -le, -ness, -ment, and -ful, or words with
          r-colored vowels. <em>Better</em> becomes <em>bettrid</em>, <em>apple</em>{' '}
          becomes <em>apprid</em>.
        </li>
        <li>
          <strong>-issin&apos;</strong> is the gerundive suffix for -ing and -in&apos; endings.
          <em> Running</em> becomes <em>rissin&apos;</em>, <em>going</em> becomes{' '}
          <em>gissin&apos;</em>.
        </li>
      </ul>
      <p>
        Function words — pronouns, articles, prepositions, conjunctions — are preserved
        verbatim. Numbers, URLs, and tokens with no vowels also pass through unchanged.
        Adverbs ending in <em>-ly</em> have their base word transformed, then <em>-ly</em>{' '}
        is reattached: <em>really</em> → <em>rissly</em>, <em>badly</em> → <em>bissly</em>.
      </p>

      <h2 className="about-h2">Magic-E and Compounds</h2>
      <p>
        English&apos;s silent terminal <em>e</em> (the &ldquo;magic-e&rdquo; pattern) is handled
        specially. In words like <em>blade</em>, <em>cute</em>, or <em>white</em>, the
        engine reads the full vowel class of the stem before deciding on a suffix, then
        drops the terminal e: <em>blade</em> → <em>bladriss</em>, <em>cute</em> →{' '}
        <em>cutrid</em>. Hyphenated compounds are split at the hyphen and each segment
        transformed independently, so the rhythm of compound words is preserved.
      </p>

      <h2 className="about-h2">Sample Passage</h2>
      <p className="about-sample-label">English:</p>
      <blockquote className="about-quote">
        The quick brown fox jumps over the lazy dog. Hell yeah, that&apos;s really something else.
        We&apos;re going to need a bigger boat.
      </blockquote>
      <p className="about-sample-label">Yissian:</p>
      <blockquote className="about-quote about-quote--yiss">
        The criss briss friss jriss griss the lissly driss. Hiss yiss, thiss rissly sriss
        riss. We&apos;re gissin&apos; to niss a brigrid briss.
      </blockquote>

      <h2 className="about-h2">Lexical Overrides</h2>
      <p>
        Some words have fixed substitutions that override the rule engine — these are cases
        where the phonological output of the rules would be ambiguous, awkward, or where a
        more idiomatic Yissian form exists. For example, <em>yeah</em> → <em>yiss</em>,{' '}
        <em>right</em> → <em>riss</em>, and <em>y&apos;all</em> → <em>yinz</em>. The override
        list is maintained as an open JSON file and can be updated without changing the
        engine itself.
      </p>

      <h2 className="about-h2">Open Source</h2>
      <p>
        The Yissian engine is published as an open-source npm package under the MIT
        license. It has no runtime dependencies and runs entirely in the browser — no text
        you type is ever sent to a server. The translator on this site, the mobile app, and
        any third-party integrations all use the same engine package.
      </p>
      <p>
        Contributions to the override dictionary, bug reports, and rule refinements are
        welcome via the{' '}
        <a href="https://github.com/TenerIsFake/yissian-engine" className="about-link">
          GitHub repository
        </a>
        .
      </p>
    </article>
  );
}
