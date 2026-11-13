import test from 'node:test';
import assert from 'node:assert/strict';
import { localAudioOffsets } from '../dist/src/local-audio.js';

test('local audio start points are restored only for the same song and file', (t) => {
  const previous = globalThis.localStorage;
  t.after(() => { globalThis.localStorage = previous; });
  const values = new Map();
  globalThis.localStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value)
  };
  const file = {name:'soundtrack.flac', size:123456, lastModified:42};
  const anotherFile = {...file, size:123457};

  assert.equal(localAudioOffsets.get('_GMusic16', file), 0);
  localAudioOffsets.set('_GMusic16', file, 12.35);
  assert.equal(localAudioOffsets.get('_GMusic16', file), 12.35);
  assert.equal(localAudioOffsets.get('_GMusic16', anotherFile), 0);
  assert.equal(localAudioOffsets.get('_GMusic17', file), 0);
  localAudioOffsets.set('_GMusic17', anotherFile, 4);
  localAudioOffsets.remove('_GMusic16');
  assert.equal(localAudioOffsets.get('_GMusic16', file), 0);
  assert.equal(localAudioOffsets.get('_GMusic17', anotherFile), 4);
});

test('local audio start points tolerate blocked or invalid browser storage', (t) => {
  const previous = globalThis.localStorage;
  t.after(() => { globalThis.localStorage = previous; });
  const file = {name:'soundtrack.mp3', size:500, lastModified:42};
  globalThis.localStorage = {getItem:() => '{broken', setItem() { throw new Error('blocked'); }};
  assert.equal(localAudioOffsets.get('_GMusic16', file), 0);
  assert.doesNotThrow(() => localAudioOffsets.set('_GMusic16', file, 8));
  assert.doesNotThrow(() => localAudioOffsets.remove('_GMusic16'));
  assert.equal(localAudioOffsets.get('_GMusic16', file), 0);
});
