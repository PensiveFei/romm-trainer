import { demoChart, validateChart, validateRange } from './chart.js';
import { Judge, DEFAULT_HIT_WINDOW_MS } from './judge.js';
import { THEMES, getTheme, rgba, paintMotif, paintBackdrop, paintHit } from './themes.js';

const $ = (id) => document.getElementById(id);
const els = {
  stage: $('stage'), wrap: $('stageWrap'), hint: $('stageHint'), feedback: $('feedback'), message: $('message'),
  play: $('playButton'), playText: $('playText'), playIcon: $('playIcon'), restart: $('restartButton'),
  start: $('startRange'), end: $('endRange'), startOut: $('startOutput'), endOut: $('endOutput'), loop: $('loopToggle'),
  scroll: $('scrollSpeed'), scrollLabel: $('scrollLabel'), offset: $('offset'), speedLabel: $('speedLabel'),
  hitWindow: $('hitWindow'), hitWindowLabel: $('hitWindowLabel'),
  rateButtons: $('rateButtons'), keys: $('keyBindings'), keyHelp: $('keyHelp'), elapsed: $('elapsed'),
  duration: $('duration'), stageTime: $('stageTime'), fill: $('progressFill'), hits: $('statHits'),
  performanceScore: $('performanceScore'), completionValue: $('completionValue'), completionFill: $('completionFill'), completionTrack: $('completionTrack'),
  combo: $('statCombo'), timing: $('statTiming'), miss: $('statMiss'), title: $('trackTitle'), artist: $('trackArtist'),
  info: $('trackInfo'), sideTitle: $('sideTitle'), sideArtist: $('sideArtist'), sideBpm: $('sideBpm'),
  sourceTag: $('sourceTag'), chartFile: $('chartFile'), audioFile: $('audioFile'), theme: $('themeSelect'),
  drawer: $('toolsDrawer'), drawerToggle: $('toolsToggle'), drawerClose: $('toolsClose')
};
const audio = new Audio();
audio.preload = 'metadata';
audio.preservesPitch = true;
let chart = demoChart;
let sourceType = 'demo';
let rate = 1;
let scrollRate = 1;
let offset = 0;
let hitWindowMs = DEFAULT_HIT_WINDOW_MS;
let startMs = 0, endMs = chart.durationMs;
let session;
let audioReady = false, isPlaying = false, hasStarted = false, ending = false, audioUrl = null;
let previewMs = 0, bindingIndex = -1, messageTimer = null, feedbackTimer = null;
let keys = ['KeyA','KeyS','KeyD','KeyJ','KeyK','KeyL'];
const held = new Set();
let themeId = 'base', currentTheme = getTheme(themeId);
const hitEffects = [];
const canvas = els.stage;
const ctx = canvas.getContext('2d');

try {
  const savedWindow = Number(localStorage.getItem('romm-trainer-hit-window'));
  if (savedWindow >= 120 && savedWindow <= 240) hitWindowMs = savedWindow;
  const savedTheme = localStorage.getItem('romm-trainer-theme');
  if (Object.hasOwn(THEMES, savedTheme)) themeId = savedTheme;
  const stored = JSON.parse(localStorage.getItem('romm-trainer-keys') || 'null');
  if (Array.isArray(stored) && stored.length === 6 && new Set(stored).size === 6 && stored.every(k => /^(Key[A-Z]|Digit[0-9])$/.test(k))) keys = stored;
  const savedScroll = Number(localStorage.getItem('romm-trainer-scroll'));
  if (savedScroll >= 0.7 && savedScroll <= 2) scrollRate = savedScroll;
  const savedOffset = Number(localStorage.getItem('romm-trainer-offset'));
  if (savedOffset >= -300 && savedOffset <= 300) offset = savedOffset;
} catch { /* Local settings are optional. */ }
session = new Judge(chart,startMs,endMs,rate,offset,hitWindowMs);
applyTheme(themeId, false);
els.hitWindow.value = hitWindowMs;
els.hitWindowLabel.textContent = '±' + hitWindowMs + ' ms';
els.scroll.value = scrollRate;
els.scrollLabel.textContent = scrollRate.toFixed(1) + '×';
els.offset.value = offset;

