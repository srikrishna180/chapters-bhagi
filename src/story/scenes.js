import * as d3 from 'd3';
import viewPhoto from '../assets/window-view.jpg';
import bookPhoto from '../assets/book-and-cherries.jpg';
import herPhoto from '../assets/reading-corner.jpg';

const photos = { view: viewPhoto, book: bookPhoto, her: herPhoto };

export const W = 320;
export const C = {
  bg: '#141b27', panel: '#1d2636', line: '#2f3b52', ink: '#eef1f5', muted: '#a2acbd',
  gold: '#f3c66b', sea: '#5fd0c6', pink: '#ee8fae', skin: '#d6a37f', dark: '#1a1406',
};

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Timers, intervals and simulations that all stop together when a scene unmounts. */
export function createCtx({ rerender } = {}) {
  const reduce = prefersReducedMotion();
  let live = [];
  const dur = (ms) => (reduce ? 0 : ms);
  return {
    reduce,
    dur,
    rerender: rerender || (() => {}),
    after(fn, ms) { const id = setTimeout(fn, reduce ? 0 : ms); live.push(() => clearTimeout(id)); },
    loop(fn) { if (reduce) return; const t = d3.timer(fn); live.push(() => t.stop()); },
    every(fn, ms) { if (reduce) return; const t = d3.interval(fn, ms); live.push(() => t.stop()); },
    runSim(sim, onTick) {
      live.push(() => sim.stop());
      if (reduce) { sim.stop(); sim.tick(300); onTick(); } else sim.on('tick', onTick);
    },
    clear() { live.forEach((f) => f()); live = []; },
  };
}

function btn(ctrl, label, fn) {
  return ctrl.append('button').attr('type', 'button').attr('class', 'btn').text(label).on('click', fn);
}
function hint(ctrl, text) {
  return ctrl.append('span').attr('class', 'hint').text(text);
}
function bubble(g, x, y, txt, opt = {}) {
  const w = Math.min(W - 20, txt.length * 6.3 + 24), h = 22;
  const bx = opt.right ? x - w : x;
  const b = g.append('g');
  b.append('rect').attr('x', bx).attr('y', y).attr('width', w).attr('height', h).attr('rx', 11).attr('fill', opt.fill || C.line);
  b.append('text').attr('x', bx + 12).attr('y', y + 15).style('fill', opt.color || C.ink).text(txt);
  return b;
}

/* ------------------------------------------------------------------ 1 */
export function sceneRain(svg, ctrl, ctx) {
  const defs = svg.append('defs');
  const g = defs.append('linearGradient').attr('id', 'sky0').attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', 1);
  g.append('stop').attr('offset', 0).attr('stop-color', '#3b4659');
  g.append('stop').attr('offset', 1).attr('stop-color', '#222b3b');
  svg.append('rect').attr('width', W).attr('height', 180).attr('fill', 'url(#sky0)');
  [[50, 40], [146, 28], [236, 46]].forEach(([x, y]) => {
    const c = svg.append('g').attr('fill', '#56617a');
    [[0, 0, 16], [18, -7, 21], [38, 1, 15], [18, 7, 17]].forEach(([dx, dy, r]) =>
      c.append('circle').attr('cx', x + dx).attr('cy', y + dy).attr('r', r));
  });
  svg.append('rect').attr('y', 152).attr('width', W).attr('height', 28).attr('fill', '#19202d');
  svg.append('text').attr('x', 14).attr('y', 171).attr('class', 'muted').text('UK arrivals');
  const tag = svg.append('text').attr('x', W - 14).attr('y', 171).attr('text-anchor', 'end').attr('class', 'gold').text('one suitcase, one plan');

  const walker = svg.append('g').attr('transform', 'translate(-30,0)');
  walker.append('circle').attr('cy', 112).attr('r', 7).attr('fill', C.ink);
  walker.append('rect').attr('x', -6).attr('y', 121).attr('width', 12).attr('height', 31).attr('rx', 5).attr('fill', C.sea);
  walker.append('path').attr('d', 'M14,136 v-5 h8 v5').attr('fill', 'none').attr('stroke', C.gold).attr('stroke-width', 2);
  walker.append('rect').attr('x', 10).attr('y', 136).attr('width', 16).attr('height', 16).attr('rx', 3).attr('fill', C.gold);
  const umbrella = svg.append('path').attr('d', 'M-24,0 A24,16 0 0 1 24,0 Z').attr('fill', C.pink).attr('opacity', 0);

  function walkIn() {
    walker.interrupt().attr('transform', 'translate(-30,0)')
      .transition().duration(ctx.dur(2600)).ease(d3.easeSinOut).attr('transform', 'translate(150,0)');
  }
  walkIn();

  const drops = d3.range(48).map(() => ({ x: Math.random() * W, y: Math.random() * 150, s: 1.6 + Math.random() * 2 }));
  const ln = svg.append('g').attr('stroke', '#9fb0c9').attr('stroke-opacity', 0.5).selectAll('line').data(drops).join('line');
  const draw = () => ln.attr('x1', (d) => d.x).attr('x2', (d) => d.x - 2).attr('y1', (d) => d.y).attr('y2', (d) => d.y + 7);
  draw();
  ctx.loop(() => { drops.forEach((d) => { d.y += d.s; if (d.y > 150) { d.y = -8; d.x = Math.random() * W; } }); draw(); });

  let open = false;
  const b = btn(ctrl, 'Open an umbrella', () => {
    open = !open;
    umbrella.interrupt().attr('transform', 'translate(150,100)')
      .transition().duration(ctx.dur(400)).attr('opacity', open ? 1 : 0);
    tag.text(open ? 'and not a single complaint' : 'one suitcase, one plan');
    b.text(open ? 'Close the umbrella' : 'Open an umbrella');
  });
  hint(ctrl, 'Welcome to British weather.');
}

