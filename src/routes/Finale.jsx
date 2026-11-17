import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import * as d3 from 'd3';
import { W, createCtx, finaleArt } from '../story/scenes.js';
import { stops } from '../story/stops.js';

export default function Finale() {
  const ref = useRef(null);
  const gatherRef = useRef(null);
  const [gathered, setGathered] = useState(false);

  useEffect(() => {
    const svg = d3.select(ref.current).attr('viewBox', `0 0 ${W} 230`);
    const ctx = createCtx();
    gatherRef.current = finaleArt(svg, ctx, () => setGathered(true));
    ctx.after(() => gatherRef.current?.(), 1600);
    return () => { ctx.clear(); svg.selectAll('*').interrupt(); svg.selectAll('*').remove(); };
  }, []);

  return (
    <section className="finale">
      <span className="eyebrow">The last page</span>
      <h1>Her story so far</h1>
      <p className="story-line">
        It all started with one suitcase on a grey morning. Now there's a girl reading by the sea,
        in a life she built with her own two hands,
      </p>
      <div className="scene finale-art">
        <svg ref={ref} role="img" aria-label="Many small dots, one for each person she met, gathering into a heart around her name" />
      </div>
      <p className={`story-line closing ${gathered ? 'in' : ''}`}>
        and a trail of people across the UK who still smile when they hear her name. 💛
      </p>
      <div className="actions">
        <button type="button" className="btn" onClick={() => gatherRef.current?.()}>Gather them again</button>
        <Link to="/chapter/1" className="btn primary">Read it again</Link>
      </div>
      <div className="chapters">
        <span className="eyebrow">Revisit a chapter</span>
        <ol>
          {stops.map((s, i) => (
            <li key={s.title}><Link to={`/chapter/${i + 1}`}>{s.title}</Link></li>
          ))}
        </ol>
      </div>
    </section>
  );
}
