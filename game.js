/* Galley Chaos. MIT License. Vanilla JS, no dependencies, no build step. */
(() => {
'use strict';
const $ = s => document.querySelector(s);
const SAVE_KEY = 'galley_chaos_save_v1';
const TAU = Math.PI * 2, SPEED = 3.6, DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const EMOJI = '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';
const DISPLAY = 'Bahnschrift,"DIN Alternate","Roboto Condensed","Arial Narrow",system-ui,sans-serif';

/* ---------- DATA ---------- */
const ITEMS = {
  water: { e: '💧', n: 'Water', c: '#7bdff2' }, snack: { e: '🥜', n: 'Nutty Captain', c: '#d9a066' }, meal: { e: '🍱', n: 'Meal', c: '#ff8fa3' },
  bag: { e: '🛍️', n: 'Sick bag', c: '#f4f7ff' }, juice: { e: '🧃', n: 'Juice', c: '#ffb703' }, teddy: { e: '🧸', n: 'Teddy', c: '#b08968' },
  tea: { e: '🍵', n: 'Tea', c: '#90be6d' }, blanket: { e: '🧣', n: 'Blanket', c: '#c77dff' }, phones: { e: '🎧', n: 'Headphones', c: '#8d9fc6' }, choc: { e: '🍫', n: 'Chocolate', c: '#7f5539' },
};
const ITEM_ORDER = ['water', 'snack', 'meal', 'bag', 'juice', 'teddy', 'tea', 'blanket', 'phones', 'choc'], ITEM_KEYS = 'qwertyuiop';
/* What a passenger shows in the bubble, and the cart item that fixes it. */
const WANTS = {
  water: { e: '💧', item: 'water', pat: 19, w: 4, pts: 100 }, snack: { e: '🥜', item: 'snack', pat: 19, w: 3, pts: 100 }, meal: { e: '🍱', item: 'meal', pat: 22, w: 3, pts: 100 },
  juice: { e: '🧃', item: 'juice', pat: 19, w: 2, pts: 100 }, tea: { e: '🍵', item: 'tea', pat: 20, w: 2, pts: 100 }, choc: { e: '🍫', item: 'choc', pat: 19, w: 1.5, pts: 100 },
  teddy: { e: '🧸', item: 'teddy', pat: 18, w: 1.6, pts: 120, kid: 1 }, sick: { e: '🤢', item: 'bag', pat: 14, w: .8, pts: 130 },
  cold: { e: '🥶', item: 'blanket', pat: 19, w: 1.5, pts: 120 }, noise: { e: '🙉', item: 'phones', pat: 19, w: 1.5, pts: 120 },
};
/* Situations: the crew walks over, then the player picks the response. st: 1 cruise, 2 descent. */
const SCENES = [
  { e: '😭', kid: 1, st: 1, q: 'The toddler in {s} is howling and the whole row is glaring.', a: 'Kneel down, offer a teddy and a smile, and reassure the parents.', w: ['Ask the toddler to keep it down for the other guests.', 'Hand the parents a complaint form to fill in.'] },
  { e: '😭', kid: 1, st: 1, q: 'The baby in {s} has been wailing since the seatbelt sign went off.', a: 'Offer warm water for the bottle and suggest a walk up the aisle.', w: ['Put the baby on the PA so everyone can share the moment.', 'Suggest the baby try the inflight magazine.'] },
  { e: '😭', kid: 1, st: 2, q: 'Ears are popping on the way down and the child in {s} is screaming.', a: 'Suggest a drink or a sweet to swallow. It helps the ears pop.', w: ['Explain that it only gets worse from here.', 'Ask the Captain to descend more quietly.'] },
  { e: '🦵', kid: 1, st: 1, q: 'The kid in {s} is kicking the seat in front. Rhythmically.', a: 'Ask the parent for help and hand the kid a colouring kit.', w: ['Kick the kid’s seat back to teach a lesson.', 'Move the victim into the overhead bin for safety.'] },
  { e: '🔔', kid: 1, st: 1, q: 'The child in {s} has pressed the call bell 14 times.', a: 'Show the child the reading-light switch instead and thank the parent.', w: ['Press it back 14 times.', 'Revoke the child’s button privileges in writing.'] },
  { e: '💺', st: 1, q: 'Recline war. {s} dropped the seat back onto a laptop.', a: 'Ask for seats upright during the meal and recline after. Thank both sides.', w: ['Declare the armrest a demilitarised zone.', 'Recline every seat at once. Fair is fair.'] },
  { e: '😴', st: 1, q: '{s} is snoring louder than the engines.', a: 'Offer earplugs to the neighbours and wake him gently if it carries on.', w: ['Pinch his nose until the noise stops.', 'Record it for the inflight entertainment channel.'] },
  { e: '🪟', st: 1, q: '{s} asks you to open a window. “Just a crack.”', a: 'Explain kindly that windows stay shut and adjust the air vent.', w: ['Sure. Mind your hat.', 'Tell them to ask the Captain on the way out.'] },
  { e: '📱', st: 1, q: '{s} is watching cricket at full volume with no headphones.', a: 'Ask them politely to use headphones and offer a pair.', w: ['Turn your own phone up louder.', 'Announce the score on the PA so nobody needs to listen.'] },
  { e: '🦶', st: 1, q: '{s} has bare feet up on the armrest in front.', a: 'Ask them politely to keep their feet down and offer a blanket.', w: ['Tickle them.', 'Hang an air freshener on the big toe.'] },
  { e: '👋', st: 1, q: '{s} wants to “just pop in and say hi” to the pilots.', a: 'Explain the flight deck stays locked in flight and offer a visit after landing.', w: ['Give them the door code.', 'Let them fly for five minutes.'] },
];
const PA = {
  climb: ['The seatbelt sign is ON. Please sit down and stay buckled until we reach cruising altitude.', 'We are still climbing. Please return to your seat and fasten your seatbelt.'],
  descent: ['We have started our descent. Please return to your seat and fasten your seatbelt.', 'The cabin is being secured for landing. Seat upright, belt on, tray table stowed.'],
  off: ['The seatbelt sign is now off. You are free to move about the cabin.'],
  jokes: ['The overhead bins are now open for business. Help yourself.', 'Anyone still standing gets a free upgrade to the wing.', 'This is your Purser. I saw nothing. Carry on.', 'Please form an orderly queue in the aisle.', 'If you can stand, you can serve the meals.'],
};
/* Crew = regulatory minimum of 1 cabin crew per 50 seats (or part of 50) on a typical seat count. Carts = 1 per 2 crew. */
const LEVELS = [
  { id: 'atr72', miss: 5, lug: 6, sp: 22, cMax: 1, flight: 'GC 101', name: 'ATR 72-600', seats: 72, blocks: [2, 2], rows: 6, crew: 2, carts: 1, items: 3, spawn: 7.0, rate: 0.1, cGap: 7, dGap: 6.5, ck: [], ckGap: 0, sit: 0.6, shake: 1.5, jolt: 0, pat: 2.0, occ: 1,
    brief: ['Click a crew member (or press 1–2), then click a passenger bubble.', 'Service: pick the matching item from the cart tray. The crew loads it at the nearest galley or parked cart. Wrong item, wrong face.', 'One passenger will stand up during the climb 🧳: send crew, then pick the right PA announcement.', 'Descent: lock both lavatories 🔓 and dock the cart within 8 s.'] },
  { id: 'e175', miss: 6, lug: 8, sp: 18, cMax: 2, flight: 'GC 175', name: 'Embraer E175', seats: 88, blocks: [2, 2], rows: 8, crew: 2, carts: 1, items: 4, spawn: 6.0, rate: 0.13, cGap: 7, dGap: 6, ck: ['lav'], ckGap: 30, sit: 1.2, shake: 2, jolt: 0, pat: 1.7, occ: 1,
    brief: ['New on the cart: sick bags 🛍️. An airsick passenger shows 🤢.', 'Two-person cockpit rule: when the Captain needs a break 🚽, click the cockpit door within 20 s. That crew member stays locked in for 12 s.', 'Children cry, kick and press buttons. Walk over and pick the sensible response.'] },
  { id: 'a320', miss: 7, lug: 9, sp: 15, cMax: 3, flight: 'GC 320', name: 'Airbus A320neo', seats: 186, blocks: [3, 3], rows: 9, crew: 4, carts: 2, items: 5, spawn: 4.6, rate: 0.14, cGap: 6.5, dGap: 5.6, ck: ['coffee', 'lav'], ckGap: 24, sit: 1.8, shake: 2.5, jolt: 0, pat: 1.45, occ: .96,
    brief: ['Four crew, two carts: one docks at the front galley, one at the rear.', 'A parked cart blocks the single aisle. Crew behind it cannot reach the cockpit.', 'FO Smriti wants coffee ☕. Click the front galley: 3 s to brew, 20 s to deliver.', 'New on the cart: juice 🧃.'] },
  { id: 'b737', miss: 8, lug: 10, sp: 13, cMax: 4, flight: 'GC 737', name: 'Boeing 737 MAX 8', seats: 189, blocks: [3, 3], rows: 10, crew: 4, carts: 2, items: 6, spawn: 4.1, rate: 0.15, cGap: 6, dGap: 5.2, ck: ['coffee', 'lav'], ckGap: 22, sit: 2.2, shake: 5, jolt: 6, pat: 1.3, occ: .96,
    brief: ['Heavy turbulence: jolts knock the crew off balance during descent.', 'New on the cart: teddies 🧸 for the children.', 'Dock the carts before the descent starts, not after.'] },
  { id: 'a321', miss: 9, lug: 11, sp: 12, cMax: 5, flight: 'GC 321', name: 'Airbus A321neo', seats: 232, blocks: [3, 3], rows: 12, crew: 5, carts: 2, items: 7, spawn: 3.7, rate: 0.14, cGap: 6, dGap: 5.2, ck: ['coffee', 'lav'], ckGap: 22, sit: 2.4, shake: 3, jolt: 0, pat: 1.22, occ: .96,
    brief: ['The longest single aisle in the fleet. Five crew.', 'Two parked carts cut the cabin into three. Keep someone in each section.', 'New on the cart: tea 🍵.'] },
  { id: 'a330', miss: 10, lug: 12, sp: 11, cMax: 6, flight: 'GC 330', name: 'Airbus A330-300', seats: 300, blocks: [2, 4, 2], rows: 10, crew: 6, carts: 3, items: 8, spawn: 3.4, rate: 0.12, cGap: 5.5, dGap: 5, ck: ['coffee', 'lav'], ckGap: 20, sit: 2.6, shake: 3, jolt: 0, pat: 1.15, occ: .96,
    brief: ['Two aisles, six crew, three carts. Cross-galleys at the front, middle and rear.', 'A parked cart blocks only its own aisle. Crew route around it.', 'New on the cart: blankets 🧣. A cold passenger shows 🥶.'] },
  { id: 'b787', miss: 10, lug: 13, sp: 10, cMax: 6, flight: 'GC 787', name: 'Boeing 787-9', seats: 296, blocks: [3, 3, 3], rows: 10, crew: 6, carts: 3, items: 9, spawn: 3.2, rate: 0.12, cGap: 5.5, dGap: 5, ck: ['coffee', 'lav'], ckGap: 19, sit: 2.6, shake: 3.5, jolt: 0, pat: 1.1, occ: .96,
    brief: ['Nine abreast. Requests come faster than you can walk.', 'New on the cart: headphones 🎧. Someone who cannot stand the noise shows 🙉.'] },
  { id: 'a350', miss: 11, lug: 14, sp: 10, cMax: 7, flight: 'GC 350', name: 'Airbus A350-900', seats: 325, blocks: [3, 3, 3], rows: 12, crew: 7, carts: 3, items: 10, spawn: 3.0, rate: 0.115, cGap: 5, dGap: 4.6, ck: ['coffee', 'lav'], ckGap: 18, sit: 2.8, shake: 4, jolt: 7, pat: 1.08, occ: .97,
    brief: ['Seven crew, keys 1–7. Ten items on the cart.', 'New on the cart: chocolate 🍫.', 'Jolts in the descent. Secure the cabin early.'] },
  { id: 'b777', miss: 12, lug: 15, sp: 10, cMax: 8, flight: 'GC 777', name: 'Boeing 777-300ER', seats: 396, blocks: [3, 4, 3], rows: 12, crew: 8, carts: 4, items: 10, spawn: 2.9, rate: 0.1, cGap: 5, dGap: 4.4, ck: ['coffee', 'lav'], ckGap: 16, dbl: 1, sit: 3, shake: 7, jolt: 4.5, pat: 1.05, occ: 1,
    brief: ['Every seat is taken. Eight crew, four carts.', 'Double cockpit events: coffee and Captain break land together, and both timers run.', 'Severe turbulence. Start securing the cabin before the descent call.'] },
];
const NAMES = ['Purser', 'Riya', 'Kabir', 'Tara', 'Dev', 'Meera', 'Arjun', 'Zoya'];
const SHIRTS = ['#e76f51', '#f4a261', '#e9c46a', '#8ecae6', '#b5838d', '#90be6d', '#c77dff', '#f28482', '#84a59d', '#f7ede2', '#577590', '#ffafcc'];
const SKINS = ['#f1c9a5', '#e0ac69', '#c68642', '#8d5524', '#ffdbac', '#a9745b'];
const HAIRS = ['#1b1b1b', '#3b2417', '#5a3825', '#2c2c54', '#8a8a8a', '#9c5b2e'];

/* ---------- SAVE ---------- */
const Save = {
  data: { v: 2, unlocked: 1, best: {}, stars: {}, muted: false, round: 2 },
  load() { try { const d = JSON.parse(localStorage.getItem(SAVE_KEY)); if (d && typeof d === 'object') { if (d.v !== 2) { d.unlocked = 1; d.best = {}; d.stars = {}; d.v = 2; } Object.assign(this.data, d); } } catch (e) { /* storage unavailable: play without saving */ } },
  store() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(this.data)); } catch (e) { /* ignore */ } },
};