/* ------------------------------------------------------------------ 2 */
export function sceneDay(svg, ctrl, ctx) {
  const tiles = [{ x: 40, day: 'Day 1', lab: 'Landed', on: false }, { x: 180, day: 'Day 2', lab: 'At work', on: true }];
  const groups = tiles.map((t) => {
    const g = svg.append('g').attr('transform', `translate(${t.x},30)`);
    const fg = t.on ? C.dark : C.ink;
    g.append('rect').attr('width', 100).attr('height', 104).attr('rx', 10).attr('fill', t.on ? C.gold : C.line);
    g.append('path').attr('d', 'M0,26 h100').attr('stroke', t.on ? '#c99a42' : '#45526d').attr('stroke-width', 2);
    g.append('text').attr('x', 50).attr('y', 18).attr('text-anchor', 'middle').style('fill', fg).style('font-weight', 600).text(t.day);
    g.append('text').attr('x', 50).attr('y', 72).attr('text-anchor', 'middle').style('fill', fg).style('font-size', '17px').style('font-family', 'var(--display)').text(t.lab);
    return g;
  });
  svg.append('path').attr('d', 'M148,82 h24 m-6,-5 l6,5 l-6,5').attr('fill', 'none').attr('stroke', C.muted).attr('stroke-width', 2);
  svg.append('text').attr('x', 160).attr('y', 164).attr('text-anchor', 'middle').attr('class', 'gold').text('Jet lag could wait.');
  const flip = () => {
    groups[1].interrupt().attr('transform', 'translate(230,82) scale(0)')
      .transition().delay(ctx.dur(200)).duration(ctx.dur(650)).ease(d3.easeBackOut).attr('transform', 'translate(180,30) scale(1)');
  };
  flip();
  btn(ctrl, 'Turn the page', flip);
}

/* ------------------------------------------------------------------ 3 */
export function sceneMove(svg, ctrl, ctx) {
  const house = (x, label, col) => {
    const g = svg.append('g').attr('transform', `translate(${x},104)`);
    g.append('path').attr('d', 'M-28,0 L0,-26 L28,0 Z').attr('fill', col);
    g.append('rect').attr('x', -21).attr('width', 42).attr('height', 34).attr('fill', col).attr('opacity', 0.75);
    g.append('rect').attr('x', -6).attr('y', 14).attr('width', 12).attr('height', 20).attr('fill', C.bg);
    g.append('text').attr('y', 54).attr('text-anchor', 'middle').attr('class', 'muted').text(label);
  };
  house(62, "Friends' place", '#4a5874');
  house(258, 'A new town', '#3a7076');
  // a steaming kettle in the friends' window
  const steam = svg.append('path').attr('d', 'M74,74 q-4,-6 0,-11 q4,-5 0,-10').attr('fill', 'none').attr('stroke', C.muted).attr('stroke-width', 1.5);
  ctx.loop((e) => steam.attr('opacity', 0.35 + 0.35 * Math.sin(e / 400)));
  const friends = [[22, 132], [102, 132], [30, 120]].map(([x, y]) =>
    svg.append('circle').attr('cx', x).attr('cy', y).attr('r', 5).attr('fill', C.muted));
  const arc = svg.append('path').attr('d', 'M62,70 Q160,-6 258,70').attr('fill', 'none').attr('stroke', C.muted).attr('stroke-dasharray', '3 5');
  svg.append('text').attr('x', 160).attr('y', 54).attr('text-anchor', 'middle').attr('class', 'muted').text('miles away');
  const her = svg.append('circle').attr('r', 7).attr('fill', C.gold).attr('transform', 'translate(62,70)');
  const grin = svg.append('text').attr('x', 160).attr('y', 178).attr('text-anchor', 'middle').attr('class', 'gold').attr('opacity', 0)
    .text('Her friends stared. She just grinned.');
  const L = arc.node().getTotalLength();
  function play() {
    grin.interrupt().attr('opacity', 0);
    friends.forEach((f) => f.interrupt().attr('transform', null));
    her.interrupt().attr('transform', 'translate(62,70)')
      .transition().duration(ctx.dur(2200)).ease(d3.easeCubicInOut)
      .attrTween('transform', () => (t) => { const p = arc.node().getPointAtLength(t * L); return `translate(${p.x},${p.y})`; })
      .on('end', () => {
        grin.transition().duration(ctx.dur(400)).attr('opacity', 1);
        friends.forEach((f, i) => f.transition().delay(ctx.dur(i * 120)).duration(ctx.dur(200)).attr('transform', 'translate(0,-6)')
          .transition().duration(ctx.dur(260)).ease(d3.easeBounceOut).attr('transform', 'translate(0,0)'));
      });
  }
  btn(ctrl, 'Pack the suitcase', play);
  hint(ctrl, 'Then watch her friends.');
}

