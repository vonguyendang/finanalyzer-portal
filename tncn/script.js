// Constants (2024 onwards)
const BASE_SALARY = 2340000;
const REGION_MIN_SALARY = {
  1: 4960000,
  2: 4410000,
  3: 3860000,
  4: 3450000
};

// State variables for deductions
let PERSONAL_DEDUCTION = 15500000;
let DEPENDENT_DEDUCTION = 6200000;

// Tab Switching
document.querySelectorAll('.tncn-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tncn-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tncn-tab-content').forEach(c => c.classList.remove('active'));
    
    tab.classList.add('active');
    document.getElementById(tab.dataset.target).classList.add('active');
  });
});

// Period Toggle Logic
const legalBasis2025 = `
  <li>Luật Thuế TNCN năm 2007</li>
  <li>Luật sửa đổi bổ sung Thuế TNCN năm 2012</li>
  <li>Luật sửa đổi Luật về Thuế năm 2014</li>
  <li>Thông tư 111/2013/TT-BTC</li>
  <li>Nghị định số 73/2024/NĐ-CP về mức lương cơ sở mới nhất</li>
  <li>Nghị định 74/2024/NĐ-CP về mức lương tối thiểu vùng</li>
  <li>Nghị Quyết số 954/ 2020/UBTVQH14 về điều chỉnh mức giảm trừ gia cảnh mới nhất</li>
`;

const legalBasis2026 = `
  <li>Luật Thuế TNCN năm 2025 số 109/2025/QH15</li>
  <li>Nghị định số 73/2024/NĐ-CP: Quy định về mức lương cơ sở từ ngày 01/07/2024</li>
  <li>Nghị định 293/2025/NĐ-CP: Quy định về mức lương tối thiểu vùng mới nhất có hiệu lực từ ngày 01/01/2026</li>
  <li>Nghị quyết 110/2025/UBTVQH15 về điều chỉnh mức giảm trừ gia cảnh mới nhất</li>
`;

function updatePeriodRules() {
  const selectedPeriod = document.querySelector('input[name="tax_period"]:checked').value;
  const legalList = document.getElementById('legal-basis-list');
  
  if (selectedPeriod === '2025') {
    PERSONAL_DEDUCTION = 11000000;
    DEPENDENT_DEDUCTION = 4400000;
    if (legalList) legalList.innerHTML = legalBasis2025;
  } else {
    // 2026
    PERSONAL_DEDUCTION = 15500000;
    DEPENDENT_DEDUCTION = 6200000;
    if (legalList) legalList.innerHTML = legalBasis2026;
  }
  
  triggerCalculations();
}

document.querySelectorAll('input[name="tax_period"]').forEach(radio => {
  radio.addEventListener('change', updatePeriodRules);
});

// Initialize rules on load
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  updatePeriodRules();
  
  document.querySelector('.tncn-layout').addEventListener('input', saveData);
  document.querySelector('.tncn-layout').addEventListener('change', saveData);
  document.querySelector('.tncn-period-toggle').addEventListener('change', saveData);
});

function saveData() {
  const data = {
    netIncome: document.getElementById('net-income').value,
    netDependents: document.getElementById('net-dependents').value,
    grossIncome: document.getElementById('gross-income').value,
    grossInsurance: document.getElementById('gross-insurance').value,
    grossRegion: document.getElementById('gross-region').value,
    grossDependents: document.getElementById('gross-dependents').value,
    refundDependents: document.getElementById('refund-dependents').value,
    refundMonths: document.getElementById('refund-months').value,
    period: document.querySelector('input[name="tax_period"]:checked').value
  };

  let grossExtra = [];
  document.querySelectorAll('.gross-extra-input').forEach(el => {
    grossExtra.push(el.value);
  });
  data.grossExtra = grossExtra;

  let refundSources = [];
  document.querySelectorAll('#refund-sources-container .source-block').forEach(block => {
    refundSources.push({
      gross: block.querySelector('.refund-gross-input').value,
      ins: block.querySelector('.refund-ins-input').value,
      deducted: block.querySelector('.refund-deducted-input').value
    });
  });
  data.refundSources = refundSources;

  localStorage.setItem('tncn_data', JSON.stringify(data));
}

