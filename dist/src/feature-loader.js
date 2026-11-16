// Load the larger practice and library modules only when they are needed.
// A failed import is not cached here so a later user action can retry.
let practiceModule, libraryModule, practiceAttempts=0, libraryAttempts=0;
function importFeature(path,attempt) {
  const parent=new URL(import.meta.url), url=new URL(path,parent);
  const version=parent.searchParams.get('v');
  if (version) url.searchParams.set('v',version);
  // Browsers may cache a failed module fetch, so a retry needs a fresh URL.
  if (attempt) url.searchParams.set('retry',String(attempt));
  return import(url.href);
}
export function loadPractice() {
  return practiceModule ||= importFeature('./app.js',practiceAttempts++).catch(error=>{practiceModule=null;throw error;});
}
export function loadLibrary() {
  return libraryModule ||= importFeature('./library.js',libraryAttempts++).catch(error=>{libraryModule=null;throw error;});
}