/* ------------------------------------------------------------------ 4 */
export function sceneJar(svg, ctrl, ctx) {
  const max = 12; let n = 0;
  svg.append('text').attr('x', 160).attr('y', 28).attr('text-anchor', 'middle').attr('class', 'muted').text('tuition fees');
  svg.append('path').attr('d', 'M118,38 h84 v10 h-6 v94 q0,12 -12,12 h-48 q-12,0 -12,-12 v-94 h-6 Z')
    .attr('fill', 'rgba(255,255,255,.03)').attr('stroke', C.muted).attr('stroke-width', 2);
  const coins = svg.append('g');
  svg.append('text').attr('x', 18).attr('y', 62).attr('class', 'muted').text('Shifts worked');
  const num = svg.append('text').attr('x', 18).attr('y', 102).attr('class', 'gold')
    .style('font-size', '34px').style('font-family', 'var(--display)').style('font-variant-numeric', 'tabular-nums');
  svg.append('text').attr('x', 220).attr('y', 62).attr('class', 'muted').text('Paid so far');
  svg.append('rect').attr('x', 220).attr('y', 74).attr('width', 82).attr('height', 8).attr('rx', 4).attr('fill', C.line);
  const bar = svg.append('rect').attr('x', 220).attr('y', 74).attr('height', 8).attr('rx', 4).attr('fill', C.sea).attr('width', 0);
  const pct = svg.append('text').attr('x', 220).attr('y', 104).style('font-size', '16px').style('font-variant-numeric', 'tabular-nums');
  const cap = svg.append('text').attr('x', 160).attr('y', 176).attr('text-anchor', 'middle').attr('class', 'gold').attr('opacity', 0)
    .text('Paid in full. All by herself.');
  const sparkle = svg.append('g');
  const b = btn(ctrl, 'Work a shift', () => { if (n < max) drop(true); });
  hint(ctrl, 'Every tap drops a coin in the jar.');
  function drop(anim) {
    const i = n++, col = i % 3, row = Math.floor(i / 3), y = 144 - row * 20;
    coins.append('circle').attr('cx', 138 + col * 22).attr('cy', anim ? 30 : y).attr('r', 9.5)
      .attr('fill', C.gold).attr('stroke', '#b98a35').attr('stroke-width', 1.5)
      .transition().duration(anim ? ctx.dur(600) : 0).ease(d3.easeBounceOut).attr('cy', y);
    num.text(n);
    bar.transition().duration(ctx.dur(300)).attr('width', 82 * n / max);
    pct.text(Math.round(100 * n / max) + '%');
    if (n >= max) {
      cap.transition().duration(ctx.dur(400)).attr('opacity', 1);
      b.text('Paid in full').attr('disabled', true);
      d3.range(14).forEach((k) => {
        const a = (k / 14) * Math.PI * 2;
        sparkle.append('circle').attr('cx', 160).attr('cy', 90).attr('r', 2.5).attr('fill', C.gold)
          .transition().duration(ctx.dur(900)).ease(d3.easeCubicOut)
          .attr('cx', 160 + Math.cos(a) * 80).attr('cy', 90 + Math.sin(a) * 60).attr('opacity', 0).remove();
      });
    }
  }
  for (let i = 0; i < 3; i++) drop(false);
}

/* ------------------------------------------------------------------ 5 */
export function sceneLoop(svg, ctrl, ctx) {
  svg.append('text').attr('x', 18).attr('y', 38).attr('class', 'gold').style('font-family', 'var(--display)').style('font-size', '24px').text('2020');
  svg.append('text').attr('x', 18).attr('y', 60).attr('class', 'muted').text('20 miles from uni');
  svg.append('rect').attr('x', 22).attr('y', 88).attr('width', 70).attr('height', 46).attr('rx', 3).attr('fill', '#0f1520').attr('stroke', C.muted);
  const tiles = [[28, 94], [58, 94], [28, 113], [58, 113]].map(([x, y]) =>
    svg.append('rect').attr('x', x).attr('y', y).attr('width', 28).attr('height', 16).attr('rx', 2).attr('fill', C.line));
  svg.append('path').attr('d', 'M14,136 h86 l-6,7 h-74 Z').attr('fill', C.muted);
  svg.append('text').attr('x', 57).attr('y', 162).attr('text-anchor', 'middle').attr('class', 'muted').text('lectures on a laptop');
  const parts = ['work', 'study', 'cook', 'sleep'];
  const g = svg.append('g').attr('transform', 'translate(222,92)');
  const arc = d3.arc().innerRadius(40).outerRadius(72).padAngle(0.05).cornerRadius(5);
  const pie = d3.pie().value(1).sort(null)(parts);
  const seg = g.selectAll('path').data(pie).join('path').attr('d', arc);
  const lab = g.selectAll('text.l').data(pie).join('text').attr('class', 'l')
    .attr('transform', (d) => `translate(${arc.centroid(d)})`).attr('text-anchor', 'middle').attr('dy', '.35em').text((d) => d.data);
  g.append('text').attr('text-anchor', 'middle').attr('dy', '-.2em').attr('class', 'muted').text('all on');
  g.append('text').attr('text-anchor', 'middle').attr('dy', '1em').attr('class', 'muted').text('her own');
  let k = 0, days = 1;
  const counter = svg.append('text').attr('x', 222).attr('y', 178).attr('text-anchor', 'middle').attr('class', 'muted');
  const step = () => {
    const a = k % 4;
    seg.transition().duration(ctx.dur(250)).attr('fill', (d, i) => (i === a ? C.sea : C.line));
    lab.style('fill', (d, i) => (i === a ? '#0e1a1c' : C.ink));
    tiles.forEach((t, i) => t.attr('fill', a === 1 && i === k % 4 ? C.sea : C.line));
    if (a === 0 && k > 0) days++;
    counter.text(`day ${days} · not one complaint`);
    k++;
  };
  step();
  ctx.every(step, 900);
  btn(ctrl, 'Skip ahead a day', () => { for (let i = 0; i < 4; i++) step(); });
}

