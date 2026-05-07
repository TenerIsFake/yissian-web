import { useState, useMemo } from 'react';
import { translateToDialect, translatePigLatin, translatePootie } from 'yissian-engine';

function getTranslator(dialect) {
  if (dialect === 'Pig Latin') return translatePigLatin;
  if (dialect === 'Pootie Tang') return translatePootie;
  return translateToDialect;
}

const TEXTS = [
  {
    id: 'hamlet',
    title: 'Hamlet — To be, or not to be',
    author: 'William Shakespeare',
    year: 'c. 1600',
    body: `To be, or not to be, that is the question:
Whether 'tis nobler in the mind to suffer
The slings and arrows of outrageous fortune,
Or to take arms against a sea of troubles
And by opposing end them. To die—to sleep,
No more; and by a sleep to say we end
The heartache and the thousand natural shocks
That flesh is heir to: 'tis a consummation
Devoutly to be wish'd. To die, to sleep;
To sleep, perchance to dream—ay, there's the rub:
For in that sleep of death what dreams may come
When we have shuffled off this mortal coil
Must give us pause.`,
  },
  {
    id: 'gettysburg',
    title: 'The Gettysburg Address',
    author: 'Abraham Lincoln',
    year: '1863',
    body: `Four score and seven years ago our fathers brought forth on this continent a new nation, conceived in liberty and dedicated to the proposition that all men are created equal.

Now we are engaged in a great civil war, testing whether that nation, or any nation so conceived and so dedicated, can long endure. We are met on a great battlefield of that war. We have come to dedicate a portion of that field as a final resting place for those who here gave their lives that that nation might live.

It is altogether fitting and proper that we should do this. But, in a larger sense, we cannot dedicate, we cannot consecrate, we cannot hallow this ground. The brave men, living and dead, who struggled here have consecrated it far above our poor power to add or detract.

The world will little note nor long remember what we say here, but it can never forget what they did here. It is for us the living rather to be dedicated here to the unfinished work which they who fought here have thus far so nobly advanced.`,
  },
  {
    id: 'genesis',
    title: 'Genesis 1:1–5',
    author: 'King James Bible',
    year: '1611',
    body: `In the beginning God created the heaven and the earth. And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.

And God said, Let there be light: and there was light. And God saw the light, that it was good: and God divided the light from the darkness. And God called the light Day, and the darkness he called Night. And the evening and the morning were the first day.`,
  },
  {
    id: 'cave',
    title: 'Allegory of the Cave (excerpt)',
    author: 'Plato, The Republic',
    year: 'c. 375 BC',
    body: `Imagine human beings living in an underground dwelling, like a cave, with an entrance open to the light. They have been there since childhood, with their necks and legs chained so they cannot move — they can only see what is in front of them. Behind them a fire is burning at a distance, and between the fire and the prisoners there is a wall, like the screen at a puppet show.

Other people walk behind this wall carrying objects whose shadows are cast on the wall in front of the prisoners. The prisoners, unable to turn their heads, can see only these shadows. To them the shadows are reality.

Now consider what it would be like for one of them to be released from his chains. He would be forced to stand up and turn around and walk toward the light. He would suffer pain and confusion, and the brightness of the light would prevent him from seeing the very objects whose shadows he had previously taken for reality.`,
  },
  {
    id: 'preamble',
    title: 'Preamble to the Constitution',
    author: 'United States, 1787',
    year: '1787',
    body: `We the People of the United States, in Order to form a more perfect Union, establish Justice, insure domestic Tranquility, provide for the common defence, promote the general Welfare, and secure the Blessings of Liberty to ourselves and our Posterity, do ordain and establish this Constitution for the United States of America.`,
  },
  {
    id: 'odyssey',
    title: 'The Odyssey — Opening (trans. Fagles)',
    author: 'Homer',
    year: 'c. 800 BC',
    body: `Sing to me of the man, Muse, the man of twists and turns
driven time and again off course, once he had plundered
the hallowed heights of Troy.
Many cities of men he saw and learned their minds,
many pains he suffered, heartsick on the open sea,
fighting to save his life and bring his comrades home.
But he could not save them from disaster, hard as he strove —
the recklessness of their own ways destroyed them all.`,
  },
];

export default function Read({ dialect = 'Yissian' }) {
  const [selectedId, setSelectedId] = useState(TEXTS[0].id);
  const [showOriginal, setShowOriginal] = useState(false);

  const text = TEXTS.find(t => t.id === selectedId);
  const translate = getTranslator(dialect);

  const translated = useMemo(
    () => text.body.split('\n').map(line => line ? translate(line) : ''),
    [text, translate],
  );

  return (
    <div className="read">
      <div className="read-controls">
        <div className="read-select-wrap">
          <select
            className="read-select"
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
          >
            {TEXTS.map(t => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
        </div>
        <button
          className="btn btn-muted read-toggle"
          onClick={() => setShowOriginal(v => !v)}
        >
          {showOriginal ? 'Hide Original' : 'Show Original'}
        </button>
      </div>

      <div className="read-meta">
        <span className="read-author">{text.author}</span>
        <span className="read-year">{text.year}</span>
      </div>

      <div className={`read-columns ${showOriginal ? 'read-columns--split' : ''}`}>
        <div className="read-pane">
          <div className="read-pane-label">{dialect}</div>
          <div className="read-body read-body--yiss">
            {translated.map((line, i) => (
              <p key={i} className={line ? 'read-line' : 'read-spacer'}>{line}</p>
            ))}
          </div>
        </div>

        {showOriginal && (
          <div className="read-pane">
            <div className="read-pane-label">Original</div>
            <div className="read-body">
              {text.body.split('\n').map((line, i) => (
                <p key={i} className={line ? 'read-line' : 'read-spacer'}>{line}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
