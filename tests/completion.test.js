import test from 'node:test';
import assert from 'node:assert/strict';
import { validateChart } from '../dist/src/chart.js';
import { Judge } from '../dist/src/judge.js';

const chart=validateChart({version:1,title:'completion',durationMs:4000,bpm:120,laneCount:6,notes:[
  {atMs:1000,lane:0,holdMs:0}, {atMs:2000,lane:1,holdMs:1000}
]});

test('manual taps and sustained holds both add to completion, without double counting', () => {
  const j=new Judge(chart,0,4000);
  assert.equal(j.maxScore,50);
  j.tick(900); assert.equal(j.completion,0);
  j.press(0,1000); assert.equal(j.score,20); assert.equal(j.completion,40);
  j.press(0,1000); assert.equal(j.score,20);
  j.press(1,2000); assert.equal(j.score,40); assert.equal(j.completion,80);
  j.tick(2500); assert.equal(j.score,45); assert.equal(j.completion,90);
  j.tick(2500); j.tick(2400); assert.equal(j.score,45);
  j.tick(3000); assert.equal(j.score,50); assert.equal(j.completion,100);
  j.tick(3500); assert.equal(j.score,50);
});

test('timing affects head score, and an early release retains only earned sustain', () => {
  const j=new Judge(chart,0,4000);
  j.press(0,1060); assert.equal(j.score,10);
  j.press(1,2000); j.release(1,2500);
  assert.equal(j.score,35); assert.equal(j.completion,70);
  assert.equal(j.states[1].status,'miss');
  j.tick(4000); assert.equal(j.score,35);
});

test('the default release window completes a held note without losing the tail', () => {
  const j=new Judge(chart,0,4000);
  j.press(0,1000); j.press(1,2000); j.release(1,2820);
  assert.equal(j.score,50); assert.equal(j.completion,100);
});

test('release tolerance follows the adjustable window and early release preserves earned points', () => {
  const strict=new Judge(chart,0,4000,1,0,130);
  strict.press(1,2000); strict.release(1,2850);
  assert.equal(strict.states[1].status,'miss');
  assert.ok(strict.score>20 && strict.score<30);
  const wide=new Judge(chart,0,4000,1,0,220);
  wide.press(1,2000); wide.release(1,2800);
  assert.equal(wide.states[1].status,'hit');
  assert.equal(wide.score,30);
});

test('missing all notes earns nothing, and a selected section has its own full score', () => {
  const missed=new Judge(chart,0,4000);
  missed.tick(4000); assert.equal(missed.completion,0); assert.equal(missed.score,0);
  const section=new Judge(chart,1500,4000);
  assert.equal(section.maxScore,30);
  section.press(1,2000); section.tick(3000);
  assert.equal(section.completion,100);
});

test('hold scoring follows song time under speed and offset adjustments', () => {
  const j=new Judge(chart,0,4000,.5,20);
  j.press(0,1010); j.press(1,2010); j.tick(2510);
  assert.equal(j.score,45); assert.equal(j.completion,90);
});
