// --- Dữ liệu các mốc quy định pháp lý ---
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  const rules = getCurrentRules();
  const list = document.getElementById('dynamic-legal-list');
  if (list) list.innerHTML = rules.LEGAL.map(item => `<li>${item}</li>`).join('');

  const inputs = document.querySelectorAll('input, select');
  inputs.forEach(el => {
    el.addEventListener('input', saveData);
    el.addEventListener('change', saveData);
  });

  const hesoL = document.getElementById('gn-heso-luong');
  const hesoP = document.getElementById('gn-heso-phucap');
  if (hesoL) hesoL.addEventListener('input', updateHesoPreview);
  if (hesoP) hesoP.addEventListener('input', updateHesoPreview);
});

// Chuyển đổi chế độ nhập thu nhập (VNĐ hoặc Hệ số lương)
function setIncomeMode(mode) {
  const btnVnd = document.getElementById('btn-mode-vnd');
  const btnHeso = document.getElementById('btn-mode-heso');
  const wrapVnd = document.getElementById('wrapper-mode-vnd');
  const wrapHeso = document.getElementById('wrapper-mode-heso');
  if (!btnVnd || !btnHeso || !wrapVnd || !wrapHeso) return;

  if (mode === 'heso') {
    btnHeso.classList.add('active');
    btnVnd.classList.remove('active');
    wrapHeso.style.display = 'block';
    wrapVnd.style.display = 'none';
    updateHesoPreview();
  } else {
    btnVnd.classList.add('active');
    btnHeso.classList.remove('active');
    wrapVnd.style.display = 'block';
    wrapHeso.style.display = 'none';
  }
  saveData();
}

// Cập nhật xem trước số tiền từ Hệ số lương
function updateHesoPreview() {
  const rules = getCurrentRules();
  const hesoLuong = parseFloat(document.getElementById('gn-heso-luong')?.value) || 0;
  const hesoPhucap = parseFloat(document.getElementById('gn-heso-phucap')?.value) || 0;
  const baseSalary = rules.BASE_SALARY;
  const totalHeso = hesoLuong + hesoPhucap;
  const computedSalary = Math.round(totalHeso * baseSalary);

  const previewEl = document.getElementById('heso-preview-text');
  if (previewEl) {
    previewEl.innerHTML = `= (${hesoLuong} + ${hesoPhucap}) × ${formatCurrency(baseSalary)}đ = <b style="color: var(--green);">${formatCurrency(computedSalary)} VNĐ</b>`;
  }

  // Đồng bộ sang trường gn-income nếu đang ở chế độ hệ số
  const isHesoMode = document.getElementById('btn-mode-heso')?.classList.contains('active');
  if (isHesoMode) {
    const incomeInput = document.getElementById('gn-income');
    if (incomeInput) {
      incomeInput.value = computedSalary > 0 ? formatCurrency(computedSalary) : '';
    }
  }
  saveData();
}

// Mở / Đóng Accordion Tùy chọn nâng cao
function toggleAdvancedAccordion() {
  const accordion = document.querySelector('.advanced-accordion');
  const btn = document.getElementById('adv-accordion-btn');
  if (!accordion || !btn) return;
  const isOpen = accordion.classList.contains('open');
  if (isOpen) {
    accordion.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  } else {
    accordion.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
  }
}

// Xử lý khi thay đổi Đối tượng lao động
function onWorkerTypeChange() {
  const workerType = document.getElementById('gn-worker-type')?.value;
  const taxRegimeSelect = document.getElementById('gn-tax-regime');
  const unionFeeCheckbox = document.getElementById('gn-union-fee');

  if (workerType === 'nn_khong_cu_tru') {
    // Cá nhân nước ngoài không cư trú: 0% BH, 20% phẳng
    if (taxRegimeSelect) taxRegimeSelect.disabled = true;
    if (unionFeeCheckbox) {
      unionFeeCheckbox.disabled = true;
      unionFeeCheckbox.checked = false;
    }
  } else if (workerType === 'nghi_huu') {
    // Nghỉ hưu: 0% BH
    if (taxRegimeSelect) taxRegimeSelect.disabled = false;
    if (unionFeeCheckbox) {
      unionFeeCheckbox.disabled = true;
      unionFeeCheckbox.checked = false;
    }
  } else {
    if (taxRegimeSelect) taxRegimeSelect.disabled = false;
    if (unionFeeCheckbox) unionFeeCheckbox.disabled = false;
  }
  saveData();
}

