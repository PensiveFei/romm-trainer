import test from 'node:test';
import assert from 'node:assert/strict';
import { stageLayout } from '../dist/src/stage-layout.js';

test('portrait practice leaves room for six separate touch lanes and the score', () => {
  for (const [width, height] of [[320, 568], [390, 844], [430, 932], [320, 418]]) {
    const stage = stageLayout(width, height, true);
    assert.ok(stage.laneWidth >= 44, 'each lane remains large enough to touch');
    assert.ok(stage.left > 0 && stage.left + 6 * stage.laneWidth < width);
    assert.ok(stage.clipTop >= 145, 'incoming notes do not cover the score');
    assert.ok(stage.hitY > stage.clipTop, 'the note path remains visible');
  }
});

test('a tall portrait stage shows more upcoming music without changing desktop timing', () => {
  const portrait = stageLayout(390, 844, true);
  const landscape = stageLayout(844, 390);
  assert.ok(portrait.travelMs > landscape.travelMs);
  assert.equal(landscape.travelMs, 2200);
});
