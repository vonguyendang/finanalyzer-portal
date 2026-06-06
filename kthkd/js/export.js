// ═══════════════════════════════════════════════════════════
// EXCEL EXPORT (SheetJS)
// ═══════════════════════════════════════════════════════════

// Track selections for excel modal
var XL = { books:{}, periods:{} };

function openExcelModal(){
  if(!window.XLSX){toast('Đang tải thư viện SheetJS, thử lại sau 2 giây...','info');return;}
  XL.books={};XL.periods={};
  // Default: select all books in current period
  getBooks().forEach(function(b){XL.books[b]=true;});
  S.periods.forEach(function(p){XL.periods[p]=(p===S.curPeriod);});
  renderXlModal();
  $('xl-overlay').style.display='flex';
}

function closeXlModal(){$('xl-overlay').style.display='none';}

function toggleXlBook(b){
  XL.books[b]=!XL.books[b];
  renderXlModal();
}
function toggleXlPeriod(p){
  XL.periods[p]=!XL.periods[p];
  renderXlModal();
}
function selectAllBooks(v){getBooks().forEach(function(b){XL.books[b]=v;});renderXlModal();}
function selectAllPeriods(v){S.periods.forEach(function(p){XL.periods[p]=v;});renderXlModal();}

function renderXlModal(){
  var books=getBooks();
  var selBooks=books.filter(function(b){return XL.books[b];});
  var selPeriods=S.periods.filter(function(p){return XL.periods[p];});
  var totalSheets=selBooks.length*selPeriods.length;

  var h='<div class="xl-section-lbl">📋 Chọn sổ kế toán cần xuất</div>'
    +'<div style="display:flex;gap:6px;margin-bottom:8px">'
    +'<span style="font-size:11.5px;color:var(--p);cursor:pointer;font-weight:600" onclick="selectAllBooks(true)">Chọn tất cả</span>'
    +'<span style="color:var(--s300)">|</span>'
    +'<span style="font-size:11.5px;color:var(--s400);cursor:pointer;font-weight:600" onclick="selectAllBooks(false)">Bỏ chọn</span>'
    +'</div>'
    +'<div class="xl-check-grid">';

  books.forEach(function(b){
    var m=BOOK_META[b];
    var chk=XL.books[b]?'checked':'';
    h+='<div class="xl-check '+(XL.books[b]?'checked':'')+'" onclick="toggleXlBook(\''+b+'\')">'
      +'<input type="checkbox" '+(XL.books[b]?'checked':'')+' onclick="event.stopPropagation();toggleXlBook(\''+b+'\')">'
      +m.icon+' '+m.name
      +'<span class="xc-badge">'+b+'</span>'
      +'</div>';
  });
  h+='</div>';

  if(S.periods.length>1){
    h+='<div class="xl-section-lbl">📅 Chọn kỳ kế toán</div>'
      +'<div style="display:flex;gap:6px;margin-bottom:8px">'
      +'<span style="font-size:11.5px;color:var(--p);cursor:pointer;font-weight:600" onclick="selectAllPeriods(true)">Chọn tất cả</span>'
      +'<span style="color:var(--s300)">|</span>'
      +'<span style="font-size:11.5px;color:var(--s400);cursor:pointer;font-weight:600" onclick="selectAllPeriods(false)">Bỏ chọn</span>'
      +'</div>'
      +'<div class="xl-period-grid">';
    S.periods.forEach(function(p){
      h+='<div class="xl-period-tag '+(XL.periods[p]?'checked':'')+'" onclick="toggleXlPeriod(\''+p+'\')">'
        +(XL.periods[p]?'✓ ':'')+p+'</div>';
    });
    h+='</div>';
  }

  // Thống kê & chú thích
  var entryCount=0;
  selPeriods.forEach(function(p){
    selBooks.forEach(function(b){
      if(S.data[p]&&S.data[p][b])entryCount+=S.data[p][b].length;
    });
  });

  h+='<div class="xl-preview">'
    +(totalSheets===0
      ? '<strong>⚠️ Chưa chọn</strong> sổ hoặc kỳ nào để xuất.'
      : '<strong>✅ Sẽ xuất '+totalSheets+' sheet</strong> ('
        +selBooks.map(function(b){return b+'-HKD';}).join(', ')+') '
        +'× '+selPeriods.length+' kỳ ('+(selPeriods.join(', '))+').'
        +'<br>Tổng số bút toán: <strong>'+entryCount+' dòng</strong>.'
        +'<br>Tên file: <strong>SoKeToan_'+safeName(S.profile.name)+'_'+new Date().toISOString().slice(0,10)+'.xlsx</strong>')
    +'<br><span style="color:var(--s400);font-size:11px">Mỗi sổ + kỳ = 1 sheet riêng biệt trong file Excel. Có công thức SUM tự động, tiêu đề hộ kinh doanh, căn cứ pháp lý.</span>'
    +'</div>'
    +'<div class="xl-prog" id="xl-prog"><div class="xl-prog-fill" id="xl-prog-fill"></div></div>';

  $('xl-modal-body').innerHTML=h;
}