/* ---------- AUDIO ---------- */
class SoundFX {
  constructor() { this.ctx = null; this.muted = false; this.last = {}; }
  init() {
    if (!this.ctx) {
      const A = window.AudioContext || window.webkitAudioContext; if (!A) return;
      try { this.ctx = new A(); this.out = this.ctx.createGain(); this.out.gain.value = .5; this.out.connect(this.ctx.destination); } catch (e) { this.ctx = null; return; }
    }
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
  }
  can(name, gap) { if (!this.ctx || this.muted) return false; const n = this.ctx.currentTime; if (gap && n - (this.last[name] ?? -9) < gap) return false; this.last[name] = n; return true; }
  tone(f, at, dur, type = 'sine', vol = .2, f2) {
    const c = this.ctx, t = c.currentTime + at, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(this.out); o.start(t); o.stop(t + dur + .03);
  }
  noise(at, dur, vol, cut) {
    const c = this.ctx, t = c.currentTime + at, n = Math.floor(c.sampleRate * dur), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = b; f.type = 'lowpass'; f.frequency.value = cut; g.gain.value = vol;
    s.connect(f); f.connect(g); g.connect(this.out); s.start(t);
  }
  chime() { if (this.can('chime', .3)) { this.tone(659.3, 0, .55, 'sine', .22); this.tone(523.3, .4, .85, 'sine', .22); } }          // seatbelt ding-dong
  ping() { if (this.can('ping', .25)) { this.tone(1175, 0, .16, 'sine', .12); this.tone(1568, .08, .26, 'sine', .09); } }           // call button
  rumble() { if (this.can('rumble', .2)) { this.noise(0, .55, .5, 160); this.tone(55, 0, .5, 'triangle', .18, 40); } }               // cart roll / jolt
  slam() { if (this.can('slam', .06)) { this.noise(0, .13, .7, 900); this.tone(95, 0, .16, 'square', .16, 45); } }                   // bin slam / bonk
  buzzer() { if (this.can('buzzer', .3)) for (let i = 0; i < 3; i++) this.tone(233, i * .17, .12, 'sawtooth', .13); }                // cockpit
  clear() { if (this.can('clear', .5)) [523.3, 659.3, 784, 1046.5].forEach((f, i) => this.tone(f, i * .12, .34, 'triangle', .18)); }
  alarm() { if (this.can('alarm', .5)) for (let i = 0; i < 4; i++) { this.tone(880, i * .32, .15, 'square', .11); this.tone(622, i * .32 + .16, .15, 'square', .11); } }
  blip() { if (this.can('blip', .03)) this.tone(880, 0, .06, 'triangle', .07); }
  good() { if (this.can('good', .05)) { this.tone(660, 0, .07, 'triangle', .09); this.tone(990, .06, .11, 'triangle', .09); } }
  bad() { if (this.can('bad', .08)) this.tone(150, 0, .16, 'square', .08, 90); }
  wail() { if (this.can('wail', .8)) { this.tone(700, 0, .28, 'triangle', .07, 980); this.tone(980, .28, .32, 'triangle', .07, 620); } }
}
const sfx = new SoundFX();

/* ---------- STATE ---------- */
const G = { state: 'menu', anim: 0 };
const V = { ts: 32, ox: 0, oy: 0, vert: false, cw: 300, ch: 200, dpr: 1, calm: !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) };
const cv = $('#cv'), mainCtx = cv.getContext('2d'); let ctx = mainCtx;
const streaks = Array.from({ length: 26 }, () => ({ u: Math.random(), v: Math.random(), l: rnd(.03, .1), s: rnd(.12, .45) }));

/* ---------- CABIN GRID: 0 aisle/galley, 1 seat, 2 blocked by cart, 3 bulkhead/station ---------- */
function buildCabin(L) {
  const aisles = [], seatRows = []; let y = 0;
  L.blocks.forEach((b, i) => { for (let k = 0; k < b; k++) seatRows.push({ y: y++, block: i }); if (i < L.blocks.length - 1) aisles.push(y++); });
  const H = y, twin = aisles.length > 1, cols = ['wall', 'gal'], half = Math.ceil(L.rows / 2);
  for (let r = 1; r <= L.rows; r++) { cols.push(r); if (twin && r === half) cols.push('gal'); }
  cols.push('gal', 'wall');
  const W = cols.length, grid = [], seats = [], LET = 'ABCDEFGHJK';
  for (let yy = 0; yy < H; yy++) grid.push(cols.map(c => c === 'wall' ? 3 : c === 'gal' ? 0 : aisles.includes(yy) ? 0 : 1));
  cols.forEach((c, x) => {
    if (typeof c !== 'number') return;
    seatRows.forEach((s, i) => seats.push({ x, y: s.y, row: c, name: c + LET[i], aisles: [aisles[s.block - 1], aisles[s.block]].filter(v => v !== undefined), pax: null }));
  });
  const cy = Math.floor((H - 1) / 2);
  const st = [
    { type: 'lav', name: 'Front lavatory', x: 0, y: 0, ax: 1, ay: 0, locked: false, occ: false, claimed: null },
    { type: 'door', name: 'Cockpit door', x: 0, y: cy, ax: 1, ay: cy },
    { type: 'galley', name: 'Front galley', front: true, x: 0, y: H - 1, ax: 1, ay: H - 1 },
    { type: 'lav', name: 'Rear lavatory', x: W - 1, y: 0, ax: W - 2, ay: 0, locked: false, occ: false, claimed: null },
    { type: 'galley', name: 'Rear galley', x: W - 1, y: H - 1, ax: W - 2, ay: H - 1 },
  ];
  /* Docks: rear galley first, then front. One per aisle end on twin-aisle jets. */
  const spots = twin ? [[W - 1, aisles[0]], [0, aisles[0]], [W - 1, aisles[1]], [0, aisles[1]]] : [[W - 1, aisles[0]], [0, H - 2]], trolleys = [];
  for (let i = 0; i < L.carts; i++) {
    const [dx, dy] = spots[i], d = { type: 'dock', name: 'Cart dock', x: dx, y: dy, ax: dx ? W - 2 : 1, ay: dy };
    d.tr = { id: i, dock: d, state: 'docked', x: 0, y: 0, carrier: null, claimed: null, dead: false };
    st.push(d); trolleys.push(d.tr);
  }
  return { W, H, grid, seats, aisles, cols, st, trolleys, cy, door: st[1], galF: st[2], lavs: [st[0], st[3]], nose: Math.max(2.1, H * .42), tail: Math.max(1.7, H * .36),
    seatAt: new Map(seats.map(s => [s.x + ',' + s.y, s])), stAt: new Map(st.map(s => [s.x + ',' + s.y, s])) };
}

/* ---------- PATHFINDING (BFS over the walkable grid) ---------- */
function findPath(sx, sy, goals) {
  const { W, H, grid } = G.cab, key = (x, y) => y * W + x, gs = new Set(goals.map(g => key(g[0], g[1]))), s0 = key(sx, sy);
  if (!gs.size) return null;
  if (gs.has(s0)) return [];
  const prev = new Int32Array(W * H).fill(-1), q = [s0]; prev[s0] = s0;
  for (let h = 0; h < q.length; h++) {
    const k = q[h], x = k % W, yy = (k - x) / W;
    for (const [dx, dy] of DIRS) {
      const nx = x + dx, ny = yy + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const nk = key(nx, ny); if (prev[nk] !== -1 || grid[ny][nx] !== 0) continue;
      prev[nk] = k;
      if (gs.has(nk)) { const out = []; let c = nk; while (c !== s0) { out.push([c % W, (c - c % W) / W]); c = prev[c]; } return out.reverse(); }
      q.push(nk);
    }
  }
  return null;
}
const firstPath = (sx, sy, lists) => { for (const l of lists) { const p = findPath(sx, sy, l); if (p) return p; } return null; };
const seatGoals = s => [s.aisles.map(a => [s.x, a]), s.aisles.flatMap(a => [[s.x - 1, a], [s.x + 1, a]])];
const at = s => [[[s.ax, s.ay]]];
const tileOf = c => [Math.round(c.x), Math.round(c.y)];
const canReach = (c, lists) => !!firstPath(...tileOf(c), lists);
/* Supply points: both galleys, plus every parked cart (load from the tile either side of it). */
function supplies() {
  const out = [], cab = G.cab;
  for (const s of cab.st) if (s.type === 'galley') out.push({ goals: [[s.ax, s.ay]], ok: () => true });
  for (const t of cab.trolleys) if (t.state === 'parked') out.push({ goals: [[t.x - 1, t.y], [t.x + 1, t.y]], ok: () => t.state === 'parked' });
  return out;
}
function bestSupply(c, seat) {
  let best = null, bd = Infinity; const [sx, sy] = tileOf(c);
  for (const s of supplies()) {
    const p = findPath(sx, sy, s.goals); if (!p) continue;
    const end = p.length ? p[p.length - 1] : [sx, sy], p2 = firstPath(end[0], end[1], seatGoals(seat)); if (!p2) continue;
    const d = p.length + p2.length; if (d < bd) { bd = d; best = s; }
  }
  return best;
}

/* ---------- TASKS ---------- */
function clearTask(c) { const t = c.task; if (t && t.claim && t.claim.claimed === c) t.claim.claimed = null; c.task = null; c.path = null; c.prog = 0; c.blocked = false; if (c.stun <= 0) c.status = 'Idle'; }
function assign(c, task) {
  if (c.hidden) { toast(c.name + ' is locked in the cockpit'); sfx.bad(); return false; }
  if (c.trolley) { toast(c.name + ' has both hands on the cart'); sfx.bad(); return false; }
  const cl = task.claim;
  if (cl && c.task && c.task.claim === cl && !task.force) return true;
  if (cl && cl.claimed && cl.claimed !== c) { if (cl.claimed.hidden || cl.claimed.trolley) { toast('Already being handled'); return false; } clearTask(cl.claimed); }
  clearTask(c); if (task.keep !== c.item) { c.carry = null; c.item = null; }
  if (cl) cl.claimed = c; task.i = 0; c.task = task; sfx.blip(); return true;
}
function tServe(c, r, item) {
  const it = ITEMS[item], seat = r.pax.seat, have = c.item === item, t = { claim: r, force: true, keep: have ? item : null, sup: null, steps: [] };
  if (!have) t.steps.push({ go: () => { t.sup = bestSupply(c, seat); return t.sup ? [t.sup.goals] : [[]]; }, label: 'Walking to Cart' },
    { work: .5, label: 'Loading ' + it.e, pre: () => { const [x, y] = tileOf(c); return !!(t.sup && t.sup.ok() && t.sup.goals.some(g => g[0] === x && g[1] === y)); }, done: () => { c.carry = it.e; c.item = item; } });
  t.steps.push({ go: () => seatGoals(seat), label: 'Delivering ' + it.e },
    { work: .8, label: 'Serving ' + it.e, done: () => { c.carry = null; c.item = null; if (WANTS[r.kind].item === item) resolve(r, c); else wrongItem(r, c, it); } });
  return t;
}
function tAsk(c, r) {
  const st = r.kind === 'stander', w = (st ? 2 : 2.4) * (c.purser ? .5 : 1), p = r.pax;
  return { claim: r, steps: [{ go: () => seatGoals(p.seat), label: 'Walking' },
    { ask: () => st ? paSpec(r) : sceneSpec(r), label: 'Waiting for Your Call', done: () => { r.safe = true; if (st && p.strikes > 0 && !p.bonked) startGlove(r, c); } },
    { work: w, label: st ? 'Seating Passenger' : 'Sorting It Out', done: () => resolve(r, c, p.bonked && st ? 'good' : null) }] };
}
function tCoffee(c, e) {
  const cab = G.cab;
  return { claim: e, steps: [{ go: () => at(cab.galF), label: 'Walking to Galley' }, { work: 3, label: 'Brewing Coffee', done: () => { c.carry = '☕'; c.item = 'coffee'; } },
    { go: () => at(cab.door), label: 'Coffee Run' }, { work: .5, label: 'Serving FO Smriti', done: () => { c.carry = null; c.item = null; cockpitDone(e, e.t / 20); } }] };
}
function tLockIn(c, e) {
  const cab = G.cab;
  return { claim: e, steps: [{ go: () => at(cab.door), label: 'Walking to Cockpit' },
    { work: 12, label: 'Locked in Cockpit', start: () => { c.hidden = true; e.hold = true; e.arr = e.t / 20; cab.lavs[0].occ = true; sfx.slam(); toast('Two-person rule satisfied. ' + c.name + ' is locked in for 12 s.'); },
      done: () => { c.hidden = false; cab.lavs[0].occ = false; cockpitDone(e, e.arr); } }] };
}
function tLockLav(c, lav) {
  return { claim: lav, steps: [{ go: () => at(lav), label: 'Walking to Lavatory' }, { work: 1, label: 'Locking Lavatory', done: () => { lav.locked = true; G.score += 50; floater(lav.x + .5, lav.y + .5, '🔒 +50', '#3ddc97'); sfx.slam(); } }] };
}
const retSteps = (c, tr) => [{ go: () => at(tr.dock), label: 'Pushing Cart' },
  { work: .4, label: 'Docking Cart', done: () => { tr.state = 'docked'; tr.carrier = null; c.trolley = null; G.score += 40; sfx.slam(); floater(tr.dock.x + .5, tr.dock.y + .5, 'Docked +40', '#3ddc97'); } }];