function saveData() {
  const isHeso = document.getElementById('btn-mode-heso')?.classList.contains('active');
  const data = {
    period: document.querySelector('input[name="rule-period"]:checked')?.value || '2026_2',
    incomeMode: isHeso ? 'heso' : 'vnd',
    income: document.getElementById('gn-income')?.value || '',
    hesoLuong: document.getElementById('gn-heso-luong')?.value || '',
    hesoPhucap: document.getElementById('gn-heso-phucap')?.value || '',
    insType: document.querySelector('input[name="ins-type"]:checked')?.value || 'official',
    insOther: document.getElementById('gn-insurance')?.value || '',
    region: document.querySelector('input[name="region"]:checked')?.value || '1',
    dependents: document.getElementById('gn-dependents')?.value || '',
    workerType: document.getElementById('gn-worker-type')?.value || 'tu_nhan',
    taxRegime: document.getElementById('gn-tax-regime')?.value || 'chinh_thuc',
    allowance: document.getElementById('gn-allowance')?.value || '',
    allowanceIncluded: document.getElementById('gn-allowance-included')?.checked ?? true,
    unionFee: document.getElementById('gn-union-fee')?.checked ?? false,
    otherTaxDeduction: document.getElementById('gn-other-tax-deduction')?.value || '',
    otherPostTaxDeduction: document.getElementById('gn-other-post-tax-deduction')?.value || ''
  };
  localStorage.setItem('gross_net_data', JSON.stringify(data));
}

function loadData() {
  const dataStr = localStorage.getItem('gross_net_data');
  if (dataStr) {
    try {
      const data = JSON.parse(dataStr);
      if (data.period) {
        const pRadio = document.querySelector(`input[name="rule-period"][value="${data.period}"]`);
        if (pRadio) pRadio.checked = true;
      }
      if (data.incomeMode === 'heso') {
        setIncomeMode('heso');
      } else {
        setIncomeMode('vnd');
      }
      if (data.income) document.getElementById('gn-income').value = data.income;
      if (data.hesoLuong) document.getElementById('gn-heso-luong').value = data.hesoLuong;
      if (data.hesoPhucap) document.getElementById('gn-heso-phucap').value = data.hesoPhucap;

      if (data.insType) {
        const insR = document.querySelector(`input[name="ins-type"][value="${data.insType}"]`);
        if (insR) {
          insR.checked = true;
          const insInput = document.getElementById('gn-insurance');
          if (insInput) insInput.disabled = (data.insType !== 'other');
        }
      }
      if (data.insOther) document.getElementById('gn-insurance').value = data.insOther;
      if (data.region) {
        const regR = document.querySelector(`input[name="region"][value="${data.region}"]`);
        if (regR) regR.checked = true;
      }
      if (data.dependents !== undefined && data.dependents !== '') {
        document.getElementById('gn-dependents').value = data.dependents;
      }

      if (data.workerType) document.getElementById('gn-worker-type').value = data.workerType;
      if (data.taxRegime) document.getElementById('gn-tax-regime').value = data.taxRegime;
      if (data.allowance) document.getElementById('gn-allowance').value = data.allowance;
      if (data.allowanceIncluded !== undefined) document.getElementById('gn-allowance-included').checked = data.allowanceIncluded;
      if (data.unionFee !== undefined) document.getElementById('gn-union-fee').checked = data.unionFee;
      if (data.otherTaxDeduction) document.getElementById('gn-other-tax-deduction').value = data.otherTaxDeduction;
      if (data.otherPostTaxDeduction) document.getElementById('gn-other-post-tax-deduction').value = data.otherPostTaxDeduction;

      onWorkerTypeChange();
      if (data.incomeMode === 'heso') {
        updateHesoPreview();
      }

      const rules = getCurrentRules();
      const list = document.getElementById('dynamic-legal-list');
      if (list) list.innerHTML = rules.LEGAL.map(item => `<li>${item}</li>`).join('');
    } catch (e) {}
  }
}

