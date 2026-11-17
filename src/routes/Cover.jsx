import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import * as d3 from 'd3';
import { W, coverArt, createCtx } from '../story/scenes.js';
import { stops } from '../story/stops.js';

export default function Cover() {
  const ref = useRef(null);

  useEffect(() => {
    const svg = d3.select(ref.current).attr('viewBox', `0 0 ${W} 200`);
    const ctx = createCtx();
    coverArt(svg, ctx);
    return () => { ctx.clear(); svg.selectAll('*').remove(); };
  }, []);

  return (
    <section className="cover">
      <div className="scene cover-art"><svg ref={ref} role="img" aria-label="A dotted trail from the rain to a sunny sea, with a small suitcase travelling along it" /></div>
      <div className="cover-text">
        <span className="eyebrow">A story in {stops.length} short chapters</span>
        <h1 className="cover-title">Bhagi</h1>
        <p className="lede">One suitcase, a grey morning, and a life she built with her own two hands.</p>
        <Link to="/chapter/1" className="btn primary big">Begin her story</Link>
        <p className="how">Tap the buttons under each picture to play the scene. Swipe or use the arrow keys to turn the page.</p>
      </div>
    </section>
  );
}
