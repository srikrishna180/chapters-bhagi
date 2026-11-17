import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { W, createCtx } from '../story/scenes.js';

/** Mounts one chapter's D3 scene and its controls, and tears everything down on leave. */
export default function Scene({ stop }) {
  const svgRef = useRef(null);
  const ctrlRef = useRef(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const ctrl = d3.select(ctrlRef.current);
    svg.selectAll('*').remove();
    ctrl.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${W} ${stop.h}`);
    const ctx = createCtx({ rerender: () => setVersion((v) => v + 1) });
    stop.scene(svg, ctrl, ctx);
    return () => {
      ctx.clear();
      svg.selectAll('*').interrupt();
      svg.selectAll('*').remove();
      ctrl.selectAll('*').remove();
    };
  }, [stop, version]);

  return (
    <>
      <div className="scene">
        <svg ref={svgRef} role="img" aria-label={stop.alt} />
      </div>
      <div className="actions" ref={ctrlRef} />
    </>
  );
}