function tDeploy(c, tr, tx, ty) {
  return { claim: tr, deploy: true, steps: [{ go: () => at(tr.dock), label: 'Walking to Dock' },
    { work: .5, label: 'Unlatching Cart', done: () => { tr.state = 'moving'; tr.carrier = c; c.trolley = tr; sfx.rumble(); } },
    { go: () => [[[tx, ty]]], short: true, label: 'Pushing Cart' },
    { work: .3, label: 'Parking Cart', done: () => {
      if (G.stage === 2 || G.cab.grid[ty][tx] !== 0) { c.task = { claim: tr, i: 0, steps: retSteps(c, tr) }; c.path = null; return; }
      G.cab.grid[ty][tx] = 2; tr.state = 'parked'; tr.x = tx; tr.y = ty; tr.carrier = null; c.trolley = null; sfx.slam();
    } }] };
}
function tStow(c, tr) {
  return { claim: tr, steps: [{ go: () => [[[tr.x - 1, tr.y], [tr.x + 1, tr.y]]], label: 'Walking to Cart' },
    { work: .4, label: 'Grabbing Cart', done: () => { G.cab.grid[tr.y][tr.x] = 0; tr.state = 'moving'; tr.carrier = c; c.trolley = tr; sfx.rumble(); } }, ...retSteps(c, tr)] };
}

function stepCrew(c, dt) {
  c.anim += dt;
  if (c.stun > 0) { c.stun -= dt; c.status = 'Stunned'; return; }
  const t = c.task; if (!t) { c.status = 'Idle'; return; }
  if (t.claim && t.claim.dead) { clearTask(c); return; }
  const s = t.steps[t.i]; if (!s) { clearTask(c); return; }
  if (s.go) {
    const [rx, ry] = tileOf(c);
    if (!c.path) {
      const p = firstPath(rx, ry, s.go());
      if (!p) { if (!c.blocked) { toast(c.name + ' is blocked by a cart. Dock it or send someone on the other side.'); sfx.bad(); } c.status = 'Blocked by Cart'; c.blocked = true; return; }
      if (s.short && p.length) p.pop();
      if (Math.abs(c.x - rx) + Math.abs(c.y - ry) > .01) p.unshift([rx, ry]);
      c.path = p;
    }
    c.blocked = false; c.status = c.trolley ? 'Pushing Cart' : s.label;
    let sp = SPEED * (c.purser ? 1.25 : 1) * (G.stage === 2 ? .7 : 1) * (c.trolley ? .8 : 1) * dt;
    while (sp > 0 && c.path.length) {
      const [tx, ty] = c.path[0];
      if (G.cab.grid[ty][tx] === 2 && !(tx === rx && ty === ry)) { c.path = null; return; }
      const dx = tx - c.x, dy = ty - c.y, d = Math.hypot(dx, dy);
      if (d > 1e-6) c.dir = [dx / d, dy / d];
      if (d <= sp) { c.x = tx; c.y = ty; sp -= d; c.path.shift(); } else { c.x += dx / d * sp; c.y += dy / d * sp; sp = 0; }
    }
    if (!c.path.length) { c.path = null; t.i++; }
  } else if (s.ask) {
    c.status = s.label;
    if (s.cool > 0) { s.cool -= dt; return; }
    if (!s.open) { s.open = true; G.promptQ.push({ c, r: t.claim, spec: s.ask(), cb: ok => { s.open = false; if (ok) { t.i++; s.done(); } else { s.cool = .7; wrongCall(t.claim); } } }); }
  } else {
    if (!s.started) { if (s.pre && !s.pre()) { t.i--; return; } s.started = true; s.t = 0; if (s.start) s.start(); }
    c.status = s.label; s.t += dt; c.prog = clamp(s.t / s.work, 0, 1);
    if (s.t >= s.work) { c.prog = 0; t.i++; if (s.done) s.done(); if (c.task === t && t.i >= t.steps.length) clearTask(c); }
  }
}

/* ---------- FEEDBACK: points, faces and the clock ---------- */
const addChaos = v => { G.chaos = clamp(G.chaos + v * G.kC, 0, 100); };   // kC keeps 1, 2 and 3 minute rounds equally forgiving
const floater = (gx, gy, text, color) => G.fx.push({ gx, gy, text, color, t: 0 });
function addTime(v) {
  const R = G.R, before = G.left;
  if (v > 0) { if (G.stage < 2) G.left = Math.max(G.left, Math.min(G.left + v, R * 1.5 - G.t)); }   // no extensions in descent; ATC caps a flight at 1.5x the round
  else G.left = Math.max(G.stage === 0 ? R * .25 + 2 : 0, G.left + v);
  const d = Math.round(G.left - before); if (d) { G.delta = d; G.deltaN++; } return d;
}
/* tier: good = quick (smile, +10 s) · ok = on time · late = served late (frown, -5 s) · bad = missed or wrong (-5 s) */
function reward(tier, base, gx, gy) {
  let pts = 0, d = 0; const n = G.n;
  if (tier === 'good') { pts = base; d = addTime(10); addChaos(-1); n.good++; sfx.good(); }
  else if (tier === 'ok') { pts = Math.round(base * .6); n.ok++; sfx.good(); }
  else if (tier === 'late') { pts = Math.round(base * .2); d = addTime(-5); n.late++; sfx.bad(); }
  else { pts = -base; d = addTime(-5); n.bad++; sfx.bad(); }
  G.score = Math.max(0, G.score + pts);
  const m = { good: ['😊', '#3ddc97'], ok: ['🙂', '#e9effc'], late: ['🙁', '#ffb703'], bad: ['😡', '#ff4d5e'] }[tier];
  floater(gx, gy, m[0] + ' ' + (pts >= 0 ? '+' : '−') + Math.abs(pts) + (d ? '  ' + (d > 0 ? '+' : '−') + Math.abs(d) + 's' : ''), m[1]);
}

/* ---------- REQUESTS ---------- */
function addReq(pax, kind, e, pat, pts, sc) {
  const r = { kind, pax, e, t: 0, pat, pts, sc, claimed: null, dead: false, safe: false };
  pax.req = r; G.reqs.push(r); if (e === '😭') sfx.wail(); else sfx.ping(); return r;
}
const freePax = f => G.cab.seats.filter(s => s.pax && !s.pax.req && s.pax.dazed <= 0 && (!f || f(s.pax))).map(s => s.pax);
const patK = () => G.L.pat / (1 + .3 * Math.max(0, G.t - G.R * .25) / G.R);
function spawnWant(only) {
  const have = new Set(ITEM_ORDER.slice(0, G.L.items)), kids = freePax(p => p.kid), any = freePax();
  const opts = Object.entries(WANTS).filter(([k, w]) => have.has(w.item) && (!only || only === k) && (w.kid ? kids.length : any.length));
  if (!opts.length) return null;
  let x = Math.random() * opts.reduce((a, o) => a + o[1].w, 0), ch = opts[0];
  for (const o of opts) { if ((x -= o[1].w) <= 0) { ch = o; break; } }
  const [k, w] = ch; return addReq(pick(w.kid ? kids : any), k, w.e, w.pat * patK(), w.pts);
}
function spawnScene(stage) {
  const kids = freePax(p => p.kid), adults = freePax(p => !p.kid), opts = SCENES.filter(s => s.st === stage && (s.kid ? kids.length : adults.length));
  if (!opts.length) return null; const sc = pick(opts);
  return addReq(pick(sc.kid ? kids : adults), 'scene', sc.e, 21 * patK(), 150, sc);
}
function spawnStander() {
  const again = freePax(p => !p.kid && p.strikes > 0 && !p.bonked), fresh = freePax(p => !p.kid && !p.strikes);
  const pool = again.length && (Math.random() < .65 || !fresh.length) ? again : fresh; if (!pool.length) return null;
  return addReq(pick(pool), 'stander', G.stage === 0 ? '🧳' : '🧍', G.stage === 0 ? G.L.sp : 14 * G.L.pat, 150);
}
function endReq(r) { r.dead = true; r.pax.req = null; const i = G.reqs.indexOf(r); if (i >= 0) G.reqs.splice(i, 1); if (G.pick && G.pick.r === r) G.pick = null; }
function resolve(r, c, force) {
  if (r.dead) return; const f = 1 - r.t / r.pat, s = r.pax.seat, tier = force || (f >= .55 ? 'good' : f >= .2 ? 'ok' : 'late');
  endReq(r); G.served++; if (r.kind === 'stander') r.pax.strikes++; if (tier !== 'late') r.pax.joy = 2.5;
  reward(tier, r.pts, s.x + .5, s.y + .3);
}
function wrongItem(r, c, it) { const s = r.pax.seat; addChaos(G.L.miss * .25); reward('bad', 40, s.x + .5, s.y + .3); toast('Seat ' + s.name + ': “I did not ask for ' + it.n.toLowerCase() + '.” Wrong item.'); }
function wrongCall(r) { const s = r.pax.seat; addChaos(G.L.miss * .25); reward('bad', 40, s.x + .5, s.y + .3); }
function expire(r) {
  endReq(r); G.missed++; const s = r.pax.seat;
  if (r.kind === 'stander') {
    r.pax.strikes++;
    if (G.stage === 0) { addChaos(G.L.lug); G.shakeT = .5; sfx.slam(); toast('Luggage down in row ' + s.row + '. Nearby crew are seeing stars.'); for (const c of G.crew) if (!c.hidden && Math.hypot(c.x - s.x, c.y - s.y) < 2.4) c.stun = 2.5; }
    else addChaos(G.L.miss);
  } else addChaos(G.L.miss);
  reward('bad', 50, s.x + .5, s.y + .3);
}

/* ---------- PROMPTS (the sim is paused while one is open) ---------- */
function paSpec(r) {
  const climb = G.stage === 0, p = r.pax, s = p.seat.name, ok = pick(climb ? PA.climb : PA.descent), near = Math.random() < .5 ? pick(climb ? PA.descent : PA.climb) : PA.off[0];
  return { tag: 'PA ANNOUNCEMENT · ' + (climb ? 'CLIMB' : 'DESCENT'), q: 'Seat ' + s + ' is out of the seat' + (p.strikes ? ' AGAIN' : '') + (climb ? ', digging in the overhead bin with the seatbelt sign on.' : ' during the descent.') + ' Pick the right announcement.',
    opts: shuffle([{ t: ok, ok: true }, { t: near }, { t: pick(PA.jokes) }]) };
}
function sceneSpec(r) { const sc = r.sc, s = r.pax.seat.name; return { tag: 'SITUATION · SEAT ' + s, q: sc.q.replace('{s}', 'Seat ' + s), opts: shuffle([{ t: sc.a, ok: true }, { t: sc.w[0] }, { t: sc.w[1] }]) }; }
function openPrompt(p) {
  G.prompt = p; p.max = p.c.purser ? 13 : 10; p.left = p.max; sfx.ping();
  $('#pTag').textContent = p.spec.tag; $('#pQ').textContent = p.spec.q;
  $('#pOpts').innerHTML = p.spec.opts.map((o, i) => `<button type="button" class="opt" data-i="${i}"><kbd>${i + 1}</kbd><span>${o.t}</span></button>`).join('');
  $('#pWho').textContent = p.c.name + ' is waiting for your call'; $('#prompt').hidden = false;
}
function promptTick(dt) { const p = G.prompt; p.left -= dt; $('#pBar').style.width = clamp(p.left / p.max * 100, 0, 100).toFixed(1) + '%'; if (p.left <= 0) answer(-1); }
function answer(i) {
  const p = G.prompt; if (!p) return; G.prompt = null; $('#prompt').hidden = true;
  const ok = i >= 0 && !!p.spec.opts[i] && !!p.spec.opts[i].ok;
  toast(ok ? 'Good call.' : i < 0 ? 'Too slow. The moment has passed.' : 'Wrong call. The whole cabin heard that.');
  if (!p.r.dead) p.cb(ok);
}
/* Repeat offender caught by the right announcement: five seconds with the glove. */
function startGlove(r, c) {
  G.glove = { r, c, left: 5, hits: 0, pow: 0 }; $('#gSeat').textContent = 'REPEAT OFFENDER · SEAT ' + r.pax.seat.name; $('#gHits').textContent = '0'; $('#glove').hidden = false; sfx.buzzer(); drawGlove();
}
function gloveTap() { const g = G.glove; if (!g) return; g.hits++; g.pow = 1; G.score += 10; G.bonks++; sfx.slam(); $('#gHits').textContent = g.hits; const b = $('#gBtn'); b.classList.remove('hit'); void b.offsetWidth; b.classList.add('hit'); }
function gloveTick(dt) {
  const g = G.glove; g.left -= dt; g.pow = Math.max(0, g.pow - dt * 5); $('#gBar').style.width = clamp(g.left / 5 * 100, 0, 100).toFixed(1) + '%'; drawGlove();
  if (g.left <= 0) { G.glove = null; $('#glove').hidden = true; const p = g.r.pax; p.bonked = true; p.dazed = 30; toast('Seat ' + p.seat.name + ' sits down very quietly. ' + g.hits + ' bonks, +' + g.hits * 10 + ' points.'); }
}
function drawGlove() {
  const g = G.glove, el = $('#gCv'), c2 = el.getContext('2d'), p = g.r.pax, k = g.pow; ctx = c2; c2.clearRect(0, 0, 160, 160);
  const x = 80 + (k ? rnd(-7, 7) * k : 0), y = 78 + (k ? rnd(-5, 5) * k : 0);
  rbox(x - 46, y + 34, 92, 60, 22, p.shirt, 'rgba(11,19,43,.6)', 3); head(x, y, 44, { skin: p.skin, hair: p.hair, style: p.style, mood: g.hits ? 'dazed' : 'angry' });
  if (k > .3) { c2.font = '700 26px ' + DISPLAY; c2.fillStyle = '#ffb703'; c2.textAlign = 'center'; c2.fillText(pick(['POW', 'BONK', 'THWACK', 'BOP']), 80 + rnd(-30, 30), 24 + rnd(0, 8)); }
  ctx = mainCtx;
}

