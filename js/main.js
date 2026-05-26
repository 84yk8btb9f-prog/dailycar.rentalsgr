/* ============================================================
   DAILY CAR RENTALS GR — MAIN JAVASCRIPT
   Email delivery via Resend API (/api/send-booking)
   Set RESEND_API_KEY in Vercel environment variables.
   ============================================================ */

/* ============================================================
   FLEET PRICING DATA
   rates[] = [1-2d, 3-6d, 7-13d, 14-29d, 30+d] in euros/day
   ============================================================ */
const FLEET_DATA = {
  A:  { label:'A - Toyota Aygo h paro-moio',             catKey:'mini',     catLabel:'Mini',           trans:'Xeirokinhto', fuel:'Venzini', doors:3, seats:4, deposit:500,  rates:[28,25,22,20,17] },
  B:  { label:'B - Fiat Panda h paro-moio',              catKey:'economy',  catLabel:'Economy',        trans:'Xeirokinhto', fuel:'Venzini', doors:5, seats:5, deposit:500,  rates:[28,25,22,20,17] },
  BD: { label:'BD - Fiat Panda Diesel h paro-moio',      catKey:'economy',  catLabel:'Economy Diesel', trans:'Xeirokinhto', fuel:'Diesel',  doors:5, seats:5, deposit:500,  rates:[31,28,25,22,19] },
  C1: { label:'C1 - Peugeot 208 h paro-moio',            catKey:'compact',  catLabel:'Compact',        trans:'Xeirokinhto', fuel:'Venzini', doors:5, seats:5, deposit:500,  rates:[28,25,22,20,17] },
  CD: { label:'CD - Peugeot 208 Diesel h paro-moio',     catKey:'compact',  catLabel:'Compact Diesel', trans:'Xeirokinhto', fuel:'Diesel',  doors:5, seats:5, deposit:500,  rates:[31,28,25,22,19] },
  GA: { label:'GA - Hyundai i10 Auto h paro-moio',       catKey:'mini',     catLabel:'Mini Auto',      trans:'Aftomato',    fuel:'Venzini', doors:5, seats:4, deposit:500,  rates:[35,32,28,24,21] },
  D:  { label:'D - Seat Ibiza h paro-moio',              catKey:'economy',  catLabel:'Economy+',       trans:'Xeirokinhto', fuel:'Venzini', doors:5, seats:5, deposit:500,  rates:[28,25,22,20,17] },
  DD: { label:'DD - Seat Ibiza Diesel h paro-moio',      catKey:'economy',  catLabel:'Economy+ Diesel',trans:'Xeirokinhto', fuel:'Diesel',  doors:5, seats:5, deposit:500,  rates:[31,28,25,22,19] },
  G:  { label:'G - Seat Ibiza Auto h paro-moio',         catKey:'economy',  catLabel:'Economy+ Auto',  trans:'Aftomato',    fuel:'Venzini', doors:5, seats:5, deposit:500,  rates:[35,32,28,24,21] },
  E:  { label:'E - Hyundai i30 h paro-moio',             catKey:'compact',  catLabel:'Compact+',       trans:'Xeirokinhto', fuel:'Venzini', doors:5, seats:5, deposit:700,  rates:[42,38,34,29,25] },
  ED: { label:'ED - Hyundai i30 Diesel h paro-moio',     catKey:'compact',  catLabel:'Compact+ Diesel',trans:'Xeirokinhto', fuel:'Diesel',  doors:5, seats:5, deposit:700,  rates:[45,40,36,31,27] },
  E1: { label:'E1 - Fiat Tipo Sedan h paro-moio',        catKey:'sedan',    catLabel:'Sedan',          trans:'Xeirokinhto', fuel:'Venzini', doors:5, seats:5, deposit:700,  rates:[42,38,34,29,25] },
  G1: { label:'G1 - Kia Stonic Auto h paro-moio',        catKey:'crossover',catLabel:'Crossover Auto', trans:'Aftomato',    fuel:'Venzini', doors:5, seats:5, deposit:700,  rates:[49,44,39,34,29] },
  G2: { label:'G2 - Fiat Tipo Sedan Auto h paro-moio',   catKey:'sedan',    catLabel:'Sedan Auto',     trans:'Aftomato',    fuel:'Venzini', doors:5, seats:5, deposit:700,  rates:[49,44,39,34,29] },
  S:  { label:'S - Peugeot 308 Station h paro-moio',     catKey:'sedan',    catLabel:'Station Wagon',  trans:'Xeirokinhto', fuel:'Mikto',   doors:5, seats:5, deposit:900,  rates:[64,58,51,45,38] },
  F:  { label:'F - Fiat Doblo 7th h paro-moio',          catKey:'van',      catLabel:'7 Theseon',      trans:'Xeirokinhto', fuel:'Mikto',   doors:5, seats:7, deposit:900,  rates:[64,58,51,45,38] },
  J1: { label:'J1 - Skoda Kamiq h paro-moio',            catKey:'suv',      catLabel:'Small SUV',      trans:'Xeirokinhto', fuel:'Venzini', doors:5, seats:5, deposit:700,  rates:[42,38,34,29,25] },
  J2: { label:'J2 - Peugeot 2008 h paro-moio',           catKey:'suv',      catLabel:'SUV',            trans:'Xeirokinhto', fuel:'Venzini', doors:5, seats:5, deposit:900,  rates:[62,56,50,43,37] },
  JA: { label:'JA - Nissan Qashqai Auto h paro-moio',    catKey:'suv',      catLabel:'SUV Auto',       trans:'Aftomato',    fuel:'Venzini', doors:5, seats:5, deposit:900,  rates:[69,62,55,48,41] },
  XM: { label:'XM - Kia Sportage h paro-moio',           catKey:'suv',      catLabel:'Large SUV',      trans:'Mikto',       fuel:'Mikto',   doors:5, seats:5, deposit:1200, rates:[92,83,74,64,55] },
  KD: { label:'KD - Fiat Talento 9th h paro-moio',       catKey:'van',      catLabel:'Van 9 Theseon',  trans:'Xeirokinhto', fuel:'Diesel',  doors:5, seats:9, deposit:1200, rates:[88,79,70,62,53] },
  KA: { label:'KA - Opel Vivaro Auto 9th h paro-moio',   catKey:'van',      catLabel:'Van 9th Auto',   trans:'Aftomato',    fuel:'Diesel',  doors:5, seats:9, deposit:1200, rates:[95,86,76,66,57] },
};

