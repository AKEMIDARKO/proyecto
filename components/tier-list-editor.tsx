"use client";
import { useKiokus } from './kioku-context';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Save, Trash2, ListOrdered } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { expansionCopy } from '@/lib/expansion-copy';
import { kiokuCopy } from '@/lib/kioku-copy';
import { words } from '@/lib/magia-data';
import { accountCopy } from '@/lib/account-copy';
import { filterKiokus, kiokuName, kiokuVersion, kiokuLabel, sortKiokus, type Kioku } from '@/lib/kioku-catalog';
import { tierRanks, parseTierDraft, type TierDraft, type TierEntry, type PersonalTierList, type TierKind, type TierRank } from '@/lib/tier-list-model';
import { AccountError, accountResponse, getAccount } from '@/lib/account-client';
import type { Lang } from '@/lib/locales';
import GoogleSignIn from './google-sign-in';
import { ElementFilters, TierNavigation, TierRow } from './tier-lists';

export function RankSelect({ value, onChange, label, disabled = false }: { value: TierRank; onChange: (rank: TierRank) => void; label: string; disabled?: boolean }) {
  return <Select value={value} onValueChange={rank => onChange(rank as TierRank)} disabled={disabled}><SelectTrigger aria-label={label}><SelectValue /></SelectTrigger><SelectContent>{tierRanks.map(rank => <SelectItem value={rank} key={rank}>{rank}</SelectItem>)}</SelectContent></Select>;
}
const blank = (kind: TierKind = 'characters'): TierDraft => ({ id: '', title: '', kind, entries: [], revision: -1 });
export default function TierListEditor({ lang }: { lang: Lang }) {
  const kiokus=useKiokus();
  const x = expansionCopy[lang], k = kiokuCopy[lang], a = accountCopy[lang];
  const [draft, setDraft] = useState<TierDraft>(blank);
  const [lists, setLists] = useState<PersonalTierList[]>([]);
  const [access, setAccess] = useState<'loading' | 'ready' | 'anonymous' | 'error'>('loading');
  const [dirty, setDirty] = useState(false), [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(''), [statusError, setStatusError] = useState(false);
  const [query, setQuery] = useState(''), [element, setElement] = useState('all');
  const [teamId, setTeamId] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false), [pending, setPending] = useState<string | null>(null);

  const load = useCallback(async () => {
    setAccess('loading');
    try {
      const account = await getAccount();
      if (!account.user) { setAccess('anonymous'); setLists([]); return; }
      const data = await fetch('/api/tierlists', { cache: 'no-store' }).then(accountResponse<{ lists: PersonalTierList[] }>);
      setLists(data.lists); setAccess('ready');
    } catch { setAccess('error'); }
  }, []);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('kind') === 'teams') setDraft(blank('teams'));
    void load();
  }, [load]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  const change = (next: TierDraft) => { setDraft(next); setDirty(true); setStatus(''); };
  function open(id: string) {
    const saved = lists.find(list => list.id === id);
    const next = saved ? { ...saved, entries: structuredClone(saved.entries) } : blank(id.startsWith('kind:') ? id.slice(5) as TierKind : draft.kind);
    setDraft(next); setTeamId(next.kind === 'teams' ? next.entries[0]?.id || '' : '');
    setDirty(false); setStatus(''); setPending(null);
  }
  function requestOpen(id: string) { if (dirty) setPending(id); else open(id); }
  function updateEntry(id: string, patch: Partial<TierEntry>) { change({ ...draft, entries: draft.entries.map(entry => entry.id === id ? { ...entry, ...patch } : entry) }); }
  function addTeam() {
    if (draft.entries.length >= 20) return;
    const id = crypto.randomUUID();
    change({ ...draft, entries: [...draft.entries, { id, tier: 'A', name: `${x.teams} ${draft.entries.length + 1}`, members: [] }] }); setTeamId(id);
  }
  function addUnit(unit: Kioku) {
    if (draft.kind === 'characters') {
      if (!draft.entries.some(entry => entry.id === unit.id)) change({ ...draft, entries: [...draft.entries, { id: unit.id, tier: 'A' }] });
    } else {
      const team = draft.entries.find(entry => entry.id === teamId);
      if (team && team.members && team.members.length < 5 && !team.members.includes(unit.id)) updateEntry(team.id, { members: [...team.members, unit.id] });
    }
  }
  async function save(asNew = false) {
    let next = { ...draft, id: asNew || !draft.id ? crypto.randomUUID() : draft.id, revision: asNew ? -1 : draft.revision };
    try { next = parseTierDraft(next); }
    catch { setStatus(x.invalid); setStatusError(true); return; }
    // Retain the creation id after a failed response so retries cannot create duplicate lists.
    setDraft(next); setBusy(true); setStatus('');
    try {
      const response = await fetch('/api/tierlists', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) }).then(accountResponse<{ list: PersonalTierList }>);
      setDraft(response.list); setLists(previous => [response.list, ...previous.filter(list => list.id !== response.list.id)]);
      setDirty(false); setStatus(x.saved); setStatusError(false);
    } catch (error) {
      const code = error instanceof AccountError ? error.code : '';
      setStatus(code === 'CONFLICT' ? x.conflict : code === 'LIMIT_REACHED' ? x.limit : code === 'INVALID_REQUEST' ? x.invalid : code === 'SIGN_IN_REQUIRED' ? x.signIn : x.error);
      setStatusError(true); if (code === 'SIGN_IN_REQUIRED') setAccess('anonymous');
      if (code === 'CONFLICT') void load();
    } finally { setBusy(false); }
  }
  async function removeList() {
    setBusy(true); setStatus('');
    try {
      await fetch('/api/tierlists', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: draft.id, revision: draft.revision }) }).then(accountResponse);
      setLists(previous => previous.filter(list => list.id !== draft.id)); setDraft(blank(draft.kind)); setDirty(false); setDeleteOpen(false); setTeamId('');
    } catch (error) { const conflict = error instanceof AccountError && error.code === 'CONFLICT'; setStatus(conflict ? x.conflict : x.error); setStatusError(true); setDeleteOpen(false); if (conflict) void load(); }
    finally { setBusy(false); }
  }
  const selectedTeam = draft.entries.find(entry => entry.id === teamId);
  const selectedIds = draft.kind === 'characters' ? draft.entries.map(entry => entry.id) : selectedTeam?.members || [];
  const pool = sortKiokus(filterKiokus(kiokus, { query, rarity: 'all', element, role: 'all' }), 'nameAsc', lang);
  const notEditable = busy;
  return <div className="tier-editor">
    <div className="page-heading"><p className="eyebrow"><ListOrdered size={15} aria-hidden="true" /> MAGIA EXEDRA</p><h1>{x.myLists}</h1><p>{x.privateLists}</p></div>
    <TierNavigation lang={lang} active="create" />
    {access === 'loading' && <p className="tier-notice" role="status">{a.loading}</p>}
    {access === 'error' && <div className="tier-notice" role="alert"><p>{x.loadError}</p><button className="text-link" onClick={() => void load()}>{x.retry}</button></div>}
    {access === 'anonymous' && <section className="account-card tier-login"><h2>{x.signIn}</h2><p>{x.privateLists}</p><GoogleSignIn lang={lang} onSignedIn={() => void load()} /><a className="text-link" href={`/${lang}/privacy/`}>{a.privacy}</a></section>}
    <div className="tier-editor-layout">
      <aside className="tier-editor-panel"><h2>{x.myLists}</h2><button className="button button-outline" type="button" onClick={() => requestOpen('new')} disabled={busy}><Plus size={17} aria-hidden="true" />{x.new}</button>
        <div className="tier-saved-list">{lists.length ? lists.map(list => <button type="button" key={list.id} onClick={() => requestOpen(list.id)} aria-pressed={draft.id === list.id} disabled={busy}>{list.title}<small>{list.kind === 'teams' ? x.teams : words[lang].characters} · {list.entries.length}</small></button>) : <p className="tier-empty">{x.emptyLists}</p>}</div>
      </aside>
      <section className="tier-editor-panel">
        <p className="tier-empty">{x.editorHelp}</p>
        <div className="tier-editor-fields"><div><label htmlFor="tier-title">{x.title}</label><input id="tier-title" value={draft.title} onChange={event => change({ ...draft, title: event.target.value })} maxLength={80} disabled={notEditable} /></div><div><label id="tier-kind-label">{x.tierlists}</label><Select value={draft.kind} onValueChange={value => { if (draft.entries.length) { requestOpen('kind:' + value); } else change({ ...draft, kind: value as TierKind }); }} disabled={notEditable}><SelectTrigger aria-labelledby="tier-kind-label"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="characters">{words[lang].characters}</SelectItem><SelectItem value="teams">{x.teams}</SelectItem></SelectContent></Select></div></div>
        {draft.kind === 'teams' && <div className="tier-editor-fields"><div><label id="selected-team-label">{x.chooseTeam}</label><Select value={teamId || undefined} onValueChange={setTeamId} disabled={busy || !draft.entries.length}><SelectTrigger aria-labelledby="selected-team-label"><SelectValue placeholder={x.newTeam} /></SelectTrigger><SelectContent>{draft.entries.map(team => <SelectItem value={team.id} key={team.id}>{team.name}</SelectItem>)}</SelectContent></Select></div><button type="button" className="button button-outline" disabled={busy || draft.entries.length >= 20} onClick={addTeam}>{x.newTeam}</button></div>}
        {draft.kind === 'teams' && <p className="tier-empty">{x.teamLimit}</p>}
        <div className="tier-editor-actions"><button type="button" className="button button-rose" onClick={() => void save()} disabled={busy || access !== 'ready' || !dirty}><Save size={17} aria-hidden="true" />{busy ? x.saving : x.save}</button>{draft.revision >= 0 && <button type="button" className="text-link" onClick={() => void save(true)} disabled={busy || access !== 'ready'}>{x.copyNew}</button>}{draft.revision >= 0 && <button type="button" className="text-link" onClick={() => setDeleteOpen(true)} disabled={busy}><Trash2 size={15} aria-hidden="true" /> {x.delete}</button>}<span>{dirty ? x.unsaved : ''}</span></div>
        {status && <div className="tier-notice" role={statusError ? 'alert' : 'status'}><p>{status}</p>{statusError && draft.id && <button className="text-link" type="button" disabled={busy || access !== 'ready'} onClick={() => void save(true)}>{x.copyNew}</button>}</div>}
        <div className="tier-board">{tierRanks.map(rank => <TierRow key={rank} rank={rank} lang={lang} count={draft.entries.filter(entry => entry.tier === rank).length}>
          {draft.entries.filter(entry => entry.tier === rank).length ? <div className={draft.kind === 'teams' ? 'tier-team-grid' : 'tier-unit-grid'}>{draft.entries.filter(entry => entry.tier === rank).map(entry => draft.kind === 'characters' ? (() => {
            const unit = kiokus.find(unit => unit.id === entry.id)!;
            return <div className="tier-unit" key={entry.id}><a href={`/${lang}/kioku/${unit.id}/`}><img src={unit.image} alt="" width={600} height={369} loading="lazy" /></a><div className="tier-unit-copy"><h3>{kiokuName(unit, lang)}</h3><span className="tier-version">{kiokuVersion(unit, lang)}</span><RankSelect value={entry.tier} onChange={tier => updateEntry(entry.id, { tier })} label={x.tierlists + ': ' + kiokuLabel(unit, lang)} disabled={busy} /><button type="button" disabled={busy} onClick={() => change({ ...draft, entries: draft.entries.filter(e => e.id !== entry.id) })}>{x.remove}</button></div></div>;
          })() : <div className="team-card" key={entry.id}><label htmlFor={'team-' + entry.id}>{x.teamName}</label><input id={'team-' + entry.id} value={entry.name || ''} maxLength={60} onChange={event => updateEntry(entry.id, { name: event.target.value })} disabled={busy} /><div className="team-members">{entry.members?.map(id => { const unit = kiokus.find(unit => unit.id === id)!; return <div key={id}><a href={`/${lang}/kioku/${id}/`} title={kiokuLabel(unit, lang)}><img src={unit.image} width={600} height={369} alt={kiokuLabel(unit, lang)} loading="lazy" /></a><button className="text-link" type="button" disabled={busy} onClick={() => updateEntry(entry.id, { members: entry.members?.filter(member => member !== id) })} aria-label={x.remove + ': ' + kiokuLabel(unit, lang)}>×</button></div>; })}</div><p>{entry.members?.length || 0} / 5</p><RankSelect value={entry.tier} onChange={tier => updateEntry(entry.id, { tier })} label={x.tierlists + ': ' + entry.name} disabled={busy} /><div className="tier-editor-actions"><button type="button" className="text-link" disabled={busy} onClick={() => setTeamId(entry.id)} aria-pressed={entry.id === teamId}>{x.add}</button><button type="button" className="text-link" disabled={busy} onClick={() => { change({ ...draft, entries: draft.entries.filter(e => e.id !== entry.id) }); if (teamId === entry.id) setTeamId(''); }}>{x.remove}</button></div></div>)}</div> : <p className="tier-empty">—</p>}
        </TierRow>)}</div>
        <section className="tier-pool"><h2>{x.pool}</h2><div className="tier-toolbar"><div><label htmlFor="pool-search">{k.searchLabel}</label><input id="pool-search" value={query} onChange={event => setQuery(event.target.value)} placeholder={k.search} /></div></div><ElementFilters lang={lang} value={element} onChange={setElement} /><p className="tier-empty" role="status">{pool.length} / {kiokus.length} {k.results}</p>
          <div className="tier-pool-grid">{pool.map(unit => <button type="button" className="tier-pool-unit" key={unit.id} disabled={busy || selectedIds.includes(unit.id) || (draft.kind === 'teams' && (!selectedTeam || selectedIds.length >= 5))} onClick={() => addUnit(unit)} aria-label={x.add + ': ' + kiokuLabel(unit, lang)}><img src={unit.image} width={600} height={369} loading="lazy" alt="" /><span>{kiokuName(unit, lang)}</span><small>{kiokuVersion(unit, lang)}</small><small>{'★'.repeat(unit.rarity)} · {k[unit.element]} · {k[unit.role]}</small><span>+ {x.add}</span></button>)}</div>{!pool.length && <p className="tier-empty">{x.noMatches}</p>}
        </section>
      </section>
    </div>
    <AlertDialog open={pending !== null} onOpenChange={value => { if (!value) setPending(null); }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{x.unsaved}</AlertDialogTitle><AlertDialogDescription>{x.changesConfirm}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>{x.cancel}</AlertDialogCancel><button type="button" className="button button-rose" onClick={() => {
      if (pending?.startsWith('kind:')) { setDraft(blank(pending.slice(5) as TierKind)); setDirty(false); setTeamId(''); setPending(null); setStatus(''); }
      else if (pending) open(pending);
    }}>{x.load}</button></AlertDialogFooter></AlertDialogContent></AlertDialog>
    <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{x.delete}</AlertDialogTitle><AlertDialogDescription>{x.deleteNote}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={busy}>{x.cancel}</AlertDialogCancel><button type="button" className="button button-rose" disabled={busy} onClick={() => void removeList()}>{x.delete}</button></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>;
}
