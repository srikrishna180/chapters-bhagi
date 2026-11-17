import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { stops } from '../story/stops.js';
import { C, prefersReducedMotion } from '../story/scenes.js';

const mapW = 360;
const mapH = 140;

/** The journey trail across the top: one dot per chapter, a suitcase that travels between them. */
export default function Trail({ current, onSelect }) {
  const ref = useRef(null);
  const api = useRef(null);
  const selectRef = useRef(onSelect);
  selectRef.current = onSelect;

  useEffect(() => {
    const svg = d3.select(ref.current).attr('viewBox', `0 0 ${mapW} ${mapH}`);
    svg.selectAll('*').remove();
    const pts = stops.map((s, i) => [24 + i * (312 / (stops.length - 1)), 74 + 38 * Math.sin(i * 1.15 + 0.3)]);

    const grad = svg.append('defs').append('linearGradient').attr('id', 'trailGrad')
      .attr('gradientUnits', 'userSpaceOnUse').attr('x1', 0).attr('x2', mapW).attr('y1', 0).attr('y2', 0);
    grad.append('stop').attr('offset', 0).attr('stop-color', '#8a95a8');
    grad.append('stop').attr('offset', 0.55).attr('stop-color', C.gold);
    grad.append('stop').attr('offset', 1).attr('stop-color', C.sea);

    svg.append('text').attr('x', 12).attr('y', 18).attr('class', 'trail-label').text('UK arrivals');
    svg.append('text').attr('x', mapW - 12).attr('y', 132).attr('text-anchor', 'end').attr('class', 'trail-label').text('the sea');

    const line = d3.line().curve(d3.curveCatmullRom.alpha(0.5));
    svg.append('path').attr('d', line(pts)).attr('fill', 'none').attr('stroke', '#3a4864')
      .attr('stroke-width', 3).attr('stroke-dasharray', '2 6').attr('stroke-linecap', 'round');
    const trail = svg.append('path').attr('d', line(pts)).attr('fill', 'none').attr('stroke', 'url(#trailGrad)')
      .attr('stroke-width', 4).attr('stroke-linecap', 'round');
    const L = trail.node().getTotalLength();
    trail.attr('stroke-dasharray', `${L} ${L}`).attr('stroke-dashoffset', L);

    const samples = [];
    for (let l = 0; l <= L; l += 1) { const p = trail.node().getPointAtLength(l); samples.push([l, p.x, p.y]); }
    const lens = pts.map(([x, y]) => d3.least(samples, (s) => (s[1] - x) ** 2 + (s[2] - y) ** 2)[0]);

    const nodes = svg.selectAll('g.node').data(stops).join('g').attr('class', 'node')
      .attr('transform', (d, i) => `translate(${pts[i][0]},${pts[i][1]})`)
      .attr('tabindex', 0).attr('role', 'button').attr('aria-label', (d, i) => `Chapter ${i + 1}: ${d.title}`)
      .on('click', (e, d) => selectRef.current(stops.indexOf(d)))
      .on('keydown', (e, d) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); selectRef.current(stops.indexOf(d)); }
      });
    nodes.append('circle').attr('r', 15).attr('fill', 'transparent');
    nodes.append('circle').attr('class', 'dot').attr('r', 6);
    nodes.append('title').text((d, i) => `${i + 1}. ${d.title}`);

    const marker = svg.append('g').style('pointer-events', 'none');
    marker.append('path').attr('d', 'M-3,-27 v-3 h6 v3').attr('fill', 'none').attr('stroke', C.gold).attr('stroke-width', 1.6);
    marker.append('rect').attr('x', -7).attr('y', -27).attr('width', 14).attr('height', 11).attr('rx', 2).attr('fill', C.gold);
    marker.attr('transform', `translate(${pts[0][0]},${pts[0][1]})`);

    api.current = { trail, L, lens, nodes, marker, at: 0 };
    return () => { svg.selectAll('*').interrupt(); svg.selectAll('*').remove(); api.current = null; };
  }, []);

  useEffect(() => {
    const a = api.current;
    if (!a || current < 0) return;
    const reduce = prefersReducedMotion();
    const from = a.lens[a.at], to = a.lens[current];
    const d = reduce ? 0 : Math.min(1400, 300 + Math.abs(to - from) * 3);
    a.trail.transition().duration(d).ease(d3.easeCubicInOut).attr('stroke-dashoffset', a.L - to);
    a.marker.transition().duration(d).ease(d3.easeCubicInOut).attrTween('transform', () => (t) => {
      const p = a.trail.node().getPointAtLength(from + (to - from) * t);
      return `translate(${p.x},${p.y})`;
    });
    a.nodes.classed('done', (x, j) => j < current).classed('current', (x, j) => j === current)
      .select('.dot').attr('r', (x, j) => (j === current ? 9 : 6));
    a.at = current;
  }, [current]);

  return (
    <div className="trail">
      <svg ref={ref} role="group" aria-label="Bhagi's journey, one dot per chapter" />
    </div>
  );
}
