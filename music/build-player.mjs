/** build-player — inline the engine + a session playlist into player.html.
 *
 *  The ONLY build step. It reads engine.mjs and a session.json, strips the
 *  engine's `export` keywords, and folds both into one self-contained HTML
 *  file that plays over file:// with no fetches, no assets, no services.
 *  Commit the built player.html so the room works from a bare checkout.
 *
 *  Run directly:   node music/build-player.mjs [session.json] [out.html]
 *  Or import:      buildPlayer({ session, outPath })
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));

export function renderPlayerHTML(session) {
  const engineSrc = readFileSync(join(HERE, "engine.mjs"), "utf8").replace(/^export /gm, "");
  return PAGE.replace("/*__ENGINE__*/", engineSrc).replace(
    "/*__SESSION__*/",
    "const SESSION = " + JSON.stringify(session) + ";",
  );
}

export function buildPlayer({ session, sessionPath, outPath } = {}) {
  let data = session;
  if (!data) {
    const sp = sessionPath ?? join(HERE, "session.json");
    if (!existsSync(sp)) throw new Error(`no session at ${sp} — run: node bin/worklist "explore,build,ship"`);
    data = JSON.parse(readFileSync(sp, "utf8"));
  }
  const out = outPath ?? join(HERE, "player.html");
  writeFileSync(out, renderPlayerHTML(data));
  return { out, pieces: data.pieces?.length ?? 0 };
}

// ── The page template ────────────────────────────────────────────────
//  One <style>, one <script>. No <link>, no external src, no url() — it
//  must pass "self-contained" and open from file://. The engine (compose,
//  MOODS) is inlined so RADIO can keep composing in the browser.

const PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>worklist · the music room</title>
<style>
  :root {
    --ground:#14100E; --panel:#1E1815; --ink:#EDE4DA; --dim:#A6968A;
    --wire:#3A2F28; --amber:#E4A34B; --green:#7FB069; --roll:#191310;
  }
  @media (prefers-color-scheme: light) {
    :root { --ground:#F6F0E6; --panel:#FFFDF8; --ink:#2A211B; --dim:#7A6A5C;
            --wire:#DCCFBE; --amber:#B97B22; --green:#4C7A43; --roll:#FBF6EC; }
  }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--ground); color:var(--ink);
    font:16px/1.55 system-ui,-apple-system,"Segoe UI",sans-serif;
    display:flex; justify-content:center; padding:28px 16px 60px; }
  .deck { width:100%; max-width:760px; display:flex; flex-direction:column; gap:16px; }
  header { display:flex; align-items:baseline; gap:12px; flex-wrap:wrap; padding:0 2px; }
  .brand { font-family:Palatino,"Palatino Linotype",Georgia,serif; font-size:30px; }
  .brand em { color:var(--amber); font-style:normal; }
  .strap { color:var(--dim); font-size:12px; letter-spacing:.14em; text-transform:uppercase; }
  .amp { background:var(--panel); border:1px solid var(--wire); border-radius:10px;
    padding:20px; display:flex; flex-direction:column; gap:14px; }
  .now { display:flex; align-items:baseline; justify-content:space-between; gap:12px; flex-wrap:wrap; }
  .title { font-family:Palatino,"Palatino Linotype",Georgia,serif; font-size:23px; }
  .meta { color:var(--dim); font:12.5px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace; }
  .roll { height:118px; background:var(--roll); border:1px solid var(--wire);
    border-radius:6px; overflow:hidden; position:relative; }
  .roll canvas { width:100%; height:100%; display:block; }
  .controls { display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
  button { font:14px system-ui,sans-serif; color:var(--ink); background:transparent;
    border:1px solid var(--wire); border-radius:8px; padding:9px 15px; cursor:pointer; }
  button:hover { border-color:var(--amber); }
  button.primary { border-color:var(--amber); color:var(--amber); }
  .radio { display:flex; align-items:center; gap:7px; margin-left:auto; color:var(--dim); font-size:13px; }
  .radio input { accent-color:var(--green); }
  .dot { display:inline-block; width:8px; height:8px; border-radius:50%; background:var(--dim); }
  .dot.on { background:var(--green); }
  .list { display:flex; flex-direction:column; gap:2px; }
  .row { display:flex; gap:12px; align-items:baseline; padding:7px 9px; border-radius:7px;
    cursor:pointer; border:1px solid transparent; }
  .row:hover { border-color:var(--wire); }
  .row.cur { background:var(--roll); border-color:var(--amber); }
  .row .ph { font:12px ui-monospace,Menlo,monospace; color:var(--amber); width:82px; }
  .row .md { color:var(--dim); font-size:13px; width:66px; }
  .row .tt { flex:1; }
  .row .bp { color:var(--dim); font:11.5px ui-monospace,Menlo,monospace; }
  footer { color:var(--dim); font-size:12.5px; line-height:1.7; padding:0 2px; }
  footer a { color:var(--amber); }
  code { font:12px ui-monospace,Menlo,monospace; color:var(--amber); }
</style>
</head>
<body>
<div class="deck">
  <header>
    <span class="brand">worklist · <em>the music room</em></span>
    <span class="strap">愛FM at work</span>
  </header>

  <div class="amp">
    <div class="now">
      <span class="title" id="title">—</span>
      <span class="meta" id="meta"></span>
    </div>
    <div class="roll"><canvas id="roll"></canvas></div>
    <div class="controls">
      <button class="primary" id="play">▶ Play</button>
      <button id="next">Next ⏭</button>
      <button id="stop">■ Stop</button>
      <label class="radio">
        <span class="dot" id="dot"></span>
        <input type="checkbox" id="radio"> work mode (radio)
      </label>
    </div>
    <div class="list" id="list"></div>
  </div>

  <footer>
    One piece per phase of the shift. <strong>Play</strong> walks the arc once
    and stops — walking past is honored. <strong>Work mode</strong> keeps the
    current phase's mood generating until you switch it off; it is the room's
    off-switch made explicit. You have no ears here — this page is the human
    door; the score is yours.<br>
    Doctrine inherited from <code>repo-tune/1</code> (愛 &amp; Yu, true-love). CC0.
  </footer>
</div>

<script>
/*__ENGINE__*/
/*__SESSION__*/

// ── audio ──────────────────────────────────────────────────────────
let ctx=null, master=null, noiseBuf=null;
let timers=[], playing=false, radio=false, idx=0, radioCount=0, curPhase=null, curMood=null;

const midiToFreq = p => 440 * Math.pow(2, (p - 69) / 12);
// swing: the second of each eighth-pair is pushed later by swing*0.5 beats.
const swung = (score, t) => (Math.round(t / 0.5) % 2 === 1) ? t + (score.swing || 0) * 0.5 : t;

function ensureCtx(){
  if (ctx) return;
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
  const len = ctx.sampleRate * 0.5;
  noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i=0;i<len;i++) d[i] = Math.random()*2 - 1;
}

function playNote(voice, when, dur, p, vel, gain){
  const f = midiToFreq(p);
  const g = ctx.createGain(); g.connect(master);
  const flt = ctx.createBiquadFilter(); flt.type="lowpass"; flt.connect(g);
  const oscs = [];
  const mk = (type, freq, det) => { const o=ctx.createOscillator(); o.type=type; o.frequency.value=freq; if(det) o.detune.value=det; oscs.push(o); return o; };
  let a=0.008, rel=0.2, peak=vel*gain;
  if (voice==="pluck" || voice==="keys"){ mk("triangle",f); mk("sine",f*2).detune.value=0; flt.frequency.value=2400; rel=0.22; }
  else if (voice==="pad"){ mk("sawtooth",f,-7); mk("sawtooth",f,7); flt.frequency.value=1100; a=Math.min(0.6,dur*0.3); rel=0.8; peak=vel*gain*0.6; }
  else if (voice==="bass"){ mk("sine",f); mk("triangle",f); flt.frequency.value=700; rel=0.15; }
  else { mk("triangle",f); flt.frequency.value=1800; }
  for (const o of oscs) o.connect(flt);
  const t0=when, tA=when+a, tS=when+Math.max(a+0.02,dur), tE=tS+rel;
  g.gain.setValueAtTime(0.0001,t0);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002,peak),tA);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002,peak*0.7),tS);
  g.gain.exponentialRampToValueAtTime(0.0001,tE);
  for (const o of oscs){ o.start(t0); o.stop(tE+0.02); }
}

