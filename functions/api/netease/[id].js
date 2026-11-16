import { isNeteaseTrackId } from '../../../dist/src/netease-tracks.js';

// Resolve only catalog tracks and redirect to the provider over HTTPS. The
// recording is streamed directly from the music platform, never stored here.
export async function resolveTrack(rawId, fetchImpl = fetch) {
  if (!/^\d{1,11}$/.test(rawId || '') || !isNeteaseTrackId(Number(rawId))) {
    return new Response('Unknown track', {status:404, headers:{'Cache-Control':'no-store'}});
  }
  const id = Number(rawId);
  const endpoint = new URL('https://music.163.com/api/song/enhance/player/url');
  endpoint.searchParams.set('ids', JSON.stringify([id]));
  endpoint.searchParams.set('br', '128000');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  try {
    const response = await fetchImpl(endpoint.href, {signal:controller.signal, headers:{Accept:'application/json'}});
    if (!response.ok) throw new Error('Provider unavailable');
    const result = await response.json();
    const song = result.data?.[0];
    if (result.code !== 200 || song?.id !== id || song.code !== 200 || song.fee !== 0 || song.freeTrialInfo || !song.url) {
      throw new Error('Track unavailable');
    }
    const url = new URL(song.url);
    if (!/^https?:$/.test(url.protocol) || url.username || url.password || url.port ||
        !/(^|\.)(?:music\.126\.net|music\.163\.com)$/i.test(url.hostname)) {
      throw new Error('Unexpected provider address');
    }
    url.protocol = 'https:';
    return new Response(null, {status:302, headers:{Location:url.href,'Cache-Control':'no-store'}});
  } catch {
    return new Response('Track unavailable', {status:502, headers:{'Cache-Control':'no-store'}});
  } finally {
    clearTimeout(timeout);
  }
}

export function onRequestGet({params}) {
  return resolveTrack(params.id);
}
