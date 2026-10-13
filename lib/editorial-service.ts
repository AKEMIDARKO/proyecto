import { communityLinks, petitionTitle } from './community-data';
import { articleInput, parsePetition, petitionObservation, parsePetitionObservation } from './editorial-validation';
import { readPublicContent, saveArticle, savePublicState } from './content-store';
import { updatePlan } from './update-plan';
import { z } from 'zod';
import { refreshKiokuCatalog } from './kioku-sync';

async function sourceHtml(url:string):Promise<string> {
  const response=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(18000),headers:{Accept:'text/html'}});
  if(!response.ok||!response.headers.get('content-type')?.includes('text/html'))throw new Error('SOURCE_UNAVAILABLE_HTTP_'+response.status);
  // Reject redirects; never follow a source to an untrusted origin.
  const text=await response.text();
  if(text.length<500||text.length>3_000_000)throw new Error('SOURCE_FORMAT_CHANGED');
  return text;
}
async function savePetitionObservation(args:unknown) {
  const input=petitionObservation.parse(args);
  const counter=parsePetitionObservation(input.evidence);
  if(!counter)throw new Error('PETITION_COUNTER_UNAVAILABLE_LAST_VALUE_PRESERVED');
  const previous=await readPublicContent();
  if(previous.unavailable)throw new Error('STORAGE_UNAVAILABLE');
  if(Date.parse(input.observedAt)<Date.parse(previous.petition.checkedAt))throw new Error('STALE_PETITION_OBSERVATION');
  const snapshot={source:communityLinks.petition,...counter,checkedAt:input.observedAt};
  await savePublicState('petition',snapshot,snapshot.checkedAt);
  return (await readPublicContent()).petition;
}
export async function editorialAction(name:string,args:unknown) {
  if(name==='get_update_plan')return updatePlan;
  if(name==='get_publication_state'){
    const content=await readPublicContent();
    const changed=new Set([...(content.catalogCheck?.added??[]),...(content.catalogCheck?.updated??[])]);
    return {...content,kiokus:content.kiokus.map(({id,name,japanese,kioku,kiokuJapanese,rarity,role,element,releaseDate,releaseSource,source})=>({id,name,japanese,kioku,kiokuJapanese,rarity,role,element,releaseDate,releaseSource,source})),catalogDetails:content.kiokus.filter(u=>changed.has(u.id)).slice(0,20)};
  }
  if(name==='refresh_kioku_catalog')return refreshKiokuCatalog(args);
  if(name==='publish_news') {
    const input=articleInput.parse(args);
    const html=await sourceHtml(input.source);
    if(!/<(?:article|main|body)[\s>]/i.test(html))throw new Error('SOURCE_FORMAT_CHANGED');
    return saveArticle({...input,checkedAt:new Date().toISOString()});
  }
  if(name==='refresh_petition') {
    const input=z.object({observation:petitionObservation.optional()}).strict().parse(args);
    if(input.observation)return savePetitionObservation(input.observation);
    const html=await sourceHtml(communityLinks.petition);
    if(!html.includes(petitionTitle)||!html.includes('Homulilly'))throw new Error('PETITION_IDENTITY_MISMATCH');
    const counter=parsePetition(html);
    if(!counter)throw new Error('PETITION_COUNTER_UNAVAILABLE_LAST_VALUE_PRESERVED');
    const snapshot={source:communityLinks.petition,...counter,checkedAt:new Date().toISOString()};
    await savePublicState('petition',snapshot,snapshot.checkedAt);
    return snapshot;
  }
  if(name==='record_petition_snapshot') {
    return savePetitionObservation(args);
  }
  if(name==='record_check') {
    const input=z.object({checkedSources:z.array(z.enum([communityLinks.petition,...updatePlan.sources] as [string,...string[]])).max(12),failures:z.array(z.string().max(400)).max(20)}).strict().parse(args);
    // Older connected plugins still finish their daily run with record_check.
    // Refresh here too so the catalog does not depend on discovery of the new tool.
    let catalog:Awaited<ReturnType<typeof refreshKiokuCatalog>>|undefined;
    try{
      const current=await readPublicContent();
      catalog=current.catalogCheck?.checkedAt.slice(0,10)===new Date().toISOString().slice(0,10)&&current.catalogCheck.failures.length===0?current.catalogCheck:await refreshKiokuCatalog();
      if(catalog.failures.length)input.failures.push(...catalog.failures.slice(0,20).map(message=>('Catálogo: '+message).slice(0,400)));
    }catch(e){input.failures.push('Catálogo: '+(e instanceof Error?e.message:'CATALOG_UPDATE_FAILED'));}
    const at=new Date().toISOString();
    await savePublicState('last_check',input,at);
    return {checkedAt:at,...input,catalog};
  }
  throw new Error('UNKNOWN_TOOL');
}
