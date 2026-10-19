(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const loader = document.querySelector('.loader');
  window.addEventListener('load', () => setTimeout(() => { loader?.classList.add('done'); document.body.classList.remove('loading'); }, 380), { once: true });
  setTimeout(() => loader?.classList.add('done'), 1700);

  const nav = document.querySelector('.nav-wrap');
  const onScroll = () => nav?.classList.toggle('scrolled', window.scrollY > 30);
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  const overlay = document.querySelector('.menu-overlay');
  const toggle = document.querySelector('.menu-toggle');
  const close = document.querySelector('.menu-close');
  const setMenu = open => {
    overlay.classList.toggle('open', open);
    overlay.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) close.focus(); else toggle.focus();
  };
  toggle.addEventListener('click', () => setMenu(true));
  close.addEventListener('click', () => setMenu(false));
  overlay.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay.classList.contains('open')) setMenu(false); });

  const translations = {
    '.hero .kicker': ['FIRST IN VISION. PRECISE IN EXECUTION.', 'الأول في الرؤية. دقيق في التنفيذ.'],
    '.hero h1': ['WE BUILD<br>BRANDS THAT<br><span>COME FIRST<span class="period">.</span></span>', 'نبني<br>علامات تجارية<br><span>تأتي أولاً<span class="period">.</span></span>'],
    '.hero-bottom p': ['Strategy, identity and digital experiences<br>for brands ready to move culture forward.', 'استراتيجية وهوية وتجارب رقمية<br>لعلامات تصنع فرقاً في الثقافة.'],
    '.round-link span': ['EXPLORE<br>OUR WORK', 'اكتشف<br>أعمالنا'],
    '.manifesto h2': ['WE START<br>WITH THE <em>FIRST</em><br>IDEA<span class="amber">.</span>', 'نبدأ<br>بالفكرة <em>الأولى</em><br>دائماً<span class="amber">.</span>'],
    '.manifesto-copy .eyebrow': ['ABOUT AWWAL', 'عن أول'],
    '.manifesto-copy p.lead': ['Awwal is rooted in the idea of being first: a pioneering vision, a strong foundation, and a higher standard for how brands are imagined.', 'ترتكز أول على مفهوم البداية: رؤية سبّاقة، وأساس متين، ومعيار أرفع لتصوّر العلامات التجارية.'],
    '.manifesto-copy p:not(.lead)': ['We shape and elevate identities through strategic thinking, innovative design and cinematic precision—bridging cultural authenticity with the possibilities of tomorrow.', 'نصوغ الهويات ونرتقي بها عبر التفكير الاستراتيجي والتصميم المبتكر والدقة السينمائية، لنصل بين أصالة الثقافة وإمكانات الغد.'],
    '.text-link': ['GET TO KNOW OUR APPROACH <i>↗</i>', 'اكتشف منهجيتنا <i>↗</i>'],
    '.services-head h2': ['FROM IDENTITY<br>TO <em>IMPACT.</em>', 'من الهوية<br>إلى <em>الأثر.</em>'],
    '.services-head p': ['One connected practice to make your brand matter—at every touchpoint.', 'منظومة متكاملة تجعل لعلامتك حضوراً مؤثراً في كل نقطة تواصل.'],
    '.service-tail span:last-child': ['GOOD WORK STARTS WITH A GOOD QUESTION <b>↘</b>', 'كل عمل جيد يبدأ بسؤال جيد <b>↘</b>'],
    '.feature-text h2': ['MAKE IT<br><em>MEAN</em><br>SOMETHING.', 'اصنع<br><em>معنى</em><br>يبقى.'],
    '.feature-text p': ['A brand is more than a logo. It’s the feeling, language and experience that make every encounter unmistakably yours.', 'العلامة أكثر من شعار؛ إنها شعور ولغة وتجربة تجعل كل لقاء بها مميزاً ولا يُنسى.'],
    '.feature-text .button': ['BUILD YOUR IDENTITY <i>↗</i>', 'ابنِ هويتك <i>↗</i>'],
    '.statement .eyebrow': ['THE AWWAL STANDARD', 'معيار أول'],
    '.statement h2': ['FIRST IS NOT<br>A POSITION.<br><em>IT’S A STANDARD.</em>', 'الأول ليس<br>موقعاً.<br><em>إنه معيار.</em>'],
    '.work-head h2': ['WORK THAT<br><em>MOVES.</em>', 'أعمال<br><em>تحرّك.</em>'],
    '.work-head p': ['Every project begins with a question worth answering.<br>Here’s where those questions can lead.', 'يبدأ كل مشروع بسؤال يستحق الإجابة.<br>وهنا نرى إلى أين يمكن أن يقودنا.'],
    '.principles-head h2': ['GOOD WORK<br>IS <em>INTENTIONAL.</em>', 'العمل الجيد<br><em>مدروس.</em>'],
    '.principles-head p': ['Clear thinking. Thoughtful making.<br>Progress you can feel.', 'فكر واضح. تنفيذ متقن.<br>وتقدم تلمسه.'],
    '.cta-content h2': ['READY TO PUT<br>YOUR BRAND <em>FIRST?</em>', 'هل أنت مستعد<br>لوضع علامتك <em>أولاً؟</em>'],
    '.cta-content p': ['Let’s shape an identity, campaign or digital experience<br>that moves your brand forward.', 'لنصنع هوية أو حملة أو تجربة رقمية<br>تدفع علامتك إلى الأمام.'],
    '.cta-content .button': ['START A PROJECT <i>↗</i>', 'ابدأ مشروعاً <i>↗</i>'],
  };
  const servicesAr = ['استراتيجية العلامة ومكانتها', 'الهوية البصرية والتصميم', 'عالم العلامة ومطبوعاتها', 'الحملات والمحتوى', 'النمو الرقمي والاجتماعي'];
  const serviceDescsAr = ['اكتشف موقعك. وحدد صوتك.', 'عالم يعرفه الناس ويتذكرونه.', 'الملفات التعريفية والمطبوعات وكل التفاصيل.', 'أفكار صممت لتصل أبعد.', 'استراتيجية وإعلام وزخم.'];
  const navItems = [...document.querySelectorAll('.desktop-nav a')];
  let language = 'en';
  const switchLanguage = () => {
    language = language === 'en' ? 'ar' : 'en';
    const ar = language === 'ar';
    document.documentElement.lang = ar ? 'ar' : 'en';
    document.documentElement.dir = ar ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-en][data-ar]').forEach(el => {
      const next = ar ? el.dataset.ar : el.dataset.en;
      if (el.matches('.menu-overlay nav a')) el.firstChild.textContent = `${next} `;
      else el.textContent = next;
    });
    Object.entries(translations).forEach(([selector, choices]) => {
      const node = document.querySelector(selector); if (node) node.innerHTML = choices[ar ? 1 : 0];
    });
    const putPair = (selector, en, arabic) => { const node = document.querySelector(selector); if (node) node.textContent = ar ? arabic : en; };
    const metadata = [
      ['.manifesto .section-meta span:nth-child(1)', '01 — THE STUDIO', '٠١ — الاستوديو'],
      ['.manifesto .section-meta span:nth-child(2)', 'BUILT ON WHAT COMES FIRST', 'نبني على ما يأتي أولاً'],
      ['.services .section-meta span:nth-child(1)', '02 — WHAT WE DO', '٠٢ — خدماتنا'],
      ['.services .section-meta span:nth-child(2)', 'THOUGHTFUL BY DESIGN', 'تصميم مدروس'],
      ['.feature-top span:last-child', '03 — A SYSTEM, NOT A MARK', '٠٣ — منظومة، لا مجرد رمز'],
      ['.work .section-meta span:nth-child(1)', '04 — SELECTED WORK', '٠٤ — أعمال مختارة'],
      ['.work .section-meta span:nth-child(2)', 'MADE TO MEAN MORE', 'صُنعت لمعنى أكبر'],
      ['.principles .section-meta span:nth-child(1)', '05 — HOW WE WORK', '٠٥ — كيف نعمل'],
      ['.principles .section-meta span:nth-child(2)', 'THE AWWAL STANDARD', 'معيار أول'],
      ['.feature-top .eyebrow', 'IDENTITY IS WHERE IT STARTS', 'من الهوية تبدأ الحكاية'],
      ['.feature-foot span:first-child', 'IDENTITY SYSTEMS / PRINT / CAMPAIGN', 'أنظمة هوية / مطبوعات / حملات'],
      ['.feature-foot span:last-child', 'DESIGNED WITH PURPOSE. MADE TO LAST.', 'صُممت لهدف. وصُنعت لتدوم.'],
      ['.service-tail span:first-child', 'STRATEGY / DESIGN / DIGITAL', 'استراتيجية / تصميم / رقمي'],
      ['.service-row:nth-child(1) .service-num', '01', '٠١'],['.service-row:nth-child(2) .service-num', '02', '٠٢'],['.service-row:nth-child(3) .service-num', '03', '٠٣'],['.service-row:nth-child(4) .service-num', '04', '٠٤'],['.service-row:nth-child(5) .service-num', '05', '٠٥'],
      ['.principle-grid article:nth-child(1) h3', 'VISION', 'الرؤية'],['.principle-grid article:nth-child(1) p', 'See the opportunity beneath the obvious. Begin with possibility, then give it direction.', 'نرى الفرصة وراء المألوف. نبدأ بالاحتمال ثم نمنحه اتجاهاً واضحاً.'],
      ['.principle-grid article:nth-child(2) h3', 'PRECISION', 'الدقة'],['.principle-grid article:nth-child(2) p', 'Every choice has a reason. Every detail earns its place in the bigger picture.', 'لكل اختيار سبب، ولكل تفصيل مكانه في الصورة الأكبر.'],
      ['.principle-grid article:nth-child(3) h3', 'CULTURE', 'الثقافة'],['.principle-grid article:nth-child(3) p', 'Make work that understands where it comes from and knows where it can go.', 'نصنع عملاً يعرف جذوره ويستشرف آفاقه.'],
      ['.principle-grid article:nth-child(4) h3', 'IMPACT', 'الأثر'],['.principle-grid article:nth-child(4) p', 'Build for the moment, and for all the moments that follow it.', 'نصنع للحظة، ولكل ما يأتي بعدها.'],
      ['.process-line span:nth-child(1)', 'DISCOVER', 'اكتشف'],['.process-line span:nth-child(2)', 'DEFINE', 'حدّد'],['.process-line span:nth-child(3)', 'DESIGN', 'صمّم'],['.process-line span:nth-child(4)', 'DEVELOP', 'طوّر'],['.process-line span:nth-child(5)', 'DELIVER', 'أطلق'],
      ['.cta-content .eyebrow', 'YOUR NEXT CHAPTER STARTS HERE', 'فصل علامتك القادم يبدأ هنا'],
      ['.form-heading span:first-child', 'HAVE A PROJECT IN MIND?', 'هل لديك مشروع في ذهنك؟'],['.form-heading span:last-child', 'LET’S TALK ↘', 'لنتحدث ↘'],
      ['.form-submit', 'SEND YOUR NOTE ↗', 'أرسل رسالتك ↗'],['.form-status', 'This opens your email app with your message ready to send.', 'يفتح هذا تطبيق البريد برسالتك جاهزة للإرسال.'],
      ['.footer-links:nth-child(2) .eyebrow', 'EXPLORE', 'اكتشف'],['.footer-links:nth-child(2) a:nth-of-type(1)', 'About', 'عن أول'],['.footer-links:nth-child(2) a:nth-of-type(2)', 'Services', 'الخدمات'],['.footer-links:nth-child(2) a:nth-of-type(3)', 'Selected work', 'أعمال مختارة'],['.footer-links:nth-child(2) a:nth-of-type(4)', 'Our approach', 'منهجيتنا'],
      ['.footer-links:nth-child(3) .eyebrow', 'SAY HELLO', 'تواصل معنا'],['.footer-links:nth-child(4) .eyebrow', 'FOLLOW ALONG', 'تابعنا'],['.footer-links:nth-child(4) span:last-child', 'Social links coming soon', 'روابط التواصل قريباً'],
      ['.footer-bottom span:first-child', '© AWWAL BRAND SOLUTIONS 2025', '© أول للحلول التجارية ٢٠٢٥'],['.footer-bottom span:nth-child(2)', 'أول — FIRST, BY DESIGN.', 'أول — الأول، بتصميمه.'],['.footer-bottom a', 'BACK TO TOP ↑', 'العودة للأعلى ↑'],
      ['.scroll-cue span', 'SCROLL TO DISCOVER', 'مرر لاكتشاف المزيد'],['.hero-top .eyebrow', 'INDEPENDENT CREATIVE STUDIO · RIYADH', 'استوديو إبداعي مستقل · الرياض'],['.hero-side', 'BRAND THINKING / 24°42′ N 46°40′ E', 'فكر العلامة / ٢٤°٤٢′ شمالاً ٤٦°٤٠′ شرقاً'],
    ];
    metadata.forEach(([selector, en, arabic]) => putPair(selector, en, arabic));
    document.querySelector('.footer-brand p').innerHTML = ar ? 'نبني ما<br>يأتي أولاً.' : 'Building what<br>comes first.';
    const formLabels = ar ? ['الاسم','الشركة','البريد الإلكتروني','الهاتف','ما الخدمة المطلوبة؟','ميزانية المشروع','أخبرنا عن مشروعك'] : ['Name','Company','Email','Phone','What do you need?','Project budget','Tell us a little about it'];
    document.querySelectorAll('.form-grid label').forEach((label, i) => { const input = label.querySelector('input,select,textarea'); label.childNodes[0].textContent = `${formLabels[i]} `; if (input?.placeholder) input.placeholder = ar ? ({'Your name':'الاسم الكامل','Company name':'اسم الشركة','you@company.com':'name@company.com','+966':'+966','Optional':'اختياري','A few words about your project…':'اكتب نبذة قصيرة عن مشروعك…'}[input.placeholder] || input.placeholder) : ({'الاسم الكامل':'Your name','اسم الشركة':'Company name','name@company.com':'you@company.com','اختياري':'Optional','اكتب نبذة قصيرة عن مشروعك…':'A few words about your project…'}[input.placeholder] || input.placeholder); });
    const select = document.querySelector('.form-grid select');
    if (select) [...select.options].forEach((option, i) => { if (!i) option.textContent = ar ? 'اختر خدمة' : 'Select a service'; else if (ar) option.textContent = ['تصميم العلامة والهوية البصرية','الشعار والهوية البصرية','الملف التعريفي والمطبوعات','التسويق الرقمي والإعلان','تحسين محركات البحث والتواصل الاجتماعي','الحملات','أخرى'][i-1]; else option.textContent = ['Branding & graphic design','Logo & visual identity','Brand profile & print','Digital marketing & advertising','SEO & social media','Campaigns','Other'][i-1]; });
    const workTitlesEn = ['Form, feeling & first principles','A different point of view','Stories for a screen-first world'];
    const workTitlesAr = ['الشكل والشعور والمبادئ الأولى','منظور مختلف','حكايات لعالم الشاشات'];
    const workDescriptionsEn = ['Identity system · Art direction','Campaign · Creative direction','Digital experience · Content'];
    const workDescriptionsAr = ['نظام هوية · توجيه فني','حملة · توجيه إبداعي','تجربة رقمية · محتوى'];
    document.querySelectorAll('.work-info h3').forEach((n,i)=>n.textContent=ar?workTitlesAr[i]:workTitlesEn[i]);
    document.querySelectorAll('.work-info p').forEach((n,i)=>n.textContent=ar?workDescriptionsAr[i]:workDescriptionsEn[i]);
    document.querySelectorAll('.work-note').forEach(n=>n.textContent=ar?'نماذج بصرية مختارة. يمكن استبدال الصور وتفاصيل الحالات بأعمال عملاء معتمدة.':'Selected visual studies. Project imagery and case details can be replaced with approved client work.');
    navItems.forEach(link => { link.textContent = ar ? link.dataset.ar : link.dataset.en; });
    document.querySelectorAll('.service-title').forEach((node, i) => node.textContent = ar ? servicesAr[i] : ['Brand strategy & positioning','Visual identity & design','Brand worlds & collateral','Campaigns & content','Digital & social growth'][i]);
    document.querySelectorAll('.service-desc').forEach((node, i) => node.textContent = ar ? serviceDescsAr[i] : ['Find your place. Define your voice.','A world people recognise and remember.','Profiles, print and every detail between.','Ideas built to travel further.','Strategy, media and momentum.'][i]);
    document.querySelectorAll('.lang').forEach(langButton => {
      langButton.querySelectorAll('span').forEach((span, i) => span.classList.toggle('active', ar ? i === 1 : i === 0));
      langButton.setAttribute('aria-label', ar ? 'Switch to English' : 'Switch to Arabic');
    });
    document.querySelector('.menu-overlay nav').dir = ar ? 'rtl' : 'ltr';
  };
  document.querySelectorAll('.lang').forEach(button => button.addEventListener('click', switchLanguage));

  const revealTargets = document.querySelectorAll('.section-meta,.manifesto-grid,.manifesto-foot,.services-head,.service-row,.feature-layout,.feature-foot,.statement h2,.work-head,.work-card,.principles-head,.principle-grid article,.process-line,.cta-content,.contact-form,.footer-main');
  revealTargets.forEach(el => el.classList.add('reveal'));
  if ('IntersectionObserver' in window && !reduced) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), { threshold: .12, rootMargin: '0px 0px -35px 0px' });
    revealTargets.forEach(el => observer.observe(el));
  } else revealTargets.forEach(el => el.classList.add('visible'));

  const cursor = document.querySelector('.cursor');
  if (matchMedia('(pointer:fine)').matches && !reduced) {
    document.body.classList.add('cursor-enabled');
    window.addEventListener('mousemove', e => { cursor.style.left = `${e.clientX}px`; cursor.style.top = `${e.clientY}px`; }, { passive: true });
    document.querySelectorAll('.work-visual,.service-row,.button,.nav-cta').forEach(el => {
      el.addEventListener('mouseenter', () => { cursor.classList.add('active'); cursor.querySelector('span').textContent = el.classList.contains('service-row') ? 'EXPLORE' : el.classList.contains('button') || el.classList.contains('nav-cta') ? 'START' : 'VIEW'; });
      el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
    });
  }

  const oneEyes = [...document.querySelectorAll('.one-eyes b')];
  if (!reduced && oneEyes.length) {
    window.addEventListener('pointermove', event => {
      oneEyes.forEach(pupil => {
        const eye = pupil.parentElement.getBoundingClientRect();
        const x = Math.max(-1, Math.min(1, (event.clientX - (eye.left + eye.width / 2)) / 120));
        const y = Math.max(-1, Math.min(1, (event.clientY - (eye.top + eye.height / 2)) / 120));
        pupil.style.transform = `translate(calc(-50% + ${x * 4}px), calc(-50% + ${y * 3}px))`;
      });
    }, { passive: true });
  }

  const paletteOptions = [...document.querySelectorAll('.palette-option')];
  const featureArt = document.querySelector('.feature-art');
  paletteOptions.forEach(option => option.addEventListener('click', () => {
    paletteOptions.forEach(button => {
      const active = button === option;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    featureArt?.style.setProperty('--palette-primary', option.dataset.primary);
    featureArt?.style.setProperty('--palette-accent', option.dataset.accent);
    const primarySwatch = document.querySelector('.swatch-blue');
    const accentSwatch = document.querySelector('.swatch-amber');
    if (primarySwatch) primarySwatch.textContent = option.dataset.primary;
    if (accentSwatch) accentSwatch.textContent = option.dataset.accent;
  }));

  const form = document.querySelector('.contact-form');
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    const subject = encodeURIComponent(`Project enquiry — ${values.get('name')}`);
    const body = encodeURIComponent(`Name: ${values.get('name')}\nCompany: ${values.get('company') || '—'}\nEmail: ${values.get('email')}\nPhone: ${values.get('phone') || '—'}\nService: ${values.get('service')}\nBudget: ${values.get('budget') || '—'}\n\n${values.get('message')}`);
    document.querySelector('.form-status').textContent = language === 'ar' ? 'يفتح هذا تطبيق البريد برسالتك جاهزة للإرسال.' : 'Opening your email app with your message ready to send.';
    window.location.href = `mailto:hello@awwalbrands.com?subject=${subject}&body=${body}`;
  });

  if (!reduced) {
    const art = document.querySelector('.hero-art');
    window.addEventListener('scroll', () => { if (window.innerWidth > 720 && art) art.style.transform = `translateY(${Math.min(window.scrollY * .07, 52)}px)`; }, { passive: true });
  }
})();
