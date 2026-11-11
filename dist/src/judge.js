// Judgements and scoring are a trainer approximation, not a claim of game parity.
const PRECISE_POINTS = 20, GOOD_POINTS = 10, HOLD_POINTS_PER_BEAT = 5;
export const DEFAULT_HIT_WINDOW_MS = 180;
export class Judge {
  constructor(chart, startMs, endMs, rate = 1, offsetMs = 0, hitWindowMs = DEFAULT_HIT_WINDOW_MS) {
    this.startMs = startMs;
    this.endMs = endMs;
    this.rate = rate;
    this.offsetMs = offsetMs;
    this.hitWindowMs = Number.isFinite(hitWindowMs) ? Math.max(120, Math.min(240, hitWindowMs)) : DEFAULT_HIT_WINDOW_MS;
    this.states = chart.notes.filter(n => n.atMs >= startMs && n.atMs < endMs && n.atMs + n.holdMs <= endMs)
      .map(n => ({ ...n, status: 'pending', errorMs: null, grade: null }));
    this.hits = 0; this.misses = 0; this.early = 0; this.late = 0; this.combo = 0; this.maxCombo = 0;
    this.holdPointsPerMs = HOLD_POINTS_PER_BEAT / (60000 / (chart.bpm || 120));
    this.maxScore = this.states.reduce((total,note) => total + PRECISE_POINTS + note.holdMs * this.holdPointsPerMs, 0);
    this.score = 0;
  }
  get completion() { return this.maxScore > 0 ? Math.min(100, this.score / this.maxScore * 100) : 0; }
  creditHold(note, correctedMs) {
    const playedMs = Math.max(0, Math.min(note.holdMs, correctedMs - note.atMs));
    const creditedMs = note.creditedHoldMs || 0;
    if (playedMs > creditedMs) {
      this.score += (playedMs - creditedMs) * this.holdPointsPerMs;
      note.creditedHoldMs = playedMs;
    }
  }
  correctedTime(songMs) { return songMs - this.offsetMs * this.rate; }
  realError(songMs, noteMs) { return (this.correctedTime(songMs) - noteMs) / this.rate; }
  timingHint(lane, songMs) {
    let closest = null;
    for (const note of this.states) {
      if (note.lane !== lane || (note.status !== 'pending' && note.status !== 'miss')) continue;
      const error = this.realError(songMs, note.atMs);
      if (note.status === 'miss' && error <= 0) continue;
      if (Math.abs(error) <= 600 && (closest === null || Math.abs(error) < Math.abs(closest))) closest = error;
    }
    return closest;
  }
  finish(state) {
    if (state.status === 'hit' || state.status === 'miss') return;
    state.status = 'hit'; this.hits++; this.combo++; this.maxCombo = Math.max(this.combo, this.maxCombo);
    if (state.errorMs < -30) this.early++;
    if (state.errorMs > 30) this.late++;
  }
  miss(state) {
    if (state.status === 'hit' || state.status === 'miss') return;
    state.status = 'miss'; state.grade = 'miss'; this.misses++; this.combo = 0;
  }
  tick(songMs) {
    const now = this.correctedTime(songMs);
    for (const note of this.states) {
      if (note.status === 'pending' && this.realError(songMs, note.atMs) > this.hitWindowMs) this.miss(note);
      if (note.status === 'holding') {
        this.creditHold(note, now);
        if (now >= note.atMs + note.holdMs) this.finish(note);
      }
    }
  }
  press(lane, songMs) {
    this.tick(songMs);
    if (this.states.some(n => n.lane === lane && n.status === 'holding')) return null;
    let best = null, error = Infinity;
    for (const note of this.states) {
      if (note.lane !== lane || note.status !== 'pending') continue;
      const e = this.realError(songMs, note.atMs);
      if (Math.abs(e) <= this.hitWindowMs && Math.abs(e) < Math.abs(error)) { best = note; error = e; }
    }
    if (!best) return null;
    best.errorMs = error;
    best.grade = Math.abs(error) <= 55 ? 'precise' : 'good';
    this.score += best.grade === 'precise' ? PRECISE_POINTS : GOOD_POINTS;
    if (best.holdMs > 0) { best.status = 'holding'; this.creditHold(best, this.correctedTime(songMs)); }
    else this.finish(best);
    return best;
  }
  release(lane, songMs) {
    const note = this.states.find(n => n.lane === lane && n.status === 'holding');
    if (!note) return null;
    const correctedMs = this.correctedTime(songMs);
    const remainingRealMs = (note.atMs + note.holdMs - correctedMs) / this.rate;
    this.creditHold(note, correctedMs);
    if (remainingRealMs > this.hitWindowMs) this.miss(note);
    else { this.creditHold(note, note.atMs + note.holdMs); this.finish(note); }
    return note;
  }
  finishRemaining() {
    for (const note of this.states) if (note.status === 'pending' || note.status === 'holding') this.miss(note);
  }
}
