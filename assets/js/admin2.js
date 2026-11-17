/* ============================================================
   品牌订货分销系统 · 管理后台（订货/补退/库存/对账/报表/权限/日志）
   上海诩可科技有限公司
   ============================================================ */
(function () {
  const { el, btn, icon, toast, modal, formModal, drawer, table, searchBox, badge, hbars, donut, line, exportXLS, confirm } = UI;
  const U = XK.util;
  const { OST, AST, TIER_TONE, badgeOf } = ADM;

  /* ================= 订货管理 ================= */
  ADM.pages.orders = function (root) {
    const db = XK.db;
    const FILTERS = [['all', '全部'], ['pending', '待审核'], ['audited', '已审核'], ['locked', '已锁款'], ['producing', '排产中'], ['closed', '已完成'], ['rejected', '已驳回'], ['withdrawn', '已撤回']];
    let cur = 'all', dealerF = '';
    const wrap = el('div', {});
    const tabBar = el('div', { class: 'tabs' });
    const listBox = el('div', {});
    root.appendChild(wrap);
    wrap.appendChild(el('div', { class: 'stat-row' }, statPills()));
    wrap.appendChild(tabBar); wrap.appendChild(listBox);
    function statPills() {
      const cnt = s => db.orders.filter(o => o.status === s).length;
      const box = el('div', { style: { display: 'contents' } });
      [['订单总数', db.orders.length, 'navy'], ['待审核', cnt('pending'), 'warn'], ['已锁款', cnt('locked'), 'info'], ['排产中', cnt('producing'), 'gold'], ['已完成', cnt('closed'), 'ok']].forEach(([t, v, tone]) => {
        box.appendChild(el('div', { class: 'stat-pill' }, el('b', { text: t }), el('div', { class: 'v', text: String(v) })));
      });
      return box;
    }
    function renderTabs() {
      tabBar.replaceChildren();
      FILTERS.forEach(([k, t]) => {
        const n = k === 'all' ? db.orders.length : db.orders.filter(o => o.status === k).length;
        tabBar.appendChild(el('div', { class: 'tab' + (k === cur ? ' on' : ''), onclick: () => { cur = k; renderTabs(); tbl.render(); } }, el('span', { text: t }), n ? el('span', { class: 'cnt', text: String(n) }) : null));
      });
    }
    const tbl = table({
      pageSize: 12,
      rows: () => db.orders
        .filter(o => (cur === 'all' || o.status === cur) && (!dealerF || o.dealerId === dealerF))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      cols: [
        { label: '订单号', key: 'no', strong: true },
        { label: '经销商', render: r => XK.dealer(r.dealerId)?.name },
        { label: '数量', render: r => el('span', { class: 'num' }, r.totalQty, ' 件') },
        { label: '订单金额', render: r => el('span', { class: 'num strong' }, U.money0(r.totalAmount)) },
        { label: '状态', render: r => badgeOf(OST, r.status) },
        { label: '提交时间', render: r => r.createdAt },
        { label: '操作', render: r => btn(r.status === 'pending' ? '审核' : '查看', r.status === 'pending' ? 'check' : 'eye', { sm: true, cls: r.status === 'pending' ? 'btn-ok' : '', onclick: () => detail(r) }) },
      ],
      onRow: r => detail(r),
      toolbar: t => el('div', { class: 'toolbar filters', style: { padding: '14px 22px 0' } },
        searchBox('搜索订单号', kw => t.search(kw)),
        (() => { const s = el('select', { class: 'sel' }, el('option', { value: '' }, '全部经销商'), db.dealers.map(d => el('option', { value: d.id }, d.name))); s.onchange = () => { dealerF = s.value; t.render(); }; return s; })(),
        el('div', { class: 'sp' }),
        btn('导出订单列表', 'download', { onclick: exportList }),
        btn('新增订单', 'plus', { cls: 'btn-primary', onclick: () => createOrder() })),
      footNote: '订单流程：经销商提交 → 审核 → 锁款 → 排产标记 → 完成；审核通过后自动锁定对应 SKU 可订库存。',
    });
    renderTabs(); listBox.appendChild(tbl.el);
    function exportList() {
      exportXLS('订货单列表_' + U.dstr(new Date()), ['订单号', '经销商', '数量', '金额', '状态', '提交时间'],
        db.orders.map(o => [o.no, XK.dealer(o.dealerId)?.name, o.totalQty, o.totalAmount, OST[o.status]?.[0], o.createdAt]), '订货单');
      XK.log('订货管理', '导出订单列表'); toast('已导出订单列表');
    }

    /* 订单详情抽屉 */
    function detail(o) {
      const d = XK.dealer(o.dealerId);
      drawer(o.no, d?.name + ' · ' + (badgeOf(OST, o.status)).textContent, body => {
        const tier = XK.tier(d.tierId);
        body.appendChild(el('div', { class: 'desc' },
          dg('经销商', d?.name + '（' + tier.name + ' ' + (tier.rate * 10).toFixed(1) + '折）'), dg('订单金额', U.money0(o.totalAmount)),
          dg('总数量', o.totalQty + ' 件'), dg('提交时间', o.createdAt), dg('备注', o.remark || '—')));
        function dg(k, v) { return el('div', { class: 'd' }, el('b', { text: k }), el('span', { text: v })); }
        body.appendChild(el('div', { class: 'card-title', text: '订单明细', style: { margin: '4px 0 12px' } }));
        body.appendChild(table({
          rows: () => o.items,
          cols: [
            { label: '款号', render: r => XK.style(r.styleId)?.code, strong: true },
            { label: '款式', render: r => XK.style(r.styleId)?.name },
            { label: '颜色', render: r => { const c = XK.color(r.colorId); return el('span', {}, el('span', { class: 'swatch', style: { background: c?.hex, marginRight: '6px' } }), c?.name); } },
            { label: '尺码', render: r => r.size },
            { label: '数量', render: r => el('span', { class: 'num' }, r.qty) },
            { label: '单价', render: r => U.money0(r.price) },
            { label: '小计', render: r => el('span', { class: 'num strong' }, U.money0(r.amount)) },
          ],
        }).el);
        body.appendChild(el('div', { class: 'card-title', text: '流转记录', style: { margin: '18px 0 12px' } }));
        const ACT = { submitted: '提交订单', audited: '审核通过', rejected: '审核驳回', locked: '锁款', producing: '标记排产', closed: '订单完成', withdrawn: '经销商撤回' };
        body.appendChild(el('div', { class: 'tl' }, o.hist.map(h => el('div', { class: 'tl-i on' }, el('div', { class: 't', text: ACT[h.a] || h.a }), el('div', { class: 's', text: h.at + ' · ' + h.by })))));
      }, (foot, close) => {
        foot.appendChild(btn('导出明细', 'download', { onclick: () => exportXLS(o.no + '_明细', ['款号', '款式', '颜色', '尺码', '数量', '单价', '小计'], o.items.map(it => [XK.style(it.styleId)?.code, XK.style(it.styleId)?.name, XK.color(it.colorId)?.name, it.size, it.qty, it.price, it.amount])) }));
        if (o.status === 'pending') {
          foot.appendChild(btn('驳回', 'x', { cls: 'btn-danger', onclick: () => rejectForm(o, close) }));
          foot.appendChild(btn('审核通过', 'check', { cls: 'btn-primary', onclick: () => confirm('审核通过后将锁定对应 SKU 可订库存并占用经销商授信，确认通过订单 ' + o.no + '？', () => { audit(o, true, ''); close(); }) }));
        } else if (o.status === 'audited') {
          foot.appendChild(btn('锁款', 'lock', { cls: 'btn-primary', onclick: () => confirm('锁款后款式进入不可修改状态，确认对 ' + o.no + ' 锁款？', () => { step(o, 'locked', '锁款'); close(); }) }));
        } else if (o.status === 'locked') {
          foot.appendChild(btn('标记排产', 'truck', { cls: 'btn-primary', onclick: () => confirm('确认将 ' + o.no + ' 标记进入排产？', () => { step(o, 'producing', '标记排产'); close(); }) }));
        } else if (o.status === 'producing') {
          foot.appendChild(btn('完成订单', 'check', { cls: 'btn-primary', onclick: () => confirm('完成后扣减现货库存并释放锁定，确认完成 ' + o.no + '？', () => { closeOrder(o); close(); }) }));
        } else foot.appendChild(btn('关闭', null, { onclick: close }));
      });
    }
    function audit(o, pass, remark) {
      o.status = pass ? 'audited' : 'rejected';
      o.auditedAt = U.now(); o.remark = remark;
      o.hist.push({ a: pass ? 'audited' : 'rejected', at: U.now(), by: UI.el ? sess().name : '' });
      if (pass) {
        o.items.forEach(it => {
          const st = XK.style(it.styleId); if (!st) return;
          const k = XK.skuCode(st.code, it.colorId, it.size), cell = XK.db.inv[k];
          if (cell) { cell.l += it.qty; cell.b = Math.max(0, cell.b - it.qty); }
        });
      }
      XK.log('订货管理', pass ? '订单审核通过' : '订单审核驳回', o.no + ' · ' + XK.dealer(o.dealerId)?.name);
      XK.save(); ADM.refresh(); toast(pass ? '已审核通过：' + o.no : '已驳回：' + o.no, pass ? 'ok' : 'warn');
    }
    function sess() { return XK.session(); }
    function step(o, to, label) {
      o.status = to; o.hist.push({ a: to, at: U.now(), by: sess().name });
      XK.log('订货管理', '订单' + label, o.no); XK.save(); ADM.refresh(); toast('已' + label + '：' + o.no);
    }
    function closeOrder(o) {
      o.status = 'closed'; o.hist.push({ a: 'closed', at: U.now(), by: sess().name });
      o.items.forEach(it => {
        const st = XK.style(it.styleId); if (!st) return;
        const k = XK.skuCode(st.code, it.colorId, it.size), cell = XK.db.inv[k];
        if (cell) { cell.l = Math.max(0, cell.l - it.qty); cell.s = Math.max(0, cell.s - it.qty); }
      });
      XK.log('订货管理', '订单完成', o.no); XK.save(); ADM.refresh(); toast('订单已完成：' + o.no);
    }
    function rejectForm(o, close) {
      formModal({
        title: '驳回订单 · ' + o.no, width: 440, okText: '确认驳回', fields: [{ key: 'remark', label: '驳回原因', type: 'textarea', required: true, full: true }],
        onOk: (v, c) => { c(); audit(o, false, v.remark); close(); },
      });
    }
    /* 管理端代客下单 */
    function createOrder() {
      const state = { dealerId: '', items: [] };
      formModal({
        title: '新增订单（管理端代录）', width: 520, okText: '下一步 · 录入明细',
        fields: [
          { key: 'dealerId', label: '经销商', type: 'select', required: true, options: db.dealers.filter(d => d.status === 'active').map(d => ({ value: d.id, label: d.name })) },
          { key: 'remark', label: '备注', type: 'textarea', full: true },
        ],
        onOk: (v, c) => { c(); state.dealerId = v.dealerId; state.remark = v.remark; pickItems(state); },
      });
    }
    function pickItems(state) {
      const d = XK.dealer(state.dealerId);
      const md = modal({
        title: '录入明细 · ' + d.name + '（' + (XK.tier(d.tierId).rate * 10).toFixed(1) + ' 折）', width: 760, okText: '提交订单', noFooter: false,
        body: (() => {
          const sel = el('select', { class: 'sel', style: { width: '100%', marginBottom: '10px' } },
            el('option', { value: '' }, '＋ 选择款式加入明细…'), db.styles.filter(s => s.status === 'on').map(s => el('option', { value: s.id }, `${s.code} ${s.name}（供货 ¥${XK.dealPrice(d, s)}）`)));
          const listBox = el('div', { id: 'oiList' });
          sel.onchange = () => {
            const st = XK.style(sel.value); if (!st) return; sel.value = '';
            if (state.items.some(i => i.styleId === st.id)) { toast('该款式已在明细中', 'warn'); return; }
            state.items.push({ styleId: st.id, colorId: st.colorIds[0], size: XK.sizesOf(st)[0], qty: 10, price: XK.dealPrice(d, st) });
            renderItems();
          };
          function renderItems() {
            listBox.replaceChildren();
            state.items.forEach((it, idx) => {
              const st = XK.style(it.styleId);
              const row = el('div', { class: 'field', style: { display: 'grid', gridTemplateColumns: '2fr 1fr 0.7fr 0.7fr 0.8fr auto', gap: '8px', alignItems: 'center', marginBottom: '8px' } },
                el('div', {}, el('b', {}, st.code + ' ' + st.name), el('div', { style: { fontSize: '11.5px', color: '#98A1B3' } }, '单价 ¥' + it.price)),
                colorSel(it, renderItems), sizeSel(it), qtyIpt(it),
                el('div', { class: 'num', text: U.money0(it.price * it.qty), style: { fontWeight: 600 } }),
                btn('', 'trash', { sm: true, cls: 'btn-danger', onclick: () => { state.items.splice(idx, 1); renderItems(); } }));
              listBox.appendChild(row);
            });
            const sum = state.items.reduce((s, i) => s + i.price * i.qty, 0);
            listBox.appendChild(el('div', { style: { textAlign: 'right', fontWeight: 600 } }, '合计：', el('span', { class: 'num', style: { color: '#8F6C33', fontSize: '18px' } }, U.money0(sum))));
          }
          function colorSel(it, rr) {
            const s = el('select', { class: 'sel' }, XK.style(it.styleId).colorIds.map(c => el('option', { value: c }, XK.color(c)?.name)));
            s.value = it.colorId; s.onchange = () => { it.colorId = s.value; };
            return s;
          }
          function sizeSel(it) {
            const s = el('select', { class: 'sel' }, XK.sizesOf(XK.style(it.styleId)).map(z => el('option', { value: z }, z)));
            s.value = it.size; s.onchange = () => { it.size = s.value; };
            return s;
          }
          function qtyIpt(it) {
            const i = el('input', { class: 'ipt', type: 'number', min: '1' }); i.value = it.qty;
            i.oninput = () => { it.qty = Math.max(1, Number(i.value) || 1); renderItems(); };
            return i;
          }
          renderItems();
          return el('div', {}, el('div', { class: 'notice info' }, icon('info'), el('div', {}, '成交单价按经销商等级折扣自动计算；有单独定价的款式取专属价。')), sel, listBox);
        })(),
        onOk: (close) => {
          if (!state.items.length) { toast('请至少加入一个款式', 'warn'); return; }
          const items = state.items.map(i => ({ ...i, amount: i.price * i.qty }));
          const o = {
            id: 'O' + Date.now(), no: XK.nextNo('order'), dealerId: state.dealerId, type: 'order', status: 'pending',
            items, totalQty: items.reduce((s, i) => s + i.qty, 0), totalAmount: items.reduce((s, i) => s + i.amount, 0),
            remark: state.remark || '管理端代录', createdAt: U.now(), hist: [{ a: 'submitted', at: U.now(), by: '管理端代录' }],
          };
          db.orders.push(o);
          XK.log('订货管理', '管理端新增订单', o.no + ' · ' + XK.dealer(o.dealerId)?.name);
          XK.save(); close(); ADM.refresh(); toast('已创建订单：' + o.no);
        },
      });
      return md;
    }
  };

  /* ================= 补货 · 退换货 ================= */
  ADM.pages.aftersale = function (root) {
    const db = XK.db;
    let cur = 're';
    const tabBar = el('div', { class: 'tabs' }, [
      el('div', { class: 'tab on', onclick: sw }, '补货申请', badge(String(db.reorders.filter(x => x.status === 'pending').length), 'warn')),
      el('div', { class: 'tab', onclick: sw }, '退货申请', badge(String(db.returns.filter(x => x.status === 'pending').length), 'warn')),
    ]);
    function sw(e) {
      const tabs = tabBar.querySelectorAll('.tab');
      cur = cur === 're' ? 'rt' : 're';
      tabs.forEach((t, i) => t.classList.toggle('on', (i === 0) === (cur === 're')));
      tbl.render();
    }
    const tbl = table({
      pageSize: 12,
      rows: () => (cur === 're' ? db.reorders : db.returns).slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      cols: [
        { label: '申请单号', key: 'no', strong: true },
        { label: '类型', render: () => badge(cur === 're' ? '补货' : '退货', cur === 're' ? 'info' : 'gold') },
        { label: '经销商', render: r => XK.dealer(r.dealerId)?.name },
        { label: '关联订单', render: r => r.refOrderNo || '—' },
        { label: '款式', render: r => r.items.map(i => XK.style(i.styleId)?.code).join('、') },
        { label: '数量', render: r => el('span', { class: 'num' }, r.totalQty, ' 件') },
        { label: '金额', render: r => el('span', { class: 'num strong' }, U.money0(r.totalAmount)) },
        { label: '状态', render: r => badgeOf(AST, r.status) },
        { label: '申请时间', render: r => r.createdAt },
        { label: '操作', render: r => r.status === 'pending' ? btn('审核', 'check', { sm: true, cls: 'btn-ok', onclick: () => detail(r) }) : btn('查看', 'eye', { sm: true, onclick: () => detail(r) }) },
      ],
      onRow: detail,
      toolbar: t => el('div', { class: 'toolbar', style: { padding: '14px 22px 0' } },
        searchBox('搜索单号 / 关联订单', kw => t.search(kw)), el('div', { class: 'sp' }),
        btn('导出' + (cur === 're' ? '补货' : '退货') + '申请', 'download', { onclick: () => exportXLS((cur === 're' ? '补货' : '退货') + '申请_' + U.dstr(new Date()), ['单号', '经销商', '关联订单', '数量', '金额', '原因', '状态', '时间'], (cur === 're' ? db.reorders : db.returns).map(r => [r.no, XK.dealer(r.dealerId)?.name, r.refOrderNo, r.totalQty, r.totalAmount, r.reason, AST[r.status]?.[0], r.createdAt])) })),
      footNote: cur === 're' ? '补货通过后锁定 SKU 可订库存，走与订货单相同的锁款/排产流程。' : '退货通过后恢复对应 SKU 可订库存并释放锁定。',
    });
    root.appendChild(el('div', {}, tabBar, tbl.el));

    function detail(a) {
      const isRe = a.type === 'replenish';
      drawer(a.no, XK.dealer(a.dealerId)?.name + ' · ' + (badgeOf(AST, a.status)).textContent, body => {
        body.appendChild(el('div', { class: 'desc' },
          dg('申请类型', isRe ? '补货申请' : '退货申请'), dg('关联订单', a.refOrderNo || '—'),
          dg('申请数量', a.totalQty + ' 件'), dg('申请金额', U.money0(a.totalAmount)), dg('申请原因', a.reason || '—')));
        function dg(k, v) { return el('div', { class: 'd' }, el('b', { text: k }), el('span', { text: v })); }
        body.appendChild(el('div', { class: 'card-title', text: '明细', style: { margin: '4px 0 12px' } }));
        body.appendChild(table({
          rows: () => a.items,
          cols: [
            { label: '款号', render: r => XK.style(r.styleId)?.code, strong: true }, { label: '款式', render: r => XK.style(r.styleId)?.name },
            { label: '颜色', render: r => XK.color(r.colorId)?.name }, { label: '尺码', render: r => r.size },
            { label: '数量', render: r => el('span', { class: 'num' }, r.qty) }, { label: '单价', render: r => U.money0(r.price) },
          ],
        }).el);
      }, (foot, close) => {
        if (a.status === 'pending') {
          foot.appendChild(btn('驳回', 'x', { cls: 'btn-danger', onclick: () => { a.status = 'rejected'; a.hist.push({ a: 'rejected', at: U.now(), by: XK.session().name }); XK.log('补退管理', (isRe ? '补货' : '退货') + '申请驳回', a.no); XK.save(); close(); ADM.refresh(); toast('已驳回'); } }));
          foot.appendChild(btn('审核通过', 'check', { cls: 'btn-primary', onclick: () => {
            a.status = 'approved'; a.hist.push({ a: 'approved', at: U.now(), by: XK.session().name });
            a.items.forEach(it => {
              const st = XK.style(it.styleId); if (!st) return;
              const k = XK.skuCode(st.code, it.colorId, it.size), cell = XK.db.inv[k]; if (!cell) return;
              if (isRe) { cell.l += it.qty; cell.b = Math.max(0, cell.b - it.qty); }
              else { cell.b += it.qty; cell.l = Math.max(0, cell.l - it.qty); }
            });
            XK.log('补退管理', (isRe ? '补货' : '退货') + '申请通过', a.no); XK.save(); close(); ADM.refresh(); toast('已通过');
          } }));
        } else foot.appendChild(btn('关闭', null, { onclick: close }));
      });
    }
  };

  /* ================= 库存管理 ================= */
  ADM.pages.inventory = function (root) {
    const db = XK.db;
    const totals = { sku: 0, b: 0, s: 0, l: 0 };
    Object.values(db.inv).forEach(c => { totals.sku++; totals.b += c.b; totals.s += c.s; totals.l += c.l; });
    root.appendChild(el('div', { class: 'stat-row fade-in' },
      pill('SKU 总数', totals.sku.toLocaleString() + ' <small>个</small>'),
      pill('可订库存', totals.b.toLocaleString() + ' <small>件</small>'),
      pill('现货库存', totals.s.toLocaleString() + ' <small>件</small>'),
      pill('锁定库存', totals.l.toLocaleString() + ' <small>件</small>')));
    function pill(t, v) { return el('div', { class: 'stat-pill' }, el('b', { text: t }), el('div', { class: 'v', html: v })); }

    function parseSku(code) { const p = code.split('-'); const size = p.pop(); const colorId = p.pop(); return [p.join('-'), colorId, size]; }
    const tbl = table({
      pageSize: 15,
      rows: () => Object.entries(db.inv).map(([code, c]) => {
        const [styleCode, colorId, size] = parseSku(code);
        return { code, styleCode, colorId, size, ...c, style: XK.styleByCode(styleCode) };
      }).filter(r => r.style),
      cols: [
        { label: 'SKU 编码', key: 'code', strong: true, render: r => el('span', { class: 'num' }, r.code) },
        { label: '款式', render: r => el('span', {}, el('b', {}, r.style.name), el('div', { style: { fontSize: '11.5px', color: '#98A1B3' } }, r.styleCode)) },
        { label: '颜色', render: r => { const c = XK.color(r.colorId); return el('span', {}, el('span', { class: 'swatch', style: { background: c?.hex, marginRight: '6px' } }), c?.name); } },
        { label: '尺码', key: 'size' },
        { label: '可订库存', render: r => el('span', { class: 'num strong', text: r.b.toLocaleString(), style: { color: r.b === 0 ? '#CE4B3F' : r.b < 200 ? '#C97D15' : '' } }) },
        { label: '现货库存', render: r => el('span', { class: 'num' }, r.s.toLocaleString()) },
        { label: '锁定', render: r => el('span', { class: 'num' }, r.l.toLocaleString()) },
        { label: '状态', render: r => badge(r.b === 0 ? '缺货' : r.b < 200 ? '偏低' : '充足', r.b === 0 ? 'err' : r.b < 200 ? 'warn' : 'ok') },
        { label: '操作', render: r => btn('调整', 'edit', { sm: true, onclick: () => adjust(r) }) },
      ],
      toolbar: t => el('div', { class: 'toolbar', style: { padding: '14px 22px 0' } },
        searchBox('搜索 SKU / 款号', kw => t.search(kw)), el('div', { class: 'sp' }),
        btn('导出库存明细', 'download', { onclick: () => { exportXLS('库存明细_' + U.dstr(new Date()), ['SKU', '款号', '款式', '颜色', '尺码', '可订', '现货', '锁定'], Object.entries(db.inv).map(([code, c]) => { const [sc, ci, sz] = parseSku(code); const st = XK.styleByCode(sc); return [code, sc, st?.name || '', XK.color(ci)?.name || ci, sz, c.b, c.s, c.l]; })); toast('已导出'); } })),
      footNote: '可订库存 = 品牌方可供经销商下单的数量；订单审核通过后由系统自动锁定。',
    });
    root.appendChild(tbl.el);
    function adjust(r) {
      formModal({
        title: '库存调整 · ' + r.code, width: 420,
        fields: [
          { key: 'b', label: '可订库存', type: 'number', required: true, value: r.b },
          { key: 's', label: '现货库存', type: 'number', required: true, value: r.s },
        ],
        onOk: (v, close) => {
          const cell = db.inv[r.code]; cell.b = Math.max(0, v.b); cell.s = Math.max(0, v.s);
          XK.log('库存管理', '调整库存', r.code + ' 可订' + cell.b + ' 现货' + cell.s);
          XK.save(); close(); ADM.refresh(); toast('已调整：' + r.code);
        },
      });
    }
  };

  /* ================= 对账结算 ================= */
  ADM.pages.statements = function (root) {
    const db = XK.db;
    const tbl = table({
      rows: () => [...db.statements].sort((a, b) => b.no.localeCompare(a.no)),
      cols: [
        { label: '对账单号', key: 'no', strong: true },
        { label: '经销商', render: r => XK.dealer(r.dealerId)?.name },
        { label: '账期', render: r => r.period },
        { label: '订单数', render: r => r.orderIds.length + ' 单' },
        { label: '对账金额', render: r => el('span', { class: 'num strong' }, U.money(r.amount)) },
        { label: '状态', render: r => badge(r.status === 'confirmed' ? '已确认' : '待经销商确认', r.status === 'confirmed' ? 'ok' : 'warn') },
        { label: '生成时间', render: r => r.createdAt },
        { label: '操作', render: r => el('span', {}, btn('查看', 'eye', { sm: true, onclick: () => detail(r) }), btn('导出', 'download', { sm: true, onclick: () => exportOne(r) })) },
      ],
      onRow: r => detail(r),
      toolbar: t => el('div', { class: 'toolbar', style: { padding: '14px 22px 0' } },
        searchBox('搜索单号', kw => t.search(kw)), el('div', { class: 'sp' }),
        btn('生成对账单', 'plus', { cls: 'btn-primary', onclick: gen })),
      footNote: '对账单按「经销商 + 账期」归集已审核及之后状态的订货/补货订单，由经销商在订货端确认。',
    });
    root.appendChild(tbl.el);
    function gen() {
      formModal({
        title: '生成对账单', width: 440,
        fields: [
          { key: 'dealerId', label: '经销商', type: 'select', required: true, options: db.dealers.filter(d => d.status === 'active').map(d => ({ value: d.id, label: d.name })) },
          { key: 'period', label: '账期（月份）', required: true, type: 'text', placeholder: '如 2026-10', value: (() => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1); return d.getFullYear() + '-' + U.pad(d.getMonth() + 1); })() },
        ],
        onOk: (v, close) => {
          if (!/^\d{4}-\d{2}$/.test(v.period)) { toast('账期格式：2026-10', 'warn'); return; }
          const used = new Set(db.statements.flatMap(s => s.dealerId === v.dealerId ? s.orderIds : []));
          const os = db.orders.filter(o => o.dealerId === v.dealerId && o.createdAt.slice(0, 7) === v.period && !['pending', 'rejected', 'withdrawn'].includes(o.status) && !used.has(o.id));
          if (!os.length) { toast('该账期没有可归集的订单', 'warn'); return; }
          db.statements.push({
            id: 'Z' + Date.now(), no: XK.nextNo('st'), dealerId: v.dealerId, period: v.period,
            orderIds: os.map(o => o.id), amount: os.reduce((s, o) => s + o.totalAmount, 0),
            status: 'unconfirmed', createdAt: U.now(),
          });
          XK.log('对账结算', '生成对账单', XK.dealer(v.dealerId)?.name + ' ' + v.period);
          XK.save(); close(); ADM.refresh(); toast('已生成对账单');
        },
      });
    }
    function exportOne(s) {
      const os = s.orderIds.map(id => db.orders.find(o => o.id === id)).filter(Boolean);
      exportXLS('对账单_' + s.no, ['序', '订单号', '订单金额', '数量', '状态', '日期'],
        [['1', '— 对账单号：' + s.no, '', '', '', ''], ['2', '经销商：' + XK.dealer(s.dealerId)?.name, '', '', '', ''], ['3', '账期：' + s.period, '', '', '', ''],
        ...os.map((o, i) => [i + 1, o.no, o.totalAmount, o.totalQty, OST[o.status]?.[0], o.createdAt.slice(0, 10)]),
        ['', '合计', s.amount, os.reduce((a, o) => a + o.totalQty, 0), '', '']], '对账单');
      toast('已导出对账单 ' + s.no);
    }
    function detail(s) {
      const os = s.orderIds.map(id => db.orders.find(o => o.id === id)).filter(Boolean);
      drawer(s.no, XK.dealer(s.dealerId)?.name + ' · 账期 ' + s.period, body => {
        body.appendChild(el('div', { class: 'desc' },
          dg('经销商', XK.dealer(s.dealerId)?.name), dg('账期', s.period),
          dg('订单数', os.length + ' 单'), dg('对账金额', U.money(s.amount)),
          dg('状态', s.status === 'confirmed' ? '已确认（' + s.confirmAt + '）' : '待经销商确认'), dg('生成时间', s.createdAt)));
        function dg(k, v) { return el('div', { class: 'd' }, el('b', { text: k }), el('span', { text: v })); }
        body.appendChild(table({
          rows: () => os,
          cols: [
            { label: '订单号', key: 'no', strong: true }, { label: '数量', render: r => r.totalQty },
            { label: '金额', render: r => el('span', { class: 'num strong' }, U.money0(r.totalAmount)) },
            { label: '状态', render: r => badgeOf(OST, r.status) }, { label: '日期', render: r => r.createdAt.slice(0, 10) },
          ],
        }).el);
      }, (foot, close) => {
        foot.appendChild(btn('导出对账单', 'download', { cls: 'btn-primary', onclick: () => exportOne(s) }));
        foot.appendChild(btn('关闭', null, { onclick: close }));
      });
    }
  };

  /* ================= 报表中心 ================= */
  ADM.pages.reports = function (root) {
    const db = XK.db;
    const valid = db.orders.filter(o => !['pending', 'rejected', 'withdrawn'].includes(o.status));
    let cur = 'sum';
    const tabBar = el('div', { class: 'tabs' }, [
      el('div', { class: 'tab on', onclick: () => sw('sum') }, '订货汇总'),
      el('div', { class: 'tab', onclick: () => sw('dealer') }, '经销商统计'),
      el('div', { class: 'tab', onclick: () => sw('style') }, '款式销量'),
    ]);
    const box = el('div', {});
    root.appendChild(tabBar); root.appendChild(box);
    function sw(k) {
      cur = k;
      tabBar.querySelectorAll('.tab').forEach((t, i) => t.classList.toggle('on', ['sum', 'dealer', 'style'][i] === k));
      render();
    }
    function render() {
      box.replaceChildren();
      if (cur === 'sum') {
        // 按季节
        const bySeason = {};
        valid.forEach(o => o.items.forEach(it => {
          const st = XK.style(it.styleId); if (!st) return;
          const k = st.seasonId;
          bySeason[k] = bySeason[k] || { amount: 0, qty: 0, orders: new Set(), styles: new Set() };
          bySeason[k].amount += it.amount; bySeason[k].qty += it.qty; bySeason[k].styles.add(st.id);
        }));
        valid.forEach(o => o.items.length && o.items[0] && (bySeason[XK.style(o.items[0].styleId)?.seasonId]?.orders.add(o.no)));
        const rowsS = Object.entries(bySeason).map(([sid, v]) => ({ name: XK.season(sid)?.name || sid, orders: db.orders.filter(o => o.items.some(i => XK.style(i.styleId)?.seasonId === sid)).length, styles: v.styles.size, qty: v.qty, amount: v.amount })).sort((a, b) => b.amount - a.amount);
        // 近6月趋势
        const months = [];
        for (let i = 5; i >= 0; i--) { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i); months.push(d.getFullYear() + '-' + U.pad(d.getMonth() + 1)); }
        const trend = months.map(m => ({ label: m.slice(2), value: valid.filter(o => o.createdAt.slice(0, 7) === m).reduce((s, o) => s + o.totalAmount, 0) }));
        box.appendChild(el('div', { class: 'grid-2' },
          card('近 6 个月订货金额趋势', '单位：元', line(trend, v => U.money0(v))),
          card('季节订货占比', '', donut(rowsS.map(r => ({ label: r.name, value: r.amount })), '订货总额', U.money0(rowsS.reduce((s, r) => s + r.amount, 0)), U.money0))));
        box.appendChild(card('季节订货汇总表', '统计口径：已审核及之后状态订单',
          table({
            rows: () => rowsS,
            cols: [
              { label: '季节', key: 'name', strong: true }, { label: '订单数', render: r => r.orders + ' 单' },
              { label: '在订款式', render: r => r.styles + ' 个' }, { label: '订货数量', render: r => r.qty.toLocaleString() + ' 件' },
              { label: '订货金额', render: r => el('span', { class: 'num strong' }, U.money(r.amount)) },
            ],
            toolbar: t => el('div', { class: 'toolbar', style: { padding: '16px 22px 0' } }, el('div', { class: 'card-title', text: '季节订货汇总表' }), el('div', { class: 'sp' }), btn('导出报表', 'download', { onclick: () => exportXLS('订货汇总_按季节', ['季节', '订单数', '在订款式', '数量', '金额'], rowsS.map(r => [r.name, r.orders, r.styles, r.qty, r.amount])) })),
          }).el));
      } else if (cur === 'dealer') {
        const map = {};
        valid.forEach(o => { map[o.dealerId] = map[o.dealerId] || { qty: 0, amount: 0, cnt: 0 }; map[o.dealerId].amount += o.totalAmount; map[o.dealerId].qty += o.totalQty; map[o.dealerId].cnt++; });
        const rowsD = Object.entries(map).map(([id, v]) => { const d = XK.dealer(id), t = XK.tier(d?.tierId); return { name: d?.name || id, tier: t?.name, rate: (t.rate * 10).toFixed(1) + '折', cnt: v.cnt, qty: v.qty, amount: v.amount }; }).sort((a, b) => b.amount - a.amount);
        box.appendChild(el('div', { class: 'grid-2' },
          card('经销商订货排行', '按订货金额 TOP', hbars(rowsD.slice(0, 8).map(r => ({ label: r.name, value: r.amount })), v => U.money0(v))),
          card('订货单数分布', '', donut(rowsD.slice(0, 7).map(r => ({ label: r.name, value: r.cnt })), '订单总数', String(valid.length), v => v + ' 单'))));
        box.appendChild(card('经销商订货统计表', '',
          table({
            rows: () => rowsD,
            cols: [
              { label: '排名', render: (r, i) => badge('#' + (i + 1), i < 3 ? 'gold' : 'mut'), w: '70px' },
              { label: '经销商', key: 'name', strong: true }, { label: '等级', render: r => badge(r.tier, r.tier === '金牌经销商' ? 'gold' : r.tier === '银牌经销商' ? 'navy' : 'mut') },
              { label: '折扣', key: 'rate' }, { label: '订单数', render: r => r.cnt + ' 单' },
              { label: '数量', render: r => r.qty.toLocaleString() + ' 件' }, { label: '订货金额', render: r => el('span', { class: 'num strong' }, U.money(r.amount)) },
            ],
            toolbar: () => el('div', { class: 'toolbar', style: { padding: '16px 22px 0' } }, el('div', { class: 'card-title', text: '经销商订货统计表' }), el('div', { class: 'sp' }), btn('导出报表', 'download', { onclick: () => exportXLS('经销商订货统计', ['排名', '经销商', '等级', '折扣', '订单数', '数量', '金额'], rowsD.map((r, i) => [i + 1, r.name, r.tier, r.rate, r.cnt, r.qty, r.amount])) })),
          }).el));
      } else {
        const map = {};
        valid.forEach(o => o.items.forEach(it => {
          const st = XK.style(it.styleId); if (!st) return;
          map[st.id] = map[st.id] || { qty: 0, amount: 0 };
          map[st.id].qty += it.qty; map[st.id].amount += it.amount;
        }));
        const rowsT = Object.entries(map).map(([id, v]) => { const st = XK.style(id); return { code: st.code, name: st.name, cat: XK.category(st.categoryId)?.name, season: XK.season(st.seasonId)?.name, qty: v.qty, amount: v.amount }; }).sort((a, b) => b.amount - a.amount);
        box.appendChild(el('div', { class: 'grid-2' },
          card('款式订货金额 TOP 8', '', hbars(rowsT.slice(0, 8).map(r => ({ label: r.code, value: r.amount })), v => U.money0(v))),
          card('品类销量结构', '按数量（件）', (() => {
            const cm = {}; rowsT.forEach(r => cm[r.cat] = (cm[r.cat] || 0) + r.qty);
            return donut(Object.entries(cm).map(([k, v]) => ({ label: k, value: v })).sort((a, b) => b.value - a.value), '总销量', rowsT.reduce((s, r) => s + r.qty, 0).toLocaleString() + ' 件', v => v + ' 件');
          })())));
        box.appendChild(card('款式销量明细表', '',
          table({
            pageSize: 10,
            rows: () => rowsT,
            cols: [
              { label: '排名', render: (r, i) => badge('#' + (i + 1), i < 3 ? 'gold' : 'mut'), w: '70px' },
              { label: '款号', key: 'code', strong: true }, { label: '款式', key: 'name', strong: true },
              { label: '品类', key: 'cat' }, { label: '季节', key: 'season' },
              { label: '销量', render: r => r.qty.toLocaleString() + ' 件' }, { label: '订货金额', render: r => el('span', { class: 'num strong' }, U.money(r.amount)) },
            ],
            toolbar: t => el('div', { class: 'toolbar', style: { padding: '16px 22px 0' } }, searchBox('搜索款号 / 名称', kw => t.search(kw)), el('div', { class: 'sp' }), btn('导出报表', 'download', { onclick: () => exportXLS('款式销量统计', ['排名', '款号', '款式', '品类', '季节', '销量', '金额'], rowsT.map((r, i) => [i + 1, r.code, r.name, r.cat, r.season, r.qty, r.amount])) })),
          }).el));
      }
      function card(t, s, body) { return el('div', { class: 'card', style: { marginBottom: '16px' } }, el('div', { class: 'card-hd' }, el('div', {}, el('div', { class: 'card-title', text: t }), el('div', { class: 'card-sub', text: s }))), body); }
    }
    render();
  };

  /* ================= 权限管理 ================= */
  ADM.pages.perms = function (root) {
    const db = XK.db;
    let cur = 'users';
    const tabBar = el('div', { class: 'tabs' }, [
      el('div', { class: 'tab on', onclick: () => sw('users') }, '后台账号'),
      el('div', { class: 'tab', onclick: () => sw('daccounts') }, '经销商账号'),
      el('div', { class: 'tab', onclick: () => sw('roles') }, '角色与数据隔离'),
    ]);
    const box = el('div', {});
    root.appendChild(tabBar); root.appendChild(box);
    function sw(k) { cur = k; tabBar.querySelectorAll('.tab').forEach((t, i) => t.classList.toggle('on', ['users', 'daccounts', 'roles'][i] === k)); render(); }
    function render() {
      box.replaceChildren();
      if (cur === 'users') {
        box.appendChild(table({
          rows: () => db.users,
          cols: [
            { label: '账号', key: 'username', strong: true }, { label: '姓名', key: 'name' },
            { label: '角色', render: r => badge(r.role === 'admin' ? '系统管理员' : '运营', r.role === 'admin' ? 'gold' : 'info') },
            { label: '状态', render: r => badge(r.status === 'active' ? '正常' : '停用', r.status === 'active' ? 'ok' : 'err') },
            { label: '操作', render: r => el('span', {},
              btn('编辑', 'edit', { sm: true, onclick: () => userForm(r) }),
              btn(r.status === 'active' ? '停用' : '启用', r.status === 'active' ? 'lock' : 'check', { sm: true, onclick: () => { r.status = r.status === 'active' ? 'disabled' : 'active'; XK.log('权限管理', r.status === 'active' ? '启用账号' : '停用账号', r.username); XK.save(); render(); } })) },
          ],
          toolbar: t => el('div', { class: 'toolbar', style: { padding: '14px 22px 0' } }, searchBox('搜索账号 / 姓名', kw => t.search(kw)), el('div', { class: 'sp' }), btn('新增账号', 'plus', { cls: 'btn-primary', onclick: () => userForm(null) })),
        }).el);
      } else if (cur === 'daccounts') {
        box.appendChild(table({
          rows: () => db.dealers,
          cols: [
            { label: '账号', key: 'account.username', render: r => el('span', { class: 'num strong' }, r.account.username) },
            { label: '经销商', key: 'name' },
            { label: '等级', render: r => badge(XK.tier(r.tierId)?.name, TIER_TONE[r.tierId]) },
            { label: '账号状态', render: r => badge(r.account.enabled ? '启用' : '停用', r.account.enabled ? 'ok' : 'err') },
            { label: '经销商状态', render: r => badge(r.status === 'active' ? '正常' : '停用', r.status === 'active' ? 'ok' : 'err') },
            { label: '操作', render: r => el('span', {},
              btn('重置密码', 'refresh', { sm: true, onclick: () => { r.account.password = '123456'; XK.log('权限管理', '重置经销商密码', r.account.username); XK.save(); toast('已重置为 123456'); } }),
              btn(r.account.enabled ? '停用' : '启用', r.account.enabled ? 'lock' : 'check', { sm: true, onclick: () => { r.account.enabled = !r.account.enabled; XK.log('权限管理', r.account.enabled ? '启用' : '停用经销商账号', r.account.username); XK.save(); render(); } })) },
          ],
          toolbar: t => el('div', { class: 'toolbar', style: { padding: '14px 22px 0' } }, searchBox('搜索账号 / 名称', kw => t.search(kw))),
          footNote: '经销商账号仅能访问本经销商数据（订单、对账、库存价格按等级/单独定价展示），与管理端数据完全隔离。',
        }).el);
      } else {
        const roles = [
          ['系统管理员', 'gold', 'shield', ['全部模块可用：基础资料、经销商、订货、补退、库存、对账、报表、权限、日志', '账号与角色管理、经销商授信/定价等敏感操作', '可代录订单、重置密码']],
          ['运营', 'info', 'user', ['业务模块可用：订货审核、锁款、排产、补退审核、库存调整、对账、报表', '不可访问权限管理模块（不可见）', '基础资料可维护']],
          ['经销商', 'teal', 'users', ['仅经销商订货端：选款、订货、补退货、库存查询、对账确认', '仅可见自己的订单/对账；价格 = 单独定价或等级折扣', '受授信额度约束，超额无法提交订单']],
        ];
        box.appendChild(el('div', { class: 'notice info', style: { marginBottom: '16px' } }, icon('shield'), el('div', {}, el('b', {}, '数据隔离机制：'), '经销商端所有查询按登录身份过滤（dealerId），价格引擎按「单独定价 > 等级折扣」计算；后台按角色隐藏敏感模块。')));
        box.appendChild(el('div', { class: 'grid-2b' }, roles.map(([name, tone, ic, perms]) =>
          el('div', { class: 'card', style: { padding: '20px 22px' } },
            el('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' } }, badge(name, tone), icon(ic)),
            perms.map(p => el('div', { class: 'kv' }, el('b', { text: '✓' }), el('span', { text: p })))))));
      }
    }
    function userForm(u) {
      formModal({
        title: u ? '编辑账号 · ' + u.username : '新增后台账号', width: 460,
        fields: [
          { key: 'username', label: '登录账号', required: true, value: u?.username },
          { key: 'name', label: '姓名', required: true, value: u?.name },
          { key: 'role', label: '角色', type: 'select', options: [{ value: 'operator', label: '运营' }, { value: 'admin', label: '系统管理员' }], value: u?.role || 'operator' },
          ...(u ? [] : [{ key: 'password', label: '初始密码', required: true, value: '123456' }]),
        ],
        onOk: (v, close) => {
          if (!u && db.users.some(x => x.username === v.username)) { toast('账号已存在', 'err'); return; }
          if (u) Object.assign(u, v); else db.users.push({ id: 'U' + Date.now(), status: 'active', ...v });
          XK.log('权限管理', u ? '编辑后台账号' : '新增后台账号', v.username);
          XK.save(); close(); render(); toast('已保存账号');
        },
      });
    }
    render();
  };

  /* ================= 操作日志 ================= */
  ADM.pages.logs = function (root) {
    const db = XK.db;
    let modF = '';
    const tbl = table({
      pageSize: 15,
      rows: () => db.logs.filter(l => !modF || l.module === modF),
      cols: [
        { label: '时间', key: 'at', strong: true, w: '150px' },
        { label: '操作人', render: r => el('span', {}, r.user, r.role === 'dealer' ? badge('经销商', 'teal') : r.role === 'admin' ? badge('管理员', 'gold') : r.role === 'operator' ? badge('运营', 'info') : null) },
        { label: '模块', render: r => badge(r.module, 'navy') },
        { label: '动作', key: 'action' },
        { label: '详情', key: 'detail' },
      ],
      toolbar: t => el('div', { class: 'toolbar filters', style: { padding: '14px 22px 0' } },
        searchBox('搜索动作 / 详情 / 操作人', kw => t.search(kw)),
        (() => { const s = el('select', { class: 'sel' }, el('option', { value: '' }, '全部模块'), [...new Set(db.logs.map(l => l.module))].map(m => el('option', { value: m }, m))); s.onchange = () => { modF = s.value; t.render(); }; return s; })(),
        el('div', { class: 'sp' }),
        btn('导出日志', 'download', { onclick: () => exportXLS('操作日志_' + U.dstr(new Date()), ['时间', '操作人', '角色', '模块', '动作', '详情'], db.logs.map(l => [l.at, l.user, l.role, l.module, l.action, l.detail])) })),
      footNote: '系统记录全部关键操作留痕，最多保留 600 条。',
    });
    root.appendChild(tbl.el);
  };
})();