function clearData() {
  if (!confirm('Bạn có chắc chắn muốn xóa toàn bộ dữ liệu đã nhập?')) return;
  localStorage.removeItem('gross_net_data');

  setIncomeMode('vnd');
  document.getElementById('gn-income').value = '';
  document.getElementById('gn-heso-luong').value = '2.34';
  document.getElementById('gn-heso-phucap').value = '0';
  document.getElementById('gn-insurance').value = '';
  document.getElementById('gn-insurance').disabled = true;
  document.getElementById('gn-dependents').value = '';

  const defaultPeriod = document.querySelector('input[name="rule-period"][value="2026_2"]') || document.querySelector('input[name="rule-period"][value="2026"]');
  if (defaultPeriod) defaultPeriod.checked = true;
  document.querySelector('input[name="ins-type"][value="official"]').checked = true;
  document.querySelector('input[name="region"][value="1"]').checked = true;

  document.getElementById('gn-worker-type').value = 'tu_nhan';
  document.getElementById('gn-tax-regime').value = 'chinh_thuc';
  document.getElementById('gn-tax-regime').disabled = false;
  document.getElementById('gn-allowance').value = '';
  document.getElementById('gn-allowance-included').checked = true;
  document.getElementById('gn-union-fee').checked = false;
  document.getElementById('gn-union-fee').disabled = false;
  document.getElementById('gn-other-tax-deduction').value = '';
  document.getElementById('gn-other-post-tax-deduction').value = '';

  const accordion = document.querySelector('.advanced-accordion');
  if (accordion) accordion.classList.remove('open');
  const advBtn = document.getElementById('adv-accordion-btn');
  if (advBtn) advBtn.setAttribute('aria-expanded', 'false');

  document.getElementById('gn-report-container').style.display = 'none';

  const rules = getCurrentRules();
  const list = document.getElementById('dynamic-legal-list');
  if (list) list.innerHTML = rules.LEGAL.map(item => `<li>${item}</li>`).join('');

  window.scrollTo({ top: 0, behavior: 'smooth' });
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
      "- Áp dụng mức đóng đoàn phí công đoàn 0,5% tiền lương làm căn cứ đóng BHXH (tối đa 10% mức tham chiếu) theo Quyết định số 61/QĐ-TLĐ.",
      "- Các khoản phụ cấp ăn trưa, trang phục trong định mức, phần lương làm thêm giờ/ban đêm trả cao hơn được miễn thuế TNCN theo quy định hiện hành.",
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
      "- Áp dụng Biểu thuế lũy tiến từng phần 5 bậc theo Luật Thuế TNCN số 109/2025/QH15",
      "- Áp dụng mức đóng đoàn phí công đoàn 0,5% tiền lương làm căn cứ đóng BHXH (tối đa 10% mức tham chiếu) theo Quyết định số 61/QĐ-TLĐ.",
      "- Các khoản phụ cấp ăn trưa, trang phục trong định mức, phần lương làm thêm giờ/ban đêm trả cao hơn được miễn thuế TNCN theo quy định hiện hành."
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
      "- Áp dụng mức đóng đoàn phí công đoàn 0,5% tiền lương làm căn cứ đóng BHXH (tối đa 10% mức tham chiếu) theo Quyết định số 61/QĐ-TLĐ.",
      "- Các khoản phụ cấp ăn trưa, trang phục trong định mức, phần lương làm thêm giờ/ban đêm trả cao hơn được miễn thuế TNCN theo quy định hiện hành.",
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
    if (list) list.innerHTML = rules.LEGAL.map(item => `<li>${item}</li>`).join('');
    updateHesoPreview();
    saveData();
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
    saveData();
  });
});

