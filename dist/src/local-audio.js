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