/* ---------- COCKPIT ---------- */
function cockpitEvent(kind) {
  if (G.cockpit.some(e => e.kind === kind)) return false;
  G.cockpit.push({ id: ++G.eid, kind, t: 20, claimed: null, dead: false, hold: false, arr: 0 }); sfx.buzzer();
  toast(kind === 'coffee' ? 'FO Smriti: “Coffee. Now. Please.” Click the front galley.' : 'Captain: “Need the lav.” Send one crew to the cockpit door.'); return true;
}
function cockpitDone(e, frac) {
  e.dead = true; const i = G.cockpit.indexOf(e); if (i >= 0) G.cockpit.splice(i, 1);
  addChaos(-3); reward(frac >= .5 ? 'good' : 'ok', 200, .5, G.cab.cy + .3);
}
function enterStage(s) {
  G.stage = s; sfx.chime();
  if (s === 0) toast('Climbing. Seatbelt sign ON. Watch the overhead bins.');
  if (s === 1) { toast('Cruise. Seatbelt sign OFF. Service time.'); G.spawnT = .6; G.ckT = G.L.ckGap * .35; }
  if (s === 2) {
    sfx.rumble(); G.trT = 0; G.placing = false; G.dT = 1.5; G.jT = G.L.jolt * .6; toast('Turbulence! Dock the carts, lock the lavatories, seat everyone.');
    for (const c of G.crew) { const t = c.task; if (t && t.deploy) { if (c.trolley) { c.task = { claim: t.claim, i: 0, steps: retSteps(c, c.trolley) }; c.path = null; c.prog = 0; } else clearTask(c); } }
  }
}

/* ---------- SIMULATION ---------- */
function update(dt) {
  const L = G.L, R = G.R, cab = G.cab; G.t += dt; G.left -= dt;
  if (G.stage < 0) enterStage(0);
  if (G.stage === 0) { if (G.left < R * .25 + 2) G.left = R * .25 + 2; if (G.t >= R * .25) enterStage(1); }
  else if (G.stage === 1) {
    if (G.left > R * 1.5 - G.t) G.left = R * 1.5 - G.t;
    if (G.left <= R * .25) enterStage(2);
    else if (!G.warned && G.left <= R * .25 + 6) { G.warned = true; sfx.chime(); toast('Descent in 6 seconds. Start docking the carts.'); }
    else if (G.warned && G.left > R * .25 + 14) G.warned = false;
  } else if (G.left <= 0) { G.left = 0; return finish(); }
  const cap = G.reqs.length >= G.crew.length * 2 + 2;
  if (G.stage === 0) { G.cT -= dt; if (G.cT <= 0 && G.t < R * .25 - 3 && G.cN < L.cMax) { G.cN++; spawnStander(); G.cT = L.cGap * rnd(.8, 1.2); } }
  else if (G.stage === 1) {
    const esc = .7 + .9 * (G.t - R * .25) / R;   // each stage starts gently and builds
    G.spawnT -= dt; if (G.spawnT <= 0) { if (!cap) { if (Math.random() < L.sit / (L.sit + 14)) spawnScene(1) || spawnWant(); else spawnWant(); } G.spawnT = L.spawn / esc * rnd(.7, 1.3); }
    if (L.ck.length) { G.ckT -= dt; if (G.ckT <= 0 && G.left > R * .25 + 8) { const k = L.ck[G.ckN++ % L.ck.length]; cockpitEvent(k); if (L.dbl && Math.random() < .35) cockpitEvent(L.ck[G.ckN % L.ck.length]); G.ckT = L.ckGap * rnd(.8, 1.2); } }
  } else {
    G.dT -= dt; if (G.dT <= 0 && G.left > 6) { const k = G.dN++ % 3; if (!cap) { if (k === 0) spawnStander(); else if (k === 1) spawnScene(2) || spawnWant('sick') || spawnStander(); else spawnWant('sick') || spawnStander(); } G.dT = L.dGap * rnd(.8, 1.2); }
    if (L.jolt) { G.jT -= dt; if (G.jT <= 0 && G.left > 1) { G.jT = L.jolt; G.shakeT = .7; sfx.rumble(); for (const c of G.crew) if (!c.hidden) c.stun = Math.max(c.stun, .55); toast('Jolt! Everyone grabs a seatback.'); } }
    G.trT += dt; if (G.trT > 8 && cab.trolleys.some(t => t.state === 'parked')) return fail('trolley');
  }
  for (const r of [...G.reqs]) { if (r.safe) continue; r.t += dt; if (r.t >= r.pat) expire(r); }
  addChaos(G.reqs.length * L.rate * dt);
  for (const e of G.cockpit) { if (e.hold) continue; e.t -= dt; if (e.t <= 0) return fail(e.kind); }
  for (const c of G.crew) stepCrew(c, dt);
  for (const s of cab.seats) { const p = s.pax; if (p) { if (p.joy > 0) p.joy -= dt; if (p.dazed > 0) p.dazed -= dt; } }
  for (const f of G.fx) f.t += dt; G.fx = G.fx.filter(f => f.t < 1.5);
  if (G.shakeT > 0) G.shakeT -= dt;
  if (G.chaos >= 100) return fail('chaos');
  while (!G.prompt && !G.glove && G.promptQ.length) { const p = G.promptQ.shift(); if (!p.r.dead && p.c.task && p.c.task.claim === p.r) openPrompt(p); }
}
const bestKey = () => G.L.id + '@' + G.R / 60;
function finish() {
  const open = G.cab.lavs.filter(l => !l.locked && !l.occ).length; addChaos(open * 10);
  if (G.chaos >= 100) return fail('unsecured');
  const L = G.L, bonus = Math.round((100 - G.chaos) * 15); G.score += bonus;
  const stars = G.chaos < 30 ? 3 : G.chaos < 60 ? 2 : 1, d = Save.data, k = bestKey(), prev = d.best[k] || 0;
  d.best[k] = Math.max(prev, G.score); d.stars[k] = Math.max(d.stars[k] || 0, stars); d.unlocked = Math.max(d.unlocked, Math.min(LEVELS.length, G.li + 2)); if (G.li === 0) d.won1 = true; Save.store();
  G.state = 'end'; sfx.clear();
  const last = G.li === LEVELS.length - 1;
  showEnd(true, last ? 'ALL NINE TYPE RATINGS EARNED' : 'ON BLOCKS', (last ? 'The 777 is parked and nobody is crying. You run this airline now.' : L.name + ' landed with the cabin intact. ' + LEVELS[G.li + 1].name + ' unlocked.') + (open ? ' ' + open + ' lavatory left unlocked (+' + open * 10 + '% chaos).' : ''), stars, bonus, G.score > prev && prev > 0);
}
function fail(why) {
  G.state = 'end'; G.failWhy = why; G.prompt = null; G.glove = null; $('#prompt').hidden = true; $('#glove').hidden = true; sfx.alarm();
  const m = {
    coffee: ['EMERGENCY DIVERSION', 'FO Smriti never got her coffee and declared a caffeine emergency. The cockpit must never be ignored.'],
    lav: ['EMERGENCY DIVERSION', 'The Captain could not wait any longer and nobody came forward. Two-person cockpit rule broken.'],
    trolley: ['EMERGENCY DIVERSION', 'A loose cart met the passengers at speed. Carts must be docked within 8 s of turbulence.'],
    chaos: ['CABIN MELTDOWN', 'Cabin Chaos hit 100%. The passengers are now running the flight.'],
    unsecured: ['CABIN NOT SECURED', 'Unlocked lavatories at touchdown pushed Chaos to 100%.'],
  }[why];
  showEnd(false, m[0], m[1], 0, 0, false);
}

/* ---------- LEVEL FLOW ---------- */
function startLevel(i) {
  const L = LEVELS[i], cab = buildCabin(L), crew = [], R = (Save.data.round || 2) * 60, paxAll = [];
  cab.seats.forEach(s => { if (Math.random() < L.occ) { s.pax = { seat: s, req: null, shirt: pick(SHIRTS), skin: pick(SKINS), hair: pick(HAIRS), style: Math.floor(Math.random() * 4), kid: Math.random() < .13, strikes: 0, bonked: false, joy: 0, dazed: 0 }; paxAll.push(s.pax); } });
  for (let n = paxAll.filter(p => p.kid).length; n < 2; n++) pick(paxAll.filter(p => !p.kid)).kid = true;
  for (const p of paxAll) if (p.kid) p.style = pick([0, 1, 2]);
  const col = (x, y0) => Array.from({ length: cab.H }, (_, y) => [x, y]).sort((a, b) => Math.abs(a[1] - y0) - Math.abs(b[1] - y0)), front = col(1, cab.cy), rear = col(cab.W - 2, cab.aisles[0]);
  for (let k = 0; k < L.crew; k++) {
    const [x, y] = (k % 2 ? rear : front).shift(), f = k === 0 || k % 2 === 1;
    crew.push({ id: k, name: NAMES[k], purser: k === 0, x, y, dir: [k % 2 ? -1 : 1, 0], task: null, path: null, status: 'Idle', stun: 0, carry: null, item: null, trolley: null, hidden: false, prog: 0, anim: Math.random() * 6, blocked: false,
      look: { skin: SKINS[(k * 2 + 1) % SKINS.length], hair: HAIRS[k % 4], style: f ? 2 : 0, skirt: f, top: k === 0 ? '#ffb703' : '#2ec4b6', legs: '#14213d', accent: k === 0 ? '#c1121f' : '#ffb703', hat: k === 0 ? '#14213d' : null, band: '#ffb703' } });
  }
  Object.assign(G, { state: 'brief', li: i, L, R, kC: Math.pow(120 / R, .75), cab, crew, sel: crew[0], t: 0, left: R, stage: -1, chaos: 0, score: 0, served: 0, missed: 0, bonks: 0, n: { good: 0, ok: 0, late: 0, bad: 0 }, reqs: [], cockpit: [], promptQ: [], prompt: null, glove: null, pick: null,
    spawnT: 1, cT: 4, cN: 0, dT: 1.5, jT: 3, ckT: 5, ckN: Math.floor(Math.random() * 2), dN: 0, trT: 0, warned: false, placing: false, placeTr: null, fx: [], shakeT: 0, hover: null, eid: 0, failWhy: null, delta: 0, deltaN: 0 });
  $('#toastMsg').textContent = 'Stand by for departure.'; $('#prompt').hidden = true; $('#glove').hidden = true;
  buildCrewBar(); buildTray(); showScreen('game'); showOverlay('brief'); layout(); hud(true);
  $('#bFlt').textContent = 'FLIGHT ' + L.flight + ' · ' + L.seats + ' SEATS · ' + L.crew + ' CREW · ' + L.carts + (L.carts > 1 ? ' CARTS' : ' CART') + ' · ' + fmt(R) + ' ROUND';
  $('#bTitle').textContent = L.name; $('#bList').innerHTML = L.brief.map(b => '<li>' + b + '</li>').join('');
  $('#bGo').focus();
}
function begin() { if (G.state !== 'brief') return; sfx.init(); G.state = 'play'; showOverlay(null); }
function toMenu() { G.state = 'menu'; showOverlay(null); buildMenu(); showScreen('menu'); }
function pause(on) { if (on && G.state === 'play') { G.state = 'pause'; showOverlay('pause'); } else if (!on && G.state === 'pause') { G.state = 'play'; showOverlay(null); } }
function select(c) { if (!c || G.state === 'menu') return; G.sel = c; G.pick = null; sfx.blip(); }

