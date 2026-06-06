/* ═══════════════════════════════════════════════════
   RENDER DASHBOARD
═══════════════════════════════════════════════════ */
function renderDashboard(D){
  const {info,bs,pl,cf,yearLabel,prevYear} = D;
  const B=bs.cy, P=bs.py;
  const L=pl.cy, LP=pl.py;
  const CF=cf.cy, CFP=cf.py;

  // Apply current theme colors to Chart.js defaults before building charts
  const cc = getChartColors();
  Chart.defaults.color       = cc.tick;
  Chart.defaults.borderColor = cc.grid;
  const scaleOpts = () => ({
    x: { grid:{color:cc.grid}, ticks:{color:cc.tick, font:{size:10}} },
    y: { grid:{color:cc.grid}, ticks:{color:cc.tick, font:{size:10}} },
  });

  /* --- Header --- */
  document.getElementById('dshCmpName').textContent = info.name||'Doanh nghiệp';
  document.getElementById('dshCmpMeta').textContent =
    `MST: ${info.mst} | ${info.addr}${info.province?', '+info.province:''} | CQT: ${info.cqt}`;
  document.getElementById('dshPeriod').textContent =
    `${info.fromDate||'01/01'} – ${info.toDate||'31/12'}/${yearLabel}`;
  document.getElementById('dshFooterDate').textContent =
    `Ngày lập: ${info.ngayLap} | ${info.nguoiKy}`;
  // Update print header
  document.getElementById('phCmpName').textContent = info.name||'–';
  document.getElementById('phCmpMeta').textContent =
    `MST: ${info.mst} | ${info.addr}${info.province?', '+info.province:''} | Kỳ: ${info.fromDate} – ${info.toDate}/${yearLabel} | Ngày lập: ${info.ngayLap}`;

  /* --- Alert --- */
  const alerts = [];
  if(info.bctcDaKiemToan==='0') alerts.push('BCTC chưa được kiểm toán');
  if(B.ct417<0) alerts.push(`Lỗ lũy kế: ${fmt(Math.abs(B.ct417))} tr.đ`);
  if(CF.ct20<0) alerts.push('Dòng tiền HĐKD âm trong kỳ');
  if(alerts.length>0){
    document.getElementById('alertBanner').innerHTML=`
    <div class="alert alert-warn">⚠ <strong>Lưu ý:</strong> ${alerts.join(' &nbsp;|&nbsp; ')}</div>`;
  }

  /* derived metrics */
  const tongTSNH = B.ct110+B.ct120+B.ct130+B.ct140+B.ct150+B.ct170;
  const tongNoNH = B.ct311+B.ct312+B.ct313+B.ct314+B.ct315+B.ct316+B.ct317+B.ct318+B.ct319+B.ct320;
  const grossMarginCY = L.ct10>0 ? L.ct20/L.ct10*100 : 0;
  const grossMarginPY = LP.ct10>0 ? LP.ct20/LP.ct10*100 : 0;
  const netMarginCY = L.ct10>0 ? L.ct60/L.ct10*100 : 0;
  const netMarginPY = LP.ct10>0 ? LP.ct60/LP.ct10*100 : 0;
  const opMarginCY = L.ct10>0 ? L.ct30/L.ct10*100 : 0;
  const avgAssets = (B.ct200+P.ct200)/2||B.ct200;
  const avgEquity = (B.ct400+P.ct400)/2||B.ct400;
  const roa = avgAssets>0 ? L.ct60/avgAssets*100 : 0;
  const roe = avgEquity>0 ? L.ct60/avgEquity*100 : 0;
  const currentRatio = tongNoNH>0 ? tongTSNH/tongNoNH : 0;
  const quickRatio = tongNoNH>0 ? (tongTSNH-B.ct140)/tongNoNH : 0;
  const cashRatio = tongNoNH>0 ? B.ct110/tongNoNH : 0;
  const debtToAsset = B.ct200>0 ? B.ct300/B.ct200*100 : 0;
  const de = B.ct400>0 ? B.ct300/B.ct400 : 0;
  const invTurnover = B.ct140>0 ? L.ct11/B.ct140 : 0;
  const receivTurnover = B.ct131>0 ? L.ct10/B.ct131 : 0;
  const ebitda = L.ct30; // simplified

  /* ─── KPI CARDS ─── */
  const kpis = [
    {label:'Doanh Thu Thuần',val:fmt(L.ct10/1e6>0?L.ct10:L.ct10/1e3),unit:'triệu đồng · Năm '+yearLabel,prev:fmt(LP.ct10/1e3),prevLabel:'Năm '+prevYear,delta:pct(L.ct10,LP.ct10),accent:L.ct10>=LP.ct10?'gold':'red',isPos:L.ct10>=LP.ct10},
    {label:'Lợi Nhuận Sau Thuế',val:fmt(L.ct60/1e3),unit:'triệu đồng',prev:fmt(LP.ct60/1e3),prevLabel:'Năm '+prevYear,delta:pct(L.ct60,LP.ct60),accent:L.ct60>=0?'green':'red',isPos:L.ct60>=0,negative:L.ct60<0},
    {label:'Tổng Tài Sản',val:fmt(B.ct200/1e3),unit:'triệu đồng · Cuối '+yearLabel,prev:fmt(P.ct200/1e3),prevLabel:'Đầu năm',delta:pct(B.ct200,P.ct200),accent:'blue',isPos:B.ct200>=P.ct200},
    {label:'Vốn Chủ Sở Hữu',val:fmt(B.ct400/1e3),unit:'triệu đồng',prev:fmt(P.ct400/1e3),prevLabel:'Đầu năm',delta:pct(B.ct400,P.ct400),accent:'cyan',isPos:B.ct400>=P.ct400},
    {label:'Biên LN Gộp',val:grossMarginCY.toFixed(2)+'%',unit:'Gross Profit Margin',prev:grossMarginPY.toFixed(2)+'%',prevLabel:'Năm '+prevYear,delta:(grossMarginCY-grossMarginPY>=0?'+':'')+((grossMarginCY-grossMarginPY).toFixed(2))+' đ.%',accent:'gold',isPos:grossMarginCY>=grossMarginPY},
    {label:'LCT Hoạt Động KD',val:fmt(CF.ct20/1e3),unit:'triệu đồng · Operating CF',prev:fmt(CFP.ct20/1e3),prevLabel:'Năm '+prevYear,delta:pct(CF.ct20,CFP.ct20),accent:CF.ct20>=0?'green':'red',isPos:CF.ct20>=0,negative:CF.ct20<0},
    {label:'Nợ Phải Trả',val:fmt(B.ct300/1e3),unit:'triệu đồng',prev:fmt(P.ct300/1e3),prevLabel:'Đầu năm',delta:pct(B.ct300,P.ct300),accent:B.ct300<=P.ct300?'green':'red',isPos:B.ct300<=P.ct300},
    {label:'Tiền & Tương Đương',val:fmt(B.ct110/1e3),unit:'triệu đồng',prev:fmt(P.ct110/1e3),prevLabel:'Đầu năm',delta:pct(B.ct110,P.ct110),accent:'purple',isPos:B.ct110>=P.ct110},
  ];

  document.getElementById('kpiGrid').innerHTML = kpis.map(k=>`
    <div class="kpi fu" data-accent="${k.accent}">
      <div class="kpi-label">${k.label}</div>
      <div class="kpi-val${k.negative?' neg':k.isPos&&k.accent==='green'?' pos':''}">${k.val}</div>
      <div class="kpi-unit">${k.unit}</div>
      <div class="kpi-bar"><div class="kpi-bar-fill" style="width:${Math.min(Math.abs(parseFloat(k.delta))||30,100)}%;background:var(--${k.accent})"></div></div>
      <div class="kpi-change">
        <span class="kpi-prev">${k.prevLabel}: ${k.prev}</span>
        <span class="kpi-delta ${k.isPos?'up':'dn'}">${k.delta}</span>
      </div>
    </div>
  `).join('');

  /* ─── BS Bar Chart ─── */
  mkChart('bsBarChart',{
    type:'bar',
    data:{
      labels:['Tiền & TĐT','Phải Thu NH','Hàng Tồn Kho','TSNH Khác','TS DH','Nợ Phải Trả','VCSH'],
      datasets:[
        {label:'Cuối '+yearLabel,data:[B.ct110,B.ct130,B.ct140,B.ct150+B.ct180,B.ct200-B.ct110-B.ct130-B.ct140-B.ct150-B.ct180||0,B.ct300,B.ct400].map(v=>Math.round(v/1e6)),
          backgroundColor:[C.gold,C.gold,C.gold,C.gold,C.gold,C.red,C.green],borderRadius:5},
        {label:'Đầu năm',data:[P.ct110,P.ct130,P.ct140,P.ct150+P.ct180,P.ct200-P.ct110-P.ct130-P.ct140-P.ct150-P.ct180||0,P.ct300,P.ct400].map(v=>Math.round(v/1e6)),
          backgroundColor:[C.blue2,C.blue2,C.blue2,C.blue2,C.blue2,C.red2,C.green2],borderRadius:5},
      ]
    },
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{position:'top',labels:{boxWidth:10,padding:12}},tooltip:{callbacks:{label:ctx=>' '+ctx.parsed.y.toLocaleString('vi-VN')+' tr'}}},
      scales:{x:{grid:{color:cc.grid},ticks:{color:cc.tick,font:{size:10}}},y:{grid:{color:cc.grid},ticks:{font:{size:10},callback:v=>(v/1000).toFixed(0)+' tỷ'}}}}
  });

  /* ─── Capital Doughnut ─── */
  mkChart('capDoughnut',{
    type:'doughnut',
    data:{
      labels:['Phải Trả NB','Vay NH','Nợ Khác','VCSH'],
      datasets:[{data:[B.ct311,B.ct312,Math.max(B.ct300-B.ct311-B.ct312,0),B.ct400].map(v=>Math.round(v/1e6)),
        backgroundColor:['rgba(255,77,77,0.75)',C.gold,'rgba(167,139,250,0.65)',C.green],
        borderColor:'#0b1220',borderWidth:2}]
    },
    options:{responsive:true,maintainAspectRatio:false,cutout:'62%',
      plugins:{legend:{position:'right',labels:{boxWidth:8,padding:6,font:{size:9}}},
      tooltip:{callbacks:{label:ctx=>' '+ctx.parsed.toLocaleString('vi-VN')+' tr'}}}}
  });

  /* ─── Asset Doughnut ─── */
  mkChart('assetDoughnut',{
    type:'doughnut',
    data:{
      labels:['Tiền','Tồn Kho','Phải Thu','TSNH Khác','TS DH'],
      datasets:[{data:[B.ct110,B.ct140,B.ct130,B.ct150+B.ct170,B.ct180].map(v=>Math.round(v/1e6)),
        backgroundColor:[C.gold,C.blue,'rgba(167,139,250,0.7)',C.cyan,'rgba(0,184,160,0.7)'],
        borderColor:'#0b1220',borderWidth:2}]
    },
    options:{responsive:true,maintainAspectRatio:false,cutout:'60%',
      plugins:{legend:{position:'right',labels:{boxWidth:8,padding:5,font:{size:9}}},
      tooltip:{callbacks:{label:ctx=>' '+ctx.parsed.toLocaleString('vi-VN')+' tr'}}}}
  });

  /* ─── Signals ─── */
  const signals = generateSignals(D,{grossMarginCY,grossMarginPY,netMarginCY,currentRatio,quickRatio,debtToAsset,invTurnover,roa,roe,tongNoNH,tongTSNH});
  document.getElementById('signalGrid').innerHTML = signals.map(s=>`
    <div class="sig ${s.type}">
      <div class="sig-ico">${s.icon}</div>
      <div><div class="sig-head">${s.head}</div><div class="sig-body">${s.body}</div></div>
    </div>`).join('');

  /* ─── BS Table ─── */
  document.getElementById('bsTable').innerHTML = renderBSTable(bs,yearLabel,prevYear);

  /* ─── PL Charts ─── */
  mkChart('plBarChart',{
    type:'bar',
    data:{
      labels:['Doanh Thu Thuần','Giá Vốn HB','LN Gộp','CP QLDN','LN HĐKD','LN Sau Thuế'],
      datasets:[
        {label:'Năm '+yearLabel,data:[L.ct10,L.ct11,L.ct20,L.ct24,L.ct30,L.ct60].map(v=>Math.round(v/1e6)),backgroundColor:C.gold,borderRadius:5},
        {label:'Năm '+prevYear,data:[LP.ct10,LP.ct11,LP.ct20,LP.ct24,LP.ct30,LP.ct60].map(v=>Math.round(v/1e6)),backgroundColor:C.blue2,borderRadius:5},
      ]
    },
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{position:'top',labels:{boxWidth:10,padding:12}},tooltip:{callbacks:{label:ctx=>' '+ctx.parsed.y.toLocaleString('vi-VN')+' tr'}}},
      scales:{x:{grid:{color:cc.grid},ticks:{color:cc.tick,font:{size:10}}},y:{grid:{color:cc.grid},ticks:{font:{size:10},callback:v=>(v/1000).toFixed(0)+' tỷ'}}}}
  });

  mkChart('profitLayerChart',{
    type:'bar',
    data:{
      labels:['LN Gộp','LN HĐKD','LN Trước Thuế','LN Sau Thuế'],
      datasets:[
        {label:'Năm '+yearLabel,data:[L.ct20,L.ct30,L.ct50,L.ct60].map(v=>Math.round(v/1e6)),
          backgroundColor:ctx=>ctx.parsed.y<0?C.red:C.green,borderRadius:6,barPercentage:0.5},
        {label:'Năm '+prevYear,data:[LP.ct20,LP.ct30,LP.ct50,LP.ct60].map(v=>Math.round(v/1e6)),
          backgroundColor:ctx=>ctx.parsed.y<0?C.red2:C.green2,borderRadius:6,barPercentage:0.5},
      ]
    },
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{position:'top',labels:{boxWidth:10,padding:12}},tooltip:{callbacks:{label:ctx=>' '+ctx.parsed.y.toLocaleString('vi-VN')+' tr'}}},
      scales:{x:{grid:{color:cc.grid}},y:{grid:{color:cc.grid},ticks:{font:{size:10},callback:v=>v.toLocaleString('vi-VN')}}}}
  });

  document.getElementById('plTable').innerHTML = renderPLTable(pl,yearLabel,prevYear);

  /* ─── CF ─── */
  document.getElementById('cfTable').innerHTML = renderCFTable(cf,yearLabel,prevYear);

  mkChart('cfBarChart',{
    type:'bar',
    data:{
      labels:['LCT HĐKD','LCT HĐ ĐT','LCT HĐ TC','LCT Thuần'],
      datasets:[
        {label:'Năm '+yearLabel,data:[CF.ct20,CF.ct30,CF.ct40,CF.ct50].map(v=>Math.round(v/1e6)),
          backgroundColor:ctx=>ctx.parsed.y>=0?C.green:C.red,borderRadius:6,barPercentage:0.55},
        {label:'Năm '+prevYear,data:[CFP.ct20,CFP.ct30,CFP.ct40,CFP.ct50].map(v=>Math.round(v/1e6)),
          backgroundColor:ctx=>ctx.parsed.y>=0?C.green2:C.red2,borderRadius:6,barPercentage:0.55},
      ]
    },
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{position:'top',labels:{boxWidth:10,padding:12}},tooltip:{callbacks:{label:ctx=>' '+ctx.parsed.y.toLocaleString('vi-VN')+' tr'}}},
      scales:{x:{grid:{color:cc.grid}},y:{grid:{color:cc.grid},ticks:{font:{size:10},callback:v=>(v/1000).toFixed(0)+' tỷ'}}}}
  });

  /* CF Waterfall */
  const maxCF = Math.max(Math.abs(CF.ct20),Math.abs(CF.ct60),1);
  const wfPct = v => Math.min(Math.abs(v)/maxCF*100,100).toFixed(1);
  document.getElementById('cfWaterfall').innerHTML = `
    <div style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px">Biến động tiền cuối kỳ (triệu đ)</div>
    ${[
      {l:'Tiền đầu kỳ',v:CF.ct60,pos:true},
      {l:'LCT từ HĐKD',v:CF.ct20,pos:CF.ct20>=0},
      {l:'LCT từ HĐ đầu tư',v:CF.ct30,pos:CF.ct30>=0},
      {l:'LCT từ HĐ TC',v:CF.ct40,pos:CF.ct40>=0},
      {l:'Tiền cuối kỳ',v:CF.ct70,pos:true,gold:true},
    ].map(r=>`
      <div class="wf-row">
        <div class="wf-label">${r.l}</div>
        <div class="wf-track">
          <div class="wf-fill ${r.gold?'wf-gold':r.pos?'wf-pos':'wf-neg'}" style="width:${wfPct(r.v)}%${!r.pos&&!r.gold?';margin-left:auto':''}">
            <span>${fmt(r.v/1e3)} tr</span>
          </div>
        </div>
      </div>`).join('')}`;

  /* ─── Ratios ─── */
  const clsBadge = {good:'<span class="r-badge good">TỐT</span>', warn:'<span class="r-badge warn">CHÚ Ý</span>', bad:'<span class="r-badge bad">NGUY HIỂM</span>'};
  document.getElementById('liqRatioGrid').innerHTML = [
    {n:'Thanh Toán Hiện Hành',v:currentRatio,f:v=>v.toFixed(2),bench:'Tốt: >2.0',cls:currentRatio>=2?'good':currentRatio>=1?'warn':'bad'},
    {n:'Thanh Toán Nhanh',v:quickRatio,f:v=>v.toFixed(2),bench:'Tốt: >1.0',cls:quickRatio>=1?'good':quickRatio>=0.7?'warn':'bad'},
    {n:'Tỷ Số Tiền Mặt',v:cashRatio,f:v=>v.toFixed(2),bench:'Tiền / Nợ NH',cls:cashRatio>=1?'good':cashRatio>=0.5?'warn':'bad'},
    {n:'Nợ / Tổng TS',v:debtToAsset,f:v=>v.toFixed(1)+'%',bench:'An toàn: <50%',cls:debtToAsset<50?'good':debtToAsset<70?'warn':'bad'},
    {n:'Hệ Số D/E',v:de,f:v=>v.toFixed(2),bench:'Nợ / VCSH',cls:de<1?'good':de<2?'warn':'bad'},
    {n:'VCSH / Tổng TS',v:B.ct200>0?B.ct400/B.ct200*100:0,f:v=>v.toFixed(1)+'%',bench:'Tự chủ TC',cls:B.ct400/B.ct200>0.5?'good':B.ct400/B.ct200>0.3?'warn':'bad'},
  ].map(r=>`<div class="ratio-card"><div class="rc-head"><div class="rc-name">${r.n}</div>${clsBadge[r.cls]}</div><div class="rc-val ${r.cls}">${r.f(r.v)}</div><div class="rc-bench">${r.bench}</div></div>`).join('');

  const dio = invTurnover>0?365/invTurnover:null;
  document.getElementById('profRatioGrid').innerHTML = [
    {n:'Biên LN Gộp',v:grossMarginCY,f:v=>v.toFixed(2)+'%',bench:'Gross Margin',cls:grossMarginCY>15?'good':grossMarginCY>5?'warn':'bad'},
    {n:'Biên LN HĐKD',v:opMarginCY,f:v=>v.toFixed(2)+'%',bench:'Operating Margin',cls:opMarginCY>10?'good':opMarginCY>0?'warn':'bad'},
    {n:'Biên LN Ròng',v:netMarginCY,f:v=>v.toFixed(2)+'%',bench:'Net Margin',cls:netMarginCY>5?'good':netMarginCY>0?'warn':'bad'},
    {n:'ROA',v:roa,f:v=>v.toFixed(2)+'%',bench:'LN / Bình quân TS',cls:roa>5?'good':roa>0?'warn':'bad'},
    {n:'ROE',v:roe,f:v=>v.toFixed(2)+'%',bench:'LN / Bình quân VCSH',cls:roe>10?'good':roe>0?'warn':'bad'},
    {n:'Vòng Quay HTK',v:invTurnover,f:v=>v>0?v.toFixed(2)+'×':'–',bench:dio?`DIO ≈ ${Math.round(dio)} ngày`:'',cls:invTurnover>4?'good':invTurnover>2?'warn':'bad'},
  ].map(r=>`<div class="ratio-card"><div class="rc-head"><div class="rc-name">${r.n}</div>${clsBadge[r.cls]}</div><div class="rc-val ${r.cls}">${r.f(r.v)}</div><div class="rc-bench">${r.bench}</div></div>`).join('');

  /* Ratio Comparison Chart */
  mkChart('ratioChart',{
    type:'bar',
    data:{
      labels:['Biên LN Gộp','Biên LN HĐKD','Biên LN Ròng','ROA','ROE'],
      datasets:[
        {label:'Năm '+yearLabel,data:[grossMarginCY,opMarginCY,netMarginCY,roa,roe].map(v=>+v.toFixed(2)),
          backgroundColor:ctx=>ctx.parsed.y<0?C.red:C.gold,borderRadius:5,barPercentage:0.5},
        {label:'Năm '+prevYear,data:[grossMarginPY,LP.ct10>0?LP.ct30/LP.ct10*100:0,netMarginPY,LP.ct60/(P.ct200||1)*100,LP.ct60/(P.ct400||1)*100].map(v=>+v.toFixed(2)),
          backgroundColor:ctx=>ctx.parsed.y<0?C.red2:C.blue2,borderRadius:5,barPercentage:0.5},
      ]
    },
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{position:'top',labels:{boxWidth:10,padding:12}},tooltip:{callbacks:{label:ctx=>' '+ctx.parsed.y.toFixed(2)+'%'}}},
      scales:{x:{grid:{color:cc.grid},ticks:{color:cc.tick,font:{size:10}}},y:{grid:{color:cc.grid},ticks:{font:{size:10},callback:v=>v.toFixed(1)+'%'}}}}
  });
}