function safeName(n){return (n||'HKD').replace(/[^a-zA-Z0-9À-ỹ\s]/g,'').replace(/\s+/g,'_').slice(0,30);}

// ─── EXCEL STYLE HELPERS ─────────────────────────────────
function xlCell(v,opts){
  if(v===null||v===undefined)v='';
  var c={v:v};
  if(typeof v==='number'){c.t='n';}else{c.t='s';}
  if(opts){
    var s={};
    if(opts.bold||opts.color||opts.bg||opts.sz||opts.align||opts.border||opts.numFmt){
      var font={};
      if(opts.bold)font.bold=true;
      if(opts.color)font.color={rgb:opts.color};
      if(opts.sz)font.sz=opts.sz||10;
      if(opts.italic)font.italic=true;
      font.name='Arial';
      s.font=font;
    }else{s.font={name:'Arial',sz:10};}
    if(opts.bg)s.fill={fgColor:{rgb:opts.bg},patternType:'solid'};
    if(opts.align)s.alignment={horizontal:opts.align,vertical:'center',wrapText:!!opts.wrap};
    else s.alignment={vertical:'center'};
    if(opts.numFmt){c.z=opts.numFmt;s.numFmt=opts.numFmt;}
    if(opts.border){
      s.border={
        top:{style:'thin',color:{rgb:'CCCCCC'}},
        bottom:{style:'thin',color:{rgb:'CCCCCC'}},
        left:{style:'thin',color:{rgb:'CCCCCC'}},
        right:{style:'thin',color:{rgb:'CCCCCC'}}
      };
    }
    c.s=s;
  }
  return c;
}

var NUM_FMT='#,##0';
var PCT_FMT='0.00%';

// Colors
var C_HDR_BG='1E3A8A'; // dark blue header
var C_HDR_FG='FFFFFF';
var C_SUB_BG='EFF6FF'; // light blue sub-header
var C_TOT_BG='F0FDF4'; // light green totals
var C_TOT_FG='15803D';
var C_REV_FG='1D4ED8';
var C_VAT_FG='DC2626';
var C_PIT_FG='D97706';
var C_EXP_FG='DC2626';
var C_ALT='F8FAFC';  // alternating row

function addRow(ws,rowData,rIdx){
  rowData.forEach(function(cell,cIdx){
    var addr=XLSX.utils.encode_cell({r:rIdx,c:cIdx});
    ws[addr]=cell;
  });
}

function setColWidths(ws,widths){
  ws['!cols']=widths.map(function(w){return{wch:w};});
}

function makeInfoBlock(ws,profile,bookCode,period,startRow){
  // Header block: company info
  var rows=[
    [{v:'SỔ KẾ TOÁN HKD – '+bookCode+'-HKD',s:{font:{name:'Arial',bold:true,sz:14,color:{rgb:C_HDR_FG}},fill:{fgColor:{rgb:C_HDR_BG},patternType:'solid'},alignment:{horizontal:'left',vertical:'center'}}}],
    [{v:BOOK_META[bookCode]?BOOK_META[bookCode].full:'Sổ kế toán',s:{font:{name:'Arial',bold:true,sz:11},alignment:{vertical:'center'}}}],
    [],
    [{v:'Hộ/Cá nhân KD:',s:{font:{name:'Arial',bold:true,sz:10}}},{v:profile.name,s:{font:{name:'Arial',sz:10,color:{rgb:C_REV_FG},bold:true}}}],
    [{v:'Địa chỉ:',s:{font:{name:'Arial',bold:true,sz:10}}},{v:profile.addr,s:{font:{name:'Arial',sz:10}}}],
    [{v:'Mã số thuế:',s:{font:{name:'Arial',bold:true,sz:10}}},{v:profile.mst,s:{font:{name:'Arial',sz:10}}}],
    [{v:'Kỳ kê khai:',s:{font:{name:'Arial',bold:true,sz:10}}},{v:period,s:{font:{name:'Arial',sz:10,bold:true,color:{rgb:C_TOT_FG}}}}],
    [{v:'Ngày xuất:',s:{font:{name:'Arial',bold:true,sz:10}}},{v:new Date().toLocaleDateString('vi-VN'),s:{font:{name:'Arial',sz:10}}}],
    [],
    [{v:'Căn cứ: TT 152/2025/TT-BTC · NĐ 68/2026/NĐ-CP · TT 18/2026/TT-BTC',s:{font:{name:'Arial',sz:9,italic:true,color:{rgb:'64748B'}},alignment:{horizontal:'left'}}}],
    []
  ];
  rows.forEach(function(row,i){
    row.forEach(function(cell,j){
      var addr=XLSX.utils.encode_cell({r:startRow+i,c:j});
      ws[addr]=cell;
    });
  });
  return startRow+rows.length;
}

// ─── SHEET BUILDERS ──────────────────────────────────────

