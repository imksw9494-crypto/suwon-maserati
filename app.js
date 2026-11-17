/* 더원오토 · 마세라티 인증 중고차 — 화면 동작 */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  let CARS = [];            // 매물 목록 (저장소 또는 예시 데이터에서 채움)
  let SAMPLE = true;        // 예시 데이터를 쓰는 중인지
  let LOAD_ERR = false;     // 저장소에서 불러오기 실패
  const DB = window.DB || {};
  const SITE = window.SITE || {};
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  /* ---------- 모델 정보 ---------- */
  const MODELS = {
    grecale:      { ko: '그레칼레',     en: 'Grecale',      body: '컴팩트 SUV',       engine: '2.0 MHEV · V6',   drive: 'AWD',        tint: '#8A93A3', img: 'img/grecale.webp',
                    desc: '일상에 가장 가까운 마세라티. 2.0 마일드 하이브리드의 GT·모데나와 네튜노 V6를 얹은 트로페오로 나뉩니다.' },
    levante:      { ko: '르반떼',       en: 'Levante',      body: '럭셔리 SUV',       engine: '2.0 MHEV · V6 · V8', drive: 'AWD (Q4)',   tint: '#5E9E3A', img: 'img/levante.webp',
                    desc: '마세라티의 첫 SUV. 넉넉한 차체와 Q4 사륜구동, 하이브리드부터 V8 트로페오까지 폭넓은 선택지를 갖췄습니다.' },
    ghibli:       { ko: '기블리',       en: 'Ghibli',       body: '스포츠 세단',      engine: '2.0 MHEV · V6 · V8', drive: 'RWD · AWD',  tint: '#B3262F', img: 'img/ghibli.webp',
                    desc: '마세라티 세단의 시작점. 매일 타는 세단의 실용성에 이탈리안 스포츠 세단의 감각을 더했습니다.' },
    quattroporte: { ko: '콰트로포르테', en: 'Quattroporte', body: '플래그십 세단',    engine: 'V6 · V8',         drive: 'RWD · AWD',  tint: '#2A5FA8', img: 'img/quattroporte.webp',
                    desc: '이름 그대로 네 개의 문을 가진 플래그십. 여유로운 뒷좌석과 장거리의 안락함이 강점입니다.' },
    granturismo:  { ko: '그란투리스모', en: 'GranTurismo',  body: '2도어 그랜드 투어러', engine: '네튜노 V6',     drive: 'AWD',        tint: '#B3262F', img: 'img/granturismo.webp',
                    desc: '먼 길을 빠르고 편안하게. 네튜노 V6와 사륜구동을 품은 2도어 그랜드 투어러입니다.' },
    mc20:         { ko: 'MC20',         en: 'MC20',         body: '미드십 슈퍼 스포츠', engine: '네튜노 V6',     drive: 'MR',         tint: '#AEB7C6', img: 'img/mc20.webp',
                    desc: '카본 모노코크와 버터플라이 도어, 630마력 네튜노 V6. 마세라티 기술의 정점에 선 슈퍼 스포츠카입니다.' }
  };
  const ORDER = ['grecale', 'levante', 'ghibli', 'quattroporte', 'granturismo', 'mc20'];
  const CHECKS = [
    ['엔진·파워트레인', 'M7 8V5h6v3M4 12H2m2-3v7m0-4h3l2-4h7l2 3h2v6h-3l-2 2H9l-2-2H4'],
    ['섀시·서스펜션', 'M6 14l3-8h6l3 8M9 17h6M6 20a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm12 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z'],
    ['브레이크·타이어', 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0-12v6m0 6v6M3 12h6m6 0h6'],
    ['전장·인포테인먼트', 'M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm3 16h8m-4-4v4'],
    ['외관·도장', 'M3 15l2-5c.6-1.6 1.6-2.5 3.5-2.5h7c1.900 0 2.900.9 3.500 2.500l2 5v3H3v-3Zm3.500-.5h.01m10.990 0h.01'],
    ['실내·편의', 'M7 20v-7a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v7M5 20h14M9 10V6a3 3 0 0 1 6 0v4']
  ];
  const ICON = {
    arrow: '<svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 1.500 9.500 7 4 12.500"/></svg>',
    check: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m2 7.500 3.200 3.200L12 3.600"/></svg>',
    plus: '<svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 1v10M1 6h10"/></svg>',
    prev: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9.500 1.500 4 7l5.500 5.500"/></svg>',
    next: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4.500 1.500 10 7l-5.500 5.500"/></svg>'
  };

  /* ---------- 표시 형식 ---------- */
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const won = p => {
    const eok = Math.floor(p / 10000), man = p % 10000;
    if (!eok) return `${man.toLocaleString('ko-KR')}<small>만원</small>`;
    return man ? `${eok}억 ${man.toLocaleString('ko-KR')}<small>만원</small>` : `${eok}<small>억원</small>`;
  };
  const wonText = p => won(p).replace(/<[^>]+>/g, '');
  const km = n => `${Number(n).toLocaleString('ko-KR')}km`;
  const title = c => `${MODELS[c.model]?.ko || c.model} ${c.trim}`;
  const ym = c => `${c.year}년${c.month ? ' ' + c.month + '월' : ''}`;
  const thumb = u => (u && u.includes('/' + (DB.bucket || 'car-photos') + '/')) ? u.replace(/(\.\w+)(\?.*)?$/, '_t$1') : u;
  const badge = c => c.status === '판매중' ? '' : `<span class="badge ${c.status === '예약중' ? 'hold' : 'sold'}">${esc(c.status)}</span>`;

  const cardHTML = (c, i = 0) => `
    <a class="card ${c.status === '판매완료' ? 'is-sold' : ''}" href="#car-${esc(c.id)}" style="--i:${i};--tint:${MODELS[c.model]?.tint || '#24406B'}">
      <div class="card-img ${c.cutout ? 'cut' : ''}">
        <div class="badges"><span class="badge cert">${ICON.check}인증</span>${badge(c)}</div>
        ${c.images[0] ? `<img src="${esc(thumb(c.images[0]))}" alt="${esc(title(c))}" loading="lazy">` : '<span class="noimg">사진 준비 중</span>'}
      </div>
      <div class="card-body">
        <h3><span>${esc(MODELS[c.model]?.en || '')}</span>${esc(title(c))}</h3>
        <p class="specline"><i>${c.year}년식</i><i>${km(c.mileage)}</i>${c.fuel ? `<i>${esc(c.fuel.split(' · ')[0])}</i>` : ''}${c.drive ? `<i>${esc(c.drive.split(' ')[0])}</i>` : ''}</p>
        <div class="card-foot"><span class="price">${won(c.price)}</span><span class="more">자세히 ${ICON.arrow}</span></div>
      </div>
    </a>`;

  /* ---------- 토스트 ---------- */
  const toastEl = $('#toast'); let toastT;
  const toast = msg => { toastEl.textContent = msg; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('on'), 2400); };
  const copy = async (text, okMsg) => {
    try { await navigator.clipboard.writeText(text); toast(okMsg); }
    catch (e) {
      const ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand('copy'); } catch (_) {}
      ta.remove(); toast(ok ? okMsg : '복사하지 못했습니다. 문구를 길게 눌러 복사해 주세요.');
    }
  };

  /* ---------- 스크롤 등장 ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: .08 });
  const watch = (root = document) => $$('.rv:not(.in)', root).forEach(el => io.observe(el));

  /* =====================================================
     라우터 : #home · #cars · #cars-모델 · #car-아이디 · #섹션
     ===================================================== */
  const PAGES = { home: $('#p-home'), cars: $('#p-cars'), car: $('#p-car') };
  const SECTIONS = ['highlights', 'models', 'program', 'inspection', 'featured', 'process', 'faq', 'contact'];
  let current = null;
  const nav = $('#nav'), drawer = $('#drawer'), burger = $('#burger');

  function route() {
    const h = decodeURIComponent(location.hash.slice(1)) || 'home';
    let page = 'home', arg = null, sec = null;
    if (h === 'cars' || h.startsWith('cars-')) { page = 'cars'; arg = h.slice(5) || 'all'; }
    else if (h.startsWith('car-')) { page = 'car'; arg = h.slice(4); }
    else if (SECTIONS.includes(h)) sec = h;

    closeDrawer();
    const changed = current !== page || page === 'car';
    if (changed) {
      Object.entries(PAGES).forEach(([k, el]) => { el.hidden = k !== page; });
      const el = PAGES[page]; el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
    }
    if (page === 'cars') renderCars(arg);
    if (page === 'car') renderCar(arg);
    current = page;

    $$('.menu a').forEach(a => {
      const k = a.getAttribute('href').slice(1);
      a.classList.toggle('on', (page !== 'home' && k === 'cars') || (page === 'home' && k === sec));
    });
    $('#bar').style.display = '';
    document.title = page === 'cars' ? '매물 | 더원오토 마세라티 인증 중고차'
      : page === 'car' ? `${$('#p-car h1')?.dataset.t || '매물'} | 더원오토`
      : '더원오토 | 마세라티 인증 중고차';

    if (sec) {
      const target = document.getElementById(sec);
      requestAnimationFrame(() => target.scrollIntoView({ behavior: changed || RM ? 'instant' : 'smooth', block: 'start' }));
    } else if (changed || h === 'home') {
      window.scrollTo({ top: 0, behavior: changed ? 'instant' : 'smooth' });
    }
    onScroll(); watch();
  }
  addEventListener('hashchange', route);
  // 같은 해시를 다시 눌러도 이동하도록
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (a && a.getAttribute('href') === location.hash) { e.preventDefault(); route(); }
  });

  function closeDrawer() { drawer.classList.remove('open'); nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; }
  burger.addEventListener('click', () => {
    const open = !drawer.classList.contains('open');
    drawer.classList.toggle('open', open); nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open)); document.body.style.overflow = open ? 'hidden' : '';
  });

  /* =====================================================
     스크롤 연동 (히어로 · 문장 하이라이트)
     ===================================================== */
  const hero = $('#hero');
  let heroFree = false, ticking = false;
  const sayText = $('#sayText'); let sayWords = [];

  function splitSay() {
    const out = [];
    sayText.childNodes.forEach(n => {
      const g = n.nodeType === 1 && n.hasAttribute('data-g');
      n.textContent.split(/(\s+)/).forEach(t => {
        if (!t) return;
        if (/^\s+$/.test(t)) { out.push(' '); return; }
        out.push(`<span class="w${g ? ' g' : ''}">${esc(t)}</span>`);
      });
    });
    sayText.innerHTML = out.join('');
    sayWords = $$('.w', sayText);
    if (RM) sayWords.forEach(w => w.classList.add('on'));
  }

  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const y = scrollY, vh = innerHeight;
      nav.classList.toggle('solid', y > 24 || current !== 'home');
      if (current !== 'home' || RM) return;
      const p = clamp(y / Math.max(1, hero.offsetHeight - vh));
      hero.style.setProperty('--p', p.toFixed(4));
      if (heroFree) hero.classList.toggle('scrolled', p > 0.001);
      const r = sayText.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0) {
        const sp = clamp((vh * 0.86 - r.top) / (vh * 0.5 + r.height));
        const n = Math.round(sp * (sayWords.length + 2));
        sayWords.forEach((w, i) => w.classList.toggle('on', i < n));
      }
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);

  function initHero() {
    if (location.protocol === 'file:') $('.hero-sheen')?.remove();
    const img = $('.hero-carbox img');
    const go = () => requestAnimationFrame(() => requestAnimationFrame(() => {
      hero.classList.add('ready'); setTimeout(() => { heroFree = true; onScroll(); }, RM ? 0 : 2300);
    }));
    if (img.complete) go(); else { img.addEventListener('load', go, { once: true }); img.addEventListener('error', go, { once: true }); }
  }

  /* =====================================================
     하이라이트 캐러셀 (자동 넘김 + 진행 표시)
     ===================================================== */
  function initHighlights() {
    const track = $('#hlTrack'), cards = $$('.hl-card', track), dotsEl = $('#hlDots'), playBtn = $('#hlPlay');
    const DUR = 5600; let idx = 0, playing = !RM, inView = false, t0 = 0, acc = 0, raf = 0, lock = 0;
    track.style.position = 'relative';
    dotsEl.innerHTML = cards.map((_, i) => `<button role="tab" aria-label="${i + 1}번째 하이라이트"><i></i></button>`).join('');
    const dots = $$('button', dotsEl);
    const pad = () => parseFloat(getComputedStyle(track).paddingLeft) || 0;

    const setActive = i => {
      if (i === idx && cards[i].classList.contains('on')) return;
      idx = i; acc = 0; t0 = performance.now();
      cards.forEach((c, k) => c.classList.toggle('on', k === i));
      dots.forEach((d, k) => { d.classList.toggle('on', k === i); d.setAttribute('aria-selected', String(k === i)); d.style.setProperty('--prog', 0); });
    };
    const goTo = i => {
      i = (i + cards.length) % cards.length; lock = performance.now() + 900;
      track.scrollTo({ left: cards[i].offsetLeft - pad(), behavior: RM ? 'instant' : 'smooth' });
      setActive(i);
    };
    track.addEventListener('scroll', () => {
      if (performance.now() < lock) return;
      const x = track.scrollLeft, max = track.scrollWidth - track.clientWidth;
      let best = 0, bd = Infinity;
      cards.forEach((c, k) => { const d = Math.abs(c.offsetLeft - pad() - x); if (d < bd) { bd = d; best = k; } });
      if (x >= max - 4) best = cards.length - 1;
      setActive(best);
    }, { passive: true });
    dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));
    cards.forEach((c, i) => c.addEventListener('click', () => { if (i !== idx) goTo(i); }));

    const loop = now => {
      raf = requestAnimationFrame(loop);
      if (!playing || !inView) { t0 = now; return; }
      acc += now - t0; t0 = now;
      dots[idx].style.setProperty('--prog', clamp(acc / DUR).toFixed(3));
      if (acc >= DUR) goTo(idx + 1);
    };
    const setPlay = v => {
      playing = v;
      $('.i-pause', playBtn).hidden = !v; $('.i-play', playBtn).hidden = v;
      playBtn.setAttribute('aria-label', v ? '자동 넘김 일시정지' : '자동 넘김 재생');
    };
    playBtn.addEventListener('click', () => setPlay(!playing));
    new IntersectionObserver(es => { inView = es[0].isIntersecting; t0 = performance.now(); }, { threshold: .45 }).observe(track);
    setActive(0); cards[0].classList.add('on'); dots[0].classList.add('on'); setPlay(playing);
    raf = requestAnimationFrame(loop);
  }

  /* ---------- 숫자 카운트 ---------- */
  function initCounts() {
    const co = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return; co.unobserve(e.target);
      const el = e.target, to = +el.dataset.count; if (RM) { el.textContent = to; return; }
      const t0 = performance.now(), dur = 1400;
      const step = now => { const k = clamp((now - t0) / dur); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 4))); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    }), { threshold: .6 });
    $$('[data-count]').forEach(el => co.observe(el));
  }

  /* =====================================================
     모델 뷰어
     ===================================================== */
  function initModels() {
    const list = $('#mvList'), carBox = $('#mvCar'), stage = $('#mvStage');
    const count = k => CARS.filter(c => c.model === k && c.status !== '판매완료').length;
    list.innerHTML = ORDER.map(k => {
      const m = MODELS[k];
      return `<div class="mv-item" data-k="${k}">
        <button class="mv-btn" role="tab"><span class="plus">${ICON.plus}</span>${m.ko}<small>${m.body}</small></button>
        <div class="mv-more"><div><p>${m.desc}</p><a class="link" href="#cars-${k}">인증 매물 ${count(k)}대 보기 ${ICON.arrow}</a></div></div>
      </div>`;
    }).join('');
    carBox.innerHTML = ORDER.map(k => `<img data-k="${k}" src="${MODELS[k].img}" alt="마세라티 ${MODELS[k].ko}" loading="lazy">`).join('');
    let cur = null;
    const select = k => {
      if (k === cur) return; const m = MODELS[k];
      $$('.mv-item', list).forEach(el => { const on = el.dataset.k === k; el.classList.toggle('on', on); $('.mv-btn', el).setAttribute('aria-selected', String(on)); });
      $$('img', carBox).forEach(img => {
        const on = img.dataset.k === k, was = img.classList.contains('on');
        img.classList.toggle('out', was && !on); img.classList.toggle('on', on);
        if (was && !on) setTimeout(() => img.classList.remove('out'), 700);
      });
      $('#mvName').innerHTML = `<span>${m.en}</span>`;
      $('#mvBody').textContent = m.body; $('#mvEngine').textContent = m.engine; $('#mvDrive').textContent = m.drive;
      $('#mvGo').href = `#cars-${k}`; stage.style.setProperty('--tint', m.tint);
      $('#mvDescM').innerHTML = `<p>${m.desc}</p><a class="link" href="#cars-${k}">인증 매물 ${count(k)}대 보기 ${ICON.arrow}</a>`;
      cur = k;
    };
    list.addEventListener('click', e => { const it = e.target.closest('.mv-item'); if (it && e.target.closest('.mv-btn')) select(it.dataset.k); });
    select('quattroporte');
  }

  /* ---------- 인증 프로그램 스크롤 스토리 ---------- */
  function initStory() {
    const steps = $$('#story .step'), imgs = $$('#story .story-media img'), media = $('#story .story-media');
    const so = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      const i = steps.indexOf(e.target);
      steps.forEach((s, k) => s.classList.toggle('on', k === i));
      imgs.forEach((im, k) => im.classList.toggle('on', k === i));
      $('#storyNo').textContent = String(i + 1).padStart(2, '0');
      media.style.setProperty('--sp', (i + 1) / steps.length);
    }), { rootMargin: '-46% 0px -46% 0px' });
    steps.forEach(s => so.observe(s));
  }

  /* ---------- 가로 스크롤 줄 + 좌우 버튼 ---------- */
  function rowPaddles(row, prev, next) {
    const upd = () => { prev.disabled = row.scrollLeft < 8; next.disabled = row.scrollLeft > row.scrollWidth - row.clientWidth - 8; };
    const by = d => row.scrollBy({ left: d * ((row.firstElementChild?.offsetWidth || 360) + 18), behavior: RM ? 'instant' : 'smooth' });
    prev.onclick = () => by(-1); next.onclick = () => by(1);
    row.addEventListener('scroll', upd, { passive: true }); upd();
  }
  function initFeatured() {
    const row = $('#featRow');
    const list = CARS.filter(c => c.featured && c.status !== '판매완료');
    const show = list.length ? list : CARS.filter(c => c.status !== '판매완료').slice(0, 6);
    row.innerHTML = show.length ? show.map((c, i) => cardHTML(c, i)).join('')
      : `<div class="empty" style="flex:1">${LOAD_ERR ? '매물을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.' : '새 인증 매물을 준비하고 있습니다. 상담을 남겨 주시면 입고 소식을 먼저 알려 드립니다.'}</div>`;
    rowPaddles(row, $('#featPrev'), $('#featNext'));
  }

  /* ---------- 아코디언 ---------- */
  function initAcc() {
    $('#acc').addEventListener('click', e => {
      const q = e.target.closest('.acc-q'); if (!q) return;
      const item = q.parentElement, open = !item.classList.contains('on');
      $$('#acc .acc-item').forEach(it => { it.classList.remove('on'); $('.acc-q', it).setAttribute('aria-expanded', 'false'); });
      if (open) { item.classList.add('on'); q.setAttribute('aria-expanded', 'true'); }
    });
  }

  /* =====================================================
     상담 정보 · 폼
     ===================================================== */
  function initContact() {
    const row = (k, v) => `<div><dt>${k}</dt><dd class="${v ? '' : 'tbd'}">${v || '등록 예정'}</dd></div>`;
    const tel = SITE.phone ? `<a href="tel:${esc(SITE.phone.replace(/[^0-9+]/g, ''))}">${esc(SITE.phone)}</a>` : '';
    const kakao = SITE.kakao ? `<a href="${esc(SITE.kakao)}" target="_blank" rel="noopener">카카오톡 채널 열기</a>` : '';
    $('#cinfo').innerHTML = row('전화', tel) + row('카카오톡', kakao) + row('전시장', esc(SITE.address)) + row('운영 시간', esc(SITE.hours));
    $('#fModel').innerHTML = '<option value="">선택 안 함</option>' + ORDER.map(k => `<option>${MODELS[k].ko}</option>`).join('') + '<option>기타 · 상담 후 결정</option>';
    const today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    $('#fDate').min = today.toISOString().slice(0, 10);

    $('#form').addEventListener('submit', e => {
      e.preventDefault();
      const f = e.target, name = f.name.value.trim(), telv = f.tel.value.trim();
      if (!name) { toast('이름을 입력해 주세요.'); f.name.focus(); return; }
      if (telv.replace(/\D/g, '').length < 9) { toast('연락처를 확인해 주세요.'); f.tel.focus(); return; }
      const lines = ['[더원오토 마세라티 인증 중고차 상담 신청]', `이름: ${name}`, `연락처: ${telv}`];
      if (f.model.value) lines.push(`관심 모델: ${f.model.value}`);
      if (f.date.value) lines.push(`방문 희망일: ${f.date.value}`);
      if (f.msg.value.trim()) lines.push(`문의: ${f.msg.value.trim()}`);
      const text = lines.join('\n');
      $('#formText').textContent = text;
      const acts = $('#formActs');
      acts.innerHTML = '<button type="button" class="btn btn-gold btn-sm" data-act="copy">문구 복사</button>'
        + (SITE.phone ? `<a class="btn btn-ghost btn-sm" href="sms:${esc(SITE.phone.replace(/[^0-9+]/g, ''))}?&body=${encodeURIComponent(text)}">문자로 보내기 (${esc(SITE.phone)})</a>` : '')
        + (SITE.kakao ? `<a class="btn btn-ghost btn-sm" href="${esc(SITE.kakao)}" target="_blank" rel="noopener">카카오톡 채널 열기</a>` : '');
      acts.querySelector('[data-act=copy]').onclick = () => copy(text, '상담 문구를 복사했습니다.');
      $('#formResult').hidden = false;
      $('#formResult').scrollIntoView({ behavior: RM ? 'instant' : 'smooth', block: 'center' });
    });

    const biz = [SITE.name || '더원오토', SITE.ceo && `대표 ${SITE.ceo}`, SITE.bizNo && `사업자등록번호 ${SITE.bizNo}`, SITE.address, SITE.phone && `전화 ${SITE.phone}`].filter(Boolean);
    $('#footBiz').textContent = biz.join(' · ');
    $('#year').textContent = new Date().getFullYear();
  }
  // 상세 페이지에서 "이 차량 상담"을 누르면 폼을 미리 채운다
  function consult(car, kind) {
    const f = $('#form');
    f.model.value = MODELS[car.model]?.ko || '';
    f.msg.value = `${title(car)} (${car.year}년식 · ${km(car.mileage)} · ${wonText(car.price)}) ${kind} 문의드립니다.`;
    $('#formResult').hidden = true;
    location.hash = '#contact';
  }

  /* ---------- 이미지 출처 ---------- */
  function initCredits() {
    const m = $('#credits'); let last;
    const set = on => { m.classList.toggle('on', on); if (on) { last = document.activeElement; $('#closeCredits').focus(); } else last?.focus(); };
    $('#openCredits').onclick = () => set(true); $('#closeCredits').onclick = () => set(false);
    m.addEventListener('click', e => { if (e.target === m) set(false); });
    addEventListener('keydown', e => { if (e.key === 'Escape') { set(false); closeDrawer(); } });
  }

  /* =====================================================
     매물 목록
     ===================================================== */
  const listState = { model: 'all', status: 'all', sort: 'new' };
  function renderCars(model) {
    listState.model = MODELS[model] ? model : 'all';
    const live = CARS.filter(c => c.status !== '판매완료').length;
    $('#carsTotal').textContent = live;
    $('#sampleNotice').hidden = !SAMPLE;
    $('#chips').innerHTML = [['all', '전체', CARS.length], ...ORDER.map(k => [k, MODELS[k].ko, CARS.filter(c => c.model === k).length])]
      .map(([k, label, n]) => `<a class="chip ${listState.model === k ? 'on' : ''}" role="tab" aria-selected="${listState.model === k}" href="#${k === 'all' ? 'cars' : 'cars-' + k}">${label}<b>${n}</b></a>`).join('');
    $('#chips .on')?.scrollIntoView({ block: 'nearest', inline: 'center' });
    drawGrid();
  }
  function drawGrid() {
    let list = CARS.filter(c => (listState.model === 'all' || c.model === listState.model) && (listState.status === 'all' || c.status === listState.status));
    const rank = { '판매중': 0, '예약중': 1, '판매완료': 2 };
    const sorters = {
      new: (a, b) => (b.year * 12 + (b.month || 0)) - (a.year * 12 + (a.month || 0)),
      plow: (a, b) => a.price - b.price, phigh: (a, b) => b.price - a.price, km: (a, b) => a.mileage - b.mileage
    };
    list = list.sort((a, b) => (rank[a.status] - rank[b.status]) || sorters[listState.sort](a, b));
    $('#countLine').innerHTML = `${listState.model === 'all' ? '전체' : MODELS[listState.model].ko} <b>${list.length}대</b>`;
    $('#grid').innerHTML = list.length ? list.map((c, i) => cardHTML(c, i)).join('')
      : `<div class="empty"><p>${LOAD_ERR ? '매물을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.' : '조건에 맞는 매물이 지금은 없습니다.'}</p><p style="margin-top:14px"><a class="btn btn-ghost btn-sm" href="#contact">입고 알림 상담하기</a></p></div>`;
  }
  $('#fStatus').addEventListener('change', e => { listState.status = e.target.value; drawGrid(); });
  $('#fSort').addEventListener('change', e => { listState.sort = e.target.value; drawGrid(); });

  /* =====================================================
     매물 상세
     ===================================================== */
  function renderCar(id) {
    const c = CARS.find(x => x.id === id), el = PAGES.car;
    if (!c) {
      el.innerHTML = `<section class="sub-hero" style="min-height:70vh"><div class="wrap"><p class="eyebrow">Not Found</p><h1>매물을 찾을 수 없습니다.</h1><p class="lead">판매가 끝났거나 주소가 바뀌었을 수 있습니다.</p><p><a class="btn btn-gold" href="#cars">전체 매물 보기</a></p></div></section>`;
      return;
    }
    const m = MODELS[c.model] || {}, sold = c.status === '판매완료';
    const imgs = (c.images.length ? c.images : ['']).map((src, i) => ({ src, cut: c.cutout && i === 0 }));
    const row = (k, v) => v ? `<div><dt>${k}</dt><dd>${v}</dd></div>` : '';
    const similar = [...CARS.filter(x => x.model === c.model && x.id !== c.id), ...CARS.filter(x => x.model !== c.model && x.status !== '판매완료')].slice(0, 6);
    el.innerHTML = `
    <section class="d-top" style="--tint:${m.tint || '#24406B'}">
      <div class="wrap">
        <nav class="crumb" aria-label="현재 위치"><a href="#home">홈</a>${ICON.arrow}<a href="#cars">매물</a>${ICON.arrow}<a href="#cars-${c.model}">${m.ko}</a></nav>
        <div class="d-grid">
          <div class="gal">
            <div class="gal-main" id="galMain">
              ${imgs[0].src ? imgs.map((im, i) => `<img class="${im.cut ? 'cut ' : ''}${i === 0 ? 'on' : ''}" ${i === 0 ? 'src' : 'data-src'}="${esc(im.src)}" alt="${esc(title(c))} 사진 ${i + 1}">`).join('') : '<span class="noimg">사진 준비 중</span>'}
              ${imgs[0].src ? `<span class="gal-idx" id="galIdx">01 / ${String(imgs.length).padStart(2, '0')}</span>` : ''}
              ${imgs.length > 1 ? `<div class="gal-nav"><button class="round" id="galPrev" aria-label="이전 사진">${ICON.prev}</button><button class="round" id="galNext" aria-label="다음 사진">${ICON.next}</button></div>` : ''}
            </div>
            ${imgs.length > 1 ? `<div class="thumbs" id="thumbs">${imgs.map((im, i) => `<button class="${i === 0 ? 'on' : ''}" aria-label="사진 ${i + 1}"><img class="${im.cut ? 'cut' : ''}" src="${esc(thumb(im.src))}" alt="" loading="lazy"></button>`).join('')}</div>` : ''}
          </div>
          <aside class="sum">
            <div class="badges"><span class="badge cert">${ICON.check}인증</span>${badge(c)}</div>
            <h1 data-t="${esc(title(c))}"><span>Maserati ${esc(m.en || '')}</span>${esc(title(c))}</h1>
            <p class="price">${won(c.price)}</p>
            <p class="desc">${esc(c.desc)}</p>
            <dl class="kv">
              <div><dt>연식</dt><dd>${ym(c)}</dd></div><div><dt>주행거리</dt><dd>${km(c.mileage)}</dd></div>
              ${row('연료', esc(c.fuel.split(' · ')[0]))}${row('변속기', esc(c.transmission))}
              ${row('구동', esc(c.drive))}${row('외장 색상', esc(c.color))}
            </dl>
            <div class="sum-acts">
              <button class="btn btn-gold" data-consult="${sold ? '유사 매물' : '구매 상담'}">${sold ? '유사 매물 상담' : '이 차량 상담 신청'}</button>
              ${sold ? `<a class="btn btn-ghost" href="#cars-${c.model}">${m.ko} 매물 보기</a>` : '<button class="btn btn-ghost" data-consult="시승 예약">시승 예약</button>'}
            </div>
          </aside>
        </div>
      </div>
    </section>

    <section class="light">
      <div class="wrap d-sec">
        <div class="sec-head"><p class="eyebrow rv">Details</p><h2 class="h2 rv" style="--d:1;font-size:clamp(28px,3.6vw,48px)">차량 정보와 점검 결과.</h2></div>
        <div class="d-cols">
          <dl class="spec-table rv">
            <div><dt>모델</dt><dd>마세라티 ${esc(title(c))}</dd></div>
            <div><dt>최초 등록</dt><dd>${ym(c)}</dd></div>
            <div><dt>주행거리</dt><dd>${km(c.mileage)}</dd></div>
            ${row('엔진', esc(c.displacement))}
            ${row('최고 출력', esc(c.power))}
            ${row('연료', esc(c.fuel))}
            ${row('변속기 · 구동', esc([c.transmission, c.drive].filter(Boolean).join(' · ')))}
            ${row('외장 · 내장', esc([c.color, c.interior].filter(Boolean).join(' · ')))}
            <div><dt>사고 이력</dt><dd>${esc(c.history?.accident || '상담 시 안내')}</dd></div>
            <div><dt>소유 이력</dt><dd>${esc(c.history?.owners || '상담 시 안내')}</dd></div>
            <div><dt>정비 이력</dt><dd>${esc(c.history?.service || '상담 시 안내')}</dd></div>
          </dl>
          <div class="checks rv" style="--d:1">
            ${CHECKS.map(([name, d]) => `<div class="check"><span class="ico"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.500" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg></span>${name}<span class="ok">${ICON.check}점검 완료</span></div>`).join('')}
          </div>
        </div>
      </div>
      <div class="wrap d-sec" ${(c.options || []).length ? '' : 'hidden'}>
        <div class="sec-head"><p class="eyebrow rv">Options</p><h2 class="h2 rv" style="--d:1;font-size:clamp(28px,3.6vw,48px)">주요 옵션.</h2></div>
        <ul class="opts rv">${(c.options || []).map(o => `<li>${ICON.check}${esc(o)}</li>`).join('')}</ul>
      </div>
      <div class="wrap d-sec">
        <div class="sec-head"><p class="eyebrow rv">Finance</p><h2 class="h2 rv" style="--d:1;font-size:clamp(28px,3.6vw,48px)">월 납입금 미리 보기.</h2></div>
        <div class="calc rv" id="calc">
          <div>
            <div class="rng"><label for="cDown">선수금 <b id="cDownV"></b></label><input id="cDown" type="range" min="0" max="70" step="5" value="30"></div>
            <div class="rng"><label for="cTerm">할부 기간 <b id="cTermV"></b></label><input id="cTerm" type="range" min="12" max="72" step="12" value="48"></div>
            <div class="rng"><label for="cRate">금리 (연) <b id="cRateV"></b></label><input id="cRate" type="range" min="3" max="12" step="0.1" value="6.9"></div>
          </div>
          <div class="calc-out"><small>예상 월 납입금</small><span class="num"><span id="cOut">0</span><em>만원</em></span>
            <p>원리금 균등 상환 기준의 단순 계산입니다. 실제 금리와 한도는 금융사 심사 결과에 따라 달라집니다.</p></div>
        </div>
      </div>
    </section>

    <section class="feat">
      <div class="wrap hl-top" style="margin-bottom:0"><div class="sec-head"><p class="eyebrow">More</p><h2 class="h2" style="font-size:clamp(28px,3.6vw,48px)">함께 볼 만한 매물.</h2></div>
        <a class="link" href="#cars">전체 매물 보기 ${ICON.arrow}</a></div>
      <div class="rowscroll" id="simRow">${similar.map((x, i) => cardHTML(x, i)).join('')}</div>
      <div class="wrap paddles"><button class="round" id="simPrev" aria-label="이전 매물">${ICON.prev}</button><button class="round" id="simNext" aria-label="다음 매물">${ICON.next}</button></div>
    </section>`;

    // 갤러리
    const gi = $$('#galMain img'), th = $$('#thumbs button'); let g = 0;
    const show = i => {
      g = (i + gi.length) % gi.length;
      const load = k => { const im = gi[(k + gi.length) % gi.length]; if (im && im.dataset.src) { im.src = im.dataset.src; delete im.dataset.src; } };
      load(g); load(g + 1);
      gi.forEach((im, k) => im.classList.toggle('on', k === g)); th.forEach((b, k) => { b.classList.toggle('on', k === g); if (k === g) b.scrollIntoView({ block: 'nearest', inline: 'nearest' }); });
      if (!gi.length) return;
      $('#galIdx').textContent = `${String(g + 1).padStart(2, '0')} / ${String(gi.length).padStart(2, '0')}`;
    };
    th.forEach((b, i) => b.onclick = () => show(i));
    if (gi.length > 1) { const n = gi[1]; if (n.dataset.src) { n.src = n.dataset.src; delete n.dataset.src; } }
    if ($('#galPrev')) { $('#galPrev').onclick = () => show(g - 1); $('#galNext').onclick = () => show(g + 1); }
    let sx = null; const gm = $('#galMain');
    gm.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    gm.addEventListener('touchend', e => { if (sx === null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) show(g + (dx < 0 ? 1 : -1)); sx = null; });

    // 상담 버튼
    $$('[data-consult]', el).forEach(b => b.onclick = () => consult(c, b.dataset.consult));

    // 월 납입금 계산
    const down = $('#cDown'), term = $('#cTerm'), rate = $('#cRate');
    const calc = () => {
      const P = c.price * (1 - down.value / 100), n = +term.value, r = rate.value / 100 / 12;
      const mth = r ? P * r / (1 - Math.pow(1 + r, -n)) : P / n;
      $('#cDownV').textContent = `${down.value}% · ${wonText(Math.round(c.price * down.value / 100))}`;
      $('#cTermV').textContent = `${n}개월`; $('#cRateV').textContent = `${(+rate.value).toFixed(1)}%`;
      $('#cOut').textContent = Math.round(mth).toLocaleString('ko-KR');
      [down, term, rate].forEach(i => i.style.setProperty('--v', ((i.value - i.min) / (i.max - i.min) * 100) + '%'));
    };
    [down, term, rate].forEach(i => i.addEventListener('input', calc)); calc();
    rowPaddles($('#simRow'), $('#simPrev'), $('#simNext'));
  }

  /* =====================================================
     매물 불러오기 : 저장소가 연결돼 있으면 거기서, 아니면 예시 데이터
     ===================================================== */
  const fromRow = r => ({
    id: r.id, model: r.model, trim: r.trim || '', year: r.year, month: r.month, mileage: r.mileage || 0, price: r.price || 0,
    fuel: r.fuel || '', displacement: r.displacement || '', power: r.power || '', transmission: r.transmission || '', drive: r.drive || '',
    color: r.color || '', interior: r.interior || '', status: r.status || '판매중', featured: !!r.featured, cutout: !!r.cutout,
    images: Array.isArray(r.images) ? r.images : [], options: Array.isArray(r.options) ? r.options : [],
    history: r.history || {}, desc: r.description || ''
  });
  const loadScript = src => new Promise((ok, no) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => no(new Error('스크립트를 불러오지 못했습니다: ' + src)); document.head.appendChild(s); });
  async function loadCars() {
    if (!DB.url || !DB.key) { CARS = window.CARS || []; SAMPLE = true; return; }
    SAMPLE = false;
    try {
      await loadScript('vendor/supabase.js');
      const sb = window.supabase.createClient(DB.url, DB.key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
      const { data, error } = await sb.from('cars').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      CARS = (data || []).map(fromRow);
    } catch (e) { console.error('매물 불러오기 실패', e); CARS = []; LOAD_ERR = true; }
  }

  /* ---------- 시작 ---------- */
  // 매물 페이지 주소로 바로 들어온 경우, 불러오는 동안 메인이 잠깐 비치지 않게 한다
  if (/^#cars?(-|$)/.test(location.hash)) { PAGES.home.hidden = true; nav.classList.add('solid'); }
  splitSay(); initHero(); initHighlights(); initCounts(); initStory(); initAcc(); initContact(); initCredits();
  loadCars().then(() => { initModels(); initFeatured(); route(); });
})();
