// ═══════════════════════════════════════════════════════════
// RENDER CONTENT
// ═══════════════════════════════════════════════════════════
function renderContent(){
  document.querySelectorAll('.sb-item').forEach(function(x){x.classList.remove('active');});
  var nav=$('nav-'+S.curBook)||$('nav-dash');
  if(nav)nav.classList.add('active');
  var fn={'dash':renderDash,'S1a':renderS1a,'S2a':renderS2a,'S2b':renderS2b,
           'S2c':renderS2c,'S2d':renderS2d,'S2e':renderS2e,'S3a':renderS3a};
  (fn[S.curBook]||renderDash)();
}

// ─── DASHBOARD ────────────────────────────────────────────
function renderDash(){
  var d=S.data[S.curPeriod];
  var r=INDUSTRY_RATES[S.profile.industry];
  var totalRev=0,totalVAT=0,totalPIT=0;

  if(S.group===1){
    totalRev=d.S1a.reduce(function(s,e){return s+e.amount;},0);
  }else if(S.group===2){
    d.S2a.forEach(function(e){totalRev+=e.amount;totalVAT+=e.vatAmt;totalPIT+=e.pitAmt;});
  }else if(S.group===3){
    d.S2b.forEach(function(e){totalRev+=e.amount;totalVAT+=e.vatAmt;});
    var income=d.S2c.reduce(function(s,e){return s+(e.kind==='rev'?e.amount:-e.amount);},0);
    totalPIT=income>0?income*0.1:0; // simplified indicator
  }

  var thresh=totalRev/T500M*100;
  var threshClr=thresh<70?'var(--g1)':thresh<100?'var(--g3)':'var(--g4)';

  var h='<div class="page-header"><div><div class="page-title">Bảng tóm tắt kỳ '+S.curPeriod+'</div>'
    +'<div class="page-legal">TT 152/2025/TT-BTC · NĐ 68/2026/NĐ-CP · TT 18/2026/TT-BTC</div></div></div>';

  h+='<div class="dash-grid">'
    +'<div class="stat-card c-rev"><div class="stat-lbl">Tổng doanh thu</div>'
    +'<div class="stat-val">'+fmt(totalRev)+'</div><div class="stat-sub">'+fN(totalRev)+' đ</div></div>';

  if(S.group>1){
    h+='<div class="stat-card c-vat"><div class="stat-lbl">Thuế GTGT phải nộp</div>'
      +'<div class="stat-val" style="color:var(--g4)">'+fmt(totalVAT)+'</div><div class="stat-sub">'+fN(totalVAT)+' đ</div></div>'
      +'<div class="stat-card c-pit"><div class="stat-lbl">Thuế TNCN phải nộp</div>'
      +'<div class="stat-val" style="color:var(--g3)">'+fmt(totalPIT)+'</div><div class="stat-sub">'+fN(totalPIT)+' đ</div></div>'
      +'<div class="stat-card c-bal"><div class="stat-lbl">Tổng thuế phải nộp</div>'
      +'<div class="stat-val" style="color:var(--g1)">'+fmt(totalVAT+totalPIT)+'</div><div class="stat-sub">'+fN(totalVAT+totalPIT)+' đ</div></div>';
  }
  h+='</div>';

  if(S.group===1){
    h+='<div class="thresh-bar"><div class="thresh-label">'
      +'<span>Tiến độ doanh thu so với ngưỡng 500 triệu</span>'
      +'<span style="color:'+threshClr+';font-weight:700">'+Math.min(100,thresh).toFixed(1)+'%</span></div>'
      +'<div class="thresh-track"><div class="thresh-fill" style="width:'+Math.min(100,thresh)+'%;background:'+threshClr+'"></div></div>'
      +(thresh>=100?'<div style="margin-top:8px;font-size:12px;color:var(--g4);font-weight:600">⚠️ Đã vượt ngưỡng 500 triệu! Cần nộp thuế GTGT & TNCN từ quý phát sinh.</div>':
        thresh>=70?'<div style="margin-top:8px;font-size:12px;color:var(--g3)">⚡ Đang tiệm cận ngưỡng 500 triệu, theo dõi sát doanh thu.</div>':
        '<div style="margin-top:8px;font-size:12px;color:var(--s400)">✓ Dưới ngưỡng chịu thuế. Không cần nộp GTGT & TNCN.</div>')
      +'</div>';
  }

  // Dashboard charts
  h += '<div class="dash-grid" style="grid-template-columns: 1fr 1fr; margin-top: 20px;">'
    + '<div class="stat-card" style="padding: 16px;">'
    + '<div class="stat-lbl" style="margin-bottom:12px">Biểu đồ Doanh Thu / Chi Phí</div>'
    + '<div style="height: 250px; position: relative;"><canvas id="kthkd-bar-chart"></canvas></div>'
    + '</div>'
    + '<div class="stat-card" style="padding: 16px;">'
    + '<div class="stat-lbl" style="margin-bottom:12px">Cơ Cấu Thuế</div>'
    + '<div style="height: 250px; position: relative;"><canvas id="kthkd-pie-chart"></canvas></div>'
    + '</div>'
    + '</div>';

  // Recent entries
  var books=getBooks().filter(function(b){return b!=='S3a';});
  var recent=[];
  books.forEach(function(b){
    (d[b]||[]).slice(-5).forEach(function(e){recent.push({book:b,e:e});});
  });
  recent.sort(function(a,b){return b.e.date>a.e.date?1:-1;}).slice(0,10);

  if(recent.length>0){
    h+='<div class="tbl-wrap"><div class="tbl-hdr"><div class="tbl-title">Bút toán gần nhất</div></div>'
      +'<table><thead><tr><th>Ngày</th><th>Sổ</th><th>Diễn giải</th><th style="text-align:right">Số tiền</th></tr></thead><tbody>';
    recent.forEach(function(x){
      var m=BOOK_META[x.book];
      h+='<tr><td>'+fDate(x.e.date)+'</td><td><span style="font-size:10.5px;font-weight:700;color:'+m.color+'">'+x.book+'</span></td>'
        +'<td>'+esc(x.e.desc||x.e.disp||'')+'</td>'
        +'<td class="td-num td-rev">'+fN(x.e.amount||x.e.amtIn||0)+' đ</td></tr>';
    });
    h+='</tbody></table></div>';
  }else{
    h+='<div class="tbl-wrap"><div class="tbl-empty">Chưa có bút toán nào trong kỳ '+S.curPeriod+'<br><br>'
      +'Chọn sổ kế toán từ menu bên trái để bắt đầu ghi chép.</div></div>';
  }

  $('content').innerHTML=h;
  renderCharts(totalRev, totalVAT, totalPIT);
}