function buildS1a(data,profile,period){
  var ws={'!ref':'A1'};
  var r=0;
  r=makeInfoBlock(ws,profile,'S1a',period,r);

  // Column headers
  var hdrs=['STT','Ngày tháng ghi sổ','Diễn giải doanh thu','Số tiền (đồng)'];
  hdrs.forEach(function(h,c){
    var addr=XLSX.utils.encode_cell({r:r,c:c});
    ws[addr]={v:h,s:{font:{name:'Arial',bold:true,sz:10,color:{rgb:C_HDR_FG}},fill:{fgColor:{rgb:C_HDR_BG},patternType:'solid'},alignment:{horizontal:'center',vertical:'center'},border:{bottom:{style:'medium',color:{rgb:'000000'}}}}};
  });
  ws['!rows']=[]; ws['!rows'][r]={hpt:20};
  r++;

  var dataStart=r;
  data.forEach(function(e,i){
    var bg=i%2===1?C_ALT:'FFFFFF';
    addRow(ws,[
      xlCell(i+1,{align:'center',border:true,bg:bg}),
      xlCell(fDate(e.date),{border:true,bg:bg}),
      xlCell(e.desc||'',{border:true,bg:bg}),
      xlCell(e.amount,{align:'right',border:true,bg:bg,numFmt:NUM_FMT,color:C_REV_FG,bold:true})
    ],r);r++;
  });

  // Total row
  var sumFormula=data.length>0?'=SUM(D'+(dataStart+1)+':D'+r+')':0;
  addRow(ws,[
    xlCell('',{}),
    xlCell('',{}),
    xlCell('TỔNG CỘNG',{bold:true,align:'right',bg:C_TOT_BG,color:C_TOT_FG}),
    {v:data.reduce(function(s,e){return s+e.amount;},0),z:NUM_FMT,f:typeof sumFormula==='string'?'SUM(D'+(dataStart+1)+':D'+r+')':undefined,
     s:{font:{name:'Arial',bold:true,sz:11,color:{rgb:C_TOT_FG}},fill:{fgColor:{rgb:C_TOT_BG},patternType:'solid'},alignment:{horizontal:'right',vertical:'center'},border:{top:{style:'medium',color:{rgb:'166534'}}}}}
  ],r);r++;

  // Note
  r++;
  var noteAddr=XLSX.utils.encode_cell({r:r,c:0});
  ws[noteAddr]={v:'Lưu ý: Khi doanh thu vượt 500 triệu đồng, hộ/cá nhân kinh doanh phải kê khai và nộp thuế GTGT, TNCN từ quý phát sinh (Điều 3, 4 NĐ 68/2026/NĐ-CP).',
    s:{font:{name:'Arial',sz:9,italic:true,color:{rgb:'92400E'}},fill:{fgColor:{rgb:'FFFBEB'},patternType:'solid'}}};

  setColWidths(ws,[6,20,50,22]);
  var lastCell=XLSX.utils.encode_cell({r:r,c:3});
  ws['!ref']='A1:'+lastCell;
  ws['!merges']=[{s:{r:0,c:0},e:{r:0,c:3}},{s:{r:1,c:0},e:{r:1,c:3}},{s:{r:9,c:0},e:{r:9,c:3}}];
  return ws;
}

