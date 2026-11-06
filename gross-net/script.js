// --- Dữ liệu các mốc quy định pháp lý ---
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  const rules = getCurrentRules();
  const list = document.getElementById('dynamic-legal-list');
  if(list) list.innerHTML = rules.LEGAL.map(item => `<li>${item}</li>`).join('');
  const inputs = document.querySelectorAll('input, select');
  inputs.forEach(el => {
    el.addEventListener('input', saveData);
    el.addEventListener('change', saveData);
  });
});

function saveData() {
  const data = {
    period: document.querySelector('input[name="rule-period"]:checked').value,
    income: document.getElementById('gn-income').value,
    insType: document.querySelector('input[name="ins-type"]:checked').value,
    insOther: document.getElementById('gn-insurance').value,
    region: document.querySelector('input[name="region"]:checked').value,
    dependents: document.getElementById('gn-dependents').value
  };
  localStorage.setItem('gross_net_data', JSON.stringify(data));
}

function loadData() {
  const dataStr = localStorage.getItem('gross_net_data');
  if (dataStr) {
    try {
      const data = JSON.parse(dataStr);
      if(data.period) {
        document.querySelector(`input[name="rule-period"][value="${data.period}"]`).checked = true;
      }
      if(data.income) document.getElementById('gn-income').value = data.income;
      if(data.insType) {
        document.querySelector(`input[name="ins-type"][value="${data.insType}"]`).checked = true;
        if(data.insType === 'other') {
          const insInput = document.getElementById('gn-insurance');
          insInput.disabled = false;
        }
      }
      if(data.insOther) document.getElementById('gn-insurance').value = data.insOther;
      if(data.region) document.querySelector(`input[name="region"][value="${data.region}"]`).checked = true;
      if(data.dependents) document.getElementById('gn-dependents').value = data.dependents;
      
      const rules = getCurrentRules();
      const list = document.getElementById('dynamic-legal-list');
      if(list) list.innerHTML = rules.LEGAL.map(item => `<li>${item}</li>`).join('');
    } catch(e) {}
  }
}

function clearData() {
  if(!confirm('Bạn có chắc chắn muốn xóa toàn bộ dữ liệu đã nhập?')) return;
  localStorage.removeItem('gross_net_data');
  
  document.getElementById('gn-income').value = '';
  document.getElementById('gn-insurance').value = '';
  document.getElementById('gn-insurance').disabled = true;
  document.getElementById('gn-dependents').value = '';
  
  const defaultPeriod = document.querySelector('input[name="rule-period"][value="2026_2"]') || document.querySelector('input[name="rule-period"][value="2026"]');
  if (defaultPeriod) defaultPeriod.checked = true;
  document.querySelector('input[name="ins-type"][value="official"]').checked = true;
  document.querySelector('input[name="region"][value="1"]').checked = true;
  
  document.getElementById('gn-report-container').style.display = 'none';
  
  const rules = getCurrentRules();
  const list = document.getElementById('dynamic-legal-list');
  if(list) list.innerHTML = rules.LEGAL.map(item => `<li>${item}</li>`).join('');
  
  window.scrollTo({top: 0, behavior: 'smooth'});
}

