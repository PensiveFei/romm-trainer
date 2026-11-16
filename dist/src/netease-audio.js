import { neteaseSecureStream, neteaseStream } from './netease-tracks.js';

// Use the provider's stream as a normal media element so the practice clock
// follows the actual playback position, including buffering and seeking.
export class NetEaseAudio {
  constructor(track, onState = () => {}, createAudio = () => new Audio()) {
    this.provider = 'netease';
    this.trackId = track.id;
    this.durationSeconds = track.durationSeconds;
    this.failed = false;
    this.destroyed = false;
    this.media = createAudio();
    this.sources = [neteaseSecureStream(track.id), neteaseStream(track.id)];
    this.sourceIndex = 0;
    this.media.preload = 'metadata';
    this.media.preservesPitch = true;
    this.settled = false;
    this.listeners = {
      loadedmetadata: () => {
        const duration = this.media.duration;
        // A restricted song can return a short preview instead of the recording.
        if (!Number.isFinite(duration) || duration + 1.5 < this.durationSeconds) {
          this.retryOrFail(new Error('音源不完整或暂不可用'));
          return;
        }
        if (!this.settled) { this.settled = true; this.resolveReady(); }
      },
      error: () => this.retryOrFail(new Error('国内音源暂不可用')),
      playing: () => { if (!this.destroyed) onState(1); },
      pause: () => { if (!this.destroyed && !this.media.ended) onState(2); },
      ended: () => { if (!this.destroyed) onState(0); },
      ratechange: () => { if (!this.destroyed) onState('ratechange', this.media.playbackRate); }
    };
    this.onState = onState;
    this.ready = new Promise((resolve, reject) => { this.resolveReady = resolve; this.rejectReady = reject; });
    for (const [name, listener] of Object.entries(this.listeners)) this.media.addEventListener(name, listener);
    this.media.src = this.sources[0];
    this.media.load();
  }

  retryOrFail(error) {
    if (this.destroyed || this.failed) return;
    if (!this.settled && this.sourceIndex + 1 < this.sources.length) {
      this.media.src = this.sources[++this.sourceIndex];
      this.media.load();
      return;
    }
    this.fail(error);
  }

  fail(error) {
    if (this.destroyed || this.failed) return;
    this.failed = true;
    if (!this.settled) { this.settled = true; this.rejectReady(error); }
    else this.onState('error', error);
  }

  get currentTime() { return this.media.currentTime || 0; }
  set currentTime(value) { this.media.currentTime = Math.max(0, value); }
  get paused() { return this.media.paused; }
  get playbackRate() { return this.media.playbackRate; }
  set playbackRate(value) { this.media.playbackRate = value; }
  get actualPlaybackRate() { return this.media.playbackRate; }
  get volume() { return this.media.volume; }
  set volume(value) { this.media.volume = Math.max(0, Math.min(1, Number(value) || 0)); }
  play() { return this.media.play(); }
  pause() { this.media.pause(); }

  // Unlock this element during the click on mobile, before the countdown.
  async unlock() {
    const muted = this.media.muted, time = this.media.currentTime;
    this.media.muted = true;
    try {
      await this.media.play();
      if (!this.destroyed) { this.media.pause(); this.media.currentTime = time; }
    } finally { this.media.muted = muted; }
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.media.pause();
    for (const [name, listener] of Object.entries(this.listeners)) this.media.removeEventListener(name, listener);
    if (!this.settled) { this.settled = true; this.rejectReady(new Error('播放器已关闭')); }
    this.media.removeAttribute('src');
    this.media.load();
  }
}