/* ═══════════════════════════════════════════════════
   TABLE RENDERERS
═══════════════════════════════════════════════════ */
function bsRow(label, code, cy, py, indent=0, cls=''){
  const d = diff(cy,py);
  const p = pct(cy,py);
  const dcls = cy>=py?'np':'nn';
  const padStyle = indent>0?`style="padding-left:${indent*18+12}px;color:var(--text${indent>1?3:2});font-size:${indent>1?11:12}px"`:''
  return `<tr class="${cls}"><td ${padStyle}>${label}</td><td>${code}</td>
    <td class="${cy<0?'nn':''}">${fmt(cy/1e3)}</td><td class="${py<0?'nn':''}">${fmt(py/1e3)}</td>
    <td class="${dcls}">${d}</td><td class="${dcls}">${p}</td></tr>`;
}

function renderBSTable(bs,yr,py){
  const B=bs.cy,P=bs.py;
  const head=`<table><thead><tr><th style="width:46%">Chỉ Tiêu</th><th>Mã</th><th>Cuối ${yr}</th><th>Đầu ${yr}</th><th>Thay Đổi</th><th>% TĐ</th></tr></thead><tbody>`;
  const body=[
    '<tr class="tr-sec"><td colspan="6">A – TÀI SẢN</td></tr>',
    '<tr class="tr-sec" style="color:var(--blue)"><td colspan="6" style="padding-left:18px;">I. TÀI SẢN NGẮN HẠN</td></tr>',
    bsRow('1. Tiền và tương đương tiền','110',B.ct110,P.ct110,1),
    bsRow('2. Đầu tư tài chính ngắn hạn','120',B.ct120,P.ct120,1),
    bsRow('3. Các khoản phải thu ngắn hạn','130',B.ct130,P.ct130,1,'tr-hd'),
    bsRow('→ Phải thu của khách hàng','131',B.ct131,P.ct131,2),
    bsRow('→ Trả trước cho người bán NH','132',B.ct132,P.ct132||0,2),
    bsRow('→ Phải thu khác','134',B.ct134,P.ct134,2),
    bsRow('4. Hàng tồn kho (thuần)','140',B.ct140,P.ct140,1,'tr-hd'),
    bsRow('→ Hàng tồn kho','141',B.ct141,P.ct141,2),
    bsRow('5. Tài sản ngắn hạn khác','150',B.ct150,P.ct150,1),
    bsRow('6. Tài sản DH khác','180',B.ct180,P.ct180,1),
    bsRow('TỔNG CỘNG TÀI SẢN','200',B.ct200,P.ct200,0,'tr-tot'),
    '<tr class="tr-sec"><td colspan="6">B – NGUỒN VỐN</td></tr>',
    '<tr class="tr-sec" style="color:var(--red)"><td colspan="6" style="padding-left:18px;">I. NỢ PHẢI TRẢ</td></tr>',
    bsRow('Tổng nợ phải trả','300',B.ct300,P.ct300,1,'tr-hd'),
    bsRow('→ Phải trả người bán ngắn hạn','311',B.ct311,P.ct311,2),
    bsRow('→ Vay và nợ thuê TC ngắn hạn','312',B.ct312,P.ct312,2),
    bsRow('→ Thuế và các khoản nộp NN','313',B.ct313,P.ct313,2),
    bsRow('→ Phải trả người lao động','314',B.ct314,P.ct314,2),
    bsRow('→ Chi phí phải trả','315',B.ct315,P.ct315,2),
    bsRow('→ Vay và nợ DH','316',B.ct316,P.ct316,2),
    bsRow('→ Quỹ khen thưởng phúc lợi','319',B.ct319,P.ct319,2),
    '<tr class="tr-sec" style="color:var(--green)"><td colspan="6" style="padding-left:18px;">II. VỐN CHỦ SỞ HỮU</td></tr>',
    bsRow('Tổng VCSH','400',B.ct400,P.ct400,1,'tr-hd'),
    bsRow('→ Vốn đầu tư của CSH','411',B.ct411,P.ct411,2),
    bsRow('→ Thặng dư vốn cổ phần','412',B.ct412,P.ct412,2),
    bsRow('→ Các quỹ thuộc VCSH','414',B.ct414,P.ct414,2),
    bsRow('→ LNST chưa phân phối','417',B.ct417,P.ct417,2),
    bsRow('TỔNG CỘNG NGUỒN VỐN','500',B.ct500,P.ct500,0,'tr-tot'),
  ].join('');
  return head+body+'</tbody></table>';
}

