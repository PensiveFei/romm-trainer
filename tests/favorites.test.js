import test from 'node:test';
import assert from 'node:assert/strict';
import { createFavorites, FAVORITES_KEY } from '../dist/src/favorites.js';

test('favorites persist across sessions and can be removed',()=>{
  const data=new Map();
  const storage={getItem:key=>data.get(key) ?? null,setItem:(key,value)=>data.set(key,value)};
  const first=createFavorites(storage);
  assert.deepEqual(first.toggle('_GMusic16'),{favorite:true,saved:true});
  first.toggle('_GMusic103');
  const second=createFavorites(storage);
  assert.equal(second.has('_GMusic16'),true);
  assert.equal(second.has('_GMusic103'),true);
  assert.deepEqual(second.toggle('_GMusic16'),{favorite:false,saved:true});
  assert.equal(createFavorites(storage).has('_GMusic16'),false);
  assert.deepEqual(JSON.parse(data.get(FAVORITES_KEY)),['_GMusic103']);
});

test('invalid stored values and blocked storage do not break the library',()=>{
  const storage={getItem:()=>'{broken',setItem:()=>{throw Error('blocked');}};
  const items=createFavorites(storage);
  assert.deepEqual(items.values(),[]);
  assert.deepEqual(items.toggle('_GMusic16'),{favorite:true,saved:false});
  assert.equal(items.has('_GMusic16'),true);
  assert.deepEqual(items.toggle('bad id'),{favorite:false,saved:false});
});
