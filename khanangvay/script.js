let currentTab = 'oto';
let isBudgetManuallyEdited = false;

document.addEventListener('DOMContentLoaded', () => {
  let hasData = loadData();

  // Format inputs on load
  const currencyInputs = document.querySelectorAll('.input-currency');
  currencyInputs.forEach(input => {
    formatInput({target: input});
    input.addEventListener('input', formatInput);
  });
  
  switchTab(currentTab, true); // Initialize icon and labels
  
  calculateTotalIncome();
  calculateTotalDebt();
  
  if (hasData) {
    calculateResult(true);
  }

  
  // Initialize slider progress
  const s1 = document.getElementById('debt-slider-self');
  const s2 = document.getElementById('debt-slider-spouse');
  if(s1) updateSliderProgress(s1);
  if(s2) updateSliderProgress(s2);

  // Lắng nghe sự kiện để lưu dữ liệu
  document.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('change', saveData);
    el.addEventListener('input', saveData);
  });
});

function saveData() {
  const data = {
    incomeSelf: document.getElementById('income-self').value,
    incomeSpouse: document.getElementById('income-spouse').value,
    debtSelf: document.getElementById('debt-self').value,
    debtSpouse: document.getElementById('debt-spouse').value,
    safeLimit: document.getElementById('safe-limit').value,
    term: document.getElementById('term').value,
    termType: document.getElementById('term-type').value,
    interestRate: document.getElementById('interest-rate').value,
    ltv: document.getElementById('ltv').value,
    tab: currentTab
  };
  localStorage.setItem('khanangvay_data', JSON.stringify(data));
}

function loadData() {
  const dataStr = localStorage.getItem('khanangvay_data');
  if (dataStr) {
    try {
      const data = JSON.parse(dataStr);
      if(data.incomeSelf) document.getElementById('income-self').value = data.incomeSelf;
      if(data.incomeSpouse) document.getElementById('income-spouse').value = data.incomeSpouse;
      if(data.debtSelf) document.getElementById('debt-self').value = data.debtSelf;
      if(data.debtSpouse) document.getElementById('debt-spouse').value = data.debtSpouse;
      if(data.safeLimit) document.getElementById('safe-limit').value = data.safeLimit;
      if(data.term) document.getElementById('term').value = data.term;
      if(data.termType) document.getElementById('term-type').value = data.termType;
      if(data.interestRate) document.getElementById('interest-rate').value = data.interestRate;
      if(data.ltv) document.getElementById('ltv').value = data.ltv;
      if(data.tab) currentTab = data.tab;
      return true;
    } catch(e) {}
  }
  return false;
}

function clearData() {
  if(!confirm('Bạn có chắc chắn muốn xóa toàn bộ dữ liệu đã nhập?')) return;
  localStorage.removeItem('khanangvay_data');
  
  // Clear inputs
  document.getElementById('income-self').value = '';
  document.getElementById('income-spouse').value = '';
  document.getElementById('debt-self').value = '';
  document.getElementById('debt-spouse').value = '';
  
  document.getElementById('safe-limit').value = 75;
  document.getElementById('term').value = '';
  document.getElementById('term-type').value = 'month';
  document.getElementById('interest-rate').value = '';
  document.getElementById('ltv').value = currentTab === 'oto' ? 80 : 70;
  
  const s1 = document.getElementById('debt-slider-self');
  const s2 = document.getElementById('debt-slider-spouse');
  if(s1) { s1.value = 0; updateSliderProgress(s1); }
  if(s2) { s2.value = 0; updateSliderProgress(s2); }
  
  calculateTotalIncome();
  calculateTotalDebt();
  document.getElementById('result-section').style.display = 'none';
  window.scrollTo({top: 0, behavior: 'smooth'});
}

function formatInput(e) {
  let val = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '');
  if(val) {
    e.target.value = parseInt(val, 10).toLocaleString('vi-VN').replace(/,/g, '.');
  } else {
    e.target.value = '';
  }
}

function getNumericValue(id) {
  let val = document.getElementById(id).value.replace(/\./g, '').replace(/[^0-9]/g, '');
  return parseInt(val, 10) || 0;
}

function calculateTotalIncome() {
  const self = getNumericValue('income-self');
  const spouse = getNumericValue('income-spouse');
  const total = self + spouse;
  document.getElementById('income-total').value = total.toLocaleString('vi-VN').replace(/,/g, '.');
  
  // Update sliders if income changes
  updateSlidersMax();
}

