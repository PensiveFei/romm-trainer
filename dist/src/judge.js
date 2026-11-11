// Judgements are deliberately local to this trainer, not a claim of game parity.
export class Judge {
  constructor(chart, startMs, endMs, rate = 1, offsetMs = 0) {
    this.startMs = startMs;
    this.endMs = endMs;
    this.rate = rate;
    this.offsetMs = offsetMs;
    this.states = chart.notes.filter(n => n.atMs >= startMs && n.atMs < endMs && n.atMs + n.holdMs <= endMs)
      .map(n => ({ ...n, status: 'pending', errorMs: null, grade: null }));
    this.hits = 0; this.misses = 0; this.early = 0; this.late = 0; this.combo = 0; this.maxCombo = 0;
  }
  correctedTime(songMs) { return songMs - this.offsetMs * this.rate; }
  realError(songMs, noteMs) { return (this.correctedTime(songMs) - noteMs) / this.rate; }
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
      if (note.status === 'pending' && this.realError(songMs, note.atMs) > 130) this.miss(note);
      if (note.status === 'holding' && now >= note.atMs + note.holdMs) this.finish(note);
    }
  }
  press(lane, songMs) {
    this.tick(songMs);
    if (this.states.some(n => n.lane === lane && n.status === 'holding')) return null;
    let best = null, error = Infinity;
    for (const note of this.states) {
      if (note.lane !== lane || note.status !== 'pending') continue;
      const e = this.realError(songMs, note.atMs);
      if (Math.abs(e) <= 130 && Math.abs(e) < Math.abs(error)) { best = note; error = e; }
    }
    if (!best) return null;
    best.errorMs = error;
    best.grade = Math.abs(error) <= 55 ? 'precise' : 'good';
    if (best.holdMs > 0) best.status = 'holding';
    else this.finish(best);
    return best;
  }
  release(lane, songMs) {
    const note = this.states.find(n => n.lane === lane && n.status === 'holding');
    if (!note) return null;
    const remainingRealMs = (note.atMs + note.holdMs - this.correctedTime(songMs)) / this.rate;
    if (remainingRealMs > 100) this.miss(note);
    else this.finish(note);
    return note;
  }
  finishRemaining() {
    for (const note of this.states) if (note.status === 'pending' || note.status === 'holding') this.miss(note);
  }
}
