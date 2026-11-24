import type { MusicTrackMatch } from './types.ts';

/**
 * Builds an official Apple Music embed player URL from an album collectionId & trackId.
 */
export function buildAppleMusicEmbedUrl(
  collectionId?: number | string,
  trackId?: number | string,
): string | undefined {
  const c = collectionId !== undefined ? String(collectionId).trim() : '';
  const t = trackId !== undefined ? String(trackId).trim() : '';
  if (!c || !t || !/^\d+$/.test(c) || !/^\d+$/.test(t)) {
    return undefined;
  }
  return `https://embed.music.apple.com/us/album/${c}?i=${t}&theme=dark`;
}

export async function searchWorshipTrack(
  query: string,
  fetchImpl: typeof fetch = fetch,
): Promise<MusicTrackMatch> {
  const trimmed = String(query || '').trim();
  const spotifySearchUrl = `https://open.spotify.com/search/${encodeURIComponent(trimmed)}`;
  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(trimmed)}`;

  if (!trimmed) {
    return {
      found: false,
      query: trimmed,
      spotifySearchUrl,
      youtubeSearchUrl,
    };
  }

  try {
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(trimmed)}&media=music&entity=song&limit=1`;
    const res = await fetchImpl(itunesUrl, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(7000),
    });

    if (res.ok) {
      const payload = (await res.json()) as {
        results?: Array<{
          trackId?: number;
          collectionId?: number;
          trackName?: string;
          artistName?: string;
          artworkUrl100?: string;
          previewUrl?: string;
          trackViewUrl?: string;
        }>;
      };
      const hit = payload?.results?.[0];
      if (hit) {
        return {
          found: true,
          query: trimmed,
          trackName: hit.trackName,
          artistName: hit.artistName,
          artworkUrl: hit.artworkUrl100,
          previewUrl: hit.previewUrl,
          appleMusicUrl: hit.trackViewUrl,
          appleMusicEmbedUrl: buildAppleMusicEmbedUrl(hit.collectionId, hit.trackId),
          spotifySearchUrl,
          youtubeSearchUrl,
        };
      }
    }
  } catch {
    // Graceful fallback when sandbox/network is offline
  }

  return {
    found: false,
    query: trimmed,
    spotifySearchUrl,
    youtubeSearchUrl,
  };
}
