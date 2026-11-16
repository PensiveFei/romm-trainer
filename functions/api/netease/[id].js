import { isNeteaseTrackId } from '../../../dist/src/netease-tracks.js';

// Resolve only catalog tracks and redirect to the provider over HTTPS. The
// recording is streamed directly from the music platform, never stored here.
export async function resolveTrack(rawId, fetchImpl = fetch) {
  if (!/^\d{1,11}$/.test(rawId || '') || !isNeteaseTrackId(Number(rawId))) {
    return new Response('Unknown track', {status:404, headers:{'Cache-Control':'no-store'}});
  }
  const id = Number(rawId);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  const endpoints = [
    ['main', 'music.163.com'],
    ['interface', 'interface.music.163.com'],
    ['interface3', 'interface3.music.163.com']
  ];
  const code = value => Number.isInteger(value) ? String(value) : 'missing';
  const resolveFrom = async ([label, host]) => {
    let reason = 'network';
    try {
      const endpoint = new URL(`https://${host}/api/song/enhance/player/url`);
      endpoint.searchParams.set('ids', JSON.stringify([id]));
      endpoint.searchParams.set('br', '128000');
      const response = await fetchImpl(endpoint.href, {signal:controller.signal, headers:{Accept:'application/json'}});
      if (!response.ok) { reason = `http-${response.status}`; throw new Error(); }
      reason = 'invalid-json';
      const result = await response.json();
      const song = result.data?.[0];
      if (result.code !== 200) reason = `api-${code(result.code)}`;
      else if (song?.id !== id) reason = 'wrong-id';
      else if (song.code !== 200) reason = `song-${code(song.code)}`;
      else if (song.fee !== 0) reason = `fee-${code(song.fee)}`;
      else if (song.freeTrialInfo) reason = 'trial';
      else if (!song.url) reason = 'no-url';
      else reason = '';
      if (reason) throw new Error();
      reason = 'invalid-url';
      const url = new URL(song.url);
      if (!/^https?:$/.test(url.protocol) || url.username || url.password || url.port ||
          !/(^|\.)(?:music\.126\.net|music\.163\.com)$/i.test(url.hostname)) throw new Error();
      url.protocol = 'https:';
      return url.href;
    } catch (error) {
      if (error?.name === 'AbortError') reason = 'timeout';
      throw new Error(`${label}-${reason}`);
    }
  };
  try {
    const url = await Promise.any(endpoints.map(resolveFrom));
    return new Response(null, {status:302, headers:{Location:url,'Cache-Control':'no-store'}});
  } catch (error) {
    const reasons = error?.errors?.map(item => item.message).join(',') || 'unknown';
    return new Response('Track unavailable', {status:502, headers:{'Cache-Control':'no-store','X-Romm-Resolver':reasons}});
  } finally {
    clearTimeout(timeout);
    controller.abort();
  }
}

export function onRequestGet({params}) {
  return resolveTrack(params.id);
}
