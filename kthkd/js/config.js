// ═══════════════════════════════════════════════════════════
// CONSTANTS & CONFIG
// ═══════════════════════════════════════════════════════════
var T500M = 500000000, T1B = 1000000000, T3B = 3000000000;

var GROUPS = {
  1:{name:'Nhóm 1',icon:'📗',color:'var(--g1)',lt:'var(--g1-lt)',b:'var(--g1-b)',
     dt:'DT ≤ 500 triệu/năm',
     desc:'Không chịu thuế GTGT, không phải nộp thuế TNCN. Chỉ theo dõi doanh thu.',
     books:['S1a']},
  2:{name:'Nhóm 2',icon:'📘',color:'var(--g2)',lt:'var(--g2-lt)',b:'var(--g2-b)',
     dt:'DT > 500 triệu, PP1',
     desc:'Nộp GTGT & TNCN theo tỷ lệ % trên doanh thu (Phương pháp 1).',
     books:['S2a']},
  3:{name:'Nhóm 3',icon:'📒',color:'var(--g3)',lt:'var(--g3-lt)',b:'var(--g3-b)',
     dt:'DT > 500 triệu, PP2',
     desc:'Nộp GTGT theo tỷ lệ %. Nộp TNCN = (Doanh thu - Chi phí) × thuế suất.',
     books:['S2b','S2c','S2d','S2e']},
  4:{name:'Nhóm 4',icon:'📕',color:'var(--g4)',lt:'var(--g4-lt)',b:'var(--g4-b)',
     dt:'Thuế đặc thù',
     desc:'Bổ sung sổ S3a cho thuế TTĐB, tài nguyên, BVMT, sử dụng đất.',
     books:['S3a']}
};

var BOOK_META = {
  S1a:{name:'Sổ Doanh Thu',full:'Sổ doanh thu bán hàng hóa, dịch vụ',icon:'📄',color:'var(--g1)'},
  S2a:{name:'Sổ Doanh Thu',full:'Sổ doanh thu bán hàng hóa, dịch vụ',icon:'📄',color:'var(--g2)'},
  S2b:{name:'Sổ DT (GTGT)',full:'Sổ doanh thu bán hàng hóa, dịch vụ',icon:'📄',color:'var(--g2)'},
  S2c:{name:'Sổ DT-CP',full:'Sổ chi tiết doanh thu, chi phí',icon:'📊',color:'var(--g3)'},
  S2d:{name:'Sổ Hàng Hóa',full:'Sổ chi tiết vật liệu, dụng cụ, sản phẩm, hàng hóa',icon:'📦',color:'var(--g3)'},
  S2e:{name:'Sổ Tiền',full:'Sổ chi tiết tiền',icon:'💰',color:'var(--g1)'},
  S3a:{name:'Sổ Thuế Khác',full:'Sổ theo dõi nghĩa vụ thuế khác',icon:'🗂',color:'var(--g4)'}
};

var INDUSTRY_RATES = {
  goods:     {label:'Phân phối, hàng hóa',     vat:1,   pit:0.5,  isBDS:false},
  service:   {label:'Dịch vụ, XD không bao thầu',vat:5, pit:2,    isBDS:false},
  rental:    {label:'Cho thuê tài sản (trừ BĐS)',vat:5,  pit:2,    isBDS:false},
  bds:       {label:'Cho thuê bất động sản',     vat:5,  pit:5,    isBDS:true},
  production:{label:'Sản xuất, vận tải, XD bao thầu',vat:3,pit:1.5,isBDS:false},
  digital:   {label:'Nội dung số, quảng cáo số', vat:5,  pit:5,    isBDS:false},
  other:     {label:'Hoạt động KD khác',         vat:2,  pit:1,    isBDS:false}
};

var EXPENSE_TYPES = [
  {id:'a',label:'Chi phí nguyên liệu, vật liệu, hàng hóa'},
  {id:'b',label:'Chi phí tiền lương, bảo hiểm'},
  {id:'c',label:'Chi phí khấu hao TSCĐ'},
  {id:'d',label:'Chi phí dịch vụ mua ngoài (điện, nước, internet...)'},
  {id:'e',label:'Chi phí lãi vay'},
  {id:'f',label:'Chi phí khác phục vụ KD'}
];

var OTHER_TAX_TYPES = [
  {id:'ttdb',label:'Thuế tiêu thụ đặc biệt (TTĐB)'},
  {id:'tnguyen',label:'Thuế tài nguyên'},
  {id:'bvmt',label:'Thuế/Phí bảo vệ môi trường'},
  {id:'sdd',label:'Thuế sử dụng đất'}
];

