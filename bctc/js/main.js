/* ═══════════════════════════════════════════════════
   FILE UPLOAD
═══════════════════════════════════════════════════ */
const dz = document.getElementById('dropZone');
const fi = document.getElementById('fileInput');

// FIX: Button click must NOT bubble up to dropZone click listener
document.getElementById('pickFileBtn').addEventListener('click', function(e){
  e.stopPropagation();
  fi.click();
});

// FIX: dropZone click only fires when user clicks the zone itself, not child buttons
dz.addEventListener('click', function(e){
  if(e.target === dz || e.target.classList.contains('drop-icon') ||
     e.target.classList.contains('drop-title') || e.target.classList.contains('drop-sub')){
    fi.click();
  }
});

dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('drag-over'); });
dz.addEventListener('dragleave', () => dz.classList.remove('drag-over'));
dz.addEventListener('drop', e => {
  e.preventDefault(); dz.classList.remove('drag-over');
  const f = e.dataTransfer.files[0];
  if(f) processFile(f);
});

// FIX: Reset input value so same file can be re-selected
fi.addEventListener('change', () => { if(fi.files[0]) processFile(fi.files[0]); });

async function processFile(file) {
  // Validate file type
  if(!file.name.toLowerCase().endsWith('.xml') && file.type && !file.type.includes('xml')){
    showError('Vui lòng chọn file XML từ phần mềm HTKK (*.xml)');
    return;
  }

  showScreen('loading');
  await sleep(200);

  let text;
  try {
    text = await file.text();
  } catch(e) {
    showError('Không đọc được nội dung file: ' + e.message);
    return;
  }

  await animateSteps();

  try {
    // ── FIX CORE: Strip XML namespace declarations before parsing ──
    // DOMParser with text/xml keeps namespace → querySelector cannot find tags
    // Removing xmlns attributes makes all selectors work correctly
    let cleanXml = text
      .replace(/\s+xmlns(?::\w+)?\s*=\s*["'][^"']*["']/g, '') // remove all xmlns=... declarations
      .replace(/(<\/?)\w+:/g, '$1');                            // strip namespace prefixes e.g. <ns:tag> → <tag>

    const parser = new DOMParser();
    const doc = parser.parseFromString(cleanXml, 'text/xml');

    // Check for XML parse errors
    const parseErr = doc.querySelector('parsererror');
    if(parseErr){
      // Try fallback: parse as HTML (tags become lowercase)
      const docHtml = parser.parseFromString(cleanXml, 'text/html');
      const D = extractData(docHtml, true);
      _currentData = D;
      renderDashboard(D);
      showScreen('dashboard');
      setTimeout(() => fetchAI(D), 800);
      return;
    }

    // Check if this is a valid B01A file
    const hasBCTC = doc.querySelector('SoCuoiNam') || doc.querySelector('CTieuTKhaiChinh');
    if(!hasBCTC){
      showError('File XML không hợp lệ hoặc không phải mẫu B01A-TT133. Vui lòng kiểm tra lại.');
      return;
    }

    const D = extractData(doc, false);
    _currentData = D; // save for export
    renderDashboard(D);
    showScreen('dashboard');
    setTimeout(() => fetchAI(D), 800);

  } catch(e) {
    showError('Lỗi xử lý dữ liệu: ' + e.message + '\n\nVui lòng kiểm tra file XML và thử lại.');
  }
}

function showError(msg){
  fi.value = ''; // reset so user can re-select
  showScreen('upload');
  // Show error toast
  const toast = document.createElement('div');
  toast.style.cssText = `
    position:fixed;bottom:32px;left:50%;transform:translateX(-50%);
    background:#1c0a0a;border:1px solid #ff4d4d;color:#ff8080;
    padding:14px 24px;border-radius:10px;font-size:12px;font-weight:600;
    z-index:9999;max-width:480px;text-align:center;line-height:1.5;
    box-shadow:0 8px 32px rgba(255,77,77,0.3);
  `;
  toast.innerHTML = '⚠ ' + msg.replace(/\n/g,'<br>');
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 6000);
}

function sleep(ms){return new Promise(r=>setTimeout(r,ms))}

async function animateSteps(){
  const ids=['step1','step2','step3','step4','step5'];
  for(const id of ids){
    const el=document.getElementById(id);
    el.classList.add('done');
    el.querySelector('.licon').textContent='✓';
    await sleep(350);
  }
  await sleep(200);
}

function showScreen(name){
  document.getElementById('uploadScreen').style.display = name==='upload'?'flex':'none';
  document.getElementById('loadingScreen').style.display = name==='loading'?'flex':'none';
  document.getElementById('dashboard').style.display = name==='dashboard'?'block':'none';
  if(name==='loading'){
    // reset steps
    ['step1','step2','step3','step4','step5'].forEach(id=>{
      const el=document.getElementById(id);
      el.classList.remove('done');
      el.querySelector('.licon').textContent='⟳';
    });
  }
}

