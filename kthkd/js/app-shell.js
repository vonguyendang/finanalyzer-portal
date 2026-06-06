// ═══════════════════════════════════════════════════════════
// APP SHELL
// ═══════════════════════════════════════════════════════════
function getBooks(){
  var books=GROUPS[S.group].books.slice();
  if(S.hasG4)books.push('S3a');
  return books;
}

function buildAppShell(){
  // Topbar
  $('tb-biz').textContent=S.profile.name;
  // Period selector
  buildPeriodSel();
  // Sidebar books
  var nav=$('nav-books');
  nav.innerHTML='';
  getBooks().forEach(function(b){
    var m=BOOK_META[b];
    var d=document.createElement('div');
    d.className='sb-item';d.id='nav-'+b;
    d.innerHTML='<span class="si-ico">'+m.icon+'</span>'
      +'<span>'+m.name+'</span>'
      +'<span class="si-code">'+b+'-HKD</span>';
    d.onclick=function(){switchBook(b);};
    nav.appendChild(d);
  });
  // Sidebar info
  var r=INDUSTRY_RATES[S.profile.industry];
  var gc=GROUPS[S.group];
  $('sb-info-box').innerHTML='<div class="sb-info-lbl">Nhóm kế toán</div>'
    +'<div class="sb-info-val">'+gc.icon+' '+gc.name+'</div>'
    +'<span class="sb-badge" style="background:'+gc.lt+';color:'+gc.color+';border:1px solid '+gc.b+'">'+gc.dt+'</span>'
    +'<div style="margin-top:8px;font-size:11px;color:var(--s500)">'+r.label+'</div>'
    +(S.group>1?'<div style="font-size:11px;margin-top:3px">GTGT <strong>'+r.vat+'%</strong> · TNCN <strong>'+r.pit+'%</strong></div>':'');
}

function buildPeriodSel(){
  var sel=$('period-sel');
  sel.innerHTML='';
  S.periods.forEach(function(p){
    var o=document.createElement('option');
    o.value=p;o.textContent=p;
    if(p===S.curPeriod)o.selected=true;
    sel.appendChild(o);
  });
}

function switchPeriod(p){
  S.curPeriod=p;
  initPeriod(p);
  renderContent();
}

function switchBook(b){
  S.curBook=b;
  document.querySelectorAll('.sb-item').forEach(function(x){x.classList.remove('active');});
  var nav=$('nav-'+b)||$('nav-dash');
  if(nav)nav.classList.add('active');
  renderContent();
}

function addPeriod(){
  var p=prompt('Nhập kỳ kế toán mới (ví dụ: Q2/2026, T4/2026, Nam2026):');
  if(!p||!p.trim())return;
  p=p.trim();
  if(S.periods.indexOf(p)>=0){toast('Kỳ này đã tồn tại','err');return;}
  S.periods.push(p);
  initPeriod(p);
  S.curPeriod=p;
  buildPeriodSel();
  renderContent();
  toast('Đã thêm kỳ: '+p);
}

