// Navbar Scroll Effect
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Video Modal Script
const playBtn = document.getElementById('playBtn');
const videoModal = document.getElementById('videoModal');
const closeBtn = document.getElementById('closeBtn');
const youtubePlayer = document.getElementById('youtubePlayer');

// Replace with your YouTube video ID
const YOUTUBE_VIDEO_ID = 'JyZ_4v8df8A'; // Origin Story Video

if (playBtn && videoModal && closeBtn && youtubePlayer) {
playBtn.addEventListener('click', () => {
  // Set the YouTube URL with the video ID
  youtubePlayer.src = `https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1`;
  videoModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
});

closeBtn.addEventListener('click', () => {
  videoModal.style.display = 'none';
  youtubePlayer.src = '';
  document.body.style.overflow = 'auto';
});

// Close modal when clicking outside the content
videoModal.addEventListener('click', (e) => {
  if (e.target === videoModal) {
    videoModal.style.display = 'none';
    youtubePlayer.src = '';
    document.body.style.overflow = 'auto';
  }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && videoModal.style.display !== 'none') {
    videoModal.style.display = 'none';
    youtubePlayer.src = '';
    document.body.style.overflow = 'auto';
  }
});
} // end video modal

/* CAROUSEL SCRIPT */
const carousel = document.getElementById('carousel');
const cprevBtn = document.getElementById('prevBtn');
const cnextBtn = document.getElementById('nextBtn');
const cards = Array.from(document.querySelectorAll('.carousel-card'));

if (carousel && cprevBtn && cnextBtn && cards.length) {
let currentIndex = 0; // Start with Car Accidents card active

const STEP_X = 240; // Horizontal spacing between visible cards
const MAX_VISIBLE_DISTANCE = 2; // Distance from center (-2..2) that stays visible
const ROTATE_Y = 35; // 3D rotation angle for side cards

function getSignedDistance(i, centerIndex, n) {
  // Shortest signed distance around a circular list
  let d = i - centerIndex;
  if (d > n / 2) d -= n;
  if (d < -n / 2) d += n;
  return d;
}

function setActiveButton(index, practiceButtons) {
  practiceButtons.forEach(b => b.classList.remove('active'));
  if (practiceButtons[index]) practiceButtons[index].classList.add('active');
}

function applyPosition(card, dist, animate = true) {
  const absd = Math.abs(dist);
  const canShow = absd <= MAX_VISIBLE_DISTANCE;

  const stepForDist = absd === 1 ? 260 : STEP_X;
  const x = (dist === 0) ? 0 : (dist > 0 ? 1 : -1) * (absd === 1 ? 260 : 520);
  const baseRotY = absd === 0 ? 0 : absd === 1 ? ROTATE_Y : ROTATE_Y + 20;
  const rotY = dist < 0 ? baseRotY : dist > 0 ? -baseRotY : 0;
  const tz = absd === 0 ? 0 : absd === 1 ? -80 : -40;
  const scale = absd === 0 ? 1 : absd === 1 ? 0.95 : 1.15;
  const z = absd === 0 ? 3 : absd === 1 ? 2 : 1;

  card.style.transition = animate
    ? 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.5s ease, box-shadow 0.5s ease'
    : 'none';

  card.style.transform = `translate(-50%, -50%) translateX(${x}px) translateZ(${tz}px) rotateY(${rotY}deg) scale(${scale})`;
  card.style.opacity = canShow ? 1 : 0;
  card.style.zIndex = canShow ? z : 0;
  card.style.boxShadow = canShow
    ? (absd === 0
      ? '0 20px 50px rgba(0,0,0,0.18)'
      : '0 10px 30px rgba(0,0,0,0.10)')
    : 'none';

  // Only center card shows overlay
  if (absd === 0) {
    card.classList.add('active-card');
  } else {
    card.classList.remove('active-card');
  }

  // Avoid hidden cards blocking clicks
  card.style.pointerEvents = canShow ? 'auto' : 'none';
}

function updateCarousel() {
  const n = cards.length;
  cards.forEach((card, i) => {
    const dist = getSignedDistance(i, currentIndex, n);
    applyPosition(card, dist, true);
  });
}

cprevBtn.addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + cards.length) % cards.length;
  updateCarousel();
  // Sync active tab
  practiceButtons.forEach((b, i) => {
    if (i === currentIndex) b.classList.add('active');
    else b.classList.remove('active');
  });
});