const rulesDB = {
  "2026_2": {
    label: "Từ 01/7/2026",
    BASE_SALARY: 2530000, // Mức tham chiếu mới theo Nghị định 161/2026/NĐ-CP
    MIN_WAGE: { "1": 5310000, "2": 4730000, "3": 4140000, "4": 3700000 },
    PERSONAL_DEDUCTION: 15500000,
    DEPENDENT_DEDUCTION: 6200000,
    taxBrackets: [
      { limit: 10000000, rate: 0.05 },
      { limit: 30000000, rate: 0.10 },
      { limit: 60000000, rate: 0.20 },
      { limit: 100000000, rate: 0.30 },
      { limit: Infinity, rate: 0.35 }
    ],
    LEGAL: [
      "- Áp dụng Mức tham chiếu mới 2.530.000 đồng/tháng theo Nghị định số 161/2026/NĐ-CP (hiệu lực từ 01/07/2026), trần đóng BHXH, BHYT tối đa là 50.600.000 đồng/tháng.",
      "- Áp dụng mức lương tối thiểu vùng mới nhất theo Nghị định số 293/2025/NĐ-CP có hiệu lực từ ngày 01/01/2026 (Vùng I: 5.310.000đ, Vùng II: 4.730.000đ, Vùng III: 4.140.000đ, Vùng IV: 3.700.000đ)",
      "- Áp dụng mức giảm trừ gia cảnh mới: Bản thân 15.500.000 đồng/tháng (186 triệu đồng/năm), Phụ thuộc 6.200.000 đồng/tháng (theo Nghị quyết 110/2025/UBTVQH15)",
      "- Áp dụng Biểu thuế lũy tiến từng phần rút gọn 5 bậc theo Luật Thuế TNCN số 109/2025/QH15 (Bậc 1: đến 10tr - 5%, Bậc 2: 10-30tr - 10%, Bậc 3: 30-60tr - 20%, Bậc 4: 60-100tr - 30%, Bậc 5: trên 100tr - 35%)",
      "- <em>Thông tin mới: Chính phủ đã ban hành Nghị định số 399/2026/NĐ-CP ngày 02/11/2026 điều chỉnh mức lương tối thiểu vùng áp dụng từ ngày 01/01/2027.</em>"
    ]
  },
  "2026_1": {
    label: "Từ 01/01/2026 - 30/6/2026",
    BASE_SALARY: 2340000, // Mức tham chiếu theo Nghị định 73/2024/NĐ-CP
    MIN_WAGE: { "1": 5310000, "2": 4730000, "3": 4140000, "4": 3700000 },
    PERSONAL_DEDUCTION: 15500000,
    DEPENDENT_DEDUCTION: 6200000,
    taxBrackets: [
      { limit: 10000000, rate: 0.05 },
      { limit: 30000000, rate: 0.10 },
      { limit: 60000000, rate: 0.20 },
      { limit: 100000000, rate: 0.30 },
      { limit: Infinity, rate: 0.35 }
    ],
    LEGAL: [
      "- Áp dụng mức tham chiếu 2.340.000 đồng/tháng theo Nghị định số 73/2024/NĐ-CP (trần đóng BHXH, BHYT tối đa là 46.800.000 đồng/tháng).",
      "- Áp dụng mức lương tối thiểu vùng theo Nghị định số 293/2025/NĐ-CP (Vùng I: 5.310.000đ, Vùng II: 4.730.000đ, Vùng III: 4.140.000đ, Vùng IV: 3.700.000đ)",
      "- Áp dụng mức giảm trừ gia cảnh: Bản thân 15.500.000 đồng/tháng, Phụ thuộc 6.200.000 đồng/tháng (Nghị quyết 110/2025/UBTVQH15)",
      "- Áp dụng Biểu thuế lũy tiến từng phần 5 bậc theo Luật Thuế TNCN số 109/2025/QH15"
    ]
  },
  "2026": {
    label: "Từ 01/7/2026 (Mới nhất)",
    BASE_SALARY: 2530000,
    MIN_WAGE: { "1": 5310000, "2": 4730000, "3": 4140000, "4": 3700000 },
    PERSONAL_DEDUCTION: 15500000,
    DEPENDENT_DEDUCTION: 6200000,
    taxBrackets: [
      { limit: 10000000, rate: 0.05 },
      { limit: 30000000, rate: 0.10 },
      { limit: 60000000, rate: 0.20 },
      { limit: 100000000, rate: 0.30 },
      { limit: Infinity, rate: 0.35 }
    ],
    LEGAL: [
      "- Áp dụng Mức tham chiếu mới 2.530.000 đồng/tháng theo Nghị định số 161/2026/NĐ-CP (hiệu lực từ 01/07/2026), trần đóng BHXH, BHYT tối đa là 50.600.000 đồng/tháng.",
      "- Áp dụng mức lương tối thiểu vùng mới nhất theo Nghị định số 293/2025/NĐ-CP có hiệu lực từ ngày 01/01/2026 (Vùng I: 5.310.000đ, Vùng II: 4.730.000đ, Vùng III: 4.140.000đ, Vùng IV: 3.700.000đ)",
      "- Áp dụng mức giảm trừ gia cảnh mới: Bản thân 15.500.000 đồng/tháng (186 triệu đồng/năm), Phụ thuộc 6.200.000 đồng/tháng (theo Nghị quyết 110/2025/UBTVQH15)",
      "- Áp dụng Biểu thuế lũy tiến từng phần rút gọn 5 bậc theo Luật Thuế TNCN số 109/2025/QH15 (Bậc 1: đến 10tr - 5%, Bậc 2: 10-30tr - 10%, Bậc 3: 30-60tr - 20%, Bậc 4: 60-100tr - 30%, Bậc 5: trên 100tr - 35%)",
      "- <em>Thông tin mới: Chính phủ đã ban hành Nghị định số 399/2026/NĐ-CP ngày 02/11/2026 điều chỉnh mức lương tối thiểu vùng áp dụng từ ngày 01/01/2027.</em>"
    ]
  },
  "2025_2": {
    label: "Từ 01/7/2025 - 31/12/2025",
    BASE_SALARY: 2340000,
    MIN_WAGE: { "1": 4960000, "2": 4410000, "3": 3860000, "4": 3450000 },
    PERSONAL_DEDUCTION: 11000000,
    DEPENDENT_DEDUCTION: 4400000,
    taxBrackets: [
      { limit: 5000000, rate: 0.05 },
      { limit: 10000000, rate: 0.10 },
      { limit: 18000000, rate: 0.15 },
      { limit: 32000000, rate: 0.20 },
      { limit: 52000000, rate: 0.25 },
      { limit: 80000000, rate: 0.30 },
      { limit: Infinity, rate: 0.35 }
    ],
    LEGAL: [
      "- Áp dụng mức tham chiếu 2.340.000 đồng (Theo Luật Bảo hiểm xã hội 2024 và Nghị định 73/2024/NĐ-CP)",
      "- Áp dụng mức lương tối thiểu vùng theo Nghị định 74/2024/NĐ-CP",
      "- Áp dụng mức giảm trừ gia cảnh 11 triệu đồng/tháng với người nộp thuế và 4,4 triệu đồng/tháng với mỗi người phụ thuộc (Nghị quyết số 954/2020/UBTVQH14)",
      "- Áp dụng Biểu thuế lũy tiến từng phần 7 bậc theo Luật Thuế TNCN 2007"
    ]
  },
  "2024_2": {
    label: "Từ 01/7/2024 - 30/06/2025",
    BASE_SALARY: 2340000,
    MIN_WAGE: { "1": 4960000, "2": 4410000, "3": 3860000, "4": 3450000 },
    PERSONAL_DEDUCTION: 11000000,
    DEPENDENT_DEDUCTION: 4400000,
    taxBrackets: [
      { limit: 5000000, rate: 0.05 },
      { limit: 10000000, rate: 0.10 },
      { limit: 18000000, rate: 0.15 },
      { limit: 32000000, rate: 0.20 },
      { limit: 52000000, rate: 0.25 },
      { limit: 80000000, rate: 0.30 },
      { limit: Infinity, rate: 0.35 }
    ],
    LEGAL: [
      "- Áp dụng mức lương cơ sở 2.340.000 đồng (Nghị định 73/2024/NĐ-CP)",
      "- Áp dụng mức lương tối thiểu vùng mới nhất (Nghị định 74/2024/NĐ-CP)",
      "- Áp dụng mức giảm trừ gia cảnh 11 triệu đồng/tháng",
      "- Áp dụng Biểu thuế lũy tiến từng phần 7 bậc theo Luật Thuế TNCN 2007"
    ]
  },
  "2023_2": {
    label: "Từ 01/7/2023 - 30/06/2024",
    BASE_SALARY: 1800000,
    MIN_WAGE: { "1": 4680000, "2": 4160000, "3": 3640000, "4": 3250000 },
    PERSONAL_DEDUCTION: 11000000,
    DEPENDENT_DEDUCTION: 4400000,
    taxBrackets: [
      { limit: 5000000, rate: 0.05 },
      { limit: 10000000, rate: 0.10 },
      { limit: 18000000, rate: 0.15 },
      { limit: 32000000, rate: 0.20 },
      { limit: 52000000, rate: 0.25 },
      { limit: 80000000, rate: 0.30 },
      { limit: Infinity, rate: 0.35 }
    ],
    LEGAL: [
      "- Áp dụng mức lương cơ sở 1.800.000 đồng (Nghị định 24/2023/NĐ-CP)",
      "- Áp dụng mức lương tối thiểu vùng (Nghị định 38/2022/NĐ-CP)"
    ]
  },
  "2022_2": {
    label: "Từ 01/7/2022 - 30/06/2023",
    BASE_SALARY: 1490000,
    MIN_WAGE: { "1": 4680000, "2": 4160000, "3": 3640000, "4": 3250000 },
    PERSONAL_DEDUCTION: 11000000,
    DEPENDENT_DEDUCTION: 4400000,
    taxBrackets: [
      { limit: 5000000, rate: 0.05 },
      { limit: 10000000, rate: 0.10 },
      { limit: 18000000, rate: 0.15 },
      { limit: 32000000, rate: 0.20 },
      { limit: 52000000, rate: 0.25 },
      { limit: 80000000, rate: 0.30 },
      { limit: Infinity, rate: 0.35 }
    ],
    LEGAL: [
      "- Áp dụng mức lương cơ sở 1.490.000 đồng",
      "- Áp dụng mức lương tối thiểu vùng (Nghị định 38/2022/NĐ-CP)"
    ]
  }
};