function buildS2a(data,profile,period,bookCode){
  var ws={'!ref':'A1'};
  var r=0;
  r=makeInfoBlock(ws,profile,bookCode||'S2a',period,r);

  var hdrs=['STT','Số chứng từ','Ngày chứng từ','Ngành nghề / Diễn giải','Doanh thu (đồng)','Thuế GTGT (đồng)','Thuế TNCN (đồng)'];
  hdrs.forEach(function(h,c){
    var addr=XLSX.utils.encode_cell({r:r,c:c});
    ws[addr]={v:h,s:{font:{name:'Arial',bold:true,sz:10,color:{rgb:C_HDR_FG}},fill:{fgColor:{rgb:C_HDR_BG},patternType:'solid'},alignment:{horizontal:'center',vertical:'center',wrapText:true}}};
  });
  ws['!rows']=[]; ws['!rows'][r]={hpt:22};
  r++;

  var dataStart=r;
  data.forEach(function(e,i){
    var bg=i%2===1?C_ALT:'FFFFFF';
    var desc=e.desc+(e.industry?'\n('+e.industry+')':'');
    addRow(ws,[
      xlCell(i+1,{align:'center',border:true,bg:bg}),
      xlCell(e.refNum||'',{border:true,bg:bg}),
      xlCell(fDate(e.date),{border:true,bg:bg}),
      xlCell(desc,{border:true,bg:bg,wrap:true}),
      xlCell(e.amount,{align:'right',border:true,bg:bg,numFmt:NUM_FMT,color:C_REV_FG,bold:true}),
      xlCell(e.vatAmt,{align:'right',border:true,bg:bg,numFmt:NUM_FMT,color:C_VAT_FG}),
      xlCell(e.pitAmt,{align:'right',border:true,bg:bg,numFmt:NUM_FMT,color:C_PIT_FG})
    ],r);r++;
  });

  var totRev=data.reduce(function(s,e){return s+e.amount;},0);
  var totVat=data.reduce(function(s,e){return s+e.vatAmt;},0);
  var totPit=data.reduce(function(s,e){return s+e.pitAmt;},0);
  var ds=dataStart+1, de=r;
  addRow(ws,[
    xlCell('',{}),xlCell('',{}),xlCell('',{}),
    xlCell('TỔNG CỘNG',{bold:true,align:'right',bg:C_TOT_BG,color:C_TOT_FG}),
    {v:totRev,z:NUM_FMT,f:data.length?'SUM(E'+ds+':E'+de+')':undefined,s:{font:{name:'Arial',bold:true,color:{rgb:C_REV_FG}},fill:{fgColor:{rgb:C_TOT_BG},patternType:'solid'},alignment:{horizontal:'right',vertical:'center'},border:{top:{style:'medium',color:{rgb:'166534'}}}}},
    {v:totVat,z:NUM_FMT,f:data.length?'SUM(F'+ds+':F'+de+')':undefined,s:{font:{name:'Arial',bold:true,color:{rgb:C_VAT_FG}},fill:{fgColor:{rgb:'FFF1F2'},patternType:'solid'},alignment:{horizontal:'right',vertical:'center'},border:{top:{style:'medium',color:{rgb:'DC2626'}}}}},
    {v:totPit,z:NUM_FMT,f:data.length?'SUM(G'+ds+':G'+de+')':undefined,s:{font:{name:'Arial',bold:true,color:{rgb:C_PIT_FG}},fill:{fgColor:{rgb:'FFFBEB'},patternType:'solid'},alignment:{horizontal:'right',vertical:'center'},border:{top:{style:'medium',color:{rgb:'D97706'}}}}}
  ],r);r++;

  // Tax rate note
  r++;
  var ir=INDUSTRY_RATES[profile.industry];
  var noteText='Tỷ lệ % áp dụng: GTGT = '+ir.vat+'% × Doanh thu  |  TNCN = '+ir.pit+'% × '+(ir.isBDS?'(Doanh thu − 500.000.000 đồng miễn thuế)':'Doanh thu')+'  |  Căn cứ: Khoản 4 Điều 7 Luật TNCN 109/2025/QH15, Điều 3-4 NĐ 68/2026';
  var noteAddr=XLSX.utils.encode_cell({r:r,c:0});
  ws[noteAddr]={v:noteText,s:{font:{name:'Arial',sz:9,italic:true,color:{rgb:'1E3A8A'}},fill:{fgColor:{rgb:'EFF6FF'},patternType:'solid'}}};

  setColWidths(ws,[6,14,14,40,22,22,22]);
  var lastCell=XLSX.utils.encode_cell({r:r,c:6});
  ws['!ref']='A1:'+lastCell;
  ws['!merges']=[{s:{r:0,c:0},e:{r:0,c:6}},{s:{r:1,c:0},e:{r:1,c:6}},{s:{r:9,c:0},e:{r:9,c:6}},{s:{r:r,c:0},e:{r:r,c:6}}];
  return ws;
}

function buildS2b(data,profile,period){return buildS2a(data,profile,period,'S2b');}

function buildS2c(data,profile,period){
  var ws={'!ref':'A1'};
  var r=0;
  r=makeInfoBlock(ws,profile,'S2c',period,r);

  var hdrs=['STT','Số chứng từ','Ngày','Loại','Diễn giải','Doanh thu (đồng)','Chi phí (đồng)'];
  hdrs.forEach(function(h,c){
    var addr=XLSX.utils.encode_cell({r:r,c:c});
    ws[addr]={v:h,s:{font:{name:'Arial',bold:true,sz:10,color:{rgb:C_HDR_FG}},fill:{fgColor:{rgb:C_HDR_BG},patternType:'solid'},alignment:{horizontal:'center',vertical:'center',wrapText:true}}};
  });
  ws['!rows']=[]; ws['!rows'][r]={hpt:22};
  r++;

  var dataStart=r;
  var totRev=0,totExp=0;
  data.forEach(function(e,i){
    var isRev=e.kind==='rev';
    if(isRev)totRev+=e.amount; else totExp+=e.amount;
    var bg=i%2===1?C_ALT:'FFFFFF';
    var expType=e.expType?EXPENSE_TYPES.find(function(x){return x.id===e.expType;}):null;
    addRow(ws,[
      xlCell(i+1,{align:'center',border:true,bg:bg}),
      xlCell(e.refNum||'',{border:true,bg:bg}),
      xlCell(fDate(e.date),{border:true,bg:bg}),
      xlCell(isRev?'Doanh thu':(expType?expType.label:'Chi phí'),{border:true,bg:bg,color:isRev?C_REV_FG:C_VAT_FG}),
      xlCell(e.desc||'',{border:true,bg:bg}),
      isRev?xlCell(e.amount,{align:'right',border:true,bg:bg,numFmt:NUM_FMT,color:C_REV_FG,bold:true}):xlCell('',{border:true,bg:bg}),
      !isRev?xlCell(e.amount,{align:'right',border:true,bg:bg,numFmt:NUM_FMT,color:C_VAT_FG}):xlCell('',{border:true,bg:bg})
    ],r);r++;
  });

  var ds=dataStart+1,de=r;
  addRow(ws,[
    xlCell('',{}),xlCell('',{}),xlCell('',{}),xlCell('',{}),
    xlCell('TỔNG CỘNG',{bold:true,align:'right',bg:C_TOT_BG,color:C_TOT_FG}),
    {v:totRev,z:NUM_FMT,f:data.length?'SUM(F'+ds+':F'+de+')':undefined,s:{font:{name:'Arial',bold:true,color:{rgb:C_REV_FG}},fill:{fgColor:{rgb:C_TOT_BG},patternType:'solid'},alignment:{horizontal:'right'},border:{top:{style:'medium',color:{rgb:'166534'}}}}},
    {v:totExp,z:NUM_FMT,f:data.length?'SUM(G'+ds+':G'+de+')':undefined,s:{font:{name:'Arial',bold:true,color:{rgb:C_VAT_FG}},fill:{fgColor:{rgb:'FFF1F2'},patternType:'solid'},alignment:{horizontal:'right'},border:{top:{style:'medium',color:{rgb:'DC2626'}}}}}
  ],r);r++;

  // Income row
  var income=totRev-totExp;
  addRow(ws,[
    xlCell('',{}),xlCell('',{}),xlCell('',{}),xlCell('',{}),
    xlCell('THU NHẬP TÍNH THUẾ TNCN = DT − CP',{bold:true,align:'right',bg:'FFFBEB',color:C_PIT_FG}),
    {v:income,z:NUM_FMT,f:data.length?'F'+(r)+'-G'+(r):undefined,
     s:{font:{name:'Arial',bold:true,sz:11,color:{rgb:income>=0?C_TOT_FG:C_VAT_FG}},fill:{fgColor:{rgb:'FFFBEB'},patternType:'solid'},alignment:{horizontal:'right'},border:{top:{style:'medium',color:{rgb:C_PIT_FG}}}}},
    xlCell('',{})
  ],r);r++;

  setColWidths(ws,[6,14,12,28,38,22,22]);
  var lastCell=XLSX.utils.encode_cell({r:r,c:6});
  ws['!ref']='A1:'+lastCell;
  ws['!merges']=[{s:{r:0,c:0},e:{r:0,c:6}},{s:{r:1,c:0},e:{r:1,c:6}},{s:{r:9,c:0},e:{r:9,c:6}},
    {s:{r:r-1,c:0},e:{r:r-1,c:3}},{s:{r:r-2,c:0},e:{r:r-2,c:3}}];
  return ws;
}

