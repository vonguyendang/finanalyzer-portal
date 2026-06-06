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

