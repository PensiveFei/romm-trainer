// Small artwork is used for tiles; original artwork remains available for details.
export function thumbnailUrl(source) {
  if (typeof source !== 'string') return source;
  return source.replace(/^\.\/assets\/(covers|encounter-covers)\/([^/]+)\.(?:webp|jpe?g|png)$/i,
    './assets/cover-thumbs/$1/$2.webp');
}

export function setCoverImage(image, source, {thumbnail=false, onError}={}) {
  const small=thumbnail ? thumbnailUrl(source) : source;
  let usingSmall=small !== source;
  image.decoding='async';
  image.addEventListener('error',()=>{
    if (usingSmall) { usingSmall=false; image.src=source; }
    else onError?.();
  });
  image.src=small;
}