function updateSlidersMax() {
  const limitEl = document.getElementById('safe-limit');
  const limit = limitEl ? (parseFloat(limitEl.value) || 75) : 75;
  const incSelf = getNumericValue('income-self');
  const incSpouse = getNumericValue('income-spouse');
  
  const maxSelf = Math.round(incSelf * (limit / 100));
  const maxSpouse = Math.round(incSpouse * (limit / 100));
  
  const s1 = document.getElementById('debt-slider-self');
  const s2 = document.getElementById('debt-slider-spouse');
  if(s1) s1.max = maxSelf || 100;
  if(s2) s2.max = maxSpouse || 100;
  
  syncDebtSlider('self');
  syncDebtSlider('spouse');
}

function syncDebtInput(person) {
  const slider = document.getElementById(`debt-slider-${person}`);
  if(!slider) return;
  document.getElementById(`debt-${person}`).value = parseInt(slider.value, 10).toLocaleString('vi-VN').replace(/,/g, '.');
  checkDebtWarning(person);
  updateSliderProgress(slider);
  calculateTotalDebt();
}

function syncDebtSlider(person) {
  const val = getNumericValue(`debt-${person}`);
  const slider = document.getElementById(`debt-slider-${person}`);
  if(!slider) return;
  slider.value = val;
  checkDebtWarning(person);
  updateSliderProgress(slider);
}

function checkDebtWarning(person) {
  const val = getNumericValue(`debt-${person}`);
  const slider = document.getElementById(`debt-slider-${person}`);
  const warn = document.getElementById(`warn-${person}`);
  if(!slider || !warn) return;
  
  if (val > parseInt(slider.max, 10)) {
    warn.style.display = 'block';
  } else {
    warn.style.display = 'none';
  }
}

function updateSliderProgress(slider) {
  if (!slider) return;
  const min = parseFloat(slider.min) || 0;
  const max = parseFloat(slider.max) || 100;
  const val = parseFloat(slider.value) || 0;
  let percentage = 0;
  if (max > min) {
    percentage = ((val - min) / (max - min)) * 100;
  }
  // Clamp percentage between 0 and 100
  percentage = Math.max(0, Math.min(100, percentage));
  slider.style.setProperty('--slider-progress', `${percentage}%`);
}

function calculateTotalDebt() {
  const self = getNumericValue('debt-self');
  const spouse = getNumericValue('debt-spouse');
  const total = self + spouse;
  document.getElementById('debt-total').value = total.toLocaleString('vi-VN').replace(/,/g, '.');
}

function switchTab(tab, isInit = false) {
  currentTab = tab;
  
  // Update buttons
  document.getElementById('tab-oto').classList.remove('active');
  document.getElementById('tab-nha').classList.remove('active');
  document.getElementById(`tab-${tab}`).classList.add('active');
  
  // Update UI Elements
  const bannerTitle = document.getElementById('banner-title');
  const bannerIcon = document.getElementById('banner-icon');
  const resIcon = document.getElementById('res-icon');
  const resAssetLabel = document.getElementById('res-asset-label');
  const ltvInput = document.getElementById('ltv');
  
  if(tab === 'oto') {
    bannerTitle.innerText = 'Tính toán ngay các phương án vay ô tô trả góp phù hợp với ngân sách của bạn và gia đình.';
    const carSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 16V10l3-4h12l3 4v6M3 16h18M5 16v3h2v-3M17 16v3h2v-3M7 16a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg>`;
    bannerIcon.innerHTML = carSvg;
    resIcon.innerHTML = carSvg;
    resAssetLabel.innerText = 'Giá trị xe tối đa bạn có thể mua';
    if (!isInit) ltvInput.value = 80;
  } else {
    bannerTitle.innerText = 'Tính toán ngay các phương án vay mua nhà trả góp phù hợp với ngân sách của bạn và gia đình.';
    const houseSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`;
    bannerIcon.innerHTML = houseSvg;
    resIcon.innerHTML = houseSvg;
    resAssetLabel.innerText = 'Giá trị căn nhà bạn có thể mua (Là tài sản đảm bảo khi vay)';
    if (!isInit) ltvInput.value = 70;
  }
  
  // Hide result if shown
  if (!isInit) {
    document.getElementById('result-section').style.display = 'none';
  }
  saveData();
}

