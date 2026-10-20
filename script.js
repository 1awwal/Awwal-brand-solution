(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const homeHero = document.querySelector('.hero');
  if (homeHero && !reduced) {
    const motionStyles = document.createElement('style');
    motionStyles.textContent = `
      .hero::before {
        content: "";
        position: absolute;
        z-index: -1;
        inset: -18%;
        pointer-events: none;
        opacity: .72;
        background:
          radial-gradient(ellipse at 76% 38%, rgba(255,183,3,.3), transparent 30%),
          radial-gradient(ellipse at 61% 74%, rgba(58,128,255,.45), transparent 36%),
          radial-gradient(ellipse at 35% 45%, rgba(184,74,255,.16), transparent 32%);
        background-size: 145% 145%;
        animation: awwal-home-flow 13s ease-in-out infinite alternate;
      }
      @keyframes awwal-home-flow {
        from { transform: translate3d(-2%, -1%, 0) scale(1); background-position: 0% 30%; }
        to { transform: translate3d(2%, 1%, 0) scale(1.08); background-position: 100% 70%; }
      }
      .hero h1 > span {
        background: linear-gradient(110deg, #ffb703 0%, #ff625a 25%, #ac83ff 50%, #48d2ad 76%, #ffb703 100%);
        background-size: 260% 100%;
        background-clip: text;
        -webkit-background-clip: text;
        color: transparent;
        animation: awwal-home-spectrum 8s ease-in-out infinite;
      }
      @keyframes awwal-home-spectrum {
        0%, 100% { background-position: 0% 50%; filter: hue-rotate(0deg); }
        50% { background-position: 100% 50%; filter: hue-rotate(22deg); }
      }
      .awwal-pointer-glow {
        position: fixed;
        z-index: 6;
        inset: 0 auto auto 0;
        width: 148px;
        height: 148px;
        border-radius: 50%;
        pointer-events: none;
        opacity: 0;
        transform: translate3d(var(--pointer-x, -200px), var(--pointer-y, -200px), 0) translate(-50%, -50%) scale(.72);
        background: radial-gradient(circle, rgba(255,183,3,.2), rgba(86,123,255,.15) 38%, transparent 72%);
        filter: blur(4px);
        mix-blend-mode: screen;
        transition: opacity .32s, transform .32s;
      }
      .awwal-pointer-glow.is-visible { opacity: .9; transform: translate3d(var(--pointer-x), var(--pointer-y), 0) translate(-50%, -50%) scale(1); }
      @media (prefers-reduced-motion: reduce) {
        .hero::before, .hero h1 > span { animation: none !important; }
        .awwal-pointer-glow { display: none !important; }
      }
    `;
    document.head.append(motionStyles);

    if (matchMedia('(pointer: fine)').matches) {
      const glow = document.createElement('span');
      glow.className = 'awwal-pointer-glow';
      glow.setAttribute('aria-hidden', 'true');
      document.body.append(glow);
      let hideGlowTimer;
      window.addEventListener('pointermove', event => {
        if (event.pointerType === 'touch') return;
        glow.style.setProperty('--pointer-x', `${event.clientX}px`);
        glow.style.setProperty('--pointer-y', `${event.clientY}px`);
        glow.classList.add('is-visible');
        window.clearTimeout(hideGlowTimer);
        hideGlowTimer = window.setTimeout(() => glow.classList.remove('is-visible'), 900);
      }, { passive: true });
      document.documentElement.addEventListener('pointerleave', () => glow.classList.remove('is-visible'));
    }
  }

  const loader = document.querySelector('.loader');
  window.addEventListener('load', () => setTimeout(() => { loader?.classList.add('done'); document.body.classList.remove('loading'); }, 380), { once: true });
  setTimeout(() => loader?.classList.add('done'), 1700);

  const fitBrandWordmarks = () => document.querySelectorAll('.brand-wordmark').forEach(group => {
    const lines = [...group.querySelectorAll('.brand-line')];
    lines.forEach(line => { line.style.transform = 'scaleX(1)'; });
    const widths = lines.map(line => line.getBoundingClientRect().width);
    const target = Math.min(group.clientWidth, Math.max(...widths));
    lines.forEach((line, index) => {
      if (widths[index]) line.style.transform = `scaleX(${target / widths[index]})`;
    });
  });
  window.addEventListener('resize', fitBrandWordmarks, { passive: true });
  if (document.fonts?.ready) document.fonts.ready.then(fitBrandWordmarks); else fitBrandWordmarks();

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
    '.hero .kicker': ['YOUR FIRST CHOICE.', 'خيارك الأول.'],
    '.hero h1': ['YOUR <span>FIRST</span><br>CHOICE', 'خيارك<br><span>الأول</span>'],
    '.hero-bottom p': ['Brand strategy, logo and poster design, websites, digital marketing and social media management in Saudi Arabia.', 'استراتيجية العلامة وتصميم الشعارات والملصقات والمواقع والتسويق الرقمي وإدارة التواصل الاجتماعي في السعودية.'],
    '.round-link span': ['EXPLORE<br>OUR WORK', 'اكتشف<br>أعمالنا'],
    '.manifesto h2': ['WE START<br>WITH THE <em>FIRST</em><br>IDEA<span class="amber">.</span>', 'نبدأ<br>بالفكرة <em>الأولى</em><br>دائماً<span class="amber">.</span>'],
    '.manifesto-copy .eyebrow': ['ABOUT AWWAL', 'عن أول'],
    '.manifesto-copy p.lead': ['Awwal is rooted in the idea of being first: a pioneering vision, a strong foundation, and a higher standard for how brands are imagined.', 'ترتكز أول على مفهوم البداية: رؤية سبّاقة، وأساس متين، ومعيار أرفع لتصوّر العلامات التجارية.'],
    '.manifesto-copy p:not(.lead)': ['We shape and elevate identities through strategic thinking, innovative design and cinematic precision—bridging cultural authenticity with the possibilities of tomorrow.', 'نصوغ الهويات ونرتقي بها عبر التفكير الاستراتيجي والتصميم المبتكر والدقة السينمائية، لنصل بين أصالة الثقافة وإمكانات الغد.'],
    '.text-link': ['GET TO KNOW OUR APPROACH <i>↗</i>', 'اكتشف منهجيتنا <i>↗</i>'],
    '.services-head h2': ['FROM IDENTITY<br>TO <em>IMPACT.</em>', 'من الهوية<br>إلى <em>الأثر.</em>'],
    '.services-head p': ['From brand strategy and logo design to poster design, websites, digital marketing and social media management, we build brands that matter at every touchpoint.', 'من استراتيجية العلامة وتصميم الشعارات والملصقات إلى المواقع والتسويق الرقمي وإدارة التواصل الاجتماعي، نبني علامات مؤثرة في كل نقطة تواصل.'],
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
    '.cta-content h2': ['LET’S GIVE<br>YOUR BRAND<br><em>CPR.</em>', 'لنمنح علامتك<br><em>إنعاشاً.</em>'],
    '.cta-content p': ['Clarity. Presence. Recognition.<br>Let’s bring your brand back to life and make it ready to lead.', 'وضوح. حضور. تميّز.<br>لنمنح علامتك حياة جديدة ونهيئها للريادة.'],
    '.cta-content .button': ['START A PROJECT <i>↗</i>', 'ابدأ مشروعاً <i>↗</i>'],
  };
  const servicesAr = ['استراتيجية العلامة وبناؤها', 'تصميم الشعارات والهوية البصرية', 'تصميم الملصقات والحملات والمحتوى', 'الملفات التعريفية والمطبوعات', 'تصميم وتطوير المواقع', 'التسويق الرقمي وإدارة التواصل الاجتماعي'];
  const serviceDescsAr = ['تموضع واضح واسم واتجاه متماسك للعلامة.', 'شعارات مميزة وأنظمة هوية بصرية متكاملة.', 'إبداع مطبوع ورقمي يجمعه مفهوم واحد.', 'ملفات تعريفية ومواد تحمل علامتك بانسجام.', 'مواقع متجاوبة وتجربة رقمية واضحة.', 'استراتيجية محتوى ونشر ونمو عبر منصات التواصل.'];
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
      ['.service-row:nth-child(1) .service-num', '01', '٠١'],['.service-row:nth-child(2) .service-num', '02', '٠٢'],['.service-row:nth-child(3) .service-num', '03', '٠٣'],['.service-row:nth-child(4) .service-num', '04', '٠٤'],['.service-row:nth-child(5) .service-num', '05', '٠٥'],['.service-row:nth-child(6) .service-num', '06', '٠٦'],
      ['.principle-grid article:nth-child(1) h3', 'VISION', 'الرؤية'],['.principle-grid article:nth-child(1) p', 'See the opportunity beneath the obvious. Begin with possibility, then give it direction.', 'نرى الفرصة وراء المألوف. نبدأ بالاحتمال ثم نمنحه اتجاهاً واضحاً.'],
      ['.principle-grid article:nth-child(2) h3', 'PRECISION', 'الدقة'],['.principle-grid article:nth-child(2) p', 'Every choice has a reason. Every detail earns its place in the bigger picture.', 'لكل اختيار سبب، ولكل تفصيل مكانه في الصورة الأكبر.'],
      ['.principle-grid article:nth-child(3) h3', 'CULTURE', 'الثقافة'],['.principle-grid article:nth-child(3) p', 'Make work that understands where it comes from and knows where it can go.', 'نصنع عملاً يعرف جذوره ويستشرف آفاقه.'],
      ['.principle-grid article:nth-child(4) h3', 'IMPACT', 'الأثر'],['.principle-grid article:nth-child(4) p', 'Build for the moment, and for all the moments that follow it.', 'نصنع للحظة، ولكل ما يأتي بعدها.'],
      ['.process-line span:nth-child(1)', 'DISCOVER', 'اكتشف'],['.process-line span:nth-child(2)', 'DEFINE', 'حدّد'],['.process-line span:nth-child(3)', 'DESIGN', 'صمّم'],['.process-line span:nth-child(4)', 'DEVELOP', 'طوّر'],['.process-line span:nth-child(5)', 'DELIVER', 'أطلق'],
      ['.cta-content .eyebrow', 'YOUR BRAND, BACK IN MOTION', 'نعيد علامتك إلى الواجهة'],
      ['.form-heading span:first-child', 'HAVE A PROJECT IN MIND?', 'هل لديك مشروع في ذهنك؟'],['.form-heading span:last-child', 'LET’S TALK ↘', 'لنتحدث ↘'],
      ['.form-submit', 'SEND YOUR NOTE ↗', 'أرسل رسالتك ↗'],['.form-status', 'This opens your email app with your message ready to send.', 'يفتح هذا تطبيق البريد برسالتك جاهزة للإرسال.'],
      ['.footer-links:nth-child(2) .eyebrow', 'EXPLORE', 'اكتشف'],['.footer-links:nth-child(2) a:nth-of-type(1)', 'About', 'عن أول'],['.footer-links:nth-child(2) a:nth-of-type(2)', 'Services', 'الخدمات'],['.footer-links:nth-child(2) a:nth-of-type(3)', 'Selected work', 'أعمال مختارة'],['.footer-links:nth-child(2) a:nth-of-type(4)', 'Our approach', 'منهجيتنا'],
      ['.footer-links:nth-child(3) .eyebrow', 'SAY HELLO', 'تواصل معنا'],['.footer-links:nth-child(4) .eyebrow', 'FOLLOW ALONG', 'تابعنا'],['.footer-links:nth-child(4) a', 'Instagram @1.awwal ↗', 'إنستغرام @1.awwal ↗'],
      ['.footer-bottom span:first-child', '© AWWAL BRAND SOLUTIONS 2025', '© أول للحلول التجارية ٢٠٢٥'],['.footer-bottom span:nth-child(2)', 'أول — FIRST, BY DESIGN.', 'أول — الأول، بتصميمه.'],['.footer-bottom a', 'BACK TO TOP ↑', 'العودة للأعلى ↑'],
      ['.scroll-cue span', 'SCROLL TO DISCOVER', 'مرر لاكتشاف المزيد'],['.hero-top .eyebrow', 'SAUDI ARABIA', 'السعودية'],['.hero-side', 'BRAND THINKING / 24°42′ N 46°40′ E', 'فكر العلامة / ٢٤°٤٢′ شمالاً ٤٦°٤٠′ شرقاً'],
    ];
    metadata.forEach(([selector, en, arabic]) => putPair(selector, en, arabic));
    document.querySelector('.footer-brand p').innerHTML = ar ? 'نبني ما<br>يأتي أولاً.' : 'Building what<br>comes first.';
    const formLabels = ar ? ['الاسم','الشركة','البريد الإلكتروني','الهاتف','ما الخدمة المطلوبة؟','ميزانية المشروع','أخبرنا عن مشروعك'] : ['Name','Company','Email','Phone','What do you need?','Project budget','Tell us a little about it'];
    document.querySelectorAll('.form-grid label').forEach((label, i) => { const input = label.querySelector('input,select,textarea'); label.childNodes[0].textContent = `${formLabels[i]} `; if (input?.placeholder) input.placeholder = ar ? ({'Your name':'الاسم الكامل','Company name':'اسم الشركة','you@company.com':'name@company.com','+966':'+966','Optional':'اختياري','A few words about your project…':'اكتب نبذة قصيرة عن مشروعك…'}[input.placeholder] || input.placeholder) : ({'الاسم الكامل':'Your name','اسم الشركة':'Company name','name@company.com':'you@company.com','اختياري':'Optional','اكتب نبذة قصيرة عن مشروعك…':'A few words about your project…'}[input.placeholder] || input.placeholder); });
    const select = document.querySelector('.form-grid select');
    if (select) [...select.options].forEach((option, i) => { if (!i) option.textContent = ar ? 'اختر خدمة' : 'Select a service'; else if (ar) option.textContent = ['استراتيجية العلامة وبناؤها','تصميم الشعارات والهوية البصرية','تصميم الملصقات والحملات','الملفات التعريفية والمطبوعات','تصميم وتطوير المواقع','التسويق الرقمي وإدارة التواصل الاجتماعي','أخرى'][i-1]; else option.textContent = ['Brand strategy & branding','Logo design & visual identity','Poster design & campaigns','Brand profiles & print','Website design & development','Digital marketing & social media management','Other'][i-1]; });
    const workTitlesEn = ['Form, feeling & first principles','A different point of view','Stories for a screen-first world'];
    const workTitlesAr = ['الشكل والشعور والمبادئ الأولى','منظور مختلف','حكايات لعالم الشاشات'];
    const workDescriptionsEn = ['Identity system · Art direction','Campaign · Creative direction','Digital experience · Content'];
    const workDescriptionsAr = ['نظام هوية · توجيه فني','حملة · توجيه إبداعي','تجربة رقمية · محتوى'];
    document.querySelectorAll('.work-info h3').forEach((n,i)=>n.textContent=ar?workTitlesAr[i]:workTitlesEn[i]);
    document.querySelectorAll('.work-info p').forEach((n,i)=>n.textContent=ar?workDescriptionsAr[i]:workDescriptionsEn[i]);
    document.querySelectorAll('.work-note').forEach(n=>n.textContent=ar?'مراجع بصرية ونماذج تطبيقية للعلامات، معروضة كتصورات توضيحية.':'Brand references and mockups shown as illustrative studies.');
    navItems.forEach(link => { link.textContent = ar ? link.dataset.ar : link.dataset.en; });
    document.querySelectorAll('.service-title').forEach((node, i) => node.textContent = ar ? servicesAr[i] : ['Brand strategy & branding','Logo design & visual identity','Poster design, campaigns & content','Brand profiles, stationery & print','Website design & development','Digital marketing & social media management'][i]);
    document.querySelectorAll('.service-desc').forEach((node, i) => node.textContent = ar ? serviceDescsAr[i] : ['Positioning, naming and a clear brand direction.','Distinctive logos and complete visual identity systems.','Print and digital creative built around one idea.','Company profiles and branded materials, made cohesive.','Responsive websites with a clear brand experience.','Content strategy, publishing and growth across social platforms.'][i]);
    document.querySelectorAll('.lang').forEach(langButton => {
      langButton.textContent = ar ? 'English' : 'العربية';
      langButton.setAttribute('aria-label', ar ? 'Switch to English' : 'التبديل إلى العربية');
    });
    document.querySelector('.menu-overlay nav').dir = ar ? 'rtl' : 'ltr';
  };
  document.querySelectorAll('.lang').forEach(button => button.addEventListener('click', switchLanguage));

  const revealTargets = document.querySelectorAll('.section-meta,.manifesto-grid,.manifesto-foot,.services-head,.service-row,.feature-layout,.feature-foot,.statement h2,.work-head,.work-card,.principles-head,.principle-grid article,.process-line,.kinetic-stage,.cta-content,.contact-form,.footer-main');
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
    let lastTape = null;
    window.addEventListener('mousemove', e => {
      cursor.style.left = `${e.clientX}px`; cursor.style.top = `${e.clientY}px`;
      const point = { x: e.clientX, y: e.clientY };
      if (!lastTape || Math.hypot(point.x - lastTape.x, point.y - lastTape.y) >= 72) {
        const tape = document.createElement('span');
        tape.className = 'cursor-tape';
        tape.setAttribute('aria-hidden', 'true');
        tape.textContent = 'FIRST';
        tape.style.left = `${point.x}px`; tape.style.top = `${point.y}px`;
        tape.style.setProperty('--tape-angle', `${Math.round(Math.random() * 28 - 14)}deg`);
        document.body.append(tape);
        window.setTimeout(() => tape.remove(), 720);
        lastTape = point;
      }
    }, { passive: true });
    document.querySelectorAll('.work-visual,.service-row,.button,.nav-cta').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('active'));
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

  if (!reduced) {
    const art = document.querySelector('.hero-art');
    window.addEventListener('scroll', () => { if (window.innerWidth > 720 && art) art.style.transform = `translateY(${Math.min(window.scrollY * .07, 52)}px)`; }, { passive: true });
  }
})();
