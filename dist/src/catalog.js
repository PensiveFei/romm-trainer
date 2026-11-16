import { catalogUrl } from './i18n.js';

// Home and library use the same data; share one request and one JSON parse.
let pendingCatalog;
export function loadCatalog() {
  if (!pendingCatalog) {
    pendingCatalog=fetch(catalogUrl()).then(response=>{
      if (!response.ok) throw new Error('曲目资料加载失败');
      return response.json();
    }).catch(error=>{pendingCatalog=null;throw error;});
  }
  return pendingCatalog;
}
