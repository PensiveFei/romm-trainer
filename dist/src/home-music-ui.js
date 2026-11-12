import { createBackgroundMusic } from './background-music.js';
import { tr } from './i18n.js';

const $ = id => document.getElementById(id);
const home = $('homeView'), library = $('libraryView');
const buttons = [$('homeMusicToggle'), $('libraryMusicToggle')];
const volume = $('backgroundMusicVolume'), volumeLabel = $('backgroundMusicVolumeLabel');
let previewOpen = false, storage;
try { storage = globalThis.localStorage; } catch { /* Playback does not depend on storage. */ }
const active = () => !document.hidden && !previewOpen && (!home.hidden || !library.hidden);

function render({enabled, volume: level, state}) {
  let label;
  if (previewOpen) label = tr('试听曲目时背景音乐暂停', 'Background music pauses during previews', '試聴中はBGMを停止します');
  else if (state === 'playing' || state === 'loading') label = tr('暂停背景音乐：梦之咏叹', 'Pause background music: Dream Aria', 'BGMを停止：夢のアリア');
  else if (state === 'error') label = tr('背景音乐暂不可用，点击重试', 'Background music unavailable; retry', 'BGMを再試行');
  else label = tr('播放背景音乐：梦之咏叹', 'Play background music: Dream Aria', 'BGMを再生：夢のアリア');
  for (const button of buttons) {
    button.title = label;
    button.setAttribute('aria-label', label);
    button.setAttribute('aria-pressed', String(enabled && (state === 'playing' || state === 'loading')));
    button.dataset.state = previewOpen ? 'paused' : state;
    button.disabled = previewOpen;
  }
  volume.value = String(level);
  volumeLabel.textContent = level + '%';
}

const music = createBackgroundMusic({audio: new Audio(), storage, isActive: active, onChange: render});
render(music.snapshot());
function toggle() {
  const {enabled, state} = music.snapshot();
  if (!enabled) music.setEnabled(true);
  else if (state === 'playing' || state === 'loading') music.setEnabled(false);
  else void music.start();
}
buttons.forEach(button => button.addEventListener('click', toggle));
volume.addEventListener('input', () => music.setVolume(volume.value));

// Audible autoplay can be blocked until a real user gesture. Keep the button
// available for retry, and never start music when a gesture opens a preview.
function onGesture(event) {
  if (event.target?.closest?.('.background-music-toggle, .library-audio-preview')) return;
  if (active() && music.snapshot().enabled) void music.start();
}
document.addEventListener('pointerdown', onGesture, true);
document.addEventListener('keydown', onGesture, true);
window.addEventListener('romm:practice-visible', () => music.suspend());
window.addEventListener('romm:show-home', () => {if (active()) void music.start();});
window.addEventListener('romm:library-open', () => {if (active()) void music.start();});
window.addEventListener('romm:audio-preview-start', () => {previewOpen = true; music.suspend();});
window.addEventListener('romm:audio-preview-end', () => {previewOpen = false; render(music.snapshot()); if (active()) void music.start();});
window.addEventListener('romm:language-changed', () => render(music.snapshot()));
document.addEventListener('visibilitychange', () => {if (active()) void music.start(); else music.suspend();});
window.addEventListener('pagehide', () => music.suspend());
if (active()) void music.start();
