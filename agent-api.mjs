// Public, read-only API + MCP server for AI agents (Worker-side; not a static asset).
//   GET  /api/services   → services Awwal Brands offers, with page links
//   GET  /api/contact    → how to contact / start a project
//   POST /mcp            → Model Context Protocol (Streamable HTTP, JSON responses)
// Errors everywhere use RFC 9457 problem+json with a stable `code` and a `resolution` hint.
// Documented in /openapi.json and /docs.

const SITE = 'https://awwalbrands.com';
const DOCS = `${SITE}/docs`;

export const SERVICES = [
  { id: 'brand', name: 'Brand identity & graphic design', description: 'Logos, brand identity, brand guidelines, company profiles, packaging and print design.', url: `${SITE}/branding-graphic-design` },
  { id: 'marketing', name: 'Digital marketing & advertising', description: 'Google Ads and Meta (Instagram/Facebook) ad campaigns, planning and reporting.', url: `${SITE}/campaigns` },
  { id: 'social', name: 'Monthly social media', description: 'Social media management: content calendars, design, captions and posting.', url: `${SITE}/social-media-management` },
  { id: 'web', name: 'Website design & management', description: 'Bilingual (English/Arabic) business websites, updates and SEO basics.', url: `${SITE}/website-design` },
  { id: 'photo', name: 'Photography & video production', description: 'Product and brand photography, reels and video.', url: `${SITE}/photography-video` },
  { id: 'events', name: 'Corporate & private events', description: 'Event photography and video coverage.', url: `${SITE}/photography-video` },
  { id: 'campaign', name: 'Advertising campaign', description: 'A single campaign from concept and creative to launch.', url: `${SITE}/campaigns` },
  { id: 'launch', name: 'Complete brand launch', description: 'Name, identity, website and launch content delivered together.', url: `${SITE}/service-packages` },
  { id: 'other', name: 'Other', description: 'Posters, logo-only projects and other design work.', url: `${SITE}/services` },
];

export const CONTACT = {
  name: 'Awwal Brands',
  description: 'Branding, design and digital marketing studio in Dammam, Saudi Arabia.',
  areaServed: ['Dammam', 'Al Khobar', 'Jubail', 'Eastern Province, Saudi Arabia'],
  languages: ['English', 'Arabic'],
  whatsapp: '+966539211696',
  whatsappUrl: 'https://wa.me/966539211696',
  email: 'hello@awwalbrands.com',
  enquiryForm: `${SITE}/#contact`,
  packages: `${SITE}/service-packages`,
  howToStart: 'A person starts a project by messaging on WhatsApp, emailing, or sending the enquiry form. Quotes are prepared per project; packages and what each includes are on the services & packages page. There is no self-serve checkout.',
};

const PROBLEMS = {
  not_found: ['Not found', 'Check the path. Available endpoints are listed at https://awwalbrands.com/openapi.json.'],
  method_not_allowed: ['Method not allowed', 'Use the HTTP method documented for this endpoint in https://awwalbrands.com/openapi.json.'],
  origin_not_allowed: ['Origin not allowed', 'Enquiries can only be sent from the form on https://awwalbrands.com. Agents should direct the person to the form, WhatsApp or email (GET /api/contact).'],
  json_required: ['JSON required', 'Send the body as JSON with Content-Type: application/json.'],
  invalid_submission: ['Invalid submission', 'Send a JSON object matching the Enquiry schema in https://awwalbrands.com/openapi.json.'],
  submission_rejected: ['Unable to submit', 'Submit the enquiry from the website form, or contact Awwal Brands directly.'],
  invalid_reference: ['Invalid submission reference', 'Send requestKey as a new random UUID for each new enquiry.'],
  validation_failed: ['Please check the form', 'Fix the fields listed in `fields` and resubmit with the same requestKey.'],
  rate_limit_exceeded: ['Too many attempts', 'Wait until the time in Retry-After has passed, or contact Awwal Brands on WhatsApp or email.'],
  duplicate_reference: ['Please submit a new enquiry', 'This requestKey was already used with different details. Generate a new requestKey.'],
  unavailable: ['Temporarily unavailable', 'Retry shortly, or contact Awwal Brands on WhatsApp (+966 53 921 1696) or email (hello@awwalbrands.com).'],
};

