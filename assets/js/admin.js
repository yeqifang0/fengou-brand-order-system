/* ============================================================
   品牌订货分销系统 · 管理后台（框架 / 工作台 / 基础资料 / 经销商）
   上海诩可科技有限公司
   ============================================================ */
window.ADM = { pages: {} };
(function () {
  const { el, btn, icon, toast, modal, formModal, drawer, table, searchBox, badge, hbars, donut, line, exportXLS, footer, catGrad } = UI;
  const U = XK.util;

  const sess = XK.session();
  if (!sess || sess.kind !== 'admin') { location.replace('index.html'); return; }
  XK.load();

  /* ---------- 状态字典 ---------- */
  const OST = {
    pending: ['待审核', 'warn'], rejected: ['已驳回', 'err'], withdrawn: ['已撤回', 'mut'],
    audited: ['已审核', 'info'], locked: ['已锁款', 'navy'], producing: ['排产中', 'gold'], closed: ['已完成', 'ok'],
  };
  const AST = { pending: ['待审核', 'warn'], approved: ['已通过', 'ok'], rejected: ['已驳回', 'err'] };
  const TIER_TONE = { T1: 'gold', T2: 'navy', T3: 'mut' };
  ADM.OST = OST; ADM.AST = AST; ADM.TIER_TONE = TIER_TONE;
  ADM.badgeOf = (map, s) => badge(...(map[s] || ['未知', 'mut']));

  /* ---------- 布局 ---------- */
  const NAV = [
    { grp: '总览' },
    { id: 'dashboard', label: '工作台', icon: 'home' },
    { grp: '商品' },
    { id: 'base', label: '基础资料', icon: 'tag' },
    { grp: '渠道' },
    { id: 'dealers', label: '经销商管理', icon: 'users' },
    { grp: '交易' },
    { id: 'orders', label: '订货管理', icon: 'cart' },
    { id: 'aftersale', label: '补货 · 退换货', icon: 'exchange' },
    { grp: '仓储与财务' },
    { id: 'inventory', label: '库存管理', icon: 'layers' },
    { id: 'statements', label: '对账结算', icon: 'file' },
    { grp: '分析与系统' },
    { id: 'reports', label: '报表中心', icon: 'chart' },
    { id: 'perms', label: '权限管理', icon: 'shield' },
    { id: 'logs', label: '操作日志', icon: 'list' },
  ];
  const TITLES = {
    dashboard: ['工作台', '经营总览与待办'], base: ['基础资料', '品牌 · 品类 · 季节 · 颜色 · 尺码组 · SKU 档案'],
    dealers: ['经销商管理', '档案 · 分级 · 单独定价 · 授信额度'], orders: ['订货管理', '预订单审核 · 锁款 · 排产标记'],
    aftersale: ['补货 · 退换货', '申请单审核流程'], inventory: ['库存管理', '可订库存 · 现货 · 锁定'],
    statements: ['对账结算', '经销商对账单 · 明细导出'], reports: ['报表中心', '订货汇总 · 经销商统计 · 款式销量'],
    perms: ['权限管理', '多角色账号 · 数据隔离'], logs: ['操作日志', '全系统操作留痕'],
  };

  const side = el('aside', { class: 'side' });
  const main = el('div', { class: 'main' });
  const content = el('div', { class: 'content' });
  const crumb = el('div', { class: 'crumb' });
  const crumbSub = el('small');
  const bellBadge = el('span', { class: 'n' });

  function pendingCount() {
    const db = XK.db;
    return db.orders.filter(o => o.status === 'pending').length +
      db.reorders.filter(o => o.status === 'pending').length + db.returns.filter(o => o.status === 'pending').length;
  }

  function buildNav() {
    const nav = el('nav', { class: 'nav' });
    NAV.forEach(n => {
      if (n.grp) { nav.appendChild(el('div', { class: 'nav-group', text: n.grp })); return; }
      const item = el('div', { class: 'nav-item', onclick: () => { location.hash = '#/' + n.id; } }, icon(n.icon), el('span', { text: n.label }));
      if (n.id === 'orders') { item.dataset.cnt = '1'; item.appendChild(el('span', { class: 'cnt', id: 'navCntOrders' })); }
      nav.appendChild(item); n._el = item;
    });
    return nav;
  }
  side.appendChild(el('div', { class: 'side-brand' },
    el('div', { class: 'logo-plate', style: { height: '64px' } }, el('img', { src: 'assets/img/logo.png', alt: '峰欧服饰', style: { height: '100%', width: 'auto', display: 'block' } })),
    el('div', { class: 't1', text: '订货分销系统' }),
    el('div', { class: 't2', text: 'FENGOU · B2B ORDER' })));
  side.appendChild(buildNav());
  const roleLabel = sess.role === 'admin' ? '系统管理员' : '运营';
  if (sess.role !== 'admin') { // 运营隐藏权限管理
    const p = NAV.find(n => n.id === 'perms'); if (p && p._el) p._el.style.display = 'none';
  }
  side.appendChild(el('div', { class: 'side-user' },
    el('div', { class: 'av', text: sess.name[0] }),
    el('div', {}, el('div', { class: 'n', text: sess.name }), el('div', { class: 'r', text: roleLabel })),
    el('button', { class: 'out', title: '退出登录', onclick: () => { XK.logout(); XK.log('登录', '退出登录'); location.href = 'index.html'; } }, icon('logout'))));

  /* 通知铃铛 */
  const bell = el('button', { class: 'bell' }, icon('alert'), bellBadge);
  const bellMenu = el('div', { class: 'bell-menu' });
  function refreshBell() {
    const db = XK.db;
    const po = db.orders.filter(o => o.status === 'pending').length;
    const pr = db.reorders.filter(o => o.status === 'pending').length;
    const pt = db.returns.filter(o => o.status === 'pending').length;
    const total = po + pr + pt;
    bellBadge.textContent = total; bellBadge.style.display = total ? '' : 'none';
    const c1 = document.getElementById('navCntOrders'); if (c1) { c1.textContent = po; c1.style.display = po ? '' : 'none'; }
    bellMenu.innerHTML = '';
    [['待审核订货单 ' + po + ' 单', 'orders', 'cart'], ['待审核补货申请 ' + pr + ' 单', 'aftersale', 'refresh'], ['待审核退货申请 ' + pt + ' 单', 'aftersale', 'exchange']].forEach(([t, page, ic]) => {
      bellMenu.appendChild(el('button', { class: 'bi', onclick: () => { bellMenu.classList.remove('open'); location.hash = '#/' + page; } }, icon(ic), el('span', { text: t })));
    });
  }
  bell.appendChild(bellMenu);
  bell.onclick = (e) => { e.stopPropagation(); bellMenu.classList.toggle('open'); };
  document.addEventListener('click', () => bellMenu.classList.remove('open'));

  const topbar = el('header', { class: 'topbar' }, crumb, crumbSub,
    el('div', { class: 'right' },
      el('span', { class: 'top-date', text: U.now().slice(0, 10) + ' · 演示环境' }),
      el('div', { style: { position: 'relative' } }, bell)));
  main.appendChild(topbar); main.appendChild(content);

  function setPage() {
    const key = (location.hash.replace('#/', '') || 'dashboard').split('?')[0];
    const page = ADM.pages[key] ? key : 'dashboard';
    const [t, s] = TITLES[page];
    crumb.textContent = ''; crumb.appendChild(document.createTextNode(t)); crumb.appendChild(crumbSub); crumbSub.textContent = s;
    NAV.forEach(n => n._el && n._el.classList.toggle('on', n.id === page));
    content.replaceChildren();
    ADM.pages[page](content);
    content.appendChild(footer());
    refreshBell();
  }
  window.addEventListener('hashchange', setPage);

  document.body.prepend(el('div', { class: 'app' }, side, main));
  ADM.refresh = () => { refreshBell(); setPage(); };

  /* ================= 工作台 ================= */
  ADM.pages.dashboard = function (root) {
    const db = XK.db;
    const valid = db.orders.filter(o => !['pending', 'rejected', 'withdrawn'].includes(o.status));
    const seasonTotal = valid.reduce((s, o) => s + o.totalAmount, 0);
    const skuOn = db.styles.reduce((s, st) => { const k = XK.stockOfStyle(st); return s + (k.b > 0 ? st.colorIds.length * XK.sizesOf(st).length : 0); }, 0);

    // 近 30 天订货曲线
    const days = [];
    for (let i = 29; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push(U.dstr(d)); }
    const byDay = days.map(d => ({ label: d.slice(5), value: valid.filter(o => o.createdAt.slice(0, 10) === d).reduce((s, o) => s + o.totalAmount, 0) }));

    // 品类占比
    const catMap = {};
    valid.forEach(o => o.items.forEach(it => {
      const st = XK.style(it.styleId); if (!st) return;
      catMap[st.categoryId] = (catMap[st.categoryId] || 0) + it.amount;
    }));
    const catData = Object.entries(catMap).map(([cid, v]) => ({ label: XK.category(cid)?.name || cid, value: v })).sort((a, b) => b.value - a.value).slice(0, 7);

    // 经销商 TOP5
    const dealerMap = {};
    valid.forEach(o => dealerMap[o.dealerId] = (dealerMap[o.dealerId] || 0) + o.totalAmount);
    const topDealers = Object.entries(dealerMap).map(([id, v]) => ({ label: XK.dealer(id)?.name || id, value: v })).sort((a, b) => b.value - a.value).slice(0, 5);

    root.appendChild(el('div', { class: 'kpis fade-in' },
      kpi('本季订货总额', U.money0(seasonTotal), 'info', '近90天有效订单合计', '+12.4%'),
      kpi('待审核订单', String(db.orders.filter(o => o.status === 'pending').length), 'warn', '含补货 ' + db.reorders.filter(o => o.status === 'pending').length + ' 单 · 退货 ' + db.returns.filter(o => o.status === 'pending').length + ' 单'),
      kpi('经销商', String(db.dealers.filter(d => d.status === 'active').length), 'ok', '金牌 ' + db.dealers.filter(d => d.tierId === 'T1').length + ' · 银牌 ' + db.dealers.filter(d => d.tierId === 'T2').length + ' · 铜牌 ' + db.dealers.filter(d => d.tierId === 'T3').length),
      kpi('在售 SKU', String(skuOn), 'gold', '款式 ' + db.styles.filter(s => s.status === 'on').length + ' 个 · 可订状态')));
    function kpi(lb, v, tone, sub, delta) {
      const icons = { info: 'chart', warn: 'alert', ok: 'users', gold: 'box' };
      return el('div', { class: 'kpi' },
        el('div', { class: 'lb' }, icon(icons[tone]), lb),
        el('div', { class: 'v num', text: v }),
        el('div', { class: 'delta' }, delta ? el('span', {}, el('b', { class: 'up', text: delta }), '　' + sub) : sub));
    }

    root.appendChild(el('div', { class: 'grid-2' },
      card('近 30 天订货金额趋势', '单位：元（已审核及之后状态订单）', line(byDay, v => U.money0(v))),
      card('品类销售占比', '按订单金额统计', donut(catData, '订货总额', U.money0(seasonTotal), U.money0))));
    root.appendChild(el('div', { class: 'grid-2b' },
      card('经销商订货 TOP 5', '按累计订货金额', hbars(topDealers, v => U.money0(v))),
      card('最新订货单', '点击单号进入审核',
        (() => {
          const t = table({
            cols: [
              { label: '订单号', key: 'no', strong: true },
              { label: '经销商', render: r => XK.dealer(r.dealerId)?.name || '-' },
              { label: '金额', render: r => el('span', { class: 'num', text: U.money0(r.totalAmount) }), cls: 'strong' },
              { label: '状态', render: r => ADM.badgeOf(OST, r.status) },
              { label: '时间', render: r => r.createdAt },
            ],
            rows: () => [...db.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 7),
          });
          return t.el;
        })())));
    function card(title, sub, body) {
      return el('div', { class: 'card' }, el('div', { class: 'card-hd' }, el('div', {}, el('div', { class: 'card-title', text: title }), el('div', { class: 'card-sub', text: sub }))), body);
    }
  };

  /* ================= 基础资料 ================= */
  ADM.pages.base = function (root) {
    const db = XK.db;
    const wrap = el('div', {});
    const tabs = [['styles', '款式档案'], ['brands', '品牌'], ['cats', '品类'], ['seasons', '季节'], ['colors', '颜色'], ['sizes', '尺码组'], ['tiers', '折扣阶梯']];
    let cur = 'styles';
    const tabBar = el('div', { class: 'tabs' }, tabs.map(([k, t]) => {
      const b = el('div', { class: 'tab' + (k === cur ? ' on' : ''), text: t, onclick: () => { cur = k; tabBar.querySelectorAll('.tab').forEach((x, i) => x.classList.toggle('on', tabs[i][0] === k)); render(); } });
      return b;
    }));
    wrap.appendChild(tabBar);
    const box = el('div', {}); wrap.appendChild(box);
    root.appendChild(wrap);

    function render() {
      box.replaceChildren();
      if (cur === 'styles') renderStyles(box);
      else if (cur === 'brands') simpleCRUD(box, 'brands', '品牌', [{ key: 'code', label: '品牌编码' }, { key: 'name', label: '品牌名称' }, { key: 'remark', label: '备注', full: true }]);
      else if (cur === 'cats') simpleCRUD(box, 'categories', '品类', [{ key: 'code', label: '品类编码' }, { key: 'name', label: '品类名称' }]);
      else if (cur === 'seasons') simpleCRUD(box, 'seasons', '季节', [{ key: 'code', label: '季节编码' }, { key: 'name', label: '季节名称' }, { key: 'active', label: '状态', type: 'select', options: [{ value: 'true', label: '启用' }, { value: 'false', label: '停用' }] }], r => ({ ...r, active: String(r.active) }), v => ({ ...v, active: v.active === 'true' }));
      else if (cur === 'colors') simpleCRUD(box, 'colors', '颜色', [{ key: 'code', label: '颜色编码' }, { key: 'name', label: '颜色名称' }, { key: 'hex', label: '色值', type: 'colorpick' }]);
      else if (cur === 'sizes') simpleCRUD(box, 'sizeGroups', '尺码组', [{ key: 'code', label: '组编码' }, { key: 'name', label: '组名称' }, { key: 'sizes', label: '尺码（逗号分隔）', full: true, help: '例如：S,M,L,XL,XXL 或 26,28,30,32' }]);
      else if (cur === 'tiers') simpleCRUD(box, 'tiers', '折扣阶梯', [{ key: 'name', label: '阶梯名称' }, { key: 'rate', label: '折扣率', type: 'number', help: '如 0.42 表示吊牌价 4.2 折供货' }, { key: 'remark', label: '说明', full: true }]);
    }

    /* --- 款式档案 --- */
    function renderStyles(box) {
      const tbl = table({
        pageSize: 10,
        rows: () => [...db.styles].sort((a, b) => b.code.localeCompare(a.code)),
        cols: [
          { label: '款号', key: 'code', strong: true, w: '110px' },
          { label: '款式名称', key: 'name', strong: true },
          { label: '品牌', render: r => XK.brand(r.brandId)?.name },
          { label: '品类', render: r => XK.category(r.categoryId)?.name },
          { label: '季节', render: r => XK.season(r.seasonId)?.name },
          { label: '吊牌价', render: r => el('span', { class: 'num', text: U.money0(r.tagPrice) }) },
          {
            label: '颜色', render: r => el('span', {}, r.colorIds.map(cid => { const c = XK.color(cid); return el('span', { class: 'swatch', style: { background: c?.hex, marginLeft: '3px' }, title: c?.name }); }))
          },
          { label: '尺码组', render: r => XK.sizeGroup(r.sizeGroupId)?.name },
          { label: '可订库存', render: r => { const k = XK.stockOfStyle(r); return el('span', { class: 'num', text: k.b.toLocaleString(), style: { color: k.b > 500 ? '' : '#C97D15' } }); } },
          { label: '状态', render: r => badge(r.status === 'on' ? '上架' : '下架', r.status === 'on' ? 'ok' : 'mut') },
          {
            label: '操作', render: r => el('span', {},
              btn('编辑', 'edit', { sm: true, onclick: e => { e.stopPropagation(); styleForm(r); } }),
              btn(r.status === 'on' ? '下架' : '上架', r.status === 'on' ? 'x' : 'up', { sm: true, onclick: e => { e.stopPropagation(); r.status = r.status === 'on' ? 'off' : 'on'; XK.log('基础资料', '款式' + (r.status === 'on' ? '上架' : '下架'), r.code); XK.save(); tbl.render(); toast('已' + (r.status === 'on' ? '上架' : '下架') + '：' + r.name); } }))
          },
        ],
        onRow: r => styleDetail(r),
        toolbar: (t) => el('div', { class: 'toolbar', style: { padding: '14px 22px 0' } },
          searchBox('搜索款号 / 名称', kw => t.search(kw)),
          el('div', { class: 'sp' }),
          btn('导出款式档案', 'download', { onclick: () => exportStyles() }),
          btn('新增款式', 'plus', { cls: 'btn-primary', onclick: () => styleForm(null) })),
      });
      box.appendChild(tbl.el);
    }
    function exportStyles() {
      exportXLS('款式档案_' + U.dstr(new Date()), ['款号', '款式名称', '品牌', '品类', '季节', '吊牌价', '尺码组', '颜色', '状态'],
        db.styles.map(s => [s.code, s.name, XK.brand(s.brandId)?.name, XK.category(s.categoryId)?.name, XK.season(s.seasonId)?.name, s.tagPrice, XK.sizeGroup(s.sizeGroupId)?.name, s.colorIds.map(c => XK.color(c)?.name).join('/'), s.status === 'on' ? '上架' : '下架']), '款式档案');
      toast('已导出款式档案');
    }
    function styleForm(st) {
      const isNew = !st;
      const colorKeys = new Set(st ? st.colorIds : []);
      formModal({
        title: isNew ? '新增款式' : '编辑款式 · ' + st.code, width: 640,
        fields: [
          { key: 'code', label: '款号', required: true, placeholder: '如 FO26A-110', value: st?.code },
          { key: 'name', label: '款式名称', required: true, value: st?.name },
          { key: 'brandId', label: '品牌', type: 'select', options: db.brands.map(b => ({ value: b.id, label: b.name })), value: st?.brandId || 'B1' },
          { key: 'categoryId', label: '品类', type: 'select', options: db.categories.map(c => ({ value: c.id, label: c.name })), value: st?.categoryId },
          { key: 'seasonId', label: '季节', type: 'select', options: db.seasons.map(s => ({ value: s.id, label: s.name })), value: st?.seasonId || 'S1' },
          { key: 'sizeGroupId', label: '尺码组', type: 'select', options: db.sizeGroups.map(g => ({ value: g.id, label: g.name + '（' + g.sizes.join('/') + '）' })), value: st?.sizeGroupId || 'G1' },
          { key: 'tagPrice', label: '吊牌价（元）', type: 'number', required: true, value: st?.tagPrice },
          { key: 'desc', label: '卖点描述', full: true, value: st?.desc },
        ],
        onOk: (v, close) => {
          if (!v.categoryId || !v.sizeGroupId) { toast('请选择品类与尺码组', 'warn'); return; }
          // 颜色选择区单独处理
          const picked = [...colorBox.querySelectorAll('.chip.on')].map(c => c.dataset.id);
          if (!picked.length) { toast('请至少选择一个颜色', 'warn'); return; }
          let target = st;
          if (isNew) {
            if (db.styles.some(s => s.code === v.code)) { toast('款号已存在', 'err'); return; }
            target = { id: 'ST' + Date.now(), colorIds: [], customPricing: [], status: 'on', isNew: true, createdAt: U.now().slice(0, 10) };
            db.styles.push(target);
          }
          Object.assign(target, v, { colorIds: picked });
          // 为新 SKU 初始化库存
          target.colorIds.forEach(cid => XK.sizesOf(target).forEach(sz => {
            const k = XK.skuCode(target.code, cid, sz);
            if (!db.inv[k]) db.inv[k] = { b: 800, s: 100, l: 0 };
          }));
          XK.log('基础资料', isNew ? '新增款式' : '编辑款式', target.code + ' ' + target.name);
          XK.save(); close(); setPage();
          toast((isNew ? '已新增款式：' : '已保存款式：') + target.name);
        },
      });
      // 注入颜色选择 chips 到表单
      const body = document.querySelector('.modal .form-grid');
      const colorBox = el('div', { class: 'chips', style: { display: 'flex', flexWrap: 'wrap', gap: '7px' } },
        db.colors.map(c => {
          const b = el('button', { class: 'chip' + (colorKeys.has(c.id) ? ' on' : ''), 'data-id': c.id, type: 'button', style: colorKeys.has(c.id) ? { borderColor: 'var(--gold2)', color: '#8F6C33', background: '#FBF7EF' } : {} },
            el('span', { class: 'swatch', style: { background: c.hex, marginRight: '6px' } }), c.name);
          b.onclick = () => { colorKeys.has(c.id) ? colorKeys.delete(c.id) : colorKeys.add(c.id); b.classList.toggle('on'); b.style.borderColor = b.classList.contains('on') ? 'var(--gold2)' : ''; b.style.background = b.classList.contains('on') ? '#FBF7EF' : ''; b.style.color = b.classList.contains('on') ? '#8F6C33' : ''; };
          return b;
        }));
      body.insertBefore(el('div', { class: 'field full' }, el('label', {}, '颜色', el('span', { class: 'req', text: '*' })), colorBox, el('div', { class: 'help', text: '点击选择/取消颜色，保存后将按所选颜色 × 尺码生成 SKU' })), body.lastChild);
    }
    function styleDetail(st) {
      drawer(st.code + ' · ' + st.name, XK.brand(st.brandId)?.name + ' / ' + XK.category(st.categoryId)?.name + ' / ' + XK.season(st.seasonId)?.name, body => {
        body.appendChild(el('div', { class: 'desc' },
          d('款号', st.code), d('吊牌价', U.money0(st.tagPrice)), d('尺码组', XK.sizeGroup(st.sizeGroupId)?.name), d('状态', st.status === 'on' ? '上架' : '下架'),
          d('卖点', st.desc || '-'), d('颜色', st.colorIds.map(c => XK.color(c)?.name).join(' / '))));
        function d(k, v) { return el('div', { class: 'd' }, el('b', { text: k }), el('span', { text: v })); }
        body.appendChild(el('div', { class: 'card-title', text: 'SKU 库存矩阵（可订 / 现货 / 锁定）', style: { marginBottom: '12px' } }));
        const sizes = XK.sizesOf(st);
        const mx = el('div', { class: 'matrix' }, el('table', { class: 'mx' },
          el('thead', {}, el('tr', {}, el('th', { text: '颜色' }), sizes.map(s => el('th', { text: s })), el('th', { text: '小计' }))),
          el('tbody', {}, st.colorIds.map(cid => {
            const c = XK.color(cid);
            let sum = 0;
            return el('tr', {},
              el('td', {}, el('span', { class: 'rowh' }, el('span', { class: 'swatch', style: { background: c?.hex } }), c?.name)),
              sizes.map(sz => {
                const k = XK.stock(st.code, cid, sz); sum += k.b;
                return el('td', {}, el('span', { class: 'num', text: k.b }), el('div', { style: { fontSize: '10.5px', color: '#98A1B3' }, text: `现${k.s} 锁${k.l}` }));
              }),
              el('td', {}, el('span', { class: 'tot', text: sum.toLocaleString() })));
          }))));
        body.appendChild(mx);
      }, (foot, close) => {
        foot.appendChild(btn('导出该款 SKU', 'download', { onclick: () => { exportXLS(st.code + '_SKU库存', ['SKU编码', '颜色', '尺码', '可订库存', '现货库存', '锁定'], st.colorIds.flatMap(cid => XK.sizesOf(st).map(sz => { const k = XK.stock(st.code, cid, sz); return [XK.skuCode(st.code, cid, sz), XK.color(cid)?.name, sz, k.b, k.s, k.l]; }))); toast('已导出'); } }));
        foot.appendChild(btn('关闭', null, { onclick: close }));
      });
    }

    /* --- 通用小表 CRUD --- */
    function simpleCRUD(box, key, label, fields, toForm, fromForm) {
      const tbl = table({
        rows: () => XK.db[key],
        cols: [
          ...fields.map(f => ({
            label: f.label, key: f.key,
            render: f.type === 'colorpick' ? r => el('span', { class: 'swatch', style: { background: r.hex, width: '22px', height: '14px' } }) : (f.key === 'sizes' ? r => (Array.isArray(r.sizes) ? r.sizes.join(' / ') : r.sizes) : r[f.key === 'active' ? 'active' : f.key]),
            cls: f.key === 'code' || f.key === 'name' ? 'strong' : '',
          })),
          { label: '操作', render: r => btn('编辑', 'edit', { sm: true, onclick: () => open(r) }) },
        ],
        toolbar: t => el('div', { class: 'toolbar', style: { padding: '14px 22px 0' } }, searchBox('搜索' + label, kw => t.search(kw)), el('div', { class: 'sp' }), btn('新增' + label, 'plus', { cls: 'btn-primary', onclick: () => open(null) })),
      });
      box.appendChild(tbl.el);
      function open(r) {
        formModal({
          title: (r ? '编辑' : '新增') + label, fields,
          data: r ? (toForm ? toForm(r) : r) : {},
          onOk: (v, close) => {
            let target = r;
            if (!r) {
              target = { id: key.slice(0, 1).toUpperCase() + 'Z' + Date.now() };
              if (key === 'sizeGroups') target.sizes = [];
              if (key === 'colors') target.hex = '#1B1E24';
              XK.db[key].push(target);
            }
            let val = fromForm ? fromForm(v) : v;
            if (key === 'sizeGroups') val.sizes = String(val.sizes).split(/[,，\s]+/).filter(Boolean);
            if (key === 'tiers') val.rate = Number(val.rate) || 0.45;
            if (key === 'brands' || key === 'categories' || key === 'seasons') val.active = r ? r.active : true;
            Object.assign(target, val);
            XK.log('基础资料', (r ? '编辑' : '新增') + label, val.name || val.code || '');
            XK.save(); close(); tbl.render(); refreshBell(); toast('已保存' + label);
          },
        });
      }
    }
    render();
  };

  /* ================= 经销商管理 ================= */
  ADM.pages.dealers = function (root) {
    const db = XK.db;
    const tbl = table({
      pageSize: 10,
      rows: () => [...db.dealers],
      cols: [
        { label: '编码', key: 'code', strong: true, w: '80px' },
        { label: '经销商名称', key: 'name', strong: true },
        { label: '区域', key: 'region' },
        { label: '联系人', render: r => el('span', {}, r.contact, el('div', { style: { fontSize: '11.5px', color: '#98A1B3' } }, r.phone)) },
        { label: '等级', render: r => { const t = XK.tier(r.tierId); return el('span', {}, badge(t.name, TIER_TONE[r.tierId]), el('div', { style: { fontSize: '11.5px', color: '#98A1B3' } }, (t.rate * 10).toFixed(1) + ' 折供货')); } },
        { label: '授信使用', render: r => creditCell(r) },
        { label: '单独定价', render: r => (r.customPricing?.length ? badge(r.customPricing.length + ' 个款', 'gold') : '—') },
        { label: '账号', render: r => el('span', { class: 'num' }, r.account.username, r.account.enabled ? '' : badge('已停用', 'err')) },
        { label: '状态', render: r => badge(r.status === 'active' ? '正常' : '停用', r.status === 'active' ? 'ok' : 'err') },
        { label: '操作', render: r => btn('详情 / 编辑', 'eye', { sm: true, onclick: () => detail(r) }) },
      ],
      toolbar: t => el('div', { class: 'toolbar', style: { padding: '14px 22px 0' } },
        searchBox('搜索名称 / 联系人', kw => t.search(kw)), el('div', { class: 'sp' }),
        btn('导出经销商', 'download', { onclick: () => { exportXLS('经销商档案_' + U.dstr(new Date()), ['编码', '名称', '区域', '联系人', '电话', '等级', '折扣', '授信额度', '已用授信', '账号', '状态'], db.dealers.map(d => { const t = XK.tier(d.tierId); return [d.code, d.name, d.region, d.contact, d.phone, t.name, (t.rate * 10).toFixed(1) + '折', d.creditLimit, XK.creditUsed(d.id), d.account.username, d.status === 'active' ? '正常' : '停用']; })); toast('已导出'); } }),
        btn('新增经销商', 'plus', { cls: 'btn-primary', onclick: () => dealerForm(null) })),
    });
    root.appendChild(tbl.el);
    function creditCell(r) {
      const used = XK.creditUsed(r.id), pct = Math.min(100, used / r.creditLimit * 100);
      return el('div', { style: { minWidth: '130px' } },
        el('div', { class: 'num', style: { fontSize: '12px', color: pct > 85 ? '#CE4B3F' : '#4A5568' } }, U.money0(used), ' / ', U.money0(r.creditLimit)),
        el('div', { class: 'credit-bar', style: { margin: '5px 0 0' } }, el('i', { style: { width: pct + '%', background: pct > 85 ? 'linear-gradient(90deg,#E08476,#CE4B3F)' : undefined } })));
    }
    function dealerForm(d) {
      formModal({
        title: d ? '编辑经销商 · ' + d.name : '新增经销商', width: 640,
        fields: [
          { key: 'code', label: '经销商编码', required: true, value: d?.code },
          { key: 'name', label: '经销商名称', required: true, value: d?.name },
          { key: 'region', label: '所在区域', value: d?.region },
          { key: 'contact', label: '联系人', value: d?.contact },
          { key: 'phone', label: '联系电话', value: d?.phone },
          { key: 'tierId', label: '经销等级', type: 'select', options: db.tiers.map(t => ({ value: t.id, label: `${t.name}（${(t.rate * 10).toFixed(1)} 折）` })), value: d?.tierId || 'T3' },
          { key: 'creditLimit', label: '授信额度（元）', type: 'number', required: true, value: d?.creditLimit || 300000 },
          { key: 'username', label: '登录账号', required: true, value: d?.account.username, help: '经销商订货端登录账号' },
        ],
        onOk: (v, close) => {
          let target = d;
          if (!d) {
            if (db.dealers.some(x => x.account.username === v.username)) { toast('登录账号已存在', 'err'); return; }
            target = { id: 'D' + Date.now(), customPricing: [], status: 'active', createdAt: U.now().slice(0, 10), account: { password: '123456', enabled: true } };
            db.dealers.push(target);
          }
          const { username, ...rest } = v;
          Object.assign(target, rest); target.account.username = username;
          XK.log('经销商管理', d ? '编辑经销商' : '新增经销商', target.name);
          XK.save(); close(); tbl.render(); toast('已保存经销商：' + target.name);
        },
      });
    }
    function detail(d) {
      drawer(d.name, d.code + ' · ' + (XK.tier(d.tierId)?.name) + ' · ' + d.region, body => {
        const used = XK.creditUsed(d.id);
        body.appendChild(el('div', { class: 'desc' },
          dg('联系人', d.contact + '　' + d.phone), dg('经销等级', XK.tier(d.tierId)?.name + '（' + (XK.tier(d.tierId).rate * 10).toFixed(1) + ' 折供货）'),
          dg('授信额度', U.money0(d.creditLimit)), dg('已用授信', U.money0(used) + '（剩余 ' + U.money0(Math.max(0, d.creditLimit - used)) + '）'),
          dg('登录账号', d.account.username + (d.account.enabled ? '' : '（已停用）')), dg('创建时间', d.createdAt)));
        function dg(k, v) { return el('div', { class: 'd' }, el('b', { text: k }), el('span', { text: v })); }
        body.appendChild(el('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '6px 0 12px' } },
          el('div', { class: 'card-title', text: '单独定价' }), el('span', { class: 'card-sub', text: '对指定款式设定专属供货价，优先级高于等级折扣' })));
        const cpBox = el('div', { class: 'card' });
        function cpTable() {
          cpBox.replaceChildren();
          cpBox.appendChild(table({
            rows: () => d.customPricing,
            empty: '暂无单独定价款式，点击右上角添加',
            cols: [
              { label: '款号', render: r => XK.style(r.styleId)?.code || r.styleId, strong: true },
              { label: '款式', render: r => XK.style(r.styleId)?.name },
              { label: '吊牌价', render: r => U.money0(XK.style(r.styleId)?.tagPrice) },
              { label: '等级价', render: r => U.money0(XK.dealPrice({ ...d, customPricing: [] }, XK.style(r.styleId))) },
              { label: '专属价', render: r => el('b', { class: 'num', style: { color: '#8F6C33' } }, U.money0(r.price)) },
              { label: '操作', render: r => btn('移除', 'trash', { sm: true, cls: 'btn-danger', onclick: () => { d.customPricing = d.customPricing.filter(p => p !== r); XK.save(); cpTable(); tbl.render(); toast('已移除单独定价'); } }) },
            ],
          }).el);
        }
        cpTable(); body.appendChild(cpBox);
        // 订货记录
        body.appendChild(el('div', { class: 'card-title', text: '订货记录', style: { margin: '18px 0 12px' } }));
        body.appendChild(table({
          pageSize: 5,
          rows: () => db.orders.filter(o => o.dealerId === d.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
          cols: [
            { label: '订单号', key: 'no', strong: true }, { label: '金额', render: r => U.money0(r.totalAmount) },
            { label: '状态', render: r => ADM.badgeOf(OST, r.status) }, { label: '时间', render: r => r.createdAt },
          ],
        }).el);
      }, (foot, close) => {
        foot.appendChild(btn('重置密码', 'refresh', { onclick: () => { d.account.password = '123456'; XK.log('经销商管理', '重置登录密码', d.name); XK.save(); toast('已重置密码为 123456'); } }));
        foot.appendChild(btn(d.account.enabled ? '停用账号' : '启用账号', d.account.enabled ? 'lock' : 'check', { onclick: () => { d.account.enabled = !d.account.enabled; XK.log('经销商管理', d.account.enabled ? '启用账号' : '停用账号', d.name); XK.save(); close(); tbl.render(); } }));
        foot.appendChild(btn('添加单独定价', 'plus', { onclick: () => addCustomPrice(d, cpTable, tbl) }));
        foot.appendChild(btn('编辑资料', 'edit', { cls: 'btn-primary', onclick: () => { close(); dealerForm(d); } }));
      });
    }
    function addCustomPrice(d, refresh, tbl) {
      const opts = db.styles.filter(s => !d.customPricing.some(p => p.styleId === s.id));
      if (!opts.length) { toast('所有款式均已设定单独定价', 'warn'); return; }
      formModal({
        title: '添加单独定价 · ' + d.name, width: 460,
        fields: [
          { key: 'styleId', label: '款式', type: 'select', required: true, options: opts.map(s => ({ value: s.id, label: `${s.code} ${s.name}（吊牌 ¥${s.tagPrice}）` })) },
          { key: 'price', label: '专属供货价（元）', type: 'number', required: true },
        ],
        onOk: (v, close) => { d.customPricing.push({ styleId: v.styleId, price: v.price }); XK.log('经销商管理', '设置单独定价', d.name + ' ' + v.price); XK.save(); close(); refresh(); tbl.render(); toast('已设置单独定价'); },
      });
    }
  };

  setPage();
})();