/* ---------- ORDERS ---------- */
const validPark = (tx, ty) => { const c = G.cab; return !!c.grid[ty] && c.grid[ty][tx] === 0 && typeof c.cols[tx] === 'number' && c.aisles.includes(ty); };
function needSel() { if (G.sel) return G.sel; toast('Select a crew member first: click one or press 1–' + G.crew.length); sfx.bad(); return null; }
function orderDeploy(tx, ty) {
  const c = needSel(); if (!c) return;
  const tr = [G.placeTr, ...[...G.cab.trolleys].sort((a, b) => (Math.abs(a.dock.ax - tx) + Math.abs(a.dock.y - ty)) - (Math.abs(b.dock.ax - tx) + Math.abs(b.dock.y - ty)))].find(t => t && t.state === 'docked' && (!t.claimed || t.claimed === c));
  if (!tr) { toast('No cart free in the docks'); sfx.bad(); return; }
  assign(c, tDeploy(c, tr, tx, ty));
}
function cartButton() {
  const cab = G.cab; if (G.state !== 'play' || G.prompt || G.glove) return;
  if (G.placing) { G.placing = false; return; }
  const docked = cab.trolleys.some(t => t.state === 'docked' && !t.claimed), parked = cab.trolleys.filter(t => t.state === 'parked' && !t.claimed);
  if (G.stage < 2 && docked) { if (!needSel()) return; G.placing = true; G.placeTr = null; G.pick = null; toast('Click an aisle tile between seat rows to park the cart'); }
  else if (parked.length) {
    let n = 0; const idle = G.crew.filter(c => !c.task && !c.hidden && !c.trolley && c.stun <= 0);
    for (const t of parked) {
      const goals = [[[t.x - 1, t.y], [t.x + 1, t.y]]], ok = idle.filter(c => canReach(c, goals)).sort((a, b) => (Math.abs(a.x - t.x) + Math.abs(a.y - t.y)) - (Math.abs(b.x - t.x) + Math.abs(b.y - t.y)))[0];
      const c = ok || (n === 0 && G.sel && !G.sel.hidden && !G.sel.trolley ? G.sel : null); if (!c) continue;
      if (assign(c, tStow(c, t))) { n++; const k = idle.indexOf(c); if (k >= 0) idle.splice(k, 1); }
    }
    toast(n ? n + (n > 1 ? ' carts are' : ' cart is') + ' on the way back to the dock' : 'Nobody is free to fetch the cart. Select a crew member and click it.');
  } else toast(G.stage === 2 ? 'All carts are docked or on their way' : 'No cart free right now');
}
function pickItem(id) {
  if (G.state !== 'play' || G.prompt || G.glove) return; const p = G.pick;
  if (!p || p.r.dead) { G.pick = null; toast('Click a passenger bubble first, then pick the item.'); return; }
  G.pick = null; assign(p.c, tServe(p.c, p.r, id));
}
function onTile(tx, ty) {
  if (G.state !== 'play' || G.prompt || G.glove) return; const cab = G.cab;
  if (G.placing) { G.placing = false; if (!validPark(tx, ty)) { toast('Carts park on aisle tiles between seat rows'); sfx.bad(); return; } return orderDeploy(tx, ty); }
  if (tx < 0 && tx >= -Math.ceil(cab.nose) && ty >= 0 && ty < cab.H) { tx = 0; ty = cab.cy; }
  const seat = cab.seatAt.get(tx + ',' + ty), st = cab.stAt.get(tx + ',' + ty), tr = cab.trolleys.find(t => t.state === 'parked' && t.x === tx && t.y === ty);
  G.pick = null;
  if (!seat && !st && !tr) { if (cab.grid[ty] && cab.grid[ty][tx] === 0 && G.sel) assign(G.sel, { steps: [{ go: () => [[[tx, ty]]], label: 'Walking' }] }); return; }
  const c = needSel(); if (!c) return;
  if (tr) return void assign(c, tStow(c, tr));
  if (seat) {
    const r = seat.pax && seat.pax.req;
    if (!r) { toast(seat.pax ? 'Seat ' + seat.name + ' is fine. For now.' : 'Seat ' + seat.name + ' is empty'); return; }
    if (WANTS[r.kind]) { if (c.hidden || c.trolley) return void assign(c, { steps: [] }); G.pick = { c, r }; sfx.blip(); toast('Seat ' + seat.name + ' shows ' + r.e + '. Pick the item from the cart tray.'); return; }
    return void assign(c, tAsk(c, r));
  }
  if (st.type === 'lav') {
    if (G.stage !== 2) toast('Lavatories get locked during descent'); else if (st.locked) toast('Already locked'); else if (st.occ) toast('The Captain is still in there'); else assign(c, tLockLav(c, st));
  } else if (st.type === 'door') {
    const ev = G.cockpit.filter(e => !e.hold).sort((a, b) => (!!a.claimed - !!b.claimed) || ((a.kind === 'lav' ? 0 : 1) - (b.kind === 'lav' ? 0 : 1)))[0];
    if (!ev) toast('The cockpit is quiet. Enjoy it.'); else assign(c, ev.kind === 'lav' ? tLockIn(c, ev) : tCoffee(c, ev));
  } else if (st.type === 'galley') {
    const ev = st.front && G.cockpit.find(e => e.kind === 'coffee');
    if (ev) assign(c, tCoffee(c, ev)); else toast('Galleys are stocked. Click a passenger bubble, then pick the item.');
  } else if (st.type === 'dock') {
    const t = st.tr;
    if (t.state === 'parked') assign(c, tStow(c, t));
    else if (t.state === 'docked') { if (G.stage === 2) toast('No service during descent'); else { G.placing = true; G.placeTr = t; toast('Click an aisle tile between seat rows to park the cart'); } }
  }
}

/* ---------- VIEW GEOMETRY ---------- */
function layout() {
  const box = $('#stage'), cw = Math.max(120, box.clientWidth), ch = Math.max(120, box.clientHeight), dpr = Math.min(2, window.devicePixelRatio || 1);
  V.cw = cw; V.ch = ch; V.dpr = dpr; cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr);
  if (!G.cab) return;
  const { W, H, nose, tail } = G.cab, ex = W + nose + tail + .8, ey = H + 2.6;
  V.vert = ch > cw * 1.15; const along = V.vert ? ch : cw, across = V.vert ? cw : ch;
  V.ts = clamp(Math.min(along / ex, across / ey), 6, 76);
  V.ox = (along - ex * V.ts) / 2 + (nose + .4) * V.ts; V.oy = (across - H * V.ts) / 2;
}
const P = (gx, gy) => { const a = V.ox + gx * V.ts, b = V.oy + gy * V.ts; return V.vert ? [b, a] : [a, b]; };
function fromScreen(ev) { const r = cv.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top, a = V.vert ? y : x, b = V.vert ? x : y; return [(a - V.ox) / V.ts, (b - V.oy) / V.ts, x, y]; }

/* ---------- DRAW HELPERS (grid space) ---------- */
function rr(x, y, w, h, r) { r = Math.max(0, Math.min(r, w / 2, h / 2)); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function paint(fill, stroke, lw) { if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); } }
function box(gx, gy, gw, gh, r, fill, stroke, lw) { const [x1, y1] = P(gx, gy), [x2, y2] = P(gx + gw, gy + gh); rr(Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1), Math.abs(y2 - y1), r * V.ts); paint(fill, stroke, (lw || .05) * V.ts); }
function disc(gx, gy, r, fill, stroke, lw) { const [x, y] = P(gx, gy); circ(x, y, r * V.ts, fill, stroke, (lw || .05) * V.ts); }
function ring(gx, gy, r, frac, color, lw) { const [x, y] = P(gx, gy); sRing(x, y, r * V.ts, frac, color, lw * V.ts); }
function text(s, gx, gy, size, color, font, dy) { const [x, y] = P(gx, gy); sText(s, x, y - (dy || 0), size * V.ts, color, font); }
const emo = (s, gx, gy, size) => text(s, gx, gy, size, '#fff', EMOJI);
function shape(pts, fill, stroke, lw) { ctx.beginPath(); pts.forEach((p, i) => { const [x, y] = P(p[0], p[1]); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); paint(fill, stroke, (lw || .05) * V.ts); }
/* ---------- DRAW HELPERS (screen space) ---------- */
function circ(x, y, r, fill, stroke, lw) { ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, TAU); paint(fill, stroke, lw); }
function rbox(x, y, w, h, r, fill, stroke, lw) { rr(x, y, w, h, r); paint(fill, stroke, lw); }
function sRing(x, y, r, frac, color, lw) { ctx.beginPath(); ctx.arc(x, y, r, -TAU / 4, -TAU / 4 + TAU * clamp(frac, 0, 1)); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.stroke(); ctx.lineCap = 'butt'; }
function sText(s, x, y, px, color, font) { px = Math.max(6, px); ctx.font = (font === EMOJI ? '' : '700 ') + px.toFixed(1) + 'px ' + (font || DISPLAY); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = color || '#fff'; ctx.fillText(s, x, y + px * .06); }
const urgency = f => f >= .55 ? '#3ddc97' : f >= .2 ? '#ffb703' : '#ff4d5e';
const INK = 'rgba(11,19,43,.62)';