/* ------------------------------------------------------------------ 6 */
export function sceneFest(svg, ctrl, ctx) {
  const hx = 238;
  svg.append('path').attr('d', `M${hx - 44},92 L${hx},58 L${hx + 44},92 Z`).attr('fill', '#4a5874');
  svg.append('rect').attr('x', hx - 36).attr('y', 92).attr('width', 72).attr('height', 60).attr('fill', '#3b4760');
  const door = svg.append('rect').attr('x', hx - 10).attr('y', 118).attr('width', 20).attr('height', 34).attr('fill', '#2a3346');
  const wins = [hx + 14, hx - 28].map((x) => svg.append('rect').attr('x', x).attr('y', 102).attr('width', 14).attr('height', 12).attr('fill', '#2a3346'));
  // string lights along the roof
  const bulbs = d3.range(9).map((i) => {
    const t = i / 8, x = hx - 44 + t * 88, y = 92 - (1 - Math.abs(t - 0.5) * 2) * 34 + 4;
    return svg.append('circle').attr('cx', x).attr('cy', y).attr('r', 2.6).attr('fill', '#56617a');
  });
  svg.append('path').attr('d', 'M0,153 H320').attr('stroke', C.line).attr('stroke-width', 2);
  const car = svg.append('g').attr('transform', 'translate(-120,0)');
  car.append('path').attr('d', 'M18,120 l12,-18 h38 l12,18 Z').attr('fill', C.sea);
  car.append('rect').attr('y', 118).attr('width', 98).attr('height', 24).attr('rx', 9).attr('fill', C.sea);
  car.append('rect').attr('x', 34).attr('y', 105).attr('width', 30).attr('height', 12).attr('rx', 2).attr('fill', '#0f1520').attr('opacity', 0.55);
  [22, 76].forEach((x) => car.append('circle').attr('cx', x).attr('cy', 144).attr('r', 9).attr('fill', '#0d121b').attr('stroke', C.muted).attr('stroke-width', 2));
  const shout = bubble(svg, 12, 14, "Get your things, you're coming with us!").attr('opacity', 0);
  const words = svg.append('text').attr('x', 160).attr('y', 176).attr('text-anchor', 'middle').attr('class', 'muted').attr('opacity', 0)
    .text('music · food · laughter that went on far too long');
  const fx = svg.append('g');
  let lit = false;
  function burst() {
    const cols = [C.gold, C.sea, C.pink, C.ink];
    d3.range(80).forEach((i) => {
      const a = Math.random() * Math.PI * 2, r = 40 + Math.random() * 130;
      fx.append('rect').attr('x', hx).attr('y', 126).attr('width', 5).attr('height', 3).attr('fill', cols[i % 4])
        .transition().duration(ctx.dur(1300)).ease(d3.easeCubicOut)
        .attr('x', hx - 70 + Math.cos(a) * r).attr('y', 96 + Math.sin(a) * r * 0.6)
        .transition().duration(ctx.dur(700)).attr('opacity', 0).remove();
    });
  }
  function arrive() {
    if (lit) { burst(); return; }
    lit = true;
    car.transition().duration(ctx.dur(1400)).ease(d3.easeCubicOut).attr('transform', 'translate(30,0)')
      .on('end', () => {
        shout.transition().duration(ctx.dur(300)).attr('opacity', 1);
        door.transition().delay(ctx.dur(500)).duration(ctx.dur(300)).attr('fill', C.gold);
        wins.forEach((w) => w.transition().delay(ctx.dur(600)).attr('fill', C.gold).attr('opacity', 0.75));
        bulbs.forEach((bb, i) => bb.transition().delay(ctx.dur(700 + i * 80)).attr('fill', [C.gold, C.pink, C.sea][i % 3]));
        ctx.after(() => { burst(); words.transition().duration(ctx.dur(400)).attr('opacity', 1); b.text('More confetti'); }, 1300);
      });
  }
  const b = btn(ctrl, 'Here come her friends', arrive);
  hint(ctrl, 'It is festival night.');
}

/* ------------------------------------------------------------------ 7 */
export function sceneCounter(svg, ctrl, ctx) {
  svg.append('rect').attr('y', 176).attr('width', W).attr('height', 24).attr('fill', '#2a3550');
  svg.append('text').attr('x', 14).attr('y', 192).attr('class', 'muted').text('the counter');
  bubble(svg, 14, 14, "Hi! How's your day?", { fill: C.gold, color: C.dark });
  const conv = svg.append('g');
  const seq = [['r', 'Fine.', 400], ['l', '…', 1200], ['r', 'Well, my boss…', 2900], ['r', '…and my cat…', 3800], ['r', '…and that bus driver!', 4700]];
  const meter = svg.append('text').attr('x', W - 14).attr('y', 192).attr('text-anchor', 'end').attr('class', 'gold').attr('opacity', 0)
    .text('came in for milk, left smiling');
  let run = 0;
  function play() {
    const me = ++run;
    conv.selectAll('*').remove();
    meter.attr('opacity', 0);
    b.text('Again');
    seq.forEach(([s, t, ms], i) => ctx.after(() => {
      if (me !== run) return;
      const y = 44 + i * 25;
      const bb = s === 'r' ? bubble(conv, W - 14, y, t, { right: true }) : bubble(conv, 14, y, t, { fill: C.gold, color: C.dark });
      bb.attr('opacity', 0).transition().duration(ctx.dur(250)).attr('opacity', 1);
      if (i === seq.length - 1) meter.transition().delay(ctx.dur(600)).duration(ctx.dur(400)).attr('opacity', 1);
    }, ms));
  }
  const b = btn(ctrl, 'Answer “fine”', play);
  hint(ctrl, 'Then see what she does.');
}