// Tiện ích format
function formatCurrency(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function parseCurrency(str) {
  if (!str) return 0;
  return parseFloat(str.toString().replace(/,/g, '')) || 0;
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

function calcGrossToNetLogic(gross, insType, insOther, region, dependents, rules, options = {}) {
  const {
    workerType = 'tu_nhan',
    taxRegime = 'chinh_thuc',
    allowance = 0,
    allowanceIncluded = true,
    unionFee = false,
    otherTaxDeduction = 0,
    otherPostTaxDeduction = 0
  } = options;

  let totalGross = allowanceIncluded ? gross : (gross + allowance);

  // Lương làm căn cứ đóng bảo hiểm
  let luongBHXH = 0;
  if (insType === 'none' || workerType === 'nn_khong_cu_tru' || workerType === 'nghi_huu') {
    luongBHXH = 0;
  } else if (insType === 'other' && insOther > 0) {
    luongBHXH = insOther;
  } else {
    // official
    luongBHXH = allowanceIncluded ? Math.max(0, gross - allowance) : gross;
  }

  // Trần bảo hiểm
  const maxBHXH = rules.BASE_SALARY * 20; // Hưu trí, BHYT trần 20 lần mức tham chiếu
  const maxBHTN = rules.MIN_WAGE[region] * 20; // BHTN trần 20 lần lương tối thiểu vùng

  const baseBHXH = Math.min(luongBHXH, maxBHXH);
  const baseBHTN = Math.min(luongBHXH, maxBHTN);

  let rateBHXH = 0.08;
  let rateBHYT = 0.015;
  let rateBHTN = 0.01;

  if (workerType === 'cong_chuc' || workerType === 'nn_cu_tru') {
    rateBHTN = 0; // Công chức và người nước ngoài không đóng BHTN
  } else if (workerType === 'nn_khong_cu_tru' || workerType === 'nghi_huu') {
    rateBHXH = 0;
    rateBHYT = 0;
    rateBHTN = 0;
  }

  const bhxh = baseBHXH * rateBHXH;
  const bhyt = baseBHXH * rateBHYT;
  const bhtn = baseBHTN * rateBHTN;
  const totalIns = bhxh + bhyt + bhtn;

  // Đoàn phí công đoàn (QĐ 61/QĐ-TLĐ: 0.5% lương đóng BHXH, tối đa 10% mức tham chiếu)
  let unionDues = 0;
  if (unionFee && baseBHXH > 0 && rateBHXH > 0) {
    const maxUnionFee = rules.BASE_SALARY * 0.10;
    unionDues = Math.min(baseBHXH * 0.005, maxUnionFee);
  }

  const incomeBeforeTax = totalGross - totalIns;
  const assessableIncome = Math.max(0, totalGross - allowance - totalIns);

  let deduction = 0;
  let otherTaxDeduct = 0;
  let taxableIncome = 0;
  let tax = 0;

  if (workerType === 'nn_khong_cu_tru') {
    // Người nước ngoài không cư trú: thuế suất 20% phẳng trên thu nhập, không giảm trừ
    deduction = 0;
    otherTaxDeduct = 0;
    taxableIncome = Math.max(0, totalGross - allowance);
    tax = taxableIncome * 0.20;
  } else if (taxRegime === 'thu_viec') {
    // Thử việc / HĐ dưới 3 tháng: Khấu trừ 10% nếu thu nhập >= 2 triệu, không giảm trừ
    deduction = 0;
    otherTaxDeduct = 0;
    taxableIncome = assessableIncome;
    if (taxableIncome >= 2000000) {
      tax = taxableIncome * 0.10;
    } else {
      tax = 0;
    }
  } else {
    // Chính thức: Biểu lũy tiến từng phần
    deduction = rules.PERSONAL_DEDUCTION + (dependents * rules.DEPENDENT_DEDUCTION);
    otherTaxDeduct = otherTaxDeduction || 0;
    taxableIncome = Math.max(0, assessableIncome - deduction - otherTaxDeduct);
    tax = calculateTax(taxableIncome, rules);
  }

  const otherPostTax = otherPostTaxDeduction || 0;
  const net = Math.max(0, totalGross - totalIns - tax - unionDues - otherPostTax);

  return {
    gross: totalGross,
    originalIncome: gross,
    net: net,
    bhxh: bhxh,
    bhyt: bhyt,
    bhtn: bhtn,
    rateBHXH: rateBHXH,
    rateBHYT: rateBHYT,
    rateBHTN: rateBHTN,
    totalIns: totalIns,
    incomeBeforeTax: incomeBeforeTax,
    allowance: allowance,
    allowanceIncluded: allowanceIncluded,
    deduction: deduction,
    otherTaxDeduction: otherTaxDeduct,
    taxableIncome: taxableIncome,
    tax: tax,
    unionFee: unionDues,
    otherPostTaxDeduction: otherPostTax,
    workerType: workerType,
    taxRegime: taxRegime
  };
}

// Chuyển đổi Net sang Gross (Thuật toán Binary Search 60 vòng lặp)
function calcNetToGrossLogic(targetNet, insType, insOther, region, dependents, rules, options = {}) {
  let low = 0;
  let high = Math.max(targetNet * 4, 100000000);
  let mid = 0;

  for (let i = 0; i < 60; i++) {
    mid = (low + high) / 2;
    let res = calcGrossToNetLogic(mid, insType, insOther, region, dependents, rules, options);
    if (res.net < targetNet) {
      low = mid;
    } else {
      high = mid;
    }
  }

  // Tinh chỉnh làm tròn nguyên đồng VNĐ
  let cand = Math.round(mid);
  let bestGross = cand;
  let bestDiff = Math.abs(calcGrossToNetLogic(cand, insType, insOther, region, dependents, rules, options).net - targetNet);

  for (let delta of [-2, -1, 1, 2]) {
    let testGross = cand + delta;
    if (testGross >= 0) {
      let testDiff = Math.abs(calcGrossToNetLogic(testGross, insType, insOther, region, dependents, rules, options).net - targetNet);
      if (testDiff < bestDiff) {
        bestDiff = testDiff;
        bestGross = testGross;
      }
    }
  }

  return calcGrossToNetLogic(bestGross, insType, insOther, region, dependents, rules, options);
}

function renderReport(data, conversionType = 'gross_to_net') {
  window.currentReportData = data;
  window.currentConversionType = conversionType;

  const container = document.getElementById('gn-report-container');

  const pctNet = data.gross > 0 ? ((data.net / data.gross) * 100).toFixed(1) : 0;
  const pctIns = data.gross > 0 ? ((data.totalIns / data.gross) * 100).toFixed(1) : 0;
  const pctTax = data.gross > 0 ? ((data.tax / data.gross) * 100).toFixed(1) : 0;
  const pctOther = data.gross > 0 ? (((data.unionFee + data.otherPostTaxDeduction) / data.gross) * 100).toFixed(1) : 0;

  const isNetToGross = conversionType === 'net_to_gross';

  container.innerHTML = `
    <h2 class="section-title" style="text-align: center; margin-bottom: 20px;">KẾT QUẢ CHUYỂN ĐỔI</h2>
    <div class="gn-conversion-summary">
      <div class="gn-conversion-item">
        <div class="gn-conversion-label">${isNetToGross ? 'LƯƠNG NET (Nhập vào)' : 'LƯƠNG GROSS'}</div>
        <div class="gn-conversion-val" style="color: ${isNetToGross ? 'var(--green)' : 'var(--blue)'};">${formatCurrency(Math.round(isNetToGross ? data.net : data.gross))} VNĐ</div>
      </div>
      <div class="gn-conversion-arrow">→</div>
      <div class="gn-conversion-item">
        <div class="gn-conversion-label">${isNetToGross ? 'LƯƠNG GROSS (Quy đổi)' : 'LƯƠNG NET (Thực nhận)'}</div>
        <div class="gn-conversion-val" style="color: ${isNetToGross ? 'var(--blue)' : 'var(--green)'};">${formatCurrency(Math.round(isNetToGross ? data.gross : data.net))} VNĐ</div>
      </div>
    </div>

    <div class="tax-progress-bar">
      <div class="segment segment-net" style="width: ${pctNet}%"></div>
      <div class="segment segment-ins" style="width: ${pctIns}%"></div>
      <div class="segment segment-tax" style="width: ${pctTax}%"></div>
      ${pctOther > 0 ? `<div class="segment" style="width: ${pctOther}%; background-color: #8e44ad;"></div>` : ''}
    </div>
    <div class="tax-legend">
      <div class="legend-item"><span class="color-dot dot-net"></span> Lương NET (${pctNet}%)</div>
      <div class="legend-item"><span class="color-dot dot-ins"></span> Bảo hiểm (${pctIns}%)</div>
      <div class="legend-item"><span class="color-dot dot-tax"></span> Thuế TNCN (${pctTax}%)</div>
      ${pctOther > 0 ? `<div class="legend-item"><span class="color-dot" style="background-color: #8e44ad;"></span> Khấu trừ khác (${pctOther}%)</div>` : ''}
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
      ${data.allowance > 0 ? `
      <div class="b-row">
        <div class="b-col-name">• Phụ cấp miễn thuế TNCN (Ăn trưa, trang phục, OT...)</div>
        <div class="b-col-val" style="color: var(--green);">${formatCurrency(Math.round(data.allowance))}</div>
      </div>` : ''}
      <div class="b-row">
        <div class="b-col-name">- Bảo hiểm xã hội (${(data.rateBHXH * 100).toFixed(1).replace('.0', '')}%)</div>
        <div class="b-col-val">-${formatCurrency(Math.round(data.bhxh))}</div>
      </div>
      <div class="b-row">
        <div class="b-col-name">- Bảo hiểm y tế (${(data.rateBHYT * 100).toFixed(1).replace('.0', '')}%)</div>
        <div class="b-col-val">-${formatCurrency(Math.round(data.bhyt))}</div>
      </div>
      <div class="b-row">
        <div class="b-col-name">- Bảo hiểm thất nghiệp (${(data.rateBHTN * 100).toFixed(1).replace('.0', '')}%)</div>
        <div class="b-col-val">-${formatCurrency(Math.round(data.bhtn))}</div>
      </div>
      <div class="b-row b-main">
        <div class="b-col-name">2. Thu nhập trước thuế</div>
        <div class="b-col-val">${formatCurrency(Math.round(data.incomeBeforeTax))}</div>
      </div>
      <div class="b-row">
        <div class="b-col-name">- Giảm trừ gia cảnh (${data.deduction > 0 ? 'Bản thân & Phụ thuộc' : 'Không áp dụng'})</div>
        <div class="b-col-val">-${formatCurrency(Math.round(data.deduction))}</div>
      </div>
      ${data.otherTaxDeduction > 0 ? `
      <div class="b-row">
        <div class="b-col-name">- Giảm trừ thuế khác (Hưu trí tự nguyện, từ thiện...)</div>
        <div class="b-col-val">-${formatCurrency(Math.round(data.otherTaxDeduction))}</div>
      </div>` : ''}
      <div class="b-row b-main">
        <div class="b-col-name">3. Thu nhập chịu thuế</div>
        <div class="b-col-val">${formatCurrency(Math.round(Math.max(0, data.taxableIncome)))}</div>
      </div>
      <div class="b-row">
        <div class="b-col-name">- Thuế Thu nhập cá nhân ${data.taxRegime === 'thu_viec' ? '(10% thử việc)' : data.workerType === 'nn_khong_cu_tru' ? '(20% không cư trú)' : ''}</div>
        <div class="b-col-val" style="color: #ff4757;">-${formatCurrency(Math.round(data.tax))}</div>
      </div>
      ${data.unionFee > 0 ? `
      <div class="b-row">
        <div class="b-col-name">- Đoàn phí công đoàn (0.5%)</div>
        <div class="b-col-val" style="color: #ff4757;">-${formatCurrency(Math.round(data.unionFee))}</div>
      </div>` : ''}
      ${data.otherPostTaxDeduction > 0 ? `
      <div class="b-row">
        <div class="b-col-name">- Khấu trừ sau thuế khác (Gửi xe, quỹ...)</div>
        <div class="b-col-val" style="color: #ff4757;">-${formatCurrency(Math.round(data.otherPostTaxDeduction))}</div>
      </div>` : ''}
      <div class="b-row b-header" style="margin-top: 10px; border-top: 2px solid var(--border);">
        <div class="b-col-name">4. Lương NET (Thực nhận)</div>
        <div class="b-col-val" style="color: var(--green); font-size: 16px;">${formatCurrency(Math.round(data.net))}</div>
      </div>
    </div>

    <div class="report-actions-row">
      <button type="button" class="btn-action-report btn-copy-text" onclick="copyReportText()">
        <span>📋 Sao chép text</span>
      </button>
      <button type="button" class="btn-action-report btn-copy-img" onclick="copyReportImage()">
        <span>🖼️ Sao chép ảnh</span>
      </button>
      <button type="button" class="btn-action-report btn-download-img" onclick="downloadReportImage()">
        <span>📸 Tải ảnh (PNG)</span>
      </button>
      <button type="button" class="btn-action-report btn-print-report" onclick="window.print()">
        <span>🖨️ In / Lưu PDF</span>
      </button>
    </div>
  `;
  container.style.display = 'block';

  // Cuộn mượt đến bảng kết quả
  container.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Hiển thị thông báo Toast
function showToast(message, type = 'success', icon = '✅') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span style="font-size: 18px; flex-shrink: 0;">${icon}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastSlideOut 0.3s ease forwards';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3200);
}

// Tiện ích sao chép văn bản vào clipboard
function copyTextToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  } else {
    return new Promise((resolve, reject) => {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-999999px';
      textarea.style.top = '-999999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        const success = document.execCommand('copy');
        textarea.remove();
        if (success) resolve();
        else reject(new Error('execCommand copy failed'));
      } catch (err) {
        textarea.remove();
        reject(err);
      }
    });
  }
}

