/* 수원 마세라티 인증중고차 · 매물 관리 화면 */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const DB = window.DB || {};
  const BUCKET = DB.bucket || 'car-photos';
  const CONNECTED = !!(DB.url && DB.key);

  const MODELS = { grecale: '그레칼레', levante: '르반떼', ghibli: '기블리', quattroporte: '콰트로포르테', granturismo: '그란투리스모', mc20: 'MC20' };
  const ORDER = Object.keys(MODELS);
  // 트림을 고르면 비어 있는 제원 칸을 채워 주는 참고값 (실제 차량과 다를 수 있으니 확인 필요)
  const MHEV = '가솔린 · 마일드 하이브리드', V6N = '2,992cc V6 트윈터보', V8 = '3,799cc V8 트윈터보';
  const PRESETS = {
    grecale: {
      'GT': { fuel: MHEV, displacement: '1,995cc', power: '300마력', transmission: '8단 자동', drive: 'AWD' },
      'Modena': { fuel: MHEV, displacement: '1,995cc', power: '330마력', transmission: '8단 자동', drive: 'AWD' },
      'Trofeo': { fuel: '가솔린', displacement: V6N, power: '530마력', transmission: '8단 자동', drive: 'AWD' }
    },
    levante: {
      'GT 하이브리드': { fuel: MHEV, displacement: '1,995cc', power: '330마력', transmission: '8단 자동', drive: 'AWD (Q4)' },
      'Modena': { fuel: '가솔린', transmission: '8단 자동', drive: 'AWD (Q4)' },
      'Trofeo': { fuel: '가솔린', displacement: V8, power: '580마력', transmission: '8단 자동', drive: 'AWD (Q4)' }
    },
    ghibli: {
      'GT 하이브리드': { fuel: MHEV, displacement: '1,995cc', power: '330마력', transmission: '8단 자동', drive: 'RWD' },
      'Modena': { fuel: '가솔린', transmission: '8단 자동' },
      'Trofeo': { fuel: '가솔린', displacement: V8, power: '580마력', transmission: '8단 자동', drive: 'RWD' }
    },
    quattroporte: {
      'Modena Q4': { fuel: '가솔린', displacement: '2,979cc V6 트윈터보', power: '430마력', transmission: '8단 자동', drive: 'AWD (Q4)' },
      'Trofeo': { fuel: '가솔린', displacement: V8, power: '580마력', transmission: '8단 자동', drive: 'RWD' }
    },
    granturismo: {
      'Modena': { fuel: '가솔린', displacement: V6N, power: '490마력', transmission: '8단 자동', drive: 'AWD' },
      'Trofeo': { fuel: '가솔린', displacement: V6N, power: '550마력', transmission: '8단 자동', drive: 'AWD' }
    },
    mc20: {
      '쿠페': { fuel: '가솔린', displacement: V6N, power: '630마력', transmission: '8단 DCT', drive: 'MR (미드십 후륜)' },
      '첼로': { fuel: '가솔린', displacement: V6N, power: '630마력', transmission: '8단 DCT', drive: 'MR (미드십 후륜)' }
    }
  };

  const state = { cars: [], editing: null, photos: [], removed: [], demo: false, busy: false, dirty: false };
  let api = null;

  /* ---------- 도우미 ---------- */
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = v => parseInt(String(v ?? '').replace(/[^\d]/g, ''), 10) || 0;
  const comma = n => Number(n || 0).toLocaleString('ko-KR');
  const won = p => { const e = Math.floor(p / 10000), m = p % 10000; return !e ? `${comma(m)}만원` : m ? `${e}억 ${comma(m)}만원` : `${e}억원`; };
  const title = c => `${MODELS[c.model] || c.model} ${c.trim || ''}`.trim();
  const thumbOf = u => (u && u.includes(`/${BUCKET}/`)) ? u.replace(/(\.\w+)(\?.*)?$/, '_t$1') : u;
  const pathOf = u => { const k = `/object/public/${BUCKET}/`, i = (u || '').indexOf(k); return i < 0 ? null : decodeURIComponent(u.slice(i + k.length).split('?')[0]); };
  const VIEWS = ['vSetup', 'vLogin', 'vList', 'vInq', 'vEdit'];
  const show = id => {
    VIEWS.forEach(v => { $('#' + v).hidden = v !== id; });
    $('#tabs').hidden = !(id === 'vList' || id === 'vInq');
    $$('.tab').forEach(t => t.classList.toggle('on', t.dataset.tab === id));
    window.scrollTo(0, 0);
  };

  const toastEl = $('#toast'); let toastT;
  const toast = (msg, bad = false) => { toastEl.textContent = msg; toastEl.classList.toggle('bad', bad); toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('on'), bad ? 5200 : 2600); };
  const explain = e => {
    const m = String(e?.message || e || '');
    if (/Invalid login credentials/i.test(m)) return '이메일 또는 비밀번호가 맞지 않습니다.';
    if (/Email not confirmed/i.test(m)) return '이메일 확인이 끝나지 않은 계정입니다. Supabase 의 Users 화면에서 계정을 확인 처리해 주세요.';
    if (/row-level security|permission denied|not authorized|Unauthorized|403/i.test(m)) return '이 계정에는 매물을 고칠 권한이 없습니다. 관리자 목록(admins)에 이메일이 등록돼 있는지 확인해 주세요.';
    if (/Failed to fetch|NetworkError|Load failed/i.test(m)) return '저장소에 연결하지 못했습니다. 인터넷 연결과 config.js 의 주소를 확인해 주세요.';
    if (/JWT|session|token/i.test(m)) return '로그인이 만료되었습니다. 다시 로그인해 주세요.';
    return m || '알 수 없는 오류가 발생했습니다.';
  };

  // 확인 창 (브라우저 기본 confirm 대신)
  const confirmBox = (ttl, text, yes = '삭제', danger = true) => new Promise(done => {
    const m = $('#confirm'); $('#cfTitle').textContent = ttl; $('#cfText').textContent = text;
    const y = $('#cfYes'), n = $('#cfNo'); y.textContent = yes; y.className = 'btn ' + (danger ? 'danger' : 'primary');
    const end = v => { m.classList.remove('on'); y.onclick = n.onclick = m.onclick = null; done(v); };
    y.onclick = () => end(true); n.onclick = () => end(false); m.onclick = e => { if (e.target === m) end(false); };
    m.classList.add('on'); n.focus();
  });

  /* =====================================================
     저장소 연결 (Supabase) / 체험 모드
     ===================================================== */
  function supaApi() {
    let sb;
    const ok = ({ data, error }) => { if (error) throw error; return data; };
    return {
      async init() {
        await new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'vendor/supabase.js'; s.onload = res; s.onerror = () => rej(new Error('Failed to fetch')); document.head.appendChild(s); });
        sb = window.supabase.createClient(DB.url, DB.key);
      },
      async session() { return ok(await sb.auth.getSession()).session; },
      async signIn(email, password) { return ok(await sb.auth.signInWithPassword({ email, password })).session; },
      async signOut() { await sb.auth.signOut(); },
      async isAdmin() { return !!ok(await sb.rpc('is_admin')); },
      async list() { return ok(await sb.from('cars').select('*').order('created_at', { ascending: false })); },
      async save(row, isNew) {
        if (isNew) return ok(await sb.from('cars').insert(row).select().single());
        const { id, ...rest } = row;
        return ok(await sb.from('cars').update(rest).eq('id', id).select().single());
      },
      async remove(id) { ok(await sb.from('cars').delete().eq('id', id)); },
      async upload(path, blob) {
        ok(await sb.storage.from(BUCKET).upload(path, blob, { contentType: blob.type, cacheControl: '31536000', upsert: false }));
        return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
      },
      async removeFiles(urls) {
        const paths = urls.flatMap(u => [pathOf(u), pathOf(thumbOf(u))]).filter(Boolean);
        if (paths.length) ok(await sb.storage.from(BUCKET).remove(paths));
      },
      async inqList() { return ok(await sb.from('inquiries').select('*').order('created_at', { ascending: false }).limit(500)); },
      async inqSave(id, change) { return ok(await sb.from('inquiries').update(change).eq('id', id).select().single()); },
      async inqRemove(id) { ok(await sb.from('inquiries').delete().eq('id', id)); }
    };
  }
  function demoApi() {
    let rows = (window.CARS || []).map((c, i) => ({ ...c, description: c.desc || '', created_at: new Date(Date.now() - i * 864e5).toISOString() }));
    let inq = [
      { id: 'd1', created_at: new Date(Date.now() - 36e5).toISOString(), name: '홍길동 (예시)', phone: '010-0000-0000', model: '그레칼레', visit_date: null, message: '이번 주말 시승이 가능한지 궁금합니다', car_id: '', car_title: '', status: '신규', memo: '' },
      { id: 'd2', created_at: new Date(Date.now() - 26 * 36e5).toISOString(), name: '김예시', phone: '010-1111-2222', model: '르반떼', visit_date: null, message: '할부 조건 문의드립니다', car_id: 'levante-trofeo-2021-02', car_title: '르반떼 Trofeo (2021년식 · 1억 2,800만원)', status: '연락 완료', memo: '11/20 방문 예정' }
    ];
    return {
      async init() {}, async session() { return null; }, async signIn() {}, async signOut() {}, async isAdmin() { return true; },
      async list() { return rows.map(r => ({ ...r })); },
      async save(row, isNew) {
        if (isNew) { const r = { ...row, created_at: new Date().toISOString() }; rows.unshift(r); return { ...r }; }
        const r = rows.find(x => x.id === row.id); Object.assign(r, row); return { ...r };
      },
      async remove(id) { rows = rows.filter(r => r.id !== id); },
      async upload(path, blob) { return URL.createObjectURL(blob); },
      async removeFiles() {},
      async inqList() { return inq.map(r => ({ ...r })); },
      async inqSave(id, change) { const r = inq.find(x => x.id === id); Object.assign(r, change); return { ...r }; },
      async inqRemove(id) { inq = inq.filter(r => r.id !== id); }
    };
  }

  /* =====================================================
     사진 : 올리기 전에 크기를 줄여 두 벌(본문용·목록용)로 만든다
     ===================================================== */
  async function decode(file) {
    if (window.createImageBitmap) { try { return await createImageBitmap(file, { imageOrientation: 'from-image' }); } catch (_) { /* 아래 방식으로 다시 시도 */ } }
    return await new Promise((res, rej) => {
      const im = new Image(), u = URL.createObjectURL(file);
      im.onload = () => { URL.revokeObjectURL(u); res(im); };
      im.onerror = () => { URL.revokeObjectURL(u); rej(new Error(`"${file.name}" 은(는) 열 수 없는 사진 형식입니다. JPG 나 PNG 로 바꿔서 올려 주세요.`)); };
      im.src = u;
    });
  }
  function draw(src, max, type, q) {
    const w = src.width || src.naturalWidth, h = src.height || src.naturalHeight, k = Math.min(1, max / Math.max(w, h));
    const cv = document.createElement('canvas'); cv.width = Math.round(w * k); cv.height = Math.round(h * k);
    const cx = cv.getContext('2d');
    if (type === 'image/jpeg') { cx.fillStyle = '#fff'; cx.fillRect(0, 0, cv.width, cv.height); }
    cx.imageSmoothingQuality = 'high'; cx.drawImage(src, 0, 0, cv.width, cv.height);
    return new Promise(res => cv.toBlob(res, type, q));
  }
  async function variants(file) {
    const src = await decode(file);
    try {
      let full = await draw(src, 1600, 'image/webp', 0.82), ext = 'webp', thumb;
      if (full && full.type === 'image/webp') thumb = await draw(src, 640, 'image/webp', 0.78);
      else { // webp 로 저장하지 못하는 브라우저
        const alpha = /png|webp|gif/i.test(file.type), t = alpha ? 'image/png' : 'image/jpeg'; ext = alpha ? 'png' : 'jpg';
        full = await draw(src, 1600, t, 0.85); thumb = await draw(src, 640, t, 0.8);
      }
      if (!full || !thumb) throw new Error(`"${file.name}" 사진을 처리하지 못했습니다.`);
      return { full, thumb, ext };
    } finally { src.close && src.close(); }
  }
  async function pool(items, size, fn) {
    let i = 0; const run = async () => { while (i < items.length) { const it = items[i++]; await fn(it); } };
    await Promise.all(Array.from({ length: Math.min(size, items.length) }, run));
  }

  /* =====================================================
     목록
     ===================================================== */
  async function refresh() { state.cars = await api.list(); drawList(); }
  function drawList() {
    const q = $('#q').value.trim().toLowerCase(), fm = $('#fModel').value, fs = $('#fStat').value;
    const cnt = s => state.cars.filter(c => c.status === s).length;
    $('#total').textContent = state.cars.length;
    $('#statLine').textContent = `판매중 ${cnt('판매중')} · 예약중 ${cnt('예약중')} · 판매완료 ${cnt('판매완료')}`;
    const rows = state.cars.filter(c => (!fm || c.model === fm) && (!fs || c.status === fs)
      && (!q || `${title(c)} ${c.model} ${c.color} ${c.year}`.toLowerCase().includes(q)));
    const tag = c => `<span class="tag ${c.status === '예약중' ? 'hold' : c.status === '판매완료' ? 'sold' : ''}">${esc(c.status)}</span>`;
    $('#list').innerHTML = rows.length ? rows.map(c => {
      const imgs = c.images || [];
      return `<article class="item" data-id="${esc(c.id)}">
        <div class="th ${c.cutout ? 'cut' : ''}">${imgs[0] ? `<img src="${esc(thumbOf(imgs[0]))}" alt="" loading="lazy">` : '사진 없음'}${imgs.length ? `<b>${imgs.length}장</b>` : ''}</div>
        <div>
          <h3>${esc(title(c))} ${tag(c)}${c.featured ? '<span class="tag star">메인 노출</span>' : ''}</h3>
          <p class="meta">${c.year}년식 · ${comma(c.mileage)}km${c.color ? ' · ' + esc(c.color) : ''}</p>
          <p class="price">${won(c.price || 0)}</p>
        </div>
        <div class="acts">
          <select data-act="status" aria-label="판매 상태">${['판매중', '예약중', '판매완료'].map(s => `<option ${s === c.status ? 'selected' : ''}>${s}</option>`).join('')}</select>
          <button class="icon ${c.featured ? 'on' : ''}" data-act="star" title="메인 화면 노출" aria-label="메인 화면 노출" aria-pressed="${!!c.featured}"><svg width="16" height="16" viewBox="0 0 16 16" fill="${c.featured ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.300"><path d="m8 1.800 1.900 3.900 4.300.6-3.100 3 .7 4.300L8 11.600l-3.800 2 .7-4.300-3.100-3 4.300-.6L8 1.800Z"/></svg></button>
          <a class="btn sm" href="index.html#car-${esc(c.id)}" target="_blank" rel="noopener">보기</a>
          <button class="btn sm" data-act="edit">수정</button>
          <button class="icon del" data-act="del" title="삭제" aria-label="삭제"><svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.400"><path d="M2.500 4h11M6 4V2.500h4V4m-6.500 0 .700 9.500h7.600l.7-9.500M6.500 6.500v4.500m3-4.500v4.500"/></svg></button>
        </div>
      </article>`;
    }).join('') : `<div class="empty"><b>${state.cars.length ? '조건에 맞는 매물이 없습니다.' : '아직 등록된 매물이 없습니다.'}</b>${state.cars.length ? '검색어나 필터를 바꿔 보세요.' : '오른쪽 위 "매물 등록" 버튼으로 첫 매물을 올려 보세요.'}</div>`;
  }
  $('#list').addEventListener('click', async e => {
    const b = e.target.closest('[data-act]'); if (!b || b.tagName === 'SELECT') return;
    const c = state.cars.find(x => x.id === b.closest('.item').dataset.id); if (!c) return;
    if (b.dataset.act === 'edit') return openEditor(c);
    if (b.dataset.act === 'star') return patch(c, { featured: !c.featured }, c.featured ? '메인 노출을 껐습니다.' : '메인 화면에 노출합니다.');
    if (b.dataset.act === 'del') {
      if (!await confirmBox(`${title(c)} 매물을 삭제할까요?`, '매물 정보와 사진이 모두 지워지며 되돌릴 수 없습니다.')) return;
      try { await api.remove(c.id); api.removeFiles(c.images || []).catch(() => {}); state.cars = state.cars.filter(x => x.id !== c.id); drawList(); toast('삭제했습니다.'); }
      catch (err) { toast(explain(err), true); }
    }
  });
  $('#list').addEventListener('change', e => {
    const s = e.target.closest('select[data-act=status]'); if (!s) return;
    const c = state.cars.find(x => x.id === s.closest('.item').dataset.id);
    if (c) patch(c, { status: s.value }, `상태를 "${s.value}"(으)로 바꿨습니다.`);
  });
  async function patch(c, change, msg) {
    try { Object.assign(c, await api.save({ id: c.id, ...change }, false)); toast(msg); }
    catch (err) { toast(explain(err), true); }
    drawList();
  }
  ['input', 'change'].forEach(ev => { $('#q').addEventListener(ev, drawList); $('#fModel').addEventListener(ev, drawList); $('#fStat').addEventListener(ev, drawList); });

  /* =====================================================
     상담 신청
     ===================================================== */
  let inqs = [];
  const fmtWhen = s => { const d = new Date(s), p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`; };
  async function refreshInq(quiet) {
    try { inqs = await api.inqList(); } catch (err) { if (!quiet) toast(explain(err), true); inqs = []; }
    drawInq();
  }
  function drawInq() {
    const q = $('#inqQ').value.trim().toLowerCase(), fs = $('#inqStat').value;
    const n = inqs.filter(r => r.status === '신규').length;
    $('#inqBadge').textContent = n; $('#inqBadge').hidden = !n;
    $('#inqTotal').textContent = inqs.length;
    $('#inqLine').textContent = `신규 ${n} · 연락 완료 ${inqs.filter(r => r.status === '연락 완료').length} · 종료 ${inqs.filter(r => r.status === '종료').length}`;
    const rows = inqs.filter(r => (!fs || r.status === fs) && (!q || `${r.name} ${r.phone} ${r.model} ${r.message} ${r.car_title} ${r.memo}`.toLowerCase().includes(q)));
    $('#inqList').innerHTML = rows.length ? rows.map(r => `
      <article class="inq ${r.status === '신규' ? 'new' : ''}" data-id="${esc(r.id)}">
        <div class="inq-top">
          <div><h3>${esc(r.name)} <a href="tel:${esc(String(r.phone).replace(/[^0-9+]/g, ''))}">${esc(r.phone)}</a><span class="tag ${r.status === '신규' ? 'hold' : r.status === '종료' ? 'sold' : ''}">${esc(r.status)}</span></h3><p class="when">${fmtWhen(r.created_at)} 접수</p></div>
          <div class="acts"><select data-act="status" aria-label="처리 상태">${['신규', '연락 완료', '종료'].map(s => `<option ${s === r.status ? 'selected' : ''}>${s}</option>`).join('')}</select>
          <button class="icon del" data-act="del" title="삭제" aria-label="삭제"><svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2.5 4h11M6 4V2.5h4V4m-6.5 0 .7 9.5h7.6l.7-9.5M6.5 6.5v4.5m3-4.5v4.5"/></svg></button></div>
        </div>
        <dl>
          ${r.car_title ? `<dt>문의 차량</dt><dd>${r.car_id ? `<a href="index.html#car-${esc(r.car_id)}" target="_blank" rel="noopener" style="text-decoration:underline">${esc(r.car_title)}</a>` : esc(r.car_title)}</dd>` : ''}
          ${r.model ? `<dt>관심 모델</dt><dd>${esc(r.model)}</dd>` : ''}
          ${r.visit_date ? `<dt>방문 희망일</dt><dd>${esc(r.visit_date)}</dd>` : ''}
          ${r.message ? `<dt>문의 내용</dt><dd>${esc(r.message)}</dd>` : ''}
        </dl>
        <input class="memo" data-act="memo" value="${esc(r.memo || '')}" placeholder="메모 (통화 내용, 방문 일정 등) — 입력 후 다른 곳을 누르면 저장" aria-label="메모">
      </article>`).join('') : `<div class="empty"><b>${inqs.length ? '조건에 맞는 상담 신청이 없습니다.' : '아직 접수된 상담 신청이 없습니다.'}</b>${inqs.length ? '' : '고객이 사이트에서 상담을 신청하면 여기에 쌓입니다.'}</div>`;
  }
  $('#inqList').addEventListener('change', async e => {
    const el = e.target.closest('[data-act]'); if (!el) return;
    const r = inqs.find(x => x.id === el.closest('.inq').dataset.id); if (!r) return;
    const change = el.dataset.act === 'status' ? { status: el.value } : el.dataset.act === 'memo' ? { memo: el.value.trim().slice(0, 500) } : null; if (!change) return;
    try { Object.assign(r, await api.inqSave(r.id, change)); toast(change.status ? `"${change.status}"(으)로 바꿨습니다.` : '메모를 저장했습니다.'); }
    catch (err) { toast(explain(err), true); }
    drawInq();
  });
  $('#inqList').addEventListener('click', async e => {
    const b = e.target.closest('button[data-act=del]'); if (!b) return;
    const r = inqs.find(x => x.id === b.closest('.inq').dataset.id); if (!r) return;
    if (!await confirmBox(`${r.name} 님의 상담 신청을 삭제할까요?`, '삭제하면 되돌릴 수 없습니다.')) return;
    try { await api.inqRemove(r.id); inqs = inqs.filter(x => x.id !== r.id); drawInq(); toast('삭제했습니다.'); } catch (err) { toast(explain(err), true); }
  });
  ['input', 'change'].forEach(ev => { $('#inqQ').addEventListener(ev, drawInq); $('#inqStat').addEventListener(ev, drawInq); });
  $('#inqReload').onclick = async () => { await refreshInq(); toast('새로 불러왔습니다.'); };
  $('#tabs').addEventListener('click', e => { const t = e.target.closest('.tab'); if (!t) return; show(t.dataset.tab); if (t.dataset.tab === 'vInq') refreshInq(); });

  /* =====================================================
     등록 · 수정
     ===================================================== */
  const form = $('#carForm');
  const SPEC = ['fuel', 'displacement', 'power', 'transmission', 'drive'];
  function fillTrims() {
    $('#trimList').innerHTML = Object.keys(PRESETS[form.model.value] || {}).map(t => `<option value="${esc(t)}">`).join('');
  }
  function applyPreset() {
    const set = PRESETS[form.model.value] || {}, key = Object.keys(set).find(k => k.toLowerCase() === form.trim.value.trim().toLowerCase());
    if (!key) return; let n = 0;
    SPEC.forEach(f => { if (!form[f].value.trim() && set[key][f]) { form[f].value = set[key][f]; n++; } });
    if (n) toast('제원을 자동으로 채웠습니다. 실제 차량과 맞는지 확인해 주세요.');
  }
  function priceHint() { const p = num(form.price.value); $('#priceHint').textContent = p ? won(p) : ''; }

  function openEditor(c) {
    state.editing = c || null; state.removed = []; state.dirty = false;
    form.reset(); $$('.f.bad', form).forEach(el => el.classList.remove('bad'));
    $('#editTitle').textContent = c ? `${title(c)} 수정` : '매물 등록';
    $('#saveBtn').textContent = c ? '수정 내용 저장' : '매물 등록';
    $('#progress').hidden = true;
    if (c) {
      ['model', 'trim', 'status', 'year', 'fuel', 'displacement', 'power', 'transmission', 'drive', 'color', 'interior', 'description'].forEach(k => { form[k].value = c[k] ?? ''; });
      form.month.value = c.month || ''; form.mileage.value = comma(c.mileage); form.price.value = comma(c.price);
      form.featured.checked = !!c.featured; form.cutout.checked = !!c.cutout;
      form.options.value = (c.options || []).join('\n');
      form.accident.value = c.history?.accident || ''; form.owners.value = c.history?.owners || ''; form.service.value = c.history?.service || '';
    } else { form.year.value = new Date().getFullYear(); }
    state.photos = (c?.images || []).map((url, i) => ({ key: 'o' + i, url, preview: thumbOf(url) }));
    fillTrims(); priceHint(); drawPhotos(); show('vEdit');
  }
  form.model.addEventListener('change', () => { fillTrims(); applyPreset(); });
  form.trim.addEventListener('change', applyPreset);
  form.price.addEventListener('input', priceHint);
  ['mileage', 'price'].forEach(k => form[k].addEventListener('blur', () => { const v = num(form[k].value); form[k].value = v ? comma(v) : ''; }));
  form.addEventListener('input', () => { state.dirty = true; });

  /* ---------- 사진 고르기 · 순서 바꾸기 ---------- */
  const drop = $('#drop'), fileInput = $('#fileInput'); let seq = 0, dragKey = null;
  function addFiles(files) {
    const imgs = [...files].filter(f => /^image\//.test(f.type) || /\.(jpe?g|png|webp|heic|heif)$/i.test(f.name));
    if (!imgs.length) return toast('사진 파일만 올릴 수 있습니다.', true);
    imgs.forEach(f => state.photos.push({ key: 'n' + (++seq), file: f, preview: URL.createObjectURL(f) }));
    state.dirty = true; drawPhotos();
    if (state.photos.length > 30) toast(`사진이 ${state.photos.length}장입니다. 30장 이하를 권장합니다.`);
  }
  drop.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => { addFiles(fileInput.files); fileInput.value = ''; });
  ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { if (dragKey) return; e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', e => { if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files); });

  function drawPhotos() {
    const n = state.photos.length;
    $('#photos').innerHTML = state.photos.map((p, i) => `
      <div class="ph ${i === 0 ? 'cover' : ''}" draggable="true" data-key="${p.key}">
        <img src="${esc(p.preview)}" alt="사진 ${i + 1}">
        <span class="no">${i === 0 ? '대표' : i + 1}</span>${p.file ? '<span class="new">NEW</span>' : ''}
        <div class="bar">
          <div><button type="button" data-mv="-1" aria-label="앞으로" ${i === 0 ? 'disabled style="opacity:.35"' : ''}><svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 1.500 3.500 7 9 12.500"/></svg></button>
          <button type="button" data-mv="1" aria-label="뒤로" ${i === n - 1 ? 'disabled style="opacity:.35"' : ''}><svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 1.500 10.500 7 5 12.500"/></svg></button></div>
          <button type="button" class="x" data-rm aria-label="사진 빼기"><svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2"><path d="m1.500 1.500 9 9m0-9-9 9"/></svg></button>
        </div>
      </div>`).join('');
  }
  const move = (from, to) => { if (to < 0 || to >= state.photos.length || from === to) return; const [p] = state.photos.splice(from, 1); state.photos.splice(to, 0, p); state.dirty = true; drawPhotos(); };
  $('#photos').addEventListener('click', e => {
    const tile = e.target.closest('.ph'); if (!tile) return;
    const i = state.photos.findIndex(p => p.key === tile.dataset.key), b = e.target.closest('button'); if (!b || i < 0) return;
    if (b.dataset.mv) return move(i, i + Number(b.dataset.mv));
    if ('rm' in b.dataset) { const [p] = state.photos.splice(i, 1); if (p.url) state.removed.push(p.url); state.dirty = true; drawPhotos(); }
  });
  $('#photos').addEventListener('dragstart', e => { const t = e.target.closest('.ph'); if (!t) return; dragKey = t.dataset.key; t.classList.add('drag'); e.dataTransfer.effectAllowed = 'move'; });
  $('#photos').addEventListener('dragover', e => { if (!dragKey) return; e.preventDefault(); $$('.ph.over').forEach(x => x.classList.remove('over')); e.target.closest('.ph')?.classList.add('over'); });
  $('#photos').addEventListener('drop', e => {
    if (!dragKey) return; e.preventDefault(); const t = e.target.closest('.ph');
    if (t) move(state.photos.findIndex(p => p.key === dragKey), state.photos.findIndex(p => p.key === t.dataset.key));
  });
  $('#photos').addEventListener('dragend', () => { dragKey = null; $$('.ph.drag,.ph.over').forEach(x => x.classList.remove('drag', 'over')); });

  /* ---------- 저장 ---------- */
  form.addEventListener('submit', async e => {
    e.preventDefault(); if (state.busy) return;
    $$('.f.bad', form).forEach(el => el.classList.remove('bad'));
    const need = [['model', v => !!v], ['trim', v => !!v.trim()], ['year', v => num(v) >= 1990 && num(v) <= 2100], ['mileage', v => v.trim() !== ''], ['price', v => num(v) > 0]];
    const bad = need.filter(([k, okFn]) => !okFn(form[k].value));
    if (bad.length) { bad.forEach(([k]) => form[k].closest('.f').classList.add('bad')); form[bad[0][0]].focus(); return toast('* 표시된 칸을 확인해 주세요.', true); }

    const cur = state.editing, isNew = !cur;
    const id = cur ? cur.id : `${form.model.value}-${num(form.year.value)}-${Math.random().toString(36).slice(2, 7)}`;
    const prog = $('#progress'), saveBtn = $('#saveBtn');
    state.busy = true; saveBtn.disabled = true; $('#cancelBtn').disabled = true;
    try {
      const fresh = state.photos.filter(p => p.file); let done = 0;
      if (fresh.length) { prog.hidden = false; prog.textContent = `사진 올리는 중 0 / ${fresh.length}`; }
      await pool(fresh, 3, async p => {
        const v = await variants(p.file);
        const base = `${id}/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
        const url = await api.upload(`${base}.${v.ext}`, v.full);
        await api.upload(`${base}_t.${v.ext}`, v.thumb);
        p.url = url; p.file = null;
        prog.textContent = `사진 올리는 중 ${++done} / ${fresh.length}`;
      });
      prog.hidden = false; prog.textContent = '매물 정보 저장 중';
      const row = {
        id, model: form.model.value, trim: form.trim.value.trim(), status: form.status.value,
        year: num(form.year.value), month: form.month.value ? Number(form.month.value) : null,
        mileage: num(form.mileage.value), price: num(form.price.value),
        fuel: form.fuel.value.trim(), displacement: form.displacement.value.trim(), power: form.power.value.trim(),
        transmission: form.transmission.value.trim(), drive: form.drive.value.trim(), color: form.color.value.trim(), interior: form.interior.value.trim(),
        featured: form.featured.checked, cutout: form.cutout.checked,
        images: state.photos.map(p => p.url).filter(Boolean),
        options: form.options.value.split(/[\n,]/).map(s => s.trim()).filter(Boolean),
        history: { accident: form.accident.value.trim(), owners: form.owners.value.trim(), service: form.service.value.trim() },
        description: form.description.value.trim()
      };
      const saved = await api.save(row, isNew);
      if (state.removed.length) api.removeFiles(state.removed).catch(() => {});
      if (isNew) state.cars.unshift(saved); else Object.assign(cur, saved);
      state.dirty = false; drawList(); show('vList');
      toast(isNew ? `${title(saved)} 매물을 등록했습니다.` : '수정 내용을 저장했습니다.');
    } catch (err) {
      console.error(err); drawPhotos(); prog.hidden = true; toast(explain(err), true);
    } finally { state.busy = false; saveBtn.disabled = false; $('#cancelBtn').disabled = false; }
  });
  async function leaveEditor() {
    if (state.busy) return;
    if (state.dirty && !await confirmBox('작성 중인 내용을 버릴까요?', '저장하지 않은 내용은 사라집니다.', '버리고 나가기')) return;
    state.dirty = false; show('vList');
  }
  $('#backBtn').onclick = leaveEditor; $('#cancelBtn').onclick = leaveEditor;
  $('#addBtn').onclick = () => openEditor(null);
  addEventListener('beforeunload', e => { if (state.dirty && !$('#vEdit').hidden) { e.preventDefault(); e.returnValue = ''; } });

  /* =====================================================
     로그인 · 시작
     ===================================================== */
  async function enter(label) {
    try {
      if (!state.demo && !(await api.isAdmin())) {
        await api.signOut(); show('vLogin');
        const el = $('#loginErr'); el.hidden = false; el.textContent = '이 계정은 관리자 목록에 없습니다. Supabase 의 admins 표에 이메일을 추가해 주세요.'; return;
      }
      $('#who').textContent = label; $('#who').hidden = false; $('#logout').hidden = state.demo;
      await refresh(); show('vList'); refreshInq(true);
    } catch (err) { show(state.demo ? 'vSetup' : 'vLogin'); const el = $('#loginErr'); el.hidden = false; el.textContent = explain(err); }
  }
  $('#loginForm').addEventListener('submit', async e => {
    e.preventDefault(); const f = e.target, btn = $('button', f), el = $('#loginErr'); el.hidden = true;
    if (!f.email.value.trim() || !f.password.value) { el.hidden = false; el.textContent = '이메일과 비밀번호를 입력해 주세요.'; return; }
    btn.disabled = true; btn.textContent = '로그인 중';
    try { const s = await api.signIn(f.email.value.trim(), f.password.value); f.password.value = ''; await enter(s.user.email); }
    catch (err) { el.hidden = false; el.textContent = explain(err); }
    btn.disabled = false; btn.textContent = '로그인';
  });
  $('#logout').onclick = async () => { try { await api.signOut(); } catch (_) {} $('#who').hidden = true; $('#logout').hidden = true; show('vLogin'); };
  $('#startDemo').onclick = () => { state.demo = true; api = demoApi(); $('#demoBar').hidden = false; enter('체험 모드'); };

  (async function boot() {
    $('#fModel').innerHTML = '<option value="">전체 모델</option>' + ORDER.map(k => `<option value="${k}">${MODELS[k]}</option>`).join('');
    form.model.innerHTML = '<option value="">선택</option>' + ORDER.map(k => `<option value="${k}">${MODELS[k]}</option>`).join('');
    form.month.innerHTML += Array.from({ length: 12 }, (_, i) => `<option value="${i + 1}">${i + 1}월</option>`).join('');
    if (!CONNECTED) return show('vSetup');
    api = supaApi();
    try { await api.init(); const s = await api.session(); if (s) return enter(s.user.email); }
    catch (err) { const el = $('#loginErr'); el.hidden = false; el.textContent = explain(err); }
    show('vLogin');
  })();
})();
