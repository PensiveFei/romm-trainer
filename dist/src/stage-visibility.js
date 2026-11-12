// Chart states stay ordered by start time and completed states never return.
export function firstUnfinishedNote(states, index = 0) {
  while (index < states.length && (states[index].status === 'hit' || states[index].status === 'miss')) index++;
  return index;
}

export function visibleStageNotes(states, first, showTime, hitY, height, radius, pxPerMs) {
  if (!(pxPerMs > 0)) return [];
  const result = [];
  const latestVisibleStart = showTime + (hitY + Math.max(30, radius)) / pxPerMs;
  for (let i = first; i < states.length; i++) {
    const note = states[i];
    if (note.atMs > latestVisibleStart) break;
    if (note.status === 'hit' || note.status === 'miss') continue;
    const headY = hitY - (note.atMs - showTime) * pxPerMs;
    const tailY = hitY - (note.atMs + note.holdMs - showTime) * pxPerMs;
    if (headY < -radius || tailY > height + radius) continue;
    result.push({note, headY, tailY});
  }
  return result;
}