cnextBtn.addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % cards.length;
  updateCarousel();
  // Sync active tab
  practiceButtons.forEach((b, i) => {
    if (i === currentIndex) b.classList.add('active');
    else b.classList.remove('active');
  });
});

// Sync category buttons
const practiceButtons = document.querySelectorAll('.practice-btn');
practiceButtons.forEach((btn, i) => {
  btn.addEventListener('click', () => {
    currentIndex = Math.min(i, cards.length - 1);
    setActiveButton(currentIndex, practiceButtons);
    updateCarousel();
  });
});

// Center card: go to practice page. Side card: bring to center (then click again to open).
cards.forEach((card, i) => {
  card.addEventListener('click', (e) => {
    e.stopPropagation();
    const href = card.dataset.href;
    if (href && card.classList.contains('active-card')) {
      window.location.href = href;
      return;
    }
    currentIndex = i;
    setActiveButton(currentIndex, practiceButtons);
    updateCarousel();
  });
});

// Initialize
updateCarousel();
setActiveButton(currentIndex, practiceButtons);
} // end carousel if

/* ══════════════════════════════════════
   CASE STUDIES — Carousel + Scroll Animation
   Place before </body>:  <script src="case-studies.js"></script>
══════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Config ── */
  const CARDS_PER_VIEW_DESKTOP = 3;
  const CARDS_PER_VIEW_TABLET  = 2;
  const CARDS_PER_VIEW_MOBILE  = 1;

  /* ── Elements ── */
  const track    = document.getElementById('csTrack');
  const prevBtn  = document.getElementById('csPrev');
  const nextBtn  = document.getElementById('csNext');
  const dotsWrap = document.getElementById('csDots');

  if (!track || !prevBtn || !nextBtn) return; // guard if section not on page

  const cards = Array.from(track.querySelectorAll('.cs-card'));
  const total = cards.length;

  let currentIndex = 0;

  /* ── Responsive: how many cards visible ── */
  function getPerView() {
    if (window.innerWidth <= 480) return CARDS_PER_VIEW_MOBILE;
    if (window.innerWidth <= 720) return CARDS_PER_VIEW_TABLET;
    return CARDS_PER_VIEW_DESKTOP;
  }

  /* ── Total "pages" ── */
  function maxIndex() {
    return Math.max(0, total - getPerView());
  }

  /* ── Move track ── */
  function goTo(index) {
    const perView = getPerView();
    currentIndex = Math.max(0, Math.min(index, maxIndex()));

    const cardWidth = cards[0].getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(track).gap) || 20;
    const offset = currentIndex * (cardWidth + gap);

    track.style.transform = `translateX(-${offset}px)`;
    cards.forEach((card, i) => {
      card.classList.toggle('cs-active', i === currentIndex);
    });

    updateDots();
    updateButtons();
  }

  /* ── Button states ── */
  function updateButtons() {
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= maxIndex();
  }

  /* ── Dots ── */
  function buildDots() {
    dotsWrap.innerHTML = '';
    const pages = maxIndex() + 1;
    for (let i = 0; i < pages; i++) {
      const dot = document.createElement('button');
      dot.className = 'cs-dot' + (i === 0 ? ' cs-dot-active' : '');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    }
  }

  function updateDots() {
    const dots = dotsWrap.querySelectorAll('.cs-dot');
    dots.forEach((d, i) => {
      d.classList.toggle('cs-dot-active', i === currentIndex);
    });
  }

  /* ── Button listeners ── */
  prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
  nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

  /* ── Touch / swipe support ── */
  let touchStartX = 0;
  let touchEndX   = 0;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      goTo(diff > 0 ? currentIndex + 1 : currentIndex - 1);
    }
  }, { passive: true });

  /* ── Keyboard nav ── */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') goTo(currentIndex + 1);
    if (e.key === 'ArrowLeft')  goTo(currentIndex - 1);
  });

  /* ── Rebuild on resize ── */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      buildDots();
      goTo(Math.min(currentIndex, maxIndex()));
    }, 120);
  });

  /* ── Scroll-in animation (IntersectionObserver) ── */
  function initScrollAnimation() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: just show everything
      cards.forEach(c => c.classList.add('cs-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('cs-visible');
            observer.unobserve(entry.target); // animate once
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.15,
      }
    );

    cards.forEach((card) => {
      observer.observe(card);
      // Check if card is already in viewport on page load
      const rect = card.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        setTimeout(() => {
          card.classList.add('cs-visible');
          observer.unobserve(card);
        }, 100);
      }
    });
  }

  /* ── Init ── */
  buildDots();
  goTo(total > getPerView() ? 1 : 0);
  initScrollAnimation();
})();

