import { parseTierDraft, type PersonalTierList, type TierDraft } from './tier-list-model.ts';
import { readKiokus } from './kioku-store.ts';
type Row = { id: string; title: string; kind: 'characters' | 'teams'; entries_json: string; revision: number; updated_at: number };
const record = (row: Row): PersonalTierList => ({ id: row.id, title: row.title, kind: row.kind, entries: JSON.parse(row.entries_json), revision: row.revision, updatedAt: row.updated_at });
export async function personalTierLists(db: D1Database, userId: string): Promise<PersonalTierList[]> {
  const rows = await db.prepare('SELECT id, title, kind, entries_json, revision, updated_at FROM personal_tier_lists WHERE user_id = ? ORDER BY updated_at DESC, id LIMIT 20').bind(userId).all<Row>();
  return rows.results.map(record);
}
export async function personalTierList(db: D1Database, userId: string, id: string) {
  const row = await db.prepare('SELECT id, title, kind, entries_json, revision, updated_at FROM personal_tier_lists WHERE user_id = ? AND id = ?').bind(userId, id).first<Row>();
  return row ? record(row) : null;
}
export async function savePersonalTierList(db: D1Database, userId: string, raw: unknown): Promise<PersonalTierList> {
  const draft = parseTierDraft(raw,await readKiokus(db)), json = JSON.stringify(draft.entries), now = Date.now();
  if (draft.revision === -1) {
    const inserted = await db.prepare(`INSERT INTO personal_tier_lists (id, user_id, title, kind, entries_json, revision, created_at, updated_at)
      SELECT ?, ?, ?, ?, ?, 0, ?, ? WHERE (SELECT COUNT(*) FROM personal_tier_lists WHERE user_id = ?) < 20
      ON CONFLICT(id) DO NOTHING`).bind(draft.id, userId, draft.title, draft.kind, json, now, now, userId).run();
    if (inserted.meta.changes !== 1) {
      const current = await personalTierList(db, userId, draft.id);
      if (current && current.kind === draft.kind && current.title === draft.title && JSON.stringify(current.entries) === json) return current;
      if (current) throw new Error('CONFLICT');
      const count = await db.prepare('SELECT COUNT(*) AS n FROM personal_tier_lists WHERE user_id = ?').bind(userId).first<{ n: number }>();
      throw new Error(count && count.n >= 20 ? 'LIMIT_REACHED' : 'NOT_FOUND');
    }
  } else {
    const updated = await db.prepare('UPDATE personal_tier_lists SET title = ?, kind = ?, entries_json = ?, revision = revision + 1, updated_at = ? WHERE user_id = ? AND id = ? AND revision = ?').bind(draft.title, draft.kind, json, now, userId, draft.id, draft.revision).run();
    if (updated.meta.changes !== 1) throw new Error(await personalTierList(db, userId, draft.id) ? 'CONFLICT' : 'NOT_FOUND');
  }
  const saved = await personalTierList(db, userId, draft.id);
  if (!saved) throw new Error('UNAVAILABLE');
  return saved;
}
export async function deletePersonalTierList(db: D1Database, userId: string, draft: Pick<TierDraft, 'id' | 'revision'>) {
  const result = await db.prepare('DELETE FROM personal_tier_lists WHERE user_id = ? AND id = ? AND revision = ?').bind(userId, draft.id, draft.revision).run();
  if (result.meta.changes !== 1) throw new Error(await personalTierList(db, userId, draft.id) ? 'CONFLICT' : 'NOT_FOUND');
}
