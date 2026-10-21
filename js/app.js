'use strict';

const OFFICE = {
  name: 'مكتب الميزان للمحاماة والاستشارات القانونية',
  nameEn: 'Al-Mizan Law Office',
  phone: '+201000000000',
  phoneDisplay: '+20 100 000 0000',
  whatsapp: '201000000000',
  whatsappMessage: 'السلام عليكم، أرغب في طلب استشارة قانونية (نموذج تجريبي).',
  email: 'info@almizan-demo.example',
  address: '١٢ شارع النيل، الدور الخامس، وسط البلد، القاهرة، جمهورية مصر العربية',
  hours: 'الأحد – الخميس: ٩:٠٠ ص – ٥:٠٠ م'
};

const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

function toArabicDigits(value) {
  return String(value).replace(/\d/g, (d) => ARABIC_DIGITS[Number(d)]);
}

function applyOfficeData() {
  document.querySelectorAll('[data-office]').forEach((el) => {
    const key = el.getAttribute('data-office');
    if (key && Object.prototype.hasOwnProperty.call(OFFICE, key)) {
      el.textContent = OFFICE[key];
    }
  });

  document.querySelectorAll('[data-office-link="phone"]').forEach((el) => {
    el.setAttribute('href', `tel:${OFFICE.phone}`);
    el.setAttribute('aria-label', `اتصال هاتفي بالرقم ${OFFICE.phoneDisplay}`);
  });

  document.querySelectorAll('[data-office-link="whatsapp"]').forEach((el) => {
    const url = `https://wa.me/${OFFICE.whatsapp}?text=${encodeURIComponent(OFFICE.whatsappMessage)}`;
    el.setAttribute('href', url);
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
    el.setAttribute('aria-label', 'مراسلة المكتب عبر واتساب');
  });

  document.querySelectorAll('[data-office-link="email"]').forEach((el) => {
    el.setAttribute('href', `mailto:${OFFICE.email}`);
    el.setAttribute('aria-label', `إرسال بريد إلكتروني إلى ${OFFICE.email}`);
  });
}

function initYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

function initHeaderScroll() {
  const header = document.getElementById('siteHeader');
  const toTop = document.getElementById('toTop');
  if (!header) return;

  let ticking = false;

  const update = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    header.classList.toggle('is-scrolled', y > 12);
    if (toTop) {
      toTop.classList.toggle('is-visible', y > 420);
    }
    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    },
    { passive: true }
  );

  update();

  if (toTop) {
    toTop.addEventListener('click', () => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
  }
}

function initScrollSpy() {
  const links = Array.from(document.querySelectorAll('.main-nav .nav-link'));
  if (!links.length || !('IntersectionObserver' in window)) return;

  const sections = links
    .map((link) => {
      const id = link.getAttribute('href');
      if (!id || !id.startsWith('#')) return null;
      const section = document.querySelector(id);
      return section ? { link, section } : null;
    })
    .filter(Boolean);

  if (!sections.length) return;

  const setActive = (target) => {
    links.forEach((link) => {
      const isActive = target && link === target;
      link.classList.toggle('is-active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (visible.length) {
        const match = sections.find((item) => item.section === visible[0].target);
        if (match) setActive(match.link);
      }
    },
    {
      rootMargin: '-25% 0px -55% 0px',
      threshold: [0, 0.15, 0.35, 0.6]
    }
  );

  sections.forEach(({ section }) => observer.observe(section));
}

function initMobileNav() {
  const offcanvasEl = document.getElementById('mobileNav');
  if (!offcanvasEl) return;

  offcanvasEl.addEventListener('shown.bs.offcanvas', () => {
    const firstLink = offcanvasEl.querySelector('.mobile-nav__links a');
    if (firstLink) firstLink.focus();
  });

  offcanvasEl.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', () => {
      const instance = window.bootstrap?.Offcanvas.getInstance(offcanvasEl);
      if (instance) instance.hide();
    });
  });
}