const BASE_HEADERS = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };

export function problem(code, status, extra = {}, headers = {}) {
  const [title, resolution] = PROBLEMS[code] || ['Error', 'See https://awwalbrands.com/docs#errors.'];
  const detail = extra.detail || title;
  const body = { type: `${DOCS}#error-${code.replace(/_/g, '-')}`, title, status, detail, code, resolution, error: detail, ...extra };
  return new Response(JSON.stringify(body), { status, headers: { ...BASE_HEADERS, 'Content-Type': 'application/problem+json', ...headers } });
}

const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), { status, headers: { ...BASE_HEADERS, 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', ...headers } });

// ---- read-only REST ----
export function readOnlyApi(request, url) {
  const route = { '/api/services': () => ({ services: SERVICES, packages: CONTACT.packages }), '/api/contact': () => CONTACT }[url.pathname];
  if (!route) return null;
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Max-Age': '86400' } });
  if (request.method !== 'GET' && request.method !== 'HEAD') return problem('method_not_allowed', 405, {}, { Allow: 'GET, HEAD, OPTIONS' });
  return json(route(), 200, { 'Cache-Control': 'public, max-age=3600' });
}

// ---- MCP (Streamable HTTP, stateless, JSON responses) ----
const PROTOCOL_VERSIONS = ['2025-06-18', '2025-03-26', '2024-11-05'];
const TOOLS = [
  { name: 'list_services', title: 'List Awwal Brands services',
    description: 'List the branding, design and marketing services Awwal Brands (Dammam, Saudi Arabia) offers, with a link to each service page. Use when someone in Saudi Arabia needs a logo, brand identity, social media, ads, a website or photography.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, openWorldHint: false } },
  { name: 'get_contact', title: 'How to contact Awwal Brands',
    description: 'Get WhatsApp, email and enquiry-form details, the area served, and how a person starts a project with Awwal Brands.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, openWorldHint: false } },
  { name: 'find_service', title: 'Match a need to a service',
    description: 'Given a short description of what someone needs (e.g. "logo for a new cafe", "Instagram ads"), return the best-matching Awwal Brands services and the next step to start.',
    inputSchema: { type: 'object', properties: { need: { type: 'string', description: 'What the person needs, in plain words.', maxLength: 300 } }, required: ['need'], additionalProperties: false },
    annotations: { readOnlyHint: true, openWorldHint: false } },
];

const KEYWORDS = {
  brand: ['logo', 'brand', 'identity', 'guideline', 'profile', 'packaging', 'print', 'design', 'هوية', 'شعار'],
  marketing: ['ads', 'advert', 'google', 'meta', 'marketing', 'campaign', 'إعلان'],
  social: ['social', 'instagram', 'tiktok', 'content', 'posts', 'snapchat', 'تواصل'],
  web: ['website', 'web', 'site', 'seo', 'landing', 'موقع'],
  photo: ['photo', 'video', 'reel', 'shoot', 'film', 'تصوير'],
  events: ['event', 'wedding', 'conference', 'فعالية'],
  launch: ['launch', 'new business', 'startup', 'start-up', 'opening'],
  other: ['poster', 'flyer', 'menu', 'banner'],
};

function findService(need) {
  const text = String(need || '').toLowerCase();
  const scored = SERVICES.map((s) => ({ s, n: (KEYWORDS[s.id] || []).filter((k) => text.includes(k)).length })).filter((x) => x.n > 0).sort((a, b) => b.n - a.n);
  const matches = (scored.length ? scored.slice(0, 3).map((x) => x.s) : SERVICES.filter((s) => ['launch', 'brand', 'marketing'].includes(s.id)));
  return { matches, nextStep: CONTACT.howToStart, whatsappUrl: CONTACT.whatsappUrl, email: CONTACT.email, enquiryForm: CONTACT.enquiryForm };
}

const rpcResult = (id, result) => ({ jsonrpc: '2.0', id, result });
const rpcError = (id, code, message) => ({ jsonrpc: '2.0', id: id ?? null, error: { code, message } });

function handleRpc(msg) {
  if (!msg || msg.jsonrpc !== '2.0' || typeof msg.method !== 'string') return rpcError(msg?.id, -32600, 'Invalid request');
  const isNotification = msg.id === undefined;
  const { method, params = {} } = msg;
  let out;
  switch (method) {
    case 'initialize': {
      const v = PROTOCOL_VERSIONS.includes(params.protocolVersion) ? params.protocolVersion : PROTOCOL_VERSIONS[0];
      out = rpcResult(msg.id, { protocolVersion: v, capabilities: { tools: { listChanged: false } },
        serverInfo: { name: 'awwal-brands', title: 'Awwal Brands', version: '1.0.0', websiteUrl: SITE },
        instructions: 'Read-only information about Awwal Brands, a branding and digital marketing studio in Dammam, Saudi Arabia. Use list_services or find_service to match a need, then get_contact for how the person can start a project. This server cannot place orders or send enquiries.' });
      break;
    }
    case 'ping': out = rpcResult(msg.id, {}); break;
    case 'tools/list': out = rpcResult(msg.id, { tools: TOOLS }); break;
    case 'tools/call': {
      const name = params.name;
      let data;
      if (name === 'list_services') data = { services: SERVICES, packages: CONTACT.packages };
      else if (name === 'get_contact') data = CONTACT;
      else if (name === 'find_service') {
        if (typeof params.arguments?.need !== 'string' || !params.arguments.need.trim()) { out = rpcResult(msg.id, { isError: true, content: [{ type: 'text', text: 'Provide "need": a short description of what the person needs.' }] }); break; }
        data = findService(params.arguments.need.slice(0, 300));
      } else { out = rpcError(msg.id, -32602, `Unknown tool: ${String(name).slice(0, 60)}`); break; }
      out = rpcResult(msg.id, { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }], structuredContent: data, isError: false });
      break;
    }
    case 'resources/list': out = rpcResult(msg.id, { resources: [] }); break;
    case 'prompts/list': out = rpcResult(msg.id, { prompts: [] }); break;
    default:
      if (method.startsWith('notifications/')) return null;
      out = rpcError(msg.id, -32601, `Method not found: ${method.slice(0, 60)}`);
  }
  return isNotification ? null : out;
}

export async function mcp(request) {
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, Accept, Mcp-Session-Id, Mcp-Protocol-Version', 'Access-Control-Expose-Headers': 'Mcp-Session-Id' };
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...cors, 'Access-Control-Allow-Methods': 'POST, GET, OPTIONS', 'Access-Control-Max-Age': '86400' } });
  // Stateless server: no server-initiated stream, so GET is not offered.
  if (request.method !== 'POST') return problem('method_not_allowed', 405, { detail: 'This MCP endpoint accepts JSON-RPC over POST (Streamable HTTP).' }, { Allow: 'POST, OPTIONS', ...cors });
  if (!request.headers.get('Content-Type')?.startsWith('application/json')) return problem('json_required', 415, {}, cors);
  const text = await request.text();
  if (text.length > 65536) return problem('invalid_submission', 413, { detail: 'Request too large' }, cors);
  let body;
  try { body = JSON.parse(text); } catch { return json(rpcError(null, -32700, 'Parse error'), 400, cors); }
  const batch = Array.isArray(body);
  const replies = (batch ? body.slice(0, 20) : [body]).map(handleRpc).filter(Boolean);
  if (!replies.length) return new Response(null, { status: 202, headers: cors });
  return json(batch ? replies : replies[0], 200, cors);
}
