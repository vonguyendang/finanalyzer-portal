// ═══════════════════════════════════════════════════════════
// MODAL / ENTRY FORMS
// ═══════════════════════════════════════════════════════════
function openModal(book,id){
  S.curBook=book; S.editId=id||null;
  var d=null;
  if(id){d=S.data[S.curPeriod][book].find(function(e){return e.id===id;});}
  var m=BOOK_META[book];
  var isEdit=!!d;
  $('modal-title').textContent=(isEdit?'Sửa bút toán – ':'Thêm bút toán – ')+m.name+' ('+book+'-HKD)';
  $('modal-body').innerHTML=buildForm(book,d);
  
  var btnXml = $('btn-upload-xml');
  if(btnXml) {
    // Only show XML upload for revenue/expense related books
    if(['S1a', 'S2a', 'S2b', 'S2c', 'S2d'].indexOf(book) >= 0 && !isEdit) {
      btnXml.style.display = 'inline-block';
    } else {
      btnXml.style.display = 'none';
    }
  }

  $('overlay').classList.add('show');
  var firstInput=$('modal-body').querySelector('input,select');
  if(firstInput)setTimeout(function(){firstInput.focus();},100);
}

function parseXmlInvoice(input) {
  var file = input.files[0];
  if(!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    try {
      var parser = new DOMParser();
      var xml = parser.parseFromString(e.target.result, "text/xml");
      
      // Extract data - typical fields from e-invoice XML (NĐ 123/2020/NĐ-CP)
      var issueDate = xml.querySelector("NgayLap") ? xml.querySelector("NgayLap").textContent : "";
      var amountBeforeTax = xml.querySelector("TgTienChuaThue") ? parseFloat(xml.querySelector("TgTienChuaThue").textContent) : 0;
      var totalAmount = xml.querySelector("TgTTTBSo") ? parseFloat(xml.querySelector("TgTTTBSo").textContent) : 0;
      var sellerName = xml.querySelector("NBan Ten") ? xml.querySelector("NBan Ten").textContent : "";
      var buyerName = xml.querySelector("NMua Ten") ? xml.querySelector("NMua Ten").textContent : "";
      
      if(!totalAmount) {
        // Fallback to other possible tags depending on provider
        var totalEl = xml.getElementsByTagName('TotalAmount')[0] || xml.getElementsByTagName('Amount')[0];
        if (totalEl) totalAmount = parseFloat(totalEl.textContent);
      }

      // Populate form fields
      if($('f-date') && issueDate) {
        // XML date is usually YYYY-MM-DD format
        $('f-date').value = issueDate;
      }
      if($('f-amount') && totalAmount) {
        $('f-amount').value = totalAmount;
      }
      if($('f-desc')) {
        $('f-desc').value = "Thu từ hóa đơn điện tử: " + (buyerName || "Khách hàng");
      }
      if($('f-itemName')) { // For S2d
        $('f-itemName').value = "Hàng hóa nhập/xuất từ HĐ";
      }

      toast("Đã tải dữ liệu từ Hóa đơn XML thành công!");
    } catch(err) {
      toast("Lỗi đọc file XML: " + err.message, "err");
    }
  };
  reader.readAsText(file);
  input.value = ''; // Reset
}


function closeModal(){$('overlay').classList.remove('show');S.editId=null;}

