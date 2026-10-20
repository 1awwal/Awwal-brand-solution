(() => {
  const palettes = [
    {name:'Desert Bloom',mood:'warm',colors:[['Clay','#C65D3A'],['Apricot','#E9A15C'],['Sand','#F1D8A8'],['Olive','#747A4B'],['Ink','#252A31']]},
    {name:'Coastal Calm',mood:'cool',colors:[['Deep Sea','#123B5D'],['Lagoon','#168A91'],['Mist','#B9D8D4'],['Foam','#EAF1E9'],['Coral','#E87562']]},
    {name:'Desert Clay',mood:'earthy',colors:[['Date','#542B23'],['Terracotta','#A84F36'],['Ochre','#D49A42'],['Linen','#E9D6B5'],['Palm','#53634B']]},
    {name:'Fresh Garden',mood:'fresh',colors:[['Forest','#254E3E'],['Leaf','#5F9B65'],['Lime','#C5D86D'],['Petal','#F2C5AE'],['Cream','#F6F0DF']]},
    {name:'Electric Studio',mood:'bold',colors:[['Ultraviolet','#4025A8'],['Pulse','#F0528B'],['Signal','#F4B43C'],['Sky','#76C8D2'],['Midnight','#111729']]},
    {name:'Soft Minimal',mood:'neutral',colors:[['Chalk','#F5F2EA'],['Stone','#D6D2C9'],['Mushroom','#A8A093'],['Graphite','#52535A'],['Night','#22242A']]},
    {name:'Awwal Signature',mood:'bold',colors:[['First Blue','#000080'],['First Light','#FFB703'],['White','#FFFFFF'],['Black','#000000'],['Skyline','#6E8CE8']]},
    {name:'Market Lights',mood:'warm',colors:[['Berry','#7D3153'],['Rose','#C65569'],['Mango','#F2A43A'],['Mint','#A9C9A5'],['Night','#20223A']]},
    {name:'Olive Atelier',mood:'earthy',colors:[['Moss','#344B3C'],['Sage','#859477'],['Parchment','#E6DCCB'],['Rust','#A64E35'],['Cocoa','#34251F']]},
    {name:'After Hours',mood:'cool',colors:[['Ink','#101828'],['Blue Hour','#304D75'],['Lilac','#9A91C9'],['Ice','#C8E3E8'],['Moon','#F4F0E8']]},
    {name:'Soft Signal',mood:'neutral',colors:[['Cloud','#F3F2EF'],['Silver','#C4C7CC'],['Denim','#5E7894'],['Cobalt','#2445A5'],['Charcoal','#272B33']]},
    {name:'Citrus Club',mood:'fresh',colors:[['Lime','#C5D82E'],['Leaf','#56814B'],['Cream','#F4E9C8'],['Tangerine','#F17E33'],['Berry','#662D55']]},
  ].map(p => ({name:p.name,mood:p.mood,colors:p.colors.map(([name,hex]) => ({name,hex}))}));
  const $ = selector => document.querySelector(selector);
  const clone = value => JSON.parse(JSON.stringify(value));
  const list = $('#palette-list'), swatches = $('#palette-swatches'), status = $('#palette-status');
  const savedKey = 'awwal-palette-library-v1';
  const readSaved = () => { try { const value = JSON.parse(localStorage.getItem(savedKey) || '[]'); return Array.isArray(value) ? value.filter(validPalette) : []; } catch { return []; } };
  const validHex = value => /^#[0-9a-f]{6}$/i.test(value);
  const validPalette = item => item && typeof item.name === 'string' && Array.isArray(item.colors) && item.colors.length >= 3 && item.colors.length <= 10 && item.colors.every(c => c && validHex(c.hex));
  const announce = message => { status.textContent = message; };
  const saved = readSaved();
  let current = clone(palettes[0]), filter = 'all', locked = new Set(), extracted = [], sourceUrl = '';
  const norm = hex => { const raw = hex.trim().replace(/^#/,''); if (/^[0-9a-f]{3}$/i.test(raw)) return `#${[...raw].map(c => c+c).join('').toUpperCase()}`; if (/^[0-9a-f]{6}$/i.test(raw)) return `#${raw.toUpperCase()}`; return null; };
  const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const slug = value => value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'awwal-palette';
  const colorByIndex = index => current.colors[index]?.hex || '#FFFFFF';

  function rgb(hex) { const value = parseInt(hex.slice(1),16); return {r:value>>16,g:(value>>8)&255,b:value&255}; }
  function hexOf({r,g,b}) { return `#${[r,g,b].map(v => Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('').toUpperCase()}`; }
  function toHsl(hex) {
    const {r:R,g:G,b:B}=rgb(hex), r=R/255,g=G/255,b=B/255,max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;
    let h=0,s=0,l=(max+min)/2;
    if(d){s=d/(1-Math.abs(2*l-1));if(max===r)h=((g-b)/d)%6;else if(max===g)h=(b-r)/d+2;else h=(r-g)/d+4;h*=60;if(h<0)h+=360;}
    return {h,s:s*100,l:l*100};
  }
  function fromHsl(h,s,l) {
    h=((h%360)+360)%360;s=Math.max(0,Math.min(100,s))/100;l=Math.max(0,Math.min(100,l))/100;
    const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2;let r=0,g=0,b=0;
    if(h<60)[r,g,b]=[c,x,0];else if(h<120)[r,g,b]=[x,c,0];else if(h<180)[r,g,b]=[0,c,x];else if(h<240)[r,g,b]=[0,x,c];else if(h<300)[r,g,b]=[x,0,c];else[r,g,b]=[c,0,x];
    return hexOf({r:(r+m)*255,g:(g+m)*255,b:(b+m)*255});
  }
  const luminance = hex => { const c=rgb(hex);const v=[c.r,c.g,c.b].map(n=>{n/=255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4;});return .2126*v[0]+.7152*v[1]+.0722*v[2]; };
  const contrast = (a,b) => { const values=[luminance(a),luminance(b)].sort((x,y)=>y-x);return (values[0]+.05)/(values[1]+.05); };
  const modeLabel = ratio => ratio >= 7 ? 'AAA · normal text' : ratio >= 4.5 ? 'AA · normal text' : ratio >= 3 ? 'AA · large text only' : 'Needs more contrast';

  function renderLibrary() {
    const term=$('#palette-search').value.trim().toLowerCase();
    const visible=palettes.filter(p=>(filter==='all'||p.mood===filter)&&(!term||`${p.name} ${p.mood} ${p.colors.map(c=>c.name).join(' ')}`.toLowerCase().includes(term)));
    $('#palette-count').textContent=`${String(visible.length).padStart(2,'0')} PALETTES`;
    list.replaceChildren();
    visible.forEach(palette=>{
      const card=document.createElement('button');card.type='button';card.className=`palette-card${palette.name===current.name?' is-selected':''}`;card.setAttribute('aria-pressed',String(palette.name===current.name));card.setAttribute('aria-label',`Use ${palette.name} palette`);
      const strip=document.createElement('span');strip.className='palette-card-swatches';palette.colors.forEach(color=>{const sw=document.createElement('i');sw.style.backgroundColor=color.hex;strip.append(sw);});
      const meta=document.createElement('span');meta.className='palette-card-meta';const name=document.createElement('strong');name.textContent=palette.name;const mood=document.createElement('small');mood.textContent=palette.mood;meta.append(name,mood);card.append(strip,meta);
      card.addEventListener('click',()=>loadPalette(palette));list.append(card);
    });
  }
  function loadPalette(palette, message) { current=clone(palette);locked.clear();renderAll();announce(message||`${current.name} is ready to customize.`); }
  function renderBuilder() {
    $('#current-palette-name').value=current.name;
    $('#color-count-label').textContent=`${String(current.colors.length).padStart(2,'0')} COLORS`;
    swatches.replaceChildren();
    current.colors.forEach((color,index)=>{
      const item=document.createElement('div');item.className=`editable-color${locked.has(index)?' is-locked':''}`;
      const label=document.createElement('label');label.className='editable-color-swatch';label.style.backgroundColor=color.hex;
      const picker=document.createElement('input');picker.type='color';picker.value=color.hex;picker.setAttribute('aria-label',`Choose ${color.name} color`);
      const code=document.createElement('input');code.className='editable-color-code';code.type='text';code.value=color.hex;code.maxLength=7;code.setAttribute('aria-label',`${color.name} color code`);code.spellcheck=false;
      const updateColor=hex=>{color.hex=hex;picker.value=hex;code.value=hex;label.style.backgroundColor=hex;renderTools();renderLibrary();};
      picker.addEventListener('input',()=>{updateColor(picker.value.toUpperCase());announce(`${color.name} updated to ${color.hex}.`);});
      code.addEventListener('change',()=>{const hex=norm(code.value);if(hex){updateColor(hex);announce(`${color.name} updated to ${hex}.`);}else{code.value=color.hex;announce('Enter a valid 3 or 6 digit color code.');}});
      code.addEventListener('focus',()=>code.select());
      label.append(picker);item.append(label,code);
      const lock=document.createElement('button');lock.type='button';lock.className='lock-color';lock.textContent=locked.has(index)?'LOCKED':'LOCK';lock.setAttribute('aria-pressed',String(locked.has(index)));lock.setAttribute('aria-label',`${locked.has(index)?'Unlock':'Lock'} ${color.name}`);lock.addEventListener('click',()=>{locked.has(index)?locked.delete(index):locked.add(index);renderBuilder();});item.append(lock);
      if(current.colors.length>3){const remove=document.createElement('button');remove.type='button';remove.className='remove-color';remove.textContent='×';remove.setAttribute('aria-label',`Remove ${color.name}`);remove.addEventListener('click',()=>{current.colors.splice(index,1);locked=new Set([...locked].filter(i=>i!==index).map(i=>i>index?i-1:i));renderAll();announce('Color removed from your palette.');});item.append(remove);}
      swatches.append(item);
    });
    $('#add-color').disabled=current.colors.length>=10;
    $('#generator-count').value=String(current.colors.length);
  }
  function generateSet(type, count, baseHex) {
    const base=toHsl(baseHex||hexOf({r:Math.random()*255,g:Math.random()*255,b:Math.random()*255}));
    const output=[];
    for(let i=0;i<count;i++){
      let hue=base.h,sat=base.s,light=base.l;
      if(type==='analogous')hue+=((i/(count-1||1))-.5)*74;
      else if(type==='complementary')hue+=(i%2?180:0)+Math.floor(i/2)*12;
      else if(type==='triadic')hue+=[0,120,240][i%3]+Math.floor(i/3)*8;
      else if(type==='monochrome'){sat=Math.max(28,Math.min(88,base.s+(i%2?10:-8)));light=20+i*(60/(count-1||1));}
      else {hue+=i===0?0:(i*137.508+Math.random()*34);sat=46+Math.random()*38;light=30+Math.random()*46;}
      if(type!=='monochrome'&&type!=='random')light=Math.max(26,Math.min(78,base.l+(i%2?12:-12)+i*2));
      output.push({name:`Color ${i+1}`,hex:fromHsl(hue,sat,light)});
    }
    return output;
  }
  function generate() {
    const count=Number($('#generator-count').value),type=$('#generator-harmony').value;
    const next=generateSet(type,count,current.colors[0]?.hex);
    locked.forEach(index=>{if(current.colors[index]&&next[index])next[index]=clone(current.colors[index]);});
    current={name:'Awwal Mix',mood:'custom',colors:next};renderAll();announce(`${type==='random'?'A fresh mix':`${type} colors`} generated. Locked colors were kept.`);
  }

  function renderTools() {
    const lums=current.colors.map((c,i)=>({i,l:luminance(c.hex)})).sort((a,b)=>a.l-b.l);
    const inkIndex=lums[0]?.i||0, paperIndex=lums[lums.length-1]?.i||0;
    const preview=$('#brand-preview');
    preview.style.setProperty('--preview-primary',colorByIndex(0));preview.style.setProperty('--preview-secondary',colorByIndex(1));preview.style.setProperty('--preview-accent',colorByIndex(2));preview.style.setProperty('--preview-paper',colorByIndex(paperIndex));preview.style.setProperty('--preview-ink',colorByIndex(inkIndex));
    const fg=$('#contrast-foreground'),bg=$('#contrast-background');
    const previousFg=fg.value===''?NaN:Number(fg.value),previousBg=bg.value===''?NaN:Number(bg.value);
    const options=current.colors.map((c,i)=>`<option value="${i}">${esc(c.name)} · ${c.hex}</option>`).join('');
    fg.innerHTML=options;bg.innerHTML=options;fg.value=String(Number.isInteger(previousFg)&&previousFg<current.colors.length?previousFg:inkIndex);bg.value=String(Number.isInteger(previousBg)&&previousBg<current.colors.length?previousBg:paperIndex);
    for(const id of ['gradient-from','gradient-to']){const select=$(`#${id}`),prev=select.value===''?NaN:Number(select.value);select.innerHTML=options;select.value=String(Number.isInteger(prev)&&prev<current.colors.length?prev:(id==='gradient-from'?0:Math.min(1,current.colors.length-1)));}
    updateContrast();updateGradient();renderVariations(lastVariation);
  }
  function updateContrast() {
    const foreground=colorByIndex(Number($('#contrast-foreground').value)||0),background=colorByIndex(Number($('#contrast-background').value)||0),ratio=contrast(foreground,background);
    const sample=$('#contrast-sample');sample.style.color=foreground;sample.style.backgroundColor=background;
    const normal=ratio>=4.5,large=ratio>=3;
    $('#contrast-result').innerHTML=`<strong>${ratio.toFixed(2)} : 1</strong><span>${modeLabel(ratio)}</span><div class="contrast-badges"><b class="${normal?'pass':'fail'}">AA ${normal?'PASS':'FAIL'}</b><b class="${ratio>=7?'pass':'fail'}">AAA ${ratio>=7?'PASS':'FAIL'}</b><b class="${large?'pass':'fail'}">LARGE ${large?'PASS':'FAIL'}</b></div>`;
  }
  function updateGradient() {
    const a=colorByIndex(Number($('#gradient-from').value)||0),b=colorByIndex(Number($('#gradient-to').value)||1),direction=$('#gradient-direction').value;
    $('#gradient-preview').style.background=`linear-gradient(${direction}, ${a}, ${b})`;
    $('#gradient-preview').dataset.css=`background: linear-gradient(${direction}, ${a}, ${b});`;
  }
  let lastVariation='analogous';
  function simulate(hex,type) {
    const {r,g,b}=rgb(hex),x=r/255,y=g/255,z=b/255;
    const matrices={protanopia:[[.567,.433,0],[.558,.442,0],[0,.242,.758]],deuteranopia:[[.625,.375,0],[.7,.3,0],[0,.3,.7]],tritanopia:[[.95,.05,0],[0,.433,.567],[0,.475,.525]]};
    const m=matrices[type];return hexOf({r:(m[0][0]*x+m[0][1]*y+m[0][2]*z)*255,g:(m[1][0]*x+m[1][1]*y+m[1][2]*z)*255,b:(m[2][0]*x+m[2][1]*y+m[2][2]*z)*255});
  }
  function renderVariations(type) {
    if(!type)return;lastVariation=type;const base=current.colors[0]?.hex||'#000080';let items=[];
    if(type==='deuteranopia'||type==='protanopia'||type==='tritanopia')items=current.colors.map((c,i)=>({name:c.name,hex:simulate(c.hex,type),source:c.hex,index:i}));
    else if(type==='shades'){const h=toHsl(base);items=Array.from({length:7},(_,i)=>({name:`Shade ${i+1}`,hex:fromHsl(h.h,Math.max(20,h.s),12+i*12)}));}
    else if(type==='warm'||type==='cool'){const h=toHsl(base),target=type==='warm'?35:215,diff=((target-h.h+540)%360)-180;items=Array.from({length:5},(_,i)=>({name:`${type==='warm'?'Warm':'Cool'} ${i+1}`,hex:fromHsl(h.h+diff*(.2+i*.2),Math.max(28,h.s),30+i*9)}));}
    else items=generateSet(type,current.colors.length,base).map((c,i)=>({...c,index:i}));
    const host=$('#variation-results');host.replaceChildren();
    const card=document.createElement('div');card.className='variation-card';const strip=document.createElement('div');strip.className='variation-swatches';
    items.forEach((item,i)=>{const tile=document.createElement('button');tile.type='button';tile.className='variation-swatch';tile.style.backgroundColor=item.hex;tile.setAttribute('aria-label',`${item.name} ${item.hex}`);tile.title=`${item.name} · ${item.hex}`;tile.innerHTML=`<span>${esc(item.hex)}</span>`;tile.addEventListener('click',()=>{const index=item.index??Math.min(i,current.colors.length-1);current.colors[index]={name:item.name,hex:item.hex};renderAll();announce(`${item.hex} applied to your palette.`);});strip.append(tile);});
    card.append(strip);const footer=document.createElement('div');footer.className='variation-card-footer';footer.textContent=type==='deuteranopia'||type==='protanopia'||type==='tritanopia'?`${type[0].toUpperCase()+type.slice(1)} simulation · select a swatch to use the simulated color`:`${type[0].toUpperCase()+type.slice(1)} direction from ${base}`;card.append(footer);host.append(card);
  }
  function renderSaved() {
    $('#saved-count').textContent=String(saved.length);
    const host=$('#saved-palettes');host.replaceChildren();
    if(!saved.length){const empty=document.createElement('p');empty.className='saved-empty';empty.textContent='Your saved palettes will appear here.';host.append(empty);return;}
    saved.forEach((palette,index)=>{const item=document.createElement('div');item.className='saved-palette';const use=document.createElement('button');use.type='button';use.className='saved-palette-use';use.innerHTML=`<span class="saved-strip">${palette.colors.map(c=>`<i style="background:${c.hex}"></i>`).join('')}</span><strong>${esc(palette.name)}</strong>`;use.addEventListener('click',()=>loadPalette(palette,`${palette.name} loaded from your library.`));const remove=document.createElement('button');remove.type='button';remove.className='saved-remove';remove.textContent='REMOVE';remove.setAttribute('aria-label',`Remove ${palette.name} from saved palettes`);remove.addEventListener('click',()=>{saved.splice(index,1);persistSaved();renderSaved();announce('Palette removed from your library.');});item.append(use,remove);host.append(item);});
  }
  function persistSaved(){try{localStorage.setItem(savedKey,JSON.stringify(saved));}catch{announce('This browser could not save the palette. Check storage settings.');}renderSaved();}
  function renderAll(){renderBuilder();renderLibrary();renderTools();renderSaved();}

  document.querySelectorAll('.palette-filter').forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.filter;document.querySelectorAll('.palette-filter').forEach(item=>{const active=item===button;item.classList.toggle('is-active',active);item.setAttribute('aria-pressed',String(active));});renderLibrary();}));
  $('#palette-search').addEventListener('input',renderLibrary);
  $('#generate-palette').addEventListener('click',generate);$('#generator-count').addEventListener('change',generate);
  document.addEventListener('keydown',event=>{if(event.code==='Space'&&!event.repeat&&!event.target.matches('input,textarea,select,button,[contenteditable="true"]')){event.preventDefault();generate();}});
  $('#current-palette-name').addEventListener('change',event=>{current.name=event.target.value.trim().slice(0,48)||'Awwal Mix';event.target.value=current.name;renderLibrary();});
  $('#start-blank').addEventListener('click',()=>loadPalette({name:'Custom Mix',mood:'custom',colors:[{name:'Color 1',hex:'#273043'},{name:'Color 2',hex:'#56627A'},{name:'Color 3',hex:'#A8B0BC'},{name:'Color 4',hex:'#D8DCE1'},{name:'Color 5',hex:'#F4F2EC'}]},'A blank palette is ready. Choose each color to make it yours.'));
  $('#add-color').addEventListener('click',()=>{if(current.colors.length>=10)return;current.colors.push({name:`Color ${current.colors.length+1}`,hex:'#FFB703'});renderAll();announce('A color was added.');});
  $('#import-colors').addEventListener('click',()=>{const codes=$('#palette-import-input').value.match(/#?[0-9a-f]{3}(?:[0-9a-f]{3})?/gi)||[],colors=codes.map(norm).filter(Boolean).slice(0,10);if(colors.length<3){announce('Paste at least three valid color codes.');return;}current={name:'Imported Palette',mood:'custom',colors:colors.map((hex,i)=>({name:`Color ${i+1}`,hex}))};locked.clear();renderAll();announce(`${colors.length} colors imported.`);});
  $('#copy-colors').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(current.colors.map(c=>c.hex).join(', '));announce('Color codes copied.');}catch{announce('Clipboard access is unavailable. Select the codes below to copy them.');}});
  $('#save-palette').addEventListener('click',()=>{const signature=current.colors.map(c=>c.hex).join(',');const duplicate=saved.some(p=>p.colors.map(c=>c.hex).join(',')===signature);if(duplicate){announce('This color set is already in your saved library.');return;}saved.unshift(clone(current));persistSaved();announce(`${current.name} saved in this browser.`);});
  $('#share-palette').addEventListener('click',async()=>{const url=new URL(location.href);url.hash=new URLSearchParams({n:current.name,c:current.colors.map(c=>c.hex.slice(1)).join('-')}).toString();try{await navigator.clipboard.writeText(url.toString());announce('A share link was copied to your clipboard.');}catch{announce(url.toString());}});
  document.querySelectorAll('[data-tool]').forEach(tab=>tab.addEventListener('click',()=>{document.querySelectorAll('[data-tool]').forEach(item=>item.setAttribute('aria-selected',String(item===tab)));document.querySelectorAll('[role="tabpanel"]').forEach(panel=>{panel.hidden=panel.id!==`tool-${tab.dataset.tool}`;});}));
  $('#contrast-foreground').addEventListener('change',updateContrast);$('#contrast-background').addEventListener('change',updateContrast);
  document.querySelectorAll('[data-variation]').forEach(button=>button.addEventListener('click',()=>renderVariations(button.dataset.variation)));
  $('#gradient-from').addEventListener('change',updateGradient);$('#gradient-to').addEventListener('change',updateGradient);$('#gradient-direction').addEventListener('change',updateGradient);
  const saveFile=(blob,filename)=>{if(!blob)return;const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=filename;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  const gradientCss=()=>`background: linear-gradient(${$('#gradient-direction').value}, ${colorByIndex(Number($('#gradient-from').value)||0)}, ${colorByIndex(Number($('#gradient-to').value)||1)});`;
  $('#copy-gradient').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(gradientCss());announce('Gradient CSS copied.');}catch{announce(gradientCss());}});
  $('#download-gradient').addEventListener('click',()=>saveFile(new Blob([`.gradient { ${gradientCss()} }\n`],{type:'text/css'}),`${slug(current.name)}-gradient.css`));
  $('#download-palette').addEventListener('click',()=>{
    const format=$('#download-format').value,colors=current.colors,name=current.name;
    if(format==='css'){saveFile(new Blob([`:root {\n${colors.map((c,i)=>`  --awwal-color-${i+1}: ${c.hex};`).join('\n')}\n}\n`],{type:'text/css;charset=utf-8'}),`${slug(name)}.css`);}
    else if(format==='ase'){
      const encoder=new TextEncoder();const bytes=[];const push16=value=>bytes.push((value>>8)&255,value&255);const push32=value=>bytes.push((value>>>24)&255,(value>>>16)&255,(value>>>8)&255,value&255);const pushText=value=>bytes.push(...encoder.encode(value));
      pushText('ASEF');push16(1);push16(0);push32(colors.length);
      colors.forEach(color=>{const nameBytes=[];for(let index=0;index<color.name.length+1;index++){const code=index===color.name.length?0:color.name.charCodeAt(index);nameBytes.push((code>>8)&255,code&255);}const blockLength=2+nameBytes.length+4+12+2;push16(0x0001);push32(blockLength);push16(nameBytes.length/2);bytes.push(...nameBytes);pushText('RGB ');const values=rgb(color.hex);for(const channel of [values.r,values.g,values.b]){const buffer=new ArrayBuffer(4);new DataView(buffer).setFloat32(0,channel/255,false);bytes.push(...new Uint8Array(buffer));}push16(0);});
      saveFile(new Blob([new Uint8Array(bytes)],{type:'application/octet-stream'}),`${slug(name)}.ase`);
    }
    else if(format==='json'){saveFile(new Blob([JSON.stringify({name,colors},null,2)],{type:'application/json'}),`${slug(name)}.json`);}
    else if(format==='tailwind'){const values=Object.fromEntries(colors.map((c,i)=>[slug(c.name)||`color-${i+1}`,c.hex]));saveFile(new Blob([JSON.stringify({theme:{extend:{colors:{awwal:values}}}},null,2)],{type:'application/json'}),`${slug(name)}-tailwind.json`);}
    else if(format==='txt'){saveFile(new Blob([`${name}\n${colors.map(c=>`${c.name.padEnd(16)} ${c.hex}  rgb(${Object.values(rgb(c.hex)).join(', ')})`).join('\n')}\n`],{type:'text/plain;charset=utf-8'}),`${slug(name)}.txt`);}
    else if(format==='svg'){
      const width=1200,height=560,sw=width/colors.length;const rects=colors.map((c,i)=>`<rect x="${i*sw}" y="125" width="${sw+1}" height="300" fill="${c.hex}"/><text x="${i*sw+24}" y="465" font-family="Arial,sans-serif" font-size="18" fill="#151522">${esc(c.name)}</text><text x="${i*sw+24}" y="492" font-family="monospace" font-size="15" fill="#555">${c.hex}</text>`).join('');const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#F6F5F1"/><text x="48" y="58" font-family="monospace" font-size="16" fill="#000080">AWWAL / COLOR STUDIO</text><text x="48" y="102" font-family="Arial,sans-serif" font-weight="700" font-size="34" fill="#151522">${esc(name)}</text>${rects}</svg>`;saveFile(new Blob([svg],{type:'image/svg+xml'}),`${slug(name)}.svg`);
    } else {
      const canvas=document.createElement('canvas');canvas.width=1400;canvas.height=760;const ctx=canvas.getContext('2d');if(!ctx){announce('Could not create the palette image in this browser.');return;}ctx.fillStyle='#F6F5F1';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#000080';ctx.font='500 26px monospace';ctx.fillText('AWWAL / COLOR STUDIO',72,82);ctx.fillStyle='#111018';ctx.font='700 58px Arial';ctx.fillText(name,72,158);const gap=14,left=72,top=210,width=(canvas.width-left*2-gap*(colors.length-1))/colors.length;colors.forEach((c,i)=>{const x=left+i*(width+gap);ctx.fillStyle=c.hex;ctx.fillRect(x,top,width,390);ctx.fillStyle='#111018';ctx.font='600 18px Arial';ctx.fillText(c.name.slice(0,16),x,top+430);ctx.font='500 17px monospace';ctx.fillText(c.hex,x,top+462);});ctx.fillStyle='rgba(17,16,24,.58)';ctx.font='500 15px monospace';ctx.fillText('BUILD TO BE DISTINCT.',72,720);canvas.toBlob(blob=>saveFile(blob,`${slug(name)}.png`),'image/png');
    }
    announce(`${name} downloaded as ${format.toUpperCase()}.`);
  });

  const imageInput=$('#image-picker'),image=$('#source-image'),canvas=$('#image-canvas');let imagePalette=[];
  function processImage(file){if(!file||!file.type.startsWith('image/')){announce('Choose a supported image file.');return;}if(file.size>20*1024*1024){announce('Choose an image under 20 MB.');return;}if(sourceUrl)URL.revokeObjectURL(sourceUrl);sourceUrl=URL.createObjectURL(file);image.hidden=false;image.src=sourceUrl;image.onload=()=>{const ctx=canvas.getContext('2d');const ratio=Math.min(1,120/image.naturalWidth,100/image.naturalHeight);canvas.width=Math.max(1,Math.round(image.naturalWidth*ratio));canvas.height=Math.max(1,Math.round(image.naturalHeight*ratio));ctx.drawImage(image,0,0,canvas.width,canvas.height);const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data,bins=new Map();for(let i=0;i<pixels.length;i+=4){if(pixels[i+3]<120)continue;const r=pixels[i],g=pixels[i+1],b=pixels[i+2],key=`${Math.round(r/24)},${Math.round(g/24)},${Math.round(b/24)}`,item=bins.get(key)||{r:0,g:0,b:0,n:0};item.r+=r;item.g+=g;item.b+=b;item.n++;bins.set(key,item);}const candidates=[...bins.values()].sort((a,b)=>b.n-a.n);imagePalette=[];for(const item of candidates){const hex=hexOf({r:item.r/item.n,g:item.g/item.n,b:item.b/item.n});if(imagePalette.every(c=>{const x=rgb(c.hex),y=rgb(hex);return Math.hypot(x.r-y.r,x.g-y.g,x.b-y.b)>50;}))imagePalette.push({name:`Image ${imagePalette.length+1}`,hex});if(imagePalette.length>=10)break;}const count=Number($('#extract-count').value);while(imagePalette.length<count)imagePalette.push({name:`Image ${imagePalette.length+1}`,hex:imagePalette[imagePalette.length-1]?.hex||'#000080'});$('#extract-colors').disabled=false;$('#image-picker-stage').classList.add('has-image');announce('Colors found. Choose how many to keep, then use them.');};image.onerror=()=>announce('That image could not be opened. Try another file.');}
  imageInput.addEventListener('change',()=>processImage(imageInput.files[0]));
  const imageStage=$('#image-picker-stage');['dragenter','dragover'].forEach(type=>imageStage.addEventListener(type,event=>{event.preventDefault();imageStage.classList.add('is-dragging');}));['dragleave','drop'].forEach(type=>imageStage.addEventListener(type,event=>{event.preventDefault();imageStage.classList.remove('is-dragging');}));imageStage.addEventListener('drop',event=>processImage(event.dataTransfer.files[0]));
  $('#extract-colors').addEventListener('click',()=>{if(!imagePalette.length)return;current={name:'Image Palette',mood:'custom',colors:imagePalette.slice(0,Number($('#extract-count').value))};locked.clear();renderAll();announce(`${current.colors.length} colors extracted from your image.`);});

  document.querySelectorAll('[data-tool]').forEach(tab=>tab.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();const tabs=[...document.querySelectorAll('[data-tool]')],index=tabs.indexOf(tab),next=tabs[(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length];next.focus();next.click();}));
  const shared=new URLSearchParams(location.hash.slice(1)),sharedColors=(shared.get('c')||'').split('-').map(hex=>norm(hex)).filter(Boolean);
  if(sharedColors.length>=3&&sharedColors.length<=10){current={name:(shared.get('n')||'Shared Palette').slice(0,48),mood:'custom',colors:sharedColors.map((hex,i)=>({name:`Color ${i+1}`,hex}))};}
  renderAll();
  if(matchMedia('(pointer:fine)').matches&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const glow=document.createElement('span');glow.className='palette-pointer-glow';glow.setAttribute('aria-hidden','true');document.body.append(glow);let hideTimer;document.addEventListener('pointermove',event=>{glow.style.setProperty('--pointer-x',`${event.clientX}px`);glow.style.setProperty('--pointer-y',`${event.clientY}px`);glow.classList.add('is-visible');clearTimeout(hideTimer);hideTimer=setTimeout(()=>glow.classList.remove('is-visible'),850);},{passive:true});}
})();