function buildS2d(data,profile,period){
  var ws={'!ref':'A1'};
  var r=0;
  r=makeInfoBlock(ws,profile,'S2d',period,r);

  var hdrs=['STT','Số CT','Ngày','Tên hàng hóa','ĐVT','Đơn giá','SL Nhập','Thành tiền Nhập','SL Xuất','Thành tiền Xuất','Ghi chú'];
  hdrs.forEach(function(h,c){
    var addr=XLSX.utils.encode_cell({r:r,c:c});
    ws[addr]={v:h,s:{font:{name:'Arial',bold:true,sz:10,color:{rgb:C_HDR_FG}},fill:{fgColor:{rgb:C_HDR_BG},patternType:'solid'},alignment:{horizontal:'center',vertical:'center',wrapText:true}}};
  });
  ws['!rows']=[]; ws['!rows'][r]={hpt:24};
  r++;

  var totIn=0,totOut=0;
  data.forEach(function(e,i){
    var bg=i%2===1?C_ALT:'FFFFFF';
    var ttIn=e.qtyIn*e.price; var ttOut=e.qtyOut*e.price;
    totIn+=ttIn; totOut+=ttOut;
    addRow(ws,[
      xlCell(i+1,{align:'center',border:true,bg:bg}),
      xlCell(e.refNum||'',{border:true,bg:bg}),
      xlCell(fDate(e.date),{border:true,bg:bg}),
      xlCell(e.itemName||'',{border:true,bg:bg,bold:true}),
      xlCell(e.unit||'',{align:'center',border:true,bg:bg}),
      xlCell(e.price||0,{align:'right',border:true,bg:bg,numFmt:NUM_FMT}),
      xlCell(e.qtyIn||0,{align:'right',border:true,bg:bg,color:C_TOT_FG}),
      xlCell(ttIn,{align:'right',border:true,bg:bg,numFmt:NUM_FMT,color:C_TOT_FG}),
      xlCell(e.qtyOut||0,{align:'right',border:true,bg:bg,color:C_VAT_FG}),
      xlCell(ttOut,{align:'right',border:true,bg:bg,numFmt:NUM_FMT,color:C_VAT_FG}),
      xlCell(e.desc||'',{border:true,bg:bg})
    ],r);r++;
  });

  addRow(ws,[
    xlCell('',{}),xlCell('',{}),xlCell('',{}),xlCell('',{}),xlCell('',{}),
    xlCell('TỔNG CỘNG',{bold:true,align:'right',bg:C_TOT_BG,color:C_TOT_FG}),
    xlCell('',{}),
    xlCell(totIn,{align:'right',numFmt:NUM_FMT,bold:true,color:C_TOT_FG,bg:C_TOT_BG}),
    xlCell('',{}),
    xlCell(totOut,{align:'right',numFmt:NUM_FMT,bold:true,color:C_VAT_FG,bg:'FFF1F2'}),
    xlCell('')
  ],r);r++;

  setColWidths(ws,[5,11,11,28,8,14,10,20,10,20,20]);
  var lastCell=XLSX.utils.encode_cell({r:r,c:10});
  ws['!ref']='A1:'+lastCell;
  ws['!merges']=[{s:{r:0,c:0},e:{r:0,c:10}},{s:{r:1,c:0},e:{r:1,c:10}},{s:{r:9,c:0},e:{r:9,c:10}}];
  return ws;
}

