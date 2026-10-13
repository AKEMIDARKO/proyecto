import { kiokus as seed, type Kioku } from './kioku-catalog.ts';
import { publicJson, storedKioku } from './public-records.ts';

export function mergeKiokus(rows: { key: string; value_json: string }[], onInvalid?: () => void): Kioku[] {
  const byId = new Map(seed.map(unit => [unit.id, unit]));
  for (const row of rows) {
    if (!row.key.startsWith('kioku:')) continue;
    const unit = publicJson(row.value_json);
    if (storedKioku(unit) && row.key === 'kioku:' + unit.id && /^\d{8}$/.test(unit.id)) byId.set(unit.id, unit);
    else onInvalid?.();
  }
  return [...byId.values()];
}

export async function readKiokus(db: D1Database): Promise<Kioku[]> {
  const rows = await db.prepare("SELECT key,value_json FROM public_updates WHERE key LIKE 'kioku:%'").all<{ key: string; value_json: string }>();
  return mergeKiokus(rows.results);
}
