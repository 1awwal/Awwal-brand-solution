(() => {
  const starterPalettes = [
    { name: 'Desert Bloom', mood: 'warm', colors: [{name:'Clay',hex:'#C65D3A'},{name:'Apricot',hex:'#E9A15C'},{name:'Sand',hex:'#F1D8A8'},{name:'Olive',hex:'#747A4B'},{name:'Ink',hex:'#252A31'}] },
    { name: 'Coastal Calm', mood: 'cool', colors: [{name:'Deep Sea',hex:'#123B5D'},{name:'Lagoon',hex:'#168A91'},{name:'Mist',hex:'#B9D8D4'},{name:'Foam',hex:'#EAF1E9'},{name:'Coral',hex:'#E87562'}] },
    { name: 'Desert Clay', mood: 'earthy', colors: [{name:'Date',hex:'#542B23'},{name:'Terracotta',hex:'#A84F36'},{name:'Ochre',hex:'#D49A42'},{name:'Linen',hex:'#E9D6B5'},{name:'Palm',hex:'#53634B'}] },
    { name: 'Fresh Garden', mood: 'fresh', colors: [{name:'Forest',hex:'#254E3E'},{name:'Leaf',hex:'#5F9B65'},{name:'Lime',hex:'#C5D86D'},{name:'Petal',hex:'#F2C5AE'},{name:'Cream',hex:'#F6F0DF'}] },
    { name: 'Electric Studio', mood: 'bold', colors: [{name:'Ultraviolet',hex:'#4025A8'},{name:'Pulse',hex:'#F0528B'},{name:'Signal',hex:'#F4B43C'},{name:'Sky',hex:'#76C8D2'},{name:'Midnight',hex:'#111729'}] },
    { name: 'Soft Minimal', mood: 'neutral', colors: [{name:'Chalk',hex:'#F5F2EA'},{name:'Stone',hex:'#D6D2C9'},{name:'Mushroom',hex:'#A8A093'},{name:'Graphite',hex:'#52535A'},{name:'Night',hex:'#22242A'}] },
    { name: 'Awwal Signature', mood: 'bold', colors: [{name:'First Blue',hex:'#000080'},{name:'First Light',hex:'#FFB703'},{name:'White',hex:'#FFFFFF'},{name:'Black',hex:'#000000'},{name:'Skyline',hex:'#6E8CE8'}] },
    { name: 'Market Lights', mood: 'warm', colors: [{name:'Berry',hex:'#7D3153'},{name:'Rose',hex:'#C65569'},{name:'Mango',hex:'#F2A43A'},{name:'Mint',hex:'#A9C9A5'},{name:'Night',hex:'#20223A'}] },
  ];
  const paletteList = document.querySelector('#palette-list');
  const swatches = document.querySelector('#palette-swatches');
  const status = document.querySelector('#palette-status');
  const paletteCount = document.querySelector('#palette-count');
  let current = structuredClone(starterPalettes[0]);
  let filter = 'all';

  const announce = message => { status.textContent = message; };
  const renderLibrary = () => {
    const filtered = starterPalettes.filter(palette => filter === 'all' || palette.mood === filter);
    paletteCount.textContent = `${String(filtered.length).padStart(2,'0')} PALETTES`;
    paletteList.replaceChildren();
    filtered.forEach(palette => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = `palette-card${palette.name === current.name ? ' is-selected' : ''}`;
      card.setAttribute('aria-pressed', String(palette.name === current.name));
      card.setAttribute('aria-label', `Use ${palette.name} palette`);
      const colorStrip = document.createElement('span');
      colorStrip.className = 'palette-card-swatches';
      palette.colors.forEach(color => {
        const swatch = document.createElement('i');
        swatch.style.backgroundColor = color.hex;
        colorStrip.append(swatch);
      });
      const meta = document.createElement('span');
      meta.className = 'palette-card-meta';
      const name = document.createElement('strong'); name.textContent = palette.name;
      const mood = document.createElement('small'); mood.textContent = palette.mood;
      meta.append(name, mood); card.append(colorStrip, meta);
      card.addEventListener('click', () => {
        current = structuredClone(palette);
        renderBuilder(); renderLibrary();
        announce(`${current.name} is ready to customize.`);
      });
      paletteList.append(card);
    });
  };

  const renderBuilder = () => {
    document.querySelector('#current-palette-name').textContent = current.name;
    document.querySelector('#color-count').textContent = `${String(current.colors.length).padStart(2,'0')} COLORS`;
    swatches.replaceChildren();
    current.colors.forEach((color, index) => {
      const item = document.createElement('div'); item.className = 'editable-color';
      const swatchLabel = document.createElement('label'); swatchLabel.className = 'editable-color-swatch';
      swatchLabel.style.backgroundColor = color.hex;
      const picker = document.createElement('input'); picker.type = 'color'; picker.value = color.hex;
      picker.setAttribute('aria-label', `Choose ${color.name} color`);
      picker.addEventListener('input', () => {
        color.hex = picker.value.toUpperCase(); swatchLabel.style.backgroundColor = color.hex;
        code.textContent = color.hex; renderLibrary(); announce(`${color.name} updated to ${color.hex}.`);
      });
      swatchLabel.append(picker);
      const code = document.createElement('span'); code.className = 'editable-color-code'; code.textContent = color.hex;
      item.append(swatchLabel, code);
      if (current.colors.length > 3) {
        const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'remove-color';
        remove.textContent = '×'; remove.setAttribute('aria-label', `Remove ${color.name}`);
        remove.addEventListener('click', () => { current.colors.splice(index,1); renderBuilder(); renderLibrary(); announce('Color removed from your palette.'); });
        item.append(remove);
      }
      swatches.append(item);
    });
    document.querySelector('#add-color').disabled = current.colors.length >= 8;
  };

  document.querySelectorAll('.palette-filter').forEach(button => button.addEventListener('click', () => {
    filter = button.dataset.filter;
    document.querySelectorAll('.palette-filter').forEach(item => {
      const selected = item === button; item.classList.toggle('is-active', selected); item.setAttribute('aria-pressed', String(selected));
    });
    renderLibrary();
  }));
  document.querySelector('#start-blank').addEventListener('click', () => {
    current = { name: 'Custom Mix', mood: 'custom', colors: [{name:'Color 1',hex:'#273043'},{name:'Color 2',hex:'#56627A'},{name:'Color 3',hex:'#A8B0BC'},{name:'Color 4',hex:'#D8DCE1'},{name:'Color 5',hex:'#F4F2EC'}] };
    renderBuilder(); renderLibrary(); announce('A fresh palette is ready. Choose each color to make it yours.');
  });
  document.querySelector('#add-color').addEventListener('click', () => {
    if (current.colors.length >= 8) return;
    current.colors.push({ name: `Color ${current.colors.length + 1}`, hex: '#FFB703' });
    renderBuilder(); announce('A color was added to your palette.');
  });
  document.querySelector('#copy-colors').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(current.colors.map(color => color.hex).join(', ')); announce('Color codes copied.'); }
    catch { announce('Clipboard access is unavailable. Select the color codes below to copy them.'); }
  });

  const saveFile = (blob, filename) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob); const link = document.createElement('a');
    link.href = url; link.download = filename; document.body.append(link); link.click(); link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const safeFilename = () => current.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'my-palette';
  document.querySelector('#download-palette').addEventListener('click', () => {
    const format = document.querySelector('#download-format').value;
    if (format === 'css') {
      const css = `:root {\n${current.colors.map((color,index) => `  --palette-${index + 1}: ${color.hex};`).join('\n')}\n}\n`;
      saveFile(new Blob([css], {type:'text/css;charset=utf-8'}), `${safeFilename()}.css`);
    } else if (format === 'json') {
      const json = JSON.stringify({name:current.name, colors:current.colors.map(color => ({name:color.name,hex:color.hex}))},null,2);
      saveFile(new Blob([json], {type:'application/json'}), `${safeFilename()}.json`);
    } else {
      const canvas = document.createElement('canvas'); canvas.width = 1400; canvas.height = 760;
      const ctx = canvas.getContext('2d'); ctx.fillStyle = '#F6F5F1'; ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle = '#000080'; ctx.font = '500 26px monospace'; ctx.fillText('AWWAL / COLOR STUDIO', 72, 82);
      ctx.fillStyle = '#111018'; ctx.font = '700 58px Arial'; ctx.fillText(current.name, 72, 158);
      const gap = 14, left = 72, top = 210, width = (canvas.width - left*2 - gap*(current.colors.length-1)) / current.colors.length;
      current.colors.forEach((color,index) => {
        const x = left + index*(width+gap); ctx.fillStyle = color.hex; ctx.fillRect(x,top,width,390);
        ctx.fillStyle = '#111018'; ctx.font = '600 20px Arial'; ctx.fillText(color.name, x, top+430);
        ctx.font = '500 18px monospace'; ctx.fillText(color.hex, x, top+462);
      });
      ctx.fillStyle = 'rgba(17,16,24,.58)'; ctx.font = '500 15px monospace'; ctx.fillText('BUILD TO BE DISTINCT.', 72, 720);
      canvas.toBlob(blob => saveFile(blob, `${safeFilename()}.png`), 'image/png');
    }
    announce(`${current.name} downloaded as ${format.toUpperCase()}.`);
  });

  renderLibrary(); renderBuilder();
})();