function buildForm(book,d){
  var r=INDUSTRY_RATES[S.profile.industry];
  var def=function(f,fb){return d?d[f]:fb;};

  if(book==='S1a'){
    return '<div class="modal-2col">'
      +'<div class="modal-fg"><label>Ngày tháng *</label><input type="date" id="f-date" value="'+def('date',today())+'"></div>'
      +'<div class="modal-fg"><label>Số tiền (đồng) *</label><input type="number" id="f-amount" value="'+def('amount','')+'" placeholder="500000" oninput="previewTax()"></div>'
      +'</div>'
      +'<div class="modal-fg"><label>Diễn giải *</label><textarea id="f-desc" rows="2" placeholder="Doanh thu bán hàng ngày...">'+def('desc','')+'</textarea></div>';
  }
  if(book==='S2a'||book==='S2b'){
    var pv=d?'':taxPreview(0,r);
    return '<div class="modal-2col">'
      +'<div class="modal-fg"><label>Số chứng từ</label><input type="text" id="f-refNum" value="'+def('refNum','')+'" placeholder="HD001, PC001..."></div>'
      +'<div class="modal-fg"><label>Ngày chứng từ *</label><input type="date" id="f-date" value="'+def('date',today())+'"></div>'
      +'</div>'
      +'<div class="modal-fg"><label>Ngành nghề (nếu có nhiều ngành)</label>'
      +'<select id="f-industry">'+Object.keys(INDUSTRY_RATES).map(function(k){
        var ir=INDUSTRY_RATES[k];
        return '<option value="'+k+'" '+(def('industryKey',S.profile.industry)===k?'selected':'')+'>'+ir.label+' – GTGT '+ir.vat+'%, TNCN '+ir.pit+'%</option>';
      }).join('')+'</select></div>'
      +'<div class="modal-fg"><label>Diễn giải *</label><textarea id="f-desc" rows="2" placeholder="Bán hàng hóa, dịch vụ...">'+def('desc','')+'</textarea></div>'
      +'<div class="modal-fg"><label>Số tiền doanh thu (đồng) *</label>'
      +'<input type="number" id="f-amount" value="'+def('amount','')+'" placeholder="1000000" oninput="previewTax()"></div>'
      +'<div class="tax-preview" id="tax-preview">'+pv+'</div>';
  }
  if(book==='S2c'){
    return '<div class="modal-2col">'
      +'<div class="modal-fg"><label>Số CT</label><input type="text" id="f-refNum" value="'+def('refNum','')+'"></div>'
      +'<div class="modal-fg"><label>Ngày *</label><input type="date" id="f-date" value="'+def('date',today())+'"></div>'
      +'</div>'
      +'<div class="modal-fg"><label>Loại bút toán *</label>'
      +'<div class="type-row">'
      +'<span class="type-chip '+(def('kind','rev')==='rev'?'sel':'')+'" onclick="selKind(\'rev\')">📈 Doanh thu</span>'
      +'<span class="type-chip '+(def('kind','rev')==='exp'?'sel':'')+'" onclick="selKind(\'exp\')">📉 Chi phí</span>'
      +'</div><input type="hidden" id="f-kind" value="'+def('kind','rev')+'"></div>'
      +'<div class="modal-fg" id="f-exptype-wrap" style="display:'+(def('kind','rev')==='exp'?'block':'none')+'"><label>Loại chi phí</label>'
      +'<select id="f-expType">'+EXPENSE_TYPES.map(function(x){
        return '<option value="'+x.id+'" '+(def('expType','a')===x.id?'selected':'')+'>'+x.label+'</option>';
      }).join('')+'</select></div>'
      +'<div class="modal-fg"><label>Diễn giải</label><textarea id="f-desc" rows="2">'+def('desc','')+'</textarea></div>'
      +'<div class="modal-fg"><label>Số tiền (đồng) *</label><input type="number" id="f-amount" value="'+def('amount','')+'" placeholder="500000"></div>';
  }
  if(book==='S2d'){
    return '<div class="modal-2col">'
      +'<div class="modal-fg"><label>Số CT</label><input type="text" id="f-refNum" value="'+def('refNum','')+'"></div>'
      +'<div class="modal-fg"><label>Ngày *</label><input type="date" id="f-date" value="'+def('date',today())+'"></div>'
      +'</div>'
      +'<div class="modal-2col">'
      +'<div class="modal-fg"><label>Tên hàng hóa *</label><input type="text" id="f-itemName" value="'+def('itemName','')+'" placeholder="Tên sản phẩm, vật liệu..."></div>'
      +'<div class="modal-fg"><label>Đơn vị tính</label><input type="text" id="f-unit" value="'+def('unit','')+'" placeholder="cái, kg, lít..."></div>'
      +'</div>'
      +'<div class="modal-fg"><label>Đơn giá (đồng)</label><input type="number" id="f-price" value="'+def('price','')+'" placeholder="50000"></div>'
      +'<div class="modal-2col">'
      +'<div class="modal-fg"><label>Số lượng Nhập</label><input type="number" id="f-qtyIn" value="'+def('qtyIn','')+'" placeholder="0"></div>'
      +'<div class="modal-fg"><label>Số lượng Xuất</label><input type="number" id="f-qtyOut" value="'+def('qtyOut','')+'" placeholder="0"></div>'
      +'</div>'
      +'<div class="modal-fg"><label>Diễn giải</label><textarea id="f-desc" rows="2">'+def('desc','')+'</textarea></div>';
  }
  if(book==='S2e'){
    return '<div class="modal-2col">'
      +'<div class="modal-fg"><label>Số CT</label><input type="text" id="f-refNum" value="'+def('refNum','')+'"></div>'
      +'<div class="modal-fg"><label>Ngày *</label><input type="date" id="f-date" value="'+def('date',today())+'"></div>'
      +'</div>'
      +'<div class="modal-fg"><label>Diễn giải *</label><textarea id="f-desc" rows="2">'+def('desc','')+'</textarea></div>'
      +'<div class="modal-2col">'
      +'<div class="modal-fg"><label>💵 Tiền mặt TU (đồng)</label><input type="number" id="f-cashIn" value="'+def('cashIn','')+'" placeholder="0"></div>'
      +'<div class="modal-fg"><label>💵 Tiền mặt CHI (đồng)</label><input type="number" id="f-cashOut" value="'+def('cashOut','')+'" placeholder="0"></div>'
      +'</div>'
      +'<div class="modal-fg"><label>🏦 Tên ngân hàng</label><input type="text" id="f-bankName" value="'+def('bankName','')+'" placeholder="Vietcombank, BIDV..."></div>'
      +'<div class="modal-2col">'
      +'<div class="modal-fg"><label>🏦 Tiền gửi VÀO (đồng)</label><input type="number" id="f-bankIn" value="'+def('bankIn','')+'" placeholder="0"></div>'
      +'<div class="modal-fg"><label>🏦 Tiền gửi RA (đồng)</label><input type="number" id="f-bankOut" value="'+def('bankOut','')+'" placeholder="0"></div>'
      +'</div>';
  }
  if(book==='S3a'){
    return '<div class="modal-2col">'
      +'<div class="modal-fg"><label>Ngày *</label><input type="date" id="f-date" value="'+def('date',today())+'"></div>'
      +'<div class="modal-fg"><label>Loại thuế *</label><select id="f-taxType">'+OTHER_TAX_TYPES.map(function(t){
        return '<option value="'+t.id+'" '+(def('taxType','ttdb')===t.id?'selected':'')+'>'+t.label+'</option>';
      }).join('')+'</select></div>'
      +'</div>'
      +'<div class="modal-fg"><label>Diễn giải</label><textarea id="f-desc" rows="2">'+def('desc','')+'</textarea></div>'
      +'<div class="modal-2col">'
      +'<div class="modal-fg"><label>Lượng hàng hóa</label><input type="number" id="f-qty" value="'+def('qty','')+'" placeholder="0" oninput="calcOtherTax()"></div>'
      +'<div class="modal-fg"><label>Giá tính thuế/đơn vị (đ)</label><input type="number" id="f-taxBase" value="'+def('taxBase','')+'" placeholder="0" oninput="calcOtherTax()"></div>'
      +'</div>'
      +'<div class="modal-2col">'
      +'<div class="modal-fg"><label>Thuế suất (%)</label><input type="number" id="f-rate" value="'+def('rate','')+'" placeholder="10" step="0.1" oninput="calcOtherTax()"></div>'
      +'<div class="modal-fg"><label>Số thuế phải nộp (đ)</label><input type="number" id="f-taxAmt" value="'+def('taxAmt','')+'" placeholder="Tự động tính..."></div>'
      +'</div>';
  }
  return '<p>Không rõ sổ: '+book+'</p>';
}