function plRow(label,code,cy,py,indent=0,cls=''){
  const d=diff(cy,py); const p=pct(cy,py);
  const dcls=cy>=py?'np':'nn';
  const padStyle=indent>0?`style="padding-left:${indent*16+12}px;color:var(--text${indent>1?3:2});font-size:11px"`:''
  return `<tr class="${cls}"><td ${padStyle}>${label}</td><td>${code}</td>
    <td class="${cy<0?'nn':''}">${fmt(cy/1e3)}</td><td class="${py<0?'nn':''}">${fmt(py/1e3)}</td>
    <td class="${dcls}">${d}</td><td class="${dcls}">${p}</td></tr>`;
}

function renderPLTable(pl,yr,py){
  const L=pl.cy,LP=pl.py;
  const gm=L.ct10>0?(L.ct20/L.ct10*100).toFixed(2)+'%':'–';
  const gmp=LP.ct10>0?(LP.ct20/LP.ct10*100).toFixed(2)+'%':'–';
  const head=`<table><thead><tr><th style="width:46%">Chỉ Tiêu</th><th>Mã</th><th>Năm ${yr}</th><th>Năm ${py}</th><th>Thay Đổi</th><th>% TĐ</th></tr></thead><tbody>`;
  const body=[
    plRow('1. Doanh thu BH và CCDV','01',L.ct01,LP.ct01),
    plRow('2. Các khoản giảm trừ DT','02',L.ct02,LP.ct02,1),
    plRow('3. Doanh thu thuần','10',L.ct10,LP.ct10,0,'tr-hd'),
    plRow('4. Giá vốn hàng bán','11',L.ct11,LP.ct11,1),
    plRow('5. Lợi nhuận gộp (20=10−11)','20',L.ct20,LP.ct20,0,'tr-hd'),
    `<tr><td style="padding-left:28px;color:var(--text3);font-size:11px">⤷ Tỷ suất LN gộp / DT</td><td>–</td><td class="np">${gm}</td><td class="np">${gmp}</td><td>–</td><td>–</td></tr>`,
    plRow('6. DT hoạt động tài chính','21',L.ct21,LP.ct21,1),
    plRow('7. Chi phí tài chính','22',L.ct22,LP.ct22,1),
    plRow('8. Chi phí QLDN','24',L.ct24,LP.ct24,1),
    plRow('9. LN HĐKD (30)','30',L.ct30,LP.ct30,0,'tr-hd'),
    plRow('10. Thu nhập khác','31',L.ct31,LP.ct31,1),
    plRow('11. Chi phí khác','32',L.ct32,LP.ct32,1),
    plRow('12. LN khác (40=31−32)','40',L.ct40,LP.ct40,0),
    plRow('13. LN kế toán trước thuế','50',L.ct50,LP.ct50,0,'tr-hd'),
    plRow('14. Chi phí thuế TNDN','51',L.ct51,LP.ct51,1),
    plRow('15. LỢI NHUẬN SAU THUẾ (60)','60',L.ct60,LP.ct60,0,'tr-tot'),
  ].join('');
  return head+body+'</tbody></table>';
}