let kBarChart = null;
let kPieChart = null;
function renderCharts(rev, vat, pit) {
  if (kBarChart) kBarChart.destroy();
  if (kPieChart) kPieChart.destroy();
  
  var ctxBar = document.getElementById('kthkd-bar-chart').getContext('2d');
  kBarChart = new Chart(ctxBar, {
    type: 'bar',
    data: {
      labels: [S.curPeriod],
      datasets: [
        { label: 'Doanh thu', data: [rev], backgroundColor: '#3b82f6', borderRadius: 4 },
        { label: 'Thuế phải nộp', data: [vat + pit], backgroundColor: '#f43f5e', borderRadius: 4 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { font: { family: 'Inter', size: 11 } } } },
      scales: { y: { beginAtZero: true, ticks: { callback: function(val) { return fN(val); } } } }
    }
  });

  var ctxPie = document.getElementById('kthkd-pie-chart').getContext('2d');
  kPieChart = new Chart(ctxPie, {
    type: 'doughnut',
    data: {
      labels: ['Thuế GTGT', 'Thuế TNCN', 'Doanh thu ròng'],
      datasets: [{
        data: [vat, pit, Math.max(0, rev - vat - pit)],
        backgroundColor: ['#f43f5e', '#f59e0b', '#10b981'],
        borderWidth: 2, borderColor: '#fff'
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '65%',
      plugins: { legend: { position: 'right', labels: { font: { family: 'Inter', size: 11 } } } }
    }
  });
}


function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}

// ─── S1a: Sổ doanh thu (Nhóm 1) ──────────────────────────
function renderS1a(){
  var d=S.data[S.curPeriod].S1a;
  var total=d.reduce(function(s,e){return s+e.amount;},0);
  var m=BOOK_META.S1a;

  var h=pageHdr('S1a','Sổ Doanh Thu Bán Hàng Hóa, Dịch Vụ','S1a-HKD · Điều 4 TT 152/2025')
    +'<div class="tbl-wrap">'
    +'<div class="tbl-hdr"><div class="tbl-title"><span class="book-badge">S1a-HKD</span>'+m.full+'</div>'
    +'<div class="tbl-actions"><button class="btn-primary" onclick="openModal(\'S1a\')">+ Thêm bút toán</button></div></div>'
    +'<table><thead><tr>'
    +'<th>STT</th><th>Ngày tháng</th><th>Diễn giải</th><th style="text-align:right">Số tiền (đ)</th><th></th>'
    +'</tr></thead><tbody>';

  if(!d.length){h+='<tr><td colspan="5" class="tbl-empty">Chưa có bút toán nào. Nhấn "+ Thêm bút toán" để bắt đầu ghi.</td></tr>';}
  d.forEach(function(e,i){
    h+='<tr><td style="color:var(--s400);font-size:12px">'+(i+1)+'</td>'
      +'<td>'+fDate(e.date)+'</td><td>'+esc(e.desc)+'</td>'
      +'<td class="td-num td-rev">'+fN(e.amount)+'</td>'
      +'<td class="td-actions">'
      +'<button class="btn-edit" onclick="openModal(\'S1a\',\''+e.id+'\')">Sửa</button>'
      +'<button class="btn-del" onclick="delEntry(\'S1a\',\''+e.id+'\')">Xóa</button>'
      +'</td></tr>';
  });

  h+='</tbody>';
  if(d.length){
    h+='<tfoot class="tbl-foot"><tr><td colspan="3"><span class="total-lbl">Tổng cộng kỳ '+S.curPeriod+'</span></td>'
      +'<td class="td-num" style="color:var(--g2);font-size:16px">'+fN(total)+'</td><td></td></tr></tfoot>';
  }
  h+='</table></div>';

  // Threshold warning
  if(total>T500M*0.7){
    var pct=(total/T500M*100).toFixed(1);
    var clr=total>T500M?'var(--g4)':'var(--g3)';
    h+='<div style="padding:12px 16px;background:'+GROUPS[total>T500M?4:2].lt+';border:1px solid '+(total>T500M?GROUPS[4].b:GROUPS[2].b)+';border-radius:var(--r-sm);font-size:12.5px;color:var(--s700)">'
      +(total>T500M
        ?'⚠️ <strong style="color:'+clr+'">Doanh thu đã vượt 500 triệu!</strong> Kể từ quý phát sinh phải nộp thuế GTGT & TNCN. Liên hệ cơ quan thuế để chuyển sang kê khai theo Nhóm 2.'
        :'⚡ Doanh thu đạt '+pct+'% ngưỡng 500 triệu. Theo dõi sát để biết khi nào phải chuyển sang nộp thuế.')
      +'</div>';
  }

  $('content').innerHTML=h;
}

// ─── S2a: Sổ doanh thu (Nhóm 2) ──────────────────────────
function renderS2a(){
  var d=S.data[S.curPeriod].S2a;
  var r=INDUSTRY_RATES[S.profile.industry];
  var totalRev=0,totalVAT=0,totalPIT=0;
  d.forEach(function(e){totalRev+=e.amount;totalVAT+=e.vatAmt;totalPIT+=e.pitAmt;});

  var h=pageHdr('S2a','Sổ Doanh Thu Bán Hàng Hóa, Dịch Vụ','S2a-HKD · Điều 5 TT 152/2025')
    +'<div class="tax-summary">'
    +'<div class="ts-item ts-inc"><div class="ts-lbl">Tổng doanh thu</div>'
    +'<div class="ts-val" style="color:var(--g2)">'+fmt(totalRev)+'</div><div class="ts-sub">'+fN(totalRev)+' đồng</div></div>'
    +'<div class="ts-item ts-vat"><div class="ts-lbl">Thuế GTGT phải nộp</div>'
    +'<div class="ts-val" style="color:var(--g4)">'+fmt(totalVAT)+'</div><div class="ts-sub">'+r.vat+'% × Doanh thu</div></div>'
    +'<div class="ts-item ts-pit"><div class="ts-lbl">Thuế TNCN phải nộp</div>'
    +'<div class="ts-val" style="color:var(--g3)">'+fmt(totalPIT)+'</div>'
    +'<div class="ts-sub">'+(r.isBDS?r.pit+'% × (DT − 500tr)':r.pit+'% × DT tính thuế')+'</div></div>'
    +'<div class="ts-item ts-ok"><div class="ts-lbl">Tổng thuế phải nộp</div>'
    +'<div class="ts-val" style="color:var(--s800)">'+fmt(totalVAT+totalPIT)+'</div>'
    +'<div class="ts-sub">GTGT + TNCN</div></div>'
    +'</div>'
    +'<div class="tbl-wrap">'
    +'<div class="tbl-hdr"><div class="tbl-title"><span class="book-badge">S2a-HKD</span>'+BOOK_META.S2a.full+'</div>'
    +'<div class="tbl-actions"><button class="btn-primary" onclick="openModal(\'S2a\')">+ Thêm bút toán</button></div></div>'
    +'<table><thead><tr>'
    +'<th>STT</th><th>Số CT</th><th>Ngày CT</th><th>Ngành nghề / Diễn giải</th>'
    +'<th style="text-align:right">Doanh thu (đ)</th>'
    +'<th style="text-align:right">Thuế GTGT</th>'
    +'<th style="text-align:right">Thuế TNCN</th>'
    +'<th></th>'
    +'</tr></thead><tbody>';

  if(!d.length){h+='<tr><td colspan="8" class="tbl-empty">Chưa có bút toán nào.</td></tr>';}
  d.forEach(function(e,i){
    h+='<tr><td style="color:var(--s400);font-size:12px">'+(i+1)+'</td>'
      +'<td style="font-size:12px">'+esc(e.refNum||'')+'</td>'
      +'<td>'+fDate(e.date)+'</td>'
      +'<td><div style="font-size:13px">'+esc(e.desc)+'</div>'
      +(e.industry?'<div style="font-size:11px;color:var(--s400)">'+esc(e.industry)+'</div>':'')
      +'</td>'
      +'<td class="td-num td-rev">'+fN(e.amount)+'</td>'
      +'<td class="td-num td-vat">'+fN(e.vatAmt)+'</td>'
      +'<td class="td-num td-pit">'+fN(e.pitAmt)+'</td>'
      +'<td class="td-actions">'
      +'<button class="btn-edit" onclick="openModal(\'S2a\',\''+e.id+'\')">Sửa</button>'
      +'<button class="btn-del" onclick="delEntry(\'S2a\',\''+e.id+'\')">Xóa</button>'
      +'</td></tr>';
  });
  h+='</tbody>';
  if(d.length){
    h+='<tfoot class="tbl-foot"><tr>'
      +'<td colspan="4"><span class="total-lbl">Tổng cộng kỳ '+S.curPeriod+'</span></td>'
      +'<td class="td-num" style="color:var(--g2);font-size:15px">'+fN(totalRev)+'</td>'
      +'<td class="td-num" style="color:var(--g4);font-size:15px">'+fN(totalVAT)+'</td>'
      +'<td class="td-num" style="color:var(--g3);font-size:15px">'+fN(totalPIT)+'</td>'
      +'<td></td></tr></tfoot>';
  }
  h+='</table></div>';
  $('content').innerHTML=h;
}

// ─── S2b: Sổ DT theo GTGT (Nhóm 3) ─────────────────────
function renderS2b(){
  var d=S.data[S.curPeriod].S2b;
  var totalRev=0,totalVAT=0;
  d.forEach(function(e){totalRev+=e.amount;totalVAT+=e.vatAmt;});

  var h=pageHdr('S2b','Sổ Doanh Thu Bán Hàng Hóa, Dịch Vụ (GTGT)','S2b-HKD · Điều 6 TT 152/2025')
    +'<div class="tax-summary">'
    +'<div class="ts-item ts-inc"><div class="ts-lbl">Tổng doanh thu</div>'
    +'<div class="ts-val" style="color:var(--g2)">'+fmt(totalRev)+'</div><div class="ts-sub">'+fN(totalRev)+' đồng</div></div>'
    +'<div class="ts-item ts-vat"><div class="ts-lbl">Tổng thuế GTGT phải nộp</div>'
    +'<div class="ts-val" style="color:var(--g4)">'+fmt(totalVAT)+'</div><div class="ts-sub">Theo tỷ lệ % ngành nghề</div></div>'
    +'</div>'
    +'<div class="tbl-wrap">'
    +'<div class="tbl-hdr"><div class="tbl-title"><span class="book-badge">S2b-HKD</span>Sổ doanh thu theo ngành nghề GTGT</div>'
    +'<div class="tbl-actions"><button class="btn-primary" onclick="openModal(\'S2b\')">+ Thêm bút toán</button></div></div>'
    +'<table><thead><tr><th>STT</th><th>Số CT</th><th>Ngày CT</th><th>Ngành nghề / Diễn giải</th>'
    +'<th style="text-align:right">Doanh thu (đ)</th><th style="text-align:right">Thuế GTGT</th><th></th>'
    +'</tr></thead><tbody>';
  if(!d.length){h+='<tr><td colspan="7" class="tbl-empty">Chưa có bút toán nào.</td></tr>';}
  d.forEach(function(e,i){
    h+='<tr><td style="color:var(--s400);font-size:12px">'+(i+1)+'</td>'
      +'<td style="font-size:12px">'+esc(e.refNum||'')+'</td><td>'+fDate(e.date)+'</td>'
      +'<td>'+esc(e.desc)+(e.industry?'<div style="font-size:11px;color:var(--s400)">'+esc(e.industry)+'</div>':'')+'</td>'
      +'<td class="td-num td-rev">'+fN(e.amount)+'</td>'
      +'<td class="td-num td-vat">'+fN(e.vatAmt)+'</td>'
      +'<td class="td-actions"><button class="btn-edit" onclick="openModal(\'S2b\',\''+e.id+'\')">Sửa</button>'
      +'<button class="btn-del" onclick="delEntry(\'S2b\',\''+e.id+'\')">Xóa</button></td></tr>';
  });
  h+='</tbody>';
  if(d.length){
    h+='<tfoot class="tbl-foot"><tr><td colspan="4"><span class="total-lbl">Tổng</span></td>'
      +'<td class="td-num" style="color:var(--g2);font-size:15px">'+fN(totalRev)+'</td>'
      +'<td class="td-num" style="color:var(--g4);font-size:15px">'+fN(totalVAT)+'</td>'
      +'<td></td></tr></tfoot>';
  }
  h+='</table></div>';
  $('content').innerHTML=h;
}

// ─── S2c: Sổ DT-CP (Nhóm 3) ─────────────────────────────
function renderS2c(){
  var d=S.data[S.curPeriod].S2c;
  var totalRev=0,totalExp=0;
  d.forEach(function(e){if(e.kind==='rev')totalRev+=e.amount;else totalExp+=e.amount;});
  var income=totalRev-totalExp;
  var note=income>0?'Nộp TNCN = Thu nhập tính thuế × Thuế suất lũy tiến (Khoản 2, Điều 7, Luật TNCN 109/2025)':'Thu nhập âm → Không phát sinh thuế TNCN';

  var h=pageHdr('S2c','Sổ Chi Tiết Doanh Thu, Chi Phí','S2c-HKD · Điều 6 TT 152/2025')
    +'<div class="tax-summary">'
    +'<div class="ts-item ts-inc"><div class="ts-lbl">Tổng doanh thu</div>'
    +'<div class="ts-val" style="color:var(--g2)">'+fmt(totalRev)+'</div><div class="ts-sub">'+fN(totalRev)+' đ</div></div>'
    +'<div class="ts-item ts-vat"><div class="ts-lbl">Tổng chi phí hợp lý</div>'
    +'<div class="ts-val" style="color:var(--g4)">'+fmt(totalExp)+'</div><div class="ts-sub">'+fN(totalExp)+' đ</div></div>'
    +'<div class="ts-item ts-pit"><div class="ts-lbl">Thu nhập tính thuế TNCN</div>'
    +'<div class="ts-val" style="color:'+(income>0?'var(--g3)':'var(--g1)')+'">'+fmt(Math.abs(income))+'</div>'
    +'<div class="ts-sub">'+(income<0?'(Lỗ) ':'')+note+'</div></div>'
    +'</div>'
    +'<div class="tbl-wrap">'
    +'<div class="tbl-hdr"><div class="tbl-title"><span class="book-badge">S2c-HKD</span>Doanh thu & Chi phí</div>'
    +'<div class="tbl-actions"><button class="btn-primary" onclick="openModal(\'S2c\')">+ Thêm bút toán</button></div></div>'
    +'<table><thead><tr><th>STT</th><th>Số CT</th><th>Ngày</th><th>Loại</th><th>Diễn giải</th>'
    +'<th style="text-align:right">Doanh thu</th><th style="text-align:right">Chi phí</th><th></th>'
    +'</tr></thead><tbody>';
  if(!d.length){h+='<tr><td colspan="8" class="tbl-empty">Chưa có bút toán nào.</td></tr>';}
  d.forEach(function(e,i){
    var isRev=e.kind==='rev';
    var expType=e.expType?EXPENSE_TYPES.find(function(x){return x.id===e.expType;}):null;
    h+='<tr><td style="color:var(--s400);font-size:12px">'+(i+1)+'</td>'
      +'<td style="font-size:12px">'+esc(e.refNum||'')+'</td><td>'+fDate(e.date)+'</td>'
      +'<td><span style="font-size:11px;font-weight:700;padding:2px 7px;border-radius:100px;background:'
      +(isRev?'var(--g2-lt)':'var(--g4-lt)')+';color:'+(isRev?'var(--g2)':'var(--g4)')+';">'
      +(isRev?'Doanh thu':(expType?expType.label.slice(0,20)+'...':'Chi phí'))+'</span></td>'
      +'<td>'+esc(e.desc)+'</td>'
      +(isRev?'<td class="td-num td-rev">'+fN(e.amount)+'</td><td></td>'
              :'<td></td><td class="td-num td-vat">'+fN(e.amount)+'</td>')
      +'<td class="td-actions"><button class="btn-edit" onclick="openModal(\'S2c\',\''+e.id+'\')">Sửa</button>'
      +'<button class="btn-del" onclick="delEntry(\'S2c\',\''+e.id+'\')">Xóa</button></td></tr>';
  });
  h+='</tbody>';
  if(d.length){
    h+='<tfoot class="tbl-foot"><tr><td colspan="5"><span class="total-lbl">Tổng</span></td>'
      +'<td class="td-num" style="color:var(--g2);font-size:15px">'+fN(totalRev)+'</td>'
      +'<td class="td-num" style="color:var(--g4);font-size:15px">'+fN(totalExp)+'</td>'
      +'<td></td></tr>'
      +'<tr><td colspan="4"><span class="total-lbl">Thu nhập tính thuế TNCN = DT − CP</span></td>'
      +'<td colspan="3" class="td-num" style="color:var(--g3);font-size:15px">'+fN(income)+'</td>'
      +'<td></td></tr></tfoot>';
  }
  h+='</table></div>';
  $('content').innerHTML=h;
}

// ─── S2d: Sổ hàng hóa (Nhóm 3) ──────────────────────────
function renderS2d(){
  var d=S.data[S.curPeriod].S2d;
  var h=pageHdr('S2d','Sổ Chi Tiết Vật Liệu, Dụng Cụ, Sản Phẩm, Hàng Hóa','S2d-HKD · Điều 6 TT 152/2025')
    +'<div class="tbl-wrap">'
    +'<div class="tbl-hdr"><div class="tbl-title"><span class="book-badge">S2d-HKD</span>Theo dõi nhập, xuất, tồn hàng hóa</div>'
    +'<div class="tbl-actions"><button class="btn-primary" onclick="openModal(\'S2d\')">+ Thêm bút toán</button></div></div>'
    +'<table><thead><tr>'
    +'<th>STT</th><th>Số CT</th><th>Ngày</th><th>Tên hàng hóa</th><th>ĐVT</th>'
    +'<th style="text-align:right">Đơn giá</th>'
    +'<th style="text-align:right">SL Nhập</th><th style="text-align:right">TT Nhập</th>'
    +'<th style="text-align:right">SL Xuất</th><th style="text-align:right">TT Xuất</th>'
    +'<th></th></tr></thead><tbody>';
  if(!d.length){h+='<tr><td colspan="11" class="tbl-empty">Chưa có bút toán nào.</td></tr>';}
  d.forEach(function(e,i){
    h+='<tr><td style="color:var(--s400);font-size:12px">'+(i+1)+'</td>'
      +'<td style="font-size:12px">'+esc(e.refNum||'')+'</td>'
      +'<td>'+fDate(e.date)+'</td>'
      +'<td><strong>'+esc(e.itemName)+'</strong><br><span style="font-size:11px;color:var(--s400)">'+esc(e.desc||'')+'</span></td>'
      +'<td>'+esc(e.unit||'')+'</td>'
      +'<td class="td-num">'+fN(e.price)+'</td>'
      +'<td class="td-num" style="color:var(--g1)">'+fN(e.qtyIn)+'</td>'
      +'<td class="td-num" style="color:var(--g1)">'+fN(e.qtyIn*e.price)+'</td>'
      +'<td class="td-num" style="color:var(--g4)">'+fN(e.qtyOut)+'</td>'
      +'<td class="td-num" style="color:var(--g4)">'+fN(e.qtyOut*e.price)+'</td>'
      +'<td class="td-actions"><button class="btn-edit" onclick="openModal(\'S2d\',\''+e.id+'\')">Sửa</button>'
      +'<button class="btn-del" onclick="delEntry(\'S2d\',\''+e.id+'\')">Xóa</button></td></tr>';
  });
  h+='</tbody></table></div>';
  $('content').innerHTML=h;
}

// ─── S2e: Sổ tiền (Nhóm 3) ───────────────────────────────
function renderS2e(){
  var d=S.data[S.curPeriod].S2e;
  var totCashIn=0,totCashOut=0,totBankIn=0,totBankOut=0;
  d.forEach(function(e){totCashIn+=e.cashIn;totCashOut+=e.cashOut;totBankIn+=e.bankIn;totBankOut+=e.bankOut;});

  var h=pageHdr('S2e','Sổ Chi Tiết Tiền','S2e-HKD · Điều 6 TT 152/2025')
    +'<div class="tax-summary">'
    +'<div class="ts-item ts-ok"><div class="ts-lbl">Tiền mặt thu vào</div>'
    +'<div class="ts-val" style="color:var(--g1)">'+fmt(totCashIn)+'</div><div class="ts-sub">'+fN(totCashIn)+' đ</div></div>'
    +'<div class="ts-item ts-vat"><div class="ts-lbl">Tiền mặt chi ra</div>'
    +'<div class="ts-val" style="color:var(--g4)">'+fmt(totCashOut)+'</div><div class="ts-sub">'+fN(totCashOut)+' đ</div></div>'
    +'<div class="ts-item ts-inc"><div class="ts-lbl">Tiền gửi nhận vào</div>'
    +'<div class="ts-val" style="color:var(--g2)">'+fmt(totBankIn)+'</div><div class="ts-sub">'+fN(totBankIn)+' đ</div></div>'
    +'<div class="ts-item ts-pit"><div class="ts-lbl">Tiền gửi rút ra</div>'
    +'<div class="ts-val" style="color:var(--g3)">'+fmt(totBankOut)+'</div><div class="ts-sub">'+fN(totBankOut)+' đ</div></div>'
    +'</div>'
    +'<div class="tbl-wrap">'
    +'<div class="tbl-hdr"><div class="tbl-title"><span class="book-badge">S2e-HKD</span>Thu, chi tiền mặt và tiền gửi</div>'
    +'<div class="tbl-actions"><button class="btn-primary" onclick="openModal(\'S2e\')">+ Thêm bút toán</button></div></div>'
    +'<table><thead><tr>'
    +'<th>STT</th><th>Số CT</th><th>Ngày</th><th>Diễn giải</th>'
    +'<th style="text-align:right">TM Thu vào</th><th style="text-align:right">TM Chi ra</th>'
    +'<th>Ngân hàng</th>'
    +'<th style="text-align:right">TG Gửi vào</th><th style="text-align:right">TG Rút ra</th>'
    +'<th></th></tr></thead><tbody>';
  if(!d.length){h+='<tr><td colspan="10" class="tbl-empty">Chưa có bút toán nào.</td></tr>';}
  d.forEach(function(e,i){
    h+='<tr><td style="color:var(--s400);font-size:12px">'+(i+1)+'</td>'
      +'<td style="font-size:12px">'+esc(e.refNum||'')+'</td>'
      +'<td>'+fDate(e.date)+'</td>'
      +'<td>'+esc(e.desc)+'</td>'
      +'<td class="td-num" style="color:var(--g1)">'+(e.cashIn?fN(e.cashIn):'')+'</td>'
      +'<td class="td-num" style="color:var(--g4)">'+(e.cashOut?fN(e.cashOut):'')+'</td>'
      +'<td style="font-size:12px">'+esc(e.bankName||'')+'</td>'
      +'<td class="td-num" style="color:var(--g2)">'+(e.bankIn?fN(e.bankIn):'')+'</td>'
      +'<td class="td-num" style="color:var(--g3)">'+(e.bankOut?fN(e.bankOut):'')+'</td>'
      +'<td class="td-actions"><button class="btn-edit" onclick="openModal(\'S2e\',\''+e.id+'\')">Sửa</button>'
      +'<button class="btn-del" onclick="delEntry(\'S2e\',\''+e.id+'\')">Xóa</button></td></tr>';
  });
  h+='</tbody>';
  if(d.length){
    h+='<tfoot class="tbl-foot"><tr><td colspan="4"><span class="total-lbl">Tổng cộng kỳ</span></td>'
      +'<td class="td-num" style="color:var(--g1)">'+fN(totCashIn)+'</td>'
      +'<td class="td-num" style="color:var(--g4)">'+fN(totCashOut)+'</td>'
      +'<td></td>'
      +'<td class="td-num" style="color:var(--g2)">'+fN(totBankIn)+'</td>'
      +'<td class="td-num" style="color:var(--g3)">'+fN(totBankOut)+'</td>'
      +'<td></td></tr>'
      +'<tr><td colspan="4"><span class="total-lbl">Tồn TM = Thu − Chi</span></td>'
      +'<td colspan="2" class="td-num" style="color:var(--g1)">'+fN(totCashIn-totCashOut)+'</td>'
      +'<td><span class="total-lbl">Số dư TG</span></td>'
      +'<td colspan="2" class="td-num" style="color:var(--g2)">'+fN(totBankIn-totBankOut)+'</td>'
      +'<td></td></tr></tfoot>';
  }
  h+='</table></div>';
  $('content').innerHTML=h;
}

// ─── S3a: Sổ thuế khác (Nhóm 4) ─────────────────────────
function renderS3a(){
  var d=S.data[S.curPeriod].S3a;
  var h=pageHdr('S3a','Sổ Theo Dõi Nghĩa Vụ Thuế Khác','S3a-HKD · Điều 7 TT 152/2025')
    +'<div class="tbl-wrap">'
    +'<div class="tbl-hdr"><div class="tbl-title"><span class="book-badge" style="background:var(--g4-lt);color:var(--g4)">S3a-HKD</span>Thuế TTĐB, Tài nguyên, BVMT, Sử dụng đất</div>'
    +'<div class="tbl-actions"><button class="btn-primary" onclick="openModal(\'S3a\')">+ Thêm bút toán</button></div></div>'
    +'<table><thead><tr>'
    +'<th>STT</th><th>Ngày</th><th>Loại thuế</th><th>Diễn giải</th>'
    +'<th style="text-align:right">Lượng HH</th><th style="text-align:right">Thuế suất %</th>'
    +'<th style="text-align:right">Giá tính thuế</th><th style="text-align:right">Số thuế phải nộp</th>'
    +'<th></th></tr></thead><tbody>';
  if(!d.length){h+='<tr><td colspan="9" class="tbl-empty">Chưa có bút toán nào.</td></tr>';}
  d.forEach(function(e,i){
    var taxType=OTHER_TAX_TYPES.find(function(t){return t.id===e.taxType;})||{label:e.taxType||''};
    h+='<tr><td style="color:var(--s400);font-size:12px">'+(i+1)+'</td>'
      +'<td>'+fDate(e.date)+'</td>'
      +'<td><span style="font-size:11px;font-weight:700;padding:2px 7px;border-radius:100px;background:var(--g4-lt);color:var(--g4)">'+esc(taxType.label)+'</span></td>'
      +'<td>'+esc(e.desc)+'</td>'
      +'<td class="td-num">'+fN(e.qty)+'</td>'
      +'<td class="td-num">'+e.rate+'%</td>'
      +'<td class="td-num">'+fN(e.taxBase)+'</td>'
      +'<td class="td-num" style="color:var(--g4);font-weight:700">'+fN(e.taxAmt)+'</td>'
      +'<td class="td-actions"><button class="btn-edit" onclick="openModal(\'S3a\',\''+e.id+'\')">Sửa</button>'
      +'<button class="btn-del" onclick="delEntry(\'S3a\',\''+e.id+'\')">Xóa</button></td></tr>';
  });
  var totalTax=d.reduce(function(s,e){return s+e.taxAmt;},0);
  h+='</tbody>';
  if(d.length){
    h+='<tfoot class="tbl-foot"><tr><td colspan="7"><span class="total-lbl">Tổng thuế phải nộp</span></td>'
      +'<td class="td-num" style="color:var(--g4);font-size:15px">'+fN(totalTax)+'</td><td></td></tr></tfoot>';
  }
  h+='</table></div>';
  $('content').innerHTML=h;
}

function pageHdr(book,title,sub){
  return '<div class="page-header"><div>'
    +'<div class="page-title">'+title+' <small>'+book+'-HKD</small></div>'
    +'<div class="page-legal">Kỳ: '+S.curPeriod+' · '+S.profile.name+' · MST: '+S.profile.mst+'</div>'
    +'<div class="page-legal">'+sub+'</div></div></div>';
}