function applyTheme(id, save = true) {
  themeId = Object.hasOwn(THEMES, id) ? id : 'base';
  currentTheme = getTheme(themeId);
  els.wrap.dataset.theme = themeId;
  els.theme.value = themeId;
  hitEffects.length = 0;
  if (save) { try { localStorage.setItem('romm-trainer-theme', themeId); } catch {} }
}
function setDrawerOpen(open) {
  if (open && isPlaying) pause();
  if (!open && bindingIndex !== -1) {
    bindingIndex = -1;
    els.keyHelp.textContent = '已取消修改';
    renderKeys();
  }
  els.drawer.hidden = !open;
  els.drawerToggle.setAttribute('aria-expanded', String(open));
}
function format(ms, tenths = false) {
  const safe = Math.max(0, Number.isFinite(ms) ? ms : 0);
  const seconds = Math.floor(safe / 1000);
  const value = String(Math.floor(seconds / 60)).padStart(2,'0') + ':' + String(seconds % 60).padStart(2,'0');
  return tenths ? value + '.' + Math.floor(safe % 1000 / 100) : value;
}
function formatCompletion(value) {
  const bounded = Math.max(0, Math.min(100, value));
  return (bounded >= 100 - 1e-8 ? 100 : Math.floor((bounded + 1e-9) * 10) / 10).toFixed(1);
}
function setMessage(text, good = false, timeout = 5000) {
  clearTimeout(messageTimer);
  els.message.textContent = text;
  els.message.classList.toggle('success', good);
  if (timeout) messageTimer = setTimeout(() => { els.message.textContent = ''; }, timeout);
}
function flash(text, kind = 'hit') {
  clearTimeout(feedbackTimer);
  els.feedback.dataset.kind = kind;
  els.feedback.textContent = text;
  els.feedback.classList.add('visible');
  feedbackTimer = setTimeout(() => els.feedback.classList.remove('visible'), 550);
}
function keyLabel(code) { return code.replace(/^Key/,'').replace(/^Digit/,''); }
function renderKeys() {
  els.keys.replaceChildren();
  keys.forEach((key, lane) => {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = bindingIndex === lane ? '…' : keyLabel(key);
    b.setAttribute('aria-label', '第 ' + (lane + 1) + ' 轨，按键 ' + keyLabel(key));
    if (bindingIndex === lane) b.classList.add('listening');
    b.addEventListener('click', () => {
      if (isPlaying) pause();
      bindingIndex = lane;
      els.keyHelp.textContent = '请按下新的字母或数字键';
      renderKeys();
      els.keys.children[lane].focus();
    });
    els.keys.appendChild(b);
  });
}
function updateMeta() {
  els.title.textContent = chart.title;
  els.sideTitle.textContent = chart.title;
  els.artist.textContent = chart.artist || '本地谱面';
  els.sideArtist.textContent = chart.artist || '本地谱面';
  const bpm = chart.bpm ? chart.bpm + ' BPM' : '自由节奏';
  els.info.textContent = bpm;
  els.sideBpm.textContent = bpm;
  els.duration.textContent = format(chart.durationMs);
  els.sourceTag.textContent = sourceType === 'demo' ? '示范谱' : '本地谱';
}
function updateStats() {
  const completion = formatCompletion(session.completion);
  els.performanceScore.textContent = String(Math.floor(session.score + 1e-8));
  if (els.completionValue.textContent !== '(' + completion + '%)') {
    els.completionValue.textContent = '(' + completion + '%)';
    els.completionFill.style.width = completion + '%';
    els.completionTrack.setAttribute('aria-valuenow', completion);
    els.completionTrack.setAttribute('aria-valuetext', completion + '%');
  }
  els.hits.replaceChildren(document.createTextNode(String(session.hits) + ' '));
  const small = document.createElement('small');
  small.textContent = '/ ' + session.states.length;
  els.hits.appendChild(small);
  els.combo.textContent = session.combo;
  els.timing.textContent = session.early + ' / ' + session.late;
  els.miss.textContent = session.misses;
}
function updateTime(ms) {
  els.elapsed.textContent = format(ms);
  els.stageTime.textContent = format(ms) + ' / ' + format(chart.durationMs);
  els.fill.style.width = Math.max(0,Math.min(100,ms / chart.durationMs * 100)) + '%';
}
function refreshRangeUi() {
  const max = chart.durationMs / 1000;
  els.start.max = String(max);
  els.end.max = String(max);
  els.start.value = String(startMs / 1000);
  els.end.value = String(endMs / 1000);
  els.startOut.textContent = format(startMs, true);
  els.endOut.textContent = format(endMs, true);
}
function checkRange(show = false) {
  const error = validateRange(chart,startMs,endMs);
  if (show && error) setMessage(error, false, 0);
  return !error;
}
function releaseHeldAt(ms) {
  for (const lane of held) session.release(lane,ms);
  held.clear();
}
function pause() {
  if (!isPlaying) return;
  const now = audio.currentTime * 1000;
  session.tick(now);
  audio.pause(); isPlaying = false; previewMs = now;
  els.playText.textContent = '继续练习'; els.playIcon.textContent = '▶';
  updateStats();
}
function resetSession() {
  if (isPlaying) pause();
  held.clear(); hitEffects.length = 0; ending = false; hasStarted = false;
  session = new Judge(chart,startMs,endMs,rate,offset,hitWindowMs);
  previewMs = Math.max(0,startMs - 2000);
  if (audioReady) {
    try { audio.currentTime = previewMs / 1000; } catch { /* Seeking before metadata can be unavailable. */ }
  }
  els.hint.classList.remove('hidden');
  els.playText.textContent = '开始练习'; els.playIcon.textContent = '▶';
  updateStats(); updateTime(previewMs);
}
async function play() {
  if (!checkRange(true)) return;
  if (!audioReady) { setMessage('请先选择与当前谱面配套的本地音频。', false, 0); return; }
  setDrawerOpen(false);
  if (!hasStarted) {
    session = new Judge(chart,startMs,endMs,rate,offset,hitWindowMs);
    audio.currentTime = Math.max(0,startMs - 2000) / 1000;
    hasStarted = true;
  }
  audio.playbackRate = rate;
  try {
    await audio.play();
    isPlaying = true; ending = false;
    els.hint.classList.add('hidden');
    els.playText.textContent = '暂停'; els.playIcon.textContent = 'Ⅱ';
    els.play.blur();
  } catch { isPlaying = false; setMessage('音频无法播放，请检查本地音频文件或浏览器设置。', false, 0); }
}
function togglePlay() { if (isPlaying) pause(); else void play(); }
function completePass() {
  if (ending) return;
  ending = true;
  const nudge = Math.max(0,offset * rate);
  session.tick(endMs + nudge);
  releaseHeldAt(endMs + nudge);
  session.finishRemaining();
  updateStats();
  if (els.loop.checked && isPlaying) {
    const hitCount = session.hits, total = session.states.length, completion = formatCompletion(session.completion);
    session = new Judge(chart,startMs,endMs,rate,offset,hitWindowMs);
    held.clear();
    audio.currentTime = Math.max(0,startMs - 2000) / 1000;
    if (audio.paused) void audio.play().catch(() => { isPlaying = false; setMessage('请点击继续练习。'); });
    setMessage('上一轮：完成度 ' + completion + '%，命中 ' + hitCount + ' / ' + total + '。继续练习。', true);
    ending = false;
  } else {
    audio.pause(); isPlaying = false; hasStarted = false;
    previewMs = endMs;
    els.playText.textContent = '再练一次'; els.playIcon.textContent = '▶';
    setMessage('本段练习完成：完成度 ' + formatCompletion(session.completion) + '%，命中 ' + session.hits + ' / ' + session.states.length + '。', true, 0);
  }
}
function handleRange() {
  startMs = Math.round(Number(els.start.value) * 1000);
  endMs = Math.round(Number(els.end.value) * 1000);
  refreshRangeUi(); resetSession();
  if (checkRange()) setMessage('练习区间 ' + format(startMs,true) + ' – ' + format(endMs,true), true);
  else checkRange(true);
}
function replaceAudio(url) {
  if (isPlaying) pause();
  audioReady = false;
  if (audioUrl) URL.revokeObjectURL(audioUrl);
  audioUrl = url;
  audio.src = url;
  audio.playbackRate = rate;
  audio.load();
}
audio.addEventListener('loadedmetadata', () => {
  if (!Number.isFinite(audio.duration) || audio.duration * 1000 + 50 < chart.durationMs) {
    audioReady = false;
    setMessage('音频短于谱面时长，请选择完整配套音频。', false, 0);
    return;
  }
  audioReady = true;
  resetSession();
  if (sourceType === 'local') setMessage('本地音频已就绪，可以开始练习。', true);
});
audio.addEventListener('error', () => {
  audioReady = false;
  if (audio.src) setMessage('无法读取音频，请尝试浏览器支持的格式。', false, 0);
});
audio.addEventListener('ended', () => { if (isPlaying) completePass(); });