function initSmoothAnchors() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (!href || href === '#' || href.length < 2) return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();

      const header = document.getElementById('siteHeader');
      const offset = header ? header.offsetHeight + 16 : 16;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });

      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
      }
      window.setTimeout(() => target.focus({ preventScroll: true }), reduce ? 0 : 420);

      if (history.replaceState) {
        history.replaceState(null, '', href);
      }
    });
  });
}

const VALIDATORS = {
  fullName(value) {
    const v = String(value || '').trim();
    if (!v) return 'يرجى إدخال الاسم الكامل.';
    if (v.length < 3) return 'يجب أن يكون الاسم ٣ أحرف على الأقل.';
    if (v.length > 80) return 'الاسم طويل جدًا.';
    if (!/^[\p{L}\s'’\-.]+$/u.test(v)) return 'يرجى إدخال حروف فقط في خانة الاسم.';
    return '';
  },

  contact(value) {
    const v = String(value || '').trim();
    if (!v) return 'يرجى إدخال رقم هاتف أو بريد إلكتروني.';

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    const isPhone = /^\+?[\d\s\-()]{8,20}$/.test(v) && /\d{7,}/.test(v.replace(/\D/g, ''));

    if (isEmail || isPhone) return '';
    return 'يرجى إدخال بريد إلكتروني صحيح أو رقم هاتف صحيح.';
  },

  subject(value) {
    return String(value || '').trim() ? '' : 'يرجى اختيار موضوع الاستفسار.';
  },

  preferredTime(value) {
    return String(value || '').trim() ? '' : 'يرجى اختيار الوقت المفضل للتواصل.';
  },

  consent(checked) {
    return checked ? '' : 'يجب الإقرار قبل إرسال الطلب.';
  }
};

function initConsultForm() {
  const form = document.getElementById('consultForm');
  if (!form) return;

  const statusEl = document.getElementById('formStatus');
  const submitBtn = document.getElementById('submitBtn');
  const resetBtn = document.getElementById('resetBtn');
  const summary = document.getElementById('summary');
  const summaryCount = document.getElementById('summaryCount');

  const fields = {
    fullName: {
      input: document.getElementById('fullName'),
      error: document.getElementById('fullNameError'),
      validate: () => VALIDATORS.fullName(document.getElementById('fullName').value)
    },
    contact: {
      input: document.getElementById('contact'),
      error: document.getElementById('contactError'),
      validate: () => VALIDATORS.contact(document.getElementById('contact').value)
    },
    subject: {
      input: document.getElementById('subject'),
      error: document.getElementById('subjectError'),
      validate: () => VALIDATORS.subject(document.getElementById('subject').value)
    },
    preferredTime: {
      input: document.getElementById('preferredTime'),
      error: document.getElementById('preferredTimeError'),
      validate: () => VALIDATORS.preferredTime(document.getElementById('preferredTime').value)
    },
    consent: {
      input: document.getElementById('consent'),
      error: document.getElementById('consentError'),
      validate: () => VALIDATORS.consent(document.getElementById('consent').checked)
    }
  };

  const setStatus = (type, title, message) => {
    if (!statusEl) return;
    statusEl.className = `form-status is-visible is-${type}`;
    statusEl.innerHTML = '';

    const strong = document.createElement('strong');
    strong.textContent = title;
    statusEl.appendChild(strong);

    const p = document.createElement('span');
    p.textContent = message;
    statusEl.appendChild(p);
  };

  const clearStatus = () => {
    if (!statusEl) return;
    statusEl.className = 'form-status';
    statusEl.textContent = '';
  };

  const showFieldError = (field, message) => {
    if (!field.input || !field.error) return;
    if (message) {
      field.error.textContent = message;
      field.error.classList.add('is-visible');
      field.input.classList.add('is-invalid');
      field.input.setAttribute('aria-invalid', 'true');
    } else {
      field.error.textContent = '';
      field.error.classList.remove('is-visible');
      field.input.classList.remove('is-invalid');
      field.input.removeAttribute('aria-invalid');
    }
  };

  const validateField = (key) => {
    const field = fields[key];
    if (!field) return true;
    const message = field.validate();
    showFieldError(field, message);
    return !message;
  };

  const validateAll = () => {
    let firstInvalidKey = null;

    Object.keys(fields).forEach((key) => {
      const ok = validateField(key);
      if (!ok && !firstInvalidKey) firstInvalidKey = key;
    });

    return firstInvalidKey;
  };

  Object.keys(fields).forEach((key) => {
    const field = fields[key];
    if (!field.input) return;

    const eventName = field.input.tagName === 'SELECT' || field.input.type === 'checkbox' ? 'change' : 'blur';
    field.input.addEventListener(eventName, () => validateField(key));

    if (field.input.tagName !== 'SELECT' && field.input.type !== 'checkbox') {
      field.input.addEventListener('input', () => {
        if (field.input.classList.contains('is-invalid')) {
          validateField(key);
        }
      });
    }
  });

  if (summary && summaryCount) {
    const updateCount = () => {
      const len = summary.value.length;
      summaryCount.textContent = `${toArabicDigits(len)} / ${toArabicDigits(600)}`;
    };
    summary.addEventListener('input', updateCount);
    updateCount();
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    clearStatus();

    const firstInvalidKey = validateAll();

    if (firstInvalidKey) {
      setStatus(
        'error',
        'تحقق من الحقول المطلوبة',
        'يرجى تصحيح الحقول المعلَّمة بالأحمر ثم إعادة المحاولة.'
      );
      const firstInput = fields[firstInvalidKey].input;
      if (firstInput) {
        firstInput.focus();
        firstInput.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
      return;
    }

    if (submitBtn) {
      submitBtn.classList.add('is-loading');
      submitBtn.setAttribute('aria-busy', 'true');
      submitBtn.disabled = true;
    }

    setStatus('info', 'جارٍ المعالجة…', 'يتم التحقق من البيانات محليًا في المتصفح. لا يوجد اتصال بخادم.');

    window.setTimeout(() => {
      if (submitBtn) {
        submitBtn.classList.remove('is-loading');
        submitBtn.removeAttribute('aria-busy');
        submitBtn.disabled = false;
      }

      setStatus(
        'success',
        'تم التحقق من البيانات بنجاح (عرض تجريبي)',
        'هذه رسالة توضيحية فقط. لم يتم إرسال أي بيانات إلى المكتب أو إلى أي خادم، ولم تُحفظ في المتصفح. لتقديم طلب حقيقي، يجب ربط النموذج بخدمة استقبال مناسبة بعد مراجعة سياسة الخصوصية.'
      );

      form.reset();
      Object.keys(fields).forEach((key) => showFieldError(fields[key], ''));

      if (summaryCount) {
        summaryCount.textContent = `${toArabicDigits(0)} / ${toArabicDigits(600)}`;
      }

      if (statusEl) statusEl.focus({ preventScroll: true });
    }, 900);
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      window.setTimeout(() => {
        Object.keys(fields).forEach((key) => showFieldError(fields[key], ''));
        clearStatus();
        if (summaryCount) {
          summaryCount.textContent = `${toArabicDigits(0)} / ${toArabicDigits(600)}`;
        }
      }, 0);
    });
  }
}

function initAccordionA11y() {
  document.querySelectorAll('.faq-accordion .accordion-collapse').forEach((panel) => {
    panel.addEventListener('shown.bs.collapse', () => {
      panel.setAttribute('aria-hidden', 'false');
    });
    panel.addEventListener('hidden.bs.collapse', () => {
      panel.setAttribute('aria-hidden', 'true');
    });
  });
}

function init() {
  applyOfficeData();
  initYear();
  initHeaderScroll();
  initScrollSpy();
  initSmoothAnchors();
  initMobileNav();
  initConsultForm();
  initAccordionA11y();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