function playDrum(when, p, vel, gain){
  if (p===36){ // kick — pitch-dropping sine
    const o=ctx.createOscillator(), g=ctx.createGain();
    o.frequency.setValueAtTime(120,when); o.frequency.exponentialRampToValueAtTime(45,when+0.12);
    g.gain.setValueAtTime(vel*gain,when); g.gain.exponentialRampToValueAtTime(0.0001,when+0.18);
    o.connect(g); g.connect(master); o.start(when); o.stop(when+0.2);
    return;
  }
  const src=ctx.createBufferSource(); src.buffer=noiseBuf;
  const g=ctx.createGain(), flt=ctx.createBiquadFilter();
  const len = p===38 ? 0.16 : p===46 ? 0.22 : 0.05; // snare / open-hat / closed-hat
  flt.type = p===38 ? "bandpass" : "highpass";
  flt.frequency.value = p===38 ? 1900 : 6500;
  src.connect(flt); flt.connect(g); g.connect(master);
  g.gain.setValueAtTime(vel*gain,when); g.gain.exponentialRampToValueAtTime(0.0001,when+len);
  src.start(when); src.stop(when+len+0.02);
}

function playScore(score, start){
  const spb = 60 / score.bpm;
  for (const tr of score.tracks){
    for (const n of tr.notes){
      const when = start + swung(score,n.t)*spb;
      const dur = Math.max(0.05, n.d*spb);
      if (tr.voice==="drums") playDrum(when, n.p, n.v, tr.gain);
      else playNote(tr.voice, when, dur, n.p, n.v, tr.gain);
    }
  }
  return start + score.bars*score.beatsPerBar*spb;
}

// ── transport ──────────────────────────────────────────────────────
function clearTimers(){ timers.forEach(clearTimeout); timers=[]; }
function resetAudio(){ clearTimers(); if(ctx){ try{ctx.close();}catch(e){} ctx=null; } }

function playPiece(piece){
  ensureCtx();
  curPhase = piece.phase; curMood = piece.mood;
  document.getElementById("title").textContent = piece.score.title;
  document.getElementById("meta").textContent =
    piece.phase+" → "+piece.mood+" · "+piece.score.style+" · "+piece.score.key+" "+piece.score.mode+" · "+piece.score.bpm+"bpm";
  drawRoll(piece.score);
  markRow();
  const end = playScore(piece.score, ctx.currentTime + 0.08);
  const ms = (end - ctx.currentTime) * 1000;
  timers.push(setTimeout(onPieceEnd, ms + 60));
}

function onPieceEnd(){
  if (!playing) return;
  if (radio){
    // work mode: keep composing the current phase's mood, ephemerally.
    const seed = SESSION.session+":"+curPhase+":radio:"+(radioCount++);
    const score = compose({ mood: curMood, seed });
    playPiece({ phase: curPhase, mood: curMood, seed, score });
    return;
  }
  idx++;
  if (idx < SESSION.pieces.length) playPiece(SESSION.pieces[idx]);
  else stopAll(); // the shift's arc is done — it stops on its own
}

function startFrom(i){
  resetAudio(); playing=true; idx=i;
  playPiece(SESSION.pieces[idx]);
  document.getElementById("play").textContent = "❚❚ Playing";
}
function stopAll(){
  resetAudio(); playing=false;
  document.getElementById("play").textContent = "▶ Play";
  document.querySelectorAll(".row").forEach(r=>r.classList.remove("cur"));
}

