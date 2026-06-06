/* ═══════════════════════════════════════════════════
   DATA EXTRACTION FROM XML
═══════════════════════════════════════════════════ */
function extractData(doc, isHtml){
  // FIX: getElementsByTagName is namespace-agnostic and works in both xml & html mode
  // querySelector fails on namespaced XML; getElementsByTagName always works
  const getByTag = (root, tag) => {
    // HTML mode → tags are lowercase
    const t = isHtml ? tag.toLowerCase() : tag;
    const els = root.getElementsByTagName(t);
    return els.length > 0 ? els[0] : null;
  };

  const getNum = (root, tag) => {
    const el = getByTag(root, tag);
    return el ? (parseFloat(el.textContent) || 0) : 0;
  };
  const getStr = (root, tag) => {
    const el = getByTag(root, tag);
    return el ? el.textContent.trim() : '';
  };

  // Locate section containers
  const findSection = (name) => {
    const t = isHtml ? name.toLowerCase() : name;
    const els = doc.getElementsByTagName(t);
    return els.length > 0 ? els[0] : null;
  };

  // Company info
  const info = {
    name:       getStr(doc, 'tenNNT'),
    mst:        getStr(doc, 'mst'),
    addr:       getStr(doc, 'dchiNNT'),
    province:   getStr(doc, 'tenTinhNNT'),
    cqt:        getStr(doc, 'tenCQTNoiNop'),
    period:     getStr(doc, 'kyKKhai'),
    fromDate:   getStr(doc, 'kyKKhaiTuNgay'),
    toDate:     getStr(doc, 'kyKKhaiDenNgay'),
    ngayLap:    getStr(doc, 'ngayLapTKhai'),
    nguoiKy:    getStr(doc, 'nguoiKy'),
    bctcDaKiemToan: getStr(doc, 'bctcDaKiemToan'),
  };

  // Helper: extract numbered value from a section (e.g. SoCuoiNam > ct110)
  // Uses index to pick the correct occurrence when same tag appears in multiple sections
  const CTieuTKhaiChinh = findSection('CTieuTKhaiChinh');
  const SoCuoiNam = CTieuTKhaiChinh ? findSection('SoCuoiNam') || getByTag(CTieuTKhaiChinh,'SoCuoiNam') : findSection('SoCuoiNam');
  const SoDauNam  = CTieuTKhaiChinh ? findSection('SoDauNam')  || getByTag(CTieuTKhaiChinh,'SoDauNam')  : findSection('SoDauNam');

  const getSCN = tag => SoCuoiNam ? getNum(SoCuoiNam, tag) : 0;
  const getSDN = tag => SoDauNam  ? getNum(SoDauNam,  tag) : 0;

  // PL section – find PL_KQHDSXKD, then NamNay / NamTruoc inside it
  const plSection = findSection('PL_KQHDSXKD');
  // NamNay/NamTruoc can appear in multiple sections; get from PL scope
  const getPLNamNay  = tag => { if(!plSection) return 0; const nn = getByTag(plSection,'NamNay');   return nn ? getNum(nn,tag) : 0; };
  const getPLNamTruoc= tag => { if(!plSection) return 0; const nt = getByTag(plSection,'NamTruoc'); return nt ? getNum(nt,tag) : 0; };

  // CF section
  const cfSection = findSection('PL_LCTTTT');
  const getCFNamNay  = tag => { if(!cfSection) return 0; const nn = getByTag(cfSection,'NamNay');   return nn ? getNum(nn,tag) : 0; };
  const getCFNamTruoc= tag => { if(!cfSection) return 0; const nt = getByTag(cfSection,'NamTruoc'); return nt ? getNum(nt,tag) : 0; };

  // ── Balance Sheet ──
  const bs = {
    cy:{
      ct110:getSCN('ct110'), ct120:getSCN('ct120'), ct121:getSCN('ct121'),
      ct122:getSCN('ct122'), ct123:getSCN('ct123'), ct124:getSCN('ct124'),
      ct130:getSCN('ct130'), ct131:getSCN('ct131'), ct132:getSCN('ct132'),
      ct133:getSCN('ct133'), ct134:getSCN('ct134'), ct135:getSCN('ct135'),
      ct136:getSCN('ct136'), ct140:getSCN('ct140'), ct141:getSCN('ct141'),
      ct142:getSCN('ct142'), ct150:getSCN('ct150'), ct151:getSCN('ct151'),
      ct152:getSCN('ct152'), ct160:getSCN('ct160'), ct161:getSCN('ct161'),
      ct162:getSCN('ct162'), ct170:getSCN('ct170'), ct180:getSCN('ct180'),
      ct181:getSCN('ct181'), ct182:getSCN('ct182'), ct200:getSCN('ct200'),
      ct300:getSCN('ct300'), ct311:getSCN('ct311'), ct312:getSCN('ct312'),
      ct313:getSCN('ct313'), ct314:getSCN('ct314'), ct315:getSCN('ct315'),
      ct316:getSCN('ct316'), ct317:getSCN('ct317'), ct318:getSCN('ct318'),
      ct319:getSCN('ct319'), ct320:getSCN('ct320'), ct400:getSCN('ct400'),
      ct411:getSCN('ct411'), ct412:getSCN('ct412'), ct413:getSCN('ct413'),
      ct414:getSCN('ct414'), ct415:getSCN('ct415'), ct416:getSCN('ct416'),
      ct417:getSCN('ct417'), ct500:getSCN('ct500'),
    },
    py:{
      ct110:getSDN('ct110'), ct120:getSDN('ct120'), ct121:getSDN('ct121'),
      ct130:getSDN('ct130'), ct131:getSDN('ct131'), ct132:getSDN('ct132'),
      ct133:getSDN('ct133'), ct134:getSDN('ct134'), ct140:getSDN('ct140'),
      ct141:getSDN('ct141'), ct142:getSDN('ct142'), ct150:getSDN('ct150'),
      ct151:getSDN('ct151'), ct152:getSDN('ct152'), ct160:getSDN('ct160'),
      ct170:getSDN('ct170'), ct180:getSDN('ct180'), ct181:getSDN('ct181'),
      ct182:getSDN('ct182'), ct200:getSDN('ct200'), ct300:getSDN('ct300'),
      ct311:getSDN('ct311'), ct312:getSDN('ct312'), ct313:getSDN('ct313'),
      ct314:getSDN('ct314'), ct315:getSDN('ct315'), ct316:getSDN('ct316'),
      ct317:getSDN('ct317'), ct318:getSDN('ct318'), ct319:getSDN('ct319'),
      ct320:getSDN('ct320'), ct400:getSDN('ct400'), ct411:getSDN('ct411'),
      ct412:getSDN('ct412'), ct413:getSDN('ct413'), ct414:getSDN('ct414'),
      ct415:getSDN('ct415'), ct416:getSDN('ct416'), ct417:getSDN('ct417'),
      ct500:getSDN('ct500'),
    }
  };

  // ── Income Statement ──
  const pl = {
    cy:{
      ct01:getPLNamNay('ct01'), ct02:getPLNamNay('ct02'), ct10:getPLNamNay('ct10'),
      ct11:getPLNamNay('ct11'), ct20:getPLNamNay('ct20'), ct21:getPLNamNay('ct21'),
      ct22:getPLNamNay('ct22'), ct23:getPLNamNay('ct23'), ct24:getPLNamNay('ct24'),
      ct30:getPLNamNay('ct30'), ct31:getPLNamNay('ct31'), ct32:getPLNamNay('ct32'),
      ct40:getPLNamNay('ct40'), ct50:getPLNamNay('ct50'), ct51:getPLNamNay('ct51'),
      ct60:getPLNamNay('ct60'),
    },
    py:{
      ct01:getPLNamTruoc('ct01'), ct02:getPLNamTruoc('ct02'), ct10:getPLNamTruoc('ct10'),
      ct11:getPLNamTruoc('ct11'), ct20:getPLNamTruoc('ct20'), ct21:getPLNamTruoc('ct21'),
      ct22:getPLNamTruoc('ct22'), ct23:getPLNamTruoc('ct23'), ct24:getPLNamTruoc('ct24'),
      ct30:getPLNamTruoc('ct30'), ct31:getPLNamTruoc('ct31'), ct32:getPLNamTruoc('ct32'),
      ct40:getPLNamTruoc('ct40'), ct50:getPLNamTruoc('ct50'), ct51:getPLNamTruoc('ct51'),
      ct60:getPLNamTruoc('ct60'),
    }
  };

  // ── Cash Flow ──
  const cf = {
    cy:{
      ct01:getCFNamNay('ct01'), ct02:getCFNamNay('ct02'), ct03:getCFNamNay('ct03'),
      ct04:getCFNamNay('ct04'), ct05:getCFNamNay('ct05'), ct06:getCFNamNay('ct06'),
      ct07:getCFNamNay('ct07'), ct20:getCFNamNay('ct20'), ct21:getCFNamNay('ct21'),
      ct22:getCFNamNay('ct22'), ct23:getCFNamNay('ct23'), ct24:getCFNamNay('ct24'),
      ct25:getCFNamNay('ct25'), ct30:getCFNamNay('ct30'), ct31:getCFNamNay('ct31'),
      ct32:getCFNamNay('ct32'), ct33:getCFNamNay('ct33'), ct34:getCFNamNay('ct34'),
      ct35:getCFNamNay('ct35'), ct40:getCFNamNay('ct40'), ct50:getCFNamNay('ct50'),
      ct60:getCFNamNay('ct60'), ct61:getCFNamNay('ct61'), ct70:getCFNamNay('ct70'),
    },
    py:{
      ct01:getCFNamTruoc('ct01'), ct02:getCFNamTruoc('ct02'), ct03:getCFNamTruoc('ct03'),
      ct04:getCFNamTruoc('ct04'), ct05:getCFNamTruoc('ct05'), ct20:getCFNamTruoc('ct20'),
      ct30:getCFNamTruoc('ct30'), ct33:getCFNamTruoc('ct33'), ct34:getCFNamTruoc('ct34'),
      ct40:getCFNamTruoc('ct40'), ct50:getCFNamTruoc('ct50'), ct60:getCFNamTruoc('ct60'),
      ct70:getCFNamTruoc('ct70'),
    }
  };

  const yearLabel = info.period || '–';
  const prevYear  = info.period ? (parseInt(info.period) - 1).toString() : '–';

  // Validation: Đảm bảo file có chứa MST hoặc Cân đối kế toán
  if (!info.mst && bs.cy.ct200 === 0 && pl.cy.ct10 === 0) {
    throw new Error('File XML không chứa số liệu BCTC B01A - TT133.');
  }

  return { info, bs, pl, cf, yearLabel, prevYear };
}