// Lấy bộ rules hiện tại
function getCurrentRules() {
  const period = document.querySelector('input[name="rule-period"]:checked')?.value || '2026_2';
  return rulesDB[period] || rulesDB['2026_2'] || rulesDB['2026'];
}

// Cập nhật text pháp lý khi đổi thời gian
document.querySelectorAll('input[name="rule-period"]').forEach(radio => {
  radio.addEventListener('change', () => {
    const rules = getCurrentRules();
    const list = document.getElementById('dynamic-legal-list');
    list.innerHTML = rules.LEGAL.map(item => `<li>${item}</li>`).join('');
  });
});

// Xử lý bật/tắt ô nhập Lương BHXH Khác
const insRadios = document.querySelectorAll('input[name="ins-type"]');
const insInput = document.getElementById('gn-insurance');
insRadios.forEach(r => {
  r.addEventListener('change', () => {
    if (r.value === 'other') {
      insInput.disabled = false;
      insInput.focus();
    } else {
      insInput.disabled = true;
      insInput.value = '';
    }
  });
});

// Tiện ích format
function formatCurrency(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function parseCurrency(str) {
  return parseFloat(str.replace(/,/g, '')) || 0;
}

document.querySelectorAll('.number-format').forEach(input => {
  input.addEventListener('input', function() {
    let val = parseCurrency(this.value);
    this.value = val === 0 && this.value.trim() === '' ? '' : formatCurrency(val);
  });
});

// Xử lý Accordion Xem thêm
const btnReadMore = document.getElementById('btn-read-more');
const seoContent = document.querySelector('.seo-text-wrapper');
if (btnReadMore && seoContent) {
  btnReadMore.addEventListener('click', () => {
    seoContent.classList.toggle('expanded');
    if (seoContent.classList.contains('expanded')) {
      btnReadMore.innerText = 'Thu gọn ⌃';
    } else {
      btnReadMore.innerText = 'Xem thêm ⌄';
    }
  });
}

// --- THUẬT TOÁN TÍNH TOÁN ---
function calculateTax(taxableIncome, rules) {
  if (taxableIncome <= 0) return 0;
  const brackets = (rules && rules.taxBrackets) ? rules.taxBrackets : [
    { limit: 5000000, rate: 0.05 },
    { limit: 10000000, rate: 0.1 },
    { limit: 18000000, rate: 0.15 },
    { limit: 32000000, rate: 0.2 },
    { limit: 52000000, rate: 0.25 },
    { limit: 80000000, rate: 0.3 },
    { limit: Infinity, rate: 0.35 }
  ];
  let tax = 0;
  let remaining = taxableIncome;
  let prevLimit = 0;

  for (let b of brackets) {
    let bracketSize = b.limit - prevLimit;
    if (remaining > bracketSize) {
      tax += bracketSize * b.rate;
      remaining -= bracketSize;
    } else {
      tax += remaining * b.rate;
      break;
    }
    prevLimit = b.limit;
  }
  return tax;
}

function calcGrossToNetLogic(gross, insType, insOther, region, dependents, rules) {
  let luongBHXH = gross;
  if (insType === 'other' && insOther > 0) {
    luongBHXH = insOther;
  }

  // Trần bảo hiểm
  const maxBHXH = rules.BASE_SALARY * 20; // Hưu trí, BHYT trần 20 lần lương cơ sở (tham chiếu)
  const maxBHTN = rules.MIN_WAGE[region] * 20; // BHTN trần 20 lần lương tối thiểu vùng

  let baseBHXH = Math.min(luongBHXH, maxBHXH);
  let baseBHTN = Math.min(luongBHXH, maxBHTN);

  let bhxh = baseBHXH * 0.08;
  let bhyt = baseBHXH * 0.015;
  let bhtn = baseBHTN * 0.01;
  let totalIns = bhxh + bhyt + bhtn;

  let deduction = rules.PERSONAL_DEDUCTION + (dependents * rules.DEPENDENT_DEDUCTION);
  let incomeBeforeTax = gross - totalIns;
  let taxableIncome = incomeBeforeTax - deduction;
  
  let tax = calculateTax(taxableIncome, rules);
  let net = gross - totalIns - tax;

  return {
    gross: gross,
    net: net,
    bhxh: bhxh,
    bhyt: bhyt,
    bhtn: bhtn,
    totalIns: totalIns,
    deduction: deduction,
    taxableIncome: taxableIncome,
    tax: tax
  };
}

// Convert Net to Gross (Binary Search method)
function calcNetToGrossLogic(net, insType, insOther, region, dependents, rules) {
  let low = net;
  let high = net * 3;
  let mid = 0;
  let result = null;

  for (let i = 0; i < 60; i++) {
    mid = (low + high) / 2;
    result = calcGrossToNetLogic(mid, insType, insOther, region, dependents, rules);
    if (result.net < net) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return result;
}

function renderReport(data) {
  const container = document.getElementById('gn-report-container');
  
  const pctNet = ((data.net / data.gross) * 100).toFixed(1);
  const pctIns = ((data.totalIns / data.gross) * 100).toFixed(1);
  const pctTax = ((data.tax / data.gross) * 100).toFixed(1);

  container.innerHTML = `
    <h2 class="section-title" style="text-align: center; margin-bottom: 20px;">KẾT QUẢ CHUYỂN ĐỔI</h2>
    <div class="gn-conversion-summary">
      <div class="gn-conversion-item">
        <div class="gn-conversion-label">LƯƠNG GROSS</div>
        <div class="gn-conversion-val" style="color: var(--blue);">${formatCurrency(Math.round(data.gross))} VNĐ</div>
      </div>
      <div class="gn-conversion-arrow">→</div>
      <div class="gn-conversion-item">
        <div class="gn-conversion-label">LƯƠNG NET (Thực nhận)</div>
        <div class="gn-conversion-val" style="color: var(--green);">${formatCurrency(Math.round(data.net))} VNĐ</div>
      </div>
    </div>

    <div class="tax-progress-bar">
      <div class="segment segment-net" style="width: ${pctNet}%"></div>
      <div class="segment segment-ins" style="width: ${pctIns}%"></div>
      <div class="segment segment-tax" style="width: ${pctTax}%"></div>
    </div>
    <div class="tax-legend">
      <div class="legend-item"><span class="color-dot dot-net"></span> Lương NET (${pctNet}%)</div>
      <div class="legend-item"><span class="color-dot dot-ins"></span> Bảo hiểm (${pctIns}%)</div>
      <div class="legend-item"><span class="color-dot dot-tax"></span> Thuế TNCN (${pctTax}%)</div>
    </div>

    <div class="tax-breakdown-table mt-30">
      <div class="b-row b-header">
        <div class="b-col-name">Diễn giải dòng tiền</div>
        <div class="b-col-val">Số tiền (VNĐ)</div>
      </div>
      <div class="b-row b-main">
        <div class="b-col-name">1. Lương GROSS ban đầu</div>
        <div class="b-col-val" style="color: var(--blue);">${formatCurrency(Math.round(data.gross))}</div>
      </div>
      <div class="b-row">
        <div class="b-col-name">- Bảo hiểm xã hội (8%)</div>
        <div class="b-col-val">-${formatCurrency(Math.round(data.bhxh))}</div>
      </div>
      <div class="b-row">
        <div class="b-col-name">- Bảo hiểm y tế (1.5%)</div>
        <div class="b-col-val">-${formatCurrency(Math.round(data.bhyt))}</div>
      </div>
      <div class="b-row">
        <div class="b-col-name">- Bảo hiểm thất nghiệp (1%)</div>
        <div class="b-col-val">-${formatCurrency(Math.round(data.bhtn))}</div>
      </div>
      <div class="b-row b-main">
        <div class="b-col-name">2. Thu nhập trước thuế</div>
        <div class="b-col-val">${formatCurrency(Math.round(data.gross - data.totalIns))}</div>
      </div>
      <div class="b-row">
        <div class="b-col-name">- Giảm trừ gia cảnh</div>
        <div class="b-col-val">-${formatCurrency(Math.round(data.deduction))}</div>
      </div>
      <div class="b-row b-main">
        <div class="b-col-name">3. Thu nhập chịu thuế</div>
        <div class="b-col-val">${formatCurrency(Math.round(Math.max(0, data.taxableIncome)))}</div>
      </div>
      <div class="b-row">
        <div class="b-col-name">- Thuế Thu nhập cá nhân</div>
        <div class="b-col-val" style="color: #ff4757;">-${formatCurrency(Math.round(data.tax))}</div>
      </div>
      <div class="b-row b-header" style="margin-top: 10px; border-top: 2px solid var(--border);">
        <div class="b-col-name">4. Lương NET (Thực nhận)</div>
        <div class="b-col-val" style="color: var(--green); font-size: 16px;">${formatCurrency(Math.round(data.net))}</div>
      </div>
    </div>
  `;
  container.style.display = 'block';
  
  // Scroll to report
  container.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function getFormValues() {
  const rules = getCurrentRules();
  const income = parseCurrency(document.getElementById('gn-income').value);
  const insType = document.querySelector('input[name="ins-type"]:checked').value;
  const insOther = parseCurrency(document.getElementById('gn-insurance').value);
  const region = document.querySelector('input[name="region"]:checked').value;
  const dependents = parseInt(document.getElementById('gn-dependents').value) || 0;

  if (income <= 0) {
    alert("Vui lòng nhập thu nhập lớn hơn 0");
    return null;
  }
  return { rules, income, insType, insOther, region, dependents };
}

function calcGrossToNet() {
  const v = getFormValues();
  if (!v) return;
  const data = calcGrossToNetLogic(v.income, v.insType, v.insOther, v.region, v.dependents, v.rules);
  renderReport(data);
}

function calcNetToGross() {
  const v = getFormValues();
  if (!v) return;
  const data = calcNetToGrossLogic(v.income, v.insType, v.insOther, v.region, v.dependents, v.rules);
  renderReport(data);
}

// --- MODAL GIẢI THÍCH VÙNG ---
function openRegionModal() {
  const modal = document.getElementById('regionModal');
  if (modal) modal.style.display = 'flex';
}

function closeRegionModal() {
  const modal = document.getElementById('regionModal');
  if (modal) modal.style.display = 'none';
}

// Đóng modal khi click ra ngoài
window.addEventListener('click', function(e) {
  const modal = document.getElementById('regionModal');
  if (e.target === modal) {
    closeRegionModal();
  }
});
