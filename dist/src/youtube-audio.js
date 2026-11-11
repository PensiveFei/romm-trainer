// YouTube's official IFrame API plays the official album; no media is copied.
const ALBUM_VIDEO = '2SvpviExw1o';
const TRACK_START_SECONDS = 2582;
let apiPromise;

function loadApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!apiPromise) {
    apiPromise = new Promise((resolve, reject) => {
      const previous = window.onYouTubeIframeAPIReady;
      const timeout = setTimeout(() => reject(new Error('在线播放器加载超时')), 20000);
      window.onYouTubeIframeAPIReady = () => {
        clearTimeout(timeout);
        if (typeof previous === 'function') previous();
        resolve(window.YT);
      };
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.onerror = () => { clearTimeout(timeout); reject(new Error('无法加载在线播放器')); };
      document.head.appendChild(script);
    }).catch(error => { apiPromise = null; throw error; });
  }
  return apiPromise;
}

export class YouTubeAudio {
  constructor(element, onState = () => {}, options = {}) {
    this.videoId = options.videoId || ALBUM_VIDEO;
    this.trackStartSeconds = options.trackStartSeconds ?? TRACK_START_SECONDS;
    this.player = null;
    this.state = -1;
    this.rate = 1;
    this.lastTime = 0;
    this.pendingSeek = null;
    this.pendingPlay = null;
    this.failed = false;
    this.destroyed = false;
    this.onState = onState;
    this.ready = loadApi().then(YT => new Promise((resolve, reject) => {
      if (this.destroyed) { reject(new Error('播放器已关闭')); return; }
      const timeout = setTimeout(() => reject(new Error('在线播放器准备超时')), 20000);
      this.player = new YT.Player(element, {
        width: '100%', height: '200', videoId: this.videoId,
        playerVars: { start: this.trackStartSeconds, playsinline: 1, origin: location.origin },
        events: {
          onReady: () => { clearTimeout(timeout); if (this.destroyed || !this.player) { reject(new Error('播放器已关闭')); return; } this.player.setPlaybackRate(this.rate); resolve(); },
          onStateChange: event => {
            if (this.destroyed) return;
            this.state = event.data;
            if (event.data === 1 && this.pendingPlay) {
              const pending = this.pendingPlay; this.pendingPlay = null;
              clearTimeout(pending.timeout); pending.resolve();
            }
            this.onState(event.data);
          },
          onError: event => {
            if (this.destroyed) return;
            clearTimeout(timeout);
            this.failed = true;
            const error = new Error('在线音源不可用（播放器错误 ' + event.data + '）');
            if (this.pendingPlay) {
              const pending = this.pendingPlay; this.pendingPlay = null;
              clearTimeout(pending.timeout); pending.reject(error);
            }
            reject(error);
            this.onState('error', error);
          }
        }
      });
    })).catch(error => { this.failed = true; throw error; });
  }

  get currentTime() {
    const value = this.player?.getCurrentTime?.();
    if (!Number.isFinite(value)) return this.lastTime;
    const time = Math.max(0, value - this.trackStartSeconds);
    // During an asynchronous seek keep the clock at its target until the
    // player reports the new position, rather than judging the old position.
    if (this.pendingSeek) {
      const elapsed = (Date.now() - this.pendingSeek.at) / 1000;
      const plausibleProgress = this.state === 1 && time >= this.pendingSeek.time - 2 && time <= this.pendingSeek.time + elapsed * this.rate + 2;
      if (Math.abs(time - this.pendingSeek.time) > 2 && !plausibleProgress && elapsed < 10) return this.lastTime;
      this.pendingSeek = null;
    }
    this.lastTime = time;
    return time;
  }
  set currentTime(value) {
    this.lastTime = Math.max(0, value);
    this.pendingSeek = { time: this.lastTime, at: Date.now() };
    this.player?.seekTo(this.trackStartSeconds + this.lastTime, true);
  }
  get paused() { return this.state !== 1; }
  set playbackRate(value) { this.rate = value; this.player?.setPlaybackRate?.(value); }
  get playbackRate() { return this.rate; }

  async play() {
    await this.ready;
    if (this.state === 1) return;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingPlay = null;
        reject(new Error('在线音源加载超时，请检查网络或切换伴奏'));
      }, 45000);
      this.pendingPlay = { resolve, reject, timeout };
      this.player.playVideo();
    });
  }
  pause() {
    if (this.pendingPlay) {
      const pending = this.pendingPlay; this.pendingPlay = null;
      clearTimeout(pending.timeout); pending.reject(new Error('播放已取消'));
    }
    this.player?.pauseVideo?.();
  }
  destroy() { this.destroyed = true; this.pause(); this.player?.destroy?.(); this.player = null; }
}
