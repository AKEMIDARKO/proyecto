export type MusicPreferences={track:number;position:number;volume:number};
export const defaultMusic:MusicPreferences={track:0,position:0,volume:.25};
export function parseMusicPreferences(raw:string|null):MusicPreferences {
  try{const v=JSON.parse(raw??'null');if(!v||typeof v!=='object'||!Number.isInteger(v.track)||v.track<0||v.track>1||typeof v.position!=='number'||!Number.isFinite(v.position)||v.position<0||v.position>3600||typeof v.volume!=='number'||!Number.isFinite(v.volume)||v.volume<0||v.volume>1)return {...defaultMusic};return {track:v.track,position:v.position,volume:v.volume};}catch{return {...defaultMusic};}
}
