export type MusicPlatform = 'spotify' | 'youtube';
export type MusicCollection = 'soundtrack';
export type MusicLibraryPreferences = { platform: MusicPlatform; collection: MusicCollection };
export const defaultLibrary: MusicLibraryPreferences = { platform: 'spotify', collection: 'soundtrack' };
export const musicLinks = {
  spotify: 'https://open.spotify.com/playlist/6tYCpU7Fd3tFYz003pqezw',
  spotifyEmbed: 'https://open.spotify.com/embed/playlist/6tYCpU7Fd3tFYz003pqezw?theme=0',
  youtube: 'https://www.youtube.com/channel/UCgrSi25shDQYn8wspPLbV1w',
} as const;
export function parseLibraryPreferences(raw: string | null): MusicLibraryPreferences {
  try {
    const value: unknown = JSON.parse(raw ?? 'null');
    if (!value || typeof value !== 'object') return { ...defaultLibrary };
    const candidate = value as Partial<MusicLibraryPreferences>;
    return {
      platform: candidate.platform === 'youtube' ? 'youtube' : 'spotify',
      collection: 'soundtrack',
    };
  } catch { return { ...defaultLibrary }; }
}
