var RATES = {
  goods:      {vat:'1%',  pit:'0.5%'},
  service:    {vat:'5%',  pit:'2%'  },
  rental:     {vat:'5%',  pit:'2%'  },
  realestate: {vat:'5%',  pit:'5%',  isBDS:true},
  production: {vat:'3%',  pit:'1.5%'},
  digital:    {vat:'5%',  pit:'5%'  },
  other:      {vat:'2%',  pit:'1%'  }
};
// Ngưỡng doanh thu (đồng) — cập nhật theo NĐ 141/2026/NĐ-CP ngày 29/4/2026
// Ngưỡng miễn thuế GTGT/TNCN nâng từ 500 triệu lên 01 tỷ đồng/năm
var T1B=1000000000, T3B=3000000000, T50B=50000000000;
var propCount = 1;

function fmt(n){
  if(n>=1e9){var v=n/1e9;return(v===Math.floor(v)?v.toFixed(0):v.toFixed(2).replace(/\.?0+$/,''))+' tỷ';}
  if(n>=1e6){return Math.round(n/1e6)+' triệu';}
  return n.toLocaleString('vi-VN');
}
function fN(n){return Math.round(n).toLocaleString('vi-VN');}
function fFull(n){return n.toLocaleString('vi-VN')+' đồng ('+fmt(n)+')';}

// Show/hide BDS panel
function onBizChange(){
  var biz = document.getElementById('bizType').value;
  document.getElementById('bds-panel').style.display = (biz==='realestate') ? 'block' : 'none';
}

// Tab switching
function showTab(id){
  var panes = document.querySelectorAll('.bds-pane');
  var tabs  = document.querySelectorAll('.bds-tab');
  var i;
  for(i=0;i<panes.length;i++) panes[i].classList.remove('active');
  for(i=0;i<tabs.length;i++)  tabs[i].classList.remove('active');
  document.getElementById(id).classList.add('active');
  var order = ['tab-rules','tab-calc','tab-proc','tab-forms','tab-acc'];
  var idx = order.indexOf(id);
  if(idx>=0) tabs[idx].classList.add('active');
}

// Live unit hint
document.getElementById('revenue').addEventListener('input', function(){
  var v = parseFloat(this.value);
  var hint=document.getElementById('unitHint');
  var dv=document.getElementById('displayVal');
  var dn=document.getElementById('displayNum');
  if(!isNaN(v)&&v>0){
    hint.textContent='≈ '+fmt(v);
    dv.style.display='block';
    dn.textContent=fFull(v);
  } else {
    hint.textContent='';
    dv.style.display='none';
  }
});

// Note: BDS calc logic has been moved to bds-calc.js

// ── General lookup helpers ────────────────────────────────
function fi(code,name,note,bg){
  bg=bg||'var(--p)';
  return '<li class="form-item"><div class="form-code" style="background:'+bg+'">'+code+'</div>'
    +'<div class="form-info"><div class="fn">'+name+'</div><div class="ft">'+note+'</div></div></li>';
}
function dl(clr,body){
  var dot=clr?'<div class="dl-dot" style="background:'+clr+'"></div>':'<div class="dl-dot"></div>';
  return '<div class="dl-row">'+dot+'<div class="dl-body">'+body+'</div></div>';
}