/* ------------------------------------------------------------------ 8 */
export function sceneFlip(svg, ctrl, ctx) {
  svg.append('rect').attr('width', W).attr('height', 190).attr('fill', '#26324a');
  d3.range(60).forEach(() => svg.append('circle').attr('cx', Math.random() * W).attr('cy', Math.random() * 190)
    .attr('r', Math.random() * 1.4 + 0.4).attr('fill', '#dfe9f5').attr('opacity', 0.35));
  const feet = svg.append('g');
  [140, 182].forEach((x, i) => {
    const g = feet.append('g').attr('transform', `translate(${x},112) rotate(${i ? 7 : -7})`);
    g.append('ellipse').attr('rx', 17).attr('ry', 37).attr('fill', C.sea);
    g.append('ellipse').attr('rx', 12.5).attr('ry', 31).attr('cy', -1).attr('fill', C.skin);
    d3.range(5).forEach((j) => g.append('circle').attr('cx', (i ? -8 : 8) * (1 - j / 2.2) * 0.9)
      .attr('cy', -27 + Math.abs(j - 2) * 1.2).attr('r', j === 0 ? 3.4 : 2.4).attr('fill', '#c48f6a'));
    g.append('path').attr('d', 'M-12,-2 Q0,-9 0,-24 Q0,-9 12,-2').attr('fill', 'none').attr('stroke', C.dark).attr('stroke-width', 3.5).attr('stroke-linecap', 'round');
  });
  const socks = feet.append('g').attr('opacity', 0);
  [140, 182].forEach((x, i) => socks.append('ellipse').attr('transform', `translate(${x},112) rotate(${i ? 7 : -7})`)
    .attr('rx', 14).attr('ry', 33).attr('fill', C.pink).attr('stroke', '#fff').attr('stroke-dasharray', '2 3'));
  const lady = bubble(svg, 12, 12, 'Young lady, please put on some socks!');
  const reply = bubble(svg, W - 12, 42, 'Thank you!', { right: true, fill: C.gold, color: C.dark });
  let n = 1;
  const t = svg.append('text').attr('x', 14).attr('y', 178);
  t.append('tspan').style('fill', C.muted).text('Winter days in flip-flops: ');
  const tn = t.append('tspan').style('fill', C.gold).style('font-weight', 600).text(n);
  const flakes = d3.range(26).map(() => ({ x: Math.random() * W, y: Math.random() * 190, s: 0.3 + Math.random() * 0.6, p: Math.random() * 6 }));
  const fl = svg.append('g').attr('fill', '#ffffff').attr('opacity', 0.8).selectAll('circle').data(flakes).join('circle').attr('r', 1.8);
  const draw = (e) => fl.attr('cx', (d) => d.x + Math.sin((e || 0) / 900 + d.p) * 6).attr('cy', (d) => d.y);
  draw(0);
  ctx.loop((e) => { flakes.forEach((d) => { d.y += d.s; if (d.y > 192) { d.y = -4; d.x = Math.random() * W; } }); draw(e); });
  btn(ctrl, 'Another winter day', () => {
    n++; tn.text(n);
    lady.interrupt().attr('opacity', 0).transition().duration(ctx.dur(300)).attr('opacity', 1);
    reply.interrupt().attr('opacity', 0).transition().delay(ctx.dur(900)).duration(ctx.dur(300)).attr('opacity', 1);
    feet.interrupt().transition().duration(ctx.dur(180)).attr('transform', 'translate(0,-6)')
      .transition().duration(ctx.dur(220)).ease(d3.easeBounceOut).attr('transform', 'translate(0,0)');
  });
  btn(ctrl, 'Try the socks', () => {
    socks.interrupt().transition().duration(ctx.dur(300)).attr('opacity', 1)
      .transition().delay(ctx.dur(900)).duration(ctx.dur(300)).attr('opacity', 0);
    reply.select('text').text('Maybe tomorrow!');
    ctx.after(() => reply.select('text').text('Thank you!'), 2200);
  });
}

/* ------------------------------------------------------------------ 9 */
export function sceneCake(svg, ctrl, ctx) {
  const hintText = svg.append('text').attr('x', 160).attr('y', 22).attr('text-anchor', 'middle').attr('class', 'muted')
    .text('Midnight. Tap the candles to blow them out.');
  svg.append('rect').attr('x', 60).attr('y', 168).attr('width', 200).attr('height', 6).attr('rx', 3).attr('fill', C.line);
  svg.append('rect').attr('x', 100).attr('y', 124).attr('width', 120).attr('height', 44).attr('rx', 6).attr('fill', '#e98fae');
  svg.append('rect').attr('x', 100).attr('y', 116).attr('width', 120).attr('height', 16).attr('rx', 8).attr('fill', C.ink);
  [112, 134, 158, 184, 206].forEach((x, i) => svg.append('circle').attr('cx', x).attr('cy', 132).attr('r', 4 + (i % 2)).attr('fill', C.ink));
  const lit = [true, true, true, true, true];
  const xs = d3.range(5).map((i) => 118 + i * 21);
  const cg = svg.selectAll('g.c').data(xs).join('g').attr('class', 'c').style('cursor', 'pointer');
  cg.append('rect').attr('x', (d) => d - 3).attr('y', 92).attr('width', 6).attr('height', 26).attr('rx', 2).attr('fill', C.sea);
  const glow = cg.append('circle').attr('cx', (d) => d).attr('cy', 82).attr('r', 12).attr('fill', C.gold).attr('opacity', 0.18);
  const flame = cg.append('ellipse').attr('cx', (d) => d).attr('cy', 84).attr('rx', 4.5).attr('ry', 8).attr('fill', C.gold);
  cg.append('rect').attr('x', (d) => d - 10).attr('y', 66).attr('width', 20).attr('height', 54).attr('fill', 'transparent');
  ctx.every(() => flame.filter((d, i) => lit[i]).attr('ry', () => 7 + Math.random() * 2.2), 120);
  const crowd = svg.append('g');
  const msg = svg.append('text').attr('x', 160).attr('y', 192).attr('text-anchor', 'middle').attr('class', 'gold').attr('opacity', 0)
    .text('Next morning, everyone was there.');
  function blow(i) {
    if (!lit[i]) return;
    lit[i] = false;
    d3.select(flame.nodes()[i]).transition().duration(ctx.dur(300)).attr('ry', 0).attr('opacity', 0);
    d3.select(glow.nodes()[i]).transition().duration(ctx.dur(300)).attr('opacity', 0);
    svg.append('path').attr('d', `M${xs[i]},80 q-4,-8 0,-14 q4,-6 0,-12`).attr('fill', 'none').attr('stroke', C.muted).attr('stroke-width', 1.5)
      .transition().duration(ctx.dur(1000)).attr('transform', 'translate(0,-12)').attr('opacity', 0).remove();
    if (lit.every((v) => !v)) ctx.after(arrive, 500);
  }
  cg.on('click', (e, d) => blow(xs.indexOf(d)));
  const b = btn(ctrl, 'Blow out a candle', () => { const i = lit.indexOf(true); if (i >= 0) blow(i); });
  const h = hint(ctrl, 'Make a wish first.');
  function arrive() {
    hintText.transition().duration(ctx.dur(300)).attr('opacity', 0);
    const nodes = d3.range(18).map((j) => {
      const a = Math.PI + 0.32 + j * (Math.PI - 0.64) / 17;
      return { x: j % 2 ? -20 : W + 20, y: 40 + Math.random() * 120, tx: 160 + 132 * Math.cos(a), ty: 150 + 118 * Math.sin(a) };
    });
    const dots = crowd.selectAll('circle').data(nodes).join('circle').attr('r', 6).attr('fill', (d, j) => [C.sea, C.muted, C.pink][j % 3]);
    const sim = d3.forceSimulation(nodes).force('x', d3.forceX((d) => d.tx).strength(0.1))
      .force('y', d3.forceY((d) => d.ty).strength(0.1)).force('c', d3.forceCollide(8));
    ctx.runSim(sim, () => dots.attr('cx', (d) => d.x).attr('cy', (d) => d.y));
    msg.transition().delay(ctx.dur(600)).duration(ctx.dur(400)).attr('opacity', 1);
    h.text('She never told a single person.');
    b.text('Light them again').on('click', () => ctx.rerender());
  }
}

