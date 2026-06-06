/* ═══════════════════════════════════════════════════
   EXPORT TOAST HELPER
═══════════════════════════════════════════════════ */
function showExpToast(icon, title, sub, duration=3500){
  const t = document.createElement('div');
  t.className = 'exp-toast';
  t.innerHTML = `
    <div class="exp-toast-icon">${icon}</div>
    <div class="exp-toast-body">
      <div class="exp-toast-title">${title}</div>
      <div class="exp-toast-sub">${sub}</div>
    </div>
    <button class="exp-toast-close" onclick="this.parentNode.remove()">✕</button>
    <div class="exp-toast-bar"></div>`;
  document.body.appendChild(t);
  setTimeout(() => { if(t.parentNode) t.remove(); }, duration);
  return t;
}

/* ═══════════════════════════════════════════════════
   PDF EXPORT
═══════════════════════════════════════════════════ */
function exportPDF(){
  document.getElementById('exportMenu').classList.remove('show');
  document.getElementById('btnExport').classList.remove('open');

  if(!_currentData){
    showExpToast('⚠','Chưa có dữ liệu','Vui lòng tải file XML trước khi xuất.');
    return;
  }

  showExpToast('🖨','Đang chuẩn bị PDF…','Mở hộp thoại in – chọn "Save as PDF"',4000);

  // Small delay so toast renders first
  setTimeout(() => {
    window.print();
  }, 400);
}

