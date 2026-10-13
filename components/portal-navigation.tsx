"use client";
import { ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { expansionCopy } from '@/lib/expansion-copy';
import { words } from '@/lib/magia-data';
import { communityCopy } from '@/lib/community-data';
import { accountCopy } from '@/lib/account-copy';
import type { Lang } from '@/lib/locales';
import { toolsCopy } from '@/lib/tools-copy';

export function navigationGroups(lang: Lang) {
  const x = expansionCopy[lang], w = words[lang], c = communityCopy[lang], a = accountCopy[lang], t=toolsCopy[lang];
  return [
    { label: w.home, path: '' }, { label: w.news, path: 'news' },
    { label: x.leaks, path: 'leaks' }, { label: x.builds, path: 'builds' },
    { label: x.tierlists, path: 'tierlists', items: [{ label: w.characters, path: 'tierlists' }, { label: x.teams, path: 'tierlists/teams' }, { label: x.portraits, path: 'tierlists/portraits' }, { label: x.myLists, path: 'tierlists/create' }] },
    { label: x.database, path: 'database', items: [{ label: w.characters, path: 'characters' }, { label: x.objects, path: 'database/items' }] },
    { label: t.tools, path: 'tools', items: [{label:t.tools,path:'tools'},{label:t.myCharacters,path:'my-characters'},{label:t.calculator,path:'ascension-calculator'},{label:t.achievements,path:'achievements'},{label:t.ranking,path:'ranking'}] },
    { label: x.more, path: 'more', items: [{ label: w.guides, path: 'guides' }, { label: 'Madokadle', path: 'madokadle' }, { label: c.universe, path: 'madoka' }, { label: c.community, path: 'community' }, { label: 'Homulilly', path: 'homulilly' }, { label: a.profile, path: 'profile' }, { label: a.leaderboard, path: 'leaderboard' },{label:t.bugs,path:'bug-tracker'},{label:t.faq,path:'faq'},{label:t.contact,path:'contact'}] },
  ];
}
export default function PortalNavigation({ lang, path }: { lang: Lang; path: string }) {
  const href = (route: string) => `/${lang}/${route ? route + '/' : ''}`;
  const groups = navigationGroups(lang);
  return <nav className="desktop-nav category-nav" aria-label={words[lang].menu}>{groups.map(group => {
    const active = path === group.path || (group.path !== '' && path.startsWith(group.path + '/')) || group.items?.some(item => path === item.path) || (group.path === 'database' && path.startsWith('kioku/'));
    if (!group.items) return <a key={group.path} href={href(group.path)} className={active ? 'active' : ''} aria-current={path === group.path ? 'page' : undefined}>{group.label}</a>;
    return <DropdownMenu key={group.path}><DropdownMenuTrigger asChild><button type="button" className={'category-trigger' + (active ? ' active' : '')}>{group.label}<ChevronDown size={14} aria-hidden="true" /></button></DropdownMenuTrigger><DropdownMenuContent className="category-dropdown" align="start">{group.items.map(item => <DropdownMenuItem asChild key={item.path}><a href={href(item.path)} aria-current={path === item.path ? 'page' : undefined}>{item.label}</a></DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu>;
  })}</nav>;
}
export function DatabaseTabs({ lang, path }: { lang: Lang; path: string }) {
  return <nav className="database-tabs" aria-label={expansionCopy[lang].database}>{navigationGroups(lang).find(g => g.path === 'database')!.items!.map(item => <a key={item.path} className={path === item.path || (item.path === 'characters' && path.startsWith('kioku/')) || (item.path === 'database/items' && path.startsWith('database/')) ? 'active' : ''} href={`/${lang}/${item.path}/`} aria-current={path === item.path ? 'page' : undefined}>{item.label}</a>)}</nav>;
}
