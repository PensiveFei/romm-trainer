const rawDemo = [
  [2000,0,0],[2500,1,0],[3000,2,0],[3500,3,0],[4000,4,0],[4500,5,0],
  [5000,0,0],[5500,2,0],[6000,3,0],[6500,5,0],
  [7000,0,0],[7000,5,0],[7500,1,0],[8000,4,0],[8500,2,0],[9000,3,0],
  [10000,0,1000],[10000,5,0],[11000,4,0],[11500,3,0],
  [12000,1,1000],[12000,4,1000],[13500,2,0],[14000,3,0],
  [15000,0,0],[15250,1,0],[15500,2,0],[15750,3,0],[16000,4,0],[16250,5,0],
  [17000,0,0],[17000,3,0],[17500,1,0],[17500,4,0],[18000,2,0],[18000,5,0],
  [19000,1,1500],[19500,4,0],[20000,3,0],[20500,5,0],[21000,0,0],[21500,2,0],
  [22000,0,1000],[22000,5,1000],[23500,1,0],[23500,4,0],
  [24000,2,0],[24250,3,0],[24500,4,0],[24750,5,0],[25000,0,0],[25250,1,0],
  [26000,0,0],[26000,5,0],[26500,1,0],[26500,4,0],[27000,2,0],[27000,3,0],
  [28000,0,1500],[28000,5,1500]
];

// Keep the chart revision aligned with the versioned app and catalog.
export function resolveChartUrl(path, moduleUrl = import.meta.url) {
  const module = new URL(moduleUrl), base = new URL('../',module);
  const url = new URL(path,base), version = module.searchParams.get('v');
  if (version && url.origin === base.origin) url.searchParams.set('v',version);
  return url.href;
}

export function validateChart(value) {
  if (!value || typeof value !== 'object' || value.version !== 1) throw new Error('谱面版本应为 1。');
  if (![4, 6].includes(value.laneCount)) throw new Error('仅支持四键或六键谱面。');
  if (!Number.isFinite(value.durationMs) || value.durationMs < 4000 || value.durationMs > 300000) throw new Error('谱面时长须为 4 秒至 5 分钟。');
  if (!Array.isArray(value.notes) || value.notes.length < 1 || value.notes.length > 5000) throw new Error('谱面需包含 1 至 5000 个音符。');
  const title = typeof value.title === 'string' ? value.title.trim().slice(0,80) : '';
  if (!title) throw new Error('谱面需要标题。');
  const notes = value.notes.map((note, index) => {
    if (!note || !Number.isFinite(note.atMs) || note.atMs < 0 || !Number.isInteger(note.lane) || note.lane < 0 || note.lane >= value.laneCount || !Number.isFinite(note.holdMs) || note.holdMs < 0 || note.atMs + note.holdMs > value.durationMs) {
      throw new Error('第 ' + (index + 1) + ' 个音符的时间、轨道或时长无效。');
    }
    return { id: index, atMs: note.atMs, lane: note.lane, holdMs: note.holdMs };
  }).sort((a,b) => a.atMs - b.atMs || a.lane - b.lane);
  const last = Array(value.laneCount).fill(null);
  for (const note of notes) {
    const prev = last[note.lane];
    if (prev && note.atMs <= prev.atMs + prev.holdMs) throw new Error('同一轨道的音符不能在同一时刻出现或与长按重叠。');
    last[note.lane] = note;
  }
  const bpm = Number.isFinite(value.bpm) && value.bpm > 0 && value.bpm <= 400 ? value.bpm : null;
  let tempoMap;
  if (value.tempoMap !== undefined) {
    if (!Array.isArray(value.tempoMap) || !value.tempoMap.length || value.tempoMap.length > 1000) throw new Error('变速信息无效。');
    tempoMap = value.tempoMap.map((entry, index) => {
      if (!entry || !Number.isFinite(entry.atMs) || entry.atMs < 0 || entry.atMs >= value.durationMs || !Number.isFinite(entry.bpm) || entry.bpm <= 0 || entry.bpm > 400 || (index === 0 && entry.atMs !== 0) || (index > 0 && entry.atMs <= value.tempoMap[index - 1].atMs)) throw new Error('变速信息的时间或速度无效。');
      return { atMs: entry.atMs, bpm: entry.bpm };
    });
  }
  const beatTimesMs = value.beatTimesMs;
  if (beatTimesMs !== undefined && (!Array.isArray(beatTimesMs) || beatTimesMs.length > 5000 || beatTimesMs.some((time, index) => !Number.isFinite(time) || time < 0 || time >= value.durationMs || (index > 0 && time <= beatTimesMs[index - 1])))) throw new Error('节拍信息无效。');
  return { version: 1, title, artist: typeof value.artist === 'string' ? value.artist.trim().slice(0,80) : '', durationMs: value.durationMs, bpm, laneCount: value.laneCount, notes, ...(tempoMap && {tempoMap}), ...(beatTimesMs && {beatTimesMs: [...beatTimesMs]}) };
}

export const demoChart = validateChart({
  version: 1,
  title: '节拍练习 · 六键',
  artist: '原创示范谱',
  durationMs: 32000,
  bpm: 120,
  laneCount: 6,
  notes: rawDemo.map(([atMs,lane,holdMs]) => ({ atMs,lane,holdMs }))
});

export function validateRange(chart, startMs, endMs) {
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || startMs < 0 || endMs > chart.durationMs || endMs - startMs < 1000) return '练习区间至少需要 1 秒。';
  if (chart.notes.some(n => n.holdMs > 0 && ((n.atMs < startMs && n.atMs + n.holdMs > startMs) || (n.atMs < endMs && n.atMs + n.holdMs > endMs)))) return '区间边界切到了长按音符，请向前或向后调整。';
  if (!chart.notes.some(n => n.atMs >= startMs && n.atMs < endMs && n.atMs + n.holdMs <= endMs)) return '这个区间没有可练习的音符。';
  return '';
}
