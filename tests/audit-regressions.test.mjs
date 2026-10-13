import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {readFileSync} from 'node:fs';
import {visualPolicy,lumenMotion} from '../lib/visual-policy.ts';
import {sphereMesh,lumenParts} from '../lib/lumen-renderer.ts';
import {parseMusicPreferences,defaultMusic} from '../lib/music-preferences.ts';
import {archiveDestination,parallaxOffset} from '../lib/archive-navigation.ts';
import {backdropOffset} from '../lib/archive-motion.ts';
import {defaultLibrary,parseLibraryPreferences,musicLinks} from '../lib/music-library.ts';
const root=fileURLToPath(new URL('../',import.meta.url)),require=createRequire(new URL('../package.json',import.meta.url));
const {build}=createRequire(import.meta.resolve('wrangler'))('esbuild');
async function load(code){const {outputFiles}=await build({stdin:{contents:code,resolveDir:root,loader:'tsx'},absWorkingDir:root,bundle:true,format:'cjs',platform:'node',packages:'external',write:false,logLevel:'silent'});const mod={exports:{}};new Function('module','exports','require',outputFiles[0].text)(mod,mod.exports,require);return mod.exports;}
const {Portal,languages,languageNames,sitemapPaths,sitemapXml,robotsText,initialContent,origin}=await load(`export {default as Portal} from './components/magia-portal';export {languages,languageNames} from './lib/locales';export {sitemapPaths,sitemapXml,robotsText} from './lib/seo-routes';export {initialContent} from './lib/public-content';export {origin} from './lib/magia-data';`);
const {createElement}=require('react'),{renderToStaticMarkup}=require('react-dom/server');
test('SEO uses the actual Site origin and includes every locale and future content without indexing private pages',()=>{
 assert.equal(origin,'https://magia-archive.laescuelavt.chatgpt.site');
 const articles=[...initialContent.articles,{id:'new-source-backed-story'}],units=[...initialContent.kiokus,{id:'19999999'}];
 const paths=sitemapPaths(articles,units),xml=sitemapXml(articles,units);
 assert.ok(paths.includes('kioku/19999999')&&paths.includes('news/new-source-backed-story'));
 assert.ok(!['profile','my-characters','tierlists/create','contact'].some(p=>paths.includes(p)));
 assert.equal((xml.match(/<url>/g)||[]).length,paths.length*9);
 for(const lang of languages){assert.ok(xml.includes(`<loc>${origin}/${lang}/kioku/19999999/</loc>`));assert.ok(xml.includes(`hreflang="${lang}"`));}
 assert.ok(xml.includes('hreflang="x-default"')&&!xml.includes('mcservereden'));
 const spanish=sitemapXml(articles,units,'es');assert.equal((spanish.match(/<url>/g)||[]).length,paths.length);assert.ok(spanish.length<xml.length/8);
 assert.ok(robotsText.includes('Disallow: /api/')&&robotsText.includes(`Sitemap: ${origin}/sitemap.xml`));
});
test('all language pickers expose their full name and compact label, and the home prioritizes only its lead image',()=>{
 for(const lang of languages){const html=renderToStaticMarkup(createElement(Portal,{lang,path:''}));assert.ok(html.includes('language-full')&&html.includes('language-short'));assert.ok(html.includes(languageNames[lang]));assert.equal((html.match(/<img\b[^>]*fetchPriority="high"/g)||[]).length,1);assert.ok(html.includes('archive-atmosphere')&&html.includes('aria-hidden="true"'),'the scene is decorative and has no character or focusable controls');assert.ok(!html.includes('magic-stage')&&!html.includes('/assets/prototype/lumen.svg')&&!html.includes('LUMEN'));assert.ok(!html.includes('<audio'),'one shared player belongs to the persistent layout');}
});
test('progressive navigation preserves locale, query and hash without intercepting external, editor query, hash, download or modified links',()=>{
 const current='https://magia-archive.laescuelavt.chatgpt.site/es/news/';
 assert.equal(archiveDestination('/es/characters/?role=Healer#catalog',current),'/es/characters/?role=Healer#catalog');
 assert.equal(archiveDestination('/ja/news/',current),'/ja/news/');
 for(const href of ['#contents','/es/news/?sort=new','/api/auth/logout','https://accounts.google.com/','mailto:contact@example.test','javascript:alert(1)'])assert.equal(archiveDestination(href,current),null);
 for(const flags of [{ctrlKey:true},{metaKey:true},{shiftKey:true},{altKey:true},{button:1},{download:true},{target:'_blank'},{defaultPrevented:true},{external:true}])assert.equal(archiveDestination('/es/characters/',current,flags),null);
 const target=new EventTarget();target.addEventListener('beforeunload',event=>event.preventDefault());assert.equal(target.dispatchEvent(new Event('beforeunload',{cancelable:true})),false,'existing dirty editor can veto enhanced navigation');
});
test('multilayer parallax stays bounded and finite even for zero-sized scenes',()=>{
 for(const size of [0,1,320,1440])for(const x of [-10000,0,10000]){const m=parallaxOffset(x,x,{left:0,top:x,width:size,height:size},800);assert.ok(Number.isFinite(m.x)&&Number.isFinite(m.y)&&Number.isFinite(m.depth));assert.ok(Math.abs(m.x)<=4&&Math.abs(m.y)<=3&&Math.abs(m.depth)<=16);}
});
test('archive decoration uses bounded scroll depth, discards nonfinite input and removes pointer motion on modest devices',()=>{
 for(const scroll of [-100,0,100,100000,Infinity,NaN])for(const x of [-20,0,20,Infinity,NaN]){
  const regular=backdropOffset(scroll,x,x),mobile=backdropOffset(scroll,x,x,true);
  assert.ok(Object.values(regular).every(Number.isFinite));assert.ok(regular.scroll>=0&&regular.background>=0&&regular.background<=180&&regular.art<=26&&Math.abs(regular.x)<=12&&Math.abs(regular.y)<=8);
  assert.ok(mobile.scroll>=0&&mobile.background>=0&&mobile.background<=96&&mobile.art<=26);assert.equal(mobile.x,0);assert.equal(mobile.y,0);
 }
 assert.ok(backdropOffset(400).scroll>backdropOffset(100).scroll);
});
test('music collections validate stored preferences without accepting external embed URLs',()=>{
 for(const raw of [null,'bad','[]','{"platform":"javascript:alert(1)","collection":"private-records"}'])assert.deepEqual(parseLibraryPreferences(raw),defaultLibrary);
 assert.deepEqual(parseLibraryPreferences('{"platform":"youtube","collection":"ambience","url":"https://evil.test"}'),{platform:'youtube',collection:'soundtrack'});
 assert.equal(new URL(musicLinks.spotifyEmbed).hostname,'open.spotify.com');assert.ok(musicLinks.spotifyEmbed.includes('/playlist/6tYCpU7Fd3tFYz003pqezw'));
});
test('the shared music library starts without external frames or autoplay and is translated in every locale',async()=>{
 const {ArchiveMusic,musicLibraryCopy}=await load(`export {default as ArchiveMusic} from './components/archive-music';export {musicLibraryCopy} from './lib/music-library-copy';`);
 for(const lang of languages){
  const html=renderToStaticMarkup(createElement(ArchiveMusic,{lang}));
  assert.ok(!html.includes('<iframe')&&!html.includes('<audio'),'external streaming only starts after an explicit choice');
  assert.ok(html.includes(musicLinks.spotify)&&html.includes('YouTube Music')&&html.includes('Apple Music')&&html.includes('Amazon Music'));
  assert.ok(html.includes('music-platforms')&&html.includes('music-songs')&&html.includes('music-player-title'));assert.ok(!html.includes(musicLibraryCopy[lang].ambience)&&!html.includes('prototype/'),'retired ambience cannot return through stored settings');
  for(const text of Object.values(musicLibraryCopy[lang]))assert.ok(typeof text==='string'&&text.trim().length>0);
  assert.ok(html.includes(musicLibraryCopy[lang].platforms)&&html.includes(musicLibraryCopy[lang].soundtrack));
 }
});
test('untrusted article text is escaped and the Madokadle trigger opens a labelled dialog',()=>{
 const content={...initialContent,articles:initialContent.articles.map((a,i)=>i? a:{...a,title:{...a.title,es:'<script>alert("x")</script>'}})};
 const html=renderToStaticMarkup(createElement(Portal,{lang:'es',path:'',content}));assert.ok(!html.includes('<script>alert'));assert.ok(html.includes('&lt;script&gt;'));
 const game=renderToStaticMarkup(createElement(Portal,{lang:'es',path:'madokadle'}));assert.ok(game.includes('aria-haspopup="dialog"'));assert.ok(!/class="character-picker"[^>]*role="combobox"/.test(game));
});
test('motion budgets protect reduced motion, data saving and modest touch devices',()=>{
 for(const input of [{reducedMotion:true},{saveData:true}]){const p=visualPolicy(input);assert.equal(p.motion,false);assert.equal(p.parallax,false);assert.equal(p.particles,0);assert.equal(p.fps,0);}
 const mobile=visualPolicy({coarse:true,memory:2});assert.equal(mobile.parallax,false);assert.equal(mobile.pixelRatio,1);assert.ok(mobile.fps<=24&&mobile.particles<=4);
 assert.ok(visualPolicy().particles<=8&&visualPolicy().pixelRatio<=1.5);
});
test('original procedural character has finite bounded geometry and stable idle and blink states',()=>{
 const mesh=sphereMesh();assert.equal(mesh.length/9,280);assert.ok([...mesh].every(Number.isFinite));assert.ok(lumenParts.length<=20);
 assert.equal(lumenMotion(0).eyes,1);assert.ok(lumenMotion(.07).eyes<.1);
 for(let i=0;i<10000;i++){const m=lumenMotion(i/60);assert.ok(m.breathe>=.98&&m.breathe<=1.02);assert.ok(Math.abs(m.bob)<=.027);assert.ok(Math.abs(m.yaw)<=.1);assert.ok(m.eyes>0&&m.eyes<=1.000001);}
});
test('music persistence rejects corrupted values and prototype audio files have valid PCM headers',()=>{
 for(const raw of [null,'bad','[]','{"track":3,"position":0,"volume":0.4}','{"track":0,"position":-1,"volume":0.4}','{"track":0,"position":0,"volume":2}'])assert.deepEqual(parseMusicPreferences(raw),defaultMusic);
 assert.deepEqual(parseMusicPreferences('{"track":1,"position":6,"volume":0.4}'),{track:1,position:6,volume:.4});
 for(const name of ['violet','constellations']){const b=readFileSync(new URL(`../public/assets/prototype/${name}.wav`,import.meta.url));assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WAVE');assert.equal(b.readUInt32LE(24),22050);}
});