function buildS2e(data,profile,period){
  var ws={'!ref':'A1'};
  var r=0;
  r=makeInfoBlock(ws,profile,'S2e',period,r);

  var hdrs=['STT','Số CT','Ngày','Diễn giải','TM Thu vào (đ)','TM Chi ra (đ)','Ngân hàng','TG Gửi vào (đ)','TG Rút ra (đ)'];
  hdrs.forEach(function(h,c){
    var addr=XLSX.utils.encode_cell({r:r,c:c});
    ws[addr]={v:h,s:{font:{name:'Arial',bold:true,sz:10,color:{rgb:C_HDR_FG}},fill:{fgColor:{rgb:C_HDR_BG},patternType:'solid'},alignment:{horizontal:'center',vertical:'center',wrapText:true}}};
  });
  ws['!rows']=[]; ws['!rows'][r]={hpt:24};
  r++;

  var tCashIn=0,tCashOut=0,tBankIn=0,tBankOut=0;
  data.forEach(function(e,i){
    var bg=i%2===1?C_ALT:'FFFFFF';
    tCashIn+=e.cashIn||0; tCashOut+=e.cashOut||0; tBankIn+=e.bankIn||0; tBankOut+=e.bankOut||0;
    addRow(ws,[
      xlCell(i+1,{align:'center',border:true,bg:bg}),
      xlCell(e.refNum||'',{border:true,bg:bg}),
      xlCell(fDate(e.date),{border:true,bg:bg}),
      xlCell(e.desc||'',{border:true,bg:bg}),
      xlCell(e.cashIn||0,{align:'right',border:true,bg:bg,numFmt:NUM_FMT,color:C_TOT_FG}),
      xlCell(e.cashOut||0,{align:'right',border:true,bg:bg,numFmt:NUM_FMT,color:C_VAT_FG}),
      xlCell(e.bankName||'',{border:true,bg:bg}),
      xlCell(e.bankIn||0,{align:'right',border:true,bg:bg,numFmt:NUM_FMT,color:C_REV_FG}),
      xlCell(e.bankOut||0,{align:'right',border:true,bg:bg,numFmt:NUM_FMT,color:C_PIT_FG})
    ],r);r++;
  });

  addRow(ws,[
    xlCell(''),xlCell(''),xlCell(''),
    xlCell('TỔNG CỘNG TRONG KỲ',{bold:true,align:'right',bg:C_TOT_BG,color:C_TOT_FG}),
    xlCell(tCashIn,{align:'right',numFmt:NUM_FMT,bold:true,color:C_TOT_FG,bg:C_TOT_BG}),
    xlCell(tCashOut,{align:'right',numFmt:NUM_FMT,bold:true,color:C_VAT_FG,bg:'FFF1F2'}),
    xlCell(''),
    xlCell(tBankIn,{align:'right',numFmt:NUM_FMT,bold:true,color:C_REV_FG,bg:'EFF6FF'}),
    xlCell(tBankOut,{align:'right',numFmt:NUM_FMT,bold:true,color:C_PIT_FG,bg:'FFFBEB'})
  ],r);r++;

  addRow(ws,[
    xlCell(''),xlCell(''),xlCell(''),
    xlCell('TỒN QUỸ TIỀN MẶT CUỐI KỲ',{bold:true,align:'right',bg:C_TOT_BG,color:C_TOT_FG}),
    xlCell(tCashIn-tCashOut,{align:'right',numFmt:NUM_FMT,bold:true,sz:11,color:C_TOT_FG,bg:C_TOT_BG}),
    xlCell(''),
    xlCell('SỐ DƯ TIỀN GỬI CUỐI KỲ',{bold:true,align:'right',bg:'EFF6FF',color:C_REV_FG}),
    xlCell(tBankIn-tBankOut,{align:'right',numFmt:NUM_FMT,bold:true,sz:11,color:C_REV_FG,bg:'EFF6FF'}),
    xlCell('')
  ],r);r++;

  setColWidths(ws,[5,11,11,36,20,20,16,20,20]);
  var lastCell=XLSX.utils.encode_cell({r:r,c:8});
  ws['!ref']='A1:'+lastCell;
  ws['!merges']=[{s:{r:0,c:0},e:{r:0,c:8}},{s:{r:1,c:0},e:{r:1,c:8}},{s:{r:9,c:0},e:{r:9,c:8}}];
  return ws;
}

