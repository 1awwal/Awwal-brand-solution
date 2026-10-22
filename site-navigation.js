(() => {
 const nav=document.querySelector('.nav-wrap'),overlay=document.querySelector('.menu-overlay'),toggle=document.querySelector('.menu-toggle'),close=overlay?.querySelector('.menu-close');
 const scroll=()=>nav?.classList.toggle('scrolled',window.scrollY>30);scroll();window.addEventListener('scroll',scroll,{passive:true});
 if(!overlay||!toggle||!close)return;
 overlay.id='site-menu';toggle.setAttribute('aria-controls','site-menu');toggle.setAttribute('aria-expanded','false');
 let previousOverflow='';
 function setMenu(open){overlay.classList.toggle('open',open);overlay.setAttribute('aria-hidden',String(!open));toggle.setAttribute('aria-expanded',String(open));if(open){previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';close.focus();}else{document.body.style.overflow=previousOverflow;toggle.focus();}}
 toggle.addEventListener('click',()=>setMenu(true));close.addEventListener('click',()=>setMenu(false));overlay.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
 document.addEventListener('keydown',event=>{if(!overlay.classList.contains('open'))return;if(event.key==='Escape'){event.preventDefault();setMenu(false);}if(event.key==='Tab'){const items=[...overlay.querySelectorAll('button,a[href]')].filter(x=>!x.disabled);const first=items[0],last=items[items.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}});
})();
