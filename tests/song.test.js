import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateChart } from '../dist/src/chart.js';

test('the Surasthana chart preserves the six-lane taps and holds', async () => {
  const raw = JSON.parse(await readFile(new URL('../dist/data/surasthana-legend.json', import.meta.url), 'utf8'));
  const chart = validateChart(raw);
  assert.equal(chart.bpm, 168);
  assert.equal(chart.durationMs, 95000);
  assert.equal(chart.notes.length, 231);
  assert.equal(chart.notes.filter(note => note.holdMs > 0).length, 45);
  assert.deepEqual(chart.notes.reduce((counts,note) => { counts[note.lane]++; return counts; }, [0,0,0,0,0,0]), [22,37,50,54,41,27]);
  const {atMs, lane, holdMs} = chart.notes[0];
  assert.deepEqual({atMs, lane, holdMs}, {atMs:4405, lane:2, holdMs:535});
  assert.equal(chart.notes.at(-1).atMs, 92976);
});
