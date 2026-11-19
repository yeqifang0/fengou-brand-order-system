/* ============================================================
   品牌订货分销系统 · 经销商订货端
   上海诩可科技有限公司
   ============================================================ */
(function () {
  const { el, btn, icon, toast, modal, formModal, drawer, table, searchBox, badge, exportXLS, footer, catGrad } = UI;
  const U = XK.util;

  const sess = XK.session();
  if (!sess || sess.kind !== 'dealer') { location.replace('index.html'); return; }
  XK.load();
  const db = XK.db;
  const me = XK.dealer(sess.dealerId);
  const myTier = XK.tier(me.tierId);
  const CART_KEY = 'xk_cart_' + me.id;

  const OST = {
    pending: ['待审核', 'warn'], rejected: ['已驳回', 'err'], withdrawn: ['已撤回', 'mut'],
    audited: ['已审核', 'info'], locked: ['已锁款', 'navy'], producing: ['排产中', 'gold'], closed: ['已完成', 'ok'],
  };
  const AST = { pending: ['待审核', 'warn'], approved: ['已通过', 'ok'], rejected: ['已驳回', 'err'] };
  const obadge = s => badge(...(OST[s] || ['未知', 'mut']));

  /* ---------- 布局 ---------- */
  const PAGES = [['mall', '订货大厅'], ['orders', '我的订货单'], ['aftersale', '补货 · 退货'], ['inventory', '库存查询'], ['statements', '对账单'], ['account', '账户中心']];
  const body = el('div', { class: 'd-body' });
  const navEl = el('nav', { class: 'd-nav' });
  const cartBtn = el('button', { class: 'd-cart', title: '订货单（购物车）', onclick: openCart }, icon('cart'), el('span', { class: 'n', id: 'cartN' }));
  function refreshCart() {
    const cart = getCart();
    const n = document.getElementById('cartN');
    if (n) { n.textContent = cart.reduce((s, i) => s + i.qty, 0); n.style.display = cart.length ? '' : 'none'; }
  }
  function getCart() { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch (e) { return []; } }
  function setCart(c) { localStorage.setItem(CART_KEY, JSON.stringify(c)); refreshCart(); }

  const header = el('header', { class: 'd-header' },
    el('div', { class: 'd-top' },
      el('a', { class: 'd-brand', href: '#/mall' },
        el('img', { class: 'brand-img', src: 'assets/img/logo.png?v=2026b', alt: '峰欧服饰' }),
        el('div', { class: 'd-brand-sep' }),
        el('div', { style: { fontSize: '12.5px', color: 'var(--ink2)', letterSpacing: '.14em', fontWeight: 500 } }, '经销商订货平台')),
      navEl,
      el('div', { class: 'd-me' },
        el('span', { class: 'lvl', text: myTier.name }),
        el('span', { style: { fontSize: '12.5px', color: 'var(--ink2)' }, text: me.contact }),
        cartBtn,
        el('button', { class: 'btn btn-ghost btn-sm', onclick: () => { XK.logout(); XK.log('登录', '退出登录', me.name); location.href = 'index.html'; } }, icon('logout'), '退出'))));
  function buildNav() {
    PAGES.forEach(([k, t]) => navEl.appendChild(el('a', { href: '#/' + k, 'data-k': k }, t)));
  }
  buildNav();

  const main = el('div', {}, header, body,
    el('footer', { class: 'd-foot' },
      el('div', {}, '© 2026 上海峰欧服饰有限公司 · 峰欧 FENGOU 经销商订货平台 · ' + me.name),
      el('div', { style: { marginTop: '6px' } }, el('span', { class: 'gold', text: '技术支持：诩可科技' }))));
  document.body.prepend(main);

  function setPage() {
    const key = (location.hash.replace('#/', '') || 'mall').split('?')[0];
    const page = PAGES.some(p => p[0] === key) ? key : 'mall';
    navEl.querySelectorAll('a').forEach(a => a.classList.toggle('on', a.dataset.k === page));
    body.replaceChildren();
    R[page](body);
    refreshCart();
  }
  window.addEventListener('hashchange', () => setPage());

  /* ---------- 价格与库存 ---------- */
  const priceOf = st => XK.dealPrice(me, st);
  const myStyles = () => db.styles.filter(s => s.status === 'on');

  /* ================= 订货大厅 ================= */
  const R = {};
  R.mall = function (root) {
    let fSeason = 'S1', fCat = '', kw = '';
    const hero = el('div', { class: 'hero' },
      el('div', { class: 'k', text: '2026 AUTUMN / WINTER ORDERING' }),
      el('h1', { text: me.contact + '，欢迎回来' }),
      el('p', { text: '本季 ' + db.styles.filter(s => s.seasonId === 'S1').length + ' 个新款已上架，您的等级为「' + myTier.name + '」，按吊牌价 ' + (myTier.rate * 10).toFixed(1) + ' 折供货。祝订货愉快。' }),
      el('div', { class: 'acts' },
        btn('立即选款', 'cart', { cls: 'btn-primary', onclick: () => document.getElementById('mallGrid').scrollIntoView({ behavior: 'smooth' }) }),
        btn('查看我的订货单', 'file', { cls: 'btn-dark', onclick: () => location.hash = '#/orders' })));
    const filterBar = el('div', { class: 'toolbar filters' },
      (() => { const s = el('select', { class: 'sel' }, db.seasons.map(x => el('option', { value: x.id, ...(x.id === fSeason ? { selected: '' } : {}) }, x.name))); s.onchange = () => { fSeason = s.value; renderGrid(); }; return s; })(),
      (() => { const s = el('select', { class: 'sel' }, el('option', { value: '' }, '全部品类'), db.categories.map(c => el('option', { value: c.id }, c.name))); s.onchange = () => { fCat = s.value; renderGrid(); }; return s; })(),
      searchBox('搜索款号 / 款式名称', k => { kw = k; renderGrid(); }),
      el('div', { class: 'sp' }),
      el('span', { style: { fontSize: '12.5px', color: 'var(--mut)' } }, '价格为您的等级供货价'));
    const grid = el('div', { class: 'mall-grid', id: 'mallGrid' });
    root.appendChild(hero); root.appendChild(filterBar); root.appendChild(grid);
    function renderGrid() {
      grid.replaceChildren();
      const list = myStyles().filter(s => (!fSeason || s.seasonId === fSeason) && (!fCat || s.categoryId === fCat) &&
        (!kw || (s.code + s.name).toLowerCase().includes(kw.toLowerCase())));
      if (!list.length) { grid.appendChild(el('div', { class: 'empty card', style: { gridColumn: '1/-1', padding: '60px' } }, icon('box'), el('div', { text: '没有符合条件的款式' }))); return; }
      list.forEach(st => {
        const stock = XK.stockOfStyle(st);
        grid.appendChild(el('div', { class: 'goods', onclick: () => location.hash = '#/style?id=' + st.id },
          el('div', { class: 'pic', style: { background: catGrad(st.categoryId) } },
            st.isNew && fSeason === 'S1' ? el('span', { class: 'tagnew', text: '本季新品' }) : null,
            el('span', { class: 'wm', text: st.code.split('-')[1] || st.code }),
            el('span', { class: 'season', text: XK.season(st.seasonId)?.code + ' · ' + XK.category(st.categoryId)?.name })),
          el('div', { class: 'bd' },
            el('div', { class: 'nm', text: st.name }),
            el('div', { class: 'cd', text: st.code }),
            el('div', { class: 'sws' }, st.colorIds.map(cid => { const c = XK.color(cid); return el('span', { class: 'swatch', style: { background: c?.hex }, title: c?.name }); })),
            el('div', { class: 'pr' }, el('span', { class: 'sup' }, '¥', String(priceOf(st)), el('small', { text: ' 供货' })), el('span', { class: 'tag', text: '吊牌 ¥' + st.tagPrice })),
            el('span', { class: 'stock', text: stock.b > 0 ? '可订 ' + stock.b.toLocaleString() + ' 件' : '暂无可订库存' }))));
      });
    }
    renderGrid();
  };

  /* ================= 款式详情 / 尺码矩阵 ================= */
  R.style = function (root, params) {
    const st = XK.style(params.get('id'));
    if (!st) { root.appendChild(el('div', { class: 'empty' }, '款式不存在')); return; }
    const sizes = XK.sizesOf(st);
    let curColor = st.colorIds[0];
    const qty = {};
    const colorRow = el('div', { class: 'chips', style: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' } });
    function renderColors() {
      colorRow.replaceChildren();
      st.colorIds.forEach(cid => {
        const c = XK.color(cid);
        const b = el('button', { class: 'chip', type: 'button' },
          el('span', { class: 'swatch', style: { background: c?.hex, width: '18px', height: '18px' } }), ' ' + c?.name);
        if (cid === curColor) { b.style.borderColor = 'var(--gold2)'; b.style.background = '#FBF7EF'; b.style.color = '#8F6C33'; }
        b.onclick = () => { curColor = cid; renderColors(); renderMatrix(); };
        colorRow.appendChild(b);
      });
    }
    const mxBox = el('div', {});
    let sumQty = 0;
    function renderMatrix() {
      mxBox.replaceChildren();
      const tb = el('table', { class: 'mx' },
        el('thead', {}, el('tr', {}, el('th', { text: '尺码' }), sizes.map(s => el('th', { text: s })), el('th', { text: '行合计' }))),
        el('tbody', {},
          el('tr', {},
            el('td', { class: 'rowh' }, el('span', { class: 'swatch', style: { background: XK.color(curColor)?.hex, marginRight: '6px' } }), XK.color(curColor)?.name),
            sizes.map(sz => {
              const key = curColor + sz;
              const inp = el('input', { type: 'number', min: '0', value: qty[key] || '', placeholder: '0' });
              inp.oninput = () => { qty[key] = Math.max(0, Number(inp.value) || 0); footSum(); };
              return el('td', {}, inp);
            }),
            el('td', {}, el('span', { class: 'tot', id: 'rowSum' }, '0')))));
      mxBox.appendChild(el('div', { class: 'matrix' }, tb));
      mxBox.appendChild(el('div', { class: 'mx-foot' },
        el('div', { class: 'seg' },
          btn('均码配比', null, { sm: true, cls: '', onclick: () => { sizes.forEach(s => qty[curColor + s] = 10); renderMatrix(); footSum(); } }),
          btn('流行配比', null, { sm: true, cls: '', onclick: () => { const pop = [10, 20, 20, 12, 6]; sizes.forEach((s, i) => qty[curColor + s] = pop[Math.min(i, 4)] || 0); renderMatrix(); footSum(); } }),
          btn('清空', null, { sm: true, cls: '', onclick: () => { sizes.forEach(s => delete qty[curColor + s]); renderMatrix(); footSum(); } })),
        el('div', { class: 'sum', id: 'mxSum', html: '本款合计 <b>0</b> 件' })));
      footSum();
      function footSum() {
        let row = 0, all = 0;
        sizes.forEach(s => { row += qty[curColor + s] || 0; });
        st.colorIds.forEach(cid => sizes.forEach(s => all += qty[cid + s] || 0));
        const rs = mxBox.querySelector('#rowSum'); if (rs) rs.textContent = row;
        const ms = mxBox.querySelector('#mxSum'); if (ms) ms.innerHTML = '本款合计 <b>' + all + '</b> 件　·　金额 <b class="gold">¥' + (all * priceOf(st)).toLocaleString() + '</b>';
      }
    }
    const stock = XK.stockOfStyle(st);
    root.appendChild(el('div', { style: { marginBottom: '16px' } }, btn('← 返回订货大厅', 'left', { sm: true, onclick: () => location.hash = '#/mall' })));
    root.appendChild(el('div', { class: 'goods-detail fade-in' },
      el('div', { class: 'gd-pic', style: { background: catGrad(st.categoryId) } },
        el('span', { style: { position: 'absolute', right: '22px', bottom: '14px', fontFamily: 'var(--num)', fontSize: '40px', fontWeight: 700, color: 'rgba(255,255,255,.18)' }, text: st.code }),
        el('span', { style: { color: 'rgba(255,255,255,.85)', fontSize: '11px', letterSpacing: '.16em' }, text: XK.season(st.seasonId)?.code + ' · ' + XK.brand(st.brandId)?.name })),
      el('div', { class: 'gd-info' },
        el('div', {}, obadge(st.seasonId === 'S1' ? 'locked' : 'closed'), el('span', { style: { marginLeft: '8px', color: 'var(--mut)', fontSize: '12px' } }, '款号 ', st.code)),
        el('h1', { text: st.name }),
        el('div', { class: 'sub', text: st.desc }),
        el('div', { class: 'price-row' },
          el('div', {}, el('b', { text: '我的供货价（' + myTier.name + '）' }), el('div', { class: 'v' }, '¥', String(priceOf(st)))),
          el('div', {}, el('b', { text: '吊牌价' }), el('div', { class: 'v mut' }, '¥', String(st.tagPrice))),
          el('div', {}, el('b', { text: '可订库存' }), el('div', { class: 'v', style: { color: stock.b ? '#1A2233' : '#CE4B3F' } }, stock.b.toLocaleString(), el('small', { text: ' 件' })))),
        el('div', { style: { fontWeight: 600, marginBottom: '10px' } }, '① 选择颜色'),
        colorRow,
        el('div', { style: { fontWeight: 600, margin: '4px 0 10px' } }, '② 录入尺码配比'),
        mxBox,
        el('div', { style: { marginTop: '18px', display: 'flex', gap: '10px' } },
          btn('加入订货单', 'cart', { cls: 'btn-primary', onclick: addToCart }),
          btn('查看订货单', 'file', { onclick: openCart })))));
    renderColors(); renderMatrix();
    function addToCart() {
      const items = [];
      st.colorIds.forEach(cid => sizes.forEach(sz => {
        const q = qty[cid + sz] || 0;
        if (q > 0) items.push({ styleId: st.id, colorId: cid, size: sz, qty: q, price: priceOf(st) });
      }));
      if (!items.length) { toast('请先录入订货数量', 'warn'); return; }
      const cart = getCart();
      items.forEach(it => {
        const ex = cart.find(c => c.styleId === it.styleId && c.colorId === it.colorId && c.size === it.size);
        if (ex) ex.qty += it.qty; else cart.push(it);
      });
      setCart(cart);
      toast('已加入订货单：' + items.reduce((s, i) => s + i.qty, 0) + ' 件');
    }
  };

  /* ---------- 订货单（购物车）抽屉 ---------- */
  function openCart() {
    const render = (box, close) => {
      const cart = getCart();
      box.replaceChildren();
      if (!cart.length) { box.appendChild(el('div', { class: 'empty' }, icon('cart'), el('div', { text: '订货单为空，去订货大厅选款吧' }))); return; }
      const sumQty = cart.reduce((s, i) => s + i.qty, 0);
      const sumAmt = cart.reduce((s, i) => s + i.qty * i.price, 0);
      const used = XK.creditUsed(me.id), left = me.creditLimit - used;
      box.appendChild(table({
        rows: () => getCart(),
        cols: [
          { label: '款式', render: r => el('span', {}, el('b', {}, XK.style(r.styleId)?.code + ' ' + XK.style(r.styleId)?.name), el('div', { style: { fontSize: '11.5px', color: '#98A1B3' } }, XK.color(r.colorId)?.name + ' / ' + r.size)) },
          { label: '单价', render: r => U.money0(r.price) },
          { label: '数量', render: r => { const i = el('input', { class: 'ipt', type: 'number', min: '1', style: { width: '72px', height: '32px' } }); i.value = r.qty; i.oninput = () => { r.qty = Math.max(1, Number(i.value) || 1); setCart(getCart().map(x => (x.styleId === r.styleId && x.colorId === r.colorId && x.size === r.size) ? r : x)); sums(); }; return i; } },
          { label: '小计', render: r => el('span', { class: 'num strong', id: 'sub-' + r.styleId + r.colorId + r.size }, U.money0(r.qty * r.price)) },
          { label: '', render: r => btn('', 'trash', { sm: true, cls: 'btn-danger', onclick: () => { setCart(getCart().filter(x => !(x.styleId === r.styleId && x.colorId === r.colorId && x.size === r.size))); render(box, close); sums(); } }) },
        ],
      }).el);
      const sumBox = el('div', {});
      function sums() {
        const c = getCart();
        const q = c.reduce((s, i) => s + i.qty, 0), a = c.reduce((s, i) => s + i.qty * i.price, 0);
        sumBox.innerHTML = '';
        sumBox.appendChild(el('div', { class: 'kv' }, el('b', { text: '合计数量' }), el('span', { text: q + ' 件' })));
        sumBox.appendChild(el('div', { class: 'kv' }, el('b', { text: '订单金额' }), el('span', { class: 'num', style: { color: '#8F6C33', fontWeight: 700, fontSize: '16px' }, text: U.money0(a) })));
        sumBox.appendChild(el('div', { class: 'kv' }, el('b', { text: '授信额度' }), el('span', { text: '剩余 ' + U.money0(Math.max(0, left)) + '（本单 ' + U.money0(a) + '）' })));
        if (a > left) sumBox.appendChild(el('div', { class: 'notice warn', style: { marginTop: '10px' } }, icon('alert'), el('div', { text: '超出剩余授信额度，无法提交。请联系品牌方调整额度或减少订货量。' })));
      }
      sums();
      box.appendChild(sumBox);
    };
    drawer('我的订货单', '确认无误后提交品牌方审核', render, (foot, close) => {
      foot.appendChild(btn('清空订货单', 'trash', { cls: 'btn-danger', onclick: () => { setCart([]); close(); toast('已清空', 'warn'); } }));
      foot.appendChild(btn('继续选款', 'left', { onclick: close }));
      foot.appendChild(btn('提交订货单', 'check', { cls: 'btn-primary', onclick: () => submitCart(close) }));
    });
  }
  function submitCart(close) {
    const cart = getCart();
    if (!cart.length) { toast('订货单为空', 'warn'); return; }
    const amt = cart.reduce((s, i) => s + i.qty * i.price, 0);
    const left = me.creditLimit - XK.creditUsed(me.id);
    if (amt > left) { toast('超出剩余授信 ' + U.money0(left) + '，无法提交', 'err'); return; }
    const items = cart.map(i => ({ ...i, amount: i.qty * i.price }));
    db.orders.push({
      id: 'O' + Date.now(), no: XK.nextNo('order'), dealerId: me.id, type: 'order', status: 'pending',
      items, totalQty: items.reduce((s, i) => s + i.qty, 0), totalAmount: amt,
      remark: '', createdAt: U.now(), hist: [{ a: 'submitted', at: U.now(), by: me.name }],
    });
    XK.log('订货管理', '提交订货单', db.orders[db.orders.length - 1].no + ' · ¥' + amt);
    XK.save(); setCart([]); close(); refreshCart();
    toast('订货单已提交，等待品牌方审核');
    location.hash = '#/orders';
  }

  /* ================= 我的订货单 ================= */
  R.orders = function (root) {
    const mine = () => db.orders.filter(o => o.dealerId === me.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    let cur = 'all';
    const FILTERS = [['all', '全部'], ['pending', '待审核'], ['audited', '已审核'], ['locked', '已锁款'], ['producing', '排产中'], ['closed', '已完成'], ['rejected', '已驳回']];
    const tabBar = el('div', { class: 'tabs' });
    function renderTabs() {
      tabBar.replaceChildren();
      FILTERS.forEach(([k, t]) => {
        const n = k === 'all' ? mine().length : mine().filter(o => o.status === k).length;
        tabBar.appendChild(el('div', { class: 'tab' + (k === cur ? ' on' : ''), onclick: () => { cur = k; renderTabs(); tbl.render(); } }, el('span', { text: t }), n ? el('span', { class: 'cnt', text: String(n) }) : null));
      });
    }
    const tbl = table({
      pageSize: 10,
      rows: () => mine().filter(o => cur === 'all' || o.status === cur),
      cols: [
        { label: '订单号', key: 'no', strong: true },
        { label: '数量', render: r => el('span', { class: 'num' }, r.totalQty, ' 件') },
        { label: '金额', render: r => el('span', { class: 'num strong' }, U.money0(r.totalAmount)) },
        { label: '状态', render: r => obadge(r.status) },
        { label: '提交时间', render: r => r.createdAt },
        { label: '操作', render: r => el('span', {},
          btn('明细', 'eye', { sm: true, onclick: () => detail(r) }),
          r.status === 'pending' ? btn('撤回', 'x', { sm: true, cls: 'btn-danger', onclick: () => UI.confirm('确认撤回订单 ' + r.no + '？撤回后需重新提交。', () => { r.status = 'withdrawn'; r.hist.push({ a: 'withdrawn', at: U.now(), by: me.name }); XK.log('订货管理', '撤回订货单', r.no); XK.save(); setPage(); toast('已撤回', 'warn'); }) }) : null) },
      ],
      onRow: r => detail(r),
      toolbar: t => el('div', { class: 'toolbar', style: { padding: '14px 22px 0' } },
        searchBox('搜索订单号', kw => t.search(kw)), el('div', { class: 'sp' }),
        btn('导出我的订单', 'download', { onclick: () => exportXLS('我的订货单_' + me.code, ['订单号', '数量', '金额', '状态', '时间'], mine().map(o => [o.no, o.totalQty, o.totalAmount, OST[o.status]?.[0], o.createdAt])) })),
    });
    renderTabs();
    root.appendChild(el('div', { class: 'mini-stats fade-in', style: { marginBottom: '4px' } },
      stat('累计订货', mine().length + '<small> 单</small>'),
      stat('订货金额', U.money0(mine().filter(o => !['rejected', 'withdrawn'].includes(o.status)).reduce((s, o) => s + o.totalAmount, 0))),
      stat('在途订单', String(mine().filter(o => ['audited', 'locked', 'producing'].includes(o.status)).length) + '<small> 单</small>')));
    function stat(t, v) { return el('div', { class: 'card', style: { padding: '14px 18px' } }, el('div', { style: { fontSize: '12px', color: 'var(--mut)' }, text: t }), el('div', { class: 'v num', html: v, style: { fontSize: '19px', fontWeight: 700, marginTop: '4px' } })); }
    root.appendChild(tabBar); root.appendChild(tbl.el);
    function detail(o) {
      drawer(o.no, (obadge(o.status)).textContent + ' · ' + o.createdAt, body => {
        body.appendChild(el('div', { class: 'desc' },
          dg('订单金额', U.money0(o.totalAmount)), dg('数量', o.totalQty + ' 件'),
          dg('备注', o.remark || '—'), dg('状态', OST[o.status]?.[0])));
        function dg(k, v) { return el('div', { class: 'd' }, el('b', { text: k }), el('span', { text: v })); }
        body.appendChild(table({
          rows: () => o.items,
          cols: [
            { label: '款号', render: r => XK.style(r.styleId)?.code, strong: true },
            { label: '款式', render: r => XK.style(r.styleId)?.name },
            { label: '颜色', render: r => { const c = XK.color(r.colorId); return el('span', {}, el('span', { class: 'swatch', style: { background: c?.hex, marginRight: '6px' } }), c?.name); } },
            { label: '尺码', render: r => r.size }, { label: '数量', render: r => r.qty },
            { label: '单价', render: r => U.money0(r.price) }, { label: '小计', render: r => el('span', { class: 'num strong' }, U.money0(r.amount)) },
          ],
        }).el);
        const ACT = { submitted: '提交订单', audited: '品牌方审核通过', rejected: '品牌方驳回', locked: '锁款', producing: '排产', closed: '完成', withdrawn: '撤回' };
        body.appendChild(el('div', { class: 'card-title', text: '流转进度', style: { margin: '18px 0 12px' } }));
        body.appendChild(el('div', { class: 'tl' }, o.hist.map(h => el('div', { class: 'tl-i on' }, el('div', { class: 't', text: ACT[h.a] || h.a }), el('div', { class: 's', text: h.at + ' · ' + h.by })))));
      }, (foot, close) => {
        foot.appendChild(btn('导出明细', 'download', { onclick: () => exportXLS(o.no, ['款号', '款式', '颜色', '尺码', '数量', '单价', '小计'], o.items.map(i => [XK.style(i.styleId)?.code, XK.style(i.styleId)?.name, XK.color(i.colorId)?.name, i.size, i.qty, i.price, i.amount])) }));
        foot.appendChild(btn('关闭', null, { onclick: close }));
      });
    }
  };

  /* ================= 补货 · 退货 ================= */
  R.aftersale = function (root) {
    const myRe = () => db.reorders.filter(a => a.dealerId === me.id);
    const myRt = () => db.returns.filter(a => a.dealerId === me.id);
    const abadge = s => badge(...(AST[s] || ['未知', 'mut']));
    const box = el('div', {});
    const tabBar = el('div', { class: 'tabs' }, [
      el('div', { class: 'tab on', onclick: () => sw(true) }, '补货申请', badge(String(myRe().filter(x => x.status === 'pending').length), 'warn')),
      el('div', { class: 'tab', onclick: () => sw(false) }, '退货申请', badge(String(myRt().filter(x => x.status === 'pending').length), 'warn')),
    ]);
    let isRe = true;
    function sw(v) { isRe = v; tabBar.querySelectorAll('.tab').forEach((t, i) => t.classList.toggle('on', (i === 0) === v)); tbl.render(); }
    const tbl = table({
      pageSize: 10,
      rows: () => (isRe ? myRe() : myRt()).slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      cols: [
        { label: '申请单号', key: 'no', strong: true },
        { label: '关联订单', render: r => r.refOrderNo || '—' },
        { label: '款式', render: r => r.items.map(i => XK.style(i.styleId)?.code).join('、') },
        { label: '数量', render: r => r.totalQty + ' 件' },
        { label: '金额', render: r => U.money0(r.totalAmount) },
        { label: '原因', render: r => el('span', { style: { maxWidth: '220px', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, title: r.reason }, r.reason) },
        { label: '状态', render: r => abadge(r.status) },
        { label: '时间', render: r => r.createdAt },
      ],
      toolbar: t => el('div', { class: 'toolbar', style: { padding: '14px 22px 0' } },
        searchBox('搜索单号', kw => t.search(kw)), el('div', { class: 'sp' }),
        btn('新建退货申请', 'exchange', { onclick: newApp(false) }),
        btn('新建补货申请', 'refresh', { cls: 'btn-primary', onclick: newApp(true) })),
      footNote: isRe ? '补货：对已审核订单中的动销款追加返单，品牌方审核通过后锁定库存。' : '退货：对滞销/错发款发起申请，品牌方审核通过后恢复库存。',
    });
    root.appendChild(el('div', { class: 'notice info', style: { marginTop: '16px' } }, icon('info'), el('div', {}, el('b', {}, '补货：'), '适合动销快的款式追加返单；', el('b', {}, '退货：'), '适合滞销码退回品牌方。均可关联原订单，加快审核。')));
    root.appendChild(tabBar); root.appendChild(tbl.el);
    function newApp(isReplenish) {
      return () => {
        formModal({
          title: isReplenish ? '新建补货申请' : '新建退货申请', width: 520,
          fields: [
            { key: 'refOrderNo', label: '关联订单（选填）', type: 'select', options: [{ value: '', label: '不关联' }, ...db.orders.filter(o => o.dealerId === me.id && !['pending', 'rejected', 'withdrawn'].includes(o.status)).slice(0, 30).map(o => ({ value: o.no, label: o.no + '（' + U.money0(o.totalAmount) + '）' }))] },
            { key: 'styleId', label: '款式', type: 'select', required: true, options: myStyles().map(s => ({ value: s.id, label: `${s.code} ${s.name}` })) },
            { key: 'colorId', label: '颜色', type: 'select', required: true, options: [] },
            { key: 'size', label: '尺码', type: 'select', required: true, options: [] },
            { key: 'qty', label: '数量（件）', type: 'number', required: true, value: 10 },
            { key: 'reason', label: '申请原因', type: 'textarea', required: true, full: true },
          ],
          onOk: (v, close) => {
            const st = XK.style(v.styleId);
            const item = { styleId: v.styleId, colorId: v.colorId, size: v.size, qty: v.qty, price: priceOf(st), amount: priceOf(st) * v.qty };
            const app = {
              id: (isReplenish ? 'RE' : 'RT') + Date.now(), no: XK.nextNo(isReplenish ? 'replenish' : 'return'),
              dealerId: me.id, type: isReplenish ? 'replenish' : 'return', refOrderNo: v.refOrderNo,
              items: [item], totalQty: v.qty, totalAmount: item.amount, status: 'pending',
              reason: v.reason, createdAt: U.now(), hist: [{ a: 'submitted', at: U.now(), by: me.name }],
            };
            (isReplenish ? db.reorders : db.returns).push(app);
            XK.log('补退管理', isReplenish ? '新建补货申请' : '新建退货申请', app.no);
            XK.save(); close(); setPage(); toast('申请已提交，等待品牌方审核');
          },
        });
        // 级联：颜色 / 尺码 跟随款式
        const sel = document.querySelectorAll('.modal .sel');
        const styleSel = sel[1], colorSel = sel[2], sizeSel = sel[3];
        function fill() {
          const st = XK.style(styleSel.value); if (!st) return;
          colorSel.innerHTML = '';
          st.colorIds.forEach(c => colorSel.appendChild(el('option', { value: c }, XK.color(c)?.name)));
          sizeSel.innerHTML = '';
          XK.sizesOf(st).forEach(s => sizeSel.appendChild(el('option', { value: s }, s)));
        }
        styleSel.addEventListener('change', fill); fill();
      };
    }
  };

  /* ================= 库存查询 ================= */
  R.inventory = function (root) {
    root.appendChild(el('div', { class: 'notice info', style: { marginTop: '16px' } }, icon('layers'), el('div', {}, '可订库存为品牌方当前可供您下单的数量；订单审核通过后会锁定相应数量。')));
    root.appendChild(table({
      pageSize: 12,
      rows: () => Object.entries(db.inv).flatMap(([code, c]) => {
        const p = code.split('-'); const sz = p.pop(); const ci = p.pop(); const sc = p.join('-');
        const st = XK.styleByCode(sc);
        return st && st.status === 'on' ? [{ code, st, ci, sz, ...c }] : [];
      }),
      cols: [
        { label: '款号', render: r => el('span', {}, el('b', {}, r.st.code), el('div', { style: { fontSize: '11.5px', color: '#98A1B3' } }, r.st.name)) },
        { label: '颜色', render: r => { const c = XK.color(r.ci); return el('span', {}, el('span', { class: 'swatch', style: { background: c?.hex, marginRight: '6px' } }), c?.name); } },
        { label: '尺码', render: r => r.sz },
        { label: '可订库存', render: r => el('span', { class: 'num strong', style: { color: r.b ? '' : '#CE4B3F' } }, r.b.toLocaleString()) },
        { label: '现货库存', render: r => el('span', { class: 'num' }, r.s.toLocaleString()) },
        { label: '状态', render: r => badge(r.b ? '可订' : '无货', r.b ? 'ok' : 'err') },
        { label: '', render: r => btn('去订货', 'cart', { sm: true, cls: 'btn-ok', onclick: () => location.hash = '#/style?id=' + r.st.id }) },
      ],
      toolbar: t => el('div', { class: 'toolbar', style: { padding: '14px 22px 0' } },
        searchBox('搜索款号 / SKU', kw => t.search(kw)), el('div', { class: 'sp' }),
        btn('导出查询结果', 'download', { onclick: () => exportXLS('库存查询_' + me.code, ['SKU', '款号', '款式', '颜色', '尺码', '可订', '现货'], Object.entries(db.inv).flatMap(([code, c]) => { const p = code.split('-'); const sz = p.pop(); const ci = p.pop(); const sc = p.join('-'); const st = XK.styleByCode(sc); return st ? [[code, sc, st.name, XK.color(ci)?.name, sz, c.b, c.s]] : []; })) })),
    }).el);
  };

  /* ================= 对账单 ================= */
  R.statements = function (root) {
    const mine = () => db.statements.filter(s => s.dealerId === me.id).sort((a, b) => b.no.localeCompare(a.no));
    root.appendChild(table({
      rows: mine,
      cols: [
        { label: '对账单号', key: 'no', strong: true },
        { label: '账期', key: 'period' },
        { label: '订单数', render: r => r.orderIds.length + ' 单' },
        { label: '对账金额', render: r => el('span', { class: 'num strong' }, U.money(r.amount)) },
        { label: '状态', render: r => badge(r.status === 'confirmed' ? '已确认' : '待确认', r.status === 'confirmed' ? 'ok' : 'warn') },
        { label: '生成时间', render: r => r.createdAt },
        { label: '操作', render: r => el('span', {},
          btn('查看', 'eye', { sm: true, onclick: () => detail(r) }),
          r.status !== 'confirmed' ? btn('确认对账', 'check', { sm: true, cls: 'btn-ok', onclick: () => UI.confirm('确认对账单 ' + r.no + '，金额 ' + U.money(r.amount) + '？', () => { r.status = 'confirmed'; r.confirmAt = U.now(); XK.log('对账结算', '经销商确认对账单', r.no); XK.save(); setPage(); toast('已确认对账'); }) }) : null,
          btn('导出', 'download', { sm: true, onclick: () => exportOne(r) })) },
      ],
      onRow: r => detail(r),
      toolbar: t => el('div', { class: 'toolbar', style: { padding: '14px 22px 0' } }, searchBox('搜索单号', kw => t.search(kw))),
      footNote: '对账单由品牌方按月生成，请核对后确认；如有异议请联系品牌方商务。',
    }).el);
    function exportOne(s) {
      const os = s.orderIds.map(id => db.orders.find(o => o.id === id)).filter(Boolean);
      exportXLS('对账单_' + s.no, ['序', '订单号', '金额', '数量', '日期'],
        [['', '经销商：' + me.name, '', '', ''], ['', '账期：' + s.period, '', '', ''],
        ...os.map((o, i) => [i + 1, o.no, o.totalAmount, o.totalQty, o.createdAt.slice(0, 10)]),
        ['', '合计', s.amount, os.reduce((a, o) => a + o.totalQty, 0), '']], '对账单');
    }
    function detail(s) {
      const os = s.orderIds.map(id => db.orders.find(o => o.id === id)).filter(Boolean);
      drawer(s.no, '账期 ' + s.period + ' · ' + (s.status === 'confirmed' ? '已确认' : '待确认'), body => {
        body.appendChild(el('div', { class: 'desc' },
          dg('账期', s.period), dg('订单数', os.length + ' 单'), dg('对账金额', U.money(s.amount)), dg('状态', s.status === 'confirmed' ? '已确认（' + s.confirmAt + '）' : '待确认')));
        function dg(k, v) { return el('div', { class: 'd' }, el('b', { text: k }), el('span', { text: v })); }
        body.appendChild(table({
          rows: () => os,
          cols: [
            { label: '订单号', key: 'no', strong: true }, { label: '数量', render: r => r.totalQty },
            { label: '金额', render: r => el('span', { class: 'num strong' }, U.money0(r.totalAmount)) },
            { label: '状态', render: r => obadge(r.status) }, { label: '日期', render: r => r.createdAt.slice(0, 10) },
          ],
        }).el);
      }, (foot, close) => {
        foot.appendChild(btn('导出', 'download', { onclick: () => { exportOne(s); } }));
        if (s.status !== 'confirmed') foot.appendChild(btn('确认对账', 'check', { cls: 'btn-primary', onclick: () => { s.status = 'confirmed'; s.confirmAt = U.now(); XK.log('对账结算', '经销商确认对账单', s.no); XK.save(); close(); setPage(); toast('已确认对账'); } }));
        else foot.appendChild(btn('关闭', null, { onclick: close }));
      });
    }
  };

  /* ================= 账户中心 ================= */
  R.account = function (root) {
    const used = XK.creditUsed(me.id);
    const myOrders = db.orders.filter(o => o.dealerId === me.id && !['rejected', 'withdrawn'].includes(o.status));
    root.appendChild(el('div', { class: 'goods-detail fade-in' },
      el('div', { class: 'card', style: { padding: '24px' } },
        el('div', { style: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' } },
          el('div', { style: { width: '52px', height: '52px', borderRadius: '16px', background: 'var(--navy)', color: 'var(--gold2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 700 } }, me.name[0]),
          el('div', {}, el('div', { style: { fontSize: '17px', fontWeight: 700 } }, me.name),
            el('div', { style: { color: 'var(--mut)', fontSize: '12.5px', marginTop: '3px' } }, me.code + ' · ' + me.region))),
        el('div', { class: 'kv' }, el('b', { text: '经销等级' }), el('span', {}, badge(myTier.name, 'gold'), '　' + (myTier.rate * 10).toFixed(1) + ' 折供货（吊牌价基础）')),
        el('div', { class: 'kv' }, el('b', { text: '联系人' }), el('span', { text: me.contact })),
        el('div', { class: 'kv' }, el('b', { text: '联系电话' }), el('span', { class: 'num', text: me.phone })),
        el('div', { class: 'kv' }, el('b', { text: '登录账号' }), el('span', { class: 'num', text: me.account.username })),
        el('div', { style: { marginTop: '16px' } },
          el('div', { style: { fontSize: '12.5px', color: 'var(--mut)', display: 'flex', justifyContent: 'space-between' } },
            el('span', { text: '授信额度使用' }), el('span', { class: 'num', text: U.money0(used) + ' / ' + U.money0(me.creditLimit) })),
          el('div', { class: 'credit-bar' }, el('i', { style: { width: Math.min(100, used / me.creditLimit * 100) + '%' } })),
          el('div', { style: { fontSize: '11.5px', color: 'var(--mut)' } }, '在途订单（已审核/锁款/排产）占用授信；提交新订单时系统自动校验。')),
        el('div', { style: { marginTop: '18px' } }, btn('更新联系信息', 'edit', { onclick: () => formModal({ title: '更新联系信息', width: 420, fields: [{ key: 'contact', label: '联系人', required: true, value: me.contact }, { key: 'phone', label: '联系电话', required: true, value: me.phone }, { key: 'region', label: '区域', value: me.region }], onOk: (v, c) => { Object.assign(me, v); XK.log('账户中心', '更新联系信息'); XK.save(); c(); setPage(); toast('已更新'); } }) }))),
      el('div', {},
        el('div', { class: 'mini-stats', style: { marginBottom: '16px' } },
          stat('累计订货', myOrders.length + '<small> 单</small>'),
          stat('累计金额', U.money0(myOrders.reduce((s, o) => s + o.totalAmount, 0))),
          stat('待审核', String(db.orders.filter(o => o.dealerId === me.id && o.status === 'pending').length) + '<small> 单</small>')),
        (() => {
          const st = db.styles.filter(s => me.customPricing.some(p => p.styleId === s.id));
          if (!st.length) return el('div', { class: 'card', style: { padding: '20px' } },
            el('div', { class: 'card-title', text: '专属定价款式', style: { marginBottom: '10px' } }),
            el('div', { style: { color: 'var(--mut)', fontSize: '13px' } }, '当前没有专属定价款式，全部按「' + myTier.name + '」' + (myTier.rate * 10).toFixed(1) + ' 折供货。'));
          return el('div', { class: 'card', style: { padding: '20px' } },
            el('div', { class: 'card-title', text: '专属定价款式', style: { marginBottom: '10px' } }),
            el('div', { style: { color: 'var(--mut)', fontSize: '12px', marginBottom: '8px' } }, '以下款式按品牌方为您设定的专属价供货：'),
            table({
              rows: () => me.customPricing.map(p => ({ ...p, st: XK.style(p.styleId) })),
              cols: [
                { label: '款号', render: r => r.st?.code, strong: true }, { label: '款式', render: r => r.st?.name },
                { label: '吊牌价', render: r => U.money0(r.st?.tagPrice) },
                { label: '等级价', render: r => U.money0(Math.round((r.st?.tagPrice || 0) * myTier.rate)) },
                { label: '专属价', render: r => el('b', { class: 'num', style: { color: '#8F6C33' } }, U.money0(r.price)) },
              ],
            }).el);
          })())));
    function stat(t, v) { return el('div', { class: 'card', style: { padding: '14px 18px' } }, el('div', { style: { fontSize: '12px', color: 'var(--mut)' }, text: t }), el('div', { class: 'v num', html: v, style: { fontSize: '19px', fontWeight: 700, marginTop: '4px' } })); }
  };

  /* ---------- 路由分发 ---------- */
  const origSet = setPage;
  setPage = function () {
    const raw = location.hash.replace('#/', '') || 'mall';
    const [key, qs] = raw.split('?');
    if (key === 'style') {
      body.replaceChildren();
      R.style(body, new URLSearchParams(qs || ''));
      navEl.querySelectorAll('a').forEach(a => a.classList.remove('on'));
      refreshCart(); return;
    }
    origSet();
  };
  setPage();
})();
