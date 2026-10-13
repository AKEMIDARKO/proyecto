import { rows } from "./i18n.ts";
import { languages, type Lang } from "./locales.ts";

// Public links from Homulilly's YouTube channel and the creator's shared account handles.
export const creatorLinks = [
  { id: "youtube", platform: "YouTube", label: "main", handle: "@HomulillyVT", url: "https://www.youtube.com/@HomulillyVT" },
  { id: "youtubeExtras", platform: "YouTube", label: "extras", handle: "@Homulilly2", url: "https://www.youtube.com/@Homulilly2" },
  { id: "tiktok", platform: "TikTok", label: "TikTok", handle: "@nosoyhomulilly", url: "https://www.tiktok.com/@nosoyhomulilly" },
  { id: "x", platform: "X / Twitter", label: "X / Twitter", handle: "@HomulillyVT", url: "https://twitter.com/HomulillyVT" },
  { id: "instagram", platform: "Instagram", label: "Instagram", handle: "@HomulillyVT", url: "https://www.instagram.com/HomulillyVT" },
  { id: "twitch", platform: "Twitch", label: "Twitch", handle: "HomulillyVT", url: "https://twitch.tv/HomulillyVT" },
  { id: "spotify", platform: "Spotify", label: "Spotify", handle: "Homulilly", url: "https://open.spotify.com/intl-es/artist/7uNYMFaskH0MUi7zpTw6oj" },
  { id: "links", platform: "Linktree", label: "all", handle: "HomulillyVT", url: "https://linktr.ee/HomulillyVT" },
] as const;
const translations = rows(`
title~Encuentra a Homulilly~Find Homulilly~Homulillyの活動をチェック~Znajdź Homulilly~Retrouvez Homulilly~Trova Homulilly~Hier findest du Homulilly~关注 Homulilly~追蹤 Homulilly
intro~Música, directos y momentos de la comunidad. Estas son mis redes.~Music, streams and community moments. These are my socials.~音楽・配信・コミュニティのひととき。こちらが私のSNSです。~Muzyka, transmisje i chwile ze społecznością. Oto moje profile.~Musique, directs et moments de communauté. Voici mes réseaux.~Musica, dirette e momenti con la community. Questi sono i miei social.~Musik, Streams und Momente mit der Community. Das sind meine Profile.~音乐、直播与社群时光。这些是我的社交账号。~音樂、直播與社群時光。這些是我的社群帳號。
main~Canal principal~Main channel~メインチャンネル~Główny kanał~Chaîne principale~Canale principale~Hauptkanal~主频道~主頻道
extras~Homulilly 2 · Canal secundario~Homulilly 2 · Second channel~Homulilly 2 · サブチャンネル~Homulilly 2 · Drugi kanał~Homulilly 2 · Chaîne secondaire~Homulilly 2 · Secondo canale~Homulilly 2 · Zweitkanal~Homulilly 2 · 副频道~Homulilly 2 · 副頻道
all~Todos mis enlaces~All my links~すべてのリンク~Wszystkie moje linki~Tous mes liens~Tutti i miei link~Alle meine Links~全部链接~全部連結
socials~Redes de Homulilly~Homulilly's socials~HomulillyのSNS~Profile Homulilly~Réseaux de Homulilly~Social di Homulilly~Homulillys Profile~Homulilly 的社交账号~Homulilly 的社群帳號
`);
export const creatorCopy = Object.fromEntries(languages.map((lang, index) => [lang, Object.fromEntries(Object.entries(translations).map(([key, values]) => {
  if (values.length !== languages.length) throw new Error("Missing creator translation: " + key);
  return [key, values[index]];
}))])) as Record<Lang, Record<string, string>>;
