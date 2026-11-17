/* ============================================================
   品牌订货分销系统 · UI 组件库（零依赖）
   上海诩可科技有限公司
   ============================================================ */
window.UI = (function () {
  const SVG = 'http://www.w3.org/2000/svg';

  /* ---------- 图标 ---------- */
  const P = {
    home: ['M3 10.5 12 3l9 7.5', 'M5 9.5V21h14V9.5'],
    tag: ['M20.6 13.4 11 3.8H4v7l9.6 9.6a2 2 0 0 0 2.8 0l4.2-4.2a2 2 0 0 0 0-2.8z', ['c', 7.5, 7.5, 1.2]],
    users: ['M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2', ['c', 9, 7, 4], 'M23 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'],
    cart: ['M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6', ['c', 9, 21, 1.3], ['c', 20, 21, 1.3]],
    exchange: ['M23 4v6h-6', 'M1 20v-6h6', 'M3.5 9a9 9 0 0 1 14.9-3.4L23 10', 'M1 14l4.6 4.4A9 9 0 0 0 20.5 15'],
    layers: ['M12 2l10 5-10 5L2 7l10-5z', 'M2 12l10 5 10-5', 'M2 17l10 5 10-5'],
    file: ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6', 'M16 13H8', 'M16 17H8'],
    chart: ['M18 20V10', 'M12 20V4', 'M6 20v-6'],
    shield: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'],
    list: ['M8 6h13', 'M8 12h13', 'M8 18h13', 'M3 6h.01', 'M3 12h.01', 'M3 18h.01'],
    search: [['c', 11, 11, 7], 'M21 21l-4.3-4.3'],
    plus: ['M12 5v14', 'M5 12h14'],
    edit: ['M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z'],
    trash: ['M3 6h18', 'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2', 'M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6', 'M10 11v6', 'M14 11v6'],
    check: ['M20 6 9 17l-5-5'],
    x: ['M18 6 6 18', 'M6 6l12 12'],
    lock: ['M7 11V7a5 5 0 0 1 10 0v4', 'M5 11h14v10H5z'],
    download: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'M7 10l5 5 5-5', 'M12 15V3'],
    left: ['M15 18l-6-6 6-6'],
    right: ['M9 18l6-6-6-6'],
    down: ['M6 9l6 6 6-6'],
    logout: ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'M16 17l5-5-5-5', 'M21 12H9'],
    user: [['c', 12, 7, 4], 'M5.5 21a7.5 7.5 0 0 1 13 0'],
    eye: ['M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z', ['c', 12, 12, 3]],
    truck: ['M1 3h15v13H1z', 'M16 8h4l3 3v5h-7V8z', ['c', 5.5, 18.5, 2], ['c', 18.5, 18.5, 2]],
    alert: [['c', 12, 12, 10], 'M12 8v4', 'M12 16h.01'],
    info: [['c', 12, 12, 10], 'M12 16v-4', 'M12 8h.01'],
    box: ['M21 8l-9-5-9 5v8l9 5 9-5V8z', 'M3 8l9 5 9-5', 'M12 13v8'],
    calendar: ['M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z', 'M16 2v4', 'M8 2v4', 'M3 10h18'],
    phone: ['M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.4 2.1L8 9.7a16 16 0 0 0 6.3 6.3l1.3-1.3a2 2 0 0 1 2.1-.4c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z'],
    settings: ['M4 21v-7', 'M4 10V3', 'M12 21v-9', 'M12 8V3', 'M20 21v-5', 'M20 12V3', 'M1 14h6', 'M9 8h6', 'M17 16h6'],
    building: ['M6 2h12a1 1 0 0 1 1 1v18h-5v-4h-4v4H5V3a1 1 0 0 1 1-1z', 'M9 7h.01', 'M9 11h.01', 'M15 7h.01', 'M15 11h.01'],
    up: ['M23 6l-9.5 9.5-5-5L1 18', 'M17 6h6v6'],
    refresh: ['M23 4v6h-6', 'M1 20v-6h6', 'M3.5 9a9 9 0 0 1 14.9-3.4L23 10', 'M1 14l4.6 4.4A9 9 0 0 0 20.5 15'],
    copy: ['M9 9h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1z', 'M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1'],
    print: ['M6 9V2h12v7', 'M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2', 'M6 14h12v8H6z'],
  };
  function icon(name, cls) {
    const s = document.createElementNS(SVG, 'svg');
    s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('fill', 'none');
    s.setAttribute('stroke', 'currentColor'); s.setAttribute('stroke-width', '1.8');
    s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round');
    if (cls !== false) s.setAttribute('class', cls || 'icon');
    (P[name] || P.info).forEach(d => {
      if (Array.isArray(d)) { const c = document.createElementNS(SVG, 'circle'); c.setAttribute('cx', d[1]); c.setAttribute('cy', d[2]); c.setAttribute('r', d[3]); s.appendChild(c); }
      else { const p = document.createElementNS(SVG, 'path'); p.setAttribute('d', d); s.appendChild(p); }
    });
    return s;
  }

  /* ---------- DOM ---------- */
  function el(tag, attrs, ...kids) {
    const n = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === 'class') n.className = attrs[k];
      else if (k === 'html') n.innerHTML = attrs[k];
      else if (k === 'text') n.textContent = attrs[k];
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), attrs[k]);
      else if (k === 'style' && typeof attrs[k] === 'object') Object.assign(n.style, attrs[k]);
      else n.setAttribute(k, attrs[k]);
    }
    for (const kid of kids.flat(9)) {
      if (kid == null || kid === false) continue;
      n.appendChild(typeof kid === 'string' || typeof kid === 'number' ? document.createTextNode(kid) : kid);
    }
    return n;
  }
  function btn(label, iconName, opts = {}) {
    const b = el('button', { class: 'btn ' + (opts.cls || 'btn-ghost'), onclick: opts.onclick, ...(opts.disabled ? { disabled: '' } : {}) },
      iconName ? icon(iconName) : null, label);
    if (opts.sm) b.classList.add('btn-sm');
    if (opts.title) b.title = opts.title;
    return b;
  }

  /* ---------- Toast ---------- */
  let toastBox = null;
  function toast(msg, type = 'ok') {
    if (!toastBox) { toastBox = el('div', { class: 'toasts' }); document.body.appendChild(toastBox); }
    const t = el('div', { class: 'toast ' + type }, icon(type === 'ok' ? 'check' : type === 'err' ? 'alert' : 'info'), el('span', { text: msg }));
    toastBox.appendChild(t);
    setTimeout(() => { t.style.transition = '.3s'; t.style.opacity = '0'; setTimeout(() => t.remove(), 320); }, 2600);
  }

  /* ---------- 确认框 ---------- */
  function confirmBox(msg, onOk, title = '操作确认') {
    modal({ title, width: 420, body: el('div', { class: 'notice warn', style: { background: '#FBF1E2', color: '#9A5E0D' } }, icon('alert'), el('div', { text: msg })),
      okText: '确认', onOk: (close) => { close(); onOk && onOk(); } });
  }

  /* ---------- 弹窗 ---------- */
  function modal({ title, body, footer, width, onOk, okText = '保 存', cancelText = '取 消', noFooter }) {
    const mask = el('div', { class: 'mask' });
    const close = () => mask.remove();
    const m = el('div', { class: 'modal' + (width > 700 ? ' wide' : ''), style: width ? { width: width + 'px' } : null },
      el('div', { class: 'modal-hd' }, el('div', { class: 't', text: title }), el('button', { class: 'x', onclick: close }, icon('x'))),
      el('div', { class: 'modal-bd' }, body),
      noFooter ? null : el('div', { class: 'modal-ft' },
        footer || [el('button', { class: 'btn btn-ghost', onclick: close }, cancelText),
        onOk ? el('button', { class: 'btn btn-primary', onclick: () => onOk(close, m) }, okText) : null]));
    mask.appendChild(m);
    mask.addEventListener('click', e => { if (e.target === mask) close(); });
    document.body.appendChild(mask);
    return { close, el: m };
  }

  /* ---------- 表单弹窗 ---------- */
  function formModal({ title, fields, data = {}, onOk, width = 560, okText }) {
    const refs = {};
    function fieldWrap(f) {
      const lab = el('label', {}, f.label, f.required ? el('span', { class: 'req', text: '*' }) : null);
      let input;
      if (f.type === 'select') {
        input = el('select', { class: 'sel' }, f.options.map(o => el('option', { value: o.value, ...(String(data[f.key]) === String(o.value) ? { selected: '' } : {}) }, o.label)));
      } else if (f.type === 'textarea') {
        input = el('textarea', { class: 'ta', placeholder: f.placeholder || '' }); input.value = data[f.key] || '';
      } else if (f.type === 'colorpick') {
        input = el('input', { class: 'ipt', type: 'color' }); input.value = data[f.key] || '#1B1E24';
      } else {
        input = el('input', { class: 'ipt', type: f.type === 'number' ? 'number' : 'text', placeholder: f.placeholder || '' }); input.value = data[f.key] ?? f.value ?? '';
      }
      if (f.oninput) input.addEventListener('input', () => f.oninput(input.value, refs));
      refs[f.key] = input;
      const wrap = el('div', { class: 'field' + (f.full ? ' full' : '') }, lab, input,
        f.help ? el('div', { class: 'help', text: f.help }) : null, el('div', { class: 'err-msg', text: '请填写' + f.label }));
      return wrap;
    }
    const body = el('div', { class: 'form-grid' }, fields.map(fieldWrap));
    return modal({
      title, body, width, okText,
      onOk: (close) => {
        const val = {}; let bad = null;
        for (const f of fields) {
          const v = refs[f.key].value.trim();
          if (f.required && !v && v !== 0) { bad = refs[f.key].closest('.field'); }
          val[f.key] = f.type === 'number' ? Number(v || 0) : v;
        }
        if (bad) { bad.classList.add('err'); bad.scrollIntoView({ block: 'center' }); setTimeout(() => bad.classList.remove('err'), 1800); return; }
        onOk(val, close);
      },
    });
  }

  /* ---------- 抽屉 ---------- */
  function drawer(title, sub, buildBody, buildFoot) {
    const mask = el('div', { class: 'drawer-mask' });
    const close = () => { mask.remove(); d.remove(); };
    const d = el('aside', { class: 'drawer' },
      el('div', { class: 'drawer-hd' }, el('div', {}, el('div', { class: 't', text: title }), sub ? el('div', { class: 'card-sub', text: sub }) : null),
        el('button', { class: 'x', style: { width: '30px', height: '30px' }, onclick: close }, icon('x'))),
      el('div', { class: 'drawer-bd' }), buildFoot ? el('div', { class: 'drawer-ft' }) : null);
    mask.addEventListener('click', close);
    document.body.appendChild(mask); document.body.appendChild(d);
    buildBody(d.querySelector('.drawer-bd'));
    if (buildFoot) buildFoot(d.querySelector('.drawer-ft'), close);
    return { close, el: d };
  }

  /* ---------- 表格 ---------- */
  function table({ cols, rows, pageSize, toolbar, empty = '暂无数据', footNote, onRow }) {
    const state = { page: 1, kw: '' };
    const box = el('div', { class: 'card fade-in' });
    const hd = el('div', { class: 'card-hd', style: { display: 'none' } });
    const tb = el('div', { class: 'table-wrap' });
    const pg = el('div', { class: 'pager' });
    box.appendChild(hd); box.appendChild(tb); box.appendChild(pg);
    function render() {
      tb.innerHTML = '';
      let list = rows();
      if (state.kw) {
        const kw = state.kw.toLowerCase();
        list = list.filter(r => cols.some(c => String(c.raw ? c.raw(r) : (r[c.key] ?? '')).toLowerCase().includes(kw)));
      }
      const total = list.length, ps = pageSize || 0, pages = ps ? Math.max(1, Math.ceil(total / ps)) : 1;
      if (state.page > pages) state.page = pages;
      const view = ps ? list.slice((state.page - 1) * ps, state.page * ps) : list;
      if (!view.length) { tb.appendChild(el('div', { class: 'empty' }, icon('box'), el('div', { text: empty }))); }
      else {
        const t = el('table', { class: 'xk' });
        t.appendChild(el('thead', {}, el('tr', {}, cols.map(c => el('th', { text: c.label, style: c.w ? { width: c.w } : null })))));
        const tb2 = el('tbody');
        view.forEach((r, i) => {
          const tr = el('tr', { onclick: (e) => { if (e.target.closest('button,a,input,select')) return; onRow && onRow(r); }, ...(onRow ? { style: { cursor: 'pointer' } } : {}) },
            cols.map(c => {
              const td = el('td');
              const v = c.render ? c.render(r, ps ? (state.page - 1) * ps + i : i) : (r[c.key] ?? '');
              if (v instanceof Node) td.appendChild(v); else if (c.html) td.innerHTML = v; else td.textContent = v;
              if (c.strong) td.classList.add('strong');
              if (c.cls) td.className += ' ' + (typeof c.cls === 'function' ? c.cls(r) : c.cls);
              return td;
            }));
          tb2.appendChild(tr);
        });
        t.appendChild(tb2); tb.appendChild(t);
      }
      pg.innerHTML = '';
      if (ps && total > ps) {
        pg.appendChild(el('span', { text: `共 ${total} 条 · 第 ${state.page}/${pages} 页` }));
        pg.appendChild(el('button', { disabled: state.page <= 1 ? '' : null, onclick: () => { state.page--; render(); } }, icon('left')));
        pg.appendChild(el('button', { disabled: state.page >= pages ? '' : null, onclick: () => { state.page++; render(); } }, icon('right')));
      } else if (total) {
        pg.appendChild(el('span', { text: `共 ${total} 条` }));
      }
    }
    render();
    const inst = {
      el: box, render, rows,
      search(kw) { state.kw = kw; state.page = 1; render(); },
    };
    if (toolbar) {
      const node = toolbar(inst);
      if (node) { hd.appendChild(node); hd.style.display = 'flex'; }
    }
    if (footNote) box.appendChild(el('div', { class: 'pager', style: { justifyContent: 'flex-start', color: 'var(--mut)', fontSize: '12px' } }, footNote));
    return inst;
  }
  function searchBox(placeholder, onsearch) {
    const inp = el('input', { placeholder: placeholder || '搜索…' });
    inp.addEventListener('input', () => onsearch(inp.value.trim()));
    return el('div', { class: 'search-box' }, icon('search'), inp);
  }

  /* ---------- 徽标 ---------- */
  const TONES = { ok: 'b-ok', warn: 'b-warn', err: 'b-err', info: 'b-info', navy: 'b-navy', gold: 'b-gold', purple: 'b-purple', teal: 'b-teal', mut: 'b-mut' };
  function badge(text, tone = 'mut') { return el('span', { class: 'badge ' + (TONES[tone] || 'b-mut') }, text); }

  /* ---------- 图表：横向条形 ---------- */
  function hbars(data, fmt = v => v) {
    const max = Math.max(...data.map(d => d.value), 1);
    return el('div', { class: 'panel-body' },
      data.map(d => el('div', { class: 'hbar' },
        el('div', { class: 'lb', text: d.label, title: d.label }),
        el('div', { class: 'track' }, el('div', { class: 'fill', style: { width: (d.value / max * 100).toFixed(1) + '%' } })),
        el('div', { class: 'v', text: fmt(d.value) }))));
  }

  /* ---------- 图表：环形 ---------- */
  function donut(data, centerLabel, centerVal, fmt = v => v) {
    const R = 74, C = 2 * Math.PI * R;
    const palette = ['#B08A4F', '#2B3A55', '#8AA3BC', '#7C8A5E', '#71303A', '#9AA0A6', '#3B6BE8', '#B07C4E', '#6E4B31', '#25966B'];
    let acc = 0; const total = data.reduce((s, d) => s + d.value, 0) || 1;
    const svg = document.createElementNS(SVG, 'svg');
    svg.setAttribute('viewBox', '0 0 200 200'); svg.setAttribute('width', '100%'); svg.setAttribute('height', '200');
    data.forEach((d, i) => {
      const frac = d.value / total;
      const c = document.createElementNS(SVG, 'circle');
      c.setAttribute('cx', 100); c.setAttribute('cy', 100); c.setAttribute('r', R);
      c.setAttribute('fill', 'none'); c.setAttribute('stroke', palette[i % palette.length]);
      c.setAttribute('stroke-width', '22'); c.setAttribute('stroke-linecap', 'butt');
      c.setAttribute('stroke-dasharray', `${(frac * C).toFixed(2)} ${C.toFixed(2)}`);
      c.setAttribute('stroke-dashoffset', (-acc * C).toFixed(2));
      c.setAttribute('transform', 'rotate(-90 100 100)');
      c.appendChild(document.createTextNode(''));
      const ti = document.createElementNS(SVG, 'title'); ti.textContent = `${d.label}：${fmt(d.value)}`; c.appendChild(ti);
      svg.appendChild(c); acc += frac;
    });
    const t1 = document.createElementNS(SVG, 'text'); t1.setAttribute('x', 100); t1.setAttribute('y', 100); t1.setAttribute('text-anchor', 'middle'); t1.setAttribute('fill', '#1A2233'); t1.setAttribute('font-size', '21'); t1.setAttribute('font-weight', '700'); t1.setAttribute('font-family', 'DIN Alternate,sans-serif'); t1.textContent = centerVal;
    const t2 = document.createElementNS(SVG, 'text'); t2.setAttribute('x', 100); t2.setAttribute('y', 122); t2.setAttribute('text-anchor', 'middle'); t2.setAttribute('fill', '#8B94A7'); t2.setAttribute('font-size', '11.5'); t2.textContent = centerLabel;
    svg.appendChild(t1); svg.appendChild(t2);
    return el('div', { class: 'panel-body', style: { display: 'grid', gridTemplateColumns: '210px 1fr', alignItems: 'center', gap: '10px' } },
      svg,
      el('div', { class: 'legend', style: { flexDirection: 'column', gap: '9px' } },
        data.map((d, i) => el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
          el('i', { style: { background: palette[i % palette.length], width: '9px', height: '9px', borderRadius: '3px', display: 'inline-block' } }),
          el('span', { text: d.label, style: { color: '#4A5568', minWidth: '70px' } }),
          el('span', { class: 'num', text: fmt(d.value), style: { color: '#1A2233', fontWeight: '600', marginLeft: 'auto' } })))));
  }

  /* ---------- 图表：折线/面积 ---------- */
  function line(data, fmt = v => v, h = 210) {
    const W = 640, H = h, PL = 8, PB = 26, PT = 14;
    const max = Math.max(...data.map(d => d.value), 1) * 1.15;
    const xs = (i) => PL + i * ((W - PL * 2) / Math.max(data.length - 1, 1));
    const ys = (v) => PT + (1 - v / max) * (H - PT - PB);
    let path = '', area = '';
    const pts = data.map((d, i) => [xs(i), ys(d.value)]);
    pts.forEach((p, i) => {
      if (!i) { path += `M${p[0]},${p[1]}`; return; }
      const prev = pts[i - 1], cx = (prev[0] + p[0]) / 2;
      path += ` C${cx},${prev[1]} ${cx},${p[1]} ${p[0]},${p[1]}`;
    });
    area = path + ` L${pts[pts.length - 1][0]},${H - PB} L${pts[0][0]},${H - PB} Z`;
    const svg = document.createElementNS(SVG, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', '100%'); svg.setAttribute('height', h); svg.setAttribute('preserveAspectRatio', 'none');
    const defs = document.createElementNS(SVG, 'defs');
    defs.innerHTML = `<linearGradient id="lg${Date.now()%9999}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9A063" stop-opacity=".30"/><stop offset="1" stop-color="#C9A063" stop-opacity=".02"/></linearGradient>`;
    const gid = defs.querySelector('linearGradient').id;
    svg.appendChild(defs);
    const mk = (d, attrs) => { const n = document.createElementNS(SVG, d); for (const k in attrs) n.setAttribute(k, attrs[k]); return n; };
    // 网格
    [0.25, 0.5, 0.75].forEach(f => svg.appendChild(mk('line', { x1: 0, x2: W, y1: PT + f * (H - PT - PB), y2: PT + f * (H - PT - PB), stroke: '#EEF0F4', 'stroke-width': 1 })));
    svg.appendChild(mk('path', { d: area, fill: `url(#${gid})` }));
    svg.appendChild(mk('path', { d: path, fill: 'none', stroke: '#B08A4F', 'stroke-width': 2.2, 'stroke-linecap': 'round' }));
    data.forEach((d, i) => {
      if (data.length > 12 && i % 2) return;
      const tx = mk('text', { x: xs(i), y: H - 8, 'text-anchor': 'middle', 'font-size': 10.5, fill: '#8B94A7' }); tx.textContent = d.label; svg.appendChild(tx);
      const c = mk('circle', { cx: xs(i), cy: ys(d.value), r: 3, fill: '#fff', stroke: '#B08A4F', 'stroke-width': 2 });
      const ti = document.createElementNS(SVG, 'title'); ti.textContent = `${d.label}：${fmt(d.value)}`; c.appendChild(ti);
      svg.appendChild(c);
    });
    return el('div', { style: { padding: '6px 18px 12px' } }, svg);
  }

  /* ---------- Excel 导出（HTML 表格 .xls，带 BOM 中文兼容） ---------- */
  function exportXLS(filename, headers, rows, sheet = 'Sheet1') {
    const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>${sheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><style>td,th{border:.5pt solid #C0C4CC;padding:4px 8px;font-family:"Microsoft YaHei";font-size:12px}th{background:#1B2537;color:#F0E4CC}</style></head><body><table>${`<tr>${headers.map(h => `<th>${esc(h)}</th>`).join('')}</tr>`}${rows.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</table></body></html>`;
    const blob = new Blob(['\ufeff' + html], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = filename.endsWith('.xls') ? filename : filename + '.xls';
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 800);
  }

  function download(name, content, mime) {
    const blob = new Blob([content], { type: mime || 'text/plain' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 600);
  }

  /* ---------- 页脚（全站统一：诩可科技 技术支持） ---------- */
  function footer(extra) {
    return el('div', { class: 'page-foot' },
      el('div', {}, `© 2026 上海峰欧服饰有限公司 · 品牌订货分销系统 V1.0${extra ? '　|　' + extra : ''}`),
      el('div', { style: { marginTop: '4px' } }, el('span', { class: 'gold', text: '技术支持：诩可科技（上海诩可科技有限公司）' })));
  }

  /* ---------- 品类视觉底图（无外部图片，渐变生成） ---------- */
  const CAT_GRAD = {
    C1: ['linear-gradient(150deg,#2E3440,#4A5568)', '#2E3440'], C2: ['linear-gradient(150deg,#223A5E,#3E5C8A)', '#223A5E'],
    C3: ['linear-gradient(150deg,#5C3A2E,#8A5A44)', '#5C3A2E'], C4: ['linear-gradient(150deg,#3D4A3E,#6B7A5C)', '#3D4A3E'],
    C5: ['linear-gradient(150deg,#40495A,#68738A)', '#40495A'], C6: ['linear-gradient(150deg,#4E3A44,#7A5A68)', '#4E3A44'],
    C7: ['linear-gradient(150deg,#37474F,#607D8B)', '#37474F'], C8: ['linear-gradient(150deg,#2B3A55,#4A5B7D)', '#2B3A55'],
    C9: ['linear-gradient(150deg,#583A48,#84586C)', '#583A48'],
  };
  function catGrad(catId) { return (CAT_GRAD[catId] || CAT_GRAD.C1)[0]; }

  return { icon, el, btn, toast, confirm: confirmBox, modal, formModal, drawer, table, searchBox, badge, hbars, donut, line, exportXLS, download, footer, catGrad };
})();
