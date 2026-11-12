import { demoChart, validateChart, validateRange } from './chart.js';
import { Judge, DEFAULT_HIT_WINDOW_MS } from './judge.js';
import { THEMES, getTheme, rgba, paintMotif, paintBackdrop, paintHit } from './themes.js';
import { YouTubeAudio } from './youtube-audio.js';
import { localAudioStore } from './local-audio.js';
import { stageLayout } from './stage-layout.js';
import { firstUnfinishedNote, visibleStageNotes } from './stage-visibility.js';
import { initLanguage, translate, tr, songName } from './i18n.js';
import { chartIdentity, practiceResults, resultPercent, resultTime } from './practice-results.js';
import { hitSound } from './hit-sound.js';

const $ = (id) => document.getElementById(id);
const els = {
  stage: $('stage'), wrap: $('stageWrap'), hint: $('stageHint'), countdown: $('practiceCountdown'), feedback: $('feedback'), message: $('message'),
  play: $('playButton'), playText: $('playText'), playIcon: $('playIcon'), restart: $('restartButton'),
  start: $('startRange'), end: $('endRange'), startOut: $('startOutput'), endOut: $('endOutput'), loop: $('loopToggle'),
  scroll: $('scrollSpeed'), scrollLabel: $('scrollLabel'), offset: $('offset'), speedLabel: $('speedLabel'),
  hitWindow: $('hitWindow'), hitWindowLabel: $('hitWindowLabel'),
  rateButtons: $('rateButtons'), keys: $('keyBindings'), keyHelp: $('keyHelp'), elapsed: $('elapsed'),
  duration: $('duration'), stageTime: $('stageTime'), fill: $('progressFill'), timelineSeek: $('timelineSeek'), hits: $('statHits'),
  performanceScore: $('performanceScore'), completionValue: $('completionValue'), completionFill: $('completionFill'), completionTrack: $('completionTrack'),
  combo: $('statCombo'), timing: $('statTiming'), miss: $('statMiss'), title: $('trackTitle'), artist: $('trackArtist'),
  info: $('trackInfo'), sideTitle: $('sideTitle'), sideArtist: $('sideArtist'), sideBpm: $('sideBpm'),
  sourceTag: $('sourceTag'), chartFile: $('chartFile'), audioFile: $('audioFile'), theme: $('themeSelect'),
  drawer: $('toolsDrawer'), drawerToggle: $('toolsToggle'), drawerClose: $('toolsClose'),
  songOptions: $('songOptions'), onlinePanel: $('onlinePanel'), songAudioStatus: $('songAudioStatus'),
  musicStart: $('musicStart'), onlineButton: $('onlineButton'), metronomeButton: $('metronomeButton'),
  rememberAudio: $('rememberAudio'), savedAudioStatus: $('savedAudioStatus'), forgetAudio: $('forgetAudio'),
  audioBadge: $('audioModeBadge'), hitVolume: $('hitVolume'), hitVolumeLabel: $('hitVolumeLabel'),
  resultOpen: $('resultOpen'), resultDialog: $('practiceResult'), resultClose: $('resultClose'), resultDone: $('resultDone'),
  resultSong: $('resultSong'), resultProfile: $('resultProfile'), resultCompletion: $('resultCompletion'),
  resultHits: $('resultHits'), resultMisses: $('resultMisses'), resultTiming: $('resultTiming'), resultCombo: $('resultCombo'),
  resultBest: $('resultBest'), resultStorage: $('resultStorage'), quickMenu: $('quickRangeMenu'), quickToggle: $('quickRangeToggle')
};
const localAudio = new Audio();
localAudio.preload = 'metadata';
localAudio.preservesPitch = true;
let audio = localAudio, onlineAudio = null, audioMode = 'demo', musicStart = 0;
let selectionId = 0, playId = 0, playPending = false;
let countdownTimer = null, finishCountdown = null, playWasResume = false;
let localUnlock = null;
let chart = demoChart;
let sourceType = 'demo';
const DEFAULT_SONG = {id:'_GMusic16',title:'净善的遐歌',titleEn:'Surasthana Fantasia',titleJa:'スラサタンナ幻想曲',chartUrl:'./data/surasthana-legend.json',levels:[1,2,5,6],audio:{videoId:'2SvpviExw1o',startSeconds:2582,durationSeconds:141}};
let currentSong = DEFAULT_SONG;
let rate = 1;
let scrollRate = 1;
let offset = 0;
let hitWindowMs = DEFAULT_HIT_WINDOW_MS;
let startMs = 0, endMs = chart.durationMs;
let session;
let audioReady = false, audioFailed = false, isPlaying = false, hasStarted = false, ending = false, audioUrl = null;
let previewMs = 0, bindingIndex = -1, messageTimer = null, feedbackTimer = null;
let lastMessage = '', lastMessageEn = null, lastMessageJa = null, lastFeedback = '', lastPlayText = '开始练习', lastKeyHelp = '点击键位，再按下新的按键', lastSavedAudioStatus = '音频仅保存在当前浏览器，不会上传。';
let seeking = false;
let currentIdentity=chartIdentity(sourceType,currentSong,chart), lastResult=null;
let keys = ['KeyA','KeyS','KeyD','KeyJ','KeyK','KeyL'];
const held = new Set();
const activeInputs = new Map();
let themeId = 'base', currentTheme = getTheme(themeId);
const hitEffects = [];
const canvas = els.stage;
const ctx = canvas.getContext('2d');
const backdropCanvas = $('stageBackdrop');
const backdropCtx = backdropCanvas?.getContext('2d');
const portraitQuery = window.matchMedia?.('(orientation:portrait) and (max-width:600px)');
const compactQuery = window.matchMedia?.('(pointer:coarse), (orientation:portrait) and (max-width:600px), (orientation:landscape) and (max-height:600px)');
const coarseQuery = window.matchMedia?.('(pointer:coarse)');
let stageWidth=0, stageHeight=0, backdropKey='', stageFrameQueued=false;
let lastHitsSignature='', lastProgressKey='', lastSeekAria='', renderSession=null, firstRenderNote=0;
const stageObserver = typeof window.ResizeObserver === 'function' ? new window.ResizeObserver(entries => {
  const entry=entries.find(item=>item.target===canvas);
  if (entry) { stageWidth=entry.contentRect.width; stageHeight=entry.contentRect.height; }
}) : null;
stageObserver?.observe(canvas);