function selKind(k){
  $('f-kind').value=k;
  document.querySelectorAll('.type-chip').forEach(function(c){c.classList.remove('sel');});
  event.target.classList.add('sel');
  $('f-exptype-wrap').style.display=k==='exp'?'block':'none';
}

function previewTax(){
  var el=$('tax-preview');if(!el)return;
  var book=S.curBook;
  var r=INDUSTRY_RATES[$('f-industry')?$('f-industry').value:S.profile.industry];
  var amt=parseN($('f-amount').value);
  el.innerHTML=taxPreview(amt,r);
}

function taxPreview(amt,r){
  if(!amt)return '<span style="color:var(--s400)">Nhập số tiền để xem ước tính thuế</span>';
  var vat=Math.round(amt*r.vat/100);
  var pitBase=r.isBDS?Math.max(0,amt-T500M):amt;
  var pit=Math.round(pitBase*r.pit/100);
  return '📊 Ước tính: GTGT = <span class="tp-vat">'+fN(vat)+' đ</span>'
    +(r.isBDS?' ('+r.vat+'% × DT)':' ('+r.vat+'% × DT)')
    +' · TNCN = <span class="tp-pit">'+fN(pit)+' đ</span>'
    +(r.isBDS?' ('+r.pit+'% × max(0, DT−500tr))':' ('+r.pit+'% × DT)')
    +' · <strong>Tổng: '+fN(vat+pit)+' đ</strong>';
}