// ── Build Accounting Section ──────────────────────────────
function buildAccounting(ex, a500, a3B, isBDS){
  var bk = function(code,name,desc,opt){
    return '<div class="book-item'+(opt?' opt':'')+'"><div class="book-code">'+code+'</div>'
      +'<div class="book-name">'+name+'</div>'
      +'<div class="book-desc">'+desc+'</div>'
      +'<span class="book-badge '+(opt?'bb-opt':'bb-req')+'">'+(opt?'Tùy chọn':'Bắt buộc')+'</span></div>';
  };

  var body = '';

  if(ex){
    // DT ≤ 1 tỷ → chỉ S1a-HKD
    body += '<div class="acc-group"><div class="acc-gtitle">Doanh thu ≤ 1 tỷ (Điều 4, TT 152/2025) — Không chịu thuế GTGT, không nộp TNCN</div>'
      +'<div class="book-grid">'
      +bk('S1a-HKD','Sổ doanh thu bán hàng hóa, dịch vụ',
         'Ghi doanh thu bán hàng, dịch vụ theo từng kỳ. Mục đích: xác định có thuộc đối tượng chịu thuế hay không.')
      +'</div>'
      +'<div class="acc-note">📌 Chỉ cần <strong>1 sổ duy nhất</strong>. Có thể ghi theo từng nghiệp vụ hoặc theo định kỳ. Khi doanh thu vượt 1 tỷ trong năm phải chuyển sang sổ Nhóm 2.</div>'
      +'</div>';
  } else {
    // a500 — xác định PP
    var isForced_pp2 = a3B && !isBDS; // DT > 3 tỷ bắt buộc PP2
    var bdsMethod = isBDS; // BDS dùng tỷ lệ % cho cả GTGT lẫn TNCN → Nhóm 2a

    if(isBDS){
      // BĐS: dùng S2a-HKD (tỷ lệ % trên DT)
      body += '<div class="acc-group"><div class="acc-gtitle">Cho thuê BĐS — Nộp GTGT &amp; TNCN theo tỷ lệ % trên doanh thu (Điều 5, TT 152/2025)</div>'
        +'<div class="book-grid">'
        +bk('S2a-HKD','Sổ doanh thu bán hàng hóa, dịch vụ',
           'Ghi DT cho thuê BĐS, tính GTGT (5%×DT) và TNCN (5%×(DT−1 tỷ)) theo từng ngành nghề/kỳ kê khai.')
        +'</div>'
        +'<div class="acc-note">📌 BĐS áp dụng <strong>tỷ lệ % trên DT</strong> cho cả GTGT lẫn TNCN → chỉ cần Mẫu <strong>S2a-HKD</strong>. Nếu đồng thời có HĐSXKD khác nộp TNCN theo PP2 → phải mở thêm sổ nhóm 2b cho hoạt động đó.</div>'
        +'</div>';
    } else if(isForced_pp2){
      // DT > 3 tỷ: bắt buộc PP2 → S2b + S2c + S2d + S2e
      body += '<div class="acc-group"><div class="acc-gtitle">Doanh thu &gt; 3 tỷ — Bắt buộc PP2: GTGT theo tỷ lệ %, TNCN theo thu nhập tính thuế (Điều 6, TT 152/2025)</div>'
        +'<div class="book-grid">'
        +bk('S2b-HKD','Sổ doanh thu bán hàng hóa, dịch vụ',
           'Ghi DT theo từng ngành nghề có cùng tỷ lệ % GTGT. Tính số thuế GTGT phải nộp từng ngành.')
        +bk('S2c-HKD','Sổ chi tiết doanh thu, chi phí',
           'Ghi tổng DT và từng khoản chi phí hợp lý. Tính thu nhập chịu thuế TNCN = DT − Chi phí.')
        +bk('S2d-HKD','Sổ chi tiết vật liệu, dụng cụ, sản phẩm, hàng hóa',
           'Theo dõi nhập, xuất, tồn kho từng loại vật liệu, hàng hóa. Đơn giá xuất = bình quân gia quyền.')
        +bk('S2e-HKD','Sổ chi tiết tiền',
           'Theo dõi thu, chi tiền mặt và tiền gửi không kỳ hạn tại từng ngân hàng theo từng kỳ.')
        +'</div>'
        +'<div class="acc-note">📌 DT &gt; 3 tỷ đồng → <strong>bắt buộc 4 sổ</strong> (S2b đến S2e). Sổ S2c là trung tâm để xác định nghĩa vụ TNCN = (DT − CP) × thuế suất (&gt; 1 tỷ - 3 tỷ: 15%; &gt; 3 tỷ - 50 tỷ: 17%; &gt; 50 tỷ: 20%).</div>'
        +'</div>';
    } else {
      // DT 1 tỷ - 3 tỷ: có thể PP1 hoặc PP2 (sửa đổi theo NĐ 141/2026)
      body += '<div class="acc-group"><div class="acc-gtitle">Nếu chọn PP1 — Nộp GTGT &amp; TNCN đều theo tỷ lệ % trên doanh thu (Điều 5, TT 152/2025)</div>'
        +'<div class="book-grid">'
        +bk('S2a-HKD','Sổ doanh thu bán hàng hóa, dịch vụ',
           'Ghi DT theo từng ngành nghề, tính thuế GTGT và thuế TNCN theo tỷ lệ % trên DT (sau trừ 1 tỷ miễn thuế TNCN).')
        +'</div>'
        +'<div class="acc-note">📌 PP1 chỉ cần <strong>1 sổ S2a-HKD</strong>. Đây là lựa chọn đơn giản nhất.</div>'
        +'</div>';
      body += '<div class="acc-group"><div class="acc-gtitle">Nếu chọn PP2 (tự nguyện) — GTGT theo tỷ lệ %, TNCN theo thu nhập tính thuế (Điều 6, TT 152/2025)</div>'
        +'<div class="book-grid">'
        +bk('S2b-HKD','Sổ doanh thu bán hàng hóa, dịch vụ',
           'Ghi DT theo từng ngành nghề cùng tỷ lệ % GTGT. Tính số thuế GTGT phải nộp.')
        +bk('S2c-HKD','Sổ chi tiết doanh thu, chi phí',
           'Ghi tổng DT và từng khoản chi phí hợp lý để xác định thu nhập tính thuế TNCN = DT − Chi phí.')
        +bk('S2d-HKD','Sổ chi tiết vật liệu, dụng cụ, sản phẩm, hàng hóa',
           'Theo dõi nhập, xuất, tồn kho từng loại vật liệu, hàng hóa theo phương pháp bình quân gia quyền.')
        +bk('S2e-HKD','Sổ chi tiết tiền',
           'Theo dõi thu, chi tiền mặt và tiền gửi không kỳ hạn. Theo dõi riêng từng ngân hàng nếu cần.')
        +'</div>'
        +'<div class="acc-note">📌 PP2 yêu cầu <strong>4 sổ</strong> (S2b đến S2e). Nếu chọn PP2 phải ổn định trong 02 năm liên tục. Nếu hết năm DT thực tế vượt 3 tỷ → năm sau bắt buộc dùng PP2 (Điều 4.5d, NĐ 68/2026 sửa đổi bởi NĐ 141/2026).</div>'
        +'</div>';
    }
  }

  // Phần chung + sổ thuế khác
  body += '<div class="acc-group"><div class="acc-gtitle">Trường hợp có thuế khác (Điều 7, TT 152/2025)</div>'
    +'<div class="book-grid">'
    +bk('S3a-HKD','Sổ theo dõi nghĩa vụ thuế khác',
       'Theo dõi thuế TTĐB, XK/NK, tài nguyên, BVMT, sử dụng đất. Tính thuế theo từng loại tỷ lệ % hoặc tuyệt đối.','opt')
    +'</div>'
    +'<div class="acc-note">📌 Chỉ mở sổ S3a-HKD khi <strong>thực sự phát sinh nghĩa vụ</strong> các loại thuế đặc thù này.</div>'
    +'</div>';

  // Quy định chung
  body += '<div class="acc-group"><div class="acc-gtitle">Quy định chung về tổ chức kế toán (Điều 2 &amp; 3, TT 152/2025)</div>'
    +'<div class="acc-rule-grid">'
    +'<div class="acc-rule"><strong>Người thực hiện</strong>Tự ghi, bố trí người thân (cha mẹ, vợ/chồng, con, anh chị em ruột) làm kế toán, hoặc <strong>thuê dịch vụ kế toán</strong>. Được kiêm nhiệm với thủ kho, thủ quỹ.</div>'
    +'<div class="acc-rule"><strong>Lưu trữ tài liệu</strong>Tối thiểu <strong>05 năm</strong>. Được lưu điện tử hoặc bản giấy. Riêng hóa đơn lưu trữ theo quy định pháp luật thuế.</div>'
    +'<div class="acc-rule"><strong>Tùy biến sổ</strong>Có thể <strong>bổ sung thêm sổ</strong> hoặc sửa đổi biểu mẫu phù hợp nhu cầu. Sổ mở thêm phải ghi tên sổ, ngày lập, chữ ký người đại diện.</div>'
    +'</div></div>';

  return '<div class="acc-wrap"><div class="acc-header"><span class="acc-header-icon">📒</span>'
    +'<div class="acc-header-text"><h4>Sổ kế toán bắt buộc theo TT 152/2025/TT-BTC</h4>'
    +'<p>Hiệu lực từ 01/01/2026, thay thế TT 88/2021/TT-BTC</p></div></div>'
    +'<div class="acc-body">'+body+'</div></div>';
}