function cfRow(label,code,cy,py,cls=''){
  const isTot=cls.includes('tr-tot')||cls.includes('tr-hd');
  return `<tr class="${cls}"><td>${label}</td><td>${code}</td>
    <td class="${cy<0?'nn':cy>0?'np':''}">${fmt(cy/1e3)}</td>
    <td class="${py<0?'nn':py>0?'np':''}">${fmt(py/1e3)}</td></tr>`;
}

function renderCFTable(cf,yr,py){
  const C=cf.cy,CP=cf.py;
  const head=`<table><thead><tr><th style="width:52%">Chỉ Tiêu</th><th>Mã</th><th>Năm ${yr}</th><th>Năm ${py}</th></tr></thead><tbody>`;
  const body=[
    '<tr class="tr-sec"><td colspan="4">I. LCT từ hoạt động kinh doanh</td></tr>',
    cfRow('Thu tiền từ bán hàng, CCDV','01',C.ct01,CP.ct01),
    cfRow('Trả tiền cho NCC, người lao động','02',C.ct02,CP.ct02),
    cfRow('Nộp thuế TNDN','03',C.ct03,CP.ct03),
    cfRow('Trả lãi vay','04',C.ct04,CP.ct04),
    cfRow('Thu/chi tiền khác','05-07',C.ct05+C.ct06+C.ct07,(CP.ct05||0)+(CP.ct06||0)+(CP.ct07||0)),
    cfRow('LCT THUẦN TỪ HĐKD','20',C.ct20,CP.ct20,'tr-hd'),
    '<tr class="tr-sec"><td colspan="4">II. LCT từ hoạt động đầu tư</td></tr>',
    cfRow('LCT từ HĐ đầu tư','30',C.ct30,CP.ct30,'tr-hd'),
    '<tr class="tr-sec"><td colspan="4">III. LCT từ hoạt động tài chính</td></tr>',
    cfRow('Tiền vay trong kỳ','33',C.ct33,CP.ct33),
    cfRow('Trả nợ gốc vay','34',C.ct34,CP.ct34),
    cfRow('LCT THUẦN TỪ HĐ TC','40',C.ct40,CP.ct40,'tr-hd'),
    cfRow('LCT THUẦN TRONG KỲ','50',C.ct50,CP.ct50,'tr-tot'),
    cfRow('Tiền và TĐT tiền đầu kỳ','60',C.ct60,CP.ct60),
    cfRow('TIỀN VÀ TĐT TIỀN CUỐI KỲ','70',C.ct70,CP.ct70,'tr-tot'),
  ].join('');
  return head+body+'</tbody></table>';
}

