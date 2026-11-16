/* Galley Chaos cloud add-on: anonymous play counts and optional Google sign-in (Supabase). The game runs fine without this file. */
(() => {
'use strict';
const API = 'https://qbntuolifvrczzlpsndt.supabase.co', KEY = 'sb_publishable_WxR1oHxF__CiYQJ4IIDGZg_08SBrdh1', LS = 'galley_chaos_cloud_v1';
let st = { device: null, session: null, queue: [] }, googleOn = false;
try { Object.assign(st, JSON.parse(localStorage.getItem(LS)) || {}); } catch (e) { /* no storage */ }
const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx'.replace(/x/g, () => (Math.random() * 16 | 0).toString(16)));
if (!st.device) st.device = uuid();
const save = () => { try { localStorage.setItem(LS, JSON.stringify(st)); } catch (e) { /* ignore */ } };
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
save();
async function call(path, opts = {}, auth = true) {
  const h = { apikey: KEY, 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (auth && st.session) { await fresh(); if (st.session) h.Authorization = 'Bearer ' + st.session.access_token; }
  return fetch(API + path, { ...opts, headers: h });
}
async function fresh() {
  const s = st.session; if (!s || s.expires_at - 90 > Date.now() / 1000) return;
  try {
    const r = await fetch(API + '/auth/v1/token?grant_type=refresh_token', { method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: s.refresh_token }) });
    if (r.ok) setSession(await r.json()); else if (r.status >= 400 && r.status < 500) { st.session = null; save(); }
  } catch (e) { /* offline: keep the session and try later */ }
}
function setSession(j) {
  const u = j.user || (st.session && st.session.user) || {}, m = u.user_metadata || {};
  st.session = { access_token: j.access_token, refresh_token: j.refresh_token, expires_at: j.expires_at || Math.floor(Date.now() / 1000) + (+j.expires_in || 3600), user: { id: u.id, email: u.email, name: m.full_name || m.name || u.name || u.email || 'Player' } };
  save();
}
async function fromRedirect() {
  if (!/access_token=|error=/.test(location.hash)) return;
  const q = new URLSearchParams(location.hash.slice(1)); history.replaceState(null, '', location.pathname + location.search);
  if (q.get('error')) { note('Sign-in did not complete: ' + (q.get('error_description') || q.get('error'))); return; }
  try {
    const r = await fetch(API + '/auth/v1/user', { headers: { apikey: KEY, Authorization: 'Bearer ' + q.get('access_token') } }); if (!r.ok) throw 0;
    setSession({ access_token: q.get('access_token'), refresh_token: q.get('refresh_token'), expires_at: +q.get('expires_at') || 0, expires_in: q.get('expires_in'), user: await r.json() });
  } catch (e) { note('Sign-in did not complete. Please try again.'); }
}
function signIn() { location.href = API + '/auth/v1/authorize?provider=google&redirect_to=' + encodeURIComponent(location.origin + location.pathname); }
async function signOut() { const s = st.session; st.session = null; save(); render(); if (s) try { await fetch(API + '/auth/v1/logout', { method: 'POST', headers: { apikey: KEY, Authorization: 'Bearer ' + s.access_token } }); } catch (e) { /* ignore */ } }
async function send(row) { const r = await call('/rest/v1/plays', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(row) }); return r.ok || (r.status >= 400 && r.status < 500); }
async function flush() { while (st.queue.length) { try { if (!(await send(st.queue[0]))) return; } catch (e) { return; } st.queue.shift(); save(); } }
function play(p) {
  const row = { device_id: st.device, user_id: st.session ? st.session.user.id : null, aircraft: p.aircraft, round_min: p.round, won: !!p.won, fail_reason: p.fail || null, score: Math.round(p.score), chaos: Math.round(p.chaos), duration_s: Math.min(600, Math.round(p.duration)), smiles: p.smiles | 0, frowns: p.frowns | 0, bonks: p.bonks | 0 };
  st.queue.push(row); if (st.queue.length > 30) st.queue.shift(); save(); flush();
}
async function rpc(name) { const r = await call('/rest/v1/rpc/' + name, { method: 'POST', body: '{}' }); if (!r.ok) throw new Error(r.status === 401 || r.status === 403 ? 'not authorised' : 'error ' + r.status); return r.json(); }
let msg = '';
function note(m) { msg = m; render(); }
function render() {
  const el = document.getElementById('acct'); if (!el) return; const u = st.session && st.session.user;
  el.innerHTML = (u ? `<span>Signed in as <b>${esc(u.name)}</b>. Your flights are saved to your account.</span><button class="btn small" id="acOut" type="button">Sign out</button>`
    : googleOn ? `<button class="btn small primary" id="acIn" type="button">Sign in with Google</button><span>Optional. Saves your scores to your account. You can play without it.</span>` : '')
    + (msg ? `<span>${esc(msg)}</span>` : '') + `<a href="privacy.html">Privacy</a>`;
  const i = document.getElementById('acIn'), o = document.getElementById('acOut'); if (i) i.onclick = signIn; if (o) o.onclick = signOut;
}
const ready = (async () => {
  await fromRedirect(); await fresh(); render();
  try { const r = await fetch(API + '/auth/v1/settings', { headers: { apikey: KEY } }); if (r.ok) googleOn = !!((await r.json()).external || {}).google; } catch (e) { /* offline */ }
  render(); flush();
})();
window.addEventListener('online', flush);
window.GCCloud = { ready, play, rpc, signIn, signOut, user: () => st.session && st.session.user, googleEnabled: () => googleOn, esc };
})();
