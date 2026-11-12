import test from 'node:test';
import assert from 'node:assert/strict';

test('language selection translates interface text without replacing interactive content and survives reload', async (t) => {
  const old={document:globalThis.document, window:globalThis.window, localStorage:globalThis.localStorage};
  t.after(()=>Object.assign(globalThis,old));
  const stored=new Map();
  globalThis.localStorage={getItem:key=>stored.get(key) ?? null,setItem:(key,value)=>stored.set(key,value)};
  const events=[];
  globalThis.window={dispatchEvent:event=>events.push(event.type)};
  const text=(value)=>({nodeValue:value,parentElement:{closest:()=>null}});
  const nodes=[text('练习模式'),text('《原神》'),text('Custom chart title')];
  const attributes=new Map([['aria-label','练习设置'],['title','练习设置']]);
  const link={hasAttribute:name=>attributes.has(name),getAttribute:name=>attributes.get(name),setAttribute:(name,value)=>attributes.set(name,value)};
  const listeners={};
  const select={value:'',addEventListener:(name,fn)=>{listeners[name]=fn;}};
  globalThis.document={body:{},documentElement:{},title:'',getElementById:id=>id==='languageSelect'?select:null,
    createTreeWalker(){let index=-1;return {get currentNode(){return nodes[index];},nextNode(){return ++index<nodes.length;}};},
    querySelectorAll:()=>[link]};
  const i18n=await import('../dist/src/i18n.js?language-test');
  i18n.initLanguage();
  assert.equal(select.value,'zh-CN');
  select.value='en'; listeners.change();
  assert.equal(stored.get('romm-trainer-language'),'en');
  assert.equal(document.documentElement.lang,'en');
  assert.equal(nodes[0].nodeValue,'Practice Mode');
  assert.equal(nodes[1].nodeValue,'Genshin Impact');
  assert.equal(nodes[2].nodeValue,'Custom chart title');
  assert.equal(attributes.get('aria-label'),'Practice Settings');
  assert.equal(i18n.translate('未命中 · 过早 300 ms'),'Miss · too early 300 ms');
  assert.equal(i18n.songName({title:'净善的遐歌',titleEn:'Surasthana Fantasia'}),'Surasthana Fantasia');
  assert.equal(i18n.songName({title:'自定义曲目'}),'自定义曲目');
  assert.deepEqual(events,['romm:language-changed']);

  const reloaded=await import('../dist/src/i18n.js?language-reload-test');
  assert.equal(reloaded.getLanguage(),'en');
  select.value='zh-CN'; listeners.change();
  assert.equal(nodes[0].nodeValue,'练习模式');
  assert.equal(nodes[1].nodeValue,'《原神》');
  assert.equal(attributes.get('aria-label'),'练习设置');
  assert.equal(document.documentElement.lang,'zh-CN');
});

test('blocked browser storage falls back safely to an in-memory preference', async (t) => {
  const old={document:globalThis.document,window:globalThis.window,localStorage:globalThis.localStorage};
  t.after(()=>Object.assign(globalThis,old));
  globalThis.document=undefined; globalThis.window=undefined;
  globalThis.localStorage={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};
  const i18n=await import('../dist/src/i18n.js?blocked-storage-test');
  assert.equal(i18n.getLanguage(),'zh-CN');
  i18n.setLanguage('en');
  assert.equal(i18n.translate('开始练习'),'Start Practice');
  i18n.setLanguage('unexpected');
  assert.equal(i18n.getLanguage(),'zh-CN');
});