function makeDemoAudio() {
  // Original synthesized percussion backing, unrelated to the player's inputs.
  const sampleRate = 22050, length = 32 * sampleRate;
  const data = new Float32Array(length);
  const add = (time, duration, fn) => {
    const start = Math.floor(time * sampleRate), count = Math.floor(duration * sampleRate);
    for (let i=0;i<count && start+i<length;i++) data[start+i] += fn(i/sampleRate);
  };
  for (let beat=0;beat<64;beat++) {
    const t = beat * 0.5;
    const strong = beat % 4 === 0;
    add(t,0.12,(s) => Math.sin(2 * Math.PI * (strong ? 82 : 105) * s) * Math.exp(-s * 35) * (strong ? 0.35 : 0.16));
    add(t + 0.25,0.045,(s) => Math.sin(2 * Math.PI * 1700 * s) * Math.exp(-s * 90) * 0.035);
  }
  const bytes = new ArrayBuffer(44 + length * 2), view = new DataView(bytes);
  const text = (at,v) => { for (let i=0;i<v.length;i++) view.setUint8(at+i,v.charCodeAt(i)); };
  text(0,'RIFF'); view.setUint32(4,36+length*2,true); text(8,'WAVE'); text(12,'fmt ');
  view.setUint32(16,16,true); view.setUint16(20,1,true); view.setUint16(22,1,true);
  view.setUint32(24,sampleRate,true); view.setUint32(28,sampleRate*2,true);
  view.setUint16(32,2,true); view.setUint16(34,16,true); text(36,'data'); view.setUint32(40,length*2,true);
  for (let i=0;i<length;i++) view.setInt16(44+i*2,Math.max(-1,Math.min(1,data[i]))*32767,true);
  return URL.createObjectURL(new Blob([bytes],{type:'audio/wav'}));
}
function useDemo() {
  chart = demoChart; sourceType = 'demo'; startMs = 0; endMs = chart.durationMs;
  updateMeta(); refreshRangeUi(); resetSession();
  replaceAudio(makeDemoAudio());
  setMessage('已恢复原创示范谱与节拍伴奏。', true);
}
async function importChart(file) {
  if (!file) return;
  if (file.size > 1024 * 1024) { setMessage('谱面文件不能超过 1 MB。'); return; }
  try {
    const parsed = validateChart(JSON.parse(await file.text()));
    if (isPlaying) pause();
    chart = parsed; sourceType = 'local'; startMs = 0; endMs = chart.durationMs;
    audioReady = false;
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    audioUrl = null; audio.removeAttribute('src'); audio.load();
    updateMeta(); refreshRangeUi(); resetSession();
    setMessage('已载入本地谱面，请选择它的配套音频。', true, 0);
  } catch (error) { setMessage('谱面导入失败：' + (error instanceof Error ? error.message : '文件无效'), false, 0); }
}