// ── MAIN LOOKUP ───────────────────────────────────────────
function lookup(){
  var rev = parseFloat(document.getElementById('revenue').value);
  var biz = document.getElementById('bizType').value;
  if(isNaN(rev)||rev<0){alert('Vui lòng nhập doanh thu hợp lệ (≥ 0).');return;}

  var r    = RATES[biz];
  var isBDS= !!r.isBDS;
  // NĐ 141/2026/NĐ-CP: Ngưỡng miễn thuế GTGT/TNCN nâng từ 500 triệu lên 01 tỷ đồng
  // → Ngưỡng "miễn thuế" và "bắt buộc HĐĐT" nay trùng nhau ở mức 01 tỷ
  var ex   = rev<=T1B;          // Miễn thuế GTGT &amp; TNCN khi DT ≤ 01 tỷ
  var a500 = rev>T1B;           // Trên ngưỡng miễn thuế 01 tỷ (tên giữ nguyên cho tương thích)
  var a1B  = rev>T1B;           // Bắt buộc HĐĐT có mã CQT (DT trên 01 tỷ - khoản 5a Điều 8 sửa đổi)
  var a3B  = rev>T3B;
  var a50B = rev>T50B;

  // ── Status ──────────────────────────────────────────────
  var vatSt,pitSt,invSt,invCC,invBC,pitTi,pitDe,frTi,frDe;
  if(ex){
    vatSt='❌ Không chịu thuế GTGT';
    pitSt='❌ Không phải nộp thuế TNCN';
    if(isBDS){invSt='Không có quy định cụ thể';invCC='cl-blue';invBC='tg-blue';}
    else{invSt='Không bắt buộc HĐĐT có mã CQT';invCC='cl-green';invBC='tg-green';}
    pitTi='—';
    pitDe='Chỉ <strong>thông báo doanh thu thực tế</strong> với cơ quan thuế.';
    frTi=isBDS?'Thông báo 1 lần/năm':'Thông báo doanh thu 1 lần/năm';
    frDe='Không cần khai thuế định kỳ. Chỉ thông báo doanh thu thực tế.';
  } else {
    vatSt='✅ Chịu thuế GTGT';
    pitSt='✅ Phải nộp thuế TNCN';
    if(isBDS){invSt='Không có quy định cụ thể';invCC='cl-blue';invBC='tg-blue';}
    else if(a1B){invSt='Bắt buộc HĐĐT có mã CQT';invCC='cl-rose';invBC='tg-rose';}
    else{invSt='Không bắt buộc (tự nguyện đăng ký)';invCC='cl-amber';invBC='tg-amber';}
    if(isBDS){
      pitTi='5% × (Doanh thu − 1 tỷ đồng miễn thuế/năm)';
      pitDe='<span style="background:var(--teal-lt);border:1px solid #99f6e4;border-radius:6px;padding:3px 8px;font-size:11.5px;font-weight:700;color:var(--teal-dk);display:inline-block;margin-bottom:5px">Khoản 4 Điều 7 Luật TNCN 109/2025 (mức trừ nâng theo NĐ 141/2026)</span><br>'
        +'Quy định <strong>riêng biệt</strong> chỉ áp dụng cho thuê BĐS.<br>'
        +'Không áp dụng PP1/PP2 như CNKD thông thường.';
      frTi='Khai 2 lần/năm hoặc 1 lần/năm (tự chọn)';
      frDe='<strong>GTGT &amp; TNCN:</strong> Khai 2 lần (31/7 &amp; 31/01) hoặc 1 lần/năm (31/01 năm sau).<br>Tổ chức thuê khai thay → theo kỳ thanh toán trong HĐ.<br><em style="font-size:11px;color:var(--s400)">(Điều 8 khoản 3d, NĐ 68/2026)</em>';
    } else if(a3B){
      pitTi='Phương pháp 2 (bắt buộc)';
      pitDe='(Doanh thu − Chi phí) × Thuế suất (&gt; 1 tỷ - 3 tỷ: 15%; &gt; 3 tỷ - 50 tỷ: 17%; &gt; 50 tỷ: 20%).<br><em>Ổn định 02 năm liên tục kể từ năm đầu áp dụng.</em>';
      frTi=a50B?'Khai thuế theo tháng':'Khai thuế theo quý';
      frDe='<strong>GTGT:</strong> Hàng <strong>'+(a50B?'tháng':'quý')+'</strong><br><strong>TNCN:</strong> Tạm nộp theo tháng/quý + Quyết toán năm (31/3)';
    } else {
      pitTi='PP1 (mặc định) hoặc PP2 (tự chọn)';
      pitDe='<strong>PP1:</strong> <strong>'+r.pit+'</strong> × Doanh thu (sau trừ 1 tỷ miễn thuế).<br>'
        +'<strong>PP2 (tự chọn):</strong> Thu nhập tính thuế × Thuế suất (&gt; 1 tỷ - 3 tỷ: 15%; &gt; 3 tỷ - 50 tỷ: 17%; &gt; 50 tỷ: 20%).<br>'
        +'<em style="font-size:11px;color:var(--s400)">Chọn PP2 phải ổn định 02 năm.</em>';
      frTi=a50B?'Khai thuế theo tháng':'Khai thuế theo quý';
      frDe='<strong>GTGT:</strong> Hàng <strong>'+(a50B?'tháng':'quý')+'</strong><br><strong>TNCN:</strong> Khai &amp; nộp theo quý cùng kỳ GTGT';
    }
  }

  // ── Mẫu biểu ────────────────────────────────────────────
  var fH='';
  if(isBDS){
    if(ex){
      fH+=fi('01/BĐS','Thông báo doanh thu / Tờ khai thuế (cho thuê BĐS)','Nộp chậm nhất 31/01 năm tiếp theo. Kê khai doanh thu ≤ 1 tỷ đồng.','var(--teal)');
      fH+=fi('01/BK-BĐS','Phụ lục Bảng kê chi tiết bất động sản cho thuê','Kèm Mẫu 01/BĐS. Liệt kê địa chỉ, giá trị HĐ, thời gian thuê từng BĐS.','var(--teal)');
    } else {
      fH+=fi('01/BĐS','Tờ khai thuế đối với hoạt động cho thuê bất động sản','Tự chọn: khai 2 lần/năm (31/7 &amp; 31/01) hoặc 1 lần/năm (31/01 năm sau). Nộp tại CQT nơi có BĐS.','var(--teal)');
      fH+=fi('01/BK-BĐS','Phụ lục Bảng kê chi tiết bất động sản cho thuê','Kèm 01/BĐS. Kê khai DT, mức trừ, GTGT (5%×DT), TNCN [(DT−trừ)×5%] từng BĐS. Khai tiền phạt/bồi thường (nếu có).','var(--teal)');
      fH+=fi('01/TCKT &amp; 02/BK-KTBĐS','Tờ khai Tổ chức khai thay + Bảng kê chi tiết BĐS','Khi HĐ thuê có thỏa thuận tổ chức khai thay. Ghi rõ trong HĐ nội dung khai thay và số tiền được trừ. (Điều 4.4b &amp; 8.7, NĐ 68/2026)','var(--amber)');
    }
  } else {
    if(ex){
      fH+=fi('01/TKN-CNKD','Thông báo Doanh thu / Tờ khai thuế năm','Nộp chậm nhất 31/01 năm tiếp theo (hoặc 31/7 nếu mới KD 6 tháng đầu năm).');
    } else {
      var n01=a50B?'Nộp chậm nhất ngày 20 tháng tiếp theo (khai tháng). Riêng T1,T2,T3/2026 nộp trước 20/4/2026.':'Nộp chậm nhất ngày cuối tháng đầu quý tiếp theo. VD: Q1→30/4; Q2→31/7.';
      fH+=fi('01/CNKD','Tờ khai thuế đối với HKD, CNKD',n01);
      var n02=a3B?'Bắt buộc. Nộp chậm nhất 31/3 năm tiếp theo (PP2: thu nhập tính thuế × thuế suất).':'Chỉ nộp nếu chọn PP2. Nộp chậm nhất 31/3 năm tiếp theo.';
      fH+=fi('02/CNKD-TNCN-QTT','Tờ khai quyết toán thuế TNCN (cuối năm)',n02);
    }
  }
  fH+=fi('01/BK-STK','Thông báo số tài khoản / số hiệu ví điện tử','Nộp kèm tờ khai đầu tiên hoặc khi thay đổi thông tin tài khoản.');
  if(!isBDS) fH+=fi('01/TB-ĐĐKD','Thông báo địa điểm kinh doanh (nếu có thêm địa điểm)','Nộp trong 10 ngày làm việc kể từ ngày địa điểm KD đi vào hoạt động.');
  if(a3B&&!isBDS) fH+=fi('01/BK-HTK','Bảng kê hàng tồn kho, máy móc, thiết bị','Nộp kèm tờ khai Q1/2026 hoặc trước 20/4/2026. Xác định giá trị tại 31/12/2025 để tính chi phí TNCN năm 2026.');

  // ── Ước tính thuế ────────────────────────────────────────
  var estH='';
  if(a500){
    var vAmt=Math.round(rev*parseFloat(r.vat)/100);
    var pBase=rev-T1B;
    var pAmt=Math.round(pBase*parseFloat(r.pit)/100);
    var tot=vAmt+pAmt;
    if(isBDS){
      estH='<div class="fcard" style="border-left-color:var(--teal)">'
        +'<div class="card-lbl">💰 Ước tính thuế – Cho thuê BĐS (1 bất động sản)</div>'
        +'<div class="card-title" style="font-size:13px">Công thức: Khoản 4 Điều 7 Luật TNCN 109/2025 &amp; Điều 3 NĐ 68/2026 (sửa đổi bởi NĐ 141/2026)</div>'
        +'<div class="cbox">'
        +'<div><strong>① Thuế GTGT</strong> = '+fN(rev)+' × 5% = <span style="color:var(--rose);font-weight:700">'+fN(vAmt)+' đ</span></div>'
        +'<hr class="cdiv">'
        +'<div><strong>② Thuế TNCN</strong> = ('+fN(rev)+' − 1.000.000.000) × 5% = <span style="color:var(--amber);font-weight:700">'+fN(pAmt)+' đ</span></div>'
        +'<hr class="cdiv">'
        +'<div><strong>③ Tổng phải nộp</strong> = ① + ② = <span style="color:var(--p);font-weight:800;font-size:14px">'+fN(tot)+' đ</span></div>'
        +'</div>'
        +'<div class="cgrid">'
        +'<div class="citem ci-r"><div class="ci-lbl" style="color:var(--rose)">Thuế GTGT</div><div class="ci-val" style="color:var(--rose)">'+fN(vAmt)+' đ</div><div class="ci-sub">'+fN(rev)+' × 5%</div></div>'
        +'<div class="citem ci-a"><div class="ci-lbl" style="color:var(--amber)">Thuế TNCN</div><div class="ci-val" style="color:var(--amber)">'+fN(pAmt)+' đ</div><div class="ci-sub">(DT − 1 tỷ) × 5%</div></div>'
        +'<div class="citem ci-b"><div class="ci-lbl" style="color:var(--p)">Tổng cộng</div><div class="ci-val" style="color:var(--p)">'+fN(tot)+' đ</div><div class="ci-sub">'+fmt(vAmt)+' + '+fmt(pAmt)+'</div></div>'
        +'</div>'
        +'<div class="alert a-teal"><span class="a-icon">💡</span><span>Dùng tab <strong>"Tính thuế BĐS"</strong> ở panel bên trên để tính thuế khi có <strong>nhiều bất động sản cho thuê</strong> với phân bổ mức trừ 1 tỷ tự động.</span></div>'
        +'<div class="alert a-warn" style="margin-top:8px"><span class="a-icon">⚠️</span><span><strong>Tiền phạt/Bồi thường từ HĐ:</strong> TNCN = 5% × toàn bộ khoản tiền — không được trừ 1 tỷ. Kê khai tại chỉ tiêu [13],[14] Mẫu 01/BĐS.</span></div>'
        +'</div>';
    } else {
      estH='<div class="fcard" style="border-left-color:var(--amber)">'
        +'<div class="card-lbl">💰 Ước tính thuế phải nộp trong năm (Phương pháp 1)</div>'
        +'<div class="card-title" style="font-size:13px">Tính nhanh nghĩa vụ thuế</div>'
        +'<div class="cgrid">'
        +'<div class="citem ci-r"><div class="ci-lbl" style="color:var(--rose)">Thuế GTGT</div><div class="ci-val" style="color:var(--rose)">'+fN(vAmt)+' đ</div><div class="ci-sub">'+fN(rev)+' × '+r.vat+'</div></div>'
        +'<div class="citem ci-a"><div class="ci-lbl" style="color:var(--amber)">Thuế TNCN (PP1)</div><div class="ci-val" style="color:var(--amber)">'+fN(pAmt)+' đ</div><div class="ci-sub">'+fN(pBase)+' × '+r.pit+'</div></div>'
        +'<div class="citem ci-b"><div class="ci-lbl" style="color:var(--p)">Tổng cộng</div><div class="ci-val" style="color:var(--p)">'+fN(tot)+' đ</div><div class="ci-sub">'+fmt(vAmt)+' + '+fmt(pAmt)+'</div></div>'
        +'</div>'
        +'<div class="alert a-warn"><span class="a-icon">⚠️</span><span>Thuế TNCN tính trên doanh thu sau khi <strong>trừ 1 tỷ đồng miễn thuế</strong> (NĐ 141/2026 nâng từ 500 triệu lên 01 tỷ). Nếu chọn PP2, số thuế thực tế có thể khác tùy chi phí thực tế.</span></div>'
        +'</div>';
    }
  }

  // ── Tier bar ────────────────────────────────────────────
  // Cập nhật theo NĐ 141/2026: bỏ mốc 500tr, chỉ còn 3 mức ngưỡng (1 tỷ / 3 tỷ / 50 tỷ)
  var maxB=Math.max(rev*1.2,T50B*1.2);
  var fPct=Math.min(100,(rev/maxB)*100);
  var fClr=rev<=T1B?'var(--green)':(rev<=T3B?'var(--amber)':'var(--rose)');
  var tVals=[0,T1B,T3B,T50B];
  var tLbls=['','','','50 tỷ'];
  var mks='';
  for(var i=0;i<tVals.length;i++){
    var pct=Math.min(100,(tVals[i]/maxB)*100);
    mks+='<span class="tier-mk" style="left:'+pct+'%">'+tLbls[i]+'</span>';
  }
  var pPct=Math.min(97,Math.max(3,fPct));
  var tierBar='<div class="tierw"><div class="tier-lbl">📊 Vị trí doanh thu trên thang ngưỡng thuế</div>'
    +'<div class="tier-area">'+mks
    +'<div class="tier-track"><div class="tier-fill" style="width:'+fPct+'%;background:'+fClr+'"></div></div>'
    +'<span class="tier-ptr" style="left:'+pPct+'%;color:'+fClr+'">▲ '+fmt(rev)+'</span>'
    +'</div></div>';

  // ── Deadlines ─────────────────────────────────────────
  var dls='';
  if(ex){
    if(isBDS){
      dls+=dl('','<strong>31/01 năm tiếp theo:</strong> Nộp Mẫu 01/BĐS thông báo doanh thu BĐS cho thuê ≤ 1 tỷ đồng.');
      dls+=dl('var(--teal)','<strong>Địa điểm nộp:</strong> CQT <strong>nơi có bất động sản cho thuê</strong>. Nhiều BĐS → tổng hợp 1 hồ sơ, chọn 1 CQT để nộp (Điều 8.4d, NĐ 68/2026).');
    } else {
      dls+=dl('','<strong>31/01 năm tiếp theo:</strong> Nộp Mẫu 01/TKN-CNKD thông báo doanh thu thực tế.');
      dls+=dl('','<strong>Nếu mới KD 6 tháng đầu năm:</strong> Thông báo DT 6 tháng đầu chậm nhất 31/7; DT 6 tháng cuối chậm nhất 31/01 năm sau.');
    }
  } else if(isBDS){
    dls+=dl('','<strong>Tùy chọn 1 (khai 2 lần/năm):</strong> Lần 1 ≤ <strong>31/7</strong>; Lần 2 ≤ <strong>31/01</strong> năm dương lịch tiếp theo.');
    dls+=dl('','<strong>Tùy chọn 2 (khai 1 lần/năm):</strong> ≤ <strong>31/01</strong> năm dương lịch tiếp theo.');
    dls+=dl('var(--amber)','<strong>Tổ chức thuê khai thay:</strong> Thời hạn theo kỳ thanh toán tiền thuê BĐS trong hợp đồng (Điều 8.3đ, NĐ 68/2026).');
    dls+=dl('var(--teal)','<strong>Địa điểm nộp hồ sơ:</strong> CQT <strong>nơi có BĐS cho thuê</strong>. Nhiều BĐS → tổng hợp 1 hồ sơ, 1 CQT. Nộp thuế theo từng địa điểm (Điều 8.4d).');
    dls+=dl('var(--rose)','<strong>Cá nhân cho cá nhân thuê:</strong> Bên cho thuê phải trực tiếp khai, không được ủy quyền khai thay.');
  } else if(a50B){
    dls+=dl('','<strong>Ngày 20 hàng tháng:</strong> Nộp Mẫu 01/CNKD (GTGT + TNCN). Riêng T1,T2,T3/2026 nộp trước 20/4/2026.');
    dls+=dl('','<strong>31/3 năm tiếp theo:</strong> Nộp Mẫu 02/CNKD-TNCN-QTT (quyết toán TNCN nếu áp dụng PP2).');
  } else {
    dls+=dl('','<strong>Ngày cuối tháng đầu quý tiếp theo:</strong> Nộp Mẫu 01/CNKD. VD: Q1→30/4; Q2→31/7; Q3→31/10; Q4→31/01.');
    dls+=dl('','<strong>31/3 năm tiếp theo:</strong> Nộp Mẫu 02/CNKD-TNCN-QTT (quyết toán TNCN nếu áp dụng PP2).');
  }
  if(a500) dls+=dl('var(--amber)','<strong>Thời hạn nộp thuế</strong> = thời hạn nộp hồ sơ khai thuế cùng kỳ (Điều 8.3e, NĐ 68/2026).');
  if(!isBDS) dls+=dl('var(--p)','<strong>Trong 10 ngày làm việc:</strong> Thông báo địa điểm kinh doanh mới phát sinh (Mẫu 01/TB-ĐĐKD).');

  // ── Special notices ──────────────────────────────────
  var specH='';
  if(isBDS&&a500){
    specH='<div class="fcard" style="border-left-color:var(--teal)">'
      +'<div class="card-lbl">🏢 Tổng hợp quy định đặc thù cho thuê BĐS</div>'
      +'<div class="card-title" style="font-size:13px">Các điểm quan trọng cần tuân thủ (Điều 4.4, Điều 5.2đ, Điều 8.3d-3đ-4d, NĐ 68/2026 sửa đổi bởi NĐ 141/2026)</div>'
      +'<div><div class="ss-head" style="color:var(--rose)">1. Công thức tính thuế (Khoản 4 Điều 7, Luật TNCN 109/2025)</div>'
      +'<div class="ss-body ss-rose">'
      +'▪ <strong>Thuế GTGT = 5% × Tổng doanh thu BĐS cho thuê</strong><br>'
      +'▪ <strong>Thuế TNCN = 5% × (Tổng doanh thu − 1 tỷ đồng miễn thuế/năm)</strong><br>'
      +'▪ <strong>Tiền phạt/Bồi thường:</strong> TNCN = 5% × toàn bộ khoản tiền (không được trừ 1 tỷ)</div></div>'
      +'<div><div class="ss-head" style="color:var(--p)">2. Xác định doanh thu (Điều 5.2đ, NĐ 68/2026)</div>'
      +'<div class="ss-body ss-blue">'
      +'▪ <strong>Trả tiền từng kỳ:</strong> DT = số tiền bên thuê trả từng kỳ theo HĐ.<br>'
      +'▪ <strong>Trả trước nhiều năm:</strong> Cá nhân chọn phân bổ đều cho số năm, hoặc tính toàn bộ vào năm nhận tiền.</div></div>'
      +'<div><div class="ss-head" style="color:var(--green)">3. Nhiều BĐS cho thuê (Điều 4.4a &amp; 4.4b, NĐ 68/2026 sửa đổi bởi NĐ 141/2026)</div>'
      +'<div class="ss-body ss-green">'
      +'▪ Tổng mức trừ ≤ <strong>1 tỷ đồng/năm</strong> cho tất cả HĐ BĐS cho thuê (nâng từ 500 triệu lên 01 tỷ).<br>'
      +'▪ Cá nhân <strong>được chọn HĐ nào được trừ</strong> theo phương án có lợi nhất.<br>'
      +'▪ HĐ đã chọn chưa trừ đủ → tiếp tục chọn HĐ khác đến khi trừ đủ 1 tỷ.<br>'
      +'▪ Tổ chức khai thay: phải ghi rõ trong HĐ số tiền được trừ cụ thể.</div></div>'
      +'<div><div class="ss-head" style="color:var(--amber)">4. Kỳ khai &amp; địa điểm (Điều 8.3d, 8.4d, NĐ 68/2026)</div>'
      +'<div class="ss-body ss-amber">'
      +'<strong>Cá nhân tự khai:</strong> 2 lần/năm (31/7 + 31/01) hoặc 1 lần/năm (31/01 năm sau).<br>'
      +'<strong>Tổ chức thuê khai thay:</strong> Theo kỳ thanh toán trong HĐ.<br>'
      +'<strong>Cá nhân → cá nhân thuê:</strong> Không được ủy quyền khai thay.<br>'
      +'<strong>Nộp hồ sơ:</strong> CQT nơi có BĐS (không phải nơi cư trú).<br>'
      +'<strong>Nộp thuế:</strong> Theo từng địa điểm nơi có BĐS cho thuê.</div></div>'
      +'<div><div class="ss-head" style="color:var(--s400)">5. Điều khoản chuyển tiếp (Điều 18.3, NĐ 68/2026 sửa đổi bởi NĐ 141/2026)</div>'
      +'<div class="ss-body ss-slate">HĐ ký <strong>trước 01/01/2026</strong> thời hạn còn &gt; 6 tháng: được điều chỉnh mức miễn 1 tỷ. DT còn lại &gt; 1 tỷ → nộp thuế theo NĐ 68/2026 (sửa đổi bởi NĐ 141/2026). Thuế đã nộp thừa → hoàn trả/bù trừ theo Điều 12.</div></div>'
      +'</div>';
  }
  if(a3B&&!isBDS){
    specH+='<div class="fcard" style="border-left-color:var(--rose)">'
      +'<div class="card-lbl">🔴 Lưu ý – Doanh thu trên 3 tỷ đồng</div>'
      +'<div class="card-title" style="font-size:13px">Yêu cầu bổ sung khi doanh thu &gt; 3 tỷ đồng</div>'
      +'<div style="font-size:12.5px;line-height:1.8;color:var(--s600)">'
      +'▪ <strong>Bắt buộc PP2:</strong> Thu nhập tính thuế × Thuế suất (&gt; 1 tỷ - 3 tỷ: 15%; &gt; 3 tỷ - 50 tỷ: 17%; &gt; 50 tỷ: 20%) (Điều 4.5b, NĐ 68/2026 sửa đổi bởi NĐ 141/2026).<br>'
      +'▪ Ổn định phương pháp <strong>02 năm liên tục</strong> kể từ năm đầu áp dụng.<br>'
      +'▪ Lập <strong>Mẫu 01/BK-HTK</strong> (hàng tồn kho, máy móc tại 31/12/2025), gửi kèm tờ khai Q1/2026 hoặc trước 20/4/2026.<br>'
      +'▪ Nếu đang áp dụng PP2 mà hết năm DT ≤ 3 tỷ → <strong>không tự động chuyển PP1</strong> (còn trong 02 năm ổn định).'
      +'</div></div>';
  }
  // Lưu ý: Sau NĐ 141/2026, đối với CNKD/HKD nói chung ngưỡng miễn thuế và bắt buộc HĐĐT trùng nhau ở 01 tỷ.
  // Riêng hoạt động cho thuê BĐS không có quy định cụ thể về ngưỡng bắt buộc HĐĐT.
  // → bỏ cảnh báo "DT đang dưới 1 tỷ" (vì điều kiện a500 && rev<T1B không bao giờ xảy ra)

  // ── Banner ───────────────────────────────────────────
  var bCls=ex?'sb-ok':'sb-no';
  var bTxt=ex
    ?'Doanh thu <strong>'+fmt(rev)+'</strong> — Không phải nộp GTGT &amp; TNCN. Chỉ thông báo doanh thu.'
    :'Doanh thu <strong>'+fmt(rev)+'</strong> — Phải khai thuế và nộp thuế GTGT &amp; TNCN.';

  var pitBC=ex?'tg-green':(isBDS?'tg-teal':(a3B?'tg-rose':'tg-amber'));
  var pitBT=ex?'Miễn TNCN':(isBDS?'5% × (DT − 1 tỷ)':(a3B?'PP2 – Bắt buộc':'PP1 hoặc PP2'));
  var frCC=isBDS?'cl-teal':'cl-blue';
  var frTitle=ex?(isBDS?'Thông báo 1 lần/năm':'Thông báo doanh thu 1 lần/năm'):(isBDS?'Khai 2 lần/năm hoặc 1 lần/năm':(a50B?'Khai thuế theo tháng':'Khai thuế theo quý'));
  var frTag=ex?'1 lần/năm':(isBDS?'2 lần/năm':(a50B?'Hàng tháng':'Hàng quý'));

  var h='';
  h+='<div class="sum-banner '+bCls+'"><span class="sb-icon">'+(ex?'✅':'🔴')+'</span><span>'+bTxt+'</span></div>';
  h+=tierBar;
  h+='<div class="rgrid">';
  // GTGT
  h+='<div class="card '+(ex?'cl-green':'cl-rose')+'">'
    +'<div class="card-ico">🧾</div><div class="card-lbl">Thuế GTGT</div>'
    +'<div class="card-title">'+vatSt+'</div><div class="card-body">'
    +(ex?'DT ≤ 1 tỷ → <strong>không thuộc đối tượng chịu GTGT</strong> (Điều 3, NĐ 68/2026 sửa đổi bởi NĐ 141/2026).'
        :'Tính trực tiếp: <strong>'+r.vat+'</strong> × Doanh thu<br>(Điều 3, NĐ 68/2026)')
    +'<br><span class="tag '+(ex?'tg-green':'tg-rose')+'">'+(ex?'Miễn GTGT':'Chịu GTGT')+'</span></div></div>';
  // TNCN
  h+='<div class="card '+(ex?'cl-green':(isBDS?'cl-teal':'cl-amber'))+'">'
    +'<div class="card-ico">💼</div><div class="card-lbl">Thuế TNCN</div>'
    +'<div class="card-title">'+pitSt+'</div><div class="card-body">'
    +(ex?'DT ≤ 1 tỷ → <strong>không phải nộp TNCN</strong> (Điều 4, NĐ 68/2026 sửa đổi bởi NĐ 141/2026).'
        :'<strong>'+pitTi+'</strong><br>'+pitDe)
    +'<br><span class="tag '+pitBC+'">'+pitBT+'</span></div></div>';
  // Kỳ khai
  h+='<div class="card '+frCC+'">'
    +'<div class="card-ico">📅</div><div class="card-lbl">Kỳ khai &amp; nộp thuế</div>'
    +'<div class="card-title">'+frTitle+'</div><div class="card-body">'
    +(ex?'Chỉ <strong>thông báo doanh thu</strong> chậm nhất 31/01 năm sau. Không cần khai thuế định kỳ.':frDe)
    +'<br><span class="tag tg-blue">'+frTag+'</span></div></div>';
  // HĐĐT
  h+='<div class="card '+invCC+'">'
    +'<div class="card-ico">🖨️</div><div class="card-lbl">Hóa đơn điện tử</div>'
    +'<div class="card-title">'+invSt+'</div><div class="card-body">'
    +(isBDS?'<strong>Hoạt động cho thuê BĐS không có quy định cụ thể</strong> về việc bắt buộc sử dụng hóa đơn theo ngưỡng doanh thu.<br><em style="font-size:11px">HKD/CNKD cho thuê BĐS có thắc mắc về sử dụng hóa đơn vui lòng liên hệ <strong>CQT quản lý trực tiếp nơi có BĐS cho thuê</strong> để được hướng dẫn.</em>'
      :(ex?'DT ≤ 1 tỷ → <strong>không bắt buộc</strong> HĐĐT có mã CQT (có thể tự nguyện đăng ký).'
      :'DT &gt; 1 tỷ → <strong>bắt buộc</strong> HĐĐT có mã CQT hoặc từ máy tính tiền kết nối CQT.<br><em style="font-size:11px">Đăng ký trong 30 ngày kể từ khi DT lũy kế &gt; 1 tỷ (Điều 8.5, NĐ 68/2026 sửa đổi bởi NĐ 141/2026).</em>'))
    +'<br><span class="tag '+invBC+'">'+(isBDS?'Liên hệ CQT':(ex?'Không bắt buộc':'Bắt buộc'))+'</span></div></div>';
  h+='</div>';

  h+=estH;
  h+='<div class="fcard"><div class="card-lbl">📂 Mẫu biểu theo TT 18/2026/TT-BTC</div>'
    +'<div class="card-title" style="font-size:13px">Hồ sơ cần nộp cho cơ quan thuế</div>'
    +'<ul class="form-list">'+fH+'</ul>'
    +'<div class="alert a-info" style="margin-top:10px"><span class="a-icon">ℹ️</span>'
    +'<span>Nộp hồ sơ bằng <strong>phương thức điện tử</strong> qua Cổng dịch vụ công hoặc phần mềm hỗ trợ kê khai Cục Thuế.</span></div></div>';
  h+=buildAccounting(ex, a500, a3B, isBDS);
  h+='<div class="fcard" style="border-left-color:var(--rose)">'
    +'<div class="card-lbl">⏰ Thời hạn quan trọng</div>'
    +'<div class="card-title" style="font-size:13px">Lịch nộp hồ sơ và nộp thuế</div>'
    +dls+'</div>';
  h+=specH;
  h+='<div class="fn"><strong>Căn cứ pháp lý:</strong> NĐ 68/2026/NĐ-CP ngày 05/3/2026 · <strong>NĐ 141/2026/NĐ-CP ngày 29/4/2026</strong> (sửa đổi NĐ 68) · TT 18/2026/TT-BTC ngày 05/3/2026 · TT 152/2025/TT-BTC ngày 31/12/2025 · Luật GTGT số 48/2024/QH15 · Luật TNCN số 109/2025/QH15.<br><br>'
    +'<em>⚠️ Công cụ chỉ mang tính tham khảo. Các trường hợp phức tạp (nhiều ngành nghề, nhiều địa điểm, kinh doanh TMĐT, đại lý xổ số/bảo hiểm…) cần tham khảo trực tiếp cán bộ thuế hoặc đại lý thuế chuyên nghiệp.</em></div>';

  if(a500) {
    h += '<div class="fcard" style="border-left-color:var(--p); margin-top:14px;">'
      + '<div class="card-lbl">📊 Tỷ trọng Thuế trên Doanh thu</div>'
      + '<div style="height:220px; display:flex; justify-content:center; align-items:center;">'
      + '<canvas id="taxChart"></canvas>'
      + '</div></div>';
  }

  h += '<div style="margin-top:20px;text-align:center;">'
    +'<button class="btn" style="background:#7c3aed;padding:12px 24px;font-size:14px;box-shadow:0 4px 12px rgba(124,58,237,0.3);" onclick="openAccountingBook(\''+biz+'\', '+rev+')">📒 Mở sổ kế toán cho dữ liệu này</button>'
    +'</div>';

  document.getElementById('results').innerHTML=h;

  if(a500) {
    var vAmt=Math.round(rev*parseFloat(r.vat)/100);
    var pAmt=Math.round((rev-T1B)*parseFloat(r.pit)/100);
    renderTaxChart(rev - vAmt - pAmt, vAmt, pAmt);
  }
}

let taxChartInstance = null;
function renderTaxChart(revenueLeft, vat, pit) {
  const ctx = document.getElementById('taxChart').getContext('2d');
  if(taxChartInstance) taxChartInstance.destroy();
  
  taxChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Doanh thu sau thuế', 'Thuế GTGT', 'Thuế TNCN'],
      datasets: [{
        data: [revenueLeft, vat, pit],
        backgroundColor: ['#10b981', '#f43f5e', '#f59e0b'],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: { position: 'right', labels: { font: { family: 'Inter', size: 11 } } },
        tooltip: {
          callbacks: {
            label: function(context) {
              return ' ' + context.label + ': ' + context.raw.toLocaleString('vi-VN') + ' đ';
            }
          }
        }
      }
    }
  });
}

function openAccountingBook(bizType, rev) {
  window.location.href = '../kthkd/?bizType=' + encodeURIComponent(bizType) + '&rev=' + rev;
}
