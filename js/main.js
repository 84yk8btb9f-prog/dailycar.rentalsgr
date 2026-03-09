/* ============================================================
   DAILY CAR RENTALS GR — MAIN JAVASCRIPT
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- LOADER ---- */
  const loader = document.getElementById('loader');
  if (loader) {
    setTimeout(() => loader.classList.add('gone'), 2000);
  }

  /* ---- CUSTOM CURSOR (desktop only) ---- */
  if (window.matchMedia('(pointer:fine)').matches) {
    const dot = document.createElement('div');
    dot.className = 'cursor';
    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mx = -100, my = -100, rx = -100, ry = -100;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    const animCursor = () => {
      dot.style.left = mx + 'px';
      dot.style.top  = my + 'px';
      rx += (mx - rx) * 0.14;
      ry += (my - ry) * 0.14;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      requestAnimationFrame(animCursor);
    };
    animCursor();

    document.querySelectorAll('a,button').forEach(el => {
      el.addEventListener('mouseenter', () => { dot.style.transform = 'translate(-50%,-50%) scale(2)'; ring.style.transform = 'translate(-50%,-50%) scale(1.4)'; ring.style.opacity = '.2'; });
      el.addEventListener('mouseleave', () => { dot.style.transform = 'translate(-50%,-50%) scale(1)'; ring.style.transform = 'translate(-50%,-50%) scale(1)'; ring.style.opacity = '1'; });
    });
  }

  /* ---- NAVBAR SCROLL ---- */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (nav) nav.classList.toggle('solid', window.scrollY > 30);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- ACTIVE NAV LINK ---- */
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mob-nav a').forEach(a => {
    if (a.getAttribute('href') === page) a.classList.add('on');
  });

  /* ---- HAMBURGER ---- */
  const ham = document.getElementById('ham');
  const mobNav = document.getElementById('mob-nav');
  if (ham && mobNav) {
    ham.addEventListener('click', () => {
      ham.classList.toggle('open');
      mobNav.classList.toggle('open');
    });
    mobNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      ham.classList.remove('open');
      mobNav.classList.remove('open');
    }));
  }

  /* ---- SCROLL REVEAL ---- */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); observer.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.rv').forEach(el => observer.observe(el));

  /* ---- COUNTER ANIMATION ---- */
  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.dataset.count, 10);
      const duration = 1800;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(ease * target);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target;
      };
      requestAnimationFrame(step);
      counterObs.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(el => counterObs.observe(el));

  /* ---- SMOOTH BOOK FORM SUBMIT ---- */
  const bookBtn = document.querySelector('.book-btn');
  if (bookBtn) {
    bookBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const btn = bookBtn;
      btn.innerHTML = '✓ Sending...';
      setTimeout(() => {
        btn.innerHTML = 'Search <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>';
        window.location.href = 'contact.html';
      }, 800);
    });
  }

  /* ---- CONTACT FORM ---- */
  const cForm = document.querySelector('.c-form');
  if (cForm) {
    cForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = cForm.querySelector('.c-submit');
      btn.innerHTML = '✓ Message Sent!';
      btn.style.background = '#16a34a';
      setTimeout(() => {
        btn.innerHTML = 'Send Message <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
        btn.style.background = '';
        cForm.reset();
      }, 3000);
    });
  }

  /* ---- PARALLAX HERO BG ---- */
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      heroBg.style.transform = `translateY(${y * 0.3}px)`;
    }, { passive: true });
  }

  /* ---- FLEET FILTER ---- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const carCards = document.querySelectorAll('.car-c');
  if (filterBtns.length && carCards.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.cat;
        carCards.forEach(card => {
          if (cat === 'all' || card.dataset.cat === cat) {
            card.style.opacity = '0';
            card.style.display = 'block';
            setTimeout(() => { card.style.opacity = '1'; }, 50);
          } else {
            card.style.opacity = '0';
            setTimeout(() => { card.style.display = 'none'; }, 300);
          }
        });
      });
    });
  }

});