function roundRect(x,y,w,h,r) { ctx.beginPath(); ctx.roundRect(x,y,w,h,r); }
function notePath(x,y,radius,shape) {
  ctx.beginPath();
  if (shape === 'diamond') {
    ctx.moveTo(x,y-radius); ctx.lineTo(x+radius,y); ctx.lineTo(x,y+radius); ctx.lineTo(x-radius,y); ctx.closePath();
  } else if (shape === 'hexagon') {
    for (let i=0;i<6;i++) { const angle=Math.PI/3*i-Math.PI/2, px=x+Math.cos(angle)*radius, py=y+Math.sin(angle)*radius; if (i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py); }
    ctx.closePath();
  } else ctx.arc(x,y,radius,0,Math.PI*2);
}
function drawNote(x, y, radius, isHold) {
  const colors=isHold ? currentTheme.hold : currentTheme.tap;
  ctx.save(); ctx.shadowColor=rgba(colors[1],.7); ctx.shadowBlur=13;
  notePath(x,y,radius,currentTheme.shape);ctx.fillStyle=colors[2];ctx.fill();
  ctx.shadowBlur=0;ctx.lineWidth=2.2;ctx.strokeStyle='rgba(250,250,241,.92)';ctx.stroke();
  const fill=ctx.createRadialGradient(x-radius*.3,y-radius*.4,radius*.05,x,y,radius);
  fill.addColorStop(0,colors[0]);fill.addColorStop(.58,colors[1]);fill.addColorStop(1,colors[2]);
  notePath(x,y,radius*.8,currentTheme.shape);ctx.fillStyle=fill;ctx.fill();
  ctx.lineWidth=1;ctx.strokeStyle=rgba(colors[0],.84);ctx.stroke();
  if (isHold) {
    notePath(x,y,radius*.62,currentTheme.shape);ctx.setLineDash([2,2]);
    ctx.strokeStyle=rgba(colors[0],.78);ctx.stroke();ctx.setLineDash([]);
  }
  paintMotif(ctx,currentTheme.motif,x,y,radius*.43,colors[0]);
  ctx.restore();
}
function renderStage(songMs) {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1,2);
  const w = rect.width, h = rect.height;
  if (!w || !h) return;
  if (canvas.width !== Math.round(w*dpr) || canvas.height !== Math.round(h*dpr)) {
    canvas.width = Math.round(w*dpr); canvas.height = Math.round(h*dpr);
  }
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,w,h);
  const usable = Math.min(w * .78, 1050), left = (w - usable) / 2, laneWidth = usable / 6, hitY = h - 120;
  const spawnY = Math.min(142,hitY - 160);
  const travel = 2200 / scrollRate;
  const pxPerMs = (hitY - spawnY) / travel;
  const showTime = songMs - offset * rate;
  const center = lane => left + lane * laneWidth + laneWidth / 2;
  const radius = Math.min(23,laneWidth * .25);
  paintBackdrop(ctx,currentTheme,w,h);
  // Keep entering notes below the toolbar while leaving the HUD unobstructed.
  ctx.save(); ctx.beginPath(); ctx.rect(0,72,w,Math.max(0,h-72)); ctx.clip();

  for (let lane=0;lane<6;lane++) {
    const x = center(lane);
    const beam = ctx.createLinearGradient(0,spawnY,0,hitY);
    beam.addColorStop(0,'rgba(233,241,237,0)');
    beam.addColorStop(.35, held.has(lane) ? rgba(currentTheme.accent,.30) : 'rgba(232,240,237,.14)');
    beam.addColorStop(1, held.has(lane) ? rgba(currentTheme.accent,.85) : 'rgba(232,240,237,.48)');
    ctx.strokeStyle=beam; ctx.lineWidth=held.has(lane)?2:1;
    ctx.beginPath(); ctx.moveTo(x,spawnY); ctx.lineTo(x,hitY); ctx.stroke();
  }

  // Draw links behind notes that must be pressed simultaneously.
  const chords = new Map();
  for (const note of session.states) {
    if (note.status !== 'pending') continue;
    const group = chords.get(note.atMs) || [];
    group.push(note); chords.set(note.atMs,group);
  }
  for (const [atMs, notes] of chords) {
    const y=hitY-(atMs-showTime)*pxPerMs;
    if (notes.length<2 || y < -30 || y > h+20) continue;
    const lanes=notes.map(n=>n.lane);
    ctx.strokeStyle=rgba(currentTheme.accent,.82); ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(center(Math.min(...lanes)),y);ctx.lineTo(center(Math.max(...lanes)),y);ctx.stroke();
  }

  for (const note of session.states) {
    if (note.status === 'hit' || note.status === 'miss') continue;
    const x = center(note.lane);
    const headY = hitY - (note.atMs-showTime)*pxPerMs;
    const tailY = hitY - (note.atMs+note.holdMs-showTime)*pxPerMs;
    if (headY < -radius || tailY > h+radius) continue;
    if (note.holdMs > 0) {
      const shownHead = Math.min(hitY,headY);
      const top = Math.max(-radius,tailY);
      if (shownHead > top) {
        const width = radius * 1.25;
        const ribbon=ctx.createLinearGradient(x-width/2,0,x+width/2,0);
        ribbon.addColorStop(0,rgba(currentTheme.hold[1],.22));
        ribbon.addColorStop(.45,rgba(currentTheme.hold[1],.55));
        ribbon.addColorStop(1,rgba(currentTheme.hold[0],.22));
        ctx.fillStyle=ribbon;ctx.fillRect(x-width/2,top,width,shownHead-top);
        ctx.strokeStyle=rgba(currentTheme.hold[0],.52);ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(x-width/2,top);ctx.lineTo(x-width/2,shownHead);
        ctx.moveTo(x+width/2,top);ctx.lineTo(x+width/2,shownHead);ctx.stroke();
      }
    }
    if (note.status === 'pending') drawNote(x,headY,radius,note.holdMs>0);
  }

  ctx.save();
  ctx.shadowColor=rgba(currentTheme.accent,.55);ctx.shadowBlur=8;
  ctx.strokeStyle='rgba(236,231,204,.76)';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(center(0),hitY);ctx.lineTo(center(5),hitY);ctx.stroke();
  ctx.restore();
  const effectTime=performance.now();
  for (let i=hitEffects.length-1;i>=0;i--) {
    const effect=hitEffects[i], progress=(effectTime-effect.started)/700;
    if (progress>=1) hitEffects.splice(i,1);
    else if (effect.unmatched) {
      ctx.save();ctx.globalAlpha=(1-progress)*.7;ctx.strokeStyle='#ffd0bd';ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(center(effect.lane),hitY,radius*(.55+progress),0,Math.PI*2);ctx.stroke();ctx.restore();
    } else paintHit(ctx,currentTheme,center(effect.lane),hitY,radius,progress);
  }
  for (let lane=0;lane<6;lane++) {
    const x=center(lane);
    ctx.save();
    if (held.has(lane)) {ctx.shadowColor=currentTheme.accent;ctx.shadowBlur=18;}
    ctx.beginPath();ctx.arc(x,hitY,17,0,Math.PI*2);
    ctx.fillStyle='rgba(226,219,192,.17)';ctx.fill();
    ctx.lineWidth=1;ctx.strokeStyle='rgba(234,234,223,.32)';ctx.stroke();
    ctx.beginPath();ctx.arc(x,hitY,9,0,Math.PI*2);
    ctx.fillStyle=held.has(lane)?currentTheme.accent:'#f0eee5';ctx.fill();
    ctx.restore();
    const keyWidth=Math.min(25,laneWidth*.55);
    ctx.fillStyle='rgba(247,246,239,.94)';roundRect(x-keyWidth/2,hitY+27,keyWidth,23,3);ctx.fill();
    ctx.fillStyle='#2b3340';ctx.font='700 12px "Microsoft YaHei",sans-serif';
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(keyLabel(keys[lane]),x,hitY+39);
  }
  ctx.restore();
}
function frame() {
  let now = isPlaying ? audio.currentTime*1000 : previewMs;
  if (isPlaying) {
    const previousMisses = session.misses;
    session.tick(now);
    if (session.misses > previousMisses) flash('漏击', 'miss');
    if (now >= endMs) { completePass(); now = isPlaying ? audio.currentTime*1000 : endMs; }
    updateStats();
  }
  updateTime(now); renderStage(now);
  requestAnimationFrame(frame);
}

