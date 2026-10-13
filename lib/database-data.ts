import { portraits,type Portrait } from './portrait-data.ts';
import { type Kioku } from './kioku-catalog.ts';
import { gameItems, type GameItem } from './items-copy.ts';
export type DatabaseItem = { id: string; kind: 'materials' | 'portraits'; nameKey: string; textKey: string; japanese: string; source: string; image: string; width: number; height: number; element?: Kioku['element']; role?: Kioku['role']; rarity?: number; portrait?: Portrait; gameItem?: GameItem };
export const databaseItems: DatabaseItem[] = [
  ...gameItems.map((item):DatabaseItem => ({...item,kind:'materials',nameKey:'',textKey:'',gameItem:item,element:(item.id.match(/-(flame|aqua|forest|light|dark|void)$/)?.[1]?.replace(/^./,s=>s.toUpperCase())) as Kioku['element']|undefined})),
  ...portraits.map((p):DatabaseItem=>({id:p.id,kind:'portraits',nameKey:'',textKey:'',japanese:p.japanese,rarity:p.rarity,source:p.source,image:p.image,width:p.width,height:p.height,portrait:p})),
];
