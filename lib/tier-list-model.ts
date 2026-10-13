import { kiokus } from './kioku-catalog.ts';
export const tierRanks = ['S+', 'S', 'A', 'B', 'C'] as const;
export type TierRank = typeof tierRanks[number];
export type TierKind = 'characters' | 'teams';
export type TierEntry = { id: string; tier: TierRank; name?: string; members?: string[] };
export type TierDraft = { id: string; title: string; kind: TierKind; entries: TierEntry[]; revision: number };
export type PersonalTierList = TierDraft & { updatedAt: number };
export const isListId = (value: unknown): value is string => typeof value === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(value);
export function parseTierDraft(raw: unknown,units:readonly typeof kiokus[number][]=kiokus): TierDraft {
  const ids = new Set(units.map(unit => unit.id));
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('INVALID_REQUEST');
  const body = raw as Record<string, unknown>;
  if (!isListId(body.id) || !Number.isInteger(body.revision) || Number(body.revision) < -1 || Number(body.revision) > 1000000 || typeof body.title !== 'string' || (body.kind !== 'characters' && body.kind !== 'teams') || !Array.isArray(body.entries)) throw new Error('INVALID_REQUEST');
  const title = body.title.normalize('NFKC').trim();
  if (!title || title.length > 80 || /[\u0000-\u001f\u007f]/.test(title) || !body.entries.length || body.entries.length > (body.kind === 'characters' ? units.length : 20)) throw new Error('INVALID_REQUEST');
  const seen = new Set<string>();
  const entries: TierEntry[] = body.entries.map((rawEntry: unknown) => {
    if (!rawEntry || typeof rawEntry !== 'object' || Array.isArray(rawEntry)) throw new Error('INVALID_REQUEST');
    const entry = rawEntry as Record<string, unknown>;
    if (typeof entry.id !== 'string' || seen.has(entry.id) || !tierRanks.includes(entry.tier as TierRank)) throw new Error('INVALID_REQUEST');
    seen.add(entry.id);
    if (body.kind === 'characters') {
      if (!ids.has(entry.id)) throw new Error('INVALID_REQUEST');
      return { id: entry.id, tier: entry.tier as TierRank };
    }
    const name = typeof entry.name === 'string' ? entry.name.normalize('NFKC').trim() : '';
    if (!isListId(entry.id) || !name || name.length > 60 || /[\u0000-\u001f\u007f]/.test(name) || !Array.isArray(entry.members) || !entry.members.length || entry.members.length > 5 || new Set(entry.members).size !== entry.members.length || entry.members.some(id => typeof id !== 'string' || !ids.has(id))) throw new Error('INVALID_REQUEST');
    return { id: entry.id, tier: entry.tier as TierRank, name, members: entry.members as string[] };
  });
  return { id: body.id, title, kind: body.kind, entries, revision: Number(body.revision) };
}