function loadData() {
  const dataStr = localStorage.getItem('tncn_data');
  if (dataStr) {
    try {
      const data = JSON.parse(dataStr);
      if(data.netIncome) document.getElementById('net-income').value = data.netIncome;
      if(data.netDependents) document.getElementById('net-dependents').value = data.netDependents;
      if(data.grossIncome) document.getElementById('gross-income').value = data.grossIncome;
      if(data.grossInsurance) document.getElementById('gross-insurance').value = data.grossInsurance;
      if(data.grossRegion) document.getElementById('gross-region').value = data.grossRegion;
      if(data.grossDependents) document.getElementById('gross-dependents').value = data.grossDependents;
      if(data.refundDependents) document.getElementById('refund-dependents').value = data.refundDependents;
      if(data.refundMonths) document.getElementById('refund-months').value = data.refundMonths;
      if(data.period) {
        const r = document.querySelector(`input[name="tax_period"][value="${data.period}"]`);
        if(r) r.checked = true;
      }

      if(data.grossExtra && data.grossExtra.length > 0) {
        document.getElementById('gross-extra-sources').innerHTML = '';
        grossSourceCount = 0;
        data.grossExtra.forEach(val => {
          btnAddGrossSource.click();
          const inputs = document.querySelectorAll('.gross-extra-input');
          inputs[inputs.length - 1].value = val;
        });
      }

      if(data.refundSources && data.refundSources.length > 0) {
        document.getElementById('refund-sources-container').innerHTML = '';
        refundSourceCount = 0;
        data.refundSources.forEach(src => {
          btnAddRefundSource.click();
          const blocks = document.querySelectorAll('#refund-sources-container .source-block');
          const lastBlock = blocks[blocks.length - 1];
          lastBlock.querySelector('.refund-gross-input').value = src.gross;
          lastBlock.querySelector('.refund-ins-input').value = src.ins;
          lastBlock.querySelector('.refund-deducted-input').value = src.deducted;
        });
      }
    } catch(e) {}
  }
}

function clearData() {
  if(!confirm('Bạn có chắc chắn muốn xóa toàn bộ dữ liệu đã nhập?')) return;
  localStorage.removeItem('tncn_data');

  document.getElementById('net-income').value = '';
  document.getElementById('net-dependents').value = '';
  document.getElementById('gross-income').value = '';
  document.getElementById('gross-insurance').value = '';
  document.getElementById('gross-region').value = '1';
  document.getElementById('gross-dependents').value = '';
  document.getElementById('refund-dependents').value = '';
  document.getElementById('refund-months').value = '';

  document.getElementById('gross-extra-sources').innerHTML = '';
  grossSourceCount = 0;

  document.getElementById('refund-sources-container').innerHTML = '';
  refundSourceCount = 0;
  btnAddRefundSource.click(); // add 1 empty default source

  document.querySelector('input[name="tax_period"][value="2026"]').checked = true;
  updatePeriodRules();
  triggerCalculations();

  window.scrollTo({top: 0, behavior: 'smooth'});
}