const FLEET_LABELS = {
  A:  'A — Toyota Aygo ή παρόμοιο',
  B:  'B — Fiat Panda ή παρόμοιο',
  BD: 'BD — Fiat Panda Diesel ή παρόμοιο',
  C1: 'C1 — Peugeot 208 ή παρόμοιο',
  CD: 'CD — Peugeot 208 Diesel ή παρόμοιο',
  GA: 'GA — Hyundai i10 Auto ή παρόμοιο',
  D:  'D — Seat Ibiza ή παρόμοιο',
  DD: 'DD — Seat Ibiza Diesel ή παρόμοιο',
  G:  'G — Seat Ibiza Auto ή παρόμοιο',
  E:  'E — Hyundai i30 ή παρόμοιο',
  ED: 'ED — Hyundai i30 Diesel ή παρόμοιο',
  E1: 'E1 — Fiat Tipo Sedan ή παρόμοιο',
  G1: 'G1 — Kia Stonic Auto ή παρόμοιο',
  G2: 'G2 — Fiat Tipo Sedan Auto ή παρόμοιο',
  S:  'S — Peugeot 308 Station ή παρόμοιο',
  F:  'F — Fiat Doblo 7θ. ή παρόμοιο',
  J1: 'J1 — Skoda Kamiq ή παρόμοιο',
  J2: 'J2 — Peugeot 2008 ή παρόμοιο',
  JA: 'JA — Nissan Qashqai Auto ή παρόμοιο',
  XM: 'XM — Kia Sportage ή παρόμοιο',
  KD: 'KD — Fiat Talento 9θ. ή παρόμοιο',
  KA: 'KA — Opel Vivaro Auto 9θ. ή παρόμοιο',
};

const INSURANCE = {
  basic:      { label:'Βασική CDW/TP',                          byDeposit:{500:0,  700:0,  900:0,  1200:0  } },
  scdw:       { label:'SCDW',                                                                   byDeposit:{500:8,  700:10, 900:13, 1200:16 } },
  full:       { label:'Πλήρης Κάλυψη',byDeposit:{500:14, 700:17, 900:22, 1200:28 } },
  full_glass: { label:'Πλήρης + Τζάμια & Ελαστικά',byDeposit:{500:19, 700:23, 900:30, 1200:38 } },
};

const EXTRAS = {
  booster:   { label:'Παιδικό κάθισμα (booster)', cost:25 },
  baby:      { label:'Βρεφικό κάθισμα',            cost:25 },
  ferry:     { label:'Εξουσιοδότηση Φέρι', cost:60 },
  young:     { label:'Νέος οδηγός (<21)', cost:60 },
  senior:    { label:'Ηλικιωμένος οδηγός (>75)', cost:60 },
  extra_drv: { label:'Πρόσθετος οδηγός (3ος+)', cost:30 },
  oor:       { label:'Εκτός ωραρίου γραφείου', cost:30 },
};

