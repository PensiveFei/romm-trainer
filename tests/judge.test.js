import test from 'node:test';
import assert from 'node:assert/strict';
import { validateChart, validateRange } from '../dist/src/chart.js';
import { Judge } from '../dist/src/judge.js';

const chart = validateChart({ version:1, title:'test', durationMs:8000, laneCount:6, notes:[
  {atMs:1000,lane:0,holdMs:0}, {atMs:1000,lane:1,holdMs:0}, {atMs:2000,lane:2,holdMs:1000}, {atMs:5000,lane:0,holdMs:0}
]});

test('simultaneous notes require separate manual inputs', () => {
  const j = new Judge(chart, 0, 8000);
  j.press(0,1000);
  assert.equal(j.hits,1);
  j.tick(1200);
  assert.equal(j.misses,1);
  assert.equal(j.states.find(n => n.lane === 1).status,'miss');
});

test('long notes require holding until the tail', () => {
  const j = new Judge(chart, 0, 8000);
  j.press(2,2000);
  assert.equal(j.hits,0);
  j.release(2,2400);
  assert.equal(j.misses,3);
  const k = new Judge(chart, 0, 8000);
  k.press(2,2000); k.tick(3000);
  assert.equal(k.hits,1);
});

test('rate scaling and offset measure the same real-world window', () => {
  const j = new Judge(chart, 0, 8000, 0.5, 20);
  const n = j.press(0,1040);
  assert.equal(Math.round(n.errorMs),60);
  assert.equal(n.grade,'good');
});

test('loop bounds reject slicing through holds and empty ranges', () => {
  assert.match(validateRange(chart,2500,5000),/长按/);
  assert.match(validateRange(chart,3100,4500),/没有/);
  assert.equal(validateRange(chart,2000,4000),'');
});

test('invalid overlapping lane inputs are rejected', () => {
  assert.throws(() => validateChart({version:1,title:'bad',durationMs:5000,laneCount:6,notes:[
    {atMs:1000,lane:0,holdMs:1000},{atMs:1500,lane:0,holdMs:0}
  ]}), /重叠/);
});

test('the default window accepts slightly early and late hits but misses outside its boundary', () => {
  for (const time of [820, 1180]) {
    const j=new Judge(chart,0,8000);
    const note=j.press(0,time);
    assert.equal(note?.grade,'good');
    assert.equal(j.hits,1);
  }
  const early=new Judge(chart,0,8000);
  assert.equal(early.press(0,819),null);
  assert.equal(early.states[0].status,'pending');
  assert.equal(early.timingHint(0,819),-181);
  const late=new Judge(chart,0,8000);
  assert.equal(late.press(0,1181),null);
  assert.equal(late.states[0].status,'miss');
  assert.equal(late.timingHint(0,1181),181);
  assert.equal(late.timingHint(5,1181),null);
});

test('adjustable timing range applies to misses and keeps real-time scaling', () => {
  const strict=new Judge(chart,0,8000,1,0,130);
  assert.equal(strict.press(0,850),null);
  assert.equal(strict.states[0].status,'pending');
  assert.equal(strict.press(0,900)?.grade,'good');
  const wide=new Judge(chart,0,8000,1,0,220);
  wide.tick(1200);
  assert.equal(wide.states[0].status,'pending');
  assert.equal(wide.press(0,1200)?.grade,'good');
  const slow=new Judge(chart,0,8000,.5,20);
  assert.equal(slow.press(0,920)?.grade,'good');
});
