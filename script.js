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
let savedScrollY = 0;
let savedScrollX = 0;

if (videoModal.parentNode !== document.documentElement) {
  document.documentElement.appendChild(videoModal);
}

playBtn.addEventListener('click', () => {
  // Save current scroll position before focus shifts
  savedScrollY = window.scrollY || window.pageYOffset;
  savedScrollX = window.scrollX || window.pageXOffset;

  // Set the YouTube URL with the video ID
  youtubePlayer.src = `https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1`;
  videoModal.style.display = 'flex';
  videoModal.style.position = 'fixed';
  videoModal.style.inset = '0';
  videoModal.style.width = '100vw';
  videoModal.style.height = '100vh';
  videoModal.style.height = '100dvh';
  document.body.style.overflow = 'hidden';
});

const tedxBtns = document.querySelectorAll('.premium-video-note, .premium-mobile-video-wrap');
tedxBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    savedScrollY = window.scrollY || window.pageYOffset;
    savedScrollX = window.scrollX || window.pageXOffset;

    youtubePlayer.src = 'https://www.youtube.com/embed/JZURZPGzUvA?autoplay=1';
    videoModal.style.display = 'flex';
    videoModal.style.position = 'fixed';
    videoModal.style.inset = '0';
    videoModal.style.width = '100vw';
    videoModal.style.height = '100vh';
    videoModal.style.height = '100dvh';
    document.body.style.overflow = 'hidden';
  });
});

function closeHomeVideoModal() {
  videoModal.style.display = 'none';
  youtubePlayer.src = '';
  document.body.style.overflow = 'auto';

  // Restore scroll position to prevent browser scroll-to-top
  window.scrollTo(savedScrollX, savedScrollY);
}

closeBtn.addEventListener('click', closeHomeVideoModal);

// Close modal when clicking outside the content
videoModal.addEventListener('click', (e) => {
  if (e.target === videoModal) {
    closeHomeVideoModal();
  }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && videoModal.style.display !== 'none') {
    closeHomeVideoModal();
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

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   CASE STUDIES â€” Carousel + Scroll Animation
   Place before </body>:  <script src="case-studies.js"></script>
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

(function () {
  'use strict';

  // Send conversion activity to the GA4 property already loaded on every page.
  // Only operational metadata is included; form field values are never sent.
  window.AwadTrackConversion = function (eventName, eventParameters) {
    if (typeof window.gtag !== 'function') return;

    window.gtag('event', eventName, Object.assign({
      page_path: window.location.pathname,
      page_title: document.title,
      transport_type: 'beacon'
    }, eventParameters || {}));
  };

  window.AwadGetFormType = function (form) {
    if (form.classList.contains('premium-hero-form')) return 'Hero Consultation Form';
    if (form.classList.contains('space-y-6')) return 'Practice Area Case Form';
    if (form.classList.contains('contact-form')) return 'General Contact Form';
    if (form.classList.contains('newsletter-form')) return 'Newsletter Signup';
    return 'Website Form';
  };

  function initConversionTracking() {
    if (document.documentElement.getAttribute('data-conversion-tracking-ready') === 'true') return;
    document.documentElement.setAttribute('data-conversion-tracking-ready', 'true');

    // Delegation also captures call buttons injected later by this script.
    document.addEventListener('click', function (event) {
      if (!event.target || typeof event.target.closest !== 'function') return;
      var callLink = event.target.closest('a[href^="tel:"]');
      if (!callLink) return;

      var placement = 'phone_link';
      if (callLink.classList.contains('premium-float-call')) placement = 'floating_call_button';
      else if (callLink.classList.contains('premium-phone-btn')) placement = 'header_call_button';
      else if (callLink.classList.contains('mobile-nav-phone')) placement = 'mobile_navigation';
      else if (callLink.classList.contains('top-bar-item')) placement = 'top_bar';
      else if (callLink.closest('footer')) placement = 'footer';

      window.AwadTrackConversion('phone_call_click', {
        call_placement: placement
      });
    });
  }

  /* â”€â”€ Config â”€â”€ */
  const CARDS_PER_VIEW_DESKTOP = 3;
  const CARDS_PER_VIEW_TABLET  = 2;
  const CARDS_PER_VIEW_MOBILE  = 1;

  /* â”€â”€ Elements â”€â”€ */
  const track    = document.getElementById('csTrack');
  const prevBtn  = document.getElementById('csPrev');
  const nextBtn  = document.getElementById('csNext');
  const dotsWrap = document.getElementById('csDots');

  initConversionTracking();

  if (!track || !prevBtn || !nextBtn) return; // guard if section not on page

  const cards = Array.from(track.querySelectorAll('.cs-card'));
  const total = cards.length;

  let currentIndex = 0;

  /* â”€â”€ Responsive: how many cards visible â”€â”€ */
  function getPerView() {
    if (window.innerWidth <= 480) return CARDS_PER_VIEW_MOBILE;
    if (window.innerWidth <= 720) return CARDS_PER_VIEW_TABLET;
    return CARDS_PER_VIEW_DESKTOP;
  }

  /* â”€â”€ Total "pages" â”€â”€ */
  function maxIndex() {
    return Math.max(0, total - getPerView());
  }

  /* â”€â”€ Move track â”€â”€ */
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

  /* â”€â”€ Button states â”€â”€ */
  function updateButtons() {
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= maxIndex();
  }

  /* â”€â”€ Dots â”€â”€ */
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

  /* â”€â”€ Button listeners â”€â”€ */
  prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
  nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

  /* â”€â”€ Touch / swipe support â”€â”€ */
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

  /* â”€â”€ Keyboard nav â”€â”€ */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') goTo(currentIndex + 1);
    if (e.key === 'ArrowLeft')  goTo(currentIndex - 1);
  });

  /* â”€â”€ Rebuild on resize â”€â”€ */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      buildDots();
      goTo(Math.min(currentIndex, maxIndex()));
    }, 120);
  });

  /* â”€â”€ Scroll-in animation (IntersectionObserver) â”€â”€ */
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

  /* â”€â”€ Init â”€â”€ */
  buildDots();
  goTo(total > getPerView() ? 1 : 0);
  initScrollAnimation();
})();