function resetApp(){
  fi.value = '';
  _currentData = null;
  // Reset all chart instances
  Object.values(charts).forEach(c => { try{ c.destroy(); }catch(e){} });
  charts = {};
  // Reset AI panel
  document.getElementById('aiContent').innerHTML =
    `<div class="ai-loading"><span>Đang phân tích số liệu</span><div class="ai-dots"><span>.</span><span>.</span><span>.</span></div></div>`;
  // Reset alert
  document.getElementById('alertBanner').innerHTML = '';
  // Switch back to first tab
  document.querySelectorAll('.nav-tab').forEach((t,i) => t.classList.toggle('active', i===0));
  document.querySelectorAll('.panel-section').forEach((p,i) => p.classList.toggle('active', i===0));
  showScreen('upload');
  
  // Reset chat history
  if(typeof aiChatHistory !== 'undefined') aiChatHistory = [];
  const chatBox = document.getElementById('aiChatBox');
  if(chatBox) chatBox.style.display = 'none';
}

function processManualEntry() {
  const getVal = (id) => parseFloat(document.getElementById(id)?.value) * 1e6 || 0;
  
  const d = new Date();
  const year = d.getFullYear();
  
  // Use Proxy to safely return 0 for any unspecified metric
  const zeroProxy = (target) => new Proxy(target, { get: (obj, prop) => prop in obj ? obj[prop] : 0 });

  const D = {
    info: {
      name: "Dữ liệu Nhập Tay",
      mst: "0000000000",
      addr: "Không xác định",
      province: "",
      cqt: "Không xác định",
      fromDate: "01/01",
      toDate: "31/12",
      ngayLap: `${d.getDate()}/${d.getMonth()+1}/${year}`,
      nguoiKy: "Nhập thủ công",
      bctcDaKiemToan: "0"
    },
    yearLabel: year.toString(),
    prevYear: (year - 1).toString(),
    bs: {
      cy: zeroProxy({
        ct110: getVal('m_cy_110'), ct130: getVal('m_cy_130'), ct140: getVal('m_cy_140'),
        ct200: getVal('m_cy_200'), ct300: getVal('m_cy_300'), ct312: getVal('m_cy_312'),
        ct400: getVal('m_cy_400'), ct417: getVal('m_cy_417')
      }),
      py: zeroProxy({
        ct110: getVal('m_py_110'), ct130: getVal('m_py_130'), ct140: getVal('m_py_140'),
        ct200: getVal('m_py_200'), ct300: getVal('m_py_300'), ct312: getVal('m_py_312'),
        ct400: getVal('m_py_400'), ct417: getVal('m_py_417')
      })
    },
    pl: {
      cy: zeroProxy({
        ct10: getVal('m_cy_l10'), ct11: getVal('m_cy_l11'), ct20: getVal('m_cy_l20'),
        ct24: getVal('m_cy_l24'), ct30: getVal('m_cy_l30'), ct50: getVal('m_cy_l50'),
        ct60: getVal('m_cy_l60')
      }),
      py: zeroProxy({
        ct10: getVal('m_py_l10'), ct11: getVal('m_py_l11'), ct20: getVal('m_py_l20'),
        ct24: getVal('m_py_l24'), ct30: getVal('m_py_l30'), ct50: getVal('m_py_l50'),
        ct60: getVal('m_py_l60')
      })
    },
    cf: {
      cy: zeroProxy({ ct20: getVal('m_cy_c20'), ct60: getVal('m_py_110'), ct70: getVal('m_cy_110') }),
      py: zeroProxy({ ct20: getVal('m_py_c20'), ct60: 0, ct70: getVal('m_py_110') })
    }
  };
  
  _currentData = D;
  document.getElementById('manualEntryModal').style.display = 'none';
  showScreen('dashboard');
  
  Object.values(charts).forEach(c => { try{ c.destroy(); }catch(e){} });
  charts = {};
  
  renderDashboard(D);
  fetchAI(D);
}

document.addEventListener('DOMContentLoaded', () => {
  loadManualData();
  const form = document.getElementById('manualEntryForm');
  if(form) {
    form.addEventListener('input', saveManualData);
    form.addEventListener('change', saveManualData);
  }
});

function saveManualData() {
  const inputs = document.querySelectorAll('#manualEntryForm input[type="number"]');
  const data = {};
  inputs.forEach(inp => {
    data[inp.id] = inp.value;
  });
  localStorage.setItem('bctc_manual_data', JSON.stringify(data));
}

function loadManualData() {
  const dataStr = localStorage.getItem('bctc_manual_data');
  if (dataStr) {
    try {
      const data = JSON.parse(dataStr);
      Object.keys(data).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = data[id];
      });
    } catch(e) {}
  }
}

function clearManualData() {
  if(!confirm('Bạn có chắc chắn muốn xóa toàn bộ dữ liệu đã nhập?')) return;
  localStorage.removeItem('bctc_manual_data');
  const inputs = document.querySelectorAll('#manualEntryForm input[type="number"]');
  inputs.forEach(inp => inp.value = '');
}
