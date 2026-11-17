/* ============================================================
   品牌订货分销系统 · 数据层（localStorage 持久化 + 种子数据）
   上海诩可科技有限公司
   ============================================================ */
window.XK = (function () {
  const KEY = 'xk_fengou_db_v1', SKEY = 'xk_fengou_session';
  let db = null;

  /* ---------- 工具 ---------- */
  const pad = (n) => String(n).padStart(2, '0');
  const dstr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const tstr = (d) => `${dstr(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const now = () => tstr(new Date());
  const money = (n) => '¥' + Number(n || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const money0 = (n) => '¥' + Math.round(Number(n || 0)).toLocaleString('zh-CN');
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; } }

  /* 成交价：单独定价 > 吊牌价 × 等级折扣 */
  function dealPrice(dealer, style, tiers) {
    const cp = (dealer.customPricing || []).find(p => p.styleId === style.id);
    if (cp) return cp.price;
    const t = tiers.find(t => t.id === dealer.tierId);
    return Math.round(style.tagPrice * t.rate);
  }

  /* ---------- 种子数据 ---------- */
  function seed() {
    const R = mulberry32(20261117);
    const pick = (arr) => arr[Math.floor(R() * arr.length)];
    const ri = (a, b) => a + Math.floor(R() * (b - a + 1));

    const brands = [
      { id: 'B1', code: 'FENGOU', name: 'FENGOU 主标', remark: '峰欧主力品牌线' },
      { id: 'B2', code: 'FENGOU BLACK', name: 'FENGOU BLACK', remark: '高端设计师线' },
    ];
    const categories = [
      { id: 'C1', code: 'CTY', name: '大衣' }, { id: 'C2', code: 'DWN', name: '羽绒服' },
      { id: 'C3', code: 'JKT', name: '夹克' }, { id: 'C4', code: 'WIN', name: '风衣' },
      { id: 'C5', code: 'SWT', name: '卫衣' }, { id: 'C6', code: 'KNT', name: '针织衫' },
      { id: 'C7', code: 'SHT', name: '衬衫' }, { id: 'C8', code: 'PNT', name: '裤装' },
      { id: 'C9', code: 'DRS', name: '连衣裙' },
    ];
    const seasons = [
      { id: 'S1', code: '26AW', name: '2026 秋冬', active: true },
      { id: 'S2', code: '26SS', name: '2026 春夏', active: true },
      { id: 'S3', code: '25AW', name: '2025 秋冬', active: false },
    ];
    const colors = [
      { id: 'K1', code: 'BK', name: '黑色', hex: '#1B1E24' }, { id: 'K2', code: 'IV', name: '象牙白', hex: '#F1ECE2' },
      { id: 'K3', code: 'OT', name: '燕麦', hex: '#D6C9B2' }, { id: 'K4', code: 'GR', name: '雾灰', hex: '#9AA0A6' },
      { id: 'K5', code: 'NV', name: '藏蓝', hex: '#2B3A55' }, { id: 'K6', code: 'CF', name: '咖啡', hex: '#6E4B31' },
      { id: 'K7', code: 'WN', name: '酒红', hex: '#71303A' }, { id: 'K8', code: 'MT', name: '抹茶绿', hex: '#7C8A5E' },
      { id: 'K9', code: 'HB', name: '雾霾蓝', hex: '#8AA3BC' }, { id: 'K10', code: 'CA', name: '焦糖', hex: '#B07C4E' },
    ];
    const sizeGroups = [
      { id: 'G1', code: 'TOP', name: '上装尺码组', sizes: ['S', 'M', 'L', 'XL', 'XXL'] },
      { id: 'G2', code: 'BOT', name: '下装尺码组', sizes: ['26', '27', '28', '29', '30', '31', '32'] },
      { id: 'G3', code: 'DRS', name: '裙装尺码组', sizes: ['S', 'M', 'L'] },
    ];
    const tiers = [
      { id: 'T1', name: '金牌经销商', rate: 0.42, remark: '年订货额 300 万以上' },
      { id: 'T2', name: '银牌经销商', rate: 0.45, remark: '年订货额 150-300 万' },
      { id: 'T3', name: '铜牌经销商', rate: 0.48, remark: '年订货额 150 万以下' },
    ];

    // code,name,品牌,品类,季节,吊牌价,尺码组,颜色ids,卖点
    const styleSeed = [
      ['FO26A-101', '双面呢立裁大衣', 'B1', 'C1', 'S1', 2680, 'G1', ['K1', 'K3', 'K4'], '澳洲细羊毛双面呢 · 立体剪裁'],
      ['FO26A-102', '茧型短款羽绒服', 'B1', 'C2', 'S1', 1980, 'G1', ['K1', 'K5', 'K10'], '90 白鸭绒 · 茧型廓形'],
      ['FO26A-103', '长款鹅绒派克羽绒服', 'B1', 'C2', 'S1', 2980, 'G1', ['K1', 'K4', 'K8'], '90 鹅绒 · 连帽派克'],
      ['FO26A-201', '复古灯芯绒夹克', 'B1', 'C3', 'S1', 1080, 'G1', ['K6', 'K3', 'K7'], '14W 灯芯绒 · 复古廓形'],
      ['FO26A-202', '重磅华达呢风衣', 'B1', 'C4', 'S1', 1580, 'G1', ['K9', 'K1', 'K2'], '高密华达呢 · 双排扣'],
      ['FO26A-301', '450G 重磅圆领卫衣', 'B1', 'C5', 'S1', 680, 'G1', ['K3', 'K1', 'K8', 'K4'], '450G 大克重 · 不起球'],
      ['FO26A-302', '拼色连帽卫衣', 'B1', 'C5', 'S1', 720, 'G1', ['K5', 'K2'], '撞色拼接 · 宽松版'],
      ['FO26A-401', '羊绒混纺高领针织', 'B1', 'C6', 'S1', 980, 'G1', ['K1', 'K3', 'K7'], '30% 羊绒 · 亲肤高领'],
      ['FO26A-402', '费尔岛提花毛衣', 'B1', 'C6', 'S1', 880, 'G1', ['K4', 'K6'], '经典费尔岛 · 提花工艺'],
      ['FO26A-501', '法兰绒格子衬衫', 'B1', 'C7', 'S1', 580, 'G1', ['K9', 'K7'], '加厚法兰绒 · 格型定制'],
      ['FO26A-601', '锥形西装裤', 'B1', 'C8', 'S1', 780, 'G2', ['K1', 'K4', 'K6'], '高垂坠 · 锥形九分'],
      ['FO26A-602', '直筒牛仔阔腿裤', 'B1', 'C8', 'S1', 680, 'G2', ['K5', 'K1'], '重磅赤耳丹宁 · 直筒'],
      ['FO26A-701', '压褶针织连衣裙', 'B1', 'C9', 'S1', 980, 'G3', ['K1', 'K7', 'K3'], '针织压褶 · 显瘦廓形'],
      ['FO26B-101', '轻量鸭绒马甲', 'B2', 'C2', 'S1', 980, 'G1', ['K1', 'K10'], '轻量 90 鸭绒 · 叠穿'],
      ['FO26B-201', '短款皮衣夹克', 'B2', 'C3', 'S1', 1680, 'G1', ['K1', 'K6'], '头层绵羊皮 · 机车廓形'],
      ['FO25A-101', '基础圆领卫衣', 'B1', 'C5', 'S2', 580, 'G1', ['K1', 'K2', 'K9'], '春夏返单款 · 基础百搭'],
      ['FO25A-102', '亚麻混纺衬衫', 'B1', 'C7', 'S2', 620, 'G1', ['K2', 'K3', 'K9'], '亚麻混纺 · 透气垂坠'],
      ['FO24A-101', '羊毛混纺大衣', 'B1', 'C1', 'S3', 2280, 'G1', ['K1', 'K4'], '25 秋冬经典 · 延续在产'],
    ];
    const styles = styleSeed.map((s, i) => ({
      id: 'ST' + pad(i + 1), code: s[0], name: s[1], brandId: s[2], categoryId: s[3], seasonId: s[4],
      tagPrice: s[5], sizeGroupId: s[6], colorIds: s[7], desc: s[8],
      status: s[4] === 'S3' ? 'on' : 'on', isNew: s[4] === 'S1' && i < 8, createdAt: '2026-0' + ri(6, 9) + '-' + pad(ri(1, 28)),
    }));

    const styleById = (id) => styles.find(s => s.id === id);
    // 库存：每个 SKU 可订 / 现货 / 锁定
    const inv = {};
    styles.forEach(st => {
      st.colorIds.forEach(cid => {
        sizeGroupOf(st).sizes.forEach(sz => {
          inv[skuCode(st.code, cid, sz)] = { b: ri(200, 2600), s: ri(0, 900), l: 0 };
        });
      });
    });
    function sizeGroupOf(st) { return sizeGroups.find(g => g.id === st.sizeGroupId); }
    function skuCode(styleCode, colorId, size) { return styleCode + '-' + colorId + '-' + size; }

    const dealerSeed = [
      ['D001', '杭州绪白服饰有限公司', '浙江省杭州市', '沈一白', '13800001001', 'T1', 800000],
      ['D002', '南京澜庭品牌管理有限公司', '江苏省南京市', '陆澜', '13800001002', 'T1', 700000],
      ['D003', '成都锦程服饰贸易有限公司', '四川省成都市', '何锦程', '13800001003', 'T2', 500000],
      ['D004', '武汉一禾服饰有限公司', '湖北省武汉市', '袁禾', '13800001004', 'T2', 450000],
      ['D005', '西安梵尘商贸有限公司', '陕西省西安市', '石梵尘', '13800001005', 'T3', 300000],
      ['D006', '沈阳启铭贸易有限公司', '辽宁省沈阳市', '白启铭', '13800001006', 'T3', 300000],
    ];
    const dealers = dealerSeed.map((d, i) => ({
      id: d[0], code: d[0], name: d[1], region: d[2], contact: d[3], phone: d[4], tierId: d[5],
      creditLimit: d[6], status: 'active', createdAt: '2025-' + pad(ri(3, 11)) + '-01',
      customPricing: i === 2 ? [{ styleId: 'ST2', price: 830 }] : [],   // 示例单独定价
      account: { username: d[0].toLowerCase(), password: '123456', enabled: true },
    }));

    const users = [
      { id: 'U1', username: 'admin', password: '123456', name: '张启', role: 'admin', status: 'active' },
      { id: 'U2', username: 'ops', password: '123456', name: '李桐', role: 'operator', status: 'active' },
    ];

    /* 订单生成：近 90 天 */
    const orders = [], returns = [], reorders = [], logs = [];
    const flow = ['pending', 'rejected', 'audited', 'locked', 'producing', 'closed'];
    const statusPool = [];
    for (let i = 0; i < 62; i++) {
      const r = R();
      statusPool.push(r < .10 ? 'pending' : r < .16 ? 'rejected' : r < .32 ? 'audited' : r < .5 ? 'locked' : r < .74 ? 'producing' : 'closed');
    }
    let noSeq = 1, reSeq = 1, rtSeq = 1;
    for (let d = 90; d >= 0; d--) {
      const day = new Date(); day.setDate(day.getDate() - d);
      const cnt = R() < .18 ? 0 : (R() < .55 ? 1 : 2);
      for (let k = 0; k < cnt; k++) {
        const dealer = pick(dealers);
        const nItems = ri(2, 5); const items = []; const used = new Set();
        for (let j = 0; j < nItems; j++) {
          const st = pick(styles);
          if (used.has(st.id)) continue; used.add(st.id);
          const cid = pick(st.colorIds);
          const sizes = sizeGroupOf(st).sizes;
          const size = pick(sizes.slice(0, Math.min(4, sizes.length)));
          const qty = ri(10, 60);
          items.push({ styleId: st.id, colorId: cid, size, qty, price: dealPrice(dealer, st, tiers), amount: Math.round(dealPrice(dealer, st, tiers) * qty) });
        }
        if (!items.length) continue;
        const totalQty = items.reduce((s, it) => s + it.qty, 0);
        const totalAmount = items.reduce((s, it) => s + it.amount, 0);
        const status = d < 6 ? (R() < .5 ? 'pending' : 'audited') : pick(statusPool);
        const o = {
          id: 'O' + pad(noSeq), no: 'PO-' + dstr(day).replace(/-/g, '') + '-' + pad(noSeq++),
          dealerId: dealer.id, type: 'order', status, items, totalQty, totalAmount,
          remark: '', createdAt: tstr(day), hist: [{ a: 'submitted', at: tstr(day), by: dealer.name }],
        };
        if (status !== 'pending' && status !== 'rejected') { o.auditedAt = tstr(day); o.hist.push({ a: 'audited', at: tstr(day), by: '张启' }); }
        if (['locked', 'producing', 'closed'].includes(status)) o.hist.push({ a: 'locked', at: tstr(day), by: '张启' });
        if (status === 'closed') o.hist.push({ a: 'producing', at: tstr(day), by: '李桐' }, { a: 'closed', at: tstr(day), by: '李桐' });
        if (status === 'rejected') { o.remark = '部分款式库存不足，请联系商务调整后重新提交'; o.hist.push({ a: 'rejected', at: tstr(day), by: '张启' }); }
        orders.push(o);
        // 锁定库存
        if (['audited', 'locked', 'producing', 'closed'].includes(status)) {
          o.items.forEach(it => { const st = styleById(it.styleId); if (!st) return; const k = skuCode(st.code, it.colorId, it.size); if (inv[k]) { inv[k].l += it.qty; inv[k].b = Math.max(0, inv[k].b - it.qty); } });
        }
      }
    }
    // 补货 / 退货示例
    function makeApp(type, dealer, st, cid, size, qty, status, days) {
      const day = new Date(); day.setDate(day.getDate() - days);
      const price = dealPrice(dealer, st, tiers);
      const prefix = type === 'return' ? 'RT' : 'RE';
      const seq = type === 'return' ? rtSeq++ : reSeq++;
      return {
        id: type + pad(seq), no: prefix + '-2026' + pad(seq + 30), dealerId: dealer.id, type,
        refOrderNo: orders.find(o => o.dealerId === dealer.id && o.status !== 'rejected' && o.status !== 'pending')?.no || '',
        items: [{ styleId: st.id, colorId: cid, size, qty, price, amount: price * qty }],
        totalQty: qty, totalAmount: price * qty, status,
        reason: type === 'return' ? '尺码比例调整，滞销码退回' : '补货：门店动销快，追加返单',
        createdAt: tstr(day), hist: [{ a: 'submitted', at: tstr(day), by: dealer.name }],
      };
    }
    reorders.push(makeApp('replenish', dealers[0], styles[5], 'K3', 'M', 60, 'pending', 1));
    reorders.push(makeApp('replenish', dealers[2], styles[1], 'K1', 'L', 40, 'approved', 5));
    reorders.push(makeApp('replenish', dealers[4], styles[10], 'K4', '30', 30, 'pending', 2));
    returns.push(makeApp('return', dealers[1], styles[7], 'K7', 'S', 15, 'pending', 1));
    returns.push(makeApp('return', dealers[3], styles[4], 'K9', 'M', 20, 'rejected', 8));
    returns.push(makeApp('return', dealers[5], styles[15], 'K1', 'L', 25, 'approved', 12));

    // 对账单：D001 上月已确认
    const lm = new Date(); lm.setDate(1); lm.setMonth(lm.getMonth() - 1);
    const period = `${lm.getFullYear()}-${pad(lm.getMonth() + 1)}`;
    const stOrders = orders.filter(o => o.dealerId === 'D001' && o.createdAt.slice(0, 7) === period && !['pending', 'rejected'].includes(o.status));
    const statements = [{
      id: 'Z1', no: 'ST-' + period.replace('-', '') + '-001', dealerId: 'D001', period,
      orderIds: stOrders.map(o => o.id), amount: stOrders.reduce((s, o) => s + o.totalAmount, 0),
      status: 'confirmed', createdAt: period + '-28 10:00', confirmAt: period + '-30 14:20',
    }];

    logs.push({ id: 'L1', at: now(), user: '系统', role: 'system', module: '系统', action: '初始化演示数据', detail: '品牌订货分销系统 V1.0 演示数据集' });
    return {
      meta: { v: 1, createdAt: now(), company: '上海峰欧服饰有限公司', sysName: '品牌订货分销系统', version: 'V1.0' },
      brands, categories, seasons, colors, sizeGroups, tiers, styles, dealers, users,
      orders, reorders, returns, statements, inv, logs, seq: { order: noSeq, re: reSeq, rt: rtSeq, st: 2 },
    };
  }

  /* ---------- ��久化 ---------- */
  function load() {
    try { db = JSON.parse(localStorage.getItem(KEY)); } catch (e) { db = null; }
    if (!db || !db.meta || db.meta.v !== 1) { db = seed(); persist(); }
    return db;
  }
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { console.warn('persist fail', e); } }

  /* ---------- 查询辅助 ---------- */
  const G = { get db() { return db || load(); } };
  const find = (arr, id) => (db || load())[arr].find(x => x.id === id);
  const api = {
    load, persist,
    /* 基础查询 */
    brand: (id) => find('brands', id), category: (id) => find('categories', id), season: (id) => find('seasons', id),
    color: (id) => find('colors', id), sizeGroup: (id) => find('sizeGroups', id), tier: (id) => find('tiers', id),
    style: (id) => find('styles', id), styleByCode: (c) => db.styles.find(s => s.code === c),
    dealer: (id) => find('dealers', id), user: (id) => find('users', id),
    skuCode: (styleCode, colorId, size) => styleCode + '-' + colorId + '-' + size,
    sizesOf(style) { return db.sizeGroups.find(g => g.id === style.sizeGroupId).sizes; },
    /* 价格：单独定价 > 吊牌价×等级折扣 */
    dealPrice(dealer, style) {
      const cp = (dealer.customPricing || []).find(p => p.styleId === style.id);
      if (cp) return cp.price;
      const tier = db.tiers.find(t => t.id === dealer.tierId);
      return Math.round(style.tagPrice * tier.rate);
    },
    stock(styleCode, colorId, size) { return db.inv[api.skuCode(styleCode, colorId, size)] || { b: 0, s: 0, l: 0 }; },
    stockOfStyle(style) { // 款式合计
      let b = 0, s = 0, l = 0;
      style.colorIds.forEach(cid => api.sizesOf(style).forEach(sz => { const k = api.stock(style.code, cid, sz); b += k.b; s += k.s; l += k.l; }));
      return { b, s, l };
    },
    /* 授信：已审核未完成订单占用 */
    creditUsed(dealerId) {
      return db.orders.filter(o => o.dealerId === dealerId && ['audited', 'locked', 'producing'].includes(o.status))
        .reduce((s, o) => s + o.totalAmount, 0);
    },
    /* 登录 */
    login(kind, username, password) {
      if (kind === 'admin') {
        const u = db.users.find(u => u.username === username && u.password === password && u.status === 'active');
        if (!u) return null;
        return { kind: 'admin', userId: u.id, name: u.name, role: u.role };
      }
      const d = db.dealers.find(d => d.account.username === username && d.account.password === password && d.account.enabled && d.status === 'active');
      if (!d) return null;
      return { kind: 'dealer', dealerId: d.id, name: d.name, code: d.code };
    },
    session() { try { return JSON.parse(localStorage.getItem(SKEY)); } catch (e) { return null; } },
    setSession(s) { localStorage.setItem(SKEY, JSON.stringify(s)); },
    logout() { localStorage.removeItem(SKEY); },
    /* 日志 */
    log(module, action, detail) {
      const s = api.session();
      db.logs.unshift({ id: 'L' + Date.now(), at: now(), user: s ? s.name : '游客', role: s ? (s.kind === 'admin' ? s.role : 'dealer') : '-', module, action, detail: detail || '' });
      if (db.logs.length > 600) db.logs.length = 600;
      persist();
    },
    /* 单号 */
    nextNo(type) {
      const t = now().replace(/[-: ]/g, '').slice(0, 8);
      if (type === 'order') { db.seq.order++; return 'PO-' + t + '-' + pad(db.seq.order); }
      if (type === 'replenish') { db.seq.re++; return 'RE-' + t + '-' + pad(db.seq.re); }
      if (type === 'return') { db.seq.rt++; return 'RT-' + t + '-' + pad(db.seq.rt); }
      db.seq.st++; return 'ST-' + t + '-' + pad(db.seq.st);
    },
    save() { persist(); },
    reset() { localStorage.removeItem(KEY); localStorage.removeItem(SKEY); load(); },
    util: { now, money, money0, dstr, tstr, pad },
  };
  Object.assign(G, api);
  load();
  return G;
})();
