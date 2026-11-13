import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateChart } from '../dist/src/chart.js';
import { Judge } from '../dist/src/judge.js';
import { stageLayout } from '../dist/src/stage-layout.js';
import { chartIdentity } from '../dist/src/practice-results.js';

test('four-key charts validate and judge chords and holds, rejecting out-of-range lanes', async () => {
  const input = JSON.parse(await readFile(new URL('../examples/four-key-chart.json', import.meta.url)));
  const chart = validateChart(input);
  assert.equal(chart.laneCount, 4);
  const judge = new Judge(chart, 0, chart.durationMs);
  assert.ok(judge.press(0, 4000)); assert.ok(judge.press(3, 4000));
  assert.equal(judge.release(0, 5000).status, 'hit');
  assert.equal(judge.hits, 2);
  assert.throws(() => validateChart({...input, notes:[{atMs:2000,lane:4,holdMs:0}]}));
  assert.throws(() => validateChart({...input, laneCount:5}));
  assert.notEqual(chartIdentity('local',null,chart).chartId, chartIdentity('local',null,{...chart,laneCount:6}).chartId);
});

test('four- and six-lane layouts use the same full stage width', () => {
  for (const portrait of [true, false]) {
    const four=stageLayout(800,700,portrait,4), six=stageLayout(800,700,portrait,6);
    assert.equal(four.left, six.left);
    assert.equal(four.laneWidth * 4, six.laneWidth * 6);
  }
});