function getRateForDays(group, days) {
  const r = FLEET_DATA[group] && FLEET_DATA[group].rates;
  if (!r) return 0;
  if (days <= 2)  return r[0];
  if (days <= 6)  return r[1];
  if (days <= 13) return r[2];
  if (days <= 29) return r[3];
  return r[4];
}

function getMinPickupDate() {
  var d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

document.addEventListener('DOMContentLoaded', function() {

  /* ---- LOADER ---- */
  var loader = document.getElementById('loader');
  if (loader) setTimeout(function() { loader.classList.add('gone'); }, 2000);

  /* ---- WHATSAPP FLOATING BUTTON ---- */
  var fab = document.createElement('a');
  fab.href = 'https://wa.me/306983056936';
  fab.target = '_blank';
  fab.rel = 'noopener noreferrer';
  fab.className = 'wa-fab';
  fab.setAttribute('aria-label', 'WhatsApp');
  fab.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.062.522 4.04 1.517 5.797L.057 23.858a.5.5 0 0 0 .608.615l6.218-1.63A11.941 11.941 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.898 0-3.71-.503-5.282-1.46l-.378-.225-3.922 1.03 1.013-3.8-.245-.393A9.965 9.965 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>';
  document.body.appendChild(fab);

  /* ---- COOKIE CONSENT ---- */
  if (!localStorage.getItem('cookie_ok')) {
    var bar = document.createElement('div');
    bar.className = 'cookie-bar';
    bar.innerHTML = '<span>Χρησιμοποιούμε cookies για καλύτερη εμπειρία πλοήγησης.</span><button class="cookie-ok">Αποδοχή</button>';
    document.body.appendChild(bar);
    requestAnimationFrame(function() { bar.classList.add('visible'); });
    bar.querySelector('.cookie-ok').addEventListener('click', function() {
      localStorage.setItem('cookie_ok', '1');
      bar.classList.remove('visible');
      setTimeout(function() { bar.remove(); }, 400);
    });
  }

  /* ---- CUSTOM CURSOR (desktop only) ---- */
  if (window.matchMedia('(pointer:fine)').matches) {
    var dot  = document.createElement('div'); dot.className = 'cursor';
    var ring = document.createElement('div'); ring.className = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);
    var mx = -100, my = -100, rx = -100, ry = -100;
    document.addEventListener('mousemove', function(e) { mx = e.clientX; my = e.clientY; });
    (function animCursor() {
      dot.style.left  = mx + 'px'; dot.style.top  = my + 'px';
      rx += (mx - rx) * 0.14;     ry += (my - ry) * 0.14;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      requestAnimationFrame(animCursor);
    })();
    document.querySelectorAll('a,button').forEach(function(el) {
      el.addEventListener('mouseenter', function() { dot.style.transform = 'translate(-50%,-50%) scale(2)'; ring.style.transform = 'translate(-50%,-50%) scale(1.4)'; ring.style.opacity = '.2'; });
      el.addEventListener('mouseleave', function() { dot.style.transform = 'translate(-50%,-50%) scale(1)';  ring.style.transform = 'translate(-50%,-50%) scale(1)';   ring.style.opacity = '1'; });
    });
  }

  /* ---- NAVBAR ---- */
  var nav = document.getElementById('nav');
  function onScroll() { if (nav) nav.classList.toggle('solid', window.scrollY > 30); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- ACTIVE NAV LINK ---- */
  var page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mob-nav a').forEach(function(a) {
    if (a.getAttribute('href') === page) a.classList.add('on');
  });

  /* ---- HAMBURGER ---- */
  var ham    = document.getElementById('ham');
  var mobNav = document.getElementById('mob-nav');
  if (ham && mobNav) {
    ham.addEventListener('click', function() { ham.classList.toggle('open'); mobNav.classList.toggle('open'); });
    mobNav.querySelectorAll('a').forEach(function(a) {
      a.addEventListener('click', function() { ham.classList.remove('open'); mobNav.classList.remove('open'); });
    });
  }

  /* ---- SCROLL REVEAL ---- */
  var revObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) { if (e.isIntersecting) { e.target.classList.add('in'); revObs.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.rv').forEach(function(el) { revObs.observe(el); });

  /* ---- COUNTER ANIMATION ---- */
  var cntObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (!e.isIntersecting) return;
      var el = e.target, target = parseInt(el.dataset.count, 10), t0 = performance.now();
      (function step(now) {
        var p = Math.min((now - t0) / 1800, 1), ease = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(ease * target);
        if (p < 1) requestAnimationFrame(step); else el.textContent = target;
      })(t0);
      cntObs.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(function(el) { cntObs.observe(el); });

  /* ---- PARALLAX HERO BG ---- */
  var heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    window.addEventListener('scroll', function() { heroBg.style.transform = 'translateY(' + (window.scrollY * 0.3) + 'px)'; }, { passive: true });
  }

  /* ---- TESTIMONIALS DISPLAY (homepage rv-track) ---- */
  var rvTrack = document.querySelector('.rv-track');
  if (rvTrack) {
    var storedTm = JSON.parse(localStorage.getItem('dcr_testimonials') || '[]');
    var featuredTm = storedTm.filter(function(t) { return t.featured; });
    if (featuredTm.length) {
      var cards = featuredTm.map(function(t) {
        var stars = Array(t.stars + 1).join('★');
        return '<div class="rv-card">' +
          '<div class="rv-stars">' + stars + '</div>' +
          '<p class="rv-text">«' + t.text + '»</p>' +
          '<div class="rv-author">' +
            '<div class="rv-avatar">' + (t.name[0] || '?').toUpperCase() + '</div>' +
            '<div>' +
              '<div class="rv-name">' + t.name + (t.location ? ' &middot; ' + t.location : '') + '</div>' +
              '<div class="rv-date">' + (t.car || (t.date ? t.date : '')) + '</div>' +
            '</div>' +
          '</div>' +
        '</div>';
      }).join('');
      rvTrack.insertAdjacentHTML('afterbegin', cards);
    }
  }

  /* ---- FLEET FILTER ---- */
  var filterBtns = document.querySelectorAll('.filter-btn');
  var carCards   = document.querySelectorAll('.car-c');
  if (filterBtns.length && carCards.length) {
    filterBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        filterBtns.forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var cat = btn.dataset.cat;
        carCards.forEach(function(card) {
          if (cat === 'all' || card.dataset.cat === cat) {
            card.style.display = 'flex';
            setTimeout(function() { card.style.opacity = '1'; }, 30);
          } else {
            card.style.opacity = '0';
            setTimeout(function() { card.style.display = 'none'; }, 280);
          }
        });
      });
    });
  }

  /* ================================================================
     DATE VALIDATION — no same-day bookings; earliest = tomorrow 08:00
     ================================================================ */
  var MIN_DATE = getMinPickupDate();
  document.querySelectorAll('.pickup-date, [name="pickup_date"]').forEach(function(inp) { inp.setAttribute('min', MIN_DATE); });

  /* ---- HOMEPAGE QUICK-BOOK WIDGET ---- */
  var bookBtn = document.querySelector('.book-btn');
  if (bookBtn) {
    bookBtn.addEventListener('click', function(e) {
      e.preventDefault();
      var wrap      = bookBtn.closest('.book-form');
      var pickupSel = wrap && wrap.querySelector('select');
      var dates     = wrap && wrap.querySelectorAll('input[type="date"]');
      var pickupInp = dates && dates[0];
      var returnInp = dates && dates[1];

      var today  = new Date(); today.setHours(0, 0, 0, 0);
      var pickup = pickupInp && pickupInp.value ? new Date(pickupInp.value) : null;
      var ret    = returnInp && returnInp.value  ? new Date(returnInp.value) : null;

      if (pickup && pickup <= today) { showFieldError(pickupInp, 'Παρακαλούμε επιλέξτε ημερομηνία τουλάχιστον για αύριο (08:00)'); return; }
      if (pickup && ret && ret <= pickup) { showFieldError(returnInp, 'Η επιστροφή πρέπει να είναι μετά την παραλαβή'); return; }

      bookBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation:spin .8s linear infinite"><circle cx="12" cy="12" r="10" opacity=".25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg> Αναζήτηση...';
      setTimeout(function() {
        var p = new URLSearchParams();
        if (pickupSel && pickupSel.value) p.set('loc',  pickupSel.value);
        if (pickupInp && pickupInp.value) p.set('from', pickupInp.value);
        if (returnInp && returnInp.value) p.set('to',   returnInp.value);
        window.location.href = 'contact.html?' + p.toString();
      }, 700);
    });
  }

  /* ================================================================
     BOOKING FORM (contact.html)
     ================================================================ */
  var cForm = document.querySelector('.c-form');
  if (!cForm) { initFAQ(); return; }

  var pickupInp = cForm.querySelector('[name="pickup_date"]');
  var returnInp = cForm.querySelector('[name="return_date"]');
  var groupSel  = cForm.querySelector('[name="car_group"]');

  if (pickupInp) {
    pickupInp.setAttribute('min', MIN_DATE);
    pickupInp.addEventListener('change', function() {
      if (returnInp && pickupInp.value) {
        var next = new Date(pickupInp.value);
        next.setDate(next.getDate() + 1);
        returnInp.setAttribute('min', next.toISOString().split('T')[0]);
        if (returnInp.value && returnInp.value <= pickupInp.value) returnInp.value = '';
      }
      updatePricing();
    });
  }
  if (returnInp) returnInp.addEventListener('change', updatePricing);

  /* Pre-fill from homepage widget URL params */
  var qp = new URLSearchParams(location.search);
  if (qp.get('from') && pickupInp) pickupInp.value = qp.get('from');
  if (qp.get('to')   && returnInp) returnInp.value  = qp.get('to');
  if (qp.get('loc')) {
    var locSel = cForm.querySelector('[name="pickup_location"]');
    if (locSel) {
      for (var i = 0; i < locSel.options.length; i++) {
        if (locSel.options[i].value === qp.get('loc') || locSel.options[i].text.indexOf(qp.get('loc')) > -1) { locSel.selectedIndex = i; break; }
      }
    }
  }
  if (qp.get('group') && groupSel) groupSel.value = qp.get('group');

  if (groupSel) groupSel.addEventListener('change', function() { refreshInsurancePrices(); updatePricing(); });

  cForm.querySelectorAll('[name="insurance"]').forEach(function(r) {
    r.addEventListener('change', function() {
      cForm.querySelectorAll('.ins-card').forEach(function(c) { c.classList.remove('selected'); });
      var card = r.closest('.ins-card');
      if (card) card.classList.add('selected');
      updatePricing();
    });
  });

  cForm.querySelectorAll('.extra-cb').forEach(function(cb) { cb.addEventListener('change', updatePricing); });

  cForm.addEventListener('submit', function(e) {
    e.preventDefault();
    if (validateForm(cForm)) submitForm(cForm);
  });

  initFAQ();
  refreshInsurancePrices();
  updatePricing();

  /* ================================================================
     HELPERS
     ================================================================ */

  function initFAQ() {
    document.querySelectorAll('.faq-item').forEach(function(item) {
      var q = item.querySelector('.faq-q');
      if (q) q.addEventListener('click', function() {
        var wasOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(function(i) { i.classList.remove('open'); var a = i.querySelector('.faq-a'); if (a) a.classList.remove('open'); });
        if (!wasOpen) { item.classList.add('open'); var a = item.querySelector('.faq-a'); if (a) a.classList.add('open'); }
      });
    });
  }

  function refreshInsurancePrices() {
    var deposit = (FLEET_DATA[groupSel && groupSel.value] || {}).deposit || 500;
    cForm.querySelectorAll('.ins-card').forEach(function(card) {
      var key    = card.dataset.ins;
      var info   = INSURANCE[key];
      var perDay = info ? (info.byDeposit[deposit] || 0) : 0;
      var prEl   = card.querySelector('.ins-price');
      if (prEl) prEl.textContent = perDay === 0 ? 'Συμπεριλαμβάνεται' : '+' + perDay + '€/ημέρα';
      if (key === 'basic') {
        var depEl = card.querySelector('.ins-deposit');
        if (depEl) depEl.textContent = 'Εγγύηση: ' + deposit + '€';
      }
    });
  }

  function updatePricing() {
    var summary = document.getElementById('price-summary');
    if (!summary) return;
    var group   = groupSel && groupSel.value;
    var info    = group && FLEET_DATA[group];
    var fromVal = pickupInp && pickupInp.value;
    var toVal   = returnInp && returnInp.value;
    if (!info || !fromVal || !toVal) { summary.style.display = 'none'; return; }
    var from = new Date(fromVal), to = new Date(toVal);
    if (to <= from) { summary.style.display = 'none'; return; }

    var days      = Math.round((to - from) / 86400000);
    var dayRate   = getRateForDays(group, days);
    var baseTotal = dayRate * days;
    var insEl     = cForm.querySelector('[name="insurance"]:checked');
    var insKey    = insEl ? insEl.value : 'basic';
    var insInfo   = INSURANCE[insKey] || INSURANCE.basic;
    var insPerDay = insInfo.byDeposit[info.deposit] || 0;
    var insTotal  = insPerDay * days;

    var extrasTotal = 0, extraLines = [];
    cForm.querySelectorAll('.extra-cb:checked').forEach(function(cb) {
      var ex = EXTRAS[cb.value];
      if (ex) { extrasTotal += ex.cost; extraLines.push(ex); }
    });

    var grand   = baseTotal + insTotal + extrasTotal;
    var dayWord = days === 1 ? 'ημέρα' : 'ημέρες';

    summary.style.display = 'block';
    summary.innerHTML =
      '<div class="ps-head">Εκτίμηση Κόστους</div>' +
      '<div class="ps-line"><span>' + info.catLabel + ' — ' + dayRate + '€/ημ. × ' + days + ' ' + dayWord + '</span><span>' + baseTotal + '€</span></div>' +
      (insTotal > 0 ? '<div class="ps-line"><span>' + insInfo.label + '</span><span>+' + insTotal + '€</span></div>' : '') +
      extraLines.map(function(l) { return '<div class="ps-line"><span>' + l.label + '</span><span>+' + l.cost + '€</span></div>'; }).join('') +
      '<hr class="ps-sep"/>' +
      '<div class="ps-total"><span class="ps-total-label">Εκτιμώμενο Σύνολο</span><span class="ps-total-amount">' + grand + '€</span></div>' +
      '<div class="ps-note">Ενδεικτική τιμή — επιβεβαιώνεται κατά την παραλαβή. Δεν περιλαμβάνεται εγγύηση ' + info.deposit + '€ (επιστρέφεται).</div>';
  }

  function validateForm(form) {
    var ok = true;
    form.querySelectorAll('[required]').forEach(function(el) {
      el.classList.remove('inp-error');
      if (!el.value.trim()) { el.classList.add('inp-error'); ok = false; }
    });
    var today  = new Date(); today.setHours(0, 0, 0, 0);
    var pickup = pickupInp && pickupInp.value ? new Date(pickupInp.value) : null;
    var ret    = returnInp && returnInp.value  ? new Date(returnInp.value) : null;
    if (pickup && pickup <= today) { showFieldError(pickupInp, 'Κράτηση για σήμερα δεν είναι δυνατή. Νωρίτερο: αύριο 08:00'); ok = false; }
    if (pickup && ret && ret <= pickup) { showFieldError(returnInp, 'Η επιστροφή πρέπει να είναι μετά την παραλαβή'); ok = false; }
    return ok;
  }

  function showFieldError(input, msg) {
    if (!input) return;
    input.classList.add('inp-error');
    var errEl = input.parentElement.querySelector('.field-err');
    if (!errEl) { errEl = document.createElement('div'); errEl.className = 'field-err'; input.after(errEl); }
    errEl.textContent = msg;
    setTimeout(function() { if (errEl) errEl.remove(); input.classList.remove('inp-error'); }, 5000);
  }

  function generateRef() { return 'DCR-' + Date.now().toString(36).toUpperCase().slice(-6); }

  function submitForm(form) {
    var btn  = form.querySelector('.c-submit');
    var orig = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation:spin .8s linear infinite"><circle cx="12" cy="12" r="10" opacity=".25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg> Αποστολή...';

    var ref    = generateRef();
    var fd     = new FormData(form);
    var group  = fd.get('car_group') || '';
    var insKey = fd.get('insurance') || 'basic';
    var insLabel = (INSURANCE[insKey] || INSURANCE.basic).label;
    var groupLabel = (FLEET_LABELS[group] || group || 'Χωρίς προτίμηση');
    var extras = [];
    form.querySelectorAll('.extra-cb:checked').forEach(function(cb) { var ex = EXTRAS[cb.value]; if (ex) extras.push(ex.label); });
    var grand = (form.querySelector('.ps-total-amount') || {}).textContent || 'Δεν υπολογίστηκε';

    var params = {
      booking_ref:     ref,
      first_name:      fd.get('first_name')     || '',
      last_name:       fd.get('last_name')       || '',
      phone:           fd.get('phone')           || '',
      email:           fd.get('email')           || '',
      pickup_location: fd.get('pickup_location') || '',
      pickup_date:     fd.get('pickup_date')      || '',
      return_date:     fd.get('return_date')      || '',
      car_group:       groupLabel,
      insurance:       insLabel,
      extras:          extras.join(', ') || 'Κανένα',
      notes:           fd.get('notes')           || '',
      estimated_total: grand,
      to_email:        'dailyrentalsgreece@gmail.com',
    };

    saveBooking(params, ref, fd, group, insKey, insLabel, extras);

    fetch('/api/send-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
      .then(function(r) { return r.json(); })
      .then(function(data) { if (data.ok) showSuccess(form, ref); else showFormError(form, btn, orig); })
      .catch(function() {
        // Local dev fallback — API not available; booking already saved to localStorage
        showSuccess(form, ref);
      });
  }

  function showSuccess(form, ref) {
    var wrap = form.closest('.c-form-wrap');
    if (!wrap) return;
    wrap.innerHTML =
      '<div class="booking-success">' +
      '<div class="success-icon"><svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg></div>' +
      '<h3>Η αίτησή σας ελήφθη!</h3>' +
      '<div class="success-ref">Κωδικός κράτησης: <strong>' + ref + '</strong></div>' +
      '<p>Θα επικοινωνήσουμε μαζί σας <strong>άμεσα</strong> εντός ωραρίου <strong>08:00–22:00</strong>.</p>' +
      '<p style="margin-top:8px;color:var(--gray-600)">Για άμεση εξυπηρέτηση καλέστε:</p>' +
      '<a href="tel:+306983056936" class="btn-r" style="margin-top:18px;align-self:flex-start"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.72 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.63 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 5.91 5.91l.73-.73a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>+30 698 305 6936</a>' +
      '</div>';
  }

  function showFormError(form, btn, orig) {
    btn.disabled = false;
    btn.innerHTML = orig;
    var errDiv = form.querySelector('.form-send-error');
    if (!errDiv) { errDiv = document.createElement('div'); errDiv.className = 'form-send-error'; form.prepend(errDiv); }
    errDiv.textContent = 'Σφάλμα αποστολής. Παρακαλούμε καλέστε: +30 698 305 6936';
    setTimeout(function() { if (errDiv) errDiv.remove(); }, 6000);
  }

  /* ---- SAVE BOOKING TO LOCALSTORAGE (for dashboard) ---- */
  function saveBooking(params, ref, fd, group, insKey, insLabel, extras) {
    var booking = {
      id: ref,
      timestamp: new Date().toISOString(),
      name: (fd.get('first_name') || '') + ' ' + (fd.get('last_name') || ''),
      phone: fd.get('phone') || '',
      email: fd.get('email') || '',
      pickup_location: fd.get('pickup_location') || '',
      pickup_date: fd.get('pickup_date') || '',
      return_date: fd.get('return_date') || '',
      car_group: group,
      car_label: params.car_group,
      insurance: insKey,
      insurance_label: insLabel,
      extras: extras.join(', '),
      notes: fd.get('notes') || '',
      estimated_total: params.estimated_total,
      status: 'pending'
    };
    var bookings = JSON.parse(localStorage.getItem('dcr_bookings') || '[]');
    bookings.unshift(booking);
    localStorage.setItem('dcr_bookings', JSON.stringify(bookings));
  }

  /* ---- CAR INFO CARD ---- */
  function updateCarInfoCard() {
    var card = document.getElementById('car-info-card');
    if (!card || !groupSel) return;
    var group = groupSel.value;
    var info  = FLEET_DATA[group];
    if (!group || !info) { card.classList.remove('visible'); return; }
    var tierLabels = ['1-2 ημ.','3-6 ημ.','7-13 ημ.','14-29 ημ.','30+ ημ.'];
    var transLabel = info.trans === 'Aftomato' ? 'Αυτόματο' : (info.trans === 'Mikto' ? 'Μικτό' : 'Χειροκίνητο');
    var fuelLabel  = info.fuel === 'Diesel' ? 'Diesel' : (info.fuel === 'Mikto' ? 'Υβριδικό' : 'Βενζίνη');
    card.classList.add('visible');
    card.innerHTML =
      '<div class="cic-badge">' + group + '</div>' +
      '<div class="cic-body">' +
        '<div class="cic-name">' + (FLEET_LABELS[group] || '') + '</div>' +
        '<div class="cic-specs">' +
          '<span class="cic-spec">' + info.catLabel + '</span>' +
          '<span class="cic-spec">' + transLabel + '</span>' +
          '<span class="cic-spec">' + fuelLabel + '</span>' +
          '<span class="cic-spec">' + info.doors + ' πόρτες</span>' +
          '<span class="cic-spec">' + info.seats + ' θέσεις</span>' +
        '</div>' +
        '<div class="cic-rates">' +
          info.rates.map(function(r,i){ return '<span class="cic-rate">' + tierLabels[i] + ': <strong>' + r + '€/ημ.</strong></span>'; }).join('') +
        '</div>' +
        '<div class="cic-deposit">Εγγύηση: ' + info.deposit + '€ (επιστρέφεται)</div>' +
      '</div>';
  }

  /* ---- BOOKING STEP INDICATOR ---- */
  function updateSteps() {
    var steps = document.querySelectorAll('.bk-step');
    if (!steps.length || !cForm) return;
    var s1done = !!(groupSel && groupSel.value && pickupInp && pickupInp.value && returnInp && returnInp.value);
    var s2done = !!(s1done && cForm.querySelector('[name="insurance"]:checked'));
    if (steps[0]) { steps[0].classList.toggle('done', s1done); steps[0].classList.toggle('active', !s1done); }
    if (steps[1]) { steps[1].classList.toggle('done', s2done); steps[1].classList.toggle('active', s1done && !s2done); }
    if (steps[2]) { steps[2].classList.toggle('active', s2done); }
  }

  if (groupSel) { groupSel.addEventListener('change', function() { refreshInsurancePrices(); updatePricing(); updateCarInfoCard(); updateSteps(); }); updateCarInfoCard(); }
  if (pickupInp) pickupInp.addEventListener('change', updateSteps);
  if (returnInp) returnInp.addEventListener('change', updateSteps);
  updateSteps();

});