// 1. Sao chép kết quả dạng text
function copyReportText() {
  if (!window.currentReportData) {
    showToast('Chưa có kết quả để sao chép', 'warning', '⚠️');
    return;
  }

  const d = window.currentReportData;
  const isNetToGross = window.currentConversionType === 'net_to_gross';
  const rules = getCurrentRules();

  let lines = [];
  lines.push(`=== KẾT QUẢ TÍNH LƯƠNG GROSS - NET (${rules.label || '2026'}) ===`);
  lines.push(`• Hình thức: ${isNetToGross ? 'Quy đổi NET sang GROSS' : 'Quy đổi GROSS sang NET'}`);
  lines.push(`• Lương GROSS: ${formatCurrency(Math.round(d.gross))} VNĐ`);

  if (d.allowance > 0) {
    lines.push(`• Phụ cấp miễn thuế: ${formatCurrency(Math.round(d.allowance))} VNĐ`);
  }

  lines.push(`- BHXH (${(d.rateBHXH * 100).toFixed(1).replace('.0', '')}%): -${formatCurrency(Math.round(d.bhxh))} VNĐ`);
  lines.push(`- BHYT (${(d.rateBHYT * 100).toFixed(1).replace('.0', '')}%): -${formatCurrency(Math.round(d.bhyt))} VNĐ`);
  lines.push(`- BHTN (${(d.rateBHTN * 100).toFixed(1).replace('.0', '')}%): -${formatCurrency(Math.round(d.bhtn))} VNĐ`);
  lines.push(`  ➔ Tổng bảo hiểm: -${formatCurrency(Math.round(d.totalIns))} VNĐ`);

  lines.push(`• Thu nhập trước thuế: ${formatCurrency(Math.round(d.incomeBeforeTax))} VNĐ`);
  if (d.deduction > 0) {
    lines.push(`- Giảm trừ gia cảnh: -${formatCurrency(Math.round(d.deduction))} VNĐ`);
  }
  if (d.otherTaxDeduction > 0) {
    lines.push(`- Giảm trừ thuế khác: -${formatCurrency(Math.round(d.otherTaxDeduction))} VNĐ`);
  }

  lines.push(`• Thu nhập chịu thuế: ${formatCurrency(Math.round(Math.max(0, d.taxableIncome)))} VNĐ`);
  lines.push(`- Thuế TNCN: -${formatCurrency(Math.round(d.tax))} VNĐ`);

  if (d.unionFee > 0) {
    lines.push(`- Đoàn phí công đoàn (0.5%): -${formatCurrency(Math.round(d.unionFee))} VNĐ`);
  }
  if (d.otherPostTaxDeduction > 0) {
    lines.push(`- Khấu trừ sau thuế khác: -${formatCurrency(Math.round(d.otherPostTaxDeduction))} VNĐ`);
  }

  lines.push(`----------------------------------------`);
  lines.push(`👉 LƯƠNG NET THỰC NHẬN: ${formatCurrency(Math.round(d.net))} VNĐ`);
  lines.push(`----------------------------------------`);
  lines.push(`Tính tại: FinAnalyzer Portal (https://finanalyzer-portal.web.app/gross-net/)`);

  const fullText = lines.join('\n');

  copyTextToClipboard(fullText).then(() => {
    showToast('Đã sao chép kết quả dạng text vào bộ nhớ tạm!', 'success', '📋');
  }).catch(err => {
    console.error('Copy text error:', err);
    showToast('Không thể sao chép văn bản tự động.', 'error', '❌');
  });
}