/* ══════════════════════════════════════
   FAQ Accordion
   ══════════════════════════════════════ */
(function () {
  'use strict';

  const items = document.querySelectorAll('.faq-item');
  if (!items || items.length === 0) return;

  items.forEach((item) => {
    const btn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      item.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
      answer.setAttribute('aria-hidden', String(isOpen));
    });
  });
})();

/* ══════════════════════════════════════
   Team Section Carousel (After CS)
   ══════════════════════════════════════ */
(function () {
  'use strict';

  const track = document.getElementById('teamTrack');
  const prevBtn = document.getElementById('teamPrev');
  const nextBtn = document.getElementById('teamNext');

  if (!track || !prevBtn || !nextBtn) return;

  const cards = Array.from(track.querySelectorAll('.team-card'));
  const total = cards.length;

  if (total === 0) return;

  const GAP_PX = 20; // must match .team-track gap
  const CARDS_PER_VIEW_DESKTOP = 4;
  const CARDS_PER_VIEW_TABLET = 2;
  const CARDS_PER_VIEW_MOBILE = 1;

  let currentIndex = 0;

  function getPerView() {
    if (window.innerWidth <= 480) return CARDS_PER_VIEW_MOBILE;
    if (window.innerWidth <= 900) return CARDS_PER_VIEW_TABLET;
    return CARDS_PER_VIEW_DESKTOP;
  }

  function maxIndex() {
    return Math.max(0, total - getPerView());
  }

  function updateButtons() {
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= maxIndex();
  }

  function goTo(index) {
    currentIndex = Math.max(0, Math.min(index, maxIndex()));

    const cardWidth = cards[0].getBoundingClientRect().width;
    const offset = currentIndex * (cardWidth + GAP_PX);
    track.style.transform = `translateX(-${offset}px)`;

    updateButtons();
  }

  // Init
  goTo(0);

  prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
  nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

  // Swipe support
  let touchStartX = 0;
  let touchEndX = 0;

  track.parentElement.addEventListener(
    'touchstart',
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
    },
    { passive: true }
  );

  track.parentElement.addEventListener(
    'touchend',
    (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        goTo(diff > 0 ? currentIndex + 1 : currentIndex - 1);
      }
    },
    { passive: true }
  );

  // Keyboard nav
  document.addEventListener('keydown', (e) => {
    const section = track.closest('.team-section');
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (!inView) return;

    if (e.key === 'ArrowRight') goTo(currentIndex + 1);
    if (e.key === 'ArrowLeft') goTo(currentIndex - 1);
  });

  // Rebuild on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => goTo(currentIndex), 150);
  });
})();

/* ──────────────────────────────────────
   FAQ Accordion Script
   ────────────────────────────────────── */
function initFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  console.log('FAQ Accordion: Found ' + faqItems.length + ' items');
  
  if (faqItems.length === 0) {
    console.warn('No FAQ items found');
    return;
  }
  
  console.log('Attaching click handler to FAQ items');
  
  faqItems.forEach((item, index) => {
    const question = item.querySelector('.faq-question');
    
    if (!question) {
      console.warn('FAQ question button not found in item ' + index);
      return;
    }
    
    question.addEventListener('click', (e) => {
      console.log('FAQ item ' + index + ' clicked');
      e.stopPropagation();
      
      const isActive = item.classList.contains('active');
      
      // Close all items
      faqItems.forEach(i => i.classList.remove('active'));
      
      // Open clicked item if it wasn't active
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

// Run immediately if DOM is ready, otherwise wait for DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFAQAccordion);
} else {
  initFAQAccordion();
}

/* ─────────────────────────────────────────────
   YouTube Video Modal
   ───────────────────────────────────────────── */
(function() {
  function initYTModal() {
    var backdrop = document.getElementById('ytModalBackdrop');
    var iframe   = document.getElementById('ytModalIframe');
    var closeBtn = document.getElementById('ytModalClose');
    if (!backdrop || !iframe) return;

    function openModal(ytId) {
      iframe.src = 'https://www.youtube.com/embed/' + ytId + '?autoplay=1&rel=0';
      backdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      backdrop.classList.remove('active');
      iframe.src = '';
      document.body.style.overflow = '';
    }

    document.querySelectorAll('.cs-video-card').forEach(function(card) {
      var ytId = card.getAttribute('data-yt');
      card.addEventListener('click', function() {
        var ytId = card.getAttribute('data-yt');
        if (ytId && ytId !== '' && !ytId.startsWith('YOUTUBE_ID')) openModal(ytId);
      });
    });

    closeBtn && closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', function(e) {
      if (e.target === backdrop) closeModal();
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeModal();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initYTModal);
  } else {
    initYTModal();
  }
})();

/* ─────────────────────────────────────────────
   Contact Page Animations
   ───────────────────────────────────────────── */
(function() {
  function initCPAnimations() {
    var cpEls = document.querySelectorAll('.cp-animate');
    if (!cpEls.length) return;

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var delay = parseInt(el.getAttribute('data-delay') || '0', 10);
          setTimeout(function() {
            el.classList.add('cp-visible');
          }, delay);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.05, rootMargin: '50px' });

    cpEls.forEach(function(el) { observer.observe(el); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCPAnimations);
  } else {
    initCPAnimations();
  }
})();

/* ─────────────────────────────────────────────
   Hamburger / Mobile Nav
   ───────────────────────────────────────────── */
(function () {
  'use strict';

  var hamburger = document.getElementById('navHamburger');
  var navbar    = document.querySelector('.navbar');
  if (!hamburger || !navbar) return;

  function closeMenu() {
    navbar.classList.remove('nav-open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  // Toggle menu
  hamburger.addEventListener('click', function () {
    var isOpen = navbar.classList.toggle('nav-open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close when a non-toggle link is clicked
  navbar.querySelectorAll('nav a').forEach(function (link) {
    if (!link.classList.contains('nav-dropdown-toggle')) {
      link.addEventListener('click', closeMenu);
    }
  });

  // Accordion for About dropdown on mobile
  navbar.querySelectorAll('.nav-dropdown-toggle').forEach(function (toggle) {
    toggle.addEventListener('click', function (e) {
      if (window.innerWidth <= 900) {
        e.preventDefault();
        var dropdown = toggle.closest('.nav-dropdown');
        dropdown.classList.toggle('open');
      }
    });
  });

  // Close on resize to desktop
  window.addEventListener('resize', function () {
    if (window.innerWidth > 900) closeMenu();
  });

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });
})();

/* ─────────────────────────────────────────────
   GLOBAL PREMIUM FORM SUBMISSIONS & TOASTS
   ───────────────────────────────────────────── */
(function () {
  'use strict';

  // Reusable Premium Toast Spawning System
  function showToast(title, message, type) {
    type = type || 'success';
    var container = document.querySelector('.premium-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'premium-toast-container';
      document.body.appendChild(container);
    }

    var toast = document.createElement('div');
    toast.className = 'premium-toast';
    
    var iconHTML = '✓';
    if (type === 'error' || type === 'warning') {
      iconHTML = '✦';
    }

    toast.innerHTML = [
      '<div class="premium-toast-icon">', iconHTML, '</div>',
      '<div class="premium-toast-body">',
        '<h4 class="premium-toast-title">', title, '</h4>',
        '<p class="premium-toast-msg">', message, '</p>',
      '</div>'
    ].join('');

    container.appendChild(toast);

    window.requestAnimationFrame(function () {
      setTimeout(function () {
        toast.classList.add('show');
      }, 50);
    });

    var hideTimeout = setTimeout(function () {
      toast.classList.remove('show');
    }, 4500);

    var destroyTimeout = setTimeout(function () {
      toast.remove();
    }, 5000);

    toast.addEventListener('click', function () {
      clearTimeout(hideTimeout);
      clearTimeout(destroyTimeout);
      toast.classList.remove('show');
      setTimeout(function () {
        toast.remove();
      }, 500);
    });
  }

  window.showPremiumToast = showToast;

  function initGlobalForms() {
    var forms = document.querySelectorAll('form');
    console.log('Premium Forms System: Intercepting ' + forms.length + ' forms');

    forms.forEach(function (form) {
      if (form.classList.contains('nav-search') || form.closest('.nav-search')) {
        return;
      }

      if (form.getAttribute('onsubmit')) {
        form.removeAttribute('onsubmit');
        form.onsubmit = null;
      }

      form.addEventListener('submit', function (event) {
        event.preventDefault();

        var isValid = true;
        var requiredInputs = form.querySelectorAll('[required]');
        
        requiredInputs.forEach(function (input) {
          if (!input.value.trim()) {
            isValid = false;
            input.classList.add('border-red-500');
            input.addEventListener('input', function removeBorder() {
              input.classList.remove('border-red-500');
              input.removeEventListener('input', removeBorder);
            });
          }
        });

        if (!isValid) {
          showToast('Case Review Requirement', 'Please fill in all marked required fields.', 'warning');
          return;
        }

        var submitBtn = form.querySelector('button[type="submit"]') || form.querySelector('button');
        if (!submitBtn || submitBtn.classList.contains('submitting-state')) return;

        submitBtn.classList.add('submitting-state');

        setTimeout(function () {
          submitBtn.classList.remove('submitting-state');
          form.reset();

          if (form.classList.contains('newsletter-form')) {
            showToast(
              'INSIGHTS SUBSCRIBED',
              'Welcome! You are now subscribed to our premium legal publication.',
              'success'
            );
          } else if (form.classList.contains('premium-hero-form') || form.classList.contains('space-y-6') || form.classList.contains('contact-form')) {
            showToast(
              'EVALUATION SUBMITTED SECURELY',
              'Thank you. An expert attorney will contact you within 15 minutes.',
              'success'
            );
          } else {
            showToast(
              'SUBMISSION RECEIVED',
              'Thank you. Your request has been successfully and securely transmitted.',
              'success'
            );
          }
        }, 1500);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGlobalForms);
  } else {
    initGlobalForms();
  }
})();

/* ─────────────────────────────────────────────
   Client Promise Button Navigation
   ───────────────────────────────────────────── */
(function() {
  const clientPromiseButtons = document.querySelectorAll('.client-promise-btn');
  clientPromiseButtons.forEach(button => {
    button.addEventListener('click', function() {
      window.location.href = 'contact.html';
    });
  });

  // Also handle the CTA button on index page
  const ctaButton = document.querySelector('.cta');
  if (ctaButton) {
    ctaButton.addEventListener('click', function() {
      window.location.href = 'contact.html';
    });
  }

  // Learn More on Firm History page → Ibrahim Awad; homepage uses <a href="about.html">.
  const path = window.location.pathname.replace(/\\/g, '/');
  const isAboutPage = /(^|\/)about\.html$/i.test(path);
  const learnMoreBtn = document.querySelector('.origin-story .learn-more-btn');
  if (learnMoreBtn && isAboutPage) {
    learnMoreBtn.addEventListener('click', function() {
      window.location.href = 'ibrahim-awad.html';
    });
  }
})();

/* Scroll-progress hero reveal (pin-wrapper approach) */
(function () {
  'use strict';

  var hero = document.querySelector('.premium-home-hero');
  var wrapper = document.querySelector('.hero-pin-wrapper');
  if (!hero || !wrapper) return;

  var ticking = false;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function setProgress(name, value) {
    hero.style.setProperty(name, value.toFixed(4));
  }

  function updateHeroReveal() {
    ticking = false;

    if (window.innerWidth <= 900 || (reduceMotion && reduceMotion.matches)) {
      setProgress('--hero-reveal-progress', 1);
      setProgress('--hero-image-progress', 1);
      setProgress('--hero-form-progress', 1);
      setProgress('--hero-side-progress', 1);
      document.body.classList.add('hero-form-visible', 'hero-reveal-complete');
      return;
    }

    /* Use the wrapper's scroll position — wrapper is tall, hero is 100vh sticky inside */
    var wrapperRect = wrapper.getBoundingClientRect();
    var scrollRange = Math.max(1, wrapper.offsetHeight - window.innerHeight);
    var progress = clamp((-wrapperRect.top) / scrollRange, 0, 1);

    /* Ibrahim and side elements fade out smoothly as the form fades in with a premium 10% scroll buffer */
    var imageProgress = clamp((progress - 0.10) / 0.90, 0, 1);
    var sideProgress = clamp((progress - 0.10) / 0.90, 0, 1);
    var formProgress = clamp((progress - 0.10) / 0.90, 0, 1);

    setProgress('--hero-reveal-progress', progress);
    setProgress('--hero-image-progress', imageProgress);
    setProgress('--hero-form-progress', formProgress);
    setProgress('--hero-side-progress', sideProgress);

    document.body.classList.toggle('hero-form-visible', formProgress > 0.01);
    document.body.classList.toggle('hero-reveal-complete', formProgress >= 0.98);
  }

  function requestUpdate() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateHeroReveal);
    }
  }

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  if (reduceMotion && reduceMotion.addEventListener) {
    reduceMotion.addEventListener('change', requestUpdate);
  }
  updateHeroReveal();
})();

/* Global polish interactions */
(function () {
  'use strict';

  function initPolish() {
    var path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.navbar nav a[href]').forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href || href.indexOf('http') === 0 || href === '#') return;
      if (href === path) link.classList.add('active');
    });

    // 1. Target key structural components for automatic dynamic animation
    var revealSelectors = [
      'section > .container',
      '.origin-header',
      '.origin-card',
      '.practice-header',
      '.carousel-card',
      '.t-card',
      '.cs-card',
      '.team-card',
      '.five-steps-card',
      '.community-card',
      '.bio-hero',
      '.anniversary-grid',
      '.faq-card',
      '.process-step',
      '.why-choose-card',
      '.core-value-card',
      '.mission-vision-card',
      '.client-promise-card',
      '.contact-info-card',
      '.contact-form-card',
      '.pa-card',
      '.result-card',
      '.edu-card',
      '.tedx-theme-card',
      '.tedx-takeaway-card',
      '.cp-info-card',
      '.cp-office-card',
      '.cp-form-card',
      '.related-results-card'
    ];

    // Stagger layout containers (grids, flex rows) dynamically for premium feel
    var layoutContainers = document.querySelectorAll('.grid, [class*="grid-"], .flex-wrap, .anniversary-grid, .five-steps-card-wrap');
    layoutContainers.forEach(function (container) {
      // Avoid footer or navbar sections from being animated as blocks
      if (container.closest('.navbar') || container.closest('.site-footer')) return;

      var children = Array.from(container.children).filter(function (child) {
        return child.tagName !== 'SCRIPT' && child.tagName !== 'STYLE' && !child.classList.contains('hidden');
      });

      children.forEach(function (child, idx) {
        if (!child.classList.contains('scroll-reveal') &&
            !child.classList.contains('scroll-reveal-left') &&
            !child.classList.contains('scroll-reveal-right') &&
            !child.classList.contains('scroll-reveal-scale')) {

          // Alternate left and right entrance animations for highly active staggered sections
          if (idx % 2 === 0) {
            child.classList.add('scroll-reveal-left');
          } else {
            child.classList.add('scroll-reveal-right');
          }

          // Compute elegant, sequenced staggered delay values
          child.style.transitionDelay = (idx * 85) + 'ms';
        }
      });
    });

    // Make headings slide in gracefully
    var headers = document.querySelectorAll('h2, h3, .section-title, .subtitle');
    headers.forEach(function (header) {
      if (header.closest('.navbar') || header.closest('.site-footer')) return;
      if (!header.classList.contains('scroll-reveal') &&
          !header.classList.contains('scroll-reveal-left') &&
          !header.classList.contains('scroll-reveal-right')) {
        header.classList.add('scroll-reveal');
      }
    });

    // Retrofit legacy selectors with standard scroll-reveal classes
    var legacyElements = document.querySelectorAll(revealSelectors.join(','));
    legacyElements.forEach(function (el) {
      if (!el.classList.contains('scroll-reveal') &&
          !el.classList.contains('scroll-reveal-left') &&
          !el.classList.contains('scroll-reveal-right') &&
          !el.classList.contains('scroll-reveal-scale')) {
        el.classList.add('scroll-reveal');
      }
    });

    // Gather all items that require observer hooks
    var items = document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (item) {
        item.classList.add('revealed');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.05, rootMargin: '20px 0px -40px 0px' });

    items.forEach(function (item) {
      observer.observe(item);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPolish);
  } else {
    initPolish();
  }
})();

/* Animated clickable practice-area ribbon */
(function () {
  'use strict';

  function initPracticeRibbon() {
    var section = document.querySelector('.practice-areas');
    var track = section && section.querySelector('.grid-4');
    if (!section || !track || section.classList.contains('practice-ribbon-ready')) return;

    var cards = Array.prototype.slice.call(track.querySelectorAll('a.card'));
    cards.forEach(function (card) {
      var clone = card.cloneNode(true);
      clone.classList.add('practice-ribbon-clone');
      track.appendChild(clone);
    });

    section.classList.add('practice-ribbon-ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPracticeRibbon);
  } else {
    initPracticeRibbon();
  }
})();

/* Functional premium navbar */
(function () {
  'use strict';

  function initPremiumNavbar() {
    var navbar = document.querySelector('.navbar');
    if (!navbar || navbar.classList.contains('nav-functional-ready')) return;

    var dropdowns = Array.prototype.slice.call(navbar.querySelectorAll('.nav-dropdown'));
    var search = navbar.querySelector('.nav-search');
    var dots = navbar.querySelector('.nav-dots-btn');

    navbar.classList.add('nav-functional-ready');

    dropdowns.forEach(function (dropdown) {
      var toggle = dropdown.querySelector('.nav-dropdown-toggle');
      var menu = dropdown.querySelector('.nav-dropdown-menu');
      if (!toggle || !menu) return;

      toggle.setAttribute('aria-haspopup', 'true');
      toggle.setAttribute('aria-expanded', 'false');

      toggle.addEventListener('click', function (event) {
        var isMobile = window.matchMedia('(max-width: 900px)').matches;
        var href = toggle.getAttribute('href');
        var alreadyOpen = dropdown.classList.contains('open');

        if (isMobile || href === '#') {
          event.preventDefault();
        }

        closeDropdowns(dropdown);
        dropdown.classList.toggle('open', !alreadyOpen);
        toggle.setAttribute('aria-expanded', String(!alreadyOpen));
      });

      dropdown.addEventListener('mouseenter', function () {
        if (window.matchMedia('(max-width: 900px)').matches) return;
        closeDropdowns(dropdown);
        dropdown.classList.add('open');
        toggle.setAttribute('aria-expanded', 'true');
      });

      dropdown.addEventListener('mouseleave', function () {
        if (window.matchMedia('(max-width: 900px)').matches) return;
        dropdown.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    function closeDropdowns(except) {
      dropdowns.forEach(function (dropdown) {
        if (dropdown === except) return;
        dropdown.classList.remove('open');
        var toggle = dropdown.querySelector('.nav-dropdown-toggle');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      });
    }

    if (search && !search.querySelector('input')) {
      var label = search.querySelector('em');
      var input = document.createElement('input');
      input.type = 'search';
      input.placeholder = label ? label.textContent.trim() : 'Search here...';
      input.setAttribute('aria-label', 'Search');
      search.appendChild(input);

      search.addEventListener('click', function () {
        search.classList.add('open');
        input.focus();
      });

      input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' && input.value.trim()) {
          window.location.href = 'education.html?search=' + encodeURIComponent(input.value.trim());
        }
        if (event.key === 'Escape') {
          input.value = '';
          search.classList.remove('open');
          input.blur();
        }
      });
    }

    if (dots && !navbar.querySelector('.nav-quick-menu')) {
      var quickMenu = document.createElement('div');
      quickMenu.className = 'nav-quick-menu';
      quickMenu.innerHTML = [
        '<a href="contact.html">Free Case Review</a>',
        '<a href="tel:+17062033097">Call (706) 203-3097</a>',
        '<a href="practice-areas.html">Practice Areas</a>',
        '<a href="testimonials.html">Client Reviews</a>',
        '<a href="education.html">Legal Education</a>'
      ].join('');
      navbar.appendChild(quickMenu);

      dots.setAttribute('aria-expanded', 'false');
      dots.addEventListener('click', function (event) {
        event.stopPropagation();
        var open = navbar.classList.toggle('quick-menu-open');
        dots.setAttribute('aria-expanded', String(open));
        closeDropdowns();
      });
    }

    document.addEventListener('click', function (event) {
      if (navbar.contains(event.target)) return;
      closeDropdowns();
      navbar.classList.remove('quick-menu-open');
      if (dots) dots.setAttribute('aria-expanded', 'false');
      if (search) search.classList.remove('open');
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      closeDropdowns();
      navbar.classList.remove('quick-menu-open');
      if (dots) dots.setAttribute('aria-expanded', 'false');
      if (search) search.classList.remove('open');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPremiumNavbar);
  } else {
    initPremiumNavbar();
  }
})();

// Testimonials Slider Initializer
(function initTestimonialsSlider() {
  function setupSlider() {
    const grid = document.querySelector('.testimonials-section .t-grid');
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll('.t-card'));
    const dots = Array.from(document.querySelectorAll('.testimonials-section .t-dot'));
    const prevBtn = document.getElementById('tPrevBtn');
    const nextBtn = document.getElementById('tNextBtn');
    if (cards.length === 0) return;

    let currentIndex = 0;
    
    function updateSlider() {
      const cardWidth = cards[0].getBoundingClientRect().width;
      const gap = parseInt(window.getComputedStyle(grid).gap) || 28;
      
      const translateX = -(currentIndex * (cardWidth + gap));
      grid.style.transform = `translateX(${translateX}px)`;
      
      // Update dots state
      dots.forEach((dot, idx) => {
        if (idx === currentIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
      
      // Update arrows disabled state
      if (prevBtn) {
        if (currentIndex === 0) {
          prevBtn.classList.add('disabled');
        } else {
          prevBtn.classList.remove('disabled');
        }
      }
      if (nextBtn) {
        const maxIdx = getEffectiveMaxIndex();
        if (currentIndex >= maxIdx) {
          nextBtn.classList.add('disabled');
        } else {
          nextBtn.classList.remove('disabled');
        }
      }

      // Update card opacities dynamically (active views have opacity 1)
      const visibleCount = getVisibleCount();
      cards.forEach((card, idx) => {
        if (idx >= currentIndex && idx < currentIndex + visibleCount) {
          card.style.opacity = '1';
        } else {
          card.style.opacity = '0.5';
        }
      });
    }

    function getVisibleCount() {
      const w = window.innerWidth;
      if (w >= 1024) return 2; // desktop displays 2 cards
      return 1; // tablets and mobile display 1 card
    }

    function getEffectiveMaxIndex() {
      const cardWidth = cards[0].getBoundingClientRect().width;
      const gap = parseInt(window.getComputedStyle(grid).gap) || 28;
      const containerWidth = grid.parentElement.getBoundingClientRect().width;
      
      const maxIndex = cards.length - Math.floor(containerWidth / (cardWidth + gap));
      return Math.max(0, maxIndex);
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function() {
        if (currentIndex > 0) {
          currentIndex--;
          updateSlider();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function() {
        const maxIdx = getEffectiveMaxIndex();
        if (currentIndex < maxIdx) {
          currentIndex++;
          updateSlider();
        }
      });
    }

    // Dots interaction
    dots.forEach((dot, idx) => {
      dot.addEventListener('click', function() {
        const maxIdx = getEffectiveMaxIndex();
        if (idx <= maxIdx) {
          currentIndex = idx;
        } else {
          currentIndex = maxIdx;
        }
        updateSlider();
      });
    });

    // Touch/swipe gestures for mobile swipe functionality
    let startX = 0;
    let isSwiping = false;

    grid.addEventListener('touchstart', function(e) {
      startX = e.touches[0].clientX;
      isSwiping = true;
    }, { passive: true });

    grid.addEventListener('touchmove', function(e) {
      if (!isSwiping) return;
      const diffX = startX - e.touches[0].clientX;
      if (Math.abs(diffX) > 50) {
        if (diffX > 0) {
          // Swipe left -> Next
          const maxIdx = getEffectiveMaxIndex();
          if (currentIndex < maxIdx) {
            currentIndex++;
            updateSlider();
          }
        } else {
          // Swipe right -> Prev
          if (currentIndex > 0) {
            currentIndex--;
            updateSlider();
          }
        }
        isSwiping = false;
      }
    }, { passive: true });

    grid.addEventListener('touchend', function() {
      isSwiping = false;
    });

    // Listen to resize to recalculate dimensions
    window.addEventListener('resize', updateSlider);

    // Initial run after layout stabilizes
    setTimeout(updateSlider, 150);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupSlider);
  } else {
    setupSlider();
  }
})();
