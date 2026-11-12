import test from 'node:test';
import assert from 'node:assert/strict';
import { firstUnfinishedNote, visibleStageNotes } from '../dist/src/stage-visibility.js';

test('visible notes include chords and long holds whose heads passed the screen', () => {
  const notes = [
    {atMs:0,lane:0,holdMs:0,status:'hit'},
    {atMs:1000,lane:1,holdMs:5000,status:'holding'},
    {atMs:1800,lane:2,holdMs:0,status:'pending'},
    {atMs:1800,lane:4,holdMs:0,status:'pending'},
    {atMs:10000,lane:5,holdMs:0,status:'pending'},
  ];
  const first = firstUnfinishedNote(notes);
  const visible = visibleStageNotes(notes, first, 2500, 600, 720, 12, .1);
  assert.equal(first, 1);
  assert.deepEqual(visible.map(item => item.note.lane), [1,2,4]);
  assert.ok(visible[0].headY > 720 && visible[0].tailY < 720);
  notes[1].status='hit'; notes[2].status='miss'; notes[3].status='hit';
  assert.equal(firstUnfinishedNote(notes, first), 4);
});

test('future notes outside the view are not processed', () => {
  let accessed = 0;
  const notes = Array.from({length:2000}, (_, i) => ({
    get atMs() { accessed++; return i * 100; }, lane:i % 6, holdMs:0, status:'pending',
  }));
  const visible = visibleStageNotes(notes, 0, 0, 600, 720, 12, .2);
  assert.ok(visible.length > 0);
  assert.ok(accessed < 100, 'a long chart should not be scanned in full for each frame');
});