/* ------------------------------------------------------------------ 10 */
export function sceneBye(svg, ctrl, ctx) {
  const cx = 160, cy = 106;
  const gifts = [['her favourite chocolate', 14, 20, 'start'], ['the snack she once mentioned', W - 14, 38, 'end'], ['a detail remembered for months', 160, 194, 'middle']]
    .map(([t, x, y, a]) => svg.append('text').attr('x', x).attr('y', y).attr('text-anchor', a).attr('class', 'gold').attr('opacity', 0).text(t));
  const nodes = d3.range(24).map(() => {
    let x, y;
    do { x = 20 + Math.random() * 280; y = 54 + Math.random() * 112; } while (Math.hypot(x - cx, y - cy) < 60);
    return { x, y };
  });
  const dots = svg.append('g').selectAll('circle').data(nodes).join('circle').attr('r', 5.5).attr('fill', C.muted)
    .attr('cx', (d) => d.x).attr('cy', (d) => d.y);
  ctx.loop((e) => dots.attr('transform', (d, i) => (done ? null : `translate(0,${Math.sin(e / 700 + i) * 1.5})`)));
  svg.append('circle').attr('cx', cx).attr('cy', cy).attr('r', 20).attr('fill', C.gold);
  svg.append('text').attr('x', cx).attr('y', cy + 4).attr('text-anchor', 'middle').style('fill', C.dark).style('font-size', '10.5px').style('font-weight', 600).text('Bhagi');
  let done = false;
  const b = btn(ctrl, 'Word gets round', () => {
    if (done) return;
    done = true;
    b.attr('disabled', true);
    dots.attr('transform', null).transition().duration(ctx.dur(800)).attr('fill', C.sea);
    const sim = d3.forceSimulation(nodes).force('r', d3.forceRadial((d, i) => (i % 2 ? 42 : 56), cx, cy).strength(0.08)).force('c', d3.forceCollide(7.5));
    ctx.runSim(sim, () => dots.attr('cx', (d) => d.x).attr('cy', (d) => d.y));
    gifts.forEach((g, i) => g.transition().delay(ctx.dur(700 + i * 700)).duration(ctx.dur(400)).attr('opacity', 1));
    ctx.after(() => note.text('Nobody wanted to say goodbye.'), 2400);
  });
  const note = hint(ctrl, 'Watch who turns up.');
}

