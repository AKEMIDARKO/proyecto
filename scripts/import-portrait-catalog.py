"""Import an already checked public portrait manifest and optimized assets."""
import argparse,hashlib,html,json,re,shutil
from pathlib import Path
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('manifest',type=Path)
args=parser.parse_args()
root=Path(__file__).resolve().parent.parent
m=json.loads(args.manifest.read_text())
aliases={'art_00_00_0001':'a-close-friend','art_06_00_0003':'meet-again','art_06_02_0001':'apostle-of-salvation'}
metrics={'ATK':'atk','DEF':'def','max HP':'hp','break effect':'breakEffect','HP recovery amount':'heal','critical DMG':'critDamage','MP recovery rate':'mp','DMG dealt':'damage','DMG':'damage','critical rate':'critRate','SPD':'speed','ailment hit rate':'ailmentHit','battle skill DMG dealt':'skillDamage','special attack DMG dealt':'specialDamage','ailment RES':'ailmentRes','ailment RES rate':'ailmentRes','DMG dealt when targeting elemental weakness':'weakness','debuff hit rate':'debuffHit','follow-up attack and counterattack DMG dealt':'followUp','ongoing DMG dealt':'dot','DMG taken':'damageTaken'}
def effects(a):
 template=a['template_en'] or 'Increases DEF by [a]%.'
 result=[]
 for match in re.finditer(r'([^\[\]]+?) by \[([a-z])\](%)?',template):
  term,var,percent=match.groups()
  condition='break350' if '350%' in term else None
  term=re.sub(r"If target's break bonus is 350% or higher,\s*",'',term)
  em=re.search(r'(?:On |[Ii]ncreases )(light|dark|flame|forest|aqua|void)(?: attack| DMG)',term)
  element=em.group(1).title() if em else None
  term=re.sub(r'On \w+ attack,\s*','',term)
  term=re.sub(r'^[\s.,]+','',term)
  term=re.sub(r'^(?:(?:and|Also|also|Increases|increases|decreases)\s+)+','',term)
  term=re.sub(r'^[\s.,]+','',term)
  key='elementDamage' if element else metrics.get(term)
  if not key: raise ValueError('Unknown effect '+repr(term)+' in '+template)
  v=a['scaling'][var]
  item={'key':key,'initial':v['initial'],'max':v['max'],'unit':'%' if percent else ''}
  if element:item['element']=element
  if condition:item['condition']=condition
  result.append(item)
 assert len(result)==len(a['scaling']),template
 return result
def clean(s):return html.unescape(re.sub(r'<[^>]+>','',re.sub(r'<br\s*/?>','\n',s,flags=re.I))).strip()
records=[];provenance=[]
assets=root/'public/assets/portraits';assets.mkdir(parents=True,exist_ok=True)
conflicts=m['coverage']['independent_index_crosscheck']['source_discrepancies']
for raw in m['portraits']:
 art=raw['display'];thumb=raw['thumbnail'];bonus=raw['conditional_bonus'];c=next((c for c in conflicts if c['id']==raw['id']),None)
 date=raw.get('source_revision_timestamp') or raw.get('source_page_updated_display')
 date=re.sub(r'^(\d{4})\.(\d{2})\.(\d{2})',r'\1-\2-\3',date)[:10] if date else None
 entry={'id':aliases.get(raw['id'],raw['id']),'assetId':raw['id'],'name':raw['name_en'],'japanese':raw['name_ja'],'rarity':raw['rarity'],'image':'/assets/portraits/'+Path(art['local_relative_path']).name,'thumbnail':'/assets/portraits/'+Path(thumb['local_relative_path']).name,'width':art['width'],'height':art['height'],'thumbWidth':thumb['width'],'thumbHeight':thumb['height'],'stats':raw['stats'],'effects':effects(raw['ability']),'bonus':None,'source':raw['page_url'],'revision':raw['source_revision_url'],'sourceDate':date,'obtained':{'text':clean(raw['obtained']['text_en']),'links':raw['obtained']['links']},'missing':raw['missing_fields'],'crosscheck':raw.get('independent_index_record',{}).get('page_url'),'rarityConflict':{'wiki':c['wiki_rarity'],'game8':c['game8_detail_rarity'],'source':c['game8_detail_url']} if c else None}
 if bonus:
  assert bonus['is_equipment_restriction'] is False
  entry['bonus']={'type':bonus['condition_type'],'target':bonus['condition_value'],'effects':effects(bonus['effect'])}
 records.append(entry)
 provenance.append({'id':entry['id'],'assetId':entry['assetId'],'source':entry['source'],'revision':entry['revision'],'sourceImage':raw['image']['url'],'sourceSha1':raw['image'].get('source_sha1'),'sourceSha256':raw['image']['sha256'],'sourceWidth':raw['image']['width'],'sourceHeight':raw['image']['height'],'display':{k:art[k] for k in ['width','height','bytes','sha256','cropped']},'thumbnail':{k:thumb[k] for k in ['width','height','bytes','sha256','cropped']},'rarityConflict':entry['rarityConflict'],'missing':entry['missing']})
 assert raw['download_status']=='verified'
 for asset in [art,thumb]:
  src=args.manifest.parent/asset['local_relative_path']
  assert src.stat().st_size==asset['bytes']>1000,src
  assert hashlib.sha256(src.read_bytes()).hexdigest()==asset['sha256'],src
  shutil.copyfile(src,assets/src.name)
assert len(records)==len({r['id'] for r in records})==m['coverage']['manifest_count']
assert len({r['image'] for r in records})==len(records)
snapshot={'checked':m['coverage'].get('snapshot_date_japan','2026-10-09'),'snapshotAt':m['source_snapshot_timestamp'],'portraits':records}
(root/'lib/portrait-snapshot.ts').write_text('// Imported checked public indexes; see portrait-provenance.json.\nexport default '+json.dumps(snapshot,ensure_ascii=False,separators=(',',':'))+';\n')
(root/'lib/portrait-provenance.json').write_text(json.dumps({'coverage':m['coverage'],'portraits':provenance},ensure_ascii=False,indent=2)+'\n')
print('Imported',len(records),'portraits;',len(provenance)*2,'assets verified and copied')