/* ---------- PEOPLE ---------- */
function head(x, y, r, o) {
  const m = o.mood || 'calm', skin = m === 'sick' ? '#b7d6a0' : o.skin, lw = Math.max(1, r * .13), ink = '#1b1b2b';
  if (o.style === 1) rbox(x - r * 1.12, y - r * .8, r * 2.24, r * 2.2, r * .8, o.hair);                  // long hair behind
  if (o.style === 2) circ(x, y - r * 1.12, r * .44, o.hair);                                            // bun
  circ(x, y, r, skin, INK, Math.max(1, r * .1));
  if (m === 'angry') circ(x, y, r, 'rgba(255,77,94,.28)');
  if (o.style !== 3) { ctx.beginPath(); ctx.arc(x, y, r * 1.03, Math.PI * 1.1, Math.PI * 1.9); ctx.closePath(); paint(o.hair); }   // fringe
  else { ctx.beginPath(); ctx.arc(x, y, r * 1.03, Math.PI * 1.25, Math.PI * 1.75); ctx.closePath(); paint(o.hair); }
  if (o.hat) { rbox(x - r * .82, y - r * 1.5, r * 1.64, r * .7, r * .3, o.hat); rbox(x - r * 1.1, y - r * .98, r * 2.2, r * .42, r * .18, o.hat); rbox(x - r * 1.0, y - r * .86, r * 2.0, r * .16, 0, o.band); }
  const ex = r * .38, ey = y + r * .12; ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = lw; ctx.lineCap = 'round';
  for (const s of [-1, 1]) {
    const px = x + s * ex; ctx.beginPath();
    if (m === 'dazed') { ctx.moveTo(px - r * .14, ey - r * .14); ctx.lineTo(px + r * .14, ey + r * .14); ctx.moveTo(px + r * .14, ey - r * .14); ctx.lineTo(px - r * .14, ey + r * .14); ctx.stroke(); }
    else if (m === 'happy') { ctx.arc(px, ey + r * .08, r * .17, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); }
    else if (m === 'cry' || m === 'sleep') { ctx.arc(px, ey - r * .08, r * .17, Math.PI * .15, Math.PI * .85); ctx.stroke(); }
    else { ctx.arc(px, ey, r * .12, 0, TAU); ctx.fill(); }
    if (m === 'angry' || m === 'annoyed') { ctx.beginPath(); ctx.moveTo(px + s * r * .24, ey - r * (m === 'angry' ? .46 : .36)); ctx.lineTo(px - s * r * .2, ey - r * (m === 'angry' ? .24 : .32)); ctx.stroke(); }
    if (m === 'cry') { const d = (G.anim * 1.6 + (s > 0 ? .5 : 0)) % 1; circ(px, ey + r * (.15 + d * .7), r * .11, '#7bdff2'); }
  }
  const my = y + r * .52; ctx.strokeStyle = ink; ctx.lineWidth = lw; ctx.beginPath();
  if (m === 'happy') { ctx.arc(x, my - r * .16, r * .34, Math.PI * .12, Math.PI * .88); ctx.stroke(); }
  else if (m === 'calm' || m === 'sleep') { ctx.arc(x, my - r * .12, r * .22, Math.PI * .2, Math.PI * .8); ctx.stroke(); }
  else if (m === 'annoyed') { ctx.moveTo(x - r * .2, my); ctx.lineTo(x + r * .2, my); ctx.stroke(); }
  else if (m === 'angry' || m === 'sick') { ctx.arc(x, my + r * .2, r * .26, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke(); }
  else if (m === 'cry') { ctx.ellipse(x, my + r * .02, r * .24, r * .28, 0, 0, TAU); ctx.fillStyle = '#5a1020'; ctx.fill(); }
  else { ctx.arc(x, my, r * .12, 0, TAU); ctx.stroke(); }
  ctx.lineCap = 'butt';
}
/* Seated passenger: head and shoulders, facing the viewer. */
function bust(x, y, u, o) {
  const k = o.kid ? .78 : 1, tw = u * .52 * k, th = u * .36 * k, ty = y + u * .04 + (o.kid ? u * .09 : 0);
  rbox(x - tw / 2, ty, tw, th, u * .13 * k, o.top, INK, Math.max(1, u * .03));
  if (!o.kid) { ctx.beginPath(); ctx.moveTo(x - u * .08, ty); ctx.lineTo(x, ty + u * .1); ctx.lineTo(x + u * .08, ty); ctx.closePath(); paint(o.skin); }
  head(x, ty - u * .1 * k, u * .2 * k, o);
}
/* Standing figure: legs, uniform or shirt, arms, head. (x, y) is the point between the feet. */
function figure(x, y, u, o) {
  const sw = o.walk ? Math.sin(o.walk) : 0, lw = Math.max(1, u * .032), lh = u * .27, tw = u * .42, th = u * .4, ty = y - lh - th + u * .05, aw = u * .1;
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(x, y, u * .27, u * .08, 0, 0, TAU); ctx.fill();
  for (const s of [-1, 1]) { const lift = Math.max(0, sw * s) * u * .05; rbox(x + (s < 0 ? -u * .14 : u * .03), y - lh, u * .11, lh - lift, u * .04, o.skirt ? o.skin : o.legs, INK, lw); rbox(x + (s < 0 ? -u * .16 : u * .02), y - u * .055 - lift, u * .14, u * .06, u * .03, '#0b132b'); }
  if (o.skirt) { ctx.beginPath(); ctx.moveTo(x - tw * .5, ty + th * .6); ctx.lineTo(x + tw * .5, ty + th * .6); ctx.lineTo(x + tw * .62, ty + th + u * .1); ctx.lineTo(x - tw * .62, ty + th + u * .1); ctx.closePath(); paint(o.legs, INK, lw); }
  for (const s of [-1, 1]) {
    const ax = x + s * (tw / 2 + aw * .35) - aw / 2;
    if (o.armsUp) { rbox(ax, ty - th * .55, aw, th * .75, aw / 2, o.top, INK, lw); circ(ax + aw / 2, ty - th * .58, aw * .55, o.skin, INK, lw); }
    else { const d = sw * s * u * .04; rbox(ax, ty + u * .03 + d, aw, th * .72, aw / 2, o.top, INK, lw); circ(ax + aw / 2, ty + u * .03 + d + th * .74, aw * .52, o.skin, INK, lw); }
  }
  rbox(x - tw / 2, ty, tw, th, u * .12, o.top, INK, lw);
  if (o.accent) { ctx.beginPath(); ctx.moveTo(x - u * .1, ty + u * .01); ctx.lineTo(x + u * .1, ty + u * .01); ctx.lineTo(x + u * .03, ty + u * .17); ctx.lineTo(x - u * .03, ty + u * .17); ctx.closePath(); paint(o.accent); for (const s of [-1, 1]) circ(x + s * u * .07, ty + th * .55, u * .022, o.band || '#fff'); }
  head(x, ty - u * .13, u * .2, o);
  return ty - u * .13;
}
function bubble(gx, gy, e, frac, claimed, r0) {
  const hot = frac != null && frac < .2, k = hot ? 1 + .08 * Math.sin(G.anim * 14) : 1, r = (r0 || .33) * k;
  disc(gx, gy, r, '#f4f7ff', 'rgba(11,19,43,.6)', .04); emo(e, gx, gy, r * 1.3);
  ring(gx, gy, r + .035, frac == null ? 1 : frac, frac == null ? '#ffb703' : urgency(frac), .085);
  if (claimed) { disc(gx + r * .8, gy + r * .8, .15, claimed.purser ? '#ffb703' : '#2ec4b6', '#0b132b', .035); text(String(claimed.id + 1), gx + r * .8, gy + r * .8, .22, '#0b132b'); }
}
/* Service cart seen from above: frame, handle and a tray of stock from this aircraft's item list. */
function cartShape(cx, cy, s) {
  s = s || 1; const its = ITEM_ORDER.slice(0, G.L.items);
  box(cx - .43 * s, cy - .37 * s, .86 * s, .74 * s, .1, '#dfe6f3', '#3b4868', .055); box(cx - .37 * s, cy - .31 * s, .74 * s, .62 * s, .06, '#8e9bb8');
  for (let i = 0; i < 6; i++) { const it = ITEMS[its[i % its.length]], ix = cx + (-.24 + (i % 3) * .24) * s, iy = cy + (i < 3 ? -.15 : .15) * s; if (V.ts * s > 44) emo(it.e, ix, iy, .2 * s); else disc(ix, iy, .085 * s, it.c, 'rgba(11,19,43,.5)', .02); }
  box(cx - .47 * s, cy - .08 * s, .05 * s, .16 * s, .02, '#3b4868'); box(cx + .42 * s, cy - .08 * s, .05 * s, .16 * s, .02, '#3b4868');
}

/* ---------- RENDER ---------- */
function draw(dt) {
  const w = V.cw, h = V.ch; ctx = mainCtx; ctx.setTransform(V.dpr, 0, 0, V.dpr, 0, 0);
  const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0b132b'); g.addColorStop(1, '#101d42'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  if (G.state === 'menu' || !G.cab) return;
  const live = G.state === 'play' && !G.prompt && !G.glove, moving = live && !V.calm; if (G.state === 'play') G.anim += dt;
  ctx.strokeStyle = 'rgba(143,161,199,.16)'; ctx.lineWidth = 1.5; ctx.beginPath();
  for (const s of streaks) {
    if (moving) { s.u += s.s * dt * (G.stage === 2 ? 1.5 : 1); if (s.u > 1.1) { s.u = -.1; s.v = Math.random(); } }
    if (V.vert) { ctx.moveTo(s.v * w, s.u * h); ctx.lineTo(s.v * w, (s.u + s.l) * h); } else { ctx.moveTo(s.u * w, s.v * h); ctx.lineTo((s.u + s.l) * w, s.v * h); }
  }
  ctx.stroke();
  let sh = 0; if (moving) { if (G.stage === 2) sh = G.L.shake; if (G.shakeT > 0) sh += 7 * G.shakeT; }
  ctx.save(); if (sh) ctx.translate(rnd(-sh, sh) * .5, rnd(-sh, sh) * .5);
  drawAirframe(); drawCabin(); drawCrew(); drawBubbles(); drawFx(); ctx.restore(); drawCoach();
}
function drawAirframe() {
  const { W, H, nose, tail } = G.cab, m = .45, y0 = -m, y1 = H + m, cy = H / 2, far = H * .9 + 3;
  for (const s of [-1, 1]) {
    const e = s < 0 ? y0 : y1;
    shape([[W * .36, e], [W * .6, e], [W * .74, e + s * far], [W * .62, e + s * far]], '#182650', '#2c3f73', .06);
    box(W * .4, e + s * (H * .22 + .9) - .38, 1.5, .76, .3, '#223468', '#3a4f8a', .05);
    shape([[W + tail * .25, e - s * .3], [W + tail * .8, cy + s * .45], [W + tail * .98, cy + s * (H * .42 + 1)], [W + tail * .62, cy + s * (H * .42 + 1)]], '#182650', '#2c3f73', .06);
  }
  const mv = (x, y) => ctx.moveTo(...P(x, y)), ln = (x, y) => ctx.lineTo(...P(x, y)), bz = (a, b, c, d, e, f) => ctx.bezierCurveTo(...P(a, b), ...P(c, d), ...P(e, f));
  ctx.beginPath(); mv(0, y0); ln(W, y0); bz(W + tail * .6, y0, W + tail, cy - .9, W + tail, cy - .3); ln(W + tail, cy + .3); bz(W + tail, cy + .9, W + tail * .6, y1, W, y1); ln(0, y1);
  bz(-nose * .55, y1, -nose, cy + H * .3, -nose, cy); bz(-nose, cy - H * .3, -nose * .55, y0, 0, y0); ctx.closePath();
  paint('#16224a', '#a9bbe6', .13 * V.ts);
  ctx.beginPath(); mv(-nose * .74, cy - H * .2); ctx.quadraticCurveTo(...P(-nose * .97, cy), ...P(-nose * .74, cy + H * .2)); ctx.strokeStyle = 'rgba(111,255,233,.4)'; ctx.lineWidth = .22 * V.ts; ctx.lineCap = 'round'; ctx.stroke(); ctx.lineCap = 'butt';
}
function paxMood(p) {
  const r = p.req; if (p.dazed > 0) return 'dazed'; if (!r) return p.joy > 0 ? 'happy' : 'calm';
  if (r.e === '😭') return 'cry'; if (r.kind === 'sick') return 'sick'; if (r.e === '😴') return 'sleep';
  const f = 1 - r.t / r.pat; return r.kind === 'stander' || f < .2 ? 'angry' : f < .55 ? 'annoyed' : 'calm';
}
function drawCabin() {
  const cab = G.cab, { W, H, grid, cols } = cab, dcy = cab.cy + .5, hv = G.hover, pulse = .5 + .5 * Math.sin(G.anim * 9), u = V.ts;
  for (let x = 1; x < W - 1; x++) {
    const gal = cols[x] === 'gal'; if (gal) box(x + .03, 0, .94, H, .1, '#1b2a55');
    for (let y = 0; y < H; y++) if (grid[y][x] !== 1 && !gal) box(x, y + .04, 1, .92, 0, '#22325f');
    if (!gal && u > 22) for (const a of cab.aisles) text(String(cols[x]), x + .5, a + .5, .3, 'rgba(143,161,199,.38)');
  }
  if (G.placing) for (let x = 0; x < W; x++) for (const a of cab.aisles) if (validPark(x, a)) box(x + .08, a + .1, .84, .8, .15, 'rgba(255,183,3,' + (.16 + .14 * pulse) + ')', 'rgba(255,183,3,.7)', .03);
  for (const s of cab.seats) { box(s.x + .06, s.y + .06, .88, .88, .2, '#2f4a86', '#1f3466', .04); const [x, y] = P(s.x + .5, s.y + .5); rbox(x - u * .3, y - u * .4, u * .6, u * .2, u * .08, '#3d5ca3'); }
  for (const s of cab.seats) {
    const p = s.pax; if (!p) continue; const r = p.req, [x, y] = P(s.x + .5, s.y + .5), o = { skin: p.skin, hair: p.hair, style: p.style, top: p.shirt, kid: p.kid, mood: paxMood(p) };
    if (G.pick && G.pick.r === r) box(s.x + .02, s.y + .02, .96, .96, .2, null, '#ffffff', .07);
    if (r && r.kind === 'stander') figure(x - u * .1, y + u * .42, u * .92, { ...o, legs: '#3b4a6b', armsUp: G.stage === 0, walk: G.anim * 9 });
    else bust(x - (r ? u * .1 : 0), y, u, o);
    if (p.dazed > 0) sText('💫', x + u * .2, y - u * .32, u * .3, '#fff', EMOJI);
  }
  for (const s of cab.st) {
    const cx = s.x + .5, cy = s.y + .5; let stroke = '#3a4f8a', fill = '#0f1934', ico = '';
    if (s.type === 'lav') { const need = G.stage === 2 && !s.locked && !s.occ; ico = s.occ ? '🚽' : s.locked ? '🔒' : G.stage === 2 ? '🔓' : '🚻'; if (need) { stroke = '#ffb703'; fill = 'rgba(255,183,3,' + (.12 + .2 * pulse) + ')'; } else if (s.locked) stroke = '#3ddc97'; }
    else if (s.type === 'galley') { ico = s.front ? '☕' : '🍱'; if (s.front && G.cockpit.some(e => e.kind === 'coffee' && !e.claimed)) { stroke = '#ffb703'; fill = 'rgba(255,183,3,' + (.12 + .2 * pulse) + ')'; } }
    else if (s.type === 'door') { const ev = G.cockpit.some(e => !e.hold); ico = '🚪'; if (ev) { stroke = '#ff4d5e'; fill = 'rgba(255,77,94,' + (.15 + .25 * pulse) + ')'; } }
    box(s.x + .05, s.y + .05, .9, .9, .16, fill, stroke, .06);
    if (s.type === 'dock') { if (s.tr.state === 'docked') cartShape(cx, cy, .9); else text('DOCK', cx, cy, .24, '#6c7fb0'); } else emo(ico, cx, cy, .52);
  }
  // flight deck: FO Smriti and the Captain
  const cof = G.cockpit.find(e => e.kind === 'coffee'), lav = G.cockpit.find(e => e.kind === 'lav'), fx = -1.02, pil = { top: '#f4f7ff', hat: '#14213d', band: '#ffb703', style: 0 };
  const [px1, py1] = P(fx, dcy - .62), [px2, py2] = P(fx, dcy + .62);
  bust(px1, py1, u * .9, { ...pil, skin: '#e0ac69', hair: '#1b1b1b', style: 1, mood: cof ? (cof.t < 8 ? 'angry' : 'annoyed') : 'calm' });
  if (cof) bubble(fx + .42, dcy - .62 - .3, '☕', cof.t / 20, cof.claimed, .3);
  if (lav && lav.hold) { const c = lav.claimed, [lx, ly] = P(.5, .5); if (c) { bust(px2, py2, u * .9, { ...c.look, mood: 'calm' }); sRing(px2, py2, u * .5, 1 - c.prog, '#6fffe9', u * .08); } sText('CPT', lx, ly + u * .3, u * .2, '#ffb703'); }
  else { bust(px2, py2, u * .9, { ...pil, skin: '#c68642', hair: '#3b2417', mood: lav ? (lav.t < 8 ? 'angry' : 'annoyed') : 'calm' }); if (lav) bubble(fx + .42, dcy + .62 - .3, '🚽', lav.t / 20, lav.claimed, .3); }
  for (const tr of cab.trolleys) if (tr.state === 'parked') { box(tr.x + .02, tr.y + .06, .96, .88, .18, 'rgba(111,255,233,.12)', 'rgba(111,255,233,.5)', .04); cartShape(tr.x + .5, tr.y + .5); }
  if (hv && grid[hv[1]] && grid[hv[1]][hv[0]] !== undefined) box(hv[0] + .04, hv[1] + .04, .92, .92, .16, null, G.placing ? '#ffb703' : 'rgba(111,255,233,.7)', .05);
  if (hv && G.placing && validPark(hv[0], hv[1])) { ctx.globalAlpha = .7; cartShape(hv[0] + .5, hv[1] + .5); ctx.globalAlpha = 1; }
}
function drawCrew() {
  const sel = G.sel, u = V.ts;
  if (sel && sel.path && sel.path.length && !sel.hidden) {
    ctx.beginPath(); ctx.moveTo(...P(sel.x + .5, sel.y + .5)); for (const [x, y] of sel.path) ctx.lineTo(...P(x + .5, y + .5));
    ctx.setLineDash([u * .14, u * .16]); ctx.strokeStyle = 'rgba(111,255,233,.75)'; ctx.lineWidth = .07 * u; ctx.stroke(); ctx.setLineDash([]);
  }
  const list = G.crew.filter(c => !c.hidden).map(c => ({ c, p: P(c.x + .5, c.y + .5) })).sort((a, b) => a.p[1] - b.p[1]);
  for (const { c, p } of list) {
    const wob = c.stun > 0 ? Math.sin(G.anim * 30) * u * .05 : 0, x = p[0] + wob, y = p[1] + u * .38, col = c.purser ? '#ffb703' : '#2ec4b6', walking = !!c.path && c.stun <= 0;
    if (c.trolley) cartShape(c.x + .5 + c.dir[0] * .8, c.y + .5 + c.dir[1] * .8, .95);
    if (c === sel) { ctx.beginPath(); ctx.ellipse(x, y, u * (.4 + .03 * Math.sin(G.anim * 7)), u * .15, 0, 0, TAU); paint('rgba(111,255,233,.22)', '#ffffff', u * .07); }
    const hy = figure(x, y, u, { ...c.look, walk: walking ? c.anim * 13 : 0, mood: c.stun > 0 ? 'dazed' : c.blocked ? 'annoyed' : 'calm' });
    const ty = hy - u * (c.purser ? .56 : .42);
    circ(x, ty, u * .16, c === sel ? '#ffffff' : col, '#0b132b', u * .04); sText(String(c.id + 1), x, ty, u * .24, '#0b132b');
    if (c.prog > 0) sRing(x, ty, u * .22, c.prog, '#6fffe9', u * .07);
    if (c.carry) { circ(x + u * .36, y - u * .44, u * .19, '#f4f7ff', '#0b132b', u * .035); sText(c.carry, x + u * .36, y - u * .44, u * .26, '#fff', EMOJI); }
    if (c.stun > 0) sText('💫', x + u * .3, ty, u * .34, '#fff', EMOJI); else if (c.blocked) sText('⛔', x + u * .3, ty, u * .3, '#fff', EMOJI);
    else if (!c.task && G.state === 'play') sText('IDLE', x, y + u * .2, u * .2, 'rgba(255,183,3,' + (.6 + .4 * Math.sin(G.anim * 6)) + ')');
  }
}
/* First-flight coach: points at what to click next until the player has landed the ATR once. */
const coaching = () => G.state === 'play' && G.L.id === 'atr72' && !Save.data.won1 && !G.prompt && !G.glove;
function drawCoach() {
  if (!coaching()) return; const u = V.ts, bob = Math.sin(G.anim * 6) * u * .12; let msg = '';
  if (G.pick) msg = '3. Now pick ' + G.pick.r.e + ' from the cart tray below';
  else {
    const r = G.reqs.filter(q => !q.claimed).sort((a, b) => (a.pat - a.t) - (b.pat - b.t))[0];
    if (r) { const s = r.pax.seat, [x, y] = P(s.x + .5, s.y + .5); circ(x, y, u * (.62 + .06 * Math.sin(G.anim * 6)), null, '#ffb703', u * .08); sText('👇', x, y - u * .95 + bob, u * .6, '#fff', EMOJI); msg = (G.sel ? '' : '1. Click a crew member   ') + '2. Click the passenger with the bubble'; }
    else if (G.stage === 2) { const l = G.cab.lavs.find(v => !v.locked && !v.occ); if (l) { const [x, y] = P(l.x + .5, l.y + .5); circ(x, y, u * .62, null, '#ffb703', u * .08); msg = 'Descent: click each lavatory 🔓 to lock it'; } }
  }
  if (!msg) return; const px = Math.max(13, Math.min(22, V.cw / 34)); ctx.font = '700 ' + px + 'px ' + DISPLAY; const w = ctx.measureText(msg).width + 28, x = V.cw / 2;
  rbox(x - w / 2, 10, w, px + 16, 9, '#ffb703'); sText(msg, x, 10 + (px + 16) / 2, px, '#1a1300', DISPLAY + ',' + EMOJI);
}
function drawBubbles() { for (const r of G.reqs) { const s = r.pax.seat; bubble(s.x + .7, s.y + .3, r.e, r.safe ? 1 : 1 - r.t / r.pat, r.claimed); } }
function drawFx() { for (const f of G.fx) { ctx.globalAlpha = clamp(1.5 - f.t, 0, 1); text(f.text, f.gx, f.gy, .4, f.color, DISPLAY + ',' + EMOJI, f.t * V.ts * .8); } ctx.globalAlpha = 1; }

/* ---------- DOM: HUD, CART TRAY, CREW BAR, SCREENS ---------- */
const fmt = s => { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
const num = n => Math.round(n).toLocaleString('en-US');
let toastT = 0, alertKey = '', deltaSeen = 0, trayKey = '';
function toast(m) { const el = $('#toastMsg'); el.textContent = m; el.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('on'), 3200); }
function showScreen(n) { $('#menu').hidden = n !== 'menu'; $('#game').hidden = n !== 'game'; if (n === 'game') layout(); }
function showOverlay(n) { for (const id of ['brief', 'end', 'pause']) $('#' + id).hidden = id !== n; }
function buildCrewBar() {
  $('#crewList').innerHTML = G.crew.map(c => `<button class="crew${c.purser ? ' purser' : ''}" data-i="${c.id}" type="button"><span class="key">${c.id + 1}</span><span class="who"><b>${c.name}</b><i>Idle</i></span></button>`).join('');
}
function buildTray() {
  $('#trayItems').innerHTML = ITEM_ORDER.slice(0, G.L.items).map((id, i) => `<button class="item" type="button" data-id="${id}" title="${ITEMS[id].n}"><span class="ie">${ITEMS[id].e}</span><span class="in">${ITEMS[id].n}</span><kbd>${ITEM_KEYS[i].toUpperCase()}</kbd></button>`).join('');
}
function alerts() {
  const a = [];
  for (const e of G.cockpit) {
    if (e.hold) a.push({ k: 'h' + e.id, cls: 'calm', txt: 'TWO-PERSON RULE · CAPTAIN IN LAV', f: e.claimed ? 1 - e.claimed.prog : 1, s: e.claimed ? Math.ceil(12 * (1 - e.claimed.prog)) : 12 });
    else a.push({ k: 'e' + e.id, cls: 'hot', txt: e.kind === 'coffee' ? '☕ FO SMRITI · COFFEE TO COCKPIT' : '🚽 CAPTAIN BREAK · CREW TO COCKPIT', f: e.t / 20, s: Math.ceil(e.t) });
  }
  if (G.stage === 2 && G.trT < 8.5 && G.cab.trolleys.some(t => t.state !== 'docked')) a.push({ k: 'tr', cls: 'hot', txt: '🛒 LOOSE CART · DOCK IT', f: 1 - G.trT / 8, s: Math.ceil(8 - G.trT) });
  return a;
}
function hud(force) {
  if (!G.cab) return; const L = G.L, st = Math.max(0, G.stage);
  $('#hAc').textContent = L.name; $('#hFlt').textContent = L.flight;
  const sb = $('#hStage'), nm = ['CLIMB', 'CRUISE', 'DESCENT'][st]; if (sb.textContent !== nm || force) { sb.textContent = nm; sb.dataset.s = st; }
  $('#hBelt').classList.toggle('on', st !== 1);
  $('#hClock').textContent = fmt(G.left); $('#hClock').classList.toggle('low', G.left <= 10);
  if (G.deltaN !== deltaSeen || force) { deltaSeen = G.deltaN; const d = $('#hDelta'); d.textContent = G.delta ? (G.delta > 0 ? '+' : '−') + Math.abs(G.delta) + 's' : ''; d.className = ''; void d.offsetWidth; if (G.delta && !force) d.className = G.delta > 0 ? 'up' : 'down'; }
  const ch = $('#hChaos'); ch.style.width = G.chaos.toFixed(1) + '%'; ch.dataset.lvl = G.chaos > 70 ? 2 : G.chaos > 40 ? 1 : 0; $('#hChaosPct').textContent = Math.floor(G.chaos) + '%';
  $('#hScore').textContent = num(G.score); $('#hFaces').textContent = '😊 ' + G.n.good + '  🙁 ' + (G.n.late + G.n.bad);
  const al = alerts(), key = al.map(x => x.k).join('|'), box = $('#alerts');
  if (key !== alertKey || force) { alertKey = key; box.innerHTML = al.map(x => `<div class="alert ${x.cls}"><span>${x.txt}</span><b></b><div class="abar"><i></i></div></div>`).join(''); }
  al.forEach((x, i) => { const el = box.children[i]; if (!el) return; el.querySelector('b').textContent = x.s + 's'; el.querySelector('i').style.width = clamp(x.f * 100, 0, 100).toFixed(1) + '%'; });
  const btns = $('#crewList').children;
  G.crew.forEach((c, i) => { const b = btns[i]; if (!b) return; const s = b.querySelector('i'); if (s.textContent !== c.status) s.textContent = c.status; b.classList.toggle('sel', c === G.sel); b.classList.toggle('idle', c.status === 'Idle'); b.classList.toggle('warn', c.status === 'Stunned' || c.blocked); });
  const pk = G.pick, tk = pk ? 'p' + pk.r.pax.seat.name + pk.c.id : '';
  if (tk !== trayKey || force) { for (const b of $('#trayItems').children) b.classList.toggle('hint', !!pk && coaching() && b.dataset.id === WANTS[pk.r.kind].item); trayKey = tk; $('#tray').classList.toggle('on', !!pk); $('#trayLbl').textContent = pk ? 'Seat ' + pk.r.pax.seat.name + ' shows ' + pk.r.e + '  →  pick for ' + pk.c.name : 'CART · click a passenger bubble, then the item'; }
  const tb = $('#bCart'), cab = G.cab, docked = cab.trolleys.some(t => t.state === 'docked' && !t.claimed), parked = cab.trolleys.filter(t => t.state === 'parked').length;
  const lbl = G.placing ? 'Cancel Placement' : (G.stage < 2 && docked) ? 'Deploy Cart' : parked > 1 ? 'Dock All Carts' : parked ? 'Dock Cart' : 'Carts Docked';
  if (tb.firstChild.textContent !== lbl) tb.firstChild.textContent = lbl; tb.classList.toggle('act', G.placing); tb.classList.toggle('hot', G.stage === 2 && parked > 0);
}
function showEnd(win, title, reason, stars, bonus, record) {
  const L = G.L, best = Save.data.best[bestKey()] || 0, n = G.n;
  if (window.GCCloud) try { window.GCCloud.play({ aircraft: L.id, round: G.R / 60, won: win, fail: G.failWhy, score: G.score, chaos: G.chaos, duration: G.t, smiles: n.good, frowns: n.late + n.bad, bonks: G.bonks }); } catch (e) { /* stats are optional */ }
  $('#end').dataset.win = win ? 1 : 0; $('#eKicker').textContent = L.flight + ' · ' + L.name + ' · ' + G.R / 60 + ' MIN ROUND'; $('#eTitle').textContent = title; $('#eReason').textContent = reason;
  $('#eStars').textContent = win ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : '';
  const rows = [['Score', num(G.score) + (record ? '  NEW BEST' : '')], ['Best on this aircraft and round', num(best)], ['😊 Quick  ·  🙂 On time', n.good + '  ·  ' + n.ok], ['🙁 Late  ·  😡 Missed or wrong', n.late + '  ·  ' + n.bad], ['Time flown', fmt(G.t)], ['Final Cabin Chaos', Math.floor(G.chaos) + '%']];
  if (G.bonks) rows.splice(4, 0, ['Glove bonks', G.bonks]);
  if (win) rows.splice(1, 0, ['Calm-cabin bonus', '+' + num(bonus)]);
  $('#eStats').innerHTML = rows.map(r => `<div><dt>${r[0]}</dt><dd>${r[1]}</dd></div>`).join('');
  Save.data.flights = (Save.data.flights || 0) + 1; Save.store();
  const rb = $('#eRate'); rb.hidden = !wantRating(); if (!rb.hidden) ratingForm(rb, null);
  const nx = $('#eNext'); nx.hidden = !(win && G.li < LEVELS.length - 1); $('#eRetry').classList.toggle('primary', nx.hidden); hud(); showOverlay('end'); (nx.hidden ? $('#eRetry') : nx).focus();
}
function buildMenu() {
  const d = Save.data, rd = d.round || 2;
  for (const b of document.querySelectorAll('#rounds .seg')) { const on = +b.dataset.min === rd; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); }
  $('#cards').innerHTML = LEVELS.map((L, i) => {
    const open = i < d.unlocked, k = L.id + '@' + rd, best = d.best[k], st = d.stars[k] || 0;
    return `<button class="pass" type="button" data-i="${i}"${open ? '' : ' disabled'}>
      <span class="p-no">${String(i + 1).padStart(2, '0')}</span>
      <span class="p-main"><span class="p-flt">FLIGHT ${L.flight}</span><strong>${L.name}</strong>
        <span class="p-meta"><b class="seatbadge">${L.blocks.join('-')}</b><span>${L.seats} seats</span><span>${L.crew} crew</span><span>${L.carts} cart${L.carts > 1 ? 's' : ''}</span><span>${L.items} cart items</span></span></span>
      <span class="p-stub"><span class="p-state">${open ? (best ? 'CLEARED' : 'BOARDING') : 'LOCKED'}</span><span class="p-best">${open ? (best ? 'BEST ' + num(best) : 'NOT FLOWN') : 'CLEAR FLIGHT ' + String(i).padStart(2, '0')}</span><span class="p-stars">${open ? '★'.repeat(st) + '☆'.repeat(3 - st) : ''}</span></span>
    </button>`;
  }).join('');
}
function setMute(v) { sfx.muted = v; Save.data.muted = v; Save.store(); for (const id of ['#bMute', '#gMute']) { const b = $(id); b.textContent = v ? 'Sound off' : 'Sound on'; b.setAttribute('aria-pressed', String(!v)); } }