/* ------------------------------------------------------------------ 11 */
export function sceneSea(svg, ctrl, ctx) {
  const WX = 48, WY = 12, WW = 224, WH = 170;
  const defs = svg.append('defs');
  defs.append('clipPath').attr('id', 'win').append('rect').attr('x', WX).attr('y', WY).attr('width', WW).attr('height', WH);
  const sg = defs.append('linearGradient').attr('id', 'sky1').attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', 1);
  sg.append('stop').attr('offset', 0).attr('stop-color', '#f7d690');
  sg.append('stop').attr('offset', 1).attr('stop-color', '#f2a48a');
  const shadow = defs.append('filter').attr('id', 'pshadow').attr('x', '-20%').attr('y', '-20%').attr('width', '140%').attr('height', '140%');
  shadow.append('feDropShadow').attr('dx', 0).attr('dy', 3).attr('stdDeviation', 3).attr('flood-color', '#000').attr('flood-opacity', 0.45);

  // the drawn view
  const inside = svg.append('g').attr('clip-path', 'url(#win)');
  inside.append('rect').attr('x', WX).attr('y', WY).attr('width', WW).attr('height', WH).attr('fill', 'url(#sky1)');
  inside.append('circle').attr('cx', 208).attr('cy', 72).attr('r', 20).attr('fill', '#fff3c9');
  const gulls = inside.append('path').attr('d', 'M0,0 q4,-4 8,0 q4,-4 8,0 M22,-8 q3,-3 6,0 q3,-3 6,0')
    .attr('fill', 'none').attr('stroke', '#6b5a4a').attr('stroke-width', 1.4);
  const layers = [
    { b: 112, a: 3.5, k: 0.045, s: 1 / 900, c: '#86ddd3' },
    { b: 128, a: 4.5, k: 0.035, s: -1 / 1100, c: '#4fb3b0' },
    { b: 144, a: 5.5, k: 0.03, s: 1 / 1300, c: '#2f8590' },
  ];
  const area = d3.area().x((d) => d[0]).y0(WY + WH).y1((d) => d[1]).curve(d3.curveBasis);
  const waves = inside.selectAll('path.w').data(layers).join('path').attr('class', 'w').attr('fill', (d) => d.c);
  inside.append('rect').attr('x', WX).attr('y', 164).attr('width', WW).attr('height', 20).attr('fill', '#ecd3a2');
  const draw = (e) => {
    waves.attr('d', (d) => area(d3.range(40, 284, 6).map((x) => [x, d.b + d.a * Math.sin(x * d.k + e * d.s)])));
    gulls.attr('transform', `translate(${60 + ((e / 60) % 240)},${48 + Math.sin(e / 800) * 4})`);
  };
  draw(0);
  ctx.loop(draw);

  // the real view, cropped to the ferry and the little red lighthouse
  const s = WW / (836 * 0.72);
  const real = inside.append('image').attr('href', photos.view).attr('preserveAspectRatio', 'none')
    .attr('width', 836 * s).attr('height', 900 * s)
    .attr('x', WX - 836 * 0.28 * s).attr('y', WY - 900 * 0.215 * s).attr('opacity', 0);

  // window frame and panes
  const wood = '#a07c55';
  const pane = (x) => {
    const g = svg.append('g');
    g.append('rect').attr('x', x).attr('y', WY).attr('width', WW / 2).attr('height', WH).attr('fill', '#c3d8e6').attr('opacity', 0.3);
    g.append('rect').attr('x', x).attr('y', WY).attr('width', WW / 2).attr('height', WH).attr('fill', 'none').attr('stroke', wood).attr('stroke-width', 5);
    return g;
  };
  const Lp = pane(WX), Rp = pane(WX + WW / 2);
  svg.append('rect').attr('x', WX).attr('y', WY).attr('width', WW).attr('height', WH).attr('fill', 'none').attr('stroke', wood).attr('stroke-width', 8);
  svg.append('rect').attr('x', 32).attr('y', WY + WH - 2).attr('width', 256).attr('height', 12).attr('rx', 3).attr('fill', wood);

  // polaroids
  const veil = svg.append('rect').attr('width', W).attr('height', 340).attr('fill', C.bg).attr('opacity', 0)
    .style('pointer-events', 'none').on('click', () => zoom(null));
  const PW = 128, PH = 150;
  const cards = [
    { key: 'book', url: photos.book, cap: 'page 138 & cherries', x: 20, y: 184, r: -7 },
    { key: 'her', url: photos.her, cap: 'her reading corner', x: 172, y: 188, r: 6 },
  ];
  const restT = (c) => `translate(${c.x},${c.y}) rotate(${c.r},${PW / 2},${PH / 2})`;
  const offT = (c) => `translate(${c.x},360) rotate(${c.r * 3},${PW / 2},${PH / 2})`;
  const zoomS = 2.15;
  const zoomT = `translate(${(W - PW * zoomS) / 2},${(340 - PH * zoomS) / 2}) rotate(0,${PW / 2},${PH / 2}) scale(${zoomS})`;
  cards.forEach((c) => {
    c.g = svg.append('g').attr('transform', offT(c)).attr('opacity', 0).style('cursor', 'zoom-in')
      .attr('role', 'button').attr('tabindex', 0).attr('aria-label', `Photo: ${c.cap}`)
      .on('click', () => zoom(c))
      .on('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); zoom(c); } });
    c.g.append('rect').attr('width', PW).attr('height', PH).attr('rx', 3).attr('fill', '#fbf8f2').attr('filter', 'url(#pshadow)');
    defs.append('clipPath').attr('id', `pc-${c.key}`).append('rect').attr('x', 7).attr('y', 7).attr('width', PW - 14).attr('height', 112);
    c.g.append('image').attr('href', c.url).attr('x', 7).attr('y', 7).attr('width', PW - 14).attr('height', 112)
      .attr('preserveAspectRatio', 'xMidYMid slice').attr('clip-path', `url(#pc-${c.key})`);
    c.g.append('text').attr('x', PW / 2).attr('y', 138).attr('text-anchor', 'middle')
      .style('fill', '#2a2a2a').style('font-family', 'var(--hand)').style('font-size', '14px').text(c.cap);
    c.shown = false;
  });

  let zoomed = null;
  function zoom(c) {
    if (zoomed) {
      const z = zoomed; zoomed = null;
      z.g.style('cursor', 'zoom-in').transition().duration(ctx.dur(500)).ease(d3.easeCubicInOut).attr('transform', restT(z));
      veil.style('pointer-events', 'none').transition().duration(ctx.dur(400)).attr('opacity', 0);
      if (z === c || !c) return;
    }
    if (!c || !c.shown) return;
    zoomed = c;
    veil.raise().style('pointer-events', 'all').transition().duration(ctx.dur(400)).attr('opacity', 0.75);
    c.g.raise().style('cursor', 'zoom-out').transition().duration(ctx.dur(600)).ease(d3.easeCubicInOut).attr('transform', zoomT);
  }
  function show(c) {
    if (c.shown) { zoom(c); return; }
    c.shown = true;
    c.g.raise().transition().duration(ctx.dur(900)).ease(d3.easeBackOut.overshoot(1.1)).attr('opacity', 1).attr('transform', restT(c));
    if (cards.every((k) => k.shown)) ctx.after(() => note.text('Tap a photo to look closer.'), 900);
  }

  let open = false, isReal = false;
  function setOpen(v) {
    open = v;
    [[Lp, WX], [Rp, WX + WW]].forEach(([g, h]) => g.transition().duration(ctx.dur(900)).ease(d3.easeCubicInOut)
      .attr('transform', v ? `translate(${h},0) scale(.1,1) translate(${-h},0)` : `translate(${h},0) scale(1,1) translate(${-h},0)`));
    if (v && !isReal) {
      isReal = true;
      real.transition().delay(ctx.dur(900)).duration(ctx.dur(1800)).ease(d3.easeSinInOut).attr('opacity', 1);
      ctx.after(() => note.text('The real view: a ferry heading out past the little red lighthouse.'), 1600);
      viewBtn.attr('disabled', null);
    }
    winBtn.text(v ? 'Close the window' : 'Open the window');
  }
  const winBtn = btn(ctrl, 'Open the window', () => setOpen(!open));
  const viewBtn = btn(ctrl, 'Drawing or real?', () => {
    const now = +real.attr('opacity') > 0.5;
    real.interrupt().transition().duration(ctx.dur(900)).attr('opacity', now ? 0 : 1);
  }).attr('disabled', true);
  btn(ctrl, 'Pick up her book', () => show(cards[0]));
  btn(ctrl, 'Find her reading corner', () => show(cards[1]));
  const note = hint(ctrl, 'Start with the window.');
}

/* ------------------------------------------------------------- cover */
export function coverArt(svg, ctx) {
  const H = 200;
  const defs = svg.append('defs');
  const sky = defs.append('linearGradient').attr('id', 'coverSky').attr('x1', 0).attr('x2', 1).attr('y1', 0).attr('y2', 0);
  sky.append('stop').attr('offset', 0).attr('stop-color', '#2b3446');
  sky.append('stop').attr('offset', 0.55).attr('stop-color', '#3a3f55');
  sky.append('stop').attr('offset', 1).attr('stop-color', '#e9a77f');
  svg.append('rect').attr('width', W).attr('height', H).attr('fill', 'url(#coverSky)');
  svg.append('circle').attr('cx', 286).attr('cy', 70).attr('r', 18).attr('fill', '#ffe7b0').attr('opacity', 0.9);
  const sea = svg.append('path').attr('fill', '#2f8590');
  const seaArea = d3.area().x((d) => d[0]).y0(H).y1((d) => d[1]).curve(d3.curveBasis);
  svg.append('rect').attr('y', 150).attr('width', 220).attr('height', 50).attr('fill', '#19202d');
  // drizzle on the left, fading out toward the sun
  const drops = d3.range(30).map(() => ({ x: Math.random() * 180, y: Math.random() * 150, s: 1.4 + Math.random() * 1.6 }));
  const ln = svg.append('g').attr('stroke', '#9fb0c9').selectAll('line').data(drops).join('line');
  const pts = [[16, 140], [70, 118], [120, 132], [170, 104], [220, 118], [268, 96], [304, 112]];
  const trail = svg.append('path').attr('d', d3.line().curve(d3.curveCatmullRom)(pts)).attr('fill', 'none')
    .attr('stroke', C.gold).attr('stroke-width', 2.5).attr('stroke-dasharray', '2 6').attr('stroke-linecap', 'round');
  const L = trail.node().getTotalLength();
  const case_ = svg.append('g');
  case_.append('path').attr('d', 'M-3,-14 v-3 h6 v3').attr('fill', 'none').attr('stroke', C.gold).attr('stroke-width', 1.6);
  case_.append('rect').attr('x', -7).attr('y', -14).attr('width', 14).attr('height', 11).attr('rx', 2).attr('fill', C.gold);
  const draw = (e) => {
    ln.attr('x1', (d) => d.x).attr('x2', (d) => d.x - 2).attr('y1', (d) => d.y).attr('y2', (d) => d.y + 6)
      .attr('stroke-opacity', (d) => 0.55 * (1 - d.x / 200));
    sea.attr('d', seaArea(d3.range(200, 330, 8).map((x) => [x, 158 + 4 * Math.sin(x * 0.05 + e / 700)])));
    const t = ((e / 9000) % 1);
    const p = trail.node().getPointAtLength(t * L);
    case_.attr('transform', `translate(${p.x},${p.y})`);
  };
  draw(ctx.reduce ? 8900 : 0);
  ctx.loop((e) => { drops.forEach((d) => { d.y += d.s; if (d.y > 150) { d.y = -6; d.x = Math.random() * 180; } }); draw(e); });
}

/* ------------------------------------------------------------- finale */
export function finaleArt(svg, ctx, onGathered) {
  const H = 230, cx = 160, cy = 112;
  const cols = [C.gold, C.sea, C.pink, C.muted, C.ink];
  const heart = d3.range(0, Math.PI * 2, (Math.PI * 2) / 64).map((t) => [
    cx + 5.6 * 16 * Math.sin(t) ** 3,
    cy - 5.6 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) - 8,
  ]);
  const nodes = heart.map(([tx, ty], i) => ({ tx, ty, x: Math.random() * W, y: Math.random() * H, c: cols[i % cols.length] }));
  const dots = svg.append('g').selectAll('circle').data(nodes).join('circle')
    .attr('r', 4.2).attr('fill', (d) => d.c).attr('cx', (d) => d.x).attr('cy', (d) => d.y).attr('opacity', 0.85);
  const name = svg.append('text').attr('x', cx).attr('y', cy + 6).attr('text-anchor', 'middle')
    .style('font-family', 'var(--display)').style('font-size', '30px').style('fill', C.gold).attr('opacity', 0).text('Bhagi');
  ctx.loop((e) => { if (!gathered) dots.attr('transform', (d, i) => `translate(${Math.sin(e / 900 + i) * 3},${Math.cos(e / 1100 + i) * 3})`); });
  let gathered = false;
  return function gather() {
    if (gathered) {
      // scatter, then gather again
      gathered = false;
      nodes.forEach((d) => { d.x = Math.random() * W; d.y = Math.random() * H; });
      dots.transition().duration(ctx.dur(500)).attr('cx', (d) => d.x).attr('cy', (d) => d.y);
      name.transition().duration(ctx.dur(300)).attr('opacity', 0);
      ctx.after(() => gather(), 700);
      return;
    }
    gathered = true;
    dots.attr('transform', null);
    const sim = d3.forceSimulation(nodes).alphaDecay(0.03)
      .force('x', d3.forceX((d) => d.tx).strength(0.14)).force('y', d3.forceY((d) => d.ty).strength(0.14));
    ctx.runSim(sim, () => dots.attr('cx', (d) => d.x).attr('cy', (d) => d.y));
    name.transition().delay(ctx.dur(900)).duration(ctx.dur(700)).attr('opacity', 1);
    if (onGathered) ctx.after(onGathered, 1400);
  };
}