function calcOtherTax(){
  var qty=parseN($('f-qty')?$('f-qty').value:0);
  var base=parseN($('f-taxBase')?$('f-taxBase').value:0);
  var rate=parseN($('f-rate')?$('f-rate').value:0);
  var amt=qty*base*rate/100;
  if($('f-taxAmt'))$('f-taxAmt').value=Math.round(amt)||'';
}

function gv(id){var el=$(id);return el?el.value.trim():'';}
function gn(id){var el=$(id);return parseN(el?el.value:0);}

function saveEntry(){
  var book=S.curBook;
  var date=gv('f-date');
  if(!date){toast('Vui lòng nhập ngày!','err');return;}

  var d=S.data[S.curPeriod][book];
  var entry={id:S.editId||uid(),date:date};

  if(book==='S1a'){
    var amt=gn('f-amount');if(!amt){toast('Vui lòng nhập số tiền!','err');return;}
    entry.desc=gv('f-desc')||'Doanh thu';
    entry.amount=amt;
  }else if(book==='S2a'||book==='S2b'){
    var amt=gn('f-amount');if(!amt){toast('Vui lòng nhập doanh thu!','err');return;}
    var iKey=gv('f-industry')||S.profile.industry;
    var r=INDUSTRY_RATES[iKey];
    entry.refNum=gv('f-refNum');
    entry.industryKey=iKey;
    entry.industry=r.label;
    entry.desc=gv('f-desc')||'Doanh thu';
    entry.amount=amt;
    entry.vatAmt=Math.round(amt*r.vat/100);
    var pitBase=r.isBDS?Math.max(0,amt-T500M):amt;
    entry.pitAmt=Math.round(pitBase*r.pit/100);
  }else if(book==='S2c'){
    var amt=gn('f-amount');if(!amt){toast('Vui lòng nhập số tiền!','err');return;}
    entry.refNum=gv('f-refNum');
    entry.kind=gv('f-kind')||'rev';
    entry.expType=gv('f-expType');
    entry.desc=gv('f-desc')||'';
    entry.amount=amt;
  }else if(book==='S2d'){
    var iName=gv('f-itemName');if(!iName){toast('Vui lòng nhập tên hàng hóa!','err');return;}
    entry.refNum=gv('f-refNum');
    entry.itemName=iName;
    entry.unit=gv('f-unit');
    entry.price=gn('f-price');
    entry.qtyIn=gn('f-qtyIn');
    entry.qtyOut=gn('f-qtyOut');
    entry.desc=gv('f-desc')||'';
    entry.disp=iName;
    entry.amount=entry.qtyIn*entry.price;
  }else if(book==='S2e'){
    entry.refNum=gv('f-refNum');
    entry.desc=gv('f-desc');
    entry.cashIn=gn('f-cashIn');entry.cashOut=gn('f-cashOut');
    entry.bankName=gv('f-bankName');
    entry.bankIn=gn('f-bankIn');entry.bankOut=gn('f-bankOut');
    entry.amount=entry.cashIn+entry.bankIn;
    if(!entry.desc){toast('Vui lòng nhập diễn giải!','err');return;}
  }else if(book==='S3a'){
    var taxType=gv('f-taxType');
    entry.taxType=taxType;
    entry.desc=gv('f-desc')||'';
    entry.qty=gn('f-qty');
    entry.taxBase=gn('f-taxBase');
    entry.rate=parseFloat(gv('f-rate'))||0;
    entry.taxAmt=gn('f-taxAmt');
    if(!entry.taxAmt)entry.taxAmt=Math.round(entry.qty*entry.taxBase*entry.rate/100);
    entry.amount=entry.taxAmt;
  }

  if(S.editId){
    var idx=d.findIndex(function(e){return e.id===S.editId;});
    if(idx>=0)d[idx]=entry;
  }else{
    d.push(entry);
  }

  closeModal();
  autoSaveToLocal();
  renderContent();
  toast(S.editId?'Đã cập nhật bút toán.':'Đã thêm bút toán mới.');
}

function delEntry(book,id){
  if(!confirm('Xóa bút toán này?'))return;
  var d=S.data[S.curPeriod][book];
  S.data[S.curPeriod][book]=d.filter(function(e){return e.id!==id;});
  autoSaveToLocal();
  renderContent();
  toast('Đã xóa bút toán.','info');
}

