import { useState } from 'react';

export const HISTORY_KEY = 'yissian_history_web';
const HISTORY_MAX = 20;
const INTENSITY_LABELS = ['Off', 'Light', 'Half', 'Most', 'Full'];
const INTENSITY_STEPS = [0, 25, 50, 75, 100];

export function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
  catch { return []; }
}

export function saveHistoryEntry(entry) {
  const hist = loadHistory();
  // skip exact duplicate at top
  if (hist.length > 0 && hist[0].input === entry.input && hist[0].output === entry.output) return hist;
  const deduped = hist.filter(h => !(h.input === entry.input && h.output === entry.output));
  const updated = [
    { ...entry, id: Date.now(), timestamp: Date.now(), starred: false },
    ...deduped,
  ].slice(0, HISTORY_MAX);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  return updated;
}

function persistToggleStar(id) {
  const hist = loadHistory().map(h => h.id === id ? { ...h, starred: !h.starred } : h);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
  return hist;
}

function intensityLabel(intensity) {
  const idx = INTENSITY_STEPS.indexOf(intensity);
  return idx >= 0 ? INTENSITY_LABELS[idx] : null;
}

export default function History({ onRestore }) {
  const [entries, setEntries] = useState(() => loadHistory());

  const sorted = [
    ...entries.filter(h => h.starred),
    ...entries.filter(h => !h.starred),
  ];

  const handleStar = (id) => setEntries(persistToggleStar(id));

  const handleClear = () => {
    localStorage.removeItem(HISTORY_KEY);
    setEntries([]);
  };

  if (entries.length === 0) {
    return (
      <div className="history">
        <p className="history-empty">
          No history yet — translate something and Copy it to save it here.
        </p>
      </div>
    );
  }

  return (
    <div className="history">
      <div className="history-header">
        <span className="history-count">{entries.length} of {HISTORY_MAX} entries</span>
        <button className="btn-link" onClick={handleClear}>Clear all</button>
      </div>

      {sorted.map(entry => {
        const label = intensityLabel(entry.intensity);
        const meta = [
          entry.dialect,
          label && entry.intensity < 100 ? label : null,
          new Date(entry.timestamp).toLocaleDateString(),
        ].filter(Boolean).join(' · ');

        return (
          <div key={entry.id} className={`history-item ${entry.starred ? 'history-item--starred' : ''}`}>
            <button className="star-btn" onClick={() => handleStar(entry.id)} aria-label="Toggle star">
              {entry.starred ? '⭐' : '☆'}
            </button>
            <button className="history-content" onClick={() => onRestore(entry)}>
              <div className="history-input">{entry.input}</div>
              <div className="history-output">{entry.output}</div>
              <div className="history-meta">{meta}</div>
            </button>
          </div>
        );
      })}
    </div>
  );
}