function buildS3a(data,profile,period){
  var ws={'!ref':'A1'};
  var r=0;
  r=makeInfoBlock(ws,profile,'S3a',period,r);

  var hdrs=['STT','Ngày','Loại thuế','Diễn giải','Lượng HH','Giá tính thuế','Thuế suất (%)','Số thuế phải nộp (đ)'];
  hdrs.forEach(function(h,c){
    var addr=XLSX.utils.encode_cell({r:r,c:c});
    ws[addr]={v:h,s:{font:{name:'Arial',bold:true,sz:10,color:{rgb:C_HDR_FG}},fill:{fgColor:{rgb:'7C3AED'},patternType:'solid'},alignment:{horizontal:'center',vertical:'center',wrapText:true}}};
  });
  r++;

  var tot=0;
  data.forEach(function(e,i){
    var bg=i%2===1?C_ALT:'FFFFFF';
    var taxType=OTHER_TAX_TYPES.find(function(t){return t.id===e.taxType;})||{label:e.taxType||''};
    tot+=e.taxAmt||0;
    addRow(ws,[
      xlCell(i+1,{align:'center',border:true,bg:bg}),
      xlCell(fDate(e.date),{border:true,bg:bg}),
      xlCell(taxType.label,{border:true,bg:bg,color:'7C3AED',bold:true}),
      xlCell(e.desc||'',{border:true,bg:bg}),
      xlCell(e.qty||0,{align:'right',border:true,bg:bg,numFmt:'#,##0.##'}),
      xlCell(e.taxBase||0,{align:'right',border:true,bg:bg,numFmt:NUM_FMT}),
      xlCell(e.rate||0,{align:'right',border:true,bg:bg,numFmt:'0.00"%"'}),
      xlCell(e.taxAmt||0,{align:'right',border:true,bg:bg,numFmt:NUM_FMT,color:C_VAT_FG,bold:true})
    ],r);r++;
  });

  addRow(ws,[
    xlCell(''),xlCell(''),xlCell(''),xlCell(''),xlCell(''),xlCell(''),
    xlCell('TỔNG THUẾ PHẢI NỘP',{bold:true,align:'right',bg:'F5F3FF',color:'7C3AED'}),
    xlCell(tot,{align:'right',numFmt:NUM_FMT,bold:true,sz:11,color:C_VAT_FG,bg:'FFF1F2'})
  ],r);r++;

  setColWidths(ws,[5,12,30,36,12,18,14,22]);
  var lastCell=XLSX.utils.encode_cell({r:r,c:7});
  ws['!ref']='A1:'+lastCell;
  ws['!merges']=[{s:{r:0,c:0},e:{r:0,c:7}},{s:{r:1,c:0},e:{r:1,c:7}},{s:{r:9,c:0},e:{r:9,c:7}}];
  return ws;
}

function buildSummarySheet(profile,periods,books){
  var ws={'!ref':'A1'};
  var r=0;

  // Title
  var titleAddr='A1';
  ws[titleAddr]={v:'BẢNG TỔNG HỢP KẾT QUẢ KINH DOANH – '+profile.name,
    s:{font:{name:'Arial',bold:true,sz:14,color:{rgb:C_HDR_FG}},fill:{fgColor:{rgb:C_HDR_BG},patternType:'solid'},alignment:{horizontal:'left',vertical:'center'}}};
  ws['A2']={v:'MST: '+profile.mst+'  |  '+profile.addr,s:{font:{name:'Arial',sz:10,italic:true},alignment:{horizontal:'left'}}};
  ws['A3']={v:'TT 152/2025/TT-BTC · NĐ 68/2026/NĐ-CP · TT 18/2026/TT-BTC',s:{font:{name:'Arial',sz:9,italic:true,color:{rgb:'64748B'}}}};
  ws['A4']={v:'',s:{}};
  r=4;

  // Headers
  var hdrs=['Kỳ kế toán','Tổng doanh thu (đ)','Thuế GTGT (đ)','Thuế TNCN (đ)','Tổng thuế phải nộp (đ)','Số bút toán'];
  hdrs.forEach(function(h,c){
    var addr=XLSX.utils.encode_cell({r:r,c:c});
    ws[addr]={v:h,s:{font:{name:'Arial',bold:true,sz:10,color:{rgb:C_HDR_FG}},fill:{fgColor:{rgb:'1D4ED8'},patternType:'solid'},alignment:{horizontal:'center',vertical:'center',wrapText:true}}};
  });
  ws['!rows']=[]; ws['!rows'][r]={hpt:22};
  r++;

  var grandRev=0,grandVat=0,grandPit=0,grandCount=0;
  periods.forEach(function(p,pi){
    var d=S.data[p]||{};
    var rev=0,vat=0,pit=0,count=0;
    books.forEach(function(b){
      var arr=d[b]||[];
      count+=arr.length;
      if(b==='S1a'){arr.forEach(function(e){rev+=e.amount||0;});}
      else if(b==='S2a'||b==='S2b'){arr.forEach(function(e){rev+=e.amount||0;vat+=e.vatAmt||0;pit+=e.pitAmt||0;});}
      else if(b==='S2c'){arr.forEach(function(e){if(e.kind==='rev')rev+=e.amount||0;});}
    });
    grandRev+=rev;grandVat+=vat;grandPit+=pit;grandCount+=count;
    var bg=pi%2===1?C_ALT:'FFFFFF';
    addRow(ws,[
      xlCell(p,{bold:true,bg:bg}),
      xlCell(rev,{align:'right',numFmt:NUM_FMT,color:C_REV_FG,bg:bg}),
      xlCell(vat,{align:'right',numFmt:NUM_FMT,color:C_VAT_FG,bg:bg}),
      xlCell(pit,{align:'right',numFmt:NUM_FMT,color:C_PIT_FG,bg:bg}),
      xlCell(vat+pit,{align:'right',numFmt:NUM_FMT,bold:true,color:'7C3AED',bg:bg}),
      xlCell(count,{align:'center',bg:bg})
    ],r);r++;
  });

  // Grand total
  addRow(ws,[
    xlCell('TỔNG CỘNG',{bold:true,bg:C_TOT_BG,color:C_TOT_FG}),
    xlCell(grandRev,{align:'right',numFmt:NUM_FMT,bold:true,sz:11,color:C_REV_FG,bg:C_TOT_BG}),
    xlCell(grandVat,{align:'right',numFmt:NUM_FMT,bold:true,sz:11,color:C_VAT_FG,bg:'FFF1F2'}),
    xlCell(grandPit,{align:'right',numFmt:NUM_FMT,bold:true,sz:11,color:C_PIT_FG,bg:'FFFBEB'}),
    xlCell(grandVat+grandPit,{align:'right',numFmt:NUM_FMT,bold:true,sz:12,color:'7C3AED',bg:'F5F3FF'}),
    xlCell(grandCount,{align:'center',bold:true,bg:C_TOT_BG})
  ],r);r++;

  setColWidths(ws,[16,24,22,22,26,14]);
  var lastCell=XLSX.utils.encode_cell({r:r,c:5});
  ws['!ref']='A1:'+lastCell;
  ws['!merges']=[{s:{r:0,c:0},e:{r:0,c:5}},{s:{r:1,c:0},e:{r:1,c:5}},{s:{r:2,c:0},e:{r:2,c:5}}];
  return ws;
}