// 2. Sao chép ảnh kết quả vào clipboard
async function copyReportImage() {
  const reportEl = document.getElementById('gn-report-container');
  if (!reportEl) return;

  if (typeof html2canvas === 'undefined') {
    showToast('Thư viện tạo ảnh chưa sẵn sàng hoặc kết nối mạng bị gián đoạn.', 'warning', '⏳');
    return;
  }

  const actionRow = reportEl.querySelector('.report-actions-row');
  if (actionRow) actionRow.style.display = 'none';

  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  const bgColor = isDark ? '#0b1220' : '#ffffff';

  showToast('Đang chụp ảnh kết quả...', 'info', '⏳');

  try {
    const canvas = await html2canvas(reportEl, {
      scale: 2,
      backgroundColor: bgColor,
      useCORS: true,
      logging: false
    });
    if (actionRow) actionRow.style.display = 'flex';

    if (navigator.clipboard && window.ClipboardItem) {
      canvas.toBlob(async blob => {
        if (!blob) {
          showToast('Không thể tạo file ảnh để sao chép', 'error', '❌');
          return;
        }
        try {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          showToast('Đã sao chép ảnh vào bộ nhớ tạm! Bạn có thể dán (Ctrl+V) ngay.', 'success', '🖼️');
        } catch (clipErr) {
          console.warn('Lỗi ghi clipboard ảnh, chuyển sang tải ảnh:', clipErr);
          showToast('Trình duyệt chưa hỗ trợ dán ảnh. Đang tự động tải ảnh về máy...', 'info', 'ℹ️');
          downloadReportImage();
        }
      }, 'image/png');
    } else {
      showToast('Trình duyệt chưa hỗ trợ sao chép ảnh. Đang tải ảnh về máy...', 'info', 'ℹ️');
      downloadReportImage();
    }
  } catch (err) {
    if (actionRow) actionRow.style.display = 'flex';
    console.error('Lỗi khi sao chép ảnh:', err);
    showToast('Không thể tạo ảnh kết quả. Vui lòng thử lại.', 'error', '❌');
  }
}