/* ---------- INPUT ---------- */
cv.addEventListener('pointerdown', ev => {
  if (G.state !== 'play' || G.prompt || G.glove) return; ev.preventDefault(); sfx.init();
  const [gx, gy, sx, sy] = fromScreen(ev), tx = Math.floor(gx), ty = Math.floor(gy), cab = G.cab, u = V.ts;
  if (!G.placing) {
    const seat = cab.seatAt.get(tx + ',' + ty), target = (seat && seat.pax && seat.pax.req) || cab.stAt.has(tx + ',' + ty) || cab.trolleys.some(t => t.state === 'parked' && t.x === tx && t.y === ty);
    let best = null, bd = 1e9;
    for (const c of G.crew) { if (c.hidden) continue; const [cx, cy] = P(c.x + .5, c.y + .5), dx = Math.abs(sx - cx) / u, dy = (sy - cy) / u; if (dx < .42 && dy > (target ? -.45 : -1.25) && dy < .5) { const d = dx + Math.abs(dy + .2); if (d < bd) { bd = d; best = c; } } }
    if (best) return select(best);
  }
  onTile(tx, ty);
});
cv.addEventListener('pointermove', ev => { if (G.state !== 'play') return; const [gx, gy] = fromScreen(ev); G.hover = [Math.floor(gx), Math.floor(gy)]; });
cv.addEventListener('pointerleave', () => { G.hover = null; });
cv.addEventListener('contextmenu', ev => ev.preventDefault());
document.addEventListener('keydown', ev => {
  if (ev.repeat || ev.ctrlKey || ev.metaKey || ev.altKey) return; if (/^(TEXTAREA|INPUT)$/.test((ev.target || {}).tagName || '') || !$('#help').hidden || !$('#rateBox').hidden) return; const k = ev.key.toLowerCase();
  if (G.state === 'brief' && (k === 'enter' || k === ' ')) { ev.preventDefault(); return begin(); }
  if (G.state === 'play' && G.glove) { if (k === ' ' || k === 'enter') { ev.preventDefault(); gloveTap(); } return; }
  if (G.state === 'play' && G.prompt) { if (k >= '1' && k <= '3') answer(+k - 1); return; }
  if (k === 'escape') { if (G.state === 'play' && (G.pick || G.placing)) { G.pick = null; G.placing = false; } else if (G.state === 'play') pause(true); else if (G.state === 'pause') pause(false); return; }
  if (k === 'm') return setMute(!sfx.muted);
  if (G.state !== 'play') return;
  const ii = ITEM_KEYS.indexOf(k);
  if (k >= '1' && k <= '8') { const c = G.crew[+k - 1]; if (c) select(c); } else if (k === 'c') cartButton(); else if (ii >= 0 && ii < G.L.items) pickItem(ITEM_ORDER[ii]);
});
$('#crewList').addEventListener('click', ev => { const b = ev.target.closest('.crew'); if (b && G.crew && !G.prompt && !G.glove) { sfx.init(); select(G.crew[+b.dataset.i]); } });
$('#trayItems').addEventListener('click', ev => { const b = ev.target.closest('.item'); if (b) { sfx.init(); pickItem(b.dataset.id); } });
$('#pOpts').addEventListener('click', ev => { const b = ev.target.closest('.opt'); if (b) answer(+b.dataset.i); });
$('#gBtn').addEventListener('pointerdown', ev => { ev.preventDefault(); gloveTap(); });
$('#bCart').addEventListener('click', () => { sfx.init(); cartButton(); });
$('#cards').addEventListener('click', ev => { const b = ev.target.closest('.pass'); if (b && !b.disabled) { sfx.init(); const i = +b.dataset.i; if (!Save.data.seenHelp) showHelp(() => startLevel(i)); else startLevel(i); } });
$('#rounds').addEventListener('click', ev => { const b = ev.target.closest('.seg'); if (b) { Save.data.round = +b.dataset.min; Save.store(); buildMenu(); } });
$('#bGo').addEventListener('click', begin); $('#bBack').addEventListener('click', toMenu);
$('#eRetry').addEventListener('click', () => startLevel(G.li)); $('#eNext').addEventListener('click', () => startLevel(G.li + 1)); $('#eMenu').addEventListener('click', toMenu);
$('#pResume').addEventListener('click', () => pause(false)); $('#pRestart').addEventListener('click', () => startLevel(G.li)); $('#pMenu').addEventListener('click', toMenu);
$('#gPause').addEventListener('click', () => pause(true));
$('#bMute').addEventListener('click', () => { sfx.init(); setMute(!sfx.muted); }); $('#gMute').addEventListener('click', () => { sfx.init(); setMute(!sfx.muted); });
let resetArm = 0;
$('#bReset').addEventListener('click', ev => {
  const b = ev.currentTarget;
  if (Date.now() - resetArm < 4000) { Save.data.unlocked = 1; Save.data.best = {}; Save.data.stars = {}; Save.store(); buildMenu(); b.textContent = 'Progress cleared'; resetArm = 0; }
  else { resetArm = Date.now(); b.textContent = 'Click again to erase all progress'; setTimeout(() => { if (resetArm) { b.textContent = 'Reset progress'; resetArm = 0; } }, 4000); }
});
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(true); });
if (window.ResizeObserver) new ResizeObserver(layout).observe($('#stage')); window.addEventListener('resize', layout);

