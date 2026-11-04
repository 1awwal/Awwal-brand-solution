import {validateLead,notificationParameters} from './enquiry-server.mjs';

// Free owner alert via CallMeBot (https://www.callmebot.com). Set Worker secrets
// CALLMEBOT_PHONE (e.g. +966539211696) and CALLMEBOT_APIKEY to enable; otherwise skipped.
export async function notifyOwner(reference,data,env,transport=fetch){
  if(!env.CALLMEBOT_PHONE||!env.CALLMEBOT_APIKEY)return {state:'skipped'};
  const [ref,name,company,email,phone,service,budget,message]=notificationParameters(reference,data);
  const text=['*New website lead* '+ref,'Name: '+name,'Company: '+company,'Email: '+email,'Phone: '+phone,'Service: '+service,'Budget: '+budget,'','Details: '+message].join('\n');
  const url='https://api.callmebot.com/whatsapp.php?phone='+encodeURIComponent(env.CALLMEBOT_PHONE)+'&text='+encodeURIComponent(text)+'&apikey='+encodeURIComponent(env.CALLMEBOT_APIKEY);
  const r=await transport(url,{signal:AbortSignal.timeout(15000)});
  return {state:r.ok?'sent':'failed',status:r.status};
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
    return env.ASSETS.fetch(request);
  }
};
