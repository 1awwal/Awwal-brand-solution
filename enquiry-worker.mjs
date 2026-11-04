import {validateLead,notificationParameters} from './enquiry-server.mjs';

// Owner WhatsApp alert for every lead. Configure Worker variables/secrets:
//  Meta WhatsApp Cloud API (preferred): WHATSAPP_TOKEN (secret), WHATSAPP_PHONE_ID, WHATSAPP_TO (e.g. 966539211696),
//    optional WHATSAPP_TEMPLATE + WHATSAPP_TEMPLATE_LANG (approved utility template with 8 body variables),
//    optional WHATSAPP_API_VERSION (default v21.0).
//  CallMeBot (fallback, free): CALLMEBOT_PHONE, CALLMEBOT_APIKEY.
// Nothing configured = skipped; the lead is already saved and the visitor is redirected to WhatsApp.
function leadLines(reference,data){
  const [ref,name,company,email,phone,service,budget,message]=notificationParameters(reference,data);
  return {params:[ref,name,company,email,phone,service,budget,message],
    text:['*New website lead* '+ref,'Name: '+name,'Company: '+company,'Email: '+email,'Phone: '+phone,'Service: '+service,'Budget: '+budget,'','Details: '+message].join('\n')};
}
async function metaSend(env,body,transport){
  const version=/^v\d+\.\d+$/.test(env.WHATSAPP_API_VERSION||'')?env.WHATSAPP_API_VERSION:'v21.0';
  const r=await transport(`https://graph.facebook.com/${version}/${encodeURIComponent(env.WHATSAPP_PHONE_ID)}/messages`,{
    method:'POST',headers:{Authorization:'Bearer '+env.WHATSAPP_TOKEN,'Content-Type':'application/json'},
    body:JSON.stringify({messaging_product:'whatsapp',to:String(env.WHATSAPP_TO).replace(/\D/g,''),...body}),signal:AbortSignal.timeout(15000)});
  const result=await r.json().catch(()=>({}));
  return {ok:r.ok&&!!result.messages?.[0]?.id,status:r.status,id:result.messages?.[0]?.id,error:result.error?.message};
}
export async function notifyOwner(reference,data,env,transport=fetch){
  const {params,text}=leadLines(reference,data);
  if(env.WHATSAPP_TOKEN&&env.WHATSAPP_PHONE_ID&&env.WHATSAPP_TO){
    // Free-form text is free inside the 24h window after the owner last messaged the business number.
    const plain=await metaSend(env,{type:'text',text:{preview_url:false,body:text.slice(0,4096)}},transport);
    if(plain.ok)return {state:'sent',via:'meta-text',id:plain.id};
    // Outside the window Meta requires an approved template.
    if(env.WHATSAPP_TEMPLATE){
      const clean=v=>String(v).replace(/[\r\n\t]+/g,' ').replace(/ {4,}/g,'   ').slice(0,1000)||'-';
      const tpl=await metaSend(env,{type:'template',template:{name:env.WHATSAPP_TEMPLATE,language:{code:env.WHATSAPP_TEMPLATE_LANG||'en'},
        components:[{type:'body',parameters:params.map(v=>({type:'text',text:clean(v)}))}]}},transport);
      if(tpl.ok)return {state:'sent',via:'meta-template',id:tpl.id};
      console.error('WhatsApp template alert failed',tpl.status,tpl.error);
    }else console.error('WhatsApp text alert failed',plain.status,plain.error);
  }
  if(env.CALLMEBOT_PHONE&&env.CALLMEBOT_APIKEY){
    const url='https://api.callmebot.com/whatsapp.php?phone='+encodeURIComponent(env.CALLMEBOT_PHONE)+'&text='+encodeURIComponent(text)+'&apikey='+encodeURIComponent(env.CALLMEBOT_APIKEY);
    const r=await transport(url,{signal:AbortSignal.timeout(15000)});
    return {state:r.ok?'sent':'failed',via:'callmebot',status:r.status};
  }
  return {state:'skipped'};
}

