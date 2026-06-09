// ═══════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════
var S = {
  group:1, hasG4:false,
  profile:{name:'',addr:'',mst:'',phone:'',industry:'goods',period:'Q1/2026'},
  periods:['Q1/2026'],
  curPeriod:'Q1/2026',
  curBook:'dash',
  editId:null,
  data:{} // { period: { S1a:[], S2a:[], ... } }
};

function initPeriod(p){
  if(!S.data[p]) S.data[p]={S1a:[],S2a:[],S2b:[],S2c:[],S2d:[],S2e:[],S3a:[]};
}

function autoSaveToLocal() {
  localStorage.setItem('kthkd_data', JSON.stringify(S));
}

function loadFromLocal() {
  var dataStr = localStorage.getItem('kthkd_data');
  if (dataStr) {
    try {
      var data = JSON.parse(dataStr);
      if(!data.profile||!data.data) return false;
      S.group=data.group||1;S.hasG4=data.hasG4||false;
      S.profile=data.profile;S.periods=data.periods||[data.profile.period];
      S.curPeriod=data.curPeriod || S.periods[0];
      S.curBook=data.curBook || 'dash';
      S.data=data.data||{};
      S.periods.forEach(initPeriod);
      return true;
    } catch(e) {
      return false;
    }
  }
  return false;
}

window.addEventListener('DOMContentLoaded', function() {
  if(loadFromLocal()) {
    setTimeout(function() {
      var setup = document.getElementById('setup');
      var app = document.getElementById('app');
      if(setup) setup.style.display='none';
      if(app) app.style.display='flex';
      if(typeof buildAppShell === 'function') buildAppShell();
      if(typeof renderContent === 'function') renderContent();
    }, 50);
  }
});