/* ================================================================
   LANGUAGE SWITCHING (EL / EN)
   ================================================================ */
var TRANSLATIONS = {
  en: {
    'nav-home':'Home', 'nav-fleet':'Fleet', 'nav-about':'About Us', 'nav-book':'Book Now →',
    'mob-home':'Home', 'mob-fleet':'Our Fleet', 'mob-about':'About Us', 'mob-book':'Book Now →',
    'hero-tag':'Car Rental in Athens & Attica',
    'hero-sub':'Delivery at your location. No credit card required, no hidden fees. 22 vehicle categories, 7 days a week 08:00–22:00.',
    'book-btn':'Search Availability →',
    'fleet-tag':'Our Fleet', 'fleet-all':'View all →',
    'pg-fleet-tag':'Our Fleet', 'pg-about-tag':'About Us', 'pg-contact-tag':'Immediate Service',
    'form-title':'Booking Form',
    'form-sub':'Fill in the details and we\'ll contact you within 1 hour.',
    'step1-title':'Vehicle & Dates', 'step2-title':'Insurance & Extras', 'step3-title':'Contact Details',
    'lbl-location':'Pickup Location *', 'lbl-pickup':'Pickup Date *', 'lbl-return':'Return Date *',
    'lbl-group':'Vehicle Category', 'lbl-ins':'Insurance Package', 'lbl-extras':'Extra Services',
    'lbl-firstname':'First Name *', 'lbl-lastname':'Last Name *',
    'lbl-phone':'Phone *', 'lbl-email':'Email *', 'lbl-notes':'Notes',
    'submit-btn':'Send Booking Request →',
    'extras-note':'2nd driver: FREE. All extras charged per rental.',
    'pg-fleet-h1':'Vehicles for <span>every trip</span>',
    'pg-fleet-sub':'22 vehicle categories, from compact city cars to 9-seat vans. Flexible rental periods, competitive daily rates.',
    'sec3-title':'Extra Services',
    'sec4-title':'Contact Details',
    'lbl-location':'Pickup Location *',
    'lbl-pickup':'Pickup Date *',
    'lbl-return':'Return Date *',
    'lbl-firstname':'First Name *',
    'lbl-lastname':'Last Name *',
    'lbl-phone':'Phone *',
    'lbl-email':'Email',
    'lbl-notes':'Notes / Additional Information',
    'ins-basic-name':'Basic CDW/TP',
    'ins-basic-desc':'Vehicle damage (CDW) + theft protection (TP). Security deposit applies based on vehicle group.',
    'ins-scdw-name':'SCDW',
    'ins-scdw-desc':'Reduces or eliminates excess liability for CDW & TP. Excludes negligence & violations.',
    'ins-full-name':'Full Protection',
    'ins-full-desc':'Comprehensive coverage, no excess. Excludes negligence, wrong fuel, keys, and fines.',
    'ins-glass-name':'Full + Glass & Tyres',
    'ins-glass-desc':'As above, plus coverage for glass, tyres & wheels. Maximum protection.',
    'extra-booster':'Booster seat (child)',
    'extra-baby':'Baby seat',
    'extra-ferry':'Ferry Boarding Authorization',
    'extra-young':'Young driver (under 21)',
    'extra-senior':'Senior driver (over 75)',
    'extra-drv':'Additional driver (3rd+)',
    'extra-oor':'Out of office hours service',
    'extras-note':'2nd driver: FREE — only 3rd driver onwards is charged.',
    'submit-btn':'Send Booking Request',
  }
};

function setLang(lang) {
  localStorage.setItem('dcr_lang', lang);
  document.documentElement.lang = lang === 'en' ? 'en' : 'el';
  document.querySelectorAll('.lang-btn').forEach(function(b) { b.classList.toggle('active', b.dataset.lang === lang); });
  var t = lang === 'en' ? TRANSLATIONS.en : null;
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var key = el.dataset.i18n;
    if (t && t[key] !== undefined) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.placeholder = t[key];
      else el.innerHTML = t[key];
    } else {
      var orig = el.dataset.orig;
      if (orig !== undefined) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.placeholder = orig;
        else el.innerHTML = orig;
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    if (el.dataset.orig === undefined) {
      el.dataset.orig = (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') ? el.placeholder : el.innerHTML.trim();
    }
  });
  document.querySelectorAll('.lang-btn').forEach(function(btn) {
    btn.addEventListener('click', function() { setLang(btn.dataset.lang); });
  });
  var saved = localStorage.getItem('dcr_lang');
  if (saved) setLang(saved);
});
