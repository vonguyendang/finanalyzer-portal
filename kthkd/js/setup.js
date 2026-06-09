// ═══════════════════════════════════════════════════════════
// SETUP
// ═══════════════════════════════════════════════════════════
(function renderGroupGrid(){
  var g=$('group-grid');
  [1,2,3].forEach(function(i){
    var gr=GROUPS[i];
    var d=document.createElement('div');
    d.className='grp-card';
    d.id='gc-'+i;
    d.style.setProperty('--pc',gr.color);
    d.style.setProperty('--plt',gr.lt);
    d.style.setProperty('--pb',gr.b);
    d.innerHTML='<div class="grp-chk">✓</div>'
      +'<div class="grp-icon">'+gr.icon+'</div>'
      +'<div class="grp-name">'+gr.name+'</div>'
      +'<div class="grp-dt" style="background:'+gr.lt+';color:'+gr.color+';border:1px solid '+gr.b+'">'+gr.dt+'</div>'
      +'<div class="grp-desc">'+gr.desc+'</div>'
      +'<div class="grp-books">Sổ: '+GROUPS[i].books.join(', ')+'-HKD</div>';
    d.onclick=function(){
      document.querySelectorAll('.grp-card').forEach(function(c){c.classList.remove('sel');});
      d.classList.add('sel');
      S.group=i;
      $('step1-next').disabled=false;
      $('g4-toggle').style.display='flex';
    };
    g.appendChild(d);
  });
})();

function goStep(n){
  document.querySelectorAll('.setup-step').forEach(function(s){s.classList.remove('active');});
  $('step'+n).classList.add('active');
}

function finishSetup(){
  var name=$('p-name').value.trim();
  var addr=$('p-addr').value.trim();
  if(!name||!addr){toast('Vui lòng nhập tên và địa chỉ kinh doanh!','err');return;}
  S.profile={name:name,addr:addr,mst:$('p-mst').value.trim()||'—',
    phone:$('p-phone').value.trim()||'—',
    industry:$('p-industry').value,
    period:$('p-period').value};
  S.hasG4=$('g4-check').checked;
  S.periods=[S.profile.period];
  S.curPeriod=S.profile.period;
  S.curBook='dash';
  initPeriod(S.curPeriod);
  
  autoSaveToLocal();
  
  $('setup').style.display='none';
  $('app').style.display='flex';
  buildAppShell();
  renderContent();
}

// Auto-fill from URL params (from tracuu-hkd)
(function parseUrlParams(){
  var params = new URLSearchParams(window.location.search);
  if(params.has('bizType')){
    var biz = params.get('bizType');
    if(biz === 'realestate') biz = 'bds'; // Map tracuu-hkd 'realestate' to kthkd 'bds'
    var indSelect = $('p-industry');
    for(var i=0; i<indSelect.options.length; i++){
      if(indSelect.options[i].value === biz){
        indSelect.selectedIndex = i;
        break;
      }
    }
  }
})();