// ─── MAIN EXPORT FUNCTION ─────────────────────────────────
function runExcelExport(){
  var selBooks=getBooks().filter(function(b){return XL.books[b];});
  var selPeriods=S.periods.filter(function(p){return XL.periods[p];});

  if(!selBooks.length||!selPeriods.length){
    toast('Chọn ít nhất 1 sổ và 1 kỳ!','err');return;
  }
  if(!window.XLSX){toast('Thư viện SheetJS chưa tải xong, vui lòng thử lại.','err');return;}

  var prog=$('xl-prog');var fill=$('xl-prog-fill');
  prog.style.display='block';fill.style.width='10%';

  setTimeout(function(){
    try{
      var wb=XLSX.utils.book_new();
      var total=selBooks.length*selPeriods.length;
      var done=0;

      // Summary sheet first
      var summaryWs=buildSummarySheet(S.profile,selPeriods,selBooks);
      XLSX.utils.book_append_sheet(wb,summaryWs,'Tổng hợp');

      selPeriods.forEach(function(p){
        var d=S.data[p]||{};
        selBooks.forEach(function(b){
          var arr=d[b]||[];
          var sheetName=(b+' '+p).replace(/\//g,'_').slice(0,31);
          var ws;
          if(b==='S1a')ws=buildS1a(arr,S.profile,p);
          else if(b==='S2a')ws=buildS2a(arr,S.profile,p,'S2a');
          else if(b==='S2b')ws=buildS2b(arr,S.profile,p);
          else if(b==='S2c')ws=buildS2c(arr,S.profile,p);
          else if(b==='S2d')ws=buildS2d(arr,S.profile,p);
          else if(b==='S2e')ws=buildS2e(arr,S.profile,p);
          else if(b==='S3a')ws=buildS3a(arr,S.profile,p);
          else return;
          XLSX.utils.book_append_sheet(wb,ws,sheetName);
          done++;
          fill.style.width=Math.round(10+done/total*80)+'%';
        });
      });

      fill.style.width='98%';
      var fname='SoKeToan_'+safeName(S.profile.name)+'_'+new Date().toISOString().slice(0,10)+'.xlsx';
      XLSX.writeFile(wb,fname,{bookType:'xlsx',type:'binary',cellStyles:true});
      fill.style.width='100%';
      setTimeout(function(){prog.style.display='none';fill.style.width='0%';},1200);
      closeXlModal();
      toast('✅ Xuất Excel thành công! ('+wb.SheetNames.length+' sheets)');
    }catch(err){
      prog.style.display='none';fill.style.width='0%';
      toast('Lỗi xuất Excel: '+err.message,'err');
      console.error(err);
    }
  },80);
}

// Close xl modal on overlay click
document.addEventListener('DOMContentLoaded',function(){
  var ov=$('xl-overlay');
  if(ov)ov.addEventListener('click',function(e){if(e.target===this)closeXlModal();});
});

document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){closeModal();closeXlModal();}
  if((e.ctrlKey||e.metaKey)&&e.key==='s'){e.preventDefault();if(S.profile.name)exportData();}
  if((e.ctrlKey||e.metaKey)&&e.key==='e'){e.preventDefault();if(S.profile.name)openExcelModal();}
  if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){if($('overlay').classList.contains('show'))saveEntry();}
});

// Close modal on overlay click
$('overlay').addEventListener('click',function(e){if(e.target===this)closeModal();});