/* Floating call widget viewport anchor */
(function () {
  'use strict';

  function initFloatingCallAnchor() {
    var callWidget = document.querySelector('.premium-float-call');
    if (!callWidget) return;

    if (callWidget.parentNode !== document.documentElement) {
      document.documentElement.appendChild(callWidget);
    }

    function positionWidget() {
      var isMobile = window.innerWidth <= 768;
      var margin = isMobile ? 20 : 28;

      callWidget.style.setProperty('position', 'fixed', 'important');
      callWidget.style.setProperty('top', 'auto', 'important');
      callWidget.style.setProperty('bottom', margin + 'px', 'important');
      callWidget.style.setProperty('right', margin + 'px', 'important');
    }

    positionWidget();
    window.addEventListener('resize', positionWidget);
    window.addEventListener('orientationchange', positionWidget);
    setTimeout(positionWidget, 350);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFloatingCallAnchor);
  } else {
    initFloatingCallAnchor();
  }
})();

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   FAQ Accordion
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */


/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   Team Section Carousel (After CS)
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
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

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   FAQ Accordion Script
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function initFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  console.log('FAQ Accordion: Found ' + faqItems.length + ' items');

  if (faqItems.length === 0) {
    console.warn('No FAQ items found');
    return;
  }

  faqItems.forEach((item, index) => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (!question || !answer) {
      console.warn('FAQ elements not found in item ' + index);
      return;
    }

    question.addEventListener('click', (e) => {
      console.log('FAQ item ' + index + ' clicked');
      e.stopPropagation();

      const isActive = item.classList.contains('active') || item.classList.contains('open');

      // Close all other items
      faqItems.forEach(i => {
        i.classList.remove('active', 'open');
        const btn = i.querySelector('.faq-question');
        const ans = i.querySelector('.faq-answer');
        if (btn) btn.setAttribute('aria-expanded', 'false');
        if (ans) ans.setAttribute('aria-hidden', 'true');
      });

      // Open clicked item if it wasn't active
      if (!isActive) {
        item.classList.add('active', 'open');
        question.setAttribute('aria-expanded', 'true');
        answer.setAttribute('aria-hidden', 'false');
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

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   YouTube Video Modal
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function() {
  function initYTModal() {
    var backdrop = document.getElementById('ytModalBackdrop');
    var iframe   = document.getElementById('ytModalIframe');
    var closeBtn = document.getElementById('ytModalClose');
    if (!backdrop || !iframe) return;

    var savedScrollY = 0;
    var savedScrollX = 0;

    function openModal(ytId) {
      savedScrollY = window.scrollY || window.pageYOffset;
      savedScrollX = window.scrollX || window.pageXOffset;
      window.scrollTo(0, 0);

      iframe.src = 'https://www.youtube.com/embed/' + ytId + '?autoplay=1&rel=0';
      backdrop.classList.add('active');
      backdrop.style.display = 'flex';
      backdrop.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      backdrop.classList.remove('active');
      iframe.src = '';
      backdrop.style.display = 'none';
      backdrop.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';

      // Restore scroll position to prevent browser scroll-to-top
      window.scrollTo(savedScrollX, savedScrollY);
    }

    // Expose functions globally for testimonials.html or other pages
    window.openVideoPlayer = openModal;
    window.closeVideoPlayer = closeModal;

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
      if (e.key === 'Escape') {
        if (backdrop.classList.contains('active')) {
          closeModal();
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initYTModal);
  } else {
    initYTModal();
  }
})();

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Contact Page Animations
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Hamburger / Mobile Nav
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function () {
  'use strict';

  var hamburger = document.getElementById('navHamburger');
  var navbar    = document.querySelector('.navbar');
  var nav       = navbar && navbar.querySelector('nav');
  if (!hamburger || !navbar) return;
  var lockedScrollY = 0;

  if (nav && !nav.querySelector('.mobile-nav-footer')) {
    var mobileFooter = document.createElement('div');
    mobileFooter.className = 'mobile-nav-footer';
    mobileFooter.innerHTML = [
      '<a href="tel:+17068900000" class="mobile-nav-phone" aria-label="Call The Awad Law Firm">',
      '  <span class="mobile-nav-phone-label">Call Now</span>',
      '  <strong>(706) 890-0000</strong>',
      '</a>',
      '<div class="mobile-nav-socials" aria-label="Follow The Awad Law Firm">',
      '  <a href="https://www.facebook.com/theawadlawfirm" target="_blank" rel="noopener noreferrer" aria-label="Facebook">',
      '    <svg viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>',
      '  </a>',
      '  <a href="https://www.linkedin.com/company/the-awad-law-firm/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">',
      '    <svg viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"></path><circle cx="4" cy="4" r="2"></circle></svg>',
      '  </a>',
      '  <a href="https://www.youtube.com/@TheAwadLawFirmPCAtlanta" target="_blank" rel="noopener noreferrer" aria-label="YouTube">',
      '    <svg viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29.05 29.05 0 0 0 1 12a29.05 29.05 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29.05 29.05 0 0 0 23 12a29.05 29.05 0 0 0-.46-5.58zM9.75 15.02V8.98L15 12l-5.25 3.02z"></path></svg>',
      '  </a>',
      '  <a href="https://www.instagram.com/awadlawfirm/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">',
      '    <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"></path></svg>',
      '  </a>',
      '</div>'
    ].join('');
    nav.appendChild(mobileFooter);
  }

  function lockPageScroll() {
    lockedScrollY = window.scrollY || document.documentElement.scrollTop || 0;
    document.documentElement.classList.add('menu-open');
    document.body.classList.add('menu-open');
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + lockedScrollY + 'px';
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
  }

  function unlockPageScroll() {
    document.documentElement.classList.remove('menu-open');
    document.body.classList.remove('menu-open');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    window.scrollTo(0, lockedScrollY);
  }

  function closeMenu() {
    navbar.classList.remove('nav-open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    unlockPageScroll();
  }

  // Toggle menu
  hamburger.addEventListener('click', function () {
    var isOpen = navbar.classList.toggle('nav-open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) {
      lockPageScroll();
    } else {
      unlockPageScroll();
    }
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
      if (navbar.classList.contains('nav-functional-ready')) return;
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

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   GLOBAL PREMIUM FORM SUBMISSIONS & TOASTS
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

    var iconHTML = 'âœ“';
    if (type === 'error' || type === 'warning') {
      iconHTML = 'âœ¦';
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

    // Create the hidden iframe if any case form exists on the page
    var isAnyCaseForm = false;
    forms.forEach(function (form) {
      if (
        form.classList.contains('premium-hero-form') ||
        form.classList.contains('space-y-6') ||
        form.classList.contains('contact-form')
      ) {
        isAnyCaseForm = true;
      }
    });

    if (isAnyCaseForm && !document.getElementById('salesforce_submissions')) {
      var iframe = document.createElement('iframe');
      iframe.name = 'salesforce_submissions';
      iframe.id = 'salesforce_submissions';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
    }

    if (isAnyCaseForm) {
      // Define Callback for hCaptcha explicit rendering
      window.onloadHCaptchaCallback = function () {
        var captchaElements = document.querySelectorAll('.h-captcha');
        captchaElements.forEach(function (el) {
          if (!el.getAttribute('data-hcaptcha-id')) {
            var widgetId = hcaptcha.render(el, {
              sitekey: el.getAttribute('data-sitekey') || 'bbaee838-b0ee-4376-bf5c-206ed8ae50fa'
            });
            el.setAttribute('data-hcaptcha-id', widgetId);
          }
        });
      };

      // Load hCaptcha script dynamically
      if (!document.querySelector('script[src*="hcaptcha.com"]')) {
        var hcaptchaScript = document.createElement('script');
        hcaptchaScript.src = 'https://js.hcaptcha.com/1/api.js?onload=onloadHCaptchaCallback&render=explicit';
        hcaptchaScript.async = true;
        hcaptchaScript.defer = true;
        document.head.appendChild(hcaptchaScript);
      }
    }

    forms.forEach(function (form) {
      if (form.classList.contains('nav-search') || form.closest('.nav-search')) {
        return;
      }

      // Check if this is a case evaluation form
      var isCaseForm =
        form.classList.contains('premium-hero-form') ||
        form.classList.contains('space-y-6') ||
        form.classList.contains('contact-form');

      if (isCaseForm) {
        // Upgrade properties dynamically to submit to Salesforce Web-to-Lead
        form.action = 'https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8&orgId=00DF00000008J4B';
        form.method = 'POST';
        form.target = 'salesforce_submissions';

        // Add standard Web-to-Lead hidden fields dynamically if not present
        if (!form.querySelector('[name="oid"]')) {
          var oidInput = document.createElement('input');
          oidInput.type = 'hidden';
          oidInput.name = 'oid';
          oidInput.value = '00DF00000008J4B';
          form.appendChild(oidInput);
        } else {
          form.querySelector('[name="oid"]').value = '00DF00000008J4B';
        }
        if (!form.querySelector('[name="retURL"]')) {
          var retURLInput = document.createElement('input');
          retURLInput.type = 'hidden';
          retURLInput.name = 'retURL';
          retURLInput.value = 'https://theawadlawfirm.com/';
          form.appendChild(retURLInput);
        }
        if (!form.querySelector('[name="description"]')) {
          var descInput = document.createElement('input');
          descInput.type = 'hidden';
          descInput.name = 'description';
          form.appendChild(descInput);
        }

        // Add dynamic honeypot field to block automated spam bots
        if (!form.querySelector('[name="website_url_hp"]')) {
          var hpContainer = document.createElement('div');
          hpContainer.style.display = 'none';
          hpContainer.style.visibility = 'hidden';
          var hpInput = document.createElement('input');
          hpInput.type = 'text';
          hpInput.name = 'website_url_hp';
          hpInput.tabIndex = -1;
          hpInput.autocomplete = 'off';
          hpContainer.appendChild(hpInput);
          form.appendChild(hpContainer);
        }

        // Dynamically inject hCaptcha container
        var submitBtn = form.querySelector('button[type="submit"]') || form.querySelector('button');
        if (submitBtn && !form.querySelector('.h-captcha')) {
          var captchaDiv = document.createElement('div');
          captchaDiv.className = 'h-captcha';
          captchaDiv.setAttribute('data-sitekey', 'bbaee838-b0ee-4376-bf5c-206ed8ae50fa');
          captchaDiv.style.display = 'flex';
          captchaDiv.style.justifyContent = 'center';
          captchaDiv.style.marginBottom = '20px';

          var insertTarget = submitBtn.parentElement && submitBtn.parentElement !== form ? submitBtn.parentElement : submitBtn;
          insertTarget.parentNode.insertBefore(captchaDiv, insertTarget);

          // If hCaptcha library is already loaded, render it immediately
          if (typeof hcaptcha !== 'undefined') {
            var widgetId = hcaptcha.render(captchaDiv, {
              sitekey: 'bbaee838-b0ee-4376-bf5c-206ed8ae50fa'
            });
            captchaDiv.setAttribute('data-hcaptcha-id', widgetId);
          }
        }
      }

      if (form.getAttribute('onsubmit')) {
        form.removeAttribute('onsubmit');
        form.onsubmit = null;
      }

      form.addEventListener('submit', async function (event) {
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

        // hCaptcha client-side validation check
        if (isCaseForm && typeof hcaptcha !== 'undefined') {
          var captchaContainer = form.querySelector('.h-captcha');
          var widgetId = captchaContainer ? captchaContainer.getAttribute('data-hcaptcha-id') : null;
          var response = widgetId ? hcaptcha.getResponse(widgetId) : hcaptcha.getResponse();

          if (!response) {
            showToast('Security Verification Required', 'Please complete the hCaptcha check first.', 'warning');
            return;
          }
        }

        submitBtn.classList.add('submitting-state');

        // Bot honeypot check
        var hpInput = form.querySelector('[name="website_url_hp"]');
        if (hpInput && hpInput.value.trim() !== '') {
          console.warn('Spam submission blocked by honeypot.');
          setTimeout(function () {
            submitBtn.classList.remove('submitting-state');
            form.reset();
            if (typeof hcaptcha !== 'undefined') {
              var captchaContainer = form.querySelector('.h-captcha');
              var widgetId = captchaContainer ? captchaContainer.getAttribute('data-hcaptcha-id') : null;
              if (widgetId) hcaptcha.reset(widgetId);
            }
            showToast(
              'EVALUATION SUBMITTED SECURELY',
              'Thank you. An expert attorney will contact you within 15 minutes.',
              'success'
            );
          }, 1500);
          return;
        }

        // Keyword solicitation screen
        var msgText = form.querySelector('[name="message"]');
        if (msgText && msgText.value) {
          var spamKeywords = [
            ' seo ', 'guest post', 'guest-post', 'link building', 'ranking on google',
            'business growth', 'increase traffic', 'digital marketing', 'lead generation service',
            'cryptocurrency', 'forex trading', 'wealth creation', 'click here'
          ];
          var msgLower = msgText.value.toLowerCase();
          var isSpam = spamKeywords.some(function (keyword) {
            return msgLower.indexOf(keyword) !== -1;
          });
          if (isSpam) {
            console.warn('Spam solicitation blocked by keyword filter.');
            setTimeout(function () {
              submitBtn.classList.remove('submitting-state');
              form.reset();
              if (typeof hcaptcha !== 'undefined') {
                var captchaContainer = form.querySelector('.h-captcha');
                var widgetId = captchaContainer ? captchaContainer.getAttribute('data-hcaptcha-id') : null;
                if (widgetId) hcaptcha.reset(widgetId);
              }
              showToast(
                'EVALUATION SUBMITTED SECURELY',
                'Thank you. An expert attorney will contact you within 15 minutes.',
                'success'
              );
            }, 1500);
            return;
          }
        }

        // Count every accepted form submission, while keeping qualified case
        // leads available as a separate conversion event. No field values are shared.
        window.AwadTrackConversion('form_submission', {
          form_name: window.AwadGetFormType(form),
          form_category: isCaseForm ? 'case_lead' : 'general'
        });

        // Count a lead only after required fields, hCaptcha, honeypot, and
        // solicitation checks have all passed.
        if (isCaseForm) {
          window.AwadTrackConversion('generate_lead', {
            form_name: window.AwadGetFormType(form),
            lead_source: 'website_form'
          });
        }

        // Send the email independently from Salesforce, but wait for FormSubmit's
        // response so the visitor is never shown a false delivery confirmation.
        var emailPromise = (async function () {
          try {
          var emailData = {};
          var formData = new FormData(form);
          formData.forEach(function (value, key) {
            if (
              key === 'oid' ||
              key === 'retURL' ||
              key === 'website_url_hp' ||
              key === 'description' ||
              key === 'g-recaptcha-response' ||
              key === 'h-captcha-response'
            ) return;
            emailData[key] = value;
          });

          var formType = window.AwadGetFormType(form);

          var clientName = emailData['firstName'] || emailData['first_name'] || '';
          var clientLastName = emailData['lastName'] || emailData['last_name'] || '';
          var fullName = (clientName + ' ' + clientLastName).trim();
          emailData['_subject'] = 'New Website Lead: [' + formType + ']' + (fullName ? ' - ' + fullName : '');
          emailData['_cc'] = 'mehar@theawadlawfirm.com,leland@theawadlawfirm.com,selvin@theawadlawfirm.com';
          emailData['Submitted From Page'] = window.location.href;

          var emailResponse = await fetch('https://formsubmit.co/ajax/team@theawadlawfirm.com', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(emailData)
          });

          var emailResult = null;
          try {
            emailResult = await emailResponse.json();
          } catch (parseError) {
            console.warn('FormSubmit returned a non-JSON response.', parseError);
          }

          var emailDelivered = emailResponse.ok && (!emailResult || emailResult.success !== false);
          if (!emailDelivered) {
            console.error('FormSubmit rejected the email notification:', emailResponse.status, emailResult);
          }
          return emailDelivered;
        } catch (e) {
          console.error('Email notification dispatch failed:', e);
          return false;
        }
        })();

        // Web-to-Lead: Map variables and submit natively to the background iframe
        if (form.getAttribute('target') === 'salesforce_submissions') {
          // Temporarily rename fields to standard Web-to-Lead API field names
          var fNameInput = form.querySelector('[name="firstName"]');
          if (fNameInput) fNameInput.name = 'first_name';

          var lNameInput = form.querySelector('[name="lastName"]');
          if (lNameInput) lNameInput.name = 'last_name';

          var descVal = '';
          var caseSelect = form.querySelector('[name="case_type"]') || form.querySelector('[name="practiceArea"]');
          if (caseSelect && caseSelect.value) {
            descVal += 'Practice/Case Area: ' + caseSelect.value + '\n';
          }
          var msgTextObj = form.querySelector('[name="message"]');
          if (msgTextObj && msgTextObj.value) {
            descVal += 'Message: ' + msgTextObj.value;
          }
          var descInput = form.querySelector('[name="description"]');
          if (descInput) {
            descInput.value = descVal;
          }

          form.submit();

          // Restore native field names to keep the DOM state clean for future submissions
          if (fNameInput) fNameInput.name = 'firstName';
          if (lNameInput) lNameInput.name = 'lastName';
        }

        // Salesforce is already submitted at this point; only the visitor-facing
        // result waits for the separate email notification response.
        var emailDelivered = await Promise.race([
          emailPromise,
          new Promise(function (resolve) {
            setTimeout(function () {
              console.warn('FormSubmit response timed out; Salesforce submission already completed.');
              resolve(false);
            }, 8000);
          })
        ]);

        setTimeout(function () {
          submitBtn.classList.remove('submitting-state');
          form.reset();

          // Reset hCaptcha if present
          if (typeof hcaptcha !== 'undefined') {
            var captchaContainer = form.querySelector('.h-captcha');
            var widgetId = captchaContainer ? captchaContainer.getAttribute('data-hcaptcha-id') : null;
            if (widgetId) hcaptcha.reset(widgetId);
          }

          if (form.classList.contains('newsletter-form')) {
            showToast(
              'INSIGHTS SUBSCRIBED',
              'Welcome! You are now subscribed to our premium legal publication.',
              'success'
            );
          } else if (!emailDelivered) {
            showToast(
              'SUBMISSION RECEIVED',
              'Your request was sent to our intake system, but the email notification could not be confirmed.',
              'warning'
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

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Client Promise Button Navigation
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function() {
  const clientPromiseButtons = document.querySelectorAll('.client-promise-btn');
  clientPromiseButtons.forEach(button => {
    button.addEventListener('click', function() {
      window.location.href = '/contact/';
    });
  });

  // Also handle the CTA button on index page
  const ctaButton = document.querySelector('.cta');
  if (ctaButton) {
    ctaButton.addEventListener('click', function() {
      window.location.href = '/contact/';
    });
  }

  // Learn More on Firm History page -> Ibrahim Awad; homepage uses <a href="about.html">.
  const path = window.location.pathname.replace(/\\/g, '/');
  const isAboutPage = /(^|\/)about\.html$/i.test(path) || /(^|\/)about-the-awad-law-firm-history/i.test(path);
  const learnMoreBtn = document.querySelector('.origin-story .learn-more-btn');
  if (learnMoreBtn && isAboutPage) {
    learnMoreBtn.addEventListener('click', function() {
      window.location.href = '/team-members/ibrahim-awad/';
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
    var path = window.location.pathname;
    document.querySelectorAll('.navbar nav a[href]').forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href || href.indexOf('http') === 0 || href === '#') return;
      var cleanHref = href.replace(/^\/?/, '/').replace(/\/?$/, '/');
      var cleanPath = path.replace(/^\/?/, '/').replace(/\/?$/, '/');
      if (cleanHref === cleanPath) link.classList.add('active');
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
      // Avoid footer, navbar or team page sections from being animated as blocks
      if (container.closest('.navbar') || container.closest('.site-footer') || container.closest('.team-page')) return;

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
      if (header.closest('.navbar') || header.closest('.site-footer') || header.closest('.team-page')) return;
      if (!header.classList.contains('scroll-reveal') &&
          !header.classList.contains('scroll-reveal-left') &&
          !header.classList.contains('scroll-reveal-right')) {
        header.classList.add('scroll-reveal');
      }
    });

    // Retrofit legacy selectors with standard scroll-reveal classes
    var legacyElements = document.querySelectorAll(revealSelectors.join(','));
    legacyElements.forEach(function (el) {
      if (el.closest('.navbar') || el.closest('.site-footer') || el.closest('.team-page')) return;
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
      search.setAttribute('role', 'search');
      search.setAttribute('tabindex', '0');
      search.appendChild(input);

      function openSearch() {
        search.classList.add('open');
        input.focus();
      }

      function submitSearch() {
        var query = input.value.trim();
        if (!query) return;
        window.location.href = '/search/?q=' + encodeURIComponent(query);
      }

      search.addEventListener('click', function () {
        openSearch();
      });

      search.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' && document.activeElement !== input) {
          event.preventDefault();
          openSearch();
        }
      });

      input.addEventListener('focus', openSearch);

      input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' && input.value.trim()) {
          event.preventDefault();
          submitSearch();
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
        '<a href="/contact/">Free Case Review</a>',
        '<a href="tel:+17068900000">Call (706) 890-0000</a>',
        '<a href="/practice-areas/">Practice Areas</a>',
        '<a href="/testimonials/">Video Testimonials</a>',
        '<a href="/resources/">Legal Education</a>'
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

/* Team member deep links for site search results */
(function () {
  'use strict';

  function slugify(text) {
    return String(text || '')
      .toLowerCase()
      .replace(/,\s*esq\.?/g, '')
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function initTeamAnchors() {
    var cards = document.querySelectorAll('h3.font-heading');
    if (!cards.length) return;

    cards.forEach(function (heading) {
      var card = heading.closest('.group.bg-white');
      if (!card || card.id) return;
      var slug = slugify(heading.textContent);
      if (slug) card.id = slug;
    });

    if (window.location.hash) {
      var target = document.getElementById(window.location.hash.slice(1));
      if (target) {
        setTimeout(function () {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 80);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTeamAnchors);
  } else {
    initTeamAnchors();
  }
})();

// Testimonials Slider Initializer
(function initTestimonialsSlider() {
  function setupSlider() {
    const grid = document.querySelector('.testimonials-section .t-grid');
    if (!grid) return;

    const originalCards = Array.from(grid.querySelectorAll('.t-card'));
    const dotsWrap = document.querySelector('.testimonials-section .t-dots');
    const prevBtn = document.getElementById('tPrevBtn');
    const nextBtn = document.getElementById('tNextBtn');
    if (originalCards.length === 0) return;

    const slideCount = originalCards.length;

    if (dotsWrap) {
      dotsWrap.innerHTML = '';
      originalCards.forEach((_, idx) => {
        const dot = document.createElement('span');
        dot.className = idx === 0 ? 't-dot active' : 't-dot';
        dotsWrap.appendChild(dot);
      });
    }

    const dots = Array.from(document.querySelectorAll('.testimonials-section .t-dot'));

    originalCards.forEach((card) => {
      const clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      grid.appendChild(clone);
    });

    const cards = Array.from(grid.querySelectorAll('.t-card'));

    let currentIndex = 0;
    let autoplayTimer = null;
    let loopResetTimer = null;

    function getSlideStep() {
      const cardWidth = cards[0].getBoundingClientRect().width;
      const gap = parseInt(window.getComputedStyle(grid).gap) || 28;
      return cardWidth + gap;
    }

    function updateSlider(animate = true) {
      const translateX = -(currentIndex * getSlideStep());
      if (animate) {
        grid.style.removeProperty('transition');
      } else {
        grid.style.setProperty('transition', 'none', 'important');
      }
      grid.style.transform = `translateX(${translateX}px)`;

      // Update dots state
      dots.forEach((dot, idx) => {
        dot.style.display = idx < slideCount ? '' : 'none';
        if (idx === currentIndex % slideCount) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });

      if (prevBtn) prevBtn.classList.remove('disabled');
      if (nextBtn) nextBtn.classList.remove('disabled');

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

    function snapIfNeeded() {
      if (currentIndex >= slideCount) {
        currentIndex = 0;
        updateSlider(false);
        requestAnimationFrame(() => {
          grid.style.removeProperty('transition');
        });
      }
    }

    function scheduleLoopReset() {
      if (loopResetTimer) window.clearTimeout(loopResetTimer);
      loopResetTimer = window.setTimeout(snapIfNeeded, 680);
    }

    function goNext() {
      currentIndex++;
      updateSlider();
      if (currentIndex >= slideCount) scheduleLoopReset();
    }

    function goPrev() {
      if (currentIndex === 0) {
        currentIndex = slideCount;
        updateSlider(false);
        requestAnimationFrame(() => {
          currentIndex--;
          updateSlider();
        });
        return;
      }

      currentIndex--;
      updateSlider();
    }

    function restartAutoplay() {
      if (autoplayTimer) window.clearInterval(autoplayTimer);
      autoplayTimer = window.setInterval(goNext, 3600);
    }

    function getVisibleCount() {
      const w = window.innerWidth;
      if (w >= 1024) return 2; // desktop displays 2 cards
      return 1; // tablets and mobile display 1 card
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function() {
        goPrev();
        restartAutoplay();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function() {
        goNext();
        restartAutoplay();
      });
    }

    // Dots interaction
    dots.forEach((dot, idx) => {
      dot.addEventListener('click', function() {
        currentIndex = idx % slideCount;
        updateSlider();
        restartAutoplay();
      });
    });

    grid.addEventListener('transitionend', snapIfNeeded);

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
          goNext();
        } else {
          // Swipe right -> Prev
          goPrev();
        }
        restartAutoplay();
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
    restartAutoplay();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupSlider);
  } else {
    setupSlider();
  }
})();

/* Impressive premium dynamic top bar above navbar */
(function () {
  'use strict';

  function initPremiumTopBar() {
    var navbar = document.querySelector('.navbar');
    if (!navbar || document.querySelector('.premium-top-bar')) return;

    var topBar = document.createElement('div');
    topBar.className = 'premium-top-bar';
    topBar.innerHTML = [
      '<div class="premium-top-bar-inner">',
      '  <div class="premium-top-bar-left">',
      '    <span class="top-bar-badge">24/7 Free Consultation</span>',
      '    <a href="tel:+17068900000" class="top-bar-item">',
      '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="top-bar-icon"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>',
      '      <span>Call (706) 890-0000</span>',
      '    </a>',
      '    <a href="sms:+13106930720?&body=Hello%20Awad%20Law%20Firm%2C%20I%20need%20help%20with%20a%20case." class="top-bar-item js-text-message-link" aria-label="Text The Awad Law Firm at (310) 693-0720">',
      '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="top-bar-icon"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
      '      <span>Text (310) 693-0720</span>',
      '    </a>',
      '  </div>',
      '  <div class="premium-top-bar-right">',
      '    <span class="social-label">Follow Us:</span>',
      '    <div class="social-icons">',
      '      <a href="https://www.facebook.com/theawadlawfirm" target="_blank" aria-label="Facebook" class="social-icon-link">',
      '        <svg viewBox="0 0 24 24" class="social-svg"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>',
      '      </a>',
      '      <a href="https://www.linkedin.com/company/theawadlawfirmpc" target="_blank" aria-label="LinkedIn" class="social-icon-link">',
      '        <svg viewBox="0 0 24 24" class="social-svg"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"></path><circle cx="4" cy="4" r="2"></circle></svg>',
      '      </a>',
      '      <a href="https://www.youtube.com/@TheAwadLawFirmPCAtlanta" target="_blank" aria-label="YouTube" class="social-icon-link">',
      '        <svg viewBox="0 0 24 24" class="social-svg"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29.05 29.05 0 0 0 1 12a29.05 29.05 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29.05 29.05 0 0 0 23 12a29.05 29.05 0 0 0-.46-5.58zM9.75 15.02V8.98L15 12l-5.25 3.02z"></path></svg>',
      '      </a>',
      '      <a href="https://www.instagram.com/awadlawfirm/" target="_blank" aria-label="Instagram" class="social-icon-link">',
      '        <svg viewBox="0 0 24 24" class="social-svg-stroke"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>',
      '      </a>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('\n');

    navbar.parentNode.insertBefore(topBar, navbar);

    var textLink = topBar.querySelector('.js-text-message-link');
    if (textLink) {
      textLink.addEventListener('click', function () {
        window.location.href = textLink.href;
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPremiumTopBar);
  } else {
    initPremiumTopBar();
  }
})();

/* Impressive premium dynamic floating click-to-call widget */
(function () {
  'use strict';

  function initFloatingCallWidget() {
    if (document.querySelector('.premium-float-call')) return;

    var floatCall = document.createElement('a');
    floatCall.className = 'premium-float-call';
    floatCall.href = 'tel:+17068900000';
    floatCall.setAttribute('aria-label', 'Call The Awad Law Firm');
    floatCall.innerHTML = [
      '<div class="float-call-pulse"></div>',
      '<div class="float-call-pulse-2"></div>',
      '<div class="float-call-content">',
      '  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="float-call-icon"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>',
            '  <span class="float-call-text">',
      '    <span class="float-call-prefix">706-</span><span class="float-call-primary">890-0000</span>',
      '',
      '  </span>',
      '</div>'
    ].join('\n');

    document.body.appendChild(floatCall);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFloatingCallWidget);
  } else {
    initFloatingCallWidget();
  }
})();

/* Dynamically load the AI Chatbot Agent on all pages */
(function() {
  const script = document.createElement('script');
  script.src = "/ai-agent.js?v=5";
  script.defer = true;
  document.body.appendChild(script);
})();

/* Dynamically inject the language toggle (EN | ES) in the navbar */
(function() {
  'use strict';
  
  function initLanguageToggle() {
    const navIcons = document.querySelector('.nav-icons');
    if (!navIcons) return;

    // Avoid duplicate injection
    if (document.querySelector('.nav-lang-toggle')) return;

    // Define language mapping
const langMap = {
      '/': '/es/',
      '/about-the-awad-law-firm-history/': '/es/sobre-nosotros/',
      '/practice-areas/': '/es/areas-de-practica/',
      '/results/': '/es/resultados/',
      '/contact/': '/es/contacto/',
      '/car-accident/': '/es/accidente-de-auto/',
      '/truck-accident/': '/es/accidente-de-camion/',
      '/slip-and-fall/': '/es/resbalon-y-caida/',
      '/wrongful-death/': '/es/muerte-injusta/',
      '/medical-malpractice/': '/es/negligencia-medica/',
      '/personal-injury/': '/es/lesiones-personales/',
      '/motorcycle-accident/': '/es/accidente-de-motocicleta/',
      '/bicycle-accident/': '/es/accidente-de-bicicleta/',
      '/uber-accident/': '/es/accidente-de-uber/',
      '/lyft-accident/': '/es/accidente-de-lyft/',
      '/awad-law-firm-4/': '/es/mision-y-vision/',
      '/testimonials/': '/es/testimonios/',
      '/reviews/': '/es/resenas/',
      '/resources/': '/es/recursos/',
      '/newsletter/': '/es/boletin/',
      '/team-members/': '/es/nuestro-equipo/',
      '/why-choose-us/': '/es/por-que-elegirnos/',
      '/core-values/': '/es/valores-fundamentales/',
      '/community/': '/es/comunidad/',
      '/video-library/': '/es/biblioteca-de-videos/',
      '/privacy-policy/': '/es/politica-de-privacidad/',
      '/terms-of-service/': '/es/terminos-de-servicio/',
      '/team-members/ibrahim-awad/': '/es/team-members/ibrahim-awad/',
      '/team-members/basher-hassan/': '/es/team-members/basher-hassan/',
      '/team-members/david-price/': '/es/team-members/david-price/',
      '/team-members/azima-mohamed/': '/es/team-members/azima-mohamed/',
      '/team-members/ahmad-choudhary/': '/es/team-members/ahmad-choudhary/',
      '/team-members/gay-hartley/': '/es/team-members/gay-hartley/',
      '/team-members/marion-day/': '/es/team-members/marion-day/',
      '/team-members/shantrell-ball/': '/es/team-members/shantrell-ball/',
      '/team-members/leland-bridges/': '/es/team-members/leland-bridges/',
      '/team-members/sandra-guzman/': '/es/team-members/sandra-guzman/',
      '/team-members/devin-spiegelhalter/': '/es/team-members/devin-spiegelhalter/',
      '/team-members/sabrina-portuondo/': '/es/team-members/sabrina-portuondo/',
      '/team-members/jocelyn-suarez/': '/es/team-members/jocelyn-suarez/',
      '/team-members/deanna-marquez/': '/es/team-members/deanna-marquez/',
      '/team-members/timothy-melson/': '/es/team-members/timothy-melson/',
      '/team-members/adriana-melgarejo/': '/es/team-members/adriana-melgarejo/',
      '/team-members/christina-dixon/': '/es/team-members/christina-dixon/',
      '/team-members/carley-richards/': '/es/team-members/carley-richards/',
      '/team-members/genesis-resendiz/': '/es/team-members/genesis-resendiz/',
      '/team-members/isabel-welch/': '/es/team-members/isabel-welch/',
      '/team-members/betty-mendez/': '/es/team-members/betty-mendez/',
      '/team-members/sierra-jones/': '/es/team-members/sierra-jones/',
      '/team-members/elizabeth-chavarria/': '/es/team-members/elizabeth-chavarria/',
      '/team-members/stephanie-rivera/': '/es/team-members/stephanie-rivera/',
      '/team-members/mohamed/': '/es/team-members/mohamed/',
      '/team-members/selvin-navarro/': '/es/team-members/selvin-navarro/',
      '/team-members/mehar-hassan/': '/es/team-members/mehar-hassan/',
      '/team-members/john-jabes-salva/': '/es/team-members/john-jabes-salva/',
      '/team-members/tasha-hijara/': '/es/team-members/tasha-hijara/',
      '/team-members/ella-batilona/': '/es/team-members/ella-batilona/',
      '/team-members/edgard-manzanares/': '/es/team-members/edgard-manzanares/',
      '/team-members/alvaro-vanegas/': '/es/team-members/alvaro-vanegas/'
    };

    const currentPath = window.location.pathname;
    const isSpanish = currentPath.startsWith('/es/');
    
    let englishUrl = '/';
    let spanishUrl = '/es/';

    if (isSpanish) {
      // Find the English key that maps to this Spanish path
      let foundKey = null;
      for (const [enKey, esVal] of Object.entries(langMap)) {
        if (currentPath === esVal) {
          foundKey = enKey;
          break;
        }
      }
      englishUrl = foundKey || '/';
      spanishUrl = currentPath;
    } else {
      // Find the Spanish path mapped to this English path
      const mappedEs = langMap[currentPath];
      spanishUrl = mappedEs || '/es/';
      englishUrl = currentPath;
    }

    // Inject styles dynamically if not already added
    if (!document.getElementById('nav-lang-styles')) {
      const style = document.createElement('style');
      style.id = 'nav-lang-styles';
      style.textContent = `
        .nav-lang-toggle {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: 'Outfit', sans-serif;
          font-size: 14.5px;
          font-weight: 700;
          margin-right: 14px;
          color: inherit;
        }
        .nav-lang-toggle .lang-link {
          color: currentColor;
          text-decoration: none !important;
          opacity: 0.55;
          transition: opacity 0.3s ease;
        }
        .nav-lang-toggle .lang-link.active {
          opacity: 1;
          pointer-events: none;
        }
        .nav-lang-toggle .lang-link:hover {
          opacity: 1;
        }
        .nav-lang-toggle .lang-separator {
          opacity: 0.3;
        }
        /* Mobile and Desktop visibility */
        @media (min-width: 901px) {
          .nav-lang-toggle.mobile-only {
            display: none !important;
          }
        }
        @media (max-width: 900px) {
          .nav-lang-toggle.desktop-only {
            display: none !important;
          }
          .navbar .nav-lang-toggle.mobile-only {
            display: flex !important;
            margin-left: auto;
            margin-right: 15px;
            font-size: 13.5px;
            align-self: center;
            color: #1b1f24;
            z-index: 1001;
            flex-shrink: 0;
          }
          @media (max-width: 560px) {
            .navbar .nav-lang-toggle.mobile-only {
              margin-right: 52px;
            }
          }
          body.home-page .navbar .nav-lang-toggle.mobile-only {
            color: #ffffff;
          }
          .navbar.scrolled .nav-lang-toggle.mobile-only {
            color: #ffffff !important;
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Create the toggle container (desktop version)
    const toggle = document.createElement('div');
    toggle.className = 'nav-lang-toggle desktop-only';
    toggle.innerHTML = `
      <a href="${englishUrl}" class="lang-link ${!isSpanish ? 'active' : ''}">EN</a>
      <span class="lang-separator">|</span>
      <a href="${spanishUrl}" class="lang-link ${isSpanish ? 'active' : ''}">ES</a>
    `;

    // Inject before the "Free Consultation" button or at the beginning of nav-icons
    const quoteBtn = navIcons.querySelector('.nav-quote-btn');
    if (quoteBtn) {
      navIcons.insertBefore(toggle, quoteBtn);
    } else {
      navIcons.appendChild(toggle);
    }

    // Create the mobile version next to hamburger
    const navHamburger = document.getElementById('navHamburger');
    if (navHamburger && !document.querySelector('.nav-lang-toggle.mobile-only')) {
      const mobileToggle = document.createElement('div');
      mobileToggle.className = 'nav-lang-toggle mobile-only';
      mobileToggle.innerHTML = `
        <a href="${englishUrl}" class="lang-link ${!isSpanish ? 'active' : ''}">EN</a>
        <span class="lang-separator">|</span>
        <a href="${spanishUrl}" class="lang-link ${isSpanish ? 'active' : ''}">ES</a>
      `;
      navHamburger.parentNode.insertBefore(mobileToggle, navHamburger);
    }

    // Inject into footer copyright links dynamically
    const footerLinks = document.querySelector('.footer-bottom-links');
    if (footerLinks && !footerLinks.querySelector('.footer-lang-link')) {
      const sep = document.createElement('span');
      sep.textContent = '|';
      const langLink = document.createElement('a');
      langLink.href = isSpanish ? englishUrl : spanishUrl;
      langLink.className = 'footer-lang-link';
      langLink.textContent = isSpanish ? 'English' : 'Español';
      footerLinks.appendChild(sep);
      footerLinks.appendChild(langLink);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanguageToggle);
  } else {
    initLanguageToggle();
  }
})();