try {
  const savedWindow = Number(localStorage.getItem('romm-trainer-hit-window'));
  if (savedWindow >= 120 && savedWindow <= 240) hitWindowMs = savedWindow;
  const savedTheme = localStorage.getItem('romm-trainer-theme');
  if (Object.hasOwn(THEMES, savedTheme)) themeId = savedTheme;
  const stored = JSON.parse(localStorage.getItem('romm-trainer-keys') || 'null');
  if (Array.isArray(stored) && stored.length === 6 && new Set(stored).size === 6 && stored.every(k => /^(Key[A-Z]|Digit[0-9])$/.test(k))) keys = stored;
  const savedScroll = Number(localStorage.getItem('romm-trainer-scroll'));
  if (savedScroll >= 0.3 && savedScroll <= 2) scrollRate = savedScroll;
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
if (els.hitVolume) { els.hitVolume.value=String(hitSound.getVolume()); if (els.hitVolumeLabel) els.hitVolumeLabel.textContent=hitSound.getVolume()+'%'; }

function applyTheme(id, save = true) {
  themeId = Object.hasOwn(THEMES, id) ? id : 'base';
  currentTheme = getTheme(themeId);
  els.wrap.dataset.theme = themeId;
  els.theme.value = themeId;
  hitEffects.length = 0;
  if (save) { try { localStorage.setItem('romm-trainer-theme', themeId); } catch {} }
}
function setDrawerOpen(open) {
  const wasOpen = !els.drawer.hidden;
  if (open) setQuickMenu(false);
  if (open && isPlaying) pause();
  if (open && playPending) stopAudio();
  if (!open && bindingIndex !== -1) {
    bindingIndex = -1;
    setKeyHelp('已取消修改');
    renderKeys();
  }
  els.drawer.hidden = !open;
  els.drawerToggle.setAttribute('aria-expanded', String(open));
  if (wasOpen && !open) window.dispatchEvent?.(new Event('romm:settings-closed'));
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
function setQuickMenu(open) {
  if (!els.quickMenu || !els.quickToggle) return;
  els.quickMenu.hidden=!open;
  els.quickToggle.setAttribute('aria-expanded',String(open));
}
function setRangeAtCurrent(which) {
  if (!audioReady) { setMessage('音源尚未就绪，暂时无法调整进度。'); return; }
  const current=Math.min(chart.durationMs,Math.max(0,Math.round((isPlaying ? songTime() : previewMs)/100)*100));
  const nextStart=which==='A'?current:startMs, nextEnd=which==='B'?current:endMs;
  const error=validateRange(chart,nextStart,nextEnd);
  if (error) { setMessage(error,false,0); return; }
  startMs=nextStart;endMs=nextEnd;refreshRangeUi();resetSession();
  setMessage('已将 '+format(current,true)+' 设为 '+which+' 点，练习已回到区间前的引导位置。',true,5000,
    `Set ${which} to ${format(current,true)}. Returned to the section lead-in.`,
    `${format(current,true)} を ${which} 点に設定し、区間の導入位置に戻りました。`);
  setQuickMenu(false);
}
function resetRange() {
  startMs=0;endMs=chart.durationMs;refreshRangeUi();resetSession();setQuickMenu(false);
  setMessage('已恢复全曲练习。',true,5000,'Restored the full song.','練習範囲を全曲に戻しました。');
}
function clearResult() {
  lastResult=null;
  if (els.resultOpen) els.resultOpen.hidden=true;
  if (els.resultDialog?.open) els.resultDialog.close();
}
function renderResult() {
  if (!lastResult || !els.resultSong) return;
  const {attempt,best,improved,saved}=lastResult;
  els.resultSong.textContent=sourceType==='song'?songName(currentSong):sourceType==='demo'?translate(chart.title):chart.title;
  const range=`${resultTime(attempt.startMs)} – ${resultTime(attempt.endMs)}`;
  const signedOffset=(attempt.offsetMs>=0?'+':'')+attempt.offsetMs+' ms';
  els.resultProfile.textContent=tr(`区间 ${range} · ${attempt.rate.toFixed(2)}× · 判定 ±${attempt.hitWindowMs} ms · 偏移 ${signedOffset}`,
    `Section ${range} · ${attempt.rate.toFixed(2)}× · Window ±${attempt.hitWindowMs} ms · Offset ${signedOffset}`,
    `区間 ${range} · ${attempt.rate.toFixed(2)}× · 判定 ±${attempt.hitWindowMs} ms · 調整 ${signedOffset}`);
  els.resultCompletion.textContent=resultPercent(attempt)+'%';
  els.resultHits.textContent=attempt.hits+' / '+attempt.total;
  els.resultMisses.textContent=String(attempt.misses);
  els.resultTiming.textContent=attempt.early+' / '+attempt.late;
  els.resultCombo.textContent=String(attempt.maxCombo);
  els.resultBest.textContent=improved ? tr(`相同设置的最佳：${resultPercent(best)}% · 新纪录`,`Best with these settings: ${resultPercent(best)}% · New record`,`同じ設定のベスト：${resultPercent(best)}% · 新記録`) :
    tr(`相同设置的最佳：${resultPercent(best)}%`,`Best with these settings: ${resultPercent(best)}%`,`同じ設定のベスト：${resultPercent(best)}%`);
  els.resultStorage.textContent=saved ? tr('成绩保存在当前浏览器。','Results are saved in this browser.','結果はこのブラウザに保存されます。') :
    tr('当前浏览器无法保存，成绩仅在本次访问有效。','Unable to save; this result lasts only for this visit.','保存できないため、今回のアクセス中のみ有効です。');
}
function rememberResult() {
  if (!session.states.length || session.maxScore<=0) return false;
  const attempt={...currentIdentity,startMs:session.startMs,endMs:session.endMs,rate:session.rate,hitWindowMs:session.hitWindowMs,offsetMs:session.offsetMs,
    score:session.score,maxScore:session.maxScore,hits:session.hits,misses:session.misses,early:session.early,late:session.late,maxCombo:session.maxCombo,total:session.states.length};
  const stored=practiceResults.record(attempt);
  if (!stored) return false;
  lastResult={attempt,...stored};
  if (els.resultOpen) els.resultOpen.hidden=false;
  renderResult();
  window.dispatchEvent?.(new Event('romm:results-changed'));
  return true;
}
function showResult() {
  if (!lastResult || !els.resultDialog?.showModal) return;
  if (isPlaying) pause();
  if (playPending) stopAudio();
  setQuickMenu(false);renderResult();
  if (!els.resultDialog.open) els.resultDialog.showModal();
}
function closeResult() {
  if (els.resultDialog?.open) els.resultDialog.close();
  els.resultOpen?.focus();
}
function setMessage(text, good = false, timeout = 5000, english = null, japanese = null) {
  clearTimeout(messageTimer);
  lastMessage = text; lastMessageEn = english; lastMessageJa = japanese;
  els.message.textContent = english === null ? translate(text) : tr(text, english, japanese ?? undefined);
  els.message.classList.toggle('success', good);
  if (timeout) messageTimer = setTimeout(() => { lastMessage = ''; lastMessageEn = null; lastMessageJa = null; els.message.textContent = ''; }, timeout);
}
function flash(text, kind = 'hit') {
  clearTimeout(feedbackTimer);
  lastFeedback = text;
  els.feedback.dataset.kind = kind;
  els.feedback.textContent = translate(text);
  els.feedback.classList.add('visible');
  feedbackTimer = setTimeout(() => els.feedback.classList.remove('visible'), 550);
}
function setPlayText(text) { lastPlayText=text; els.playText.textContent=translate(text); els.play.setAttribute('aria-label',translate(text)); }
function setKeyHelp(text) { lastKeyHelp=text; els.keyHelp.textContent=translate(text); }
function setSavedAudioStatus(text) { lastSavedAudioStatus=text; if (els.savedAudioStatus) els.savedAudioStatus.textContent=translate(text); }
function keyLabel(code) { return code.replace(/^Key/,'').replace(/^Digit/,''); }
function renderKeys() {
  els.keys.replaceChildren();
  keys.forEach((key, lane) => {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = bindingIndex === lane ? '…' : keyLabel(key);
    b.setAttribute('aria-label', translate('第 ' + (lane + 1) + ' 轨，按键 ' + keyLabel(key)));
    if (bindingIndex === lane) b.classList.add('listening');
    b.addEventListener('click', () => {
      if (isPlaying) pause();
      bindingIndex = lane;
      setKeyHelp('请按下新的字母或数字键');
      renderKeys();
      els.keys.children[lane].focus();
    });
    els.keys.appendChild(b);
  });
}
function updateMeta() {
  const title = sourceType === 'song' ? songName(currentSong) : sourceType === 'demo' ? translate(chart.title) : chart.title;
  const artist = sourceType === 'local' ? (chart.artist || translate('本地谱面')) : translate(chart.artist || '本地谱面').replace('传说难度', tr('传说难度', 'Legendary difficulty'));
  els.title.textContent = title;
  els.sideTitle.textContent = title;
  els.artist.textContent = artist;
  els.sideArtist.textContent = artist;
  const bpm = chart.bpm ? chart.bpm + ' BPM' : translate('自由节奏');
  els.info.textContent = bpm;
  els.sideBpm.textContent = bpm;
  els.duration.textContent = format(chart.durationMs);
  if (els.timelineSeek) els.timelineSeek.max=String(chart.durationMs);
  els.sourceTag.textContent = translate(sourceType === 'demo' ? '示范谱' : sourceType === 'song' ? '传说 · ' + (currentSong.levels?.[3] || '—') + ' 星' : '本地谱');
}
function songTime() { return Math.max(0, (audio.currentTime - (sourceType === 'song' ? musicStart : 0)) * 1000); }
function seekSong(ms) { audio.currentTime = Math.max(0, ms) / 1000 + (sourceType === 'song' ? musicStart : 0); }
function updateAudioBadge() {
  if (!els.audioBadge) return;
  const text=audioMode==='demo' ? '示范节拍' : audioMode==='metronome' ? '节拍伴奏 · 无原曲' :
    audioMode==='online' ? (audioReady ? '在线音源' : '在线原声 · 加载中') :
    audioFailed ? '本地音频不可用' : audioReady ? '本地音频' : '本地音频 · 加载中';
  els.audioBadge.textContent=translate(text);
  els.audioBadge.dataset.mode=audioMode;
  els.audioBadge.setAttribute('aria-label',tr('当前音源：','Audio: ','現在の音源：')+translate(text));
}
function setAudioMode(mode) {
  audioMode = mode;
  audioFailed = false;
  els.wrap.classList.toggle('with-player', mode === 'online');
  els.onlinePanel.hidden = mode !== 'online';
  els.songOptions.hidden = sourceType !== 'song';
  els.musicStart.disabled = mode === 'metronome';
  const onlineDuration=currentSong?.audio?.durationSeconds;
  const maxStart=mode === 'online' && Number.isFinite(onlineDuration) ? Math.max(0,Math.min(120,onlineDuration-chart.durationMs/1000)) : 120;
  els.musicStart.max = String(maxStart);
  els.musicStart.value = String(musicStart);
  els.onlineButton.disabled = !currentSong?.audio;
  els.onlineButton.classList.toggle('selected', mode === 'online');
  els.metronomeButton.classList.toggle('selected', mode === 'metronome');
  els.songAudioStatus.textContent = translate(mode === 'online' ? '在线原声 · 同步待校准' : mode === 'metronome' ? '节拍伴奏 · 无歌曲原声' : '本地音频');
  updateAudioBadge();
}
function updateStats() {
  const completion = formatCompletion(session.completion);
  const score=String(Math.floor(session.score + 1e-8));
  if (els.performanceScore.textContent !== score) els.performanceScore.textContent = score;
  if (els.completionValue.textContent !== '(' + completion + '%)') {
    els.completionValue.textContent = '(' + completion + '%)';
    els.completionFill.style.width = completion + '%';
    els.completionTrack.setAttribute('aria-valuenow', completion);
    els.completionTrack.setAttribute('aria-valuetext', completion + '%');
  }
  const hitsSignature=session.hits + '/' + session.states.length;
  if (hitsSignature !== lastHitsSignature) {
    els.hits.replaceChildren(document.createTextNode(String(session.hits) + ' '));
    const small = document.createElement('small');
    small.textContent = '/ ' + session.states.length;
    els.hits.appendChild(small); lastHitsSignature=hitsSignature;
  }
  const combo=String(session.combo), timing=session.early + ' / ' + session.late, misses=String(session.misses);
  if (els.combo.textContent !== combo) els.combo.textContent=combo;
  if (els.timing.textContent !== timing) els.timing.textContent=timing;
  if (els.miss.textContent !== misses) els.miss.textContent=misses;
}
function updateTime(ms, fromSeek = false) {
  if (seeking && !fromSeek) return;
  const current=format(ms), stageTime=current + ' / ' + format(chart.durationMs);
  if (els.elapsed.textContent !== current) els.elapsed.textContent=current;
  if (els.stageTime.textContent !== stageTime) els.stageTime.textContent=stageTime;
  const clamped=Math.max(0,Math.min(chart.durationMs,ms));
  const displayedMs=clamped >= chart.durationMs ? chart.durationMs : Math.floor(clamped / 100) * 100;
  const progressKey=displayedMs + '/' + chart.durationMs;
  if (progressKey !== lastProgressKey) {
    els.fill.style.width=displayedMs / chart.durationMs * 100 + '%'; lastProgressKey=progressKey;
  }
  if (els.timelineSeek) {
    if (els.timelineSeek.value !== String(displayedMs)) els.timelineSeek.value=String(displayedMs);
    const aria=format(displayedMs,true);
    if (aria !== lastSeekAria) { els.timelineSeek.setAttribute('aria-valuetext',aria); lastSeekAria=aria; }
  }
}
function seekPractice(requestedMs) {
  seeking=false;
  if (!audioReady) { updateTime(previewMs);setMessage('音源尚未就绪，暂时无法调整进度。');return; }
  const target=Math.max(startMs,Math.min(endMs,requestedMs));
  if (!Number.isFinite(target)) {updateTime(previewMs);return;}
  if (playPending) stopAudio();
  try {seekSong(target);} catch {updateTime(previewMs);setMessage('当前音源暂时无法跳转，请稍后重试。');return;}
  held.clear();activeInputs.clear();hitEffects.length=0;ending=false;
  session=new Judge(chart,target,endMs,rate,offset,hitWindowMs);
  previewMs=target;hasStarted=true;
  updateStats();updateTime(target);
  setMessage('已跳转至 '+format(target,true)+'；本轮完成度从当前位置重新计算。',true);
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
  held.clear(); activeInputs.clear();
}
function pause() {
  if (!isPlaying) return;
  const now = songTime();
  session.tick(now);
  isPlaying = false; audio.pause(); previewMs = now;
  setPlayText('继续练习'); els.playIcon.textContent = '▶';
  updateStats();
}
function resetSession() {
  if (isPlaying) pause();
  if (playPending) stopAudio();
  held.clear(); activeInputs.clear(); hitEffects.length = 0; ending = false; hasStarted = false;
  session = new Judge(chart,startMs,endMs,rate,offset,hitWindowMs);
  previewMs = Math.max(0,startMs - 2000);
  if (audioReady) {
    try { seekSong(previewMs); } catch { /* Seeking before metadata can be unavailable. */ }
  }
  els.hint.classList.remove('hidden');
  setPlayText('开始练习'); els.playIcon.textContent = '▶';
  updateStats(); updateTime(previewMs);
}
async function play() {
  if (playPending) return;
  if (!checkRange(true)) return;
  if (!audioReady) { setMessage(audioMode === 'online' ? '在线音源尚未就绪，可稍后重试或切换节拍伴奏。' : '请先选择与当前谱面配套的本地音频。', false, 0); return; }
  if (audio === localAudio && Number.isFinite(audio.duration) && audio.duration * 1000 + 50 < chart.durationMs + (sourceType === 'song' ? musicStart * 1000 : 0)) {
    setMessage('音频从所选起点开始的剩余时长不足，请调整音源起点或更换音频。', false, 0); return;
  }
  setDrawerOpen(false);
  playWasResume = hasStarted;
  if (!hasStarted) {
    session = new Judge(chart,startMs,endMs,rate,offset,hitWindowMs);
    seekSong(Math.max(0,startMs - 2000));
    hasStarted = true;
  }
  audio.playbackRate = rate;
  const activeAudio = audio, activePlay = ++playId;
  playPending = true;
  els.hint.classList.add('hidden');
  setPlayText('取消倒计时');
  els.playIcon.textContent = 'Ⅱ';
  try {
    // Start the local media element during the user's gesture. iOS can reject
    // a first play() invoked only after the countdown's timer has elapsed.
    if (activeAudio === localAudio) {
      const position=activeAudio.currentTime;
      localUnlock={player:activeAudio,muted:activeAudio.muted};
      activeAudio.muted=true;
      await activeAudio.play();
      if (activeAudio !== audio || activePlay !== playId) return;
      activeAudio.pause();
      activeAudio.currentTime=position;
      activeAudio.muted=localUnlock.muted;
      localUnlock=null;
    }
    const completed = await new Promise(resolve => {
      finishCountdown = resolve;
      let remaining = 3;
      els.countdown.hidden = false;
      els.countdown.textContent = String(remaining);
      const tick = () => {
        if (--remaining > 0) {
          els.countdown.textContent = String(remaining);
          countdownTimer = setTimeout(tick, 1000);
        } else {
          countdownTimer = null; finishCountdown = null;
          els.countdown.hidden = true;
          resolve(true);
        }
      };
      countdownTimer = setTimeout(tick, 1000);
    });
    if (!completed || activeAudio !== audio || activePlay !== playId) return;
    if (audioMode === 'online') { setPlayText('正在连接…'); setMessage('正在加载官方在线音源，首次播放可能需要一些时间。', true, 0); }
    await activeAudio.play();
    if (activeAudio !== audio || activePlay !== playId) { if (activeAudio !== audio) activeAudio.pause(); return; }
    isPlaying = true; ending = false;
    els.hint.classList.add('hidden');
    setPlayText('暂停'); els.playIcon.textContent = 'Ⅱ';
    els.play.blur();
    if (audioMode === 'online') setMessage('在线原声已开始；如有错位，请在设置中调整音源起点。', true);
  } catch (error) {
    if (activeAudio === audio && activePlay === playId) {
      isPlaying = false; hasStarted = false;
      setPlayText('开始练习'); els.playIcon.textContent = '▶';
      if (audioMode === 'online') {
        discardOnline(activeAudio);
        useMetronome();
        setMessage('在线原声播放失败，已切换节拍伴奏；可选择本地音频随原曲练习。',false,0);
      } else setMessage('音频无法播放，请检查本地音频文件或浏览器设置。', false, 0);
    }
  } finally {
    if (activePlay === playId) {
      if (localUnlock) { localUnlock.player.muted=localUnlock.muted; localUnlock=null; }
      playPending = false;
    }
  }
}
function togglePlay() { if (playPending) stopAudio(); else if (isPlaying) pause(); else { hitSound.unlock(); void play(); } }
function completePass() {
  if (ending) return;
  ending = true;
  const nudge = Math.max(0,offset * rate);
  session.tick(endMs + nudge);
  releaseHeldAt(endMs + nudge);
  session.finishRemaining();
  updateStats();
  const hasResult=rememberResult();
  if (els.loop.checked && isPlaying) {
    const hitCount = session.hits, total = session.states.length, completion = formatCompletion(session.completion);
    session = new Judge(chart,startMs,endMs,rate,offset,hitWindowMs);
    held.clear(); activeInputs.clear();
    seekSong(Math.max(0,startMs - 2000));
    if (audio.paused) void audio.play().catch(() => { isPlaying = false; setMessage('请点击继续练习。'); });
    setMessage('上一轮：完成度 ' + completion + '%，命中 ' + hitCount + ' / ' + total + '。继续练习。', true);
    ending = false;
  } else {
    isPlaying = false; audio.pause(); hasStarted = false;
    previewMs = endMs;
    setPlayText('再练一次'); els.playIcon.textContent = '▶';
    setMessage('本段练习完成：完成度 ' + formatCompletion(session.completion) + '%，命中 ' + session.hits + ' / ' + session.states.length + '。', true, 0);
    if (hasResult) showResult();
  }
}
function handleRange() {
  startMs = Math.round(Number(els.start.value) * 1000);
  endMs = Math.round(Number(els.end.value) * 1000);
  refreshRangeUi(); resetSession();
  if (checkRange()) setMessage('练习区间 ' + format(startMs,true) + ' – ' + format(endMs,true), true);
  else checkRange(true);
}
function stopAudio() {
  if (isPlaying) pause();
  const wasPending = playPending;
  playId++; playPending = false;
  if (countdownTimer !== null) clearTimeout(countdownTimer);
  countdownTimer = null;
  if (finishCountdown) { const finish = finishCountdown; finishCountdown = null; finish(false); }
  els.countdown.hidden = true;
  audio.pause();
  if (localUnlock) { localUnlock.player.muted=localUnlock.muted; localUnlock=null; }
  if (wasPending) { hasStarted=playWasResume; setPlayText(hasStarted?'继续练习':'开始练习'); els.playIcon.textContent='▶'; if (!hasStarted) els.hint.classList.remove('hidden'); }
}
function replaceAudio(url, mode = 'local') {
  stopAudio();
  audio = localAudio;
  musicStart = 0;
  audioReady = false;
  setAudioMode(mode);
  if (audioUrl) URL.revokeObjectURL(audioUrl);
  audioUrl = url;
  audio.src = url;
  audio.playbackRate = rate;
  audio.load();
}
localAudio.addEventListener('loadedmetadata', () => {
  if (audio !== localAudio) return;
  if (!Number.isFinite(audio.duration) || audio.duration * 1000 + 50 < chart.durationMs) {
    audioReady = false;
    audioFailed = true; updateAudioBadge();
    setMessage('音频短于谱面时长，请选择完整配套音频。', false, 0);
    return;
  }
  audioReady = true;
  audioFailed = false; updateAudioBadge();
  resetSession();
  if (audioMode === 'local') setMessage('本地音频已就绪，可以开始练习。', true);
});
localAudio.addEventListener('error', () => {
  if (audio !== localAudio) return;
  audioReady = false;
  audioFailed = true; updateAudioBadge();
  if (audio.src) setMessage('无法读取音频，请尝试浏览器支持的格式。', false, 0);
});
localAudio.addEventListener('ended', () => { if (audio === localAudio && isPlaying) completePass(); });

function makeDemoAudio(durationMs = 32000, bpm = 120, firstBeat = 0, beatTimesMs = null) {
  // Original synthesized percussion backing, unrelated to the player's inputs.
  const sampleRate = 22050, length = Math.ceil(durationMs / 1000 * sampleRate);
  const data = new Float32Array(length);
  const add = (time, duration, fn) => {
    const start = Math.floor(time * sampleRate), count = Math.floor(duration * sampleRate);
    for (let i=0;i<count && start+i<length;i++) data[start+i] += fn(i/sampleRate);
  };
  const beats=Array.isArray(beatTimesMs) && beatTimesMs.length ? beatTimesMs.map(t=>t/1000) : Array.from({length:Math.max(0,Math.ceil((durationMs/1000-firstBeat)*bpm/60))},(_,i)=>firstBeat+i*60/bpm);
  for (let beat=0; beat<beats.length; beat++) {
    const t = beats[beat];
    const strong = beat % 4 === 0;
    add(t,0.12,(s) => Math.sin(2 * Math.PI * (strong ? 82 : 105) * s) * Math.exp(-s * 35) * (strong ? 0.35 : 0.16));
    add(t + (beats[beat+1] ? (beats[beat+1]-t)/2 : 30/bpm),0.045,(s) => Math.sin(2 * Math.PI * 1700 * s) * Math.exp(-s * 90) * 0.035);
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
  selectionId++; stopAudio();
  chart = demoChart; sourceType = 'demo'; startMs = 0; endMs = chart.durationMs;
  currentIdentity=chartIdentity(sourceType,currentSong,chart);clearResult();
  musicStart = 0;
  updateMeta(); refreshRangeUi(); resetSession();
  replaceAudio(makeDemoAudio(), 'demo');
  setMessage('已恢复原创示范谱与节拍伴奏。', true);
}
async function useSong(song = DEFAULT_SONG) {
  const selection = ++selectionId;
  stopAudio();
  setMessage('正在加载《' + song.title + '》传说谱面…', true, 0, 'Loading the Legendary chart for ' + (song.titleEn || song.title) + '…', (song.titleJa || song.titleEn || song.title) + 'のレジェンド譜面を読み込み中…');
  try {
    const response = await fetch(song.chartUrl);
    if (!response.ok) throw new Error('谱面文件未能加载');
    const parsed = validateChart(await response.json());
    if (selection !== selectionId) return;
    currentSong = song;
    chart = parsed; sourceType = 'song'; startMs = 0; endMs = chart.durationMs; musicStart = 0;
    currentIdentity=chartIdentity(sourceType,currentSong,chart);clearResult();
    audioReady = false;
    updateMeta(); refreshRangeUi(); resetSession();
    if (els.forgetAudio) els.forgetAudio.hidden=true;
    setSavedAudioStatus('音频仅保存在当前浏览器，不会上传。');
    let savedFile = null;
    try { savedFile = await localAudioStore.get(song.id || song.chartUrl); } catch { /* Local storage may be unavailable. */ }
    if (selection !== selectionId) return;
    if (savedFile instanceof Blob) {
      replaceAudio(URL.createObjectURL(savedFile));
      if (els.forgetAudio) els.forgetAudio.hidden=false;
      setSavedAudioStatus('已载入本设备保存的音频：' + (savedFile.name || '本地音频'));
      setMessage('已载入本设备保存的音频，可以直接练习。',true);
      return;
    }
    if (currentSong.audio) await useOnline(); else useMetronome();
  } catch (error) {
    if (selection === selectionId) setMessage('曲谱加载失败：' + (error instanceof Error ? error.message : '请重试'), false, 0);
  }
}
function discardOnline(player) {
  player.destroy();
  if (onlineAudio === player) onlineAudio = null;
  const mount=$('youtubeMount'), replacement=document.createElement('div');
  replacement.id='youtubePlayer'; mount.replaceChildren(replacement);
}
async function useOnline() {
  if (sourceType !== 'song' || !currentSong?.audio) return;
  stopAudio();
  musicStart = 0;
  audioReady = false;
  const {videoId,startSeconds}=currentSong.audio;
  if (onlineAudio && (onlineAudio.failed || onlineAudio.videoId !== videoId || onlineAudio.trackStartSeconds !== startSeconds)) {
    onlineAudio.destroy();
    onlineAudio = null;
    const mount = $('youtubeMount');
    const player = document.createElement('div'); player.id = 'youtubePlayer';
    mount.replaceChildren(player);
  }
  const label=$('onlineTrackLabel'), link=$('onlineLink');
  if (label) label.textContent=tr('官方原声专辑 · 《' + currentSong.title + '》', 'Official soundtrack · ' + songName(currentSong), '公式サウンドトラック · ' + songName(currentSong));
  if (link) link.href='https://www.youtube.com/watch?v=' + encodeURIComponent(videoId) + '&t=' + Math.floor(startSeconds) + 's';
  if (!onlineAudio) {
    const player = new YouTubeAudio($('youtubePlayer'), (state, error) => {
      if (audio !== player || sourceType !== 'song') return;
      if (state === 2 && isPlaying) {
        pause(); setMessage('在线播放器已暂停，请使用上方按钮继续。');
      } else if (state === 0 && isPlaying) completePass();
      else if (state === 'error') {
        if (isPlaying) pause();
        discardOnline(player);
        useMetronome();
        setMessage((error?.message || '在线原声不可用') + '，已切换节拍伴奏；可选择本地音频随原曲练习。', false, 0);
      } else if (state === 1 && !isPlaying && !playPending) player.pause();
    }, {videoId,trackStartSeconds:startSeconds});
    onlineAudio = player;
  }
  const activeOnline = onlineAudio;
  audio = activeOnline;
  setAudioMode('online');
  resetSession();
  setMessage('正在准备官方在线音源，也可在设置中选择节拍伴奏。', true, 0);
  let timeout;
  try {
    await Promise.race([activeOnline.ready,new Promise((_,reject)=>{timeout=setTimeout(()=>reject(new Error('在线音源连接超时')),8000);})]);
    if (audio !== activeOnline || sourceType !== 'song') return;
    audioReady = true;
    updateAudioBadge();
    resetSession();
    setMessage('谱面已就绪。在线原声与游戏剪辑的对应仍需校准。', true, 0);
  } catch {
    if (audio === activeOnline && sourceType === 'song') {
      discardOnline(activeOnline);
      useMetronome();
      setMessage('在线原声暂不可用，已切换节拍伴奏；可选择本地音频随原曲练习。',false,0);
    }
  } finally { clearTimeout(timeout); }
}
function useMetronome() {
  if (sourceType !== 'song') return;
  replaceAudio(makeDemoAudio(chart.durationMs, chart.bpm || 120, 60 / (chart.bpm || 120) / 3, chart.beatTimesMs), 'metronome');
  setMessage('已切换为节拍伴奏，可以直接练习；此伴奏不包含歌曲原声。', true, 0);
}
async function importChart(file) {
  if (!file) return;
  if (file.size > 1024 * 1024) { setMessage('谱面文件不能超过 1 MB。'); return; }
  try {
    const parsed = validateChart(JSON.parse(await file.text()));
    selectionId++; stopAudio();
    chart = parsed; sourceType = 'local'; startMs = 0; endMs = chart.durationMs;
    currentIdentity=chartIdentity(sourceType,currentSong,chart);clearResult();
    audioReady = false;
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    audio = localAudio; audioUrl = null; audio.removeAttribute('src'); audio.load();
    musicStart = 0; setAudioMode('local');
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
  } else if (shape === 'heart') {
    ctx.moveTo(x,y-radius*.64);ctx.bezierCurveTo(x-radius*.7,y-radius*1.25,x-radius*1.28,y-radius*.42,x-radius*.85,y+radius*.13);
    ctx.quadraticCurveTo(x-radius*.5,y+radius*.62,x,y+radius);ctx.quadraticCurveTo(x+radius*.5,y+radius*.62,x+radius*.85,y+radius*.13);
    ctx.bezierCurveTo(x+radius*1.28,y-radius*.42,x+radius*.7,y-radius*1.25,x,y-radius*.64);ctx.closePath();
  } else if (shape === 'flower') {
    for(let i=0;i<80;i++){const a=i*Math.PI*2/80-Math.PI/2, r=radius*(.78+.22*Math.cos(4*a));if(!i)ctx.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r);else ctx.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);}ctx.closePath();
  } else if (shape === 'flame') {
    ctx.moveTo(x,y-radius);ctx.lineTo(x+radius*.44,y-radius*.45);ctx.lineTo(x+radius*.62,y-radius*.55);
    ctx.bezierCurveTo(x+radius*1.28,y+radius*.15,x+radius*.72,y+radius,x,y+radius);
    ctx.bezierCurveTo(x-radius*.72,y+radius,x-radius*1.28,y+radius*.15,x-radius*.62,y-radius*.55);ctx.lineTo(x-radius*.44,y-radius*.45);ctx.closePath();
  } else ctx.arc(x,y,radius,0,Math.PI*2);
}
function drawNote(x, y, radius, isHold, compact) {
  const colors=isHold ? currentTheme.hold : currentTheme.tap;
  ctx.save(); ctx.shadowColor=rgba(colors[1],.7); ctx.shadowBlur=compact ? 7 : 13;
  notePath(x,y,radius,currentTheme.shape);ctx.fillStyle=colors[2];ctx.fill();
  ctx.shadowBlur=0;ctx.lineWidth=2.2;ctx.strokeStyle='rgba(250,250,241,.92)';ctx.stroke();
  const fill=ctx.createRadialGradient(x-radius*.3,y-radius*.4,radius*.05,x,y,radius);
  fill.addColorStop(0,colors[0]);fill.addColorStop(.58,colors[1]);fill.addColorStop(1,colors[2]);
  notePath(x,y,radius*.8,currentTheme.shape);ctx.fillStyle=fill;ctx.fill();
  ctx.lineWidth=1;ctx.strokeStyle=rgba(colors[0],.84);ctx.stroke();
  paintMotif(ctx,currentTheme.motif,x,y,radius*.48,colors[0]);
  ctx.restore();
}
function renderBackdrop(w,h,dpr) {
  if (!backdropCtx) { paintBackdrop(ctx,currentTheme,w,h); return; }
  const key=[w,h,dpr,themeId].join(':');
  if (key === backdropKey) return;
  backdropKey=key;
  backdropCanvas.width=Math.round(w*dpr); backdropCanvas.height=Math.round(h*dpr);
  backdropCtx.setTransform(dpr,0,0,dpr,0,0);
  backdropCtx.clearRect(0,0,w,h);
  paintBackdrop(backdropCtx,currentTheme,w,h);
}
function renderStage(songMs) {
  const compact=!!compactQuery?.matches;
  const dpr = Math.min(window.devicePixelRatio || 1,compact ? 1.5 : 2);
  // ResizeObserver keeps frame rendering from forcing a new layout after UI updates.
  const rect = stageWidth && stageHeight ? null : canvas.getBoundingClientRect();
  const w = stageWidth || canvas.clientWidth || rect?.width, h = stageHeight || canvas.clientHeight || rect?.height;
  if (!w || !h) return;
  if (canvas.width !== Math.round(w*dpr) || canvas.height !== Math.round(h*dpr)) {
    canvas.width = Math.round(w*dpr); canvas.height = Math.round(h*dpr);
  }
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,w,h);
  const portraitPhone=!!portraitQuery?.matches;
  const {left,laneWidth,hitY,spawnY,clipTop,travelMs}=stageLayout(w,h,portraitPhone);
  const travel = travelMs / scrollRate;
  const pxPerMs = (hitY - spawnY) / travel;
  const showTime = songMs - offset * rate;
  const center = lane => left + lane * laneWidth + laneWidth / 2;
  const radius = compact ? Math.min(23,laneWidth * .27) : Math.min(32,laneWidth * .30);
  renderBackdrop(w,h,dpr);
  // Keep entering notes clear of the toolbar and the portrait score display.
  ctx.save(); ctx.beginPath(); ctx.rect(0,clipTop,w,Math.max(0,h-clipTop)); ctx.clip();

  for (let lane=0;lane<6;lane++) {
    const x = center(lane);
    const beam = ctx.createLinearGradient(0,spawnY,0,hitY);
    beam.addColorStop(0,'rgba(233,241,237,0)');
    beam.addColorStop(.35, held.has(lane) ? rgba(currentTheme.accent,.30) : 'rgba(232,240,237,.14)');
    beam.addColorStop(1, held.has(lane) ? rgba(currentTheme.accent,.85) : 'rgba(232,240,237,.48)');
    ctx.strokeStyle=beam; ctx.lineWidth=held.has(lane)?2:1;
    ctx.beginPath(); ctx.moveTo(x,spawnY); ctx.lineTo(x,hitY); ctx.stroke();
  }

  if (renderSession !== session) { renderSession=session; firstRenderNote=0; }
  firstRenderNote=firstUnfinishedNote(session.states,firstRenderNote);
  const visible=visibleStageNotes(session.states,firstRenderNote,showTime,hitY,h,radius,pxPerMs);
  // Draw links behind visible notes that must be pressed simultaneously.
  const chords = new Map();
  for (const {note,headY} of visible) {
    if (note.status !== 'pending') continue;
    const group=chords.get(note.atMs);
    if (group) { group.min=Math.min(group.min,note.lane); group.max=Math.max(group.max,note.lane); group.count++; }
    else chords.set(note.atMs,{min:note.lane,max:note.lane,count:1,y:headY});
  }
  for (const group of chords.values()) {
    if (group.count<2 || group.y < -30 || group.y > h+20) continue;
    ctx.strokeStyle='rgba(255,251,205,.90)'; ctx.lineWidth=5;
    ctx.beginPath();ctx.moveTo(center(group.min),group.y);ctx.lineTo(center(group.max),group.y);ctx.stroke();
  }

  for (const {note,headY,tailY} of visible) {
    const x = center(note.lane);
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
    if (note.status === 'pending') drawNote(x,headY,radius,note.holdMs>0,compact);
  }

  ctx.save();
  ctx.shadowColor=rgba(currentTheme.accent,.55);ctx.shadowBlur=8;
  ctx.strokeStyle='rgba(236,231,204,.76)';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(center(0),hitY);ctx.lineTo(center(5),hitY);ctx.stroke();
  ctx.restore();
  const effectTime=performance.now();
  for (let i=hitEffects.length-1;i>=0;i--) {
    const effect=hitEffects[i], progress=(effectTime-effect.started)/(compact ? 500 : 700);
    if (progress>=1) hitEffects.splice(i,1);
    else if (effect.unmatched) {
      ctx.save();ctx.globalAlpha=(1-progress)*.7;ctx.strokeStyle='#ffd0bd';ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(center(effect.lane),hitY,radius*(.55+progress),0,Math.PI*2);ctx.stroke();ctx.restore();
    } else paintHit(ctx,currentTheme,center(effect.lane),hitY,radius,progress,compact);
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
    if (!coarseQuery?.matches) {
      const keyWidth=Math.min(25,laneWidth*.55);
      ctx.fillStyle='rgba(247,246,239,.94)';roundRect(x-keyWidth/2,hitY+27,keyWidth,23,3);ctx.fill();
      ctx.fillStyle='#2b3340';ctx.font='700 12px "Microsoft YaHei",sans-serif';
      ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(keyLabel(keys[lane]),x,hitY+39);
    }
  }
  ctx.restore();
}
function stageIsVisible() {
  return !document.hidden && $('homeView')?.hidden !== false && $('libraryView')?.hidden !== false;
}
function scheduleStageFrame() {
  if (stageFrameQueued || !stageIsVisible()) return;
  stageFrameQueued=true;
  requestAnimationFrame(frame);
}
function frame() {
  stageFrameQueued=false;
  if (!stageIsVisible()) return;
  let now = isPlaying ? songTime() : previewMs;
  if (isPlaying) {
    const previousMisses = session.misses;
    session.tick(now);
    if (session.misses > previousMisses) flash('漏击', 'miss');
    if (now >= endMs) { completePass(); now = isPlaying ? songTime() : endMs; }
    updateStats();
  }
  renderStage(now); updateTime(now);
  scheduleStageFrame();
}