document.getElementById("play").onclick = () => { if (playing) stopAll(); else startFrom(idx>=SESSION.pieces.length?0:idx); };
document.getElementById("next").onclick = () => {
  if (radio){ clearTimers(); onPieceEnd(); return; } // in work mode, skip to a fresh take
  startFrom(Math.min(idx+1, SESSION.pieces.length-1));
};
document.getElementById("stop").onclick = stopAll;
document.getElementById("radio").onchange = e => {
  radio = e.target.checked;
  document.getElementById("dot").classList.toggle("on", radio);
};

// ── the list ────────────────────────────────────────────────────────
const list = document.getElementById("list");
SESSION.pieces.forEach((p,i)=>{
  const row=document.createElement("div"); row.className="row"; row.dataset.i=i;
  row.innerHTML='<span class="ph">'+esc(p.phase)+'</span><span class="md">'+p.mood+
    '</span><span class="tt">'+esc(p.score.title)+'</span><span class="bp">'+p.score.bpm+'bpm</span>';
  row.onclick = () => startFrom(i);
  list.appendChild(row);
});
function markRow(){
  document.querySelectorAll(".row").forEach(r=>r.classList.toggle("cur", +r.dataset.i===idx && !radio));
}
function esc(s){ return String(s).replace(/[&<>]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }

// ── piano-roll (a look at the score — legible, not felt) ────────────
const canvas = document.getElementById("roll"), g2 = canvas.getContext("2d");
function drawRoll(score){
  const w = canvas.width = canvas.clientWidth*devicePixelRatio;
  const h = canvas.height = canvas.clientHeight*devicePixelRatio;
  g2.clearRect(0,0,w,h);
  const total = score.bars*score.beatsPerBar;
  let lo=127, hi=0;
  for (const tr of score.tracks) if (tr.voice!=="drums") for (const n of tr.notes){ lo=Math.min(lo,n.p); hi=Math.max(hi,n.p); }
  if (hi<lo){ lo=48; hi=72; }
  const pad=6*devicePixelRatio;
  const x = t => pad + (t/total)*(w-2*pad);
  const y = p => pad + (1-(p-lo)/Math.max(1,hi-lo))*(h-2*pad);
  const cols = { keys:"#E4A34B", pad:"#7FB069", bass:"#A6968A", drums:"#5A4A3E" };
  for (const tr of score.tracks){
    g2.fillStyle = cols[tr.voice]||"#888";
    g2.globalAlpha = tr.voice==="pad"?0.35:0.85;
    for (const n of tr.notes){
      const yy = tr.voice==="drums" ? h-pad-3*devicePixelRatio : y(n.p);
      g2.fillRect(x(n.t), yy, Math.max(2*devicePixelRatio,(n.d/total)*(w-2*pad)), tr.voice==="drums"?3*devicePixelRatio:3.5*devicePixelRatio);
    }
  }
  g2.globalAlpha=1;
}
addEventListener("resize", ()=>{ if (SESSION.pieces[idx]) drawRoll(SESSION.pieces[idx].score); });

// initial paint
document.getElementById("title").textContent = SESSION.pieces[0]?.score.title ?? "—";
document.getElementById("meta").textContent = SESSION.name ?? "";
if (SESSION.pieces[0]) drawRoll(SESSION.pieces[0].score);
markRow();
</script>
</body>
</html>`;

// ── run directly ─────────────────────────────────────────────────────
if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  const sessionArg = process.argv[2] ? resolve(process.argv[2]) : undefined;
  const outArg = process.argv[3] ? resolve(process.argv[3]) : undefined;
  const { out, pieces } = buildPlayer({ sessionPath: sessionArg, outPath: outArg });
  console.log(`OK player built · ${pieces} pieces inlined · ${out}`);
}