els.theme.addEventListener('change',() => { applyTheme(els.theme.value); els.theme.blur(); });
els.drawerToggle.addEventListener('click',() => setDrawerOpen(els.drawer.hidden));
els.drawerClose.addEventListener('click',() => { setDrawerOpen(false); els.drawerToggle.focus(); });
els.play.addEventListener('click',togglePlay);
els.restart.addEventListener('click',() => { resetSession(); setMessage('已回到片段起点。',true); });
els.start.addEventListener('input',handleRange);
els.end.addEventListener('input',handleRange);
els.loop.addEventListener('change',() => { if (isPlaying) pause(); resetSession(); });
els.scroll.addEventListener('input',() => {
  scrollRate=Number(els.scroll.value); els.scrollLabel.textContent=scrollRate.toFixed(1)+'×';
  try { localStorage.setItem('romm-trainer-scroll',String(scrollRate)); } catch {}
});
els.hitWindow.addEventListener('input',() => {
  els.hitWindowLabel.textContent='±'+els.hitWindow.value+' ms';
});
els.hitWindow.addEventListener('change',() => {
  const n=Number(els.hitWindow.value);
  hitWindowMs=Number.isFinite(n)?Math.max(120,Math.min(240,n)):DEFAULT_HIT_WINDOW_MS;
  els.hitWindow.value=hitWindowMs;els.hitWindowLabel.textContent='±'+hitWindowMs+' ms';
  try { localStorage.setItem('romm-trainer-hit-window',String(hitWindowMs)); } catch {}
  resetSession();
  setMessage('判定范围已调整为前后 '+hitWindowMs+' ms，已回到片段起点。',true);
});
els.offset.addEventListener('change',() => {
  const n=Number(els.offset.value); offset=Number.isFinite(n)?Math.max(-300,Math.min(300,n)):0;
  els.offset.value=offset; resetSession();
  try { localStorage.setItem('romm-trainer-offset',String(offset)); } catch {}
  setMessage('时间偏移已设置为 ' + offset + ' ms。正值使判定稍后。',true);
});
els.rateButtons.addEventListener('click',(event) => {
  const target=event.target.closest('button[data-rate]');
  if (!target) return;
  rate=Number(target.dataset.rate); audio.playbackRate=rate;
  els.speedLabel.textContent=rate.toFixed(2)+'×';
  for (const b of els.rateButtons.querySelectorAll('button')) b.classList.toggle('selected',b===target);
  resetSession();
});
$('chartButton').addEventListener('click',()=>els.chartFile.click());
$('audioButton').addEventListener('click',()=>els.audioFile.click());
$('demoButton').addEventListener('click',useDemo);
els.chartFile.addEventListener('change',async()=>{ await importChart(els.chartFile.files[0]); els.chartFile.value=''; });
els.audioFile.addEventListener('change',()=>{
  const file=els.audioFile.files[0];
  if (file) { replaceAudio(URL.createObjectURL(file)); setMessage('正在读取本地音频…',true,0); }
  els.audioFile.value='';
});
window.addEventListener('keydown',(event) => {
  if (bindingIndex !== -1) {
    event.preventDefault();
    if (event.code === 'Escape') { bindingIndex=-1; els.keyHelp.textContent='已取消修改'; renderKeys(); return; }
    if (!/^(Key[A-Z]|Digit[0-9])$/.test(event.code)) { els.keyHelp.textContent='请使用字母或数字键'; return; }
    if (keys.includes(event.code) && keys[bindingIndex] !== event.code) { els.keyHelp.textContent='这个按键已分配给其他轨道'; return; }
    keys[bindingIndex]=event.code; bindingIndex=-1; els.keyHelp.textContent='键位已保存';
    try { localStorage.setItem('romm-trainer-keys',JSON.stringify(keys)); } catch {}
    renderKeys(); return;
  }
  if (event.code === 'Escape' && !els.drawer.hidden) { event.preventDefault(); setDrawerOpen(false); els.drawerToggle.focus(); return; }
  if (event.target instanceof HTMLElement && /^(INPUT|SELECT|TEXTAREA)$/.test(event.target.tagName)) return;
  if (event.code === 'Space') { event.preventDefault(); if (!event.repeat) togglePlay(); return; }
  const lane=keys.indexOf(event.code);
  if (lane < 0 || event.repeat || !isPlaying) return;
  event.preventDefault();
  if (held.has(lane)) return;
  held.add(lane);
  const songMs=audio.currentTime*1000;
  const note=session.press(lane,songMs);
  hitEffects.push({ lane, started:performance.now(), unmatched:!note });
  if (hitEffects.length > 24) hitEffects.shift();
  if (note) {
    const e=Math.round(note.errorMs);
    flash(note.grade === 'precise' ? '准确' : (e < 0 ? '偏早 ' : '偏晚 ') + Math.abs(e) + ' ms');
  } else {
    const error=session.timingHint(lane,songMs);
    flash(error === null ? '未命中' : '未命中 · ' + (error < 0 ? '过早 ' : '过晚 ') + Math.round(Math.abs(error)) + ' ms','miss');
  }
  updateStats();
});
window.addEventListener('keyup',(event)=>{
  const lane=keys.indexOf(event.code);
  if (lane < 0) return;
  if (held.has(lane)) {
    held.delete(lane);
    const note=session.release(lane,isPlaying ? audio.currentTime*1000 : previewMs);
    if (note && note.status === 'miss') flash('长按提前松开','miss');
    updateStats();
  }
});
window.addEventListener('blur',()=>{ if (isPlaying) { pause(); releaseHeldAt(previewMs); updateStats(); setMessage('窗口失去焦点，练习已暂停。'); } });
document.addEventListener('visibilitychange',()=>{ if (document.hidden && isPlaying) { pause(); releaseHeldAt(previewMs); updateStats(); } });

renderKeys(); updateMeta(); refreshRangeUi(); updateStats(); updateTime(0);
replaceAudio(makeDemoAudio());
requestAnimationFrame(frame);
