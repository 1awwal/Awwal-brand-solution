(() => {
  'use strict';
  const services = {
    brand: 'Brand identity & graphic design', marketing: 'Digital marketing & advertising',
    photo: 'Photography & video production', web: 'Website design & management',
    launch: 'Complete brand launch', social: 'Monthly social media',
    events: 'Corporate & private events', campaign: 'Advertising campaign', other: 'Other'
  };
  const text = {
    en: {
      name: 'Use letters and spaces only for your name.',
      company: 'Use letters, numbers, spaces, commas, & and hyphens only.',
      email: 'Enter a valid email address, such as name@example.com.',
      phone: 'Use 7 to 15 digits, with an optional + at the beginning.',
      budget: 'Enter your budget in SAR using digits only.',
      service: 'Please select a service.',
      message: 'Use letters, numbers, spaces, commas, & and hyphens only.',
      status: 'Review your enquiry in WhatsApp, then press Send to contact Awwal.',
      button: 'CONTINUE TO WHATSAPP ↗'
    },
    ar: {
      name: 'استخدم الحروف والمسافات فقط في الاسم.',
      company: 'استخدم الحروف والأرقام والمسافات والفواصل و & والشرطة فقط.',
      email: 'أدخل بريداً إلكترونياً صحيحاً مثل name@example.com.',
      phone: 'أدخل من 7 إلى 15 رقماً مع علامة + اختيارية في البداية.',
      budget: 'أدخل الميزانية بالريال السعودي باستخدام الأرقام فقط.',
      service: 'يرجى اختيار الخدمة.',
      message: 'استخدم الحروف والأرقام والمسافات والفواصل و & والشرطة فقط.',
      status: 'راجع طلبك في واتساب ثم اضغط إرسال للتواصل مع أول.',
      button: 'المتابعة عبر واتساب ↗'
    }
  };
  const digits = value => value.replace(/[٠-٩۰-۹]/g, c => String(c.charCodeAt(0) - (c <= '٩' ? 0x660 : 0x6f0)));
  const clean = data => Object.fromEntries(Object.keys({name:0,company:0,email:0,phone:0,budget:0,service:0,message:0}).map(key => {
    let value = String(data[key] || '').trim();
    if (key === 'phone' || key === 'budget') value = digits(value);
    return [key, value];
  }));
  const validText = value => /^[\p{L}\p{M}\p{N} ,،&\-\r\n]+$/u.test(value) && /[\p{L}\p{N}]/u.test(value);
  function validate(input) {
    const data = clean(input), errors = {};
    if (!/^[\p{L}\p{M} ]+$/u.test(data.name) || !/\p{L}/u.test(data.name) || data.name.length > 100) errors.name = 'name';
    if (data.company && (!validText(data.company) || data.company.length > 120)) errors.company = 'company';
    if (!/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(data.email) || data.email.length > 254) errors.email = 'email';
    if (data.phone && !/^\+?[0-9]{7,15}$/.test(data.phone)) errors.phone = 'phone';
    if (data.budget && !/^[0-9]{1,12}$/.test(data.budget)) errors.budget = 'budget';
    if (!Object.hasOwn(services, data.service)) errors.service = 'service';
    if (!validText(data.message) || data.message.length > 2000) errors.message = 'message';
    return {data, errors};
  }
  function whatsappUrl(data) {
    const message = [
      'New Awwal Brands enquiry', 'Name: ' + data.name,
      'Company: ' + (data.company || 'Not provided'), 'Email: ' + data.email,
      'Phone: ' + (data.phone || 'Not provided'), 'Service: ' + services[data.service],
      'Budget: ' + (data.budget ? data.budget + ' SAR' : 'Not specified'),
      '', 'Project details:', data.message
    ].join('\n');
    return 'https://wa.me/966539211696?text=' + encodeURIComponent(message);
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = {validate, whatsappUrl};
  if (typeof document === 'undefined') return;
  const form = document.querySelector('.contact-form');
  if (!form) return;
  const fields = [...form.querySelectorAll('input,select,textarea')];
  const button = form.querySelector('[type="submit"]');
  const status = form.querySelector('.form-status');
  const language = () => document.documentElement.lang === 'ar' ? 'ar' : 'en';
  // Custom messages accompany native validation; never silently remove what a visitor typed.
  fields.forEach(field => {
    const hint = document.createElement('span');
    hint.id = 'enquiry-error-' + field.name;
    hint.className = 'field-error';
    hint.setAttribute('aria-live', 'polite');
    field.after(hint);
    field.setAttribute('aria-describedby', hint.id);
    field.addEventListener('input', () => {
      field.setCustomValidity('');
      field.removeAttribute('aria-invalid');
      hint.textContent = '';
    });
    field.addEventListener('invalid', () => {
      field.setAttribute('aria-invalid', 'true');
      hint.textContent = text[language()][field.name] || field.validationMessage;
    });
  });
  function updateLanguage() {
    const copy = text[language()];
    button.textContent = copy.button;
    status.textContent = copy.status;
  }
  new MutationObserver(updateLanguage).observe(document.documentElement, {attributes:true, attributeFilter:['lang']});
  updateLanguage();
  button.disabled = false;
  form.addEventListener('submit', event => {
    event.preventDefault();
    const {data, errors} = validate(Object.fromEntries(new FormData(form)));
    fields.forEach(field => {
      const error = errors[field.name] ? text[language()][field.name] : '';
      field.setCustomValidity(error);
      field.setAttribute('aria-invalid', String(Boolean(error)));
      document.getElementById('enquiry-error-' + field.name).textContent = error;
    });
    if (!form.reportValidity()) return;
    // The visitor reviews and sends in WhatsApp; this never claims a message was already sent.
    window.location.assign(whatsappUrl(data));
  });
})();
