export const BACKGROUND_MUSIC_ENABLED_KEY = 'romm-trainer-background-music-enabled';
export const BACKGROUND_MUSIC_VOLUME_KEY = 'romm-trainer-background-music-volume';
export const DREAM_ARIA_PAGE = 'https://www.bilibili.com/audio/au1659248';
const DREAM_ARIA_API = 'https://api.bilibili.com/audio/music-service-c/h5/songs/1659248';

// Resolve the official stream for the listener. Its CDN URL expires, so it is
// never baked into the site or shared between different listeners.
export async function resolveDreamAria(fetchImpl = globalThis.fetch) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetchImpl(DREAM_ARIA_API, { signal: controller.signal, credentials: 'omit' });
    if (!response.ok) throw new Error('Audio source unavailable');
    const result = await response.json();
    if (result.code !== 0 || Number(result.data?.song_id) !== 1659248 || !result.data.urls?.[0]) throw new Error('Invalid audio source');
    const url = new URL(result.data.urls[0]);
    if (url.protocol !== 'https:' || !/(^|\.)bilivideo\.(com|cn)$/i.test(url.hostname) || url.username || url.password) throw new Error('Invalid audio source');
    return url.href;
  } finally { clearTimeout(timeout); }
}

export function createBackgroundMusic({audio, resolveSource = resolveDreamAria, storage, isActive = () => true, onChange = () => {}}) {
  let enabled = true, volume = 25, state = 'idle', generation = 0, sourceReady = false, sourcePending = null, attempt = null;
  try {
    enabled = storage?.getItem(BACKGROUND_MUSIC_ENABLED_KEY) !== 'false';
    const saved = storage?.getItem(BACKGROUND_MUSIC_VOLUME_KEY);
    if (saved !== null && saved !== undefined && Number.isFinite(Number(saved))) volume = Math.max(0, Math.min(100, Number(saved)));
  } catch { /* Preferences remain available for this visit. */ }
  audio.loop = true;
  audio.volume = volume / 100;
  if (!enabled) state = 'off';
  const snapshot = () => ({enabled, volume, state});
  const update = value => {state = value; onChange(snapshot());};
  const eligible = () => enabled && isActive();
  async function prepare() {
    if (sourceReady) return;
    if (!sourcePending) {
      sourcePending = Promise.resolve().then(resolveSource).then(url => {audio.src = url; sourceReady = true;}).finally(() => {sourcePending = null;});
    }
    await sourcePending;
  }
  function suspend() {
    generation++; attempt = null; audio.pause(); update(enabled ? 'idle' : 'off');
  }
  function start() {
    if (!eligible()) return Promise.resolve(false);
    if (state === 'playing') return Promise.resolve(true);
    if (attempt) return attempt;
    const token = ++generation;
    update('loading');
    const pending = (async () => {
      try {
        // With a prepared source, call play() in the user's gesture before
        // yielding. Mobile browsers can otherwise reject audible playback.
        if (!sourceReady) await prepare();
        if (token !== generation || !eligible()) return false;
        await audio.play();
        if (token !== generation || !eligible()) {if (!eligible()) audio.pause(); return false;}
        update('playing');
        return true;
      } catch (error) {
        if (token === generation) {
          if (error?.name !== 'NotAllowedError') sourceReady = false;
          update(error?.name === 'NotAllowedError' ? 'blocked' : 'error');
        }
        return false;
      }
    })();
    attempt = pending;
    void pending.finally(() => {if (attempt === pending) attempt = null;});
    return pending;
  }
  audio.addEventListener('error', () => {
    if (!eligible()) return;
    generation++; attempt = null; sourceReady = false; update('error');
  });
  audio.addEventListener('playing', () => {
    if (!eligible()) {audio.pause(); return;}
    update('playing');
  });
  audio.addEventListener('pause', () => {
    if (audio.paused && state === 'playing' && eligible()) update('idle');
  });
  return {
    snapshot, start, suspend,
    setEnabled(value) {
      enabled = !!value;
      try { storage?.setItem(BACKGROUND_MUSIC_ENABLED_KEY, String(enabled)); } catch {}
      if (!enabled) suspend();
      else {update('idle'); void start();}
    },
    setVolume(value) {
      const n = Number(value);
      volume = Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 25;
      audio.volume = volume / 100;
      try { storage?.setItem(BACKGROUND_MUSIC_VOLUME_KEY, String(volume)); } catch {}
      onChange(snapshot());
    }
  };
}