// Format currency
function formatCurrency(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function parseCurrency(str) {
  return parseFloat(str.replace(/,/g, '')) || 0;
}

// Input formatting
function initNumberFormat(input) {
  input.removeEventListener('input', handleNumberFormat);
  input.addEventListener('input', handleNumberFormat);
}

function handleNumberFormat(e) {
  let val = parseCurrency(this.value);
  if (val === 0 && this.value.trim() === '') {
    this.value = '';
  } else {
    this.value = formatCurrency(val);
  }
  triggerCalculations();
}

document.querySelectorAll('.number-format').forEach(initNumberFormat);

// Extra sources logic for Cần nộp (GROSS)
let grossSourceCount = 0;
const btnAddGrossSource = document.getElementById('btn-add-gross-source');
const grossExtraSources = document.getElementById('gross-extra-sources');

if (btnAddGrossSource) {
  btnAddGrossSource.addEventListener('click', () => {
    grossSourceCount++;
    const div = document.createElement('div');
    div.className = 'source-block';
    div.innerHTML = `
      <div class="block-title-small">
        Nguồn thu nhập vãng lai ${grossSourceCount}
        <button class="remove-source-btn" onclick="this.parentElement.parentElement.remove(); triggerCalculations()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg> Xóa
        </button>
      </div>
      <div class="form-row">
        <div class="form-label">
          <span class="icon">💵</span> Thu nhập (GROSS) <span class="required">*</span> <span class="info-icon" title="Sẽ khấu trừ 10% nếu từ 2 triệu trở lên">ⓘ</span>
        </div>
        <div class="form-input">
          <input type="text" class="number-format gross-extra-input" placeholder="Nhập thu nhập vãng lai">
        </div>
      </div>
    `;
    grossExtraSources.appendChild(div);
    initNumberFormat(div.querySelector('.number-format'));
    triggerCalculations();
  });
}

// Extra sources logic for Hoàn thuế
let refundSourceCount = 1;
const btnAddRefundSource = document.getElementById('btn-add-refund-source');
const refundSourcesContainer = document.getElementById('refund-sources-container');

if (btnAddRefundSource) {
  btnAddRefundSource.addEventListener('click', () => {
    refundSourceCount++;
    const div = document.createElement('div');
    div.className = 'source-block';
    div.innerHTML = `
      <div class="block-title-small">
        Nơi có thu nhập ${refundSourceCount}
        <button class="remove-source-btn" onclick="this.parentElement.parentElement.remove(); triggerCalculations()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg> Xóa
        </button>
      </div>
      <div class="form-row">
        <div class="form-label">
          <span class="icon">💵</span> Tổng thu nhập (GROSS) năm <span class="required">*</span>
        </div>
        <div class="form-input">
          <input type="text" class="number-format refund-gross-input" placeholder="Nhập tổng thu nhập">
        </div>
      </div>
      <div class="form-row">
        <div class="form-label">
          <span class="icon">🛡️</span> Bảo hiểm bắt buộc đã đóng <span class="required">*</span>
        </div>
        <div class="form-input">
          <input type="text" class="number-format refund-ins-input" placeholder="Nhập tổng tiền bảo hiểm">
        </div>
      </div>
      <div class="form-row">
        <div class="form-label">
          <span class="icon">📉</span> Thuế TNCN đã bị khấu trừ <span class="required">*</span>
        </div>
        <div class="form-input">
          <input type="text" class="number-format refund-deducted-input" placeholder="Nhập số thuế đã khấu trừ">
        </div>
      </div>
    `;
    refundSourcesContainer.appendChild(div);
    div.querySelectorAll('.number-format').forEach(initNumberFormat);
    triggerCalculations();
  });
}

document.querySelectorAll('input[type="number"], select').forEach(input => {
  input.addEventListener('input', triggerCalculations);
});

function triggerCalculations() {
  calculateNetToGross();
  calculateGrossToNet();
  calculateRefund();
}

// Tính Thuế Lũy Tiến Từng Phần Chi Tiết (Tháng)
function calculateMonthlyTaxDetailed(taxableIncome) {
  let details = [];
  let remaining = taxableIncome;
  let totalTax = 0;

  let brackets = [
    { limit: 5000000, rate: 0.05 },
    { limit: 5000000, rate: 0.10 },
    { limit: 8000000, rate: 0.15 },
    { limit: 14000000, rate: 0.20 },
    { limit: 20000000, rate: 0.25 },
    { limit: 28000000, rate: 0.30 },
    { limit: Infinity, rate: 0.35 }
  ];

  for (let i = 0; i < brackets.length; i++) {
    if (remaining <= 0) break;
    let b = brackets[i];
    let amountInBracket = Math.min(remaining, b.limit);
    let taxInBracket = amountInBracket * b.rate;
    
    details.push({
      level: i + 1,
      rate: b.rate * 100,
      amount: amountInBracket,
      tax: taxInBracket
    });

    totalTax += taxInBracket;
    remaining -= amountInBracket;
  }

  return { totalTax, details };
}

// Tính Thuế Lũy Tiến Từng Phần (Năm)
function calculateAnnualTax(taxableIncome) {
  if (taxableIncome <= 0) return 0;
  if (taxableIncome <= 60000000) return taxableIncome * 0.05;
  if (taxableIncome <= 120000000) return taxableIncome * 0.1 - 3000000;
  if (taxableIncome <= 216000000) return taxableIncome * 0.15 - 9000000;
  if (taxableIncome <= 384000000) return taxableIncome * 0.2 - 19800000;
  if (taxableIncome <= 624000000) return taxableIncome * 0.25 - 39000000;
  if (taxableIncome <= 960000000) return taxableIncome * 0.3 - 70200000;
  return taxableIncome * 0.35 - 118200000;
}

// 1. Tính Thuế từ NET
function calculateNetToGross() {
  let netInput = document.getElementById('net-income').value;
  let deps = parseInt(document.getElementById('net-dependents').value) || 0;
  let resultEl = document.getElementById('net-result');
  let reportEl = document.getElementById('net-report');

  if (!netInput) {
    resultEl.innerHTML = 'Vui lòng nhập đầy đủ các ô bắt buộc';
    resultEl.className = 'form-input result-value';
    reportEl.style.display = 'none';
    return;
  }

  let net = parseCurrency(netInput);
  let deductions = PERSONAL_DEDUCTION + (deps * DEPENDENT_DEDUCTION);
  let convertedIncome = net - deductions; // Thu nhập quy đổi
  
  let taxableIncome = 0;
  if (convertedIncome > 0) {
    if (convertedIncome <= 4750000) taxableIncome = convertedIncome / 0.95;
    else if (convertedIncome <= 9250000) taxableIncome = (convertedIncome - 250000) / 0.9;
    else if (convertedIncome <= 16050000) taxableIncome = (convertedIncome - 750000) / 0.85;
    else if (convertedIncome <= 27250000) taxableIncome = (convertedIncome - 1650000) / 0.8;
    else if (convertedIncome <= 42250000) taxableIncome = (convertedIncome - 3250000) / 0.75;
    else if (convertedIncome <= 61850000) taxableIncome = (convertedIncome - 5850000) / 0.7;
    else taxableIncome = (convertedIncome - 9850000) / 0.65;
  }

  let taxData = calculateMonthlyTaxDetailed(taxableIncome);
  let tax = taxData.totalTax;
  
  // Gross = Net + Tax + Insurance (Giả định Net nhập vào là thu nhập trước thuế nhưng ĐÃ TRỪ BẢO HIỂM như giải thích ở sidebar)
  // Thực tế theo sidebar: Tổng thu nhập (NET) là "đã trừ đi khoản bảo hiểm bắt buộc". 
  // Vậy GROSS = NET + Tax + Insurance.
  // Nhưng để tính chính xác Insurance từ Net đã trừ bảo hiểm rất phức tạp (lặp ngược).
  // Công cụ thường dùng: Gross = Thu nhập quy đổi + Giảm trừ + Thuế + Bảo hiểm.
  // Ở đây do NET là "Thu nhập trước thuế", ta hiểu: IncomeBeforeTax = NET_input.
  // Lương Thực lãnh = IncomeBeforeTax - Tax.
  let takeHomePay = net - tax;
  let grossEquivalent = net + tax; // Tạm tính Gross chưa có bảo hiểm

  resultEl.innerHTML = formatCurrency(Math.round(tax)) + ' VNĐ';
  resultEl.className = 'form-input result-value highlight';
  
  renderReport(reportEl, {
    gross: grossEquivalent,
    net: takeHomePay,
    tax: tax,
    insurance: 0,
    bhxhCapApplied: false,
    bhtnCapApplied: false,
    personalDeduction: PERSONAL_DEDUCTION,
    dependentDeduction: deps * DEPENDENT_DEDUCTION,
    taxableIncome: taxableIncome,
    taxDetails: taxData.details,
    isFromNet: true,
    inputNet: net
  });
}

// 2. Tính Thuế từ GROSS
function calculateGrossToNet() {
  let grossInput = document.getElementById('gross-income').value;
  let insInput = document.getElementById('gross-insurance').value;
  let region = parseInt(document.getElementById('gross-region').value);
  let deps = parseInt(document.getElementById('gross-dependents').value) || 0;
  let resultEl = document.getElementById('gross-result');
  let reportEl = document.getElementById('gross-report');

  if (!grossInput || !insInput) {
    resultEl.innerHTML = 'Vui lòng nhập đầy đủ các ô bắt buộc';
    resultEl.className = 'form-input result-value';
    reportEl.style.display = 'none';
    return;
  }

  let gross = parseCurrency(grossInput);
  let insSalary = parseCurrency(insInput);
  
  let bhxh_bhyt_cap = BASE_SALARY * 20;
  let bhtn_cap = REGION_MIN_SALARY[region] * 20;
  
  let actualInsSalary_bhxh = Math.min(insSalary, bhxh_bhyt_cap);
  let actualInsSalary_bhtn = Math.min(insSalary, bhtn_cap);
  
  let bhxh_bhyt = actualInsSalary_bhxh * 0.095; // 8% BHXH + 1.5% BHYT
  let bhtn = actualInsSalary_bhtn * 0.01; // 1% BHTN
  let totalIns = bhxh_bhyt + bhtn;

  let deductions = PERSONAL_DEDUCTION + (deps * DEPENDENT_DEDUCTION);
  let taxableIncome = Math.max(0, gross - totalIns - deductions);
  
  let taxData = calculateMonthlyTaxDetailed(taxableIncome);
  let mainTax = taxData.totalTax;
  
  // Calculate extra taxes
  let extraTax = 0;
  let extraGross = 0;
  let extraIncomesDetails = [];
  document.querySelectorAll('.gross-extra-input').forEach((input) => {
    let val = parseCurrency(input.value);
    if (val > 0) {
      extraGross += val;
      let t = val >= 2000000 ? val * 0.1 : 0;
      extraTax += t;
      extraIncomesDetails.push({ amount: val, tax: t });
    }
  });

  let totalTax = mainTax + extraTax;
  let takeHomePay = gross - totalIns - mainTax + extraGross - extraTax;

  resultEl.innerHTML = formatCurrency(Math.round(totalTax)) + ' VNĐ';
  resultEl.className = 'form-input result-value highlight';

  renderReport(reportEl, {
    gross: gross,
    net: takeHomePay,
    tax: mainTax,
    totalTax: totalTax,
    extraGross: extraGross,
    extraTax: extraTax,
    extraIncomesDetails: extraIncomesDetails,
    insurance: totalIns,
    bhxhCapApplied: insSalary > bhxh_bhyt_cap,
    bhxhCapValue: bhxh_bhyt_cap,
    bhtnCapApplied: insSalary > bhtn_cap,
    bhtnCapValue: bhtn_cap,
    personalDeduction: PERSONAL_DEDUCTION,
    dependentDeduction: deps * DEPENDENT_DEDUCTION,
    taxableIncome: taxableIncome,
    taxDetails: taxData.details,
    isFromNet: false
  });
}

// 3. Tính Hoàn Thuế
function calculateRefund() {
  let deps = parseInt(document.getElementById('refund-dependents').value) || 0;
  let months = parseInt(document.getElementById('refund-months').value) || 12;
  let resultEl = document.getElementById('refund-result');

  let gross = 0;
  let ins = 0;
  let deducted = 0;
  let hasValidSource = false;
  
  document.querySelectorAll('#refund-sources-container .source-block').forEach(block => {
    let gStr = block.querySelector('.refund-gross-input').value;
    let iStr = block.querySelector('.refund-ins-input').value;
    let dStr = block.querySelector('.refund-deducted-input').value;
    
    if (gStr || iStr || dStr) {
      hasValidSource = true;
      gross += parseCurrency(gStr);
      ins += parseCurrency(iStr);
      deducted += parseCurrency(dStr);
    }
  });

  if (!hasValidSource) {
    resultEl.innerHTML = 'Vui lòng nhập thu nhập cho ít nhất 1 nguồn';
    resultEl.className = 'form-input result-value';
    document.getElementById('refund-report').style.display = 'none';
    return;
  }

  let deductions = (PERSONAL_DEDUCTION * 12) + (deps * months * DEPENDENT_DEDUCTION);
  let taxableIncome = gross - ins - deductions;
  
  let actualTax = taxableIncome > 0 ? calculateAnnualTax(taxableIncome) : 0;
  
  let refund = deducted - actualTax;
  
  let reportEl = document.getElementById('refund-report');

  if (refund >= 0) {
    resultEl.innerHTML = formatCurrency(Math.round(refund)) + ' VNĐ (Được hoàn)';
    resultEl.className = 'form-input result-value highlight';
  } else {
    resultEl.innerHTML = formatCurrency(Math.round(Math.abs(refund))) + ' VNĐ (Phải nộp thêm)';
    resultEl.className = 'form-input result-value warning';
  }
  
  // Render report
  renderRefundReport(reportEl, {
    gross, ins, deducted,
    personalDeduction: PERSONAL_DEDUCTION * 12,
    dependentDeduction: deps * months * DEPENDENT_DEDUCTION,
    taxableIncome, actualTax, refund
  });
}

function renderRefundReport(container, data) {
  let refundStatusText = data.refund >= 0 ? "SỐ TIỀN ĐƯỢC HOÀN LẠI" : "SỐ TIỀN PHẢI NỘP THÊM";
  let refundColor = data.refund >= 0 ? "var(--green)" : "#ff4757";

  let html = `
    <div class="table-title">Diễn giải dòng tiền (Theo năm)</div>
    <div class="tax-breakdown-table">
      <div class="b-row b-header">
        <div class="b-col-name">Diễn giải thu nhập & giảm trừ</div>
        <div class="b-col-val">Kết quả tính toán</div>
      </div>
      <div class="b-row b-main">
        <div class="b-col-name">1. Tổng thu nhập (GROSS) năm</div>
        <div class="b-col-val" style="color: var(--blue);">${formatCurrency(Math.round(data.gross))} VNĐ</div>
      </div>
      <div class="b-row">
        <div class="b-col-name">- Tổng tiền bảo hiểm bắt buộc đã đóng</div>
        <div class="b-col-val">-${formatCurrency(Math.round(data.ins))} VNĐ</div>
      </div>
      <div class="b-row">
        <div class="b-col-name">- Giảm trừ bản thân (${formatCurrency(data.personalDeduction/12)} x 12 tháng)</div>
        <div class="b-col-val">-${formatCurrency(data.personalDeduction)} VNĐ</div>
      </div>
      <div class="b-row">
        <div class="b-col-name">- Giảm trừ người phụ thuộc</div>
        <div class="b-col-val">-${formatCurrency(data.dependentDeduction)} VNĐ</div>
      </div>
      <div class="b-row b-main">
        <div class="b-col-name">2. Tổng Thu nhập tính thuế năm</div>
        <div class="b-col-val"><b>${formatCurrency(Math.round(Math.max(0, data.taxableIncome)))} VNĐ</b></div>
      </div>
      <div class="b-row">
        <div class="b-col-name">- Số thuế TNCN thực tế phải nộp năm</div>
        <div class="b-col-val" style="color: #ff4757;">${formatCurrency(Math.round(data.actualTax))} VNĐ</div>
      </div>
      <div class="b-row">
        <div class="b-col-name">- Số thuế TNCN đã bị khấu trừ trong năm</div>
        <div class="b-col-val" style="color: var(--gold);">${formatCurrency(Math.round(data.deducted))} VNĐ</div>
      </div>
      <div class="b-row b-header" style="margin-top: 10px; border-top: 2px solid var(--border);">
        <div class="b-col-name">3. ${refundStatusText}</div>
        <div class="b-col-val" style="color: ${refundColor}; font-size: 16px;">${formatCurrency(Math.round(Math.abs(data.refund)))} VNĐ</div>
      </div>
    </div>
  `;
  container.innerHTML = html;
  container.style.display = 'block';
}

// --- RENDER REPORT ---
function renderReport(container, data) {
  let html = '';

  // Smart Alerts
  if (data.bhxhCapApplied) {
    html += `
      <div class="smart-alert">
        <span class="icon">💡</span>
        <span>Mức lương đóng bảo hiểm của bạn vượt mức trần quy định. Công cụ đã tự động áp mức trần đóng BHXH/BHYT là <b>${formatCurrency(data.bhxhCapValue)}đ</b>.</span>
      </div>`;
  }

  // Tiền tính % Progress Bar
  let totalGross = data.gross + (data.extraGross || 0);
  let totalTax = data.totalTax !== undefined ? data.totalTax : data.tax;
  let grossForProgress = totalGross > 0 ? totalGross : 1; // tránh chia 0
  let netPct = (data.net / grossForProgress) * 100;
  let taxPct = (totalTax / grossForProgress) * 100;
  let insPct = (data.insurance / grossForProgress) * 100;

  html += `
    <div class="table-title">Biểu đồ phân bổ lương (GROSS)</div>
    <div class="tax-progress-wrapper">
      <div class="tax-progress-bar">
        <div class="tax-progress-segment segment-net" style="width: ${netPct}%" title="Thực lãnh: ${netPct.toFixed(1)}%"></div>
        <div class="tax-progress-segment segment-ins" style="width: ${insPct}%" title="Bảo hiểm: ${insPct.toFixed(1)}%"></div>
        <div class="tax-progress-segment segment-tax" style="width: ${taxPct}%" title="Thuế TNCN: ${taxPct.toFixed(1)}%"></div>
      </div>
      <div class="tax-progress-legend">
        <div class="legend-item"><div class="legend-color segment-net"></div> Thực lãnh (${netPct.toFixed(1)}%)</div>
        <div class="legend-item"><div class="legend-color segment-ins"></div> Bảo hiểm (${insPct.toFixed(1)}%)</div>
        <div class="legend-item"><div class="legend-color segment-tax"></div> Thuế (${taxPct.toFixed(1)}%)</div>
      </div>
    </div>
  `;

  // Bảng diễn giải dòng tiền
  html += `
    <div class="table-title">Diễn giải thu nhập & giảm trừ</div>
    <table class="tax-breakdown-table">
      ${data.isFromNet ? `
        <tr><td>Thu nhập trước thuế (Lương NET đã nhập)</td><td class="amount">${formatCurrency(Math.round(data.inputNet))}</td></tr>
      ` : `
        <tr><td>Lương GROSS (Công ty chính)</td><td class="amount">${formatCurrency(Math.round(data.gross))}</td></tr>
        ${data.extraGross ? `<tr><td>Tổng thu nhập vãng lai</td><td class="amount">${formatCurrency(Math.round(data.extraGross))}</td></tr>` : ''}
        <tr><td>Bảo hiểm bắt buộc (BHXH, BHYT, BHTN)</td><td class="amount">-${formatCurrency(Math.round(data.insurance))}</td></tr>
      `}
      <tr><td>Giảm trừ bản thân</td><td class="amount">-${formatCurrency(data.personalDeduction)}</td></tr>
      <tr><td>Giảm trừ người phụ thuộc</td><td class="amount">-${formatCurrency(data.dependentDeduction)}</td></tr>
      <tr><td><b>Thu nhập tính thuế</b></td><td class="amount"><b>${formatCurrency(Math.round(data.taxableIncome))}</b></td></tr>
    </table>
  `;

  // Bảng phân tích thuế từng bậc
  if (data.taxDetails && data.taxDetails.length > 0) {
    html += `
      <div class="table-title mt-24">Chi tiết thuế TNCN theo từng bậc (Nguồn chính)</div>
      <table class="tax-breakdown-table">
        <tr><th>Bậc thuế</th><th>Thu nhập tính thuế</th><th>Mức thuế</th></tr>
        ${data.taxDetails.map(d => `
          <tr>
            <td>Bậc ${d.level} (${d.rate}%)</td>
            <td class="amount">${formatCurrency(Math.round(d.amount))}</td>
            <td class="amount">${formatCurrency(Math.round(d.tax))}</td>
          </tr>
        `).join('')}
        <tr>
          <td><b>Thuế TNCN nguồn chính</b></td>
          <td></td>
          <td class="amount"><b>${formatCurrency(Math.round(data.tax))}</b></td>
        </tr>
      </table>
    `;
  }

  // Bảng thuế vãng lai
  if (data.extraIncomesDetails && data.extraIncomesDetails.length > 0) {
    html += `
      <div class="table-title mt-24">Chi tiết thuế các nguồn vãng lai (Khấu trừ 10%)</div>
      <table class="tax-breakdown-table">
        <tr><th>Nguồn vãng lai</th><th>Thu nhập GROSS</th><th>Thuế khấu trừ (10%)</th></tr>
        ${data.extraIncomesDetails.map((d, idx) => `
          <tr>
            <td>Nguồn ${idx + 1}</td>
            <td class="amount">${formatCurrency(Math.round(d.amount))}</td>
            <td class="amount">${formatCurrency(Math.round(d.tax))}</td>
          </tr>
        `).join('')}
        <tr>
          <td><b>Tổng thuế vãng lai</b></td>
          <td></td>
          <td class="amount"><b>${formatCurrency(Math.round(data.extraTax))}</b></td>
        </tr>
      </table>
    `;
  }

  // Tổng hợp thuế
  if (totalTax > 0) {
    html += `
      <table class="tax-breakdown-table" style="margin-top: 16px;">
        <tr>
          <td style="font-size: 14px; color: #ff4757;"><b>TỔNG THUẾ TNCN PHẢI NỘP</b></td>
          <td class="amount" style="font-size: 16px; color: #ff4757;"><b>${formatCurrency(Math.round(totalTax))}</b></td>
        </tr>
      </table>
    `;
  }

  // Thông báo NET final
  if (!data.isFromNet) {
    html += `
      <div style="text-align: right; margin-top: 16px; font-size: 16px; font-weight: 700;">
        Lương NET (Thực lãnh): <span style="color: var(--green);">${formatCurrency(Math.round(data.net))} VNĐ</span>
      </div>
    `;
  } else {
    html += `
      <div style="text-align: right; margin-top: 16px; font-size: 16px; font-weight: 700;">
        Lương NET (Thực lãnh): <span style="color: var(--green);">${formatCurrency(Math.round(data.net))} VNĐ</span>
        <div style="font-size: 12px; color: var(--text3); font-weight: normal; margin-top: 4px;">* Thực lãnh = Thu nhập trước thuế - Thuế TNCN</div>
      </div>
    `;
  }

  container.innerHTML = html;
  container.style.display = 'block';
}