els.theme.addEventListener('change',() => { applyTheme(els.theme.value); els.theme.blur(); });
els.drawerToggle.addEventListener('click',() => setDrawerOpen(els.drawer.hidden));
els.drawerClose.addEventListener('click',() => { setDrawerOpen(false); els.drawerToggle.focus(); });
els.play.addEventListener('click',togglePlay);
els.restart.addEventListener('click',() => { resetSession(); setMessage('已回到片段起点。',true); });
$('seekBack10')?.addEventListener('click',()=>seekPractice((isPlaying?songTime():previewMs)-10000));
$('seekForward10')?.addEventListener('click',()=>seekPractice((isPlaying?songTime():previewMs)+10000));
els.quickToggle?.addEventListener('click',()=>setQuickMenu(els.quickMenu.hidden));
$('markRangeA')?.addEventListener('click',()=>setRangeAtCurrent('A'));
$('markRangeB')?.addEventListener('click',()=>setRangeAtCurrent('B'));
$('clearRange')?.addEventListener('click',resetRange);
document.addEventListener('click',event=>{if (els.quickMenu && !els.quickMenu.hidden && !event.target?.closest?.('.quick-range-wrap')) setQuickMenu(false);});
els.resultOpen?.addEventListener('click',showResult);
els.resultClose?.addEventListener('click',closeResult);
els.resultDone?.addEventListener('click',closeResult);
els.timelineSeek?.addEventListener('input',()=>{seeking=true;updateTime(Number(els.timelineSeek.value),true);});
els.timelineSeek?.addEventListener('change',()=>seekPractice(Number(els.timelineSeek.value)));
els.timelineSeek?.addEventListener('keydown',event=>{if(event.code==='ArrowLeft'||event.code==='ArrowRight'){event.preventDefault();event.stopPropagation();seekPractice(Number(els.timelineSeek.value)+(event.code==='ArrowLeft'?-10000:10000));}});
els.start.addEventListener('input',handleRange);
els.end.addEventListener('input',handleRange);
els.loop.addEventListener('change',() => { if (isPlaying) pause(); resetSession(); });
els.scroll.addEventListener('input',() => {
  scrollRate=Number(els.scroll.value); els.scrollLabel.textContent=scrollRate.toFixed(1)+'×';
  try { localStorage.setItem('romm-trainer-scroll',String(scrollRate)); } catch {}
});
els.hitVolume?.addEventListener('input',()=>{
  hitSound.setVolume(els.hitVolume.value);
  if (els.hitVolumeLabel) els.hitVolumeLabel.textContent=hitSound.getVolume()+'%';
  if (hitSound.getVolume()>0) hitSound.unlock();
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
$('songButton').addEventListener('click',()=>void useSong());
els.onlineButton.addEventListener('click',()=>void useOnline());
els.metronomeButton.addEventListener('click',useMetronome);
els.musicStart.addEventListener('change',()=>{
  if (isPlaying) pause();
  const value = Number(els.musicStart.value);
  musicStart = Number.isFinite(value) ? Math.max(0, Math.min(Number(els.musicStart.max), value)) : 0;
  els.musicStart.value = String(musicStart);
  resetSession();
  setMessage('音源起点已调整为 ' + musicStart.toFixed(2) + ' 秒，谱面已回到片段起点。', true);
});
els.chartFile.addEventListener('change',async()=>{ await importChart(els.chartFile.files[0]); els.chartFile.value=''; });
els.audioFile.addEventListener('change',()=>{
  const file=els.audioFile.files[0];
  if (file) {
    const selectedSong=sourceType === 'song' ? currentSong : null;
    const selectedId=selectionId;
    const url=URL.createObjectURL(file), expectedDuration=chart.durationMs;
    if (selectedSong && els.rememberAudio?.checked) {
      const cleanup=()=>{localAudio.removeEventListener('loadedmetadata',loaded); localAudio.removeEventListener('error',failed);};
      const isCurrent=()=>audio === localAudio && localAudio.src === url && selectionId === selectedId && currentSong === selectedSong;
      const loaded=async()=>{
        cleanup();
        if (!isCurrent()) return;
        if (!Number.isFinite(localAudio.duration) || localAudio.duration * 1000 + 50 < expectedDuration) {
          setSavedAudioStatus('音频短于谱面，未保存到本设备。');
          return;
        }
        try {
          await localAudioStore.put(selectedSong.id || selectedSong.chartUrl,file);
          if (isCurrent()) {
            setSavedAudioStatus('已保存在本设备：' + file.name);
            if (els.forgetAudio) els.forgetAudio.hidden=false;
          }
        } catch { if (isCurrent()) setSavedAudioStatus('本次可播放，但未能保存到本设备。'); }
      };
      const failed=()=>{cleanup(); if (isCurrent()) setSavedAudioStatus('音频无法读取，未保存到本设备。');};
      localAudio.addEventListener('loadedmetadata',loaded);
      localAudio.addEventListener('error',failed);
    }
    replaceAudio(url); setMessage('正在读取本地音频…',true,0);
  }
  els.audioFile.value='';
});
els.forgetAudio?.addEventListener('click',async()=>{
  if (sourceType !== 'song') return;
  const song=currentSong, selectedId=selectionId;
  try {
    await localAudioStore.remove(song.id || song.chartUrl);
    if (selectionId !== selectedId || currentSong !== song) return;
    els.forgetAudio.hidden=true;
    setSavedAudioStatus('已删除保存的音频；当前已载入的音频仍可播放。');
  } catch { setMessage('未能删除本地音频，请稍后重试。',false); }
});
function pressLane(lane, inputId) {
  if (!isPlaying || activeInputs.has(inputId)) return;
  activeInputs.set(inputId,lane);
  hitSound.play();
  if (held.has(lane)) return;
  held.add(lane);
  const songMs=songTime();
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
}
function releaseInput(inputId) {
  const lane=activeInputs.get(inputId);
  if (lane === undefined) return;
  activeInputs.delete(inputId);
  if ([...activeInputs.values()].includes(lane)) return;
  if (held.delete(lane)) {
    const note=session.release(lane,isPlaying ? songTime() : previewMs);
    if (note && note.status === 'miss') flash('长按提前松开','miss');
    updateStats();
  }
}
for (let lane=0; lane<6; lane++) {
  const button=$('touchLane'+lane);
  if (!button) continue;
  button.addEventListener('pointerdown', event => {
    if (!isPlaying || (event.pointerType === 'mouse' && event.button !== 0)) return;
    event.preventDefault();
    pressLane(lane,'pointer:'+event.pointerId);
    try { button.setPointerCapture(event.pointerId); } catch { /* Older browsers may not support capture. */ }
  });
  const release = event => { event.preventDefault(); releaseInput('pointer:'+event.pointerId); };
  button.addEventListener('pointerup',release);
  button.addEventListener('pointercancel',release);
  button.addEventListener('lostpointercapture',release);
  button.addEventListener('contextmenu',event=>event.preventDefault());
}
window.addEventListener('keydown',(event) => {
  if (els.resultDialog?.open) return;
  if ($('libraryView')?.hidden === false) return;
  if ($('homeView')?.hidden === false && els.drawer.hidden) return;
  if (bindingIndex !== -1) {
    event.preventDefault();
    if (event.code === 'Escape') { bindingIndex=-1; setKeyHelp('已取消修改'); renderKeys(); return; }
    if (!/^(Key[A-Z]|Digit[0-9])$/.test(event.code)) { setKeyHelp('请使用字母或数字键'); return; }
    if (keys.includes(event.code) && keys[bindingIndex] !== event.code) { setKeyHelp('这个按键已分配给其他轨道'); return; }
    keys[bindingIndex]=event.code; bindingIndex=-1; setKeyHelp('键位已保存');
    try { localStorage.setItem('romm-trainer-keys',JSON.stringify(keys)); } catch {}
    renderKeys(); return;
  }
  if (event.code === 'Escape' && !els.drawer.hidden) { event.preventDefault(); setDrawerOpen(false); els.drawerToggle.focus(); return; }
  if (event.code === 'Escape' && els.quickMenu && !els.quickMenu.hidden) { event.preventDefault(); setQuickMenu(false); els.quickToggle.focus(); return; }
  if ($('homeView')?.hidden === false) return;
  if (event.target instanceof HTMLElement && /^(INPUT|SELECT|TEXTAREA)$/.test(event.target.tagName)) return;
  if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {event.preventDefault();if (!event.repeat) seekPractice((isPlaying?songTime():previewMs)+(event.code==='ArrowLeft'?-10000:10000));return;}
  if (event.code === 'Space') { if (event.target instanceof HTMLElement && /^(BUTTON|A)$/.test(event.target.tagName)) return; event.preventDefault(); if (!event.repeat) togglePlay(); return; }
  const lane=keys.indexOf(event.code);
  if (lane < 0 || event.repeat || !isPlaying) return;
  event.preventDefault();
  pressLane(lane,'key:'+event.code);
});
window.addEventListener('romm:library-open',()=>{ if (isPlaying) pause(); if (playPending) stopAudio(); setQuickMenu(false); setDrawerOpen(false); });
window.addEventListener('romm:select-song',event=>{ if (event.detail?.status === 'ready' && event.detail.chartUrl) void useSong(event.detail); });
window.addEventListener('romm:show-home',()=>{ if (isPlaying) pause(); if (playPending) stopAudio(); setQuickMenu(false); setDrawerOpen(false); });
window.addEventListener('romm:home-demo',useDemo);
window.addEventListener('romm:open-settings',()=>{ setDrawerOpen(true); els.drawerClose.focus(); });
window.addEventListener('romm:practice-visible',scheduleStageFrame);
window.addEventListener('romm:language-changed',()=>{
  updateMeta(); renderKeys(); setPlayText(lastPlayText); setKeyHelp(lastKeyHelp);
  setSavedAudioStatus(lastSavedAudioStatus);
  els.message.textContent=lastMessageEn === null ? translate(lastMessage) : tr(lastMessage,lastMessageEn,lastMessageJa ?? undefined); els.feedback.textContent=translate(lastFeedback);
  els.songAudioStatus.textContent=translate(audioMode === 'online' ? '在线原声 · 同步待校准' : audioMode === 'metronome' ? '节拍伴奏 · 无歌曲原声' : '本地音频');
  updateAudioBadge(); renderResult();
  const label=$('onlineTrackLabel');
  if (label && sourceType === 'song') label.textContent=tr('官方原声专辑 · 《' + currentSong.title + '》', 'Official soundtrack · ' + songName(currentSong), '公式サウンドトラック · ' + songName(currentSong));
});
window.addEventListener('keyup',event=>releaseInput('key:'+event.code));
window.addEventListener('blur',()=>{ if (playPending) stopAudio(); if (isPlaying) { pause(); releaseHeldAt(previewMs); updateStats(); setMessage('窗口失去焦点，练习已暂停。'); } });
document.addEventListener('visibilitychange',()=>{ if (document.hidden && playPending) stopAudio(); if (document.hidden && isPlaying) { pause(); releaseHeldAt(previewMs); updateStats(); } if (!document.hidden) scheduleStageFrame(); });

initLanguage(); renderKeys(); updateMeta(); refreshRangeUi(); updateStats(); updateTime(0);
replaceAudio(makeDemoAudio(), 'demo');
scheduleStageFrame();