/* ---------- HOW TO PLAY + RATINGS ---------- */
const REASONS = [['too_hard', 'Too hard'], ['confusing', 'Confusing controls'], ['too_fast', 'Too fast'], ['small_screen', 'Hard to see on my screen'], ['bugs', 'Something broke'], ['unrealistic', 'Not realistic'], ['boring', 'Gets repetitive'], ['too_easy', 'Too easy']];
const PRAISE = ['', 'Sorry it was a rough flight.', 'Thanks. What should we fix first?', 'Thanks. What would make it better?', 'Glad you enjoyed it!', 'Wonderful, thank you!'];
let helpBack = null;
function showHelp(after) { helpBack = after || null; $('#help').hidden = false; $('#hGo').focus(); if (G.state === 'play') pause(true); }
function closeHelp() { $('#help').hidden = true; Save.data.seenHelp = true; Save.store(); const f = helpBack; helpBack = null; if (f) f(); }
function ratingForm(box, done) {
  const st = { stars: 0, reasons: new Set(), sent: false };
  const draw = () => {
    if (st.sent) { box.innerHTML = `<h3>Thank you for rating ${'★'.repeat(st.stars)}</h3><p class="note">${st.stars >= 4 ? 'If you have a moment, a ⭐ on <a href="https://github.com/kunalmbhatia/galley-chaos" target="_blank" rel="noopener">GitHub</a> helps other people find the game.' : 'Your notes go straight to the maker. The next update will use them.'}</p>`; return; }
    const low = st.stars && st.stars <= 3;
    box.innerHTML = `<h3>How was your flight?</h3>
      <div class="stars" role="radiogroup" aria-label="Rating">${[1, 2, 3, 4, 5].map(n => `<button type="button" role="radio" aria-checked="${st.stars === n}" aria-label="${n} star${n > 1 ? 's' : ''}" data-s="${n}" class="${n <= st.stars ? 'on' : ''}">★</button>`).join('')}</div>
      ${st.stars ? `<p class="note">${PRAISE[st.stars]}</p>` : ''}
      ${low ? `<div class="chips">${REASONS.map(([k, l]) => `<button type="button" data-r="${k}" aria-pressed="${st.reasons.has(k)}" class="${st.reasons.has(k) ? 'on' : ''}">${l}</button>`).join('')}</div>` : ''}
      ${st.stars ? `<label class="note" for="rComment">${low ? 'Anything else? (optional)' : 'Anything you would add? (optional)'}</label><textarea id="rComment" maxlength="500" placeholder="${low ? 'For example: I could not tell which crew member was selected' : 'For example: more scenarios with toddlers'}">${box._c || ''}</textarea>
      <div class="row"><button class="btn primary" type="button" id="rSend">Send rating</button><span class="note" id="rMsg"></span></div>` : ''}`;
  };
  box.onclick = async ev => {
    const s = ev.target.closest('[data-s]'), r = ev.target.closest('[data-r]'), ta = box.querySelector('textarea');
    if (ta) box._c = ta.value;
    if (s) { st.stars = +s.dataset.s; if (st.stars > 3) st.reasons.clear(); draw(); return; }
    if (r) { const k = r.dataset.r; st.reasons.has(k) ? st.reasons.delete(k) : st.reasons.add(k); draw(); return; }
    if (ev.target.id === 'rSend') {
      const b = ev.target; b.disabled = true; $('#rMsg').textContent = 'Sending…';
      const ok = window.GCCloud ? await window.GCCloud.rate({ stars: st.stars, reasons: [...st.reasons], comment: box._c, aircraft: G.L ? G.L.id : null }) : false;
      if (ok) { st.sent = true; Save.data.rated = Date.now(); Save.store(); draw(); if (done) done(); }
      else { b.disabled = false; $('#rMsg').textContent = 'Could not send. Check your connection and try again.'; }
    }
  };
  box._c = ''; draw();
}
const wantRating = () => !Save.data.rated && (Save.data.flights || 0) >= 1;
$('#bHelp').addEventListener('click', () => showHelp()); $('#bHelp2').addEventListener('click', () => showHelp());
$('#hGo').addEventListener('click', closeHelp);
$('#bRate').addEventListener('click', () => { ratingForm($('#rForm'), null); $('#rateBox').hidden = false; });
$('#rateBox').addEventListener('click', ev => { if (ev.target.id === 'rateBox') $('#rateBox').hidden = true; });
document.addEventListener('keydown', ev => { if (ev.key === 'Escape') { if (!$('#help').hidden) closeHelp(); else if (!$('#rateBox').hidden) $('#rateBox').hidden = true; } }, true);

/* ---------- MAIN LOOP ---------- */
function modalTick(dt) { if (G.glove) gloveTick(dt); else if (G.prompt) promptTick(dt); }
let lastT = 0;
function frame(ts) {
  const dt = Math.min(.05, (ts - lastT) / 1000 || 0); lastT = ts;
  if (G.state === 'play') { if (G.glove || G.prompt) modalTick(dt); else update(dt); hud(); }
  if (G.state !== 'menu') draw(dt);
  requestAnimationFrame(frame);
}
Save.load(); sfx.muted = !!Save.data.muted; buildMenu(); setMute(sfx.muted); showScreen('menu'); layout(); requestAnimationFrame(frame);
window.GalleyChaos = { showHelp, ratingForm, G, V, LEVELS, ITEMS, ITEM_ORDER, WANTS, Save, startLevel, begin, update, onTile, select, pickItem, answer, gloveTap, modalTick, cartButton, validPark, canReach, seatGoals, draw, hud };
})();