function calculateResult(isFromLoad = false) {
  calculateTotalIncome();
  calculateTotalDebt();
  
  const totalIncome = getNumericValue('income-total');
  const totalDebt = getNumericValue('debt-total');
  const limitEl = document.getElementById('safe-limit');
  const limit = limitEl ? (parseFloat(limitEl.value) || 75) : 75;
  
  let term = parseFloat(document.getElementById('term').value) || 0;
  const termType = document.getElementById('term-type').value;
  if(termType === 'year') {
    term = term * 12;
  }
  
  const interestRate = parseFloat(document.getElementById('interest-rate').value) || 0;
  const ltv = parseFloat(document.getElementById('ltv').value) || 0;
  
  // 1. Max Monthly Payment
  const budgetTotal = totalIncome * (limit / 100);
  let maxMonthlyPayment = budgetTotal - totalDebt;
  if(maxMonthlyPayment < 0) maxMonthlyPayment = 0;
  
  // 2. Max Loan Amount (PV)
  let maxLoan = 0;
  if(term > 0 && maxMonthlyPayment > 0) {
    if(interestRate > 0) {
      const r = interestRate / 100 / 12;
      // PV = PMT * ((1 - (1 + r)^-n) / r)
      maxLoan = maxMonthlyPayment * ((1 - Math.pow(1 + r, -term)) / r);
    } else {
      maxLoan = maxMonthlyPayment * term;
    }
  }
  
  // 3. Asset Value
  let assetValue = 0;
  if(ltv > 0) {
    assetValue = maxLoan / (ltv / 100);
  }
  
  // 4. Downpayment
  let downpayment = assetValue - maxLoan;
  if(downpayment < 0) downpayment = 0;
  
  // Display formatting
  document.getElementById('res-monthly').innerText = Math.round(maxMonthlyPayment).toLocaleString('vi-VN') + ' ₫';
  document.getElementById('res-max-loan').innerText = Math.round(maxLoan).toLocaleString('vi-VN') + ' ₫';
  document.getElementById('res-asset-value').innerText = Math.round(assetValue).toLocaleString('vi-VN') + ' ₫';
  document.getElementById('res-downpayment').innerText = 'Vốn tự có cần chuẩn bị: ' + Math.round(downpayment).toLocaleString('vi-VN') + ' ₫';
  
  // Explanation breakdown
  let expHtml = `<strong>Công thức tính & Diễn giải:</strong><br><br>
  - Tổng ngân sách trả nợ: <strong>${Math.round(budgetTotal).toLocaleString('vi-VN')} ₫</strong><br>
  - Khoản nợ hiện tại: <strong>${Math.round(totalDebt).toLocaleString('vi-VN')} ₫</strong><br>
  - Khả năng trả nợ tối đa cho khoản vay mới: Ngân sách - Nợ hiện tại = <strong>${Math.round(maxMonthlyPayment).toLocaleString('vi-VN')} ₫/tháng</strong><br><br>`;
  
  if(interestRate > 0) {
    expHtml += `- Số tiền vay tối đa (Giá trị hiện tại - PV): Tính theo công thức niên kim với Lãi suất ${interestRate}%/năm và Kỳ hạn ${term} tháng.<br>`;
  } else {
    expHtml += `- Số tiền vay tối đa: Số tiền trả mỗi tháng × ${term} tháng (Lãi suất 0%).<br>`;
  }
  
  expHtml += `- Giá trị tài sản tối đa: Số tiền vay / ${ltv}% (Tỷ lệ cho vay LTV).<br>
  - Vốn tự có cần chuẩn bị: Giá trị tài sản - Số tiền vay tối đa.`;

  const expBox = document.getElementById('explanation-box');
  const btnExp = document.getElementById('btn-explanation');
  if(expBox) {
    expBox.innerHTML = expHtml;
    expBox.style.display = 'none';
    btnExp.innerText = 'Xem diễn giải chi tiết';
  }

  document.getElementById('result-section').style.display = 'block';
  if (!isFromLoad) {
    document.getElementById('result-section').scrollIntoView({behavior: 'smooth', block: 'end'});
  }
}

function toggleExplanation() {
  const box = document.getElementById('explanation-box');
  const btn = document.getElementById('btn-explanation');
  if (box.style.display === 'none') {
    box.style.display = 'block';
    btn.innerText = 'Ẩn diễn giải chi tiết';
  } else {
    box.style.display = 'none';
    btn.innerText = 'Xem diễn giải chi tiết';
  }
}

function resetForm() {
  clearData();
}
