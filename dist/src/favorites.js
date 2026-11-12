export const FAVORITES_KEY = 'romm-trainer-favorites-v1';

// The in-memory copy keeps the UI usable if browser storage is unavailable.
export function createFavorites(storage) {
  let ids = new Set();
  function reload() {
    try {
      const saved = JSON.parse(storage?.getItem(FAVORITES_KEY) || '[]');
      ids = new Set(Array.isArray(saved) ? saved.filter(id => typeof id === 'string' && /^_GMusic\d+$/.test(id)) : []);
    } catch { ids = new Set(); }
  }
  reload();
  return {
    has: id => ids.has(id),
    values: () => [...ids],
    reload,
    toggle(id) {
      if (typeof id !== 'string' || !/^_GMusic\d+$/.test(id)) return {favorite:false,saved:false};
      if (ids.has(id)) ids.delete(id); else ids.add(id);
      let saved = false;
      try { if (storage) { storage.setItem(FAVORITES_KEY,JSON.stringify([...ids])); saved=true; } } catch { /* Session-only fallback. */ }
      return {favorite:ids.has(id),saved};
    }
  };
}
let storage;
try { storage=globalThis.localStorage; } catch { /* Browser can deny storage access. */ }
export const favorites = createFavorites(storage);
if (typeof window !== 'undefined') window.addEventListener('storage',event=>{
  if (event.key !== FAVORITES_KEY) return;
  favorites.reload();
  window.dispatchEvent(new Event('romm:favorites-changed'));
});