const reply=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
async function boundedJson(request) {
  const reader=request.body?.getReader();
  if(!reader)throw new Error('empty');
  let size=0,parts=[];
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>16384){await reader.cancel();throw new Error('large');}parts.push(value);}
  const all=new Uint8Array(size);let offset=0;for(const p of parts){all.set(p,offset);offset+=p.length;}
  return JSON.parse(new TextDecoder().decode(all));
}
export async function capture(request,env,ctx) {
  if(request.method!=='POST')return reply({error:'Method not allowed'},405);
  if(request.headers.get('Origin')!=='https://awwalbrands.com')return reply({error:'Origin not allowed'},403);
  if(!request.headers.get('Content-Type')?.startsWith('application/json'))return reply({error:'JSON required'},415);
  if(!env.ENQUIRIES)return reply({error:'Enquiries temporarily unavailable'},503);
  let input;try{input=await boundedJson(request);}catch{return reply({error:'Invalid or oversized submission'},400);}
  if(!input||typeof input!=='object'||Array.isArray(input))return reply({error:'Invalid submission'},400);
  if(input.website)return reply({error:'Unable to submit'},400);
  if(!/^[a-f0-9-]{36}$/i.test(input.requestKey||''))return reply({error:'Invalid submission reference'},400);
  const {data,errors}=validateLead(input);
  if(Object.keys(errors).length)return reply({error:'Please check the form',fields:errors},422);
  const payload=JSON.stringify({...data,consent:true,source:'awwal_website_enquiry'});
  try{
    // Hash with a time bucket; never retain visitors' raw IP addresses.
    const hour=Math.floor(Date.now()/3600000);
    const raw=(request.headers.get('CF-Connecting-IP')||'unknown')+':'+hour;
    const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(raw))),b=>b.toString(16).padStart(2,'0')).join('');
    const rate=await env.ENQUIRIES.prepare('INSERT INTO enquiry_rate(bucket,attempts,expires_at) VALUES (?,1,?) ON CONFLICT(bucket) DO UPDATE SET attempts=attempts+1 RETURNING attempts').bind(hash,(hour+2)*3600).first();
    if(!rate||rate.attempts>10)return reply({error:'Too many attempts. Please try later or contact us directly.'},429);
    const old=await env.ENQUIRIES.prepare('SELECT id,payload FROM enquiries WHERE request_key=?').bind(input.requestKey).first();
    if(old){if(old.payload!==payload)return reply({error:'Please submit a new enquiry'},409);return reply({received:true,reference:old.id},200);}
    const reference='AW-'+crypto.randomUUID();
    await env.ENQUIRIES.prepare('INSERT INTO enquiries(id,request_key,payload) VALUES (?,?,?)').bind(reference,input.requestKey,payload).run();
    // Only durable receipt is acknowledged; the WhatsApp alert runs after the response.
    const alert=notifyOwner(reference,data,env).catch(()=>({state:'failed'}));
    if(ctx?.waitUntil)ctx.waitUntil(alert);
    return reply({received:true,reference},201);
  }catch{return reply({error:'We could not save your enquiry. Please retry or contact us directly.'},503);}
}
export default {
  async fetch(request,env,ctx) {
    const url=new URL(request.url);
    if(url.protocol!=='https:'){url.protocol='https:';return Response.redirect(url,308);}
    if(url.pathname==='/api/enquiries')return capture(request,env,ctx);
    if(url.pathname.startsWith('/api/'))return reply({error:'Not found'},404);
    if(url.pathname==='/')return homepage(request,env);
    return env.ASSETS.fetch(request);
  }
};

// Homepage content negotiation: AI agents that send "Accept: text/markdown" get a
// clean Markdown version (index.md); browsers get the normal HTML. Vary: Accept
// keeps caches from mixing the two.
const wantsMarkdown=(accept)=>{
  let md=-1,html=-1;
  for(const part of String(accept||'').toLowerCase().split(',')){
    const [type,...params]=part.trim().split(';');
    const q=params.map(x=>x.trim()).find(x=>x.startsWith('q='));
    const weight=q?Number(q.slice(2))||0:1;
    if(type==='text/markdown')md=Math.max(md,weight);
    else if(type==='text/html'||type==='application/xhtml+xml')html=Math.max(html,weight);
  }
  return md>0&&md>=html;
};
async function homepage(request,env){
  const markdown=(request.method==='GET'||request.method==='HEAD')&&wantsMarkdown(request.headers.get('Accept'));
  const res=await env.ASSETS.fetch(markdown?new Request(new URL('/index.md',request.url),request):request);
  const headers=new Headers(res.headers);
  headers.append('Vary','Accept');
  if(markdown&&res.ok){
    headers.set('Content-Type','text/markdown; charset=utf-8');
    headers.set('Link','<https://awwalbrands.com/>; rel="canonical"');
  }
  return new Response(request.method==='HEAD'?null:res.body,{status:res.status,statusText:res.statusText,headers});
}
