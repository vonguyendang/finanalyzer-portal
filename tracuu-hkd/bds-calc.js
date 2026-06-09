// ── Multi-BDS Calculator ──────────────────────────────────
function propHint(inp){
  var row = inp.closest('.prop-row');
  var idx = row.getAttribute('data-idx');
  var v = parseFloat(inp.value);
  var hint = document.getElementById('ph-'+idx);
  if(hint) hint.textContent = (!isNaN(v)&&v>0) ? fmt(v) : '';
}

function addProp(){
  var list = document.getElementById('prop-list');
  var idx  = propCount++;
  var row  = document.createElement('div');
  row.className='prop-row';
  row.setAttribute('data-idx',idx);
  row.innerHTML='<span class="prop-label">BĐS '+(idx+1)+'</span>'
    +'<input type="number" placeholder="Doanh thu (đồng)" min="0" step="1000000" oninput="propHint(this); typeof saveData === &quot;function&quot; && saveData();">'
    +'<span class="prop-hint" id="ph-'+idx+'"></span>'
    +'<button class="btn-rm" onclick="removeProp(this); typeof saveData === &quot;function&quot; && saveData();" title="Xóa">×</button>';
  list.appendChild(row);
}

function removeProp(btn){
  var rows = document.querySelectorAll('#prop-list .prop-row');
  if(rows.length<=1){alert('Cần ít nhất 1 bất động sản.');return;}
  btn.closest('.prop-row').remove();
  // Re-label
  var remaining = document.querySelectorAll('#prop-list .prop-row');
  for(var i=0;i<remaining.length;i++){
    remaining[i].querySelector('.prop-label').textContent='BĐS '+(i+1);
  }
}

function calcBDS(){
  var inputs = document.querySelectorAll('#prop-list .prop-row input');
  var revenues = [];
  var i;
  for(i=0;i<inputs.length;i++){
    var v = parseFloat(inputs[i].value);
    revenues.push(isNaN(v)||v<0 ? 0 : v);
  }
  var total = revenues.reduce(function(a,b){return a+b;},0);
  var res   = document.getElementById('bds-calc-result');

  if(total===0){res.innerHTML='<div class="alert a-warn"><span class="a-icon">⚠️</span><span>Vui lòng nhập doanh thu ít nhất 1 bất động sản.</span></div>';res.style.display='block';return;}

  // GTGT = 5% of each property's revenue (only if revenue > 0)
  // TNCN = 5% × (total - 1 tỷ) — allocated optimally (NĐ 141/2026 nâng mức trừ lên 01 tỷ)
  // Optimal allocation: put 1 tỷ deduction on the highest-tax-rate property
  // Since all are 5%, just apply deduction to largest property first

  var deduction = T1B;
  var totalGTGT = 0;
  var totalTNCN = 0;
  var props = [];

  // Sort by revenue descending to optimally apply deduction
  var sorted = revenues.map(function(r,idx){return{r:r,idx:idx};}).sort(function(a,b){return b.r-a.r;});
  var allocations = new Array(revenues.length).fill(0);
  var remDeduct = deduction;
  for(i=0;i<sorted.length;i++){
    if(remDeduct<=0) break;
    var apply = Math.min(sorted[i].r, remDeduct);
    allocations[sorted[i].idx] = apply;
    remDeduct -= apply;
  }

  for(i=0;i<revenues.length;i++){
    var rev   = revenues[i];
    var gtgt  = (total>T1B) ? Math.round(rev*0.05) : 0;
    var deducted = allocations[i];
    var taxableBase = Math.max(0, rev - deducted);
    var tncn  = (total>T1B) ? Math.round(taxableBase*0.05) : 0;
    totalGTGT += gtgt;
    totalTNCN += tncn;
    props.push({rev:rev,gtgt:gtgt,tncn:tncn,deducted:deducted,taxableBase:taxableBase});
  }

  var totalTax = totalGTGT + totalTNCN;
  var isExempt = total <= T1B;

  var html = '';

  // Summary box
  html += '<div class="calc-summary">'
    +'<div class="row"><span class="lbl">Tổng doanh thu các BĐS</span><span class="val">'+fN(total)+' đ ('+fmt(total)+')</span></div>'
    +(isExempt
      ? '<div class="row"><span class="lbl" style="color:#86efac">✅ Trạng thái</span><span class="val" style="color:#86efac">Miễn thuế (DT ≤ 1 tỷ)</span></div>'
      : '<div class="row"><span class="lbl">Mức trừ miễn thuế TNCN</span><span class="val">1.000.000.000 đ (1 tỷ)</span></div>'
       +'<div class="row"><span class="lbl">Tổng thuế GTGT phải nộp</span><span class="val" style="color:#fca5a5">'+fN(totalGTGT)+' đ</span></div>'
       +'<div class="row"><span class="lbl">Tổng thuế TNCN phải nộp</span><span class="val" style="color:#fcd34d">'+fN(totalTNCN)+' đ</span></div>'
       +'<div class="row total"><span>Tổng thuế phải nộp</span><span>'+fN(totalTax)+' đ ('+fmt(totalTax)+')</span></div>'
    )
    +'</div>';

  if(!isExempt){
    // Property details
    for(i=0;i<props.length;i++){
      var p = props[i];
      html += '<div class="prop-detail">'
        +'<div class="prop-detail-head">🏢 BĐS '+(i+1)+': Doanh thu '+(p.rev>0?fN(p.rev)+' đ':'0 đ')+' — Mức trừ được áp dụng: '+fN(p.deducted)+' đ</div>'
        +'<div class="prop-detail-body">'
        +'<div class="prop-stat"><div class="ps-lbl">Doanh thu tính GTGT</div><div class="ps-val">'+fN(p.rev)+' đ</div></div>'
        +'<div class="prop-stat ps-gtgt"><div class="ps-lbl">Thuế GTGT (5%×DT)</div><div class="ps-val">'+fN(p.gtgt)+' đ</div></div>'
        +'<div class="prop-stat"><div class="ps-lbl">DT tính thuế TNCN</div><div class="ps-val">'+fN(p.taxableBase)+' đ</div></div>'
        +'<div class="prop-stat ps-tncn"><div class="ps-lbl">Thuế TNCN (5%×DT tính thuế)</div><div class="ps-val">'+fN(p.tncn)+' đ</div></div>'
        +'<div class="prop-stat ps-tot"><div class="ps-lbl">Tổng thuế BĐS này</div><div class="ps-val">'+fN(p.gtgt+p.tncn)+' đ</div></div>'
        +'</div></div>';
    }

    html += '<div class="alert a-info" style="margin-top:10px"><span class="a-icon">💡</span>'
      +'<span><strong>Phân bổ mức trừ 1 tỷ:</strong> Hệ thống đã phân bổ tự động mức trừ vào BĐS có doanh thu cao nhất để tối ưu. Cá nhân có quyền chọn phân bổ khác nhưng tổng mức trừ không vượt 1 tỷ/năm. Nộp thuế GTGT và TNCN <strong>theo từng địa điểm</strong> nơi có BĐS.</span>'
      +'</div>';
  } else {
    html += '<div class="alert a-teal" style="margin-top:0"><span class="a-icon">✅</span>'
      +'<span>Tổng doanh thu ≤ 1 tỷ đồng → Không phải nộp thuế GTGT &amp; TNCN. Chỉ cần <strong>thông báo doanh thu thực tế</strong> tại Mẫu 01/BĐS, nộp chậm nhất 31/01 năm tiếp theo.</span>'
      +'</div>';
  }

  res.innerHTML = html;
  res.style.display = 'block';
}
