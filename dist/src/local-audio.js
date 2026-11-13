// User-selected files stay in this browser's storage and are never uploaded.
let databasePromise;
function database() {
  if (!globalThis.indexedDB) return Promise.reject(new Error('浏览器不支持本地存储'));
  if (!databasePromise) databasePromise = new Promise((resolve,reject) => {
    const request = indexedDB.open('romm-trainer-audio',1);
    request.onupgradeneeded = () => request.result.createObjectStore('tracks');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('无法打开本地存储'));
    request.onblocked = () => reject(new Error('本地存储被占用'));
  }).catch(error => { databasePromise = null; throw error; });
  return databasePromise;
}
async function transact(mode,operation) {
  const db=await database();
  return new Promise((resolve,reject) => {
    const tx=db.transaction('tracks',mode);
    const request=operation(tx.objectStore('tracks'));
    tx.oncomplete=()=>resolve(request.result);
    tx.onerror=()=>reject(tx.error || new Error('本地音频存取失败'));
    tx.onabort=()=>reject(tx.error || new Error('本地音频存取失败'));
  });
}
export const localAudioStore = {
  get: key => transact('readonly',store=>store.get(key)),
  put: (key,file) => transact('readwrite',store=>store.put(file,key)),
  remove: key => transact('readwrite',store=>store.delete(key))
};

const OFFSET_KEY = 'romm-trainer-local-audio-offsets';
function fileIdentity(file) {
  if (!file || !Number.isFinite(file.size)) return null;
  return JSON.stringify([file.name || '', file.size, Number.isFinite(file.lastModified) ? file.lastModified : null]);
}
function offsets() {
  try {
    const value = JSON.parse(globalThis.localStorage?.getItem(OFFSET_KEY) || '{}');
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch { return {}; }
}
export const localAudioOffsets = {
  get(key, file) {
    const identity = fileIdentity(file);
    if (!key || !identity) return 0;
    const entry = offsets()['song:' + key];
    return entry?.file === identity && Number.isFinite(entry.seconds) && entry.seconds >= 0 && entry.seconds <= 120 ? entry.seconds : 0;
  },
  set(key, file, seconds) {
    const identity = fileIdentity(file);
    if (!key || !identity || !Number.isFinite(seconds) || seconds < 0 || seconds > 120) return;
    try {
      const saved = offsets();
      saved['song:' + key] = {file:identity, seconds};
      globalThis.localStorage?.setItem(OFFSET_KEY, JSON.stringify(saved));
    } catch { /* The audio remains usable when settings cannot be saved. */ }
  },
  remove(key) {
    if (!key) return;
    try {
      const saved = offsets();
      delete saved['song:' + key];
      globalThis.localStorage?.setItem(OFFSET_KEY, JSON.stringify(saved));
    } catch { /* Local settings are optional. */ }
  }
};