/* ═══════════════════════════════════════════════════
   XLSX EXPORT
═══════════════════════════════════════════════════ */
function exportXLSX(){
  document.getElementById('exportMenu').classList.remove('show');
  document.getElementById('btnExport').classList.remove('open');

  if(!_currentData || typeof XLSX === 'undefined'){
    showExpToast('⚠','Lỗi xuất Excel','Thiếu thư viện XLSX hoặc chưa có dữ liệu.');
    return;
  }

  const toast = showExpToast('⏳','Đang tạo file Excel…','Đang tổng hợp 5 sheet dữ liệu…',8000);

  try {
    const D = _currentData;
    const {info, bs, pl, cf, yearLabel, prevYear} = D;
    const B=bs.cy, P=bs.py, L=pl.cy, LP=pl.py, CF=cf.cy, CFP=cf.py;
    const wb = XLSX.utils.book_new();

    // ── Styles helper ──
    const hdr  = (v) => ({v, t:'s', s:{font:{bold:true,sz:11,color:{rgb:'1A5276'}}, fill:{fgColor:{rgb:'D6EAF8'}}, border:allBorder(), alignment:{horizontal:'center'}}});
    const hdrY = (v) => ({v, t:'s', s:{font:{bold:true,sz:11,color:{rgb:'7D6608'}}, fill:{fgColor:{rgb:'FEF9E7'}}, border:allBorder(), alignment:{horizontal:'center'}}});
    const hdrR = (v) => ({v, t:'s', s:{font:{bold:true,sz:11,color:{rgb:'922B21'}}, fill:{fgColor:{rgb:'FDEDEC'}}, border:allBorder(), alignment:{horizontal:'center'}}});
    const hdrG = (v) => ({v, t:'s', s:{font:{bold:true,sz:11,color:{rgb:'1E8449'}}, fill:{fgColor:{rgb:'EAFAF1'}}, border:allBorder(), alignment:{horizontal:'center'}}});
    const cell  = (v, bold=false, clr='111111') => ({v, t: typeof v==='number'?'n':'s', s:{font:{bold,sz:10,color:{rgb:clr}}, border:allBorder()}});
    const numCell = (v, bold=false, clr='111111') => ({v: isNaN(v)?0:v, t:'n', s:{font:{bold,sz:10,color:{rgb:clr}}, border:allBorder(), numFmt:'#,##0'}});
    const pctCell = (v, clr='111111') => ({v: isNaN(v)?'–':(v===null?'–':(v>=0?'+':'')+v.toFixed(1)+'%'), t:'s', s:{font:{sz:10,color:{rgb:clr}}, border:allBorder()}});
    const secHdr = (v) => ({v, t:'s', s:{font:{bold:true,sz:10,color:{rgb:'FFFFFF'}}, fill:{fgColor:{rgb:'1A5276'}}, border:allBorder()}});
    const emptyCell = () => ({v:'', t:'s', s:{border:allBorder()}});

    function allBorder(){ return {top:{style:'thin',color:{rgb:'CCCCCC'}},bottom:{style:'thin',color:{rgb:'CCCCCC'}},left:{style:'thin',color:{rgb:'CCCCCC'}},right:{style:'thin',color:{rgb:'CCCCCC'}}}; }
    function pctColor(a,b){ const v=b&&b!==0?((a-b)/Math.abs(b)*100):null; if(v===null)return'888888'; return v>=0?'1E8449':'922B21'; }
    function pctStr(a,b){ if(!b||b===0) return '–'; const v=(a-b)/Math.abs(b)*100; return (v>=0?'+':'')+v.toFixed(1)+'%'; }
    function diffTr(a,b){ const d=Math.round((a-b)/1000); return (d>=0?'+':'')+d.toLocaleString('vi-VN'); }
    const toTr = v => Math.round(v/1e6);

    // ─────────────────────────────────────────
    // SHEET 1 – THÔNG TIN & KPI
    // ─────────────────────────────────────────
    const tongTSNH = B.ct110+B.ct120+B.ct130+B.ct140+B.ct150+B.ct170;
    const tongNoNH = B.ct311+B.ct312+B.ct313+B.ct314+B.ct315+B.ct316+B.ct317+B.ct318+B.ct319+B.ct320;
    const gm = L.ct10>0?L.ct20/L.ct10*100:0;
    const nm = L.ct10>0?L.ct60/L.ct10*100:0;
    const om = L.ct10>0?L.ct30/L.ct10*100:0;
    const avgA=(B.ct200+P.ct200)/2||B.ct200;
    const avgE=(B.ct400+P.ct400)/2||B.ct400;
    const roa=avgA>0?L.ct60/avgA*100:0;
    const roe=avgE>0?L.ct60/avgE*100:0;
    const cr=tongNoNH>0?tongTSNH/tongNoNH:0;
    const qr=tongNoNH>0?(tongTSNH-B.ct140)/tongNoNH:0;
    const da=B.ct200>0?B.ct300/B.ct200*100:0;
    const de=B.ct400>0?B.ct300/B.ct400:0;
    const invT=B.ct140>0?L.ct11/B.ct140:0;

    const s1Data = [
      [{v:'PHÂN TÍCH BÁO CÁO TÀI CHÍNH – MẪU B01A (TT133/2016/TT-BTC)',t:'s',s:{font:{bold:true,sz:14,color:{rgb:'1A5276'}},fill:{fgColor:{rgb:'D6EAF8'}}}}],
      [],
      [{v:'I. THÔNG TIN DOANH NGHIỆP',t:'s',s:{font:{bold:true,sz:11,color:{rgb:'FFFFFF'}},fill:{fgColor:{rgb:'1A5276'}}}}],
      [cell('Tên doanh nghiệp',true), cell(info.name)],
      [cell('Mã số thuế',true), cell(info.mst)],
      [cell('Địa chỉ',true), cell(info.addr+(info.province?', '+info.province:''))],
      [cell('Cơ quan thuế',true), cell(info.cqt)],
      [cell('Kỳ báo cáo',true), cell(`${info.fromDate} – ${info.toDate}/${yearLabel}`)],
      [cell('Ngày lập',true), cell(info.ngayLap)],
      [cell('Người ký',true), cell(info.nguoiKy)],
      [cell('Kiểm toán',true), cell(info.bctcDaKiemToan==='1'?'Đã kiểm toán':'Chưa kiểm toán')],
      [],
      [hdr('CHỈ TIÊU'), hdr(`NĂM ${yearLabel} (tr.đ)`), hdr(`NĂM ${prevYear} (tr.đ)`), hdr('THAY ĐỔI'), hdr('% THAY ĐỔI')],
      [cell('II. TÓM TẮT KẾT QUẢ KINH DOANH',true,'1A5276'), emptyCell(), emptyCell(), emptyCell(), emptyCell()],
      [cell('Doanh thu thuần'), numCell(toTr(L.ct10)), numCell(toTr(LP.ct10)), cell(diffTr(L.ct10,LP.ct10),false,pctColor(L.ct10,LP.ct10)), {v:pctStr(L.ct10,LP.ct10),t:'s',s:{font:{color:{rgb:pctColor(L.ct10,LP.ct10)}},border:allBorder()}}],
      [cell('Lợi nhuận gộp'), numCell(toTr(L.ct20)), numCell(toTr(LP.ct20)), cell(diffTr(L.ct20,LP.ct20),false,pctColor(L.ct20,LP.ct20)), {v:pctStr(L.ct20,LP.ct20),t:'s',s:{font:{color:{rgb:pctColor(L.ct20,LP.ct20)}},border:allBorder()}}],
      [cell('LN hoạt động KD'), numCell(toTr(L.ct30)), numCell(toTr(LP.ct30)), cell(diffTr(L.ct30,LP.ct30),false,pctColor(L.ct30,LP.ct30)), {v:pctStr(L.ct30,LP.ct30),t:'s',s:{font:{color:{rgb:pctColor(L.ct30,LP.ct30)}},border:allBorder()}}],
      [cell('LN sau thuế'), numCell(toTr(L.ct60)), numCell(toTr(LP.ct60)), cell(diffTr(L.ct60,LP.ct60),false,pctColor(L.ct60,LP.ct60)), {v:pctStr(L.ct60,LP.ct60),t:'s',s:{font:{color:{rgb:pctColor(L.ct60,LP.ct60)}},border:allBorder()}}],
      [],
      [cell('III. TÓM TẮT CÂN ĐỐI KẾ TOÁN',true,'1A5276'), emptyCell(), emptyCell(), emptyCell(), emptyCell()],
      [cell('Tổng tài sản'), numCell(toTr(B.ct200)), numCell(toTr(P.ct200)), cell(diffTr(B.ct200,P.ct200),false,pctColor(B.ct200,P.ct200)), {v:pctStr(B.ct200,P.ct200),t:'s',s:{font:{color:{rgb:pctColor(B.ct200,P.ct200)}},border:allBorder()}}],
      [cell('Nợ phải trả'), numCell(toTr(B.ct300)), numCell(toTr(P.ct300)), cell(diffTr(B.ct300,P.ct300),false,pctColor(P.ct300,B.ct300)), {v:pctStr(B.ct300,P.ct300),t:'s',s:{font:{color:{rgb:pctColor(P.ct300,B.ct300)}},border:allBorder()}}],
      [cell('Vốn chủ sở hữu'), numCell(toTr(B.ct400)), numCell(toTr(P.ct400)), cell(diffTr(B.ct400,P.ct400),false,pctColor(B.ct400,P.ct400)), {v:pctStr(B.ct400,P.ct400),t:'s',s:{font:{color:{rgb:pctColor(B.ct400,P.ct400)}},border:allBorder()}}],
      [],
      [cell('IV. CÁC CHỈ SỐ TÀI CHÍNH',true,'1A5276'), emptyCell(), emptyCell(), emptyCell(), emptyCell()],
      [hdr('Nhóm'), hdr('Chỉ số'), hdr('Giá trị'), hdr('Đánh giá'), hdr('Ghi chú')],
      [cell('Thanh khoản'), cell('Current Ratio'), {v:+cr.toFixed(2),t:'n',s:{font:{color:{rgb:cr>=2?'1E8449':cr>=1?'7D6608':'922B21'}},border:allBorder(),numFmt:'0.00'}}, cell(cr>=2?'Tốt':cr>=1?'Chấp nhận':'Yếu',false,cr>=2?'1E8449':cr>=1?'7D6608':'922B21'), cell('Chuẩn: >2.0')],
      [cell('Thanh khoản'), cell('Quick Ratio'), {v:+qr.toFixed(2),t:'n',s:{font:{color:{rgb:qr>=1?'1E8449':qr>=0.7?'7D6608':'922B21'}},border:allBorder(),numFmt:'0.00'}}, cell(qr>=1?'Tốt':qr>=0.7?'Chấp nhận':'Yếu',false,qr>=1?'1E8449':qr>=0.7?'7D6608':'922B21'), cell('Chuẩn: >1.0')],
      [cell('Cơ cấu vốn'), cell('Nợ / Tổng TS'), {v:+da.toFixed(1),t:'n',s:{font:{color:{rgb:da<50?'1E8449':da<70?'7D6608':'922B21'}},border:allBorder(),numFmt:'0.0"%"'}}, cell(da<50?'An toàn':da<70?'Trung bình':'Cao',false,da<50?'1E8449':da<70?'7D6608':'922B21'), cell('Chuẩn: <50%')],
      [cell('Cơ cấu vốn'), cell('D/E Ratio'), {v:+de.toFixed(2),t:'n',s:{font:{color:{rgb:de<1?'1E8449':de<2?'7D6608':'922B21'}},border:allBorder(),numFmt:'0.00'}}, cell(de<1?'Tốt':de<2?'Chấp nhận':'Cao',false,de<1?'1E8449':de<2?'7D6608':'922B21'), cell('Nợ / VCSH')],
      [cell('Sinh lời'), cell('Biên LN Gộp'), {v:+gm.toFixed(2),t:'n',s:{font:{color:{rgb:gm>15?'1E8449':gm>5?'7D6608':'922B21'}},border:allBorder(),numFmt:'0.00"%"'}}, cell(gm>15?'Tốt':gm>5?'Trung bình':'Thấp',false,gm>15?'1E8449':gm>5?'7D6608':'922B21'), cell('Gross Margin')],
      [cell('Sinh lời'), cell('Biên LN Ròng'), {v:+nm.toFixed(2),t:'n',s:{font:{color:{rgb:nm>5?'1E8449':nm>0?'7D6608':'922B21'}},border:allBorder(),numFmt:'0.00"%"'}}, cell(nm>5?'Tốt':nm>0?'Dương':'Lỗ',false,nm>5?'1E8449':nm>0?'7D6608':'922B21'), cell('Net Margin')],
      [cell('Sinh lời'), cell('ROA'), {v:+roa.toFixed(2),t:'n',s:{font:{color:{rgb:roa>5?'1E8449':roa>0?'7D6608':'922B21'}},border:allBorder(),numFmt:'0.00"%"'}}, cell(roa>5?'Tốt':roa>0?'Thấp':'Âm',false,roa>5?'1E8449':roa>0?'7D6608':'922B21'), cell('Return on Assets')],
      [cell('Sinh lời'), cell('ROE'), {v:+roe.toFixed(2),t:'n',s:{font:{color:{rgb:roe>10?'1E8449':roe>0?'7D6608':'922B21'}},border:allBorder(),numFmt:'0.00"%"'}}, cell(roe>10?'Tốt':roe>0?'Thấp':'Âm',false,roe>10?'1E8449':roe>0?'7D6608':'922B21'), cell('Return on Equity')],
      [cell('Hiệu quả'), cell('Vòng quay HTK'), {v:+invT.toFixed(2),t:'n',s:{font:{color:{rgb:invT>4?'1E8449':invT>2?'7D6608':'922B21'}},border:allBorder(),numFmt:'0.00"×"'}}, cell(invT>4?'Tốt':invT>2?'Trung bình':'Chậm',false,invT>4?'1E8449':invT>2?'7D6608':'922B21'), cell(invT>0?`DIO ≈ ${Math.round(365/invT)} ngày`:'')],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(s1Data);
    ws1['!cols'] = [{wch:28},{wch:20},{wch:20},{wch:16},{wch:14}];
    ws1['!merges'] = [{s:{r:0,c:0},e:{r:0,c:4}},{s:{r:2,c:0},e:{r:2,c:4}}];
    XLSX.utils.book_append_sheet(wb, ws1, 'Tổng Quan & Chỉ Số TC');

    // ─────────────────────────────────────────
    // SHEET 2 – BẢNG CÂN ĐỐI KẾ TOÁN
    // ─────────────────────────────────────────
    const bsRows = [
      [{v:`BẢNG CÂN ĐỐI KẾ TOÁN – B01A (TT133) – Năm ${yearLabel}`,t:'s',s:{font:{bold:true,sz:13,color:{rgb:'1A5276'}},fill:{fgColor:{rgb:'D6EAF8'}}}}],
      [{v:`Đơn vị: đồng | Doanh nghiệp: ${info.name} | MST: ${info.mst}`,t:'s',s:{font:{sz:10,color:{rgb:'666666'}}}}],
      [],
      [hdr('CHỈ TIÊU'), hdr('MÃ'), hdr(`CUỐI NĂM ${yearLabel}`), hdr(`ĐẦU NĂM ${yearLabel}`), hdrY('THAY ĐỔI (tr.đ)'), hdrY('% THAY ĐỔI')],
    ];
    const bsList = [
      {sec:'A – TÀI SẢN'},
      {l:'I. Tiền và tương đương tiền',m:'110',cy:B.ct110,py:P.ct110,bold:true},
      {l:'II. Đầu tư TC ngắn hạn',m:'120',cy:B.ct120,py:P.ct120},
      {l:'III. Các khoản phải thu ngắn hạn',m:'130',cy:B.ct130,py:P.ct130,bold:true},
      {l:'   → Phải thu của khách hàng',m:'131',cy:B.ct131,py:P.ct131,sub:true},
      {l:'   → Trả trước cho người bán NH',m:'132',cy:B.ct132,py:P.ct132||0,sub:true},
      {l:'   → Phải thu khác',m:'134',cy:B.ct134,py:P.ct134,sub:true},
      {l:'IV. Hàng tồn kho (thuần)',m:'140',cy:B.ct140,py:P.ct140,bold:true},
      {l:'   → Hàng tồn kho',m:'141',cy:B.ct141,py:P.ct141,sub:true},
      {l:'V. Tài sản ngắn hạn khác',m:'150',cy:B.ct150,py:P.ct150},
      {l:'VI. Tài sản dài hạn khác',m:'180',cy:B.ct180,py:P.ct180},
      {l:'TỔNG CỘNG TÀI SẢN',m:'200',cy:B.ct200,py:P.ct200,total:true},
      {sec:'B – NGUỒN VỐN'},
      {l:'I. NỢ PHẢI TRẢ',m:'300',cy:B.ct300,py:P.ct300,bold:true},
      {l:'   → Phải trả người bán NH',m:'311',cy:B.ct311,py:P.ct311,sub:true},
      {l:'   → Vay và nợ thuê TC NH',m:'312',cy:B.ct312,py:P.ct312,sub:true},
      {l:'   → Thuế và khoản nộp NN',m:'313',cy:B.ct313,py:P.ct313,sub:true},
      {l:'   → Phải trả người lao động',m:'314',cy:B.ct314,py:P.ct314,sub:true},
      {l:'   → Chi phí phải trả',m:'315',cy:B.ct315,py:P.ct315,sub:true},
      {l:'   → Vay và nợ dài hạn',m:'316',cy:B.ct316,py:P.ct316,sub:true},
      {l:'   → Quỹ khen thưởng phúc lợi',m:'319',cy:B.ct319,py:P.ct319,sub:true},
      {l:'II. VỐN CHỦ SỞ HỮU',m:'400',cy:B.ct400,py:P.ct400,bold:true},
      {l:'   → Vốn đầu tư của CSH',m:'411',cy:B.ct411,py:P.ct411,sub:true},
      {l:'   → Thặng dư vốn cổ phần',m:'412',cy:B.ct412,py:P.ct412,sub:true},
      {l:'   → Các quỹ thuộc VCSH',m:'414',cy:B.ct414,py:P.ct414,sub:true},
      {l:'   → LNST chưa phân phối',m:'417',cy:B.ct417,py:P.ct417,sub:true},
      {l:'TỔNG CỘNG NGUỒN VỐN',m:'500',cy:B.ct500,py:P.ct500,total:true},
    ];
    bsList.forEach(r => {
      if(r.sec){
        bsRows.push([{v:r.sec,t:'s',s:{font:{bold:true,sz:10,color:{rgb:'FFFFFF'}},fill:{fgColor:{rgb:'1A5276'}},border:allBorder()}},{v:'',t:'s',s:{fill:{fgColor:{rgb:'1A5276'}},border:allBorder()}},{v:'',t:'s',s:{fill:{fgColor:{rgb:'1A5276'}},border:allBorder()}},{v:'',t:'s',s:{fill:{fgColor:{rgb:'1A5276'}},border:allBorder()}},{v:'',t:'s',s:{fill:{fgColor:{rgb:'1A5276'}},border:allBorder()}},{v:'',t:'s',s:{fill:{fgColor:{rgb:'1A5276'}},border:allBorder()}}]);
        return;
      }
      const d = r.cy - r.py;
      const p = r.py!==0 ? (d/Math.abs(r.py)*100) : null;
      const clr = r.total?'7D6608': r.bold?'1A5276':'111111';
      const bgFill = r.total?{fgColor:{rgb:'FEF9E7'}}: r.bold?{fgColor:{rgb:'EAF4FB'}}: r.sub?{fgColor:{rgb:'FAFAFA'}}:undefined;
      const mkS = (extra={}) => ({font:{bold:r.total||r.bold, sz:10, color:{rgb:clr}}, fill:bgFill?bgFill:{fgColor:{rgb:'FFFFFF'}}, border:allBorder(), ...extra});
      bsRows.push([
        {v:r.l, t:'s', s:mkS()},
        {v:r.m, t:'s', s:mkS({alignment:{horizontal:'center'}})},
        {v:r.cy, t:'n', s:mkS({numFmt:'#,##0'})},
        {v:r.py, t:'n', s:mkS({numFmt:'#,##0'})},
        {v:Math.round(d/1000), t:'n', s:{font:{bold:r.total,sz:10,color:{rgb:d>=0?'1E8449':'922B21'}}, fill:bgFill?bgFill:{fgColor:{rgb:'FFFFFF'}}, border:allBorder(), numFmt:'+#,##0;-#,##0;0'}},
        {v:p===null?'–':(p>=0?'+':'')+p.toFixed(1)+'%', t:'s', s:{font:{sz:10,color:{rgb:p===null?'888888':p>=0?'1E8449':'922B21'}}, fill:bgFill?bgFill:{fgColor:{rgb:'FFFFFF'}}, border:allBorder()}},
      ]);
    });
    const ws2 = XLSX.utils.aoa_to_sheet(bsRows);
    ws2['!cols'] = [{wch:36},{wch:8},{wch:20},{wch:20},{wch:16},{wch:14}];
    ws2['!merges'] = [{s:{r:0,c:0},e:{r:0,c:5}},{s:{r:1,c:0},e:{r:1,c:5}}];
    XLSX.utils.book_append_sheet(wb, ws2, 'Bảng CĐKT (B01A)');

    // ─────────────────────────────────────────
    // SHEET 3 – KẾT QUẢ KINH DOANH
    // ─────────────────────────────────────────
    const plRows = [
      [{v:`KẾT QUẢ HOẠT ĐỘNG SẢN XUẤT KINH DOANH – Năm ${yearLabel}`,t:'s',s:{font:{bold:true,sz:13,color:{rgb:'1A5276'}},fill:{fgColor:{rgb:'D6EAF8'}}}}],
      [{v:`Đơn vị: đồng | ${info.name} | MST: ${info.mst}`,t:'s',s:{font:{sz:10,color:{rgb:'666666'}}}}],
      [],
      [hdr('CHỈ TIÊU'), hdr('MÃ'), hdr(`NĂM ${yearLabel}`), hdr(`NĂM ${prevYear}`), hdrY('THAY ĐỔI (tr.đ)'), hdrY('% THAY ĐỔI')],
    ];
    const plList = [
      {l:'1. Doanh thu BH và CCDV',m:'01',cy:L.ct01,py:LP.ct01},
      {l:'2. Các khoản giảm trừ DT',m:'02',cy:L.ct02,py:LP.ct02,sub:true},
      {l:'3. Doanh thu thuần',m:'10',cy:L.ct10,py:LP.ct10,bold:true},
      {l:'4. Giá vốn hàng bán',m:'11',cy:L.ct11,py:LP.ct11,sub:true},
      {l:'5. Lợi nhuận gộp (20 = 10 – 11)',m:'20',cy:L.ct20,py:LP.ct20,bold:true},
      {l:'   Tỷ suất LN gộp / DT thuần',m:'–',cy:null,py:null,pctRow:true,cyr:L.ct10>0?L.ct20/L.ct10*100:0,pyr:LP.ct10>0?LP.ct20/LP.ct10*100:0},
      {l:'6. DT hoạt động tài chính',m:'21',cy:L.ct21,py:LP.ct21,sub:true},
      {l:'7. Chi phí tài chính',m:'22',cy:L.ct22,py:LP.ct22,sub:true},
      {l:'8. Chi phí QLDN',m:'24',cy:L.ct24,py:LP.ct24,sub:true},
      {l:'9. LN hoạt động KD',m:'30',cy:L.ct30,py:LP.ct30,bold:true},
      {l:'10. Thu nhập khác',m:'31',cy:L.ct31,py:LP.ct31,sub:true},
      {l:'11. Chi phí khác',m:'32',cy:L.ct32,py:LP.ct32,sub:true},
      {l:'12. Lợi nhuận khác (40)',m:'40',cy:L.ct40,py:LP.ct40},
      {l:'13. LN kế toán trước thuế',m:'50',cy:L.ct50,py:LP.ct50,bold:true},
      {l:'14. Chi phí thuế TNDN',m:'51',cy:L.ct51,py:LP.ct51,sub:true},
      {l:'15. LỢI NHUẬN SAU THUẾ (60)',m:'60',cy:L.ct60,py:LP.ct60,total:true},
    ];
    plList.forEach(r => {
      if(r.pctRow){
        plRows.push([
          {v:r.l,t:'s',s:{font:{italic:true,sz:10,color:{rgb:'888888'}},border:allBorder()}},
          {v:r.m,t:'s',s:{font:{sz:10,color:{rgb:'888888'}},border:allBorder(),alignment:{horizontal:'center'}}},
          {v:r.cyr.toFixed(2)+'%',t:'s',s:{font:{sz:10,color:{rgb:'1E8449'}},border:allBorder()}},
          {v:r.pyr.toFixed(2)+'%',t:'s',s:{font:{sz:10,color:{rgb:'1E8449'}},border:allBorder()}},
          {v:'',t:'s',s:{border:allBorder()}},{v:'',t:'s',s:{border:allBorder()}}
        ]);
        return;
      }
      const d = r.cy - r.py;
      const p = r.py!==0 ? (d/Math.abs(r.py)*100) : null;
      const clr = r.total?'7D6608': r.bold?'1A5276':'111111';
      const bgFill = r.total?{fgColor:{rgb:'FEF9E7'}}: r.bold?{fgColor:{rgb:'EAF4FB'}}: r.sub?{fgColor:{rgb:'FAFAFA'}}:undefined;
      const mkS = (extra={}) => ({font:{bold:r.total||r.bold, sz:10, color:{rgb:clr}}, fill:bgFill?bgFill:{fgColor:{rgb:'FFFFFF'}}, border:allBorder(), ...extra});
      plRows.push([
        {v:r.l,t:'s',s:mkS()},
        {v:r.m,t:'s',s:mkS({alignment:{horizontal:'center'}})},
        {v:r.cy,t:'n',s:mkS({numFmt:'#,##0'})},
        {v:r.py,t:'n',s:mkS({numFmt:'#,##0'})},
        {v:Math.round(d/1000),t:'n',s:{font:{bold:r.total,sz:10,color:{rgb:d>=0?'1E8449':'922B21'}},fill:bgFill?bgFill:{fgColor:{rgb:'FFFFFF'}},border:allBorder(),numFmt:'+#,##0;-#,##0;0'}},
        {v:p===null?'–':(p>=0?'+':'')+p.toFixed(1)+'%',t:'s',s:{font:{sz:10,color:{rgb:p===null?'888888':p>=0?'1E8449':'922B21'}},fill:bgFill?bgFill:{fgColor:{rgb:'FFFFFF'}},border:allBorder()}},
      ]);
    });
    const ws3 = XLSX.utils.aoa_to_sheet(plRows);
    ws3['!cols'] = [{wch:36},{wch:8},{wch:20},{wch:20},{wch:16},{wch:14}];
    ws3['!merges'] = [{s:{r:0,c:0},e:{r:0,c:5}},{s:{r:1,c:0},e:{r:1,c:5}}];
    XLSX.utils.book_append_sheet(wb, ws3, 'Kết Quả HĐKD');

    // ─────────────────────────────────────────
    // SHEET 4 – LƯU CHUYỂN TIỀN TỆ
    // ─────────────────────────────────────────
    const cfAoa = [
      [{v:`LƯU CHUYỂN TIỀN TỆ (PHƯƠNG PHÁP TRỰC TIẾP) – Năm ${yearLabel}`,t:'s',s:{font:{bold:true,sz:13,color:{rgb:'1A5276'}},fill:{fgColor:{rgb:'D6EAF8'}}}}],
      [{v:`Đơn vị: đồng | ${info.name} | MST: ${info.mst}`,t:'s',s:{font:{sz:10,color:{rgb:'666666'}}}}],
      [],
      [hdr('CHỈ TIÊU'), hdr('MÃ'), hdr(`NĂM ${yearLabel}`), hdr(`NĂM ${prevYear}`)],
    ];
    const cfList = [
      {sec:'I. LCT TỪ HOẠT ĐỘNG KINH DOANH'},
      {l:'Thu tiền từ bán hàng và CCDV',m:'01',cy:CF.ct01,py:CFP.ct01||0},
      {l:'Trả tiền NCC và người lao động',m:'02',cy:CF.ct02,py:CFP.ct02||0},
      {l:'Nộp thuế TNDN',m:'03',cy:CF.ct03,py:CFP.ct03||0},
      {l:'Trả lãi vay',m:'04',cy:CF.ct04,py:CFP.ct04||0},
      {l:'Thu / chi tiền khác từ HĐKD',m:'05-07',cy:CF.ct05+CF.ct06+CF.ct07,py:(CFP.ct05||0)+(CFP.ct06||0)+(CFP.ct07||0)},
      {l:'LCT THUẦN TỪ HĐKD',m:'20',cy:CF.ct20,py:CFP.ct20||0,bold:true},
      {sec:'II. LCT TỪ HOẠT ĐỘNG ĐẦU TƯ'},
      {l:'LCT thuần từ HĐ đầu tư',m:'30',cy:CF.ct30,py:CFP.ct30||0,bold:true},
      {sec:'III. LCT TỪ HOẠT ĐỘNG TÀI CHÍNH'},
      {l:'Tiền vay trong kỳ',m:'33',cy:CF.ct33,py:CFP.ct33||0},
      {l:'Trả nợ gốc vay',m:'34',cy:CF.ct34,py:CFP.ct34||0},
      {l:'LCT thuần từ HĐ tài chính',m:'40',cy:CF.ct40,py:CFP.ct40||0,bold:true},
      {l:'LCT THUẦN TRONG KỲ',m:'50',cy:CF.ct50,py:CFP.ct50||0,total:true},
      {l:'Tiền và TĐT tiền đầu kỳ',m:'60',cy:CF.ct60,py:CFP.ct60||0},
      {l:'TIỀN VÀ TĐT TIỀN CUỐI KỲ',m:'70',cy:CF.ct70,py:CFP.ct70||0,total:true},
    ];
    cfList.forEach(r => {
      if(r.sec){
        cfAoa.push([{v:r.sec,t:'s',s:{font:{bold:true,sz:10,color:{rgb:'FFFFFF'}},fill:{fgColor:{rgb:'1A5276'}},border:allBorder()}},{v:'',t:'s',s:{fill:{fgColor:{rgb:'1A5276'}},border:allBorder()}},{v:'',t:'s',s:{fill:{fgColor:{rgb:'1A5276'}},border:allBorder()}},{v:'',t:'s',s:{fill:{fgColor:{rgb:'1A5276'}},border:allBorder()}}]);
        return;
      }
      const clr = r.total?'7D6608': r.bold?'1A5276':'111111';
      const bgFill = r.total?{fgColor:{rgb:'FEF9E7'}}: r.bold?{fgColor:{rgb:'EAF4FB'}}:{fgColor:{rgb:'FFFFFF'}};
      const mkSC = (v, extra={}) => ({font:{bold:r.total||r.bold,sz:10,color:{rgb:clr}}, fill:bgFill, border:allBorder(), ...extra});
      const numClr = v => v<0?'922B21':v>0?'1E8449':'111111';
      cfAoa.push([
        {v:r.l,t:'s',s:mkSC()},
        {v:r.m,t:'s',s:mkSC({},{alignment:{horizontal:'center'}})},
        {v:r.cy,t:'n',s:{font:{bold:r.total||r.bold,sz:10,color:{rgb:r.total||r.bold?clr:numClr(r.cy)}},fill:bgFill,border:allBorder(),numFmt:'#,##0;(#,##0)'}},
        {v:r.py,t:'n',s:{font:{bold:r.total||r.bold,sz:10,color:{rgb:r.total||r.bold?clr:numClr(r.py)}},fill:bgFill,border:allBorder(),numFmt:'#,##0;(#,##0)'}},
      ]);
    });
    const ws4 = XLSX.utils.aoa_to_sheet(cfAoa);
    ws4['!cols'] = [{wch:40},{wch:10},{wch:22},{wch:22}];
    ws4['!merges'] = [{s:{r:0,c:0},e:{r:0,c:3}},{s:{r:1,c:0},e:{r:1,c:3}}];
    XLSX.utils.book_append_sheet(wb, ws4, 'Lưu Chuyển Tiền Tệ');

    // ─────────────────────────────────────────
    // SHEET 5 – CHỈ SỐ TÀI CHÍNH ĐẦY ĐỦ
    // ─────────────────────────────────────────
    const gmPY = LP.ct10>0?LP.ct20/LP.ct10*100:0;
    const omPY = LP.ct10>0?LP.ct30/LP.ct10*100:0;
    const nmPY = LP.ct10>0?LP.ct60/LP.ct10*100:0;
    const roaPY = P.ct200>0?LP.ct60/P.ct200*100:0;
    const roePY = P.ct400>0?LP.ct60/P.ct400*100:0;
    const invTPY = P.ct140>0?LP.ct11/P.ct140:0;

    const ratioAoa = [
      [{v:`TỔNG HỢP CHỈ SỐ TÀI CHÍNH – Năm ${yearLabel}`,t:'s',s:{font:{bold:true,sz:13,color:{rgb:'1A5276'}},fill:{fgColor:{rgb:'D6EAF8'}}}}],
      [{v:`${info.name} | MST: ${info.mst} | Kỳ: ${info.fromDate} – ${info.toDate}`,t:'s',s:{font:{sz:10,color:{rgb:'666666'}}}}],
      [],
      [hdr('NHÓM'), hdr('CHỈ SỐ'), hdr('CÔNG THỨC'), hdr(`NĂM ${yearLabel}`), hdr(`NĂM ${prevYear}`), hdrY('THAY ĐỔI'), hdr('ĐÁNH GIÁ'), hdr('CHUẨN MỰC')],
      // Liquidity
      [cell('Thanh khoản',true,'1A5276'), cell('Current Ratio (Hệ số thanh toán hiện hành)'), cell('TSNH / Nợ NH'), {v:+cr.toFixed(2),t:'n',s:{font:{bold:true,color:{rgb:cr>=2?'1E8449':cr>=1?'7D6608':'922B21'}},border:allBorder(),numFmt:'0.00'}}, {v:'–',t:'s',s:{border:allBorder()}}, {v:'–',t:'s',s:{border:allBorder()}}, cell(cr>=2?'✓ Tốt':cr>=1?'⚠ Chấp nhận':'✗ Yếu',false,cr>=2?'1E8449':cr>=1?'7D6608':'922B21'), cell('> 2.0')],
      [cell('Thanh khoản'), cell('Quick Ratio (Hệ số thanh toán nhanh)'), cell('(TSNH - HTK) / Nợ NH'), {v:+qr.toFixed(2),t:'n',s:{font:{color:{rgb:qr>=1?'1E8449':qr>=0.7?'7D6608':'922B21'}},border:allBorder(),numFmt:'0.00'}}, {v:'–',t:'s',s:{border:allBorder()}}, {v:'–',t:'s',s:{border:allBorder()}}, cell(qr>=1?'✓ Tốt':qr>=0.7?'⚠ Trung bình':'✗ Yếu',false,qr>=1?'1E8449':qr>=0.7?'7D6608':'922B21'), cell('> 1.0')],
      [cell('Thanh khoản'), cell('Cash Ratio (Tỷ số tiền mặt)'), cell('Tiền / Nợ NH'), {v:+((B.ct110/tongNoNH||0)).toFixed(2),t:'n',s:{border:allBorder(),numFmt:'0.00'}}, {v:'–',t:'s',s:{border:allBorder()}}, {v:'–',t:'s',s:{border:allBorder()}}, cell('–'), cell('> 0.5')],
      // Leverage
      [cell('Cơ cấu vốn',true,'1A5276'), cell('Tỷ số Nợ / Tổng TS'), cell('Nợ PT / Tổng TS'), {v:+da.toFixed(2),t:'n',s:{font:{color:{rgb:da<50?'1E8449':da<70?'7D6608':'922B21'}},border:allBorder(),numFmt:'0.00"%"'}}, {v:'–',t:'s',s:{border:allBorder()}}, {v:'–',t:'s',s:{border:allBorder()}}, cell(da<50?'✓ An toàn':da<70?'⚠ Trung bình':'✗ Cao',false,da<50?'1E8449':da<70?'7D6608':'922B21'), cell('< 50%')],
      [cell('Cơ cấu vốn'), cell('D/E Ratio (Đòn bẩy TC)'), cell('Nợ PT / VCSH'), {v:+de.toFixed(2),t:'n',s:{font:{color:{rgb:de<1?'1E8449':de<2?'7D6608':'922B21'}},border:allBorder(),numFmt:'0.00'}}, {v:'–',t:'s',s:{border:allBorder()}}, {v:'–',t:'s',s:{border:allBorder()}}, cell(de<1?'✓ Tốt':de<2?'⚠ Trung bình':'✗ Cao',false,de<1?'1E8449':de<2?'7D6608':'922B21'), cell('< 1.0')],
      [cell('Cơ cấu vốn'), cell('Tự chủ tài chính'), cell('VCSH / Tổng TS'), {v:+(B.ct200>0?B.ct400/B.ct200*100:0).toFixed(2),t:'n',s:{border:allBorder(),numFmt:'0.00"%"'}}, {v:'–',t:'s',s:{border:allBorder()}}, {v:'–',t:'s',s:{border:allBorder()}}, cell('–'), cell('> 50%')],
      // Profitability
      [cell('Sinh lời',true,'1A5276'), cell('Biên LN Gộp (Gross Margin)'), cell('LN Gộp / DT Thuần'), {v:+gm.toFixed(2),t:'n',s:{font:{color:{rgb:gm>15?'1E8449':gm>5?'7D6608':'922B21'}},border:allBorder(),numFmt:'0.00"%"'}}, {v:+gmPY.toFixed(2),t:'n',s:{border:allBorder(),numFmt:'0.00"%"'}}, {v:+(gm-gmPY).toFixed(2),t:'n',s:{font:{color:{rgb:(gm-gmPY)>=0?'1E8449':'922B21'}},border:allBorder(),numFmt:'+0.00"%";-0.00"%";0.00"%"'}}, cell(gm>15?'✓ Tốt':gm>5?'⚠ Trung bình':'✗ Thấp',false,gm>15?'1E8449':gm>5?'7D6608':'922B21'), cell('> 15%')],
      [cell('Sinh lời'), cell('Biên LN HĐKD (Operating Margin)'), cell('LN HĐKD / DT Thuần'), {v:+om.toFixed(2),t:'n',s:{font:{color:{rgb:om>10?'1E8449':om>0?'7D6608':'922B21'}},border:allBorder(),numFmt:'0.00"%"'}}, {v:+omPY.toFixed(2),t:'n',s:{border:allBorder(),numFmt:'0.00"%"'}}, {v:+(om-omPY).toFixed(2),t:'n',s:{font:{color:{rgb:(om-omPY)>=0?'1E8449':'922B21'}},border:allBorder(),numFmt:'+0.00"%";-0.00"%";0.00"%"'}}, cell(om>10?'✓ Tốt':om>0?'⚠ Dương':'✗ Âm',false,om>10?'1E8449':om>0?'7D6608':'922B21'), cell('> 10%')],
      [cell('Sinh lời'), cell('Biên LN Ròng (Net Margin)'), cell('LNST / DT Thuần'), {v:+nm.toFixed(2),t:'n',s:{font:{color:{rgb:nm>5?'1E8449':nm>0?'7D6608':'922B21'}},border:allBorder(),numFmt:'0.00"%"'}}, {v:+nmPY.toFixed(2),t:'n',s:{border:allBorder(),numFmt:'0.00"%"'}}, {v:+(nm-nmPY).toFixed(2),t:'n',s:{font:{color:{rgb:(nm-nmPY)>=0?'1E8449':'922B21'}},border:allBorder(),numFmt:'+0.00"%";-0.00"%";0.00"%"'}}, cell(nm>5?'✓ Tốt':nm>0?'⚠ Dương':'✗ Lỗ',false,nm>5?'1E8449':nm>0?'7D6608':'922B21'), cell('> 5%')],
      [cell('Sinh lời'), cell('ROA (Tỷ suất sinh lời TS)'), cell('LNST / Bình quân TS'), {v:+roa.toFixed(2),t:'n',s:{font:{color:{rgb:roa>5?'1E8449':roa>0?'7D6608':'922B21'}},border:allBorder(),numFmt:'0.00"%"'}}, {v:+roaPY.toFixed(2),t:'n',s:{border:allBorder(),numFmt:'0.00"%"'}}, {v:+(roa-roaPY).toFixed(2),t:'n',s:{font:{color:{rgb:(roa-roaPY)>=0?'1E8449':'922B21'}},border:allBorder(),numFmt:'+0.00"%";-0.00"%";0.00"%"'}}, cell(roa>5?'✓ Tốt':roa>0?'⚠ Thấp':'✗ Âm',false,roa>5?'1E8449':roa>0?'7D6608':'922B21'), cell('> 5%')],
      [cell('Sinh lời'), cell('ROE (Tỷ suất sinh lời VCSH)'), cell('LNST / Bình quân VCSH'), {v:+roe.toFixed(2),t:'n',s:{font:{color:{rgb:roe>10?'1E8449':roe>0?'7D6608':'922B21'}},border:allBorder(),numFmt:'0.00"%"'}}, {v:+roePY.toFixed(2),t:'n',s:{border:allBorder(),numFmt:'0.00"%"'}}, {v:+(roe-roePY).toFixed(2),t:'n',s:{font:{color:{rgb:(roe-roePY)>=0?'1E8449':'922B21'}},border:allBorder(),numFmt:'+0.00"%";-0.00"%";0.00"%"'}}, cell(roe>10?'✓ Tốt':roe>0?'⚠ Thấp':'✗ Âm',false,roe>10?'1E8449':roe>0?'7D6608':'922B21'), cell('> 10%')],
      // Efficiency
      [cell('Hiệu quả',true,'1A5276'), cell('Vòng quay HTK'), cell('GVHB / HTK'), {v:+invT.toFixed(2),t:'n',s:{font:{color:{rgb:invT>4?'1E8449':invT>2?'7D6608':'922B21'}},border:allBorder(),numFmt:'0.00"×"'}}, {v:+invTPY.toFixed(2),t:'n',s:{border:allBorder(),numFmt:'0.00"×"'}}, {v:+(invT-invTPY).toFixed(2),t:'n',s:{font:{color:{rgb:(invT-invTPY)>=0?'1E8449':'922B21'}},border:allBorder(),numFmt:'+0.00"×";-0.00"×";0.00"×"'}}, cell(invT>4?'✓ Tốt':invT>2?'⚠ Trung bình':'✗ Chậm',false,invT>4?'1E8449':invT>2?'7D6608':'922B21'), cell('> 4×')],
      [cell('Hiệu quả'), cell('DIO (Số ngày tồn kho)'), cell('365 / Vòng quay HTK'), {v:invT>0?Math.round(365/invT):0,t:'n',s:{border:allBorder(),numFmt:'0" ngày"'}}, {v:invTPY>0?Math.round(365/invTPY):0,t:'n',s:{border:allBorder(),numFmt:'0" ngày"'}}, {v:'–',t:'s',s:{border:allBorder()}}, cell(invT>0&&365/invT<90?'✓ Nhanh':invT>0&&365/invT<180?'⚠ Trung bình':'✗ Chậm'), cell('< 90 ngày')],
      // CF Quality
      [cell('Chất lượng LN',true,'1A5276'), cell('Chất lượng dòng tiền'), cell('LCT HĐKD / LNST'), {v:L.ct60!==0?(+(CF.ct20/L.ct60).toFixed(2)):0,t:'n',s:{border:allBorder(),numFmt:'0.00"×"'}}, {v:'–',t:'s',s:{border:allBorder()}}, {v:'–',t:'s',s:{border:allBorder()}}, cell(CF.ct20>0&&L.ct60>0?'✓ Tốt':CF.ct20<0&&L.ct60>0?'⚠ LN ảo':'Cần xem xét'), cell('> 1.0×')],
    ];
    const ws5 = XLSX.utils.aoa_to_sheet(ratioAoa);
    ws5['!cols'] = [{wch:16},{wch:38},{wch:26},{wch:14},{wch:14},{wch:12},{wch:18},{wch:14}];
    ws5['!merges'] = [{s:{r:0,c:0},e:{r:0,c:7}},{s:{r:1,c:0},e:{r:1,c:7}}];
    XLSX.utils.book_append_sheet(wb, ws5, 'Chỉ Số Tài Chính');

    // ─────────────────────────────────────────
    // Write file
    // ─────────────────────────────────────────
    const safeName = (info.name||'BCTC').replace(/[^a-zA-Z0-9À-ỹ\s]/g,'').trim().replace(/\s+/g,'_');
    const fileName = `BCTC_${safeName}_${yearLabel}_FinAnalyzer.xlsx`;
    XLSX.writeFile(wb, fileName, {bookType:'xlsx', type:'binary', cellStyles:true});

    if(toast && toast.parentNode) toast.remove();
    showExpToast('✅', 'Xuất Excel thành công!', `File: ${fileName}`, 4000);

  } catch(err) {
    if(toast && toast.parentNode) toast.remove();
    showExpToast('❌', 'Lỗi xuất Excel', err.message, 5000);
    console.error('XLSX export error:', err);
  }
}

