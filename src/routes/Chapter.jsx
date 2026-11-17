import { useEffect, useRef, useState } from 'react';
import { redirect, useLoaderData, useNavigate } from 'react-router';
import Scene from '../components/Scene.jsx';
import { stops } from '../story/stops.js';

export function chapterLoader({ params }) {
  const n = Number(params.n);
  if (!Number.isInteger(n) || n < 1 || n > stops.length) throw redirect('/');
  return { index: n - 1 };
}

export default function Chapter() {
  const { index } = useLoaderData();
  const stop = stops[index];
  const navigate = useNavigate();
  const [shown, setShown] = useState(1);
  const lastRef = useRef(null);
  const touch = useRef(null);
  const all = shown >= stop.text.length;
  const isLast = index === stops.length - 1;

  const next = () => navigate(isLast ? '/finale' : `/chapter/${index + 2}`);
  const prev = () => navigate(index === 0 ? '/' : `/chapter/${index}`);
  const revealMore = () => setShown((s) => Math.min(s + 1, stop.text.length));
  const advance = () => (all ? next() : revealMore());

  const keys = useRef();
  keys.current = { advance, prev };
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest('button, a, [role=button], input, textarea')) return;
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); keys.current.advance(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); keys.current.prev(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (shown > 1) lastRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [shown]);

  const onTouchStart = (e) => { const t = e.touches[0]; touch.current = { x: t.clientX, y: t.clientY }; };
  const onTouchEnd = (e) => {
    if (!touch.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.current.x, dy = t.clientY - touch.current.y;
    touch.current = null;
    if (Math.abs(dx) < 60 || Math.abs(dy) > 50) return;
    if (dx < 0) advance(); else prev();
  };

  return (
    <article className="chapter" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="chapter-head">
        <span className="eyebrow">Chapter {index + 1}</span>
        <h1>{stop.title}</h1>
      </div>

      <Scene stop={stop} />

      <div className="story" onClick={() => !all && revealMore()}>
        {stop.text.slice(0, shown).map((p, k) => (
          <p key={k} className="reveal" ref={k === shown - 1 ? lastRef : null}>{p}</p>
        ))}
        <div className="pips" aria-hidden="true">
          {stop.text.map((_, k) => <span key={k} className={k < shown ? 'on' : ''} />)}
        </div>
      </div>

      <nav className="nav">
        <button type="button" className="btn" onClick={prev}>Back</button>
        {all ? (
          <button type="button" className="btn primary glow" onClick={next}>
            {isLast ? 'Turn to the last page' : `Next: ${stops[index + 1].title}`}
          </button>
        ) : (
          <button type="button" className="btn primary" onClick={revealMore}>Keep reading</button>
        )}
      </nav>
    </article>
  );
}