/* ═══════════════════════════════════════════════════
   SIGNAL GENERATION
═══════════════════════════════════════════════════ */
function generateSignals(D,r){
  const {pl,bs,cf,yearLabel,prevYear}=D;
  const L=pl.cy,LP=pl.py,B=bs.cy,P=bs.py,CF=cf.cy;
  const signals=[];

  // Revenue
  const revChg = pctVal(L.ct10,LP.ct10);
  if(revChg!==null){
    if(revChg<-20) signals.push({type:'neg',icon:'📉',head:'Doanh Thu Giảm Mạnh',body:`DT giảm ${Math.abs(revChg).toFixed(1)}% so với năm ${prevYear}. Cần phân tích nguyên nhân và kế hoạch phục hồi.`});
    else if(revChg>20) signals.push({type:'pos',icon:'🚀',head:'Tăng Trưởng Doanh Thu',body:`DT tăng ${revChg.toFixed(1)}% – tín hiệu mở rộng hoạt động kinh doanh tích cực.`});
  }

  // Profitability
  if(L.ct60>=0 && LP.ct60<0) signals.push({type:'pos',icon:'✅',head:'Thoát Lỗ – Phục Hồi',body:`Chuyển từ lỗ ${Math.round(Math.abs(LP.ct60)/1e6).toLocaleString('vi-VN')} tr sang lãi ${Math.round(L.ct60/1e6).toLocaleString('vi-VN')} tr. Tín hiệu tích cực.`});
  else if(L.ct60<0 && LP.ct60<0) signals.push({type:'neg',icon:'⚠️',head:'Thua Lỗ Liên Tiếp',body:`Lỗ ${Math.round(Math.abs(L.ct60)/1e6).toLocaleString('vi-VN')} tr trong kỳ. Cần xem xét cơ cấu chi phí và chiến lược doanh thu.`});
  else if(L.ct60>=0 && LP.ct60>=0) signals.push({type:'pos',icon:'💰',head:'Duy Trì Lợi Nhuận',body:`LN dương ${Math.round(L.ct60/1e6).toLocaleString('vi-VN')} tr. Biên LN gộp: ${r.grossMarginCY.toFixed(2)}% (năm trước: ${r.grossMarginPY.toFixed(2)}%).`});

  // Gross Margin
  if(r.grossMarginCY-r.grossMarginPY>2) signals.push({type:'pos',icon:'📊',head:'Biên LN Gộp Cải Thiện',body:`Tăng ${(r.grossMarginCY-r.grossMarginPY).toFixed(2)} điểm % lên ${r.grossMarginCY.toFixed(2)}%. Kiểm soát giá vốn hiệu quả.`});
  else if(r.grossMarginCY-r.grossMarginPY<-2) signals.push({type:'neg',icon:'📉',head:'Biên LN Gộp Giảm',body:`Giảm ${Math.abs(r.grossMarginCY-r.grossMarginPY).toFixed(2)} điểm % xuống ${r.grossMarginCY.toFixed(2)}%. Áp lực chi phí tăng.`});

  // Cash flow
  if(CF.ct20<0) signals.push({type:'neg',icon:'💸',head:'Dòng Tiền HĐKD Âm',body:`LCT từ HĐKD = ${Math.round(CF.ct20/1e6).toLocaleString('vi-VN')} tr. Rủi ro thanh khoản cần theo dõi sát.`});
  else signals.push({type:'pos',icon:'💧',head:'Dòng Tiền HĐKD Dương',body:`LCT từ HĐKD = ${Math.round(CF.ct20/1e6).toLocaleString('vi-VN')} tr – khả năng tự tài trợ hoạt động tốt.`});

  // Liquidity
  if(r.currentRatio>=2) signals.push({type:'pos',icon:'🛡',head:'Thanh Khoản Ngắn Hạn Mạnh',body:`Current Ratio = ${r.currentRatio.toFixed(2)}, Quick Ratio = ${r.quickRatio.toFixed(2)}. Khả năng thanh toán nợ ngắn hạn tốt.`});
  else if(r.currentRatio<1) signals.push({type:'neg',icon:'⚡',head:'Rủi Ro Thanh Khoản',body:`Current Ratio = ${r.currentRatio.toFixed(2)} < 1. TSNH không đủ bao phủ nợ ngắn hạn. Cần chú ý.`});

  // Inventory
  if(r.invTurnover>0&&r.invTurnover<2) signals.push({type:'neu',icon:'📦',head:'Hàng Tồn Kho Luân Chuyển Chậm',body:`Vòng quay HTK = ${r.invTurnover.toFixed(2)}× (DIO ≈ ${Math.round(365/r.invTurnover)} ngày). Rủi ro ứ đọng hàng.`});
  else if(r.invTurnover>=4) signals.push({type:'pos',icon:'🔄',head:'Vòng Quay HTK Hiệu Quả',body:`Vòng quay HTK = ${r.invTurnover.toFixed(2)}×. Quản lý hàng tồn kho tốt, ít rủi ro ứ đọng.`});

  // Debt
  if(r.debtToAsset>60) signals.push({type:'neg',icon:'🏦',head:'Đòn Bẩy Tài Chính Cao',body:`Nợ/TS = ${r.debtToAsset.toFixed(1)}%. Rủi ro tài chính ở mức cao, cần cân nhắc cơ cấu vốn.`});
  else if(r.debtToAsset<40) signals.push({type:'pos',icon:'💪',head:'Cơ Cấu Vốn Lành Mạnh',body:`Nợ/TS = ${r.debtToAsset.toFixed(1)}% – mức tự chủ tài chính tốt. VCSH chiếm ${(100-r.debtToAsset).toFixed(1)}% tổng nguồn vốn.`});

  // Retained earnings
  if(B.ct417<0) signals.push({type:'neu',icon:'📋',head:'Lỗ Lũy Kế Chưa Bù Đắp',body:`LNST chưa PP = ${Math.round(Math.abs(B.ct417)/1e6).toLocaleString('vi-VN')} tr lỗ. Chưa đủ điều kiện chia cổ tức.`});

  return signals.slice(0,8);
}

