(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    '.hero .kicker': ['BRAND STRATEGY / IDENTITY / DIGITAL', 'استراتيجية العلامة / الهوية / الرقمي'],
    '.hero h1': ['<span class="hero-gradient-word">AWWAL</span> IS YOUR<br><span><span class="hero-gradient-word">FIRST</span> CHOICE</span>', '<span class="hero-gradient-word">أول</span> هو خيارك<br><span><span class="hero-gradient-word">الأول</span></span>'],
    '.hero-bottom p': ['Brand identity, graphic design, digital marketing, photography and websites for businesses in Dammam, Saudi Arabia.', 'الهوية البصرية والتصميم والتسويق الرقمي والتصوير والمواقع للأعمال في الدمام، المملكة العربية السعودية.'],
    '.round-link span': ['EXPLORE<br>OUR WORK', 'اكتشف<br>أعمالنا'],
    '.manifesto h2': ['WE START<br>WITH THE <em>FIRST</em><br>IDEA<span class="amber">.</span>', 'نبدأ<br>بالفكرة <em>الأولى</em><br>دائماً<span class="amber">.</span>'],
    '.manifesto-copy .eyebrow': ['ABOUT AWWAL', 'عن أول'],
    '.manifesto-copy p.lead': ['Awwal is rooted in the idea of being first: a pioneering vision, a strong foundation, and a higher standard for how brands are imagined.', 'ترتكز أول على مفهوم البداية: رؤية سبّاقة، وأساس متين، ومعيار أرفع لتصوّر العلامات التجارية.'],
    '.manifesto-copy p:not(.lead)': ['We shape and elevate identities through strategic thinking, innovative design and cinematic precision—bridging cultural authenticity with the possibilities of tomorrow.', 'نصوغ الهويات ونرتقي بها عبر التفكير الاستراتيجي والتصميم المبتكر والدقة السينمائية، لنصل بين أصالة الثقافة وإمكانات الغد.'],
    '.text-link': ['GET TO KNOW OUR APPROACH <i>↗</i>', 'اكتشف منهجيتنا <i>↗</i>'],
    '.services-head h2': ['FROM IDENTITY<br>TO <em>IMPACT.</em>', 'من الهوية<br>إلى <em>الأثر.</em>'],
    '.services-head p': ['Brand identity, company profiles, print design, marketing, photography and websites—connected support for Dammam businesses.', 'الهوية والملفات التعريفية والمطبوعات والتسويق والتصوير والمواقع: خدمات مترابطة للأعمال في الدمام.'],
    '.packages-heading .eyebrow': ['WAYS TO WORK TOGETHER', 'طرق للعمل معاً'],
    '.packages-heading h3': ['THOUGHTFUL STARTS.<br><em>CONNECTED SUPPORT.</em>', 'بدايات مدروسة.<br><em>ودعم متكامل.</em>'],
    '.packages-heading p': ['Flexible, coordinated packages shaped around your goals and the scale of your project.', 'باقات مرنة ومتكاملة تُصمم وفق أهدافك ونطاق مشروعك.'],
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
  const servicesEn = ['Brand Identity & Graphic Design','Digital Marketing & Advertising','Photography & Video Production','Website Design & Management'];
  const servicesAr = ['هوية العلامة والتصميم الجرافيكي','التسويق الرقمي والإعلانات','التصوير وإنتاج الفيديو','تصميم المواقع وإدارتها'];
  const serviceDescsEn = ['Logos, profiles, posters, brochures, cards, stationery and banners—unified by a clear identity.','SEO, social media management, Google & Meta ads, and integrated campaigns.','Event coverage, live content, corporate and product shoots, with editing.','Business and e-commerce websites, from design to hosting and ongoing care.'];
  const serviceDescsAr = ['هوية مميزة ومتناسقة في كل نقطة تواصل.','استراتيجية وتواصل اجتماعي وتحسين بحث وحملات مدفوعة.','تغطية فعاليات ومحتوى مباشر وتصوير مؤسسي ومنتجات مع التحرير.','مواقع أعمال ومتاجر إلكترونية من التصميم والاستضافة إلى الإدارة المستمرة.'];
  const packagesEn = ['Complete Brand Launch','Monthly Social Media','Corporate & Private Events','Advertising Campaign'];
  const packagesAr = ['إطلاق علامة متكامل','إدارة التواصل الاجتماعي شهرياً','الفعاليات المؤسسية والخاصة','حملة إعلانية'];
  const packagesDescEn = ['Build a clear foundation and bring your new brand to market with confidence.','Keep your channels active with a considered rhythm of content and community care.','Capture the atmosphere and key moments with professional event coverage.','Connect a strong creative idea to the right audience across digital channels.'];
  const packagesDescAr = ['أسّس علامتك وأطلقها إلى السوق بثقة ووضوح.','حافظ على حضور قنواتك بمحتوى منتظم وعناية بالمجتمع.','وثّق الأجواء واللحظات المهمة بتغطية احترافية للفعاليات.','اربط فكرة إبداعية قوية بالجمهور المناسب عبر القنوات الرقمية.'];
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
      ['.service-row:nth-child(1) .service-num', '01', '٠١'],['.service-row:nth-child(2) .service-num', '02', '٠٢'],['.service-row:nth-child(3) .service-num', '03', '٠٣'],['.service-row:nth-child(4) .service-num', '04', '٠٤'],
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
    if (select) {
      const optionLabels = ar
        ? ['اختر خدمة','هوية العلامة والتصميم الجرافيكي','التسويق الرقمي والإعلانات','التصوير وإنتاج الفيديو','تصميم المواقع وإدارتها','إطلاق علامة متكامل','إدارة التواصل الاجتماعي شهرياً','الفعاليات المؤسسية والخاصة','حملة إعلانية','أخرى']
        : ['Select a service','Brand identity & graphic design','Digital marketing & advertising','Photography & video production','Website design & management','Complete brand launch','Monthly social media','Corporate & private events','Advertising campaign','Other'];
      [...select.options].forEach((option,i)=>option.textContent=optionLabels[i]);
    }
    const workTitlesEn = ['Form, feeling & first principles','A different point of view','Stories for a screen-first world'];
    const workTitlesAr = ['الشكل والشعور والمبادئ الأولى','منظور مختلف','حكايات لعالم الشاشات'];
    const workDescriptionsEn = ['Identity system · Art direction','Campaign · Creative direction','Digital experience · Content'];
    const workDescriptionsAr = ['نظام هوية · توجيه فني','حملة · توجيه إبداعي','تجربة رقمية · محتوى'];
    document.querySelectorAll('.work-info h3').forEach((n,i)=>n.textContent=ar?workTitlesAr[i]:workTitlesEn[i]);
    document.querySelectorAll('.work-info p').forEach((n,i)=>n.textContent=ar?workDescriptionsAr[i]:workDescriptionsEn[i]);
    document.querySelectorAll('.work-note').forEach(n=>n.textContent=ar?'مراجع بصرية ونماذج تطبيقية للعلامات، معروضة كتصورات توضيحية.':'Brand references and mockups shown as illustrative studies.');
    navItems.forEach(link => { link.textContent = ar ? link.dataset.ar : link.dataset.en; });
    document.querySelectorAll('.service-title').forEach((node, i) => node.textContent = (ar ? servicesAr : servicesEn)[i]);
    document.querySelectorAll('.service-desc').forEach((node, i) => node.textContent = (ar ? serviceDescsAr : serviceDescsEn)[i]);
    document.querySelectorAll('.service-package-card h4').forEach((node, i) => node.textContent = (ar ? packagesAr : packagesEn)[i]);
    document.querySelectorAll('.service-package-card p').forEach((node, i) => node.textContent = (ar ? packagesDescAr : packagesDescEn)[i]);
    const packageIncludes = ar ? ['استراتيجية · هوية · تطبيقات أساسية','تخطيط · محتوى إبداعي · إدارة القنوات','تصوير · فيديو · ملخصات محررة','فكرة الحملة · إعلانات Google وMeta · تحسين'] : ['Strategy · Identity · Core brand applications','Planning · Creative content · Channel management','Photography · Video · Edited highlights','Campaign concept · Google & Meta ads · Optimisation'];
    document.querySelectorAll('.package-includes').forEach((node, i) => node.textContent = packageIncludes[i]);
    document.querySelectorAll('.lang').forEach(langButton => {
      langButton.textContent = ar ? 'English' : 'العربية';
      langButton.setAttribute('aria-label', ar ? 'Switch to English' : 'التبديل إلى العربية');
    });
    document.querySelector('.menu-overlay nav').dir = ar ? 'rtl' : 'ltr';
  };
  document.querySelectorAll('.lang').forEach(button => button.addEventListener('click', switchLanguage));

  const revealTargets = document.querySelectorAll('.section-meta,.manifesto-grid,.manifesto-foot,.services-head,.service-row,.service-package-card,.feature-layout,.feature-foot,.statement h2,.work-head,.work-card,.principles-head,.principle-grid article,.process-line,.kinetic-stage,.cta-content,.contact-form,.footer-main');
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

  const glassPanel = document.querySelector('.hero-copy');
  if (glassPanel && matchMedia('(pointer:fine)').matches && !reduced) {
    let glassFrame = 0;
    glassPanel.addEventListener('pointermove', event => {
      const bounds = glassPanel.getBoundingClientRect();
      const px = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
      const py = Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height));
      cancelAnimationFrame(glassFrame);
      glassFrame = requestAnimationFrame(() => {
        glassPanel.style.setProperty('--glass-x', `${(px * 100).toFixed(1)}%`);
        glassPanel.style.setProperty('--glass-y', `${(py * 100).toFixed(1)}%`);
        glassPanel.style.setProperty('--glass-tilt-x', `${((px - .5) * 1.2).toFixed(2)}deg`);
        glassPanel.style.setProperty('--glass-tilt-y', `${((.5 - py) * 1.2).toFixed(2)}deg`);
      });
    }, { passive: true });
    glassPanel.addEventListener('pointerleave', () => {
      cancelAnimationFrame(glassFrame);
      glassPanel.style.setProperty('--glass-x', '24%');
      glassPanel.style.setProperty('--glass-y', '16%');
      glassPanel.style.setProperty('--glass-tilt-x', '0deg');
      glassPanel.style.setProperty('--glass-tilt-y', '0deg');
    }, { passive: true });
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

  // Draggable brand-world gallery with a focused one-at-a-time zoom view.
  const gallery=document.querySelector('.showcase-viewport'),slides=[...document.querySelectorAll('.showcase-slide')],dialog=document.querySelector('.showcase-dialog');
  if(gallery&&slides.length&&dialog){
    const fill=document.querySelector('.showcase-progress-fill'),count=document.querySelector('.showcase-count b'),scene=dialog.querySelector('.showcase-dialog-scene'),title=dialog.querySelector('.dialog-title'),category=dialog.querySelector('.dialog-category'),counter=dialog.querySelector('.dialog-counter');
    let active=0,startX=0,startScroll=0,dragged=false;
    const render=()=>{const item=slides[active];scene.replaceChildren(item.querySelector('.showcase-stage').cloneNode(true));title.textContent=item.dataset.title;category.textContent=item.dataset.category;counter.textContent=`${String(active+1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;};
    const go=(index,scroll=true)=>{active=(index+slides.length)%slides.length;if(scroll)slides[active].scrollIntoView({behavior:reduced?'auto':'smooth',block:'nearest',inline:'center'});count.textContent=String(active+1).padStart(2,'0');fill.style.transform=`scaleX(${(active+1)/slides.length})`;if(dialog.open)render();};
    const open=index=>{go(index);render();if(dialog.showModal)dialog.showModal();else dialog.setAttribute('open','');document.body.classList.add('showcase-zoom-open');};
    const close=()=>{if(dialog.open&&dialog.close)dialog.close();else dialog.removeAttribute('open');document.body.classList.remove('showcase-zoom-open');};
    slides.forEach((slide,index)=>slide.querySelector('.showcase-open').addEventListener('click',()=>{if(dragged){dragged=false;return;}open(index);}));
    gallery.addEventListener('pointerdown',e=>{if(e.button!==0)return;startX=e.clientX;startScroll=gallery.scrollLeft;dragged=false;gallery.classList.add('is-dragging');gallery.setPointerCapture(e.pointerId);});
    gallery.addEventListener('pointermove',e=>{if(!gallery.hasPointerCapture(e.pointerId))return;const dx=e.clientX-startX;if(Math.abs(dx)>5)dragged=true;gallery.scrollLeft=startScroll-dx;});
    const endDrag=()=>{if(!gallery.classList.contains('is-dragging'))return;gallery.classList.remove('is-dragging');if(dragged){const center=gallery.getBoundingClientRect().left+gallery.clientWidth/2;let closest=0,dist=Infinity;slides.forEach((slide,i)=>{const r=slide.getBoundingClientRect(),d=Math.abs(r.left+r.width/2-center);if(d<dist){dist=d;closest=i;}});go(closest);setTimeout(()=>dragged=false,100);}};
    gallery.addEventListener('pointerup',endDrag);gallery.addEventListener('pointercancel',endDrag);
    gallery.addEventListener('click',e=>{if(dragged){e.preventDefault();e.stopPropagation();}},true);
    document.querySelector('.showcase-prev').addEventListener('click',()=>go(active-1));document.querySelector('.showcase-next').addEventListener('click',()=>go(active+1));
    dialog.querySelector('.showcase-close').addEventListener('click',close);dialog.querySelector('.dialog-prev').addEventListener('click',()=>go(active-1));dialog.querySelector('.dialog-next').addEventListener('click',()=>go(active+1));
    dialog.addEventListener('click',e=>{if(e.target===dialog)close();});dialog.addEventListener('close',()=>document.body.classList.remove('showcase-zoom-open'));
    dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight')go(active+1);if(e.key==='ArrowLeft')go(active-1);});
    let zoomX=0;dialog.addEventListener('pointerdown',e=>zoomX=e.clientX);dialog.addEventListener('pointerup',e=>{const dx=e.clientX-zoomX;if(Math.abs(dx)>70)go(active+(dx<0?1:-1));});
    go(0,false);
  }
})();