// 3. Tải ảnh kết quả chất lượng cao (PNG)
function downloadReportImage() {
  const reportEl = document.getElementById('gn-report-container');
  if (!reportEl) return;

  if (typeof html2canvas === 'undefined') {
    showToast('Thư viện tạo ảnh chưa sẵn sàng hoặc kết nối mạng bị gián đoạn. Bạn có thể sử dụng nút "In / Lưu PDF" để lưu báo cáo.', 'warning', '⏳');
    return;
  }

  const actionRow = reportEl.querySelector('.report-actions-row');
  if (actionRow) actionRow.style.display = 'none';

  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  const bgColor = isDark ? '#0b1220' : '#ffffff';

  html2canvas(reportEl, {
    scale: 2,
    backgroundColor: bgColor,
    useCORS: true,
    logging: false
  }).then(canvas => {
    if (actionRow) actionRow.style.display = 'flex';
    const link = document.createElement('a');
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    link.download = `Bang_Tinh_Luong_Gross_Net_${dateStr}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Đã tải file ảnh kết quả thành công!', 'success', '📸');
  }).catch(err => {
    if (actionRow) actionRow.style.display = 'flex';
    console.error('Lỗi xuất ảnh:', err);
    showToast('Không thể tạo file ảnh. Vui lòng thử lại hoặc sử dụng nút "In / Lưu PDF".', 'error', '❌');
  });
}

function getFormValues() {
  const rules = getCurrentRules();
  const isHeso = document.getElementById('btn-mode-heso')?.classList.contains('active');
  let income = 0;

  if (isHeso) {
    const hesoLuong = parseFloat(document.getElementById('gn-heso-luong')?.value) || 0;
    const hesoPhucap = parseFloat(document.getElementById('gn-heso-phucap')?.value) || 0;
    if (hesoLuong <= 0) {
      alert("Vui lòng nhập hệ số lương lớn hơn 0");
      return null;
    }
    income = Math.round((hesoLuong + hesoPhucap) * rules.BASE_SALARY);
  } else {
    income = parseCurrency(document.getElementById('gn-income').value);
    if (income <= 0) {
      alert("Vui lòng nhập thu nhập lớn hơn 0");
      return null;
    }
  }

  const insType = document.querySelector('input[name="ins-type"]:checked')?.value || 'official';
  const insOther = parseCurrency(document.getElementById('gn-insurance').value);
  const region = document.querySelector('input[name="region"]:checked')?.value || '1';
  const dependents = parseInt(document.getElementById('gn-dependents').value) || 0;

  const workerType = document.getElementById('gn-worker-type')?.value || 'tu_nhan';
  const taxRegime = document.getElementById('gn-tax-regime')?.value || 'chinh_thuc';
  const allowance = parseCurrency(document.getElementById('gn-allowance')?.value || '0');
  const allowanceIncluded = document.getElementById('gn-allowance-included')?.checked ?? true;
  const unionFee = document.getElementById('gn-union-fee')?.checked ?? false;
  const otherTaxDeduction = parseCurrency(document.getElementById('gn-other-tax-deduction')?.value || '0');
  const otherPostTaxDeduction = parseCurrency(document.getElementById('gn-other-post-tax-deduction')?.value || '0');

  const options = {
    workerType,
    taxRegime,
    allowance,
    allowanceIncluded,
    unionFee,
    otherTaxDeduction,
    otherPostTaxDeduction
  };

  return { rules, income, insType, insOther, region, dependents, options };
}

function calcGrossToNet() {
  const v = getFormValues();
  if (!v) return;
  const data = calcGrossToNetLogic(v.income, v.insType, v.insOther, v.region, v.dependents, v.rules, v.options);
  renderReport(data, 'gross_to_net');
}

function calcNetToGross() {
  const v = getFormValues();
  if (!v) return;
  const data = calcNetToGrossLogic(v.income, v.insType, v.insOther, v.region, v.dependents, v.rules, v.options);
  renderReport(data, 'net_to_gross');
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
