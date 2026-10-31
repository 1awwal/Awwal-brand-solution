// Server-side building blocks. Not exposed or enabled on the live website.
const services = {
  brand:'Brand identity & graphic design',marketing:'Digital marketing & advertising',
  photo:'Photography & video production',web:'Website design & management',
  launch:'Complete brand launch',social:'Monthly social media',events:'Corporate & private events',
  campaign:'Advertising campaign',other:'Other'
};
const digits = value => value.replace(/[٠-٩۰-۹]/g,c=>String(c.charCodeAt(0)-(c<='٩'?0x660:0x6f0)));
const validText = value => /^[\p{L}\p{M}\p{N} ,،&\-\r\n]+$/u.test(value) && /[\p{L}\p{N}]/u.test(value);
export function validateLead(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {errors:{form:'Invalid form'}};
  const data={},errors={};
  for (const key of ['name','company','email','phone','budget','service','message']) {
    if (input[key] != null && typeof input[key] !== 'string') errors[key]='Text required';
    data[key]=typeof input[key]==='string'?input[key].trim():'';
  }
  data.phone=digits(data.phone); data.budget=digits(data.budget);
  if (!/^[\p{L}\p{M} ]+$/u.test(data.name)||!/\p{L}/u.test(data.name)||data.name.length>100) errors.name='Letters and spaces only';
  if (data.company && (!validText(data.company)||data.company.length>120)) errors.company='Invalid company';
  if (!/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(data.email)||data.email.length>254) errors.email='Invalid email';
  if (data.phone&&!/^\+?[0-9]{7,15}$/.test(data.phone)) errors.phone='Invalid phone';
  if (data.budget&&!/^[0-9]{1,12}$/.test(data.budget)) errors.budget='Digits only, SAR';
  if (!Object.hasOwn(services,data.service)) errors.service='Invalid service';
  if (!validText(data.message)||data.message.length>2000) errors.message='Invalid brief';
  if (input.consent!==true) errors.consent='Consent required';
  return {data,errors};
}
export function notificationParameters(reference,data) {
  return [reference,data.name,data.company||'Not provided',data.email,data.phone||'Not provided',
    services[data.service],data.budget?`${data.budget} SAR`:'Not specified',data.message];
}
export function templatePayload(reference,data,config) {
  if (!/^\d{7,15}$/.test(config.recipient||'')) throw new Error('Configure the owner recipient');
  if (config.senderNumber===config.recipient) throw new Error('Sender must differ from recipient');
  if (!/^[a-z0-9_]+$/.test(config.template||'')) throw new Error('Configure an approved utility template');
  if (!config.language) throw new Error('Configure approved template language');
  return {messaging_product:'whatsapp',to:config.recipient,type:'template',template:{
    name:config.template,language:{code:config.language},components:[{type:'body',parameters:
      notificationParameters(reference,data).map(text=>({type:'text',text}))}]
  }};
}
// A durable outbox must call this and persist the returned ID before acknowledging processing.
// Acceptance is NOT a delivery receipt. Signed Meta status webhooks must track final delivery.
export async function sendNotification(reference,data,config,transport=fetch) {
  if (!/^v\d+\.\d+$/.test(config.apiVersion||'')||!/^\d+$/.test(config.phoneId||'')||!config.accessToken) throw new Error('Missing server configuration');
  const response=await transport(`https://graph.facebook.com/${config.apiVersion}/${config.phoneId}/messages`,{
    method:'POST',headers:{Authorization:`Bearer ${config.accessToken}`,'Content-Type':'application/json'},
    body:JSON.stringify(templatePayload(reference,data,config)),signal:AbortSignal.timeout(15000)
  });
  if (!response.ok) throw new Error(`WhatsApp API rejected notification (${response.status})`);
  const result=await response.json(),id=result.messages?.[0]?.id;
  if (!id) throw new Error('WhatsApp API returned no message identifier');
  return {state:'accepted',id};
}
