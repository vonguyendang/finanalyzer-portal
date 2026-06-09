// Data for Packages removed

let loanCounter = 0;
let loansData = []; // Store calculated data for all loans
let cashflowChartIns = null;
let structureChartIns = null;

// Globals for combined data
let globalTotalPrincipalAll = 0;
let globalTotalInterestAll = 0;
let globalSumRemainAmountAll = 0;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  const loaded = loadData();
  if (!loaded) {
    addLoanForm(); // Add first loan form if no cache
  }
  
  // Delegate input/change events to save data
  const container = document.getElementById('loans-container');
  if (container) {
    container.addEventListener('input', saveData);
    container.addEventListener('change', saveData);
  }
});

function saveData() {
  const container = document.getElementById('loans-container');
  const blocks = container.querySelectorAll('.loan-form-block');
  const cacheData = [];
  
  blocks.forEach((block) => {
    const id = block.id.replace('loan-block-', '');
    
    // Dynamic Rates
    let dynamicRates = [];
    const rows = document.querySelectorAll(`#rate-rows-${id} .rate-row`);
    rows.forEach(row => {
      dynamicRates.push({
        from: row.querySelector('.rate-from').value,
        to: row.querySelector('.rate-to').value,
        val: row.querySelector('.rate-val').value,
        type: row.querySelector('.rate-type').value
      });
    });

    cacheData.push({
      amount: document.getElementById(`amount-${id}`).value,
      term: document.getElementById(`term-${id}`).value,
      startDate: document.getElementById(`startdate-${id}`).value,
      paydate: document.getElementById(`paydate-${id}`).value,
      method: document.getElementById(`method-${id}`).value,
      rateMode: document.getElementById(`ratemode-${id}`).value,
      rateFixed: document.getElementById(`rate-${id}`).value,
      rateFixedType: document.getElementById(`ratetype-${id}`).value,
      dynamicRates: dynamicRates
    });
  });
  
  localStorage.setItem('laivay_data', JSON.stringify(cacheData));
}

function loadData() {
  const dataStr = localStorage.getItem('laivay_data');
  if (dataStr) {
    try {
      const cacheData = JSON.parse(dataStr);
      if (cacheData && cacheData.length > 0) {
        document.getElementById('loans-container').innerHTML = '';
        loanCounter = 0;
        
        cacheData.forEach((loanCache) => {
          addLoanForm(); 
          const id = loanCounter - 1;
          
          document.getElementById(`amount-${id}`).value = loanCache.amount || '';
          document.getElementById(`term-${id}`).value = loanCache.term || '';
          if(loanCache.startDate) document.getElementById(`startdate-${id}`).value = loanCache.startDate;
          if(loanCache.paydate) document.getElementById(`paydate-${id}`).value = loanCache.paydate;
          if(loanCache.method) document.getElementById(`method-${id}`).value = loanCache.method;
          if(loanCache.rateMode) {
            document.getElementById(`ratemode-${id}`).value = loanCache.rateMode;
            toggleRateMode(id);
          }
          if(loanCache.rateFixed) document.getElementById(`rate-${id}`).value = loanCache.rateFixed;
          if(loanCache.rateFixedType) document.getElementById(`ratetype-${id}`).value = loanCache.rateFixedType;
          
          if (loanCache.dynamicRates && loanCache.dynamicRates.length > 0) {
            document.getElementById(`rate-rows-${id}`).innerHTML = '';
            window[`rateRows_${id}`] = 0;
            loanCache.dynamicRates.forEach(dr => {
              addRateRow(id, dr.from, dr.to, dr.val);
              const rows = document.querySelectorAll(`#rate-rows-${id} .rate-row`);
              const lastRow = rows[rows.length - 1];
              if (lastRow && dr.type) {
                lastRow.querySelector('.rate-type').value = dr.type;
              }
            });
          }
          
          calcEndDate(id);
          updateRateText(id);
        });
        return true;
      }
    } catch(e) {
      console.error(e);
    }
  }
  return false;
}

function clearData() {
  if(!confirm('Bạn có chắc chắn muốn xóa toàn bộ dữ liệu đã nhập?')) return;
  localStorage.removeItem('laivay_data');
  document.getElementById('loans-container').innerHTML = '';
  loanCounter = 0;
  addLoanForm();
  document.getElementById('report-section').style.display = 'none';
  window.scrollTo({top: 0, behavior: 'smooth'});
}

// Accordion Toggle
function toggleAccordion(headerElement) {
  const item = headerElement.parentElement;
  item.classList.toggle('expanded');
}

function addLoanForm() {
  const container = document.getElementById('loans-container');
  const id = loanCounter++;
  
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  const html = `
    <div class="loan-form-block" id="loan-block-${id}">
      <div class="loan-form-header">
        <div class="loan-form-title">
          <span class="badge">${id + 1}</span> Khoản vay ${id + 1}
        </div>
        ${id > 0 ? '<button type="button" class="btn-remove-loan" onclick="removeLoanForm(' + id + ')" title="Xóa khoản vay">🗑</button>' : ''}
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label>Số tiền vay</label>
          <div class="input-group">
            <input type="text" id="amount-${id}" class="num-format" placeholder="VD: 1.000.000.000" value="">
            <span class="suffix">VNĐ</span>
          </div>
        </div>
        <div class="form-group">
          <label>Kỳ hạn</label>
          <div class="input-group">
            <input type="number" id="term-${id}" placeholder="VD: 12" value="">
            <span class="suffix">Tháng</span>
          </div>
        </div>
        <div class="form-group">
          <label>Ngày giải ngân</label>
          <input type="date" id="startdate-${id}" class="form-control" value="${todayStr}" onchange="calcEndDate(${id})">
        </div>
        <div class="form-group">
          <label>Ngày đáo hạn</label>
          <input type="date" id="enddate-${id}" class="form-control" readonly style="background:var(--bg2)">
        </div>
        
        <div class="form-group">
          <label>Ngày trả lãi hàng tháng</label>
          <select id="paydate-${id}" class="form-control">
            <option value="last">Cuối tháng</option>
            ${Array.from({length: 31}, (_, i) => i + 1).map(d => '<option value="' + d + '">Ngày ' + d + '</option>').join('')}
          </select>
        </div>
        
        <div class="form-group">
          <label>Cách tính lãi <span style="color:#ff4757">*</span></label>
          <select id="method-${id}" class="form-control">
            <option value="reducing">Dư nợ giảm dần</option>
            <option value="flat">Lãi phẳng (Gốc ban đầu)</option>
          </select>
        </div>
        
        <div class="form-group" style="grid-column: span 2;">
          <label style="display:flex; justify-content:space-between; align-items:center;">
            Lãi suất
            <select class="rate-type-select" id="ratemode-${id}" onchange="toggleRateMode(${id})">
              <option value="fixed">Cố định</option>
              <option value="dynamic">Tùy chỉnh (thả nổi)</option>
            </select>
          </label>
          
          <div id="rate-fixed-block-${id}">
            <div class="input-group">
              <input type="number" id="rate-${id}" step="0.1" placeholder="8.0" value="" oninput="updateRateText(${id})">
              <select class="suffix" style="border:none; outline:none; background:transparent" id="ratetype-${id}" onchange="updateRateText(${id})">
                <option value="year">%/Năm</option>
                <option value="month">%/Tháng</option>
              </select>
            </div>
            <div style="font-size:11px; color:#3498db; margin-top:4px" id="rate-hint-${id}">(Tương đương 0.67%/tháng)</div>
          </div>
          
          <div id="rate-dynamic-block-${id}" class="rate-dynamic-container" style="display:none;">
            <div id="rate-rows-${id}">
               <!-- Dynamic rows will be added here -->
            </div>
            <button type="button" class="btn-add-rate" onclick="addRateRow(${id})">+ Thêm khoảng thời gian</button>
          </div>
          
        </div>
      </div>
    </div>
  `;
  container.insertAdjacentHTML('beforeend', html);
  
  // Format numbers
  document.getElementById(`amount-${id}`).addEventListener('input', function(e) {
    let val = this.value.replace(/\./g, '').replace(/[^0-9]/g, '');
    if(val) {
      this.value = parseInt(val, 10).toLocaleString('vi-VN').replace(/,/g, '.');
    }
  });

  // Calculate End Date initially
  calcEndDate(id);
  updateRateText(id);
  
  document.getElementById(`term-${id}`).addEventListener('input', function() {
    calcEndDate(id);
    let termVal = parseInt(this.value) || 0;
    if(termVal > 0) {
      let rows = document.querySelectorAll(`#rate-rows-${id} .rate-row`);
      if(rows.length === 1) {
        let firstToInput = rows[0].querySelector('.rate-to');
        if(firstToInput) firstToInput.value = termVal;
      }
    }
  });
  
  // Initialize dynamic rate rows
  window[`rateRows_${id}`] = 0;
  addRateRow(id, 1, '', '');
}

function toggleRateMode(id) {
  const mode = document.getElementById(`ratemode-${id}`).value;
  if(mode === 'fixed') {
    document.getElementById(`rate-fixed-block-${id}`).style.display = 'block';
    document.getElementById(`rate-dynamic-block-${id}`).style.display = 'none';
  } else {
    document.getElementById(`rate-fixed-block-${id}`).style.display = 'none';
    document.getElementById(`rate-dynamic-block-${id}`).style.display = 'flex';
  }
}

function addRateRow(id, defaultFrom = '', defaultTo = '', defaultRate = '') {
  const container = document.getElementById(`rate-rows-${id}`);
  const term = parseInt(document.getElementById(`term-${id}`).value) || 0;
  
  if (defaultFrom === '') {
    const existingRows = container.querySelectorAll('.rate-row');
    if (existingRows.length > 0) {
      const lastRow = existingRows[existingRows.length - 1];
      const lastTo = parseInt(lastRow.querySelector('.rate-to').value);
      if (!isNaN(lastTo)) {
        defaultFrom = lastTo + 1;
        if (defaultFrom > term && term > 0) defaultFrom = term;
      }
    }
  }
  
  if (defaultTo === '') {
    defaultTo = term || '';
  }

  const rowId = window[`rateRows_${id}`]++;
  
  const div = document.createElement('div');
  div.className = 'rate-row';
  div.id = `rate-row-${id}-${rowId}`;
  div.innerHTML = `
    <span>Từ tháng</span>
    <input type="number" class="rate-from" value="${defaultFrom}">
    <span>đến</span>
    <input type="number" class="rate-to" value="${defaultTo}">
    <span>Lãi %</span>
    <input type="number" step="0.1" class="rate-val" value="${defaultRate}">
    <select class="rate-type">
      <option value="year">/Năm</option>
      <option value="month">/Tháng</option>
    </select>
    <button type="button" class="btn-remove-rate" onclick="document.getElementById('rate-row-${id}-${rowId}').remove()">🗑</button>
  `;
  
  container.appendChild(div);
}


function removeLoanForm(id) {
  const el = document.getElementById(`loan-block-${id}`);
  if(el) el.remove();
  saveData();
}

function calcEndDate(id) {
  const startVal = document.getElementById(`startdate-${id}`).value;
  const termVal = parseInt(document.getElementById(`term-${id}`).value) || 0;
  if(startVal && termVal > 0) {
    let date = new Date(startVal);
    date.setMonth(date.getMonth() + termVal);
    document.getElementById(`enddate-${id}`).value = date.toISOString().split('T')[0];
  }
}

function updateRateText(id) {
  const rate = parseFloat(document.getElementById(`rate-${id}`).value) || 0;
  const type = document.getElementById(`ratetype-${id}`).value;
  const hint = document.getElementById(`rate-hint-${id}`);
  
  if(type === 'year') {
    hint.innerText = `(Tương đương ${(rate/12).toFixed(2)}%/tháng)`;
  } else {
    hint.innerText = `(Tương đương ${(rate*12).toFixed(2)}%/năm)`;
  }
}

// --- Calculation Engine ---
function calculateAllLoans() {
  const container = document.getElementById('loans-container');
  const blocks = container.querySelectorAll('.loan-form-block');
  
  loansData = [];
  let totalPrincipalAll = 0;
  let totalInterestAll = 0;
  let sumRemainAmountAll = 0;
  let hasError = false;
  
  // For charts
  let combinedSchedule = [];
  
  blocks.forEach((block, index) => {
    const id = block.id.replace('loan-block-', '');
    
    let amountStr = document.getElementById(`amount-${id}`).value.replace(/\./g, '');
    const amount = parseFloat(amountStr) || 0;
    const term = parseInt(document.getElementById(`term-${id}`).value) || 0;
    const startDateStr = document.getElementById(`startdate-${id}`).value;
    const method = document.getElementById(`method-${id}`).value;
    const paydateSetting = document.getElementById(`paydate-${id}`).value;
    const rateMode = document.getElementById(`ratemode-${id}`).value;
    
    if(amount === 0 || term === 0) return;
    if(hasError) return;
    
    // Parse Dynamic Rates
    let dynamicRates = [];
    if(rateMode === 'dynamic') {
      const rows = document.querySelectorAll(`#rate-rows-${id} .rate-row`);
      rows.forEach(row => {
        let from = parseInt(row.querySelector('.rate-from').value) || 1;
        let to = parseInt(row.querySelector('.rate-to').value) || term;
        let rVal = parseFloat(row.querySelector('.rate-val').value) || 0;
        let rType = row.querySelector('.rate-type').value;
        dynamicRates.push({from, to, val: rVal, type: rType});
      });
      
      // Validate that all months are covered
      let missingMonth = 0;
      for (let m = 1; m <= term; m++) {
        let r = [...dynamicRates].reverse().find(dr => m >= dr.from && m <= dr.to);
        if (!r) {
          missingMonth = m;
          break;
        }
      }
      if (missingMonth > 0) {
        alert(`Khoản vay ${index + 1}: Bạn chưa nhập lãi suất cho tháng ${missingMonth}. Vui lòng nhập đầy đủ hoặc kiểm tra lại thiết lập thả nổi.`);
        hasError = true;
        return;
      }
    } else {
      const rateInput = parseFloat(document.getElementById(`rate-${id}`).value) || 0;
      const rateType = document.getElementById(`ratetype-${id}`).value;
      dynamicRates.push({from: 1, to: term, val: rateInput, type: rateType});
    }
    
    // Helper to get rate for a specific month
    const getRateForMonth = (m) => {
      let r = [...dynamicRates].reverse().find(dr => m >= dr.from && m <= dr.to);
      return r.type === 'year' ? r.val / 12 / 100 : r.val / 100;
    };
    
    let schedule = [];
    let totalInterest = 0;
    let sumRemainAmountLoan = 0;
    let remainAmount = amount;
    let principalMonth = amount / term;
    
    let startDate = new Date(startDateStr);
    
    for(let i = 1; i <= term; i++) {
      let currentRateMonth = getRateForMonth(i);
      
      let interestMonth = 0;
      if(method === 'reducing') {
        interestMonth = remainAmount * currentRateMonth;
      } else {
        interestMonth = amount * currentRateMonth;
      }
      
      let totalPayMonth = principalMonth + interestMonth;
      totalInterest += interestMonth;
      sumRemainAmountAll += remainAmount;
      sumRemainAmountLoan += remainAmount;
      
      // Calculate payment date based on settings
      let payDate = new Date(startDate);
      payDate.setMonth(payDate.getMonth() + i);
      
      if(paydateSetting !== 'last') {
        let desiredDay = parseInt(paydateSetting);
        // If the month doesn't have this day (e.g., Feb 30), it will overflow to next month
        // To prevent this, set to the max day of the month
        let targetMonth = payDate.getMonth();
        payDate.setDate(desiredDay);
        while(payDate.getMonth() !== targetMonth && payDate.getMonth() !== (targetMonth+1)%12) {
            payDate.setDate(payDate.getDate() - 1);
        }
      } else {
        // Last day of month
        payDate.setMonth(payDate.getMonth() + 1);
        payDate.setDate(0);
      }
      
      schedule.push({
        period: i,
        date: payDate.toLocaleDateString('vi-VN'),
        principal: principalMonth,
        interest: interestMonth,
        total: totalPayMonth,
        remain: remainAmount - principalMonth > 0 ? remainAmount - principalMonth : 0
      });
      
      remainAmount -= principalMonth;
    }
    
    totalPrincipalAll += amount;
    totalInterestAll += totalInterest;
    
    loansData.push({
      index: index + 1,
      amount: amount,
      term: term,
      totalInterest: totalInterest,
      sumRemainAmount: sumRemainAmountLoan,
      schedule: schedule,
      // Input Data
      startDate: startDateStr,
      method: method,
      paydateSetting: paydateSetting,
      rateMode: rateMode,
      dynamicRates: dynamicRates
    });
  });
  
  if(hasError) return;
  if(loansData.length === 0) return;
  
  globalTotalPrincipalAll = totalPrincipalAll;
  globalTotalInterestAll = totalInterestAll;
  globalSumRemainAmountAll = sumRemainAmountAll;
  
  // Render UI
  document.getElementById('report-section').style.display = 'block';
  
  // Render Tables (which will also render Overview and Charts)
  renderTableTabs();
  
  // Scroll to report
  document.getElementById('report-section').scrollIntoView({behavior: 'smooth', block: 'start'});
}

function renderAdvice(avgRate) {
  const box = document.getElementById('advice-box');
  const content = document.getElementById('advice-content');
  box.style.display = 'flex';
  
  if(avgRate > 12) {
    content.innerHTML = `Lãi suất bình quân của bạn đang ở mức <b>${avgRate.toFixed(2)}%</b>, khá cao so với mặt bằng chung. Hệ thống khuyến nghị bạn nên đàm phán lại hoặc tham khảo các ngân hàng khác có lãi suất từ <b>6.9% - 8.5%</b> để tiết kiệm chi phí lãi vay.`;
  } else {
    content.innerHTML = `Lãi suất bình quân của bạn đang ở mức <b>${avgRate.toFixed(2)}%</b>, đây là mức lãi suất khá tốt và ổn định so với mặt bằng chung thị trường hiện nay.`;
  }
}

function renderCharts(labels, principalData, interestData, totalP, totalI) {
  // Bar Chart
  const ctxCashflow = document.getElementById('cashflowChart').getContext('2d');
  if(cashflowChartIns) cashflowChartIns.destroy();
  
  cashflowChartIns = new Chart(ctxCashflow, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Gốc vay',
          data: principalData,
          backgroundColor: '#00b894',
          stack: 'Stack 0',
        },
        {
          label: 'Lãi phải trả',
          data: interestData,
          backgroundColor: '#f39c12',
          stack: 'Stack 0',
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked: true },
        y: { stacked: true }
      },
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
  
  // Doughnut Chart
  const ctxStructure = document.getElementById('structureChart').getContext('2d');
  if(structureChartIns) structureChartIns.destroy();
  
  structureChartIns = new Chart(ctxStructure, {
    type: 'doughnut',
    data: {
      labels: ['Gốc vay', 'Lãi phải trả'],
      datasets: [{
        data: [totalP, totalI],
        backgroundColor: ['#00b894', '#f39c12'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}

function renderTableTabs() {
  const tabsContainer = document.getElementById('table-tabs');
  
  if(loansData.length > 1) {
    tabsContainer.style.display = 'flex';
    tabsContainer.innerHTML = '';
    
    // Add "Tổng hợp" tab
    const allBtn = document.createElement('button');
    allBtn.className = 'table-tab-btn active';
    allBtn.innerText = 'Tổng Hợp Dòng Tiền';
    allBtn.onclick = () => switchTableTab('all');
    tabsContainer.appendChild(allBtn);
    
    loansData.forEach(loan => {
      const btn = document.createElement('button');
      btn.className = 'table-tab-btn';
      btn.innerText = `Khoản vay ${loan.index}`;
      btn.onclick = () => switchTableTab(loan.index);
      tabsContainer.appendChild(btn);
    });
    
  } else {
    tabsContainer.style.display = 'none';
  }
  
  // Render default first
  switchTableTab(loansData.length > 1 ? 'all' : 1);
}

function switchTableTab(tabId) {
  // Update UI
  const btns = document.querySelectorAll('.table-tab-btn');
  btns.forEach(b => b.classList.remove('active'));
  event && event.target && event.target.classList.add('active'); // Event might be undefined on initial load
  if(!event) {
    if(btns.length > 0) btns[0].classList.add('active');
  }

  const tbody = document.getElementById('schedule-tbody');
  tbody.innerHTML = '';
  
  let dataToRender = [];
  let targetPrincipal = 0;
  let targetInterest = 0;
  let targetRemainAmount = 0;
  
  if(tabId === 'all') {
    targetPrincipal = globalTotalPrincipalAll;
    targetInterest = globalTotalInterestAll;
    targetRemainAmount = globalSumRemainAmountAll;
    
    // Merge data by date
    let mergedMap = {};
    loansData.forEach(loan => {
      loan.schedule.forEach(row => {
        if(!mergedMap[row.date]) mergedMap[row.date] = { principal: 0, interest: 0, total: 0, remain: 0 };
        mergedMap[row.date].principal += row.principal;
        mergedMap[row.date].interest += row.interest;
        mergedMap[row.date].total += row.total;
        mergedMap[row.date].remain += row.remain; // remain is approx sum
      });
    });
    
    const parseDate = str => new Date(str.split('/')[2], str.split('/')[1] - 1, str.split('/')[0]);
    const sortedDates = Object.keys(mergedMap).sort((a,b) => parseDate(a) - parseDate(b));
    
    let period = 1;
    sortedDates.forEach(date => {
      dataToRender.push({
        period: period++,
        date: date,
        ...mergedMap[date]
      });
    });
  } else {
    const loan = loansData.find(l => l.index === parseInt(tabId));
    if(loan) {
      dataToRender = loan.schedule;
      targetPrincipal = loan.amount;
      targetInterest = loan.totalInterest;
      targetRemainAmount = loan.sumRemainAmount;
    }
  }

  // --- OVERVIEW & CHARTS UPDATE ---
  let maxMonthAmount = 0;
  let maxMonthDate = '';
  let chartLabels = [];
  let chartPrincipal = [];
  let chartInterest = [];
  
  dataToRender.forEach(row => {
    if(row.total > maxMonthAmount) {
      maxMonthAmount = row.total;
      maxMonthDate = row.date;
    }
    chartLabels.push(row.date);
    chartPrincipal.push(row.principal);
    chartInterest.push(row.interest);
  });
  
  let targetAvgRate = 0;
  if(targetRemainAmount > 0) {
    targetAvgRate = (targetInterest / targetRemainAmount) * 12 * 100;
  }
  
  document.getElementById('s-total-principal').innerText = formatCurrency(targetPrincipal);
  document.getElementById('s-total-interest').innerText = formatCurrency(targetInterest);
  document.getElementById('s-interest-percent').innerText = targetPrincipal > 0 ? `chiếm ${((targetInterest/targetPrincipal)*100).toFixed(1)}% tổng nợ` : '';
  document.getElementById('s-avg-rate').innerText = `${targetAvgRate.toFixed(2)}%`;
  document.getElementById('s-max-month-amount').innerText = formatCurrency(maxMonthAmount);
  document.getElementById('s-max-month-date').innerText = maxMonthDate;
  
  renderAdvice(targetAvgRate);
  renderCharts(chartLabels, chartPrincipal, chartInterest, targetPrincipal, targetInterest);
  
  // --- TABLE UPDATE ---
  
  dataToRender.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.period}</td>
      <td>${row.date}</td>
      <td>${formatCurrency(row.principal)}</td>
      <td>${formatCurrency(row.interest)}</td>
      <td>${formatCurrency(row.total)}</td>
      <td>${formatCurrency(row.remain)}</td>
    `;
    tbody.appendChild(tr);
  });
}

function formatCurrency(num) {
  return Math.round(num).toLocaleString('vi-VN') + ' ₫';
}

function exportToExcel() {
  if(loansData.length === 0) return alert('Vui lòng tính toán trước khi tải báo cáo!');
  
  let wb = XLSX.utils.book_new();
  
  // 1. Sheet Tổng Hợp
  let sumData = [
    ['BÁO CÁO TỔNG HỢP CÁC KHOẢN VAY'],
    [''],
    ['Tổng số khoản vay:', loansData.length],
    ['Tổng gốc vay:', Math.round(globalTotalPrincipalAll)],
    ['Tổng lãi phải trả:', Math.round(globalTotalInterestAll)],
    ['Tổng tiền phải trả:', Math.round(globalTotalPrincipalAll + globalTotalInterestAll)],
    ['Lãi suất bình quân (ước tính):', globalSumRemainAmountAll > 0 ? ((globalTotalInterestAll / globalSumRemainAmountAll) * 12 * 100).toFixed(2) + '%' : '0%'],
    [''],
    ['Chi tiết các khoản vay:'],
    ['Khoản vay', 'Gốc vay', 'Thời hạn (tháng)', 'Tổng lãi', 'Tổng phải trả']
  ];
  
  loansData.forEach(loan => {
    sumData.push([
      `Khoản vay ${loan.index}`,
      Math.round(loan.amount),
      loan.term,
      Math.round(loan.totalInterest),
      Math.round(loan.amount + loan.totalInterest)
    ]);
  });
  
  let sumWs = XLSX.utils.aoa_to_sheet(sumData);
  sumWs['!cols'] = [{wch: 25}, {wch: 20}, {wch: 20}, {wch: 20}, {wch: 20}];
  XLSX.utils.book_append_sheet(wb, sumWs, 'TongHop');
  
  // 2. Sheets chi tiết cho từng khoản vay
  loansData.forEach(loan => {
    let loanAvgRate = loan.sumRemainAmount > 0 ? ((loan.totalInterest / loan.sumRemainAmount) * 12 * 100).toFixed(2) + '%' : '0%';
    let methodStr = loan.method === 'reducing' ? 'Dư nợ giảm dần' : 'Lãi phẳng (Cố định theo dư nợ gốc)';
    let paydateStr = loan.paydateSetting === 'last' ? 'Ngày cuối cùng của tháng' : `Ngày ${loan.paydateSetting} hàng tháng`;
    let startDateFmt = new Date(loan.startDate).toLocaleDateString('vi-VN');
    
    let wsData = [
      ['THÔNG TIN KHOẢN VAY'],
      ['Gốc vay:', Math.round(loan.amount)],
      ['Thời gian vay (tháng):', loan.term],
      ['Ngày giải ngân:', startDateFmt],
      ['Cách tính lãi:', methodStr],
      ['Ngày trả nợ:', paydateStr],
    ];
    
    // Add dynamic rates
    wsData.push(['Lãi suất áp dụng:']);
    loan.dynamicRates.forEach(r => {
      let rTypeName = r.type === 'year' ? '%/Năm' : '%/Tháng';
      wsData.push(['', `Từ kỳ ${r.from} đến kỳ ${r.to}:`, `${r.val} ${rTypeName}`]);
    });
    
    wsData.push(['']);
    wsData.push(['KẾT QUẢ TÍNH TOÁN']);
    wsData.push(['Tổng lãi phải trả:', Math.round(loan.totalInterest)]);
    wsData.push(['Tổng phải trả:', Math.round(loan.amount + loan.totalInterest)]);
    wsData.push(['Lãi suất bình quân:', loanAvgRate]);
    wsData.push(['']);
    wsData.push(['LỊCH TRẢ NỢ CHI TIẾT']);
    wsData.push(['Kỳ', 'Ngày dự kiến', 'Tổng gốc', 'Tổng lãi', 'Tổng phải trả', 'Dư nợ còn lại']);
    
    loan.schedule.forEach(row => {
      wsData.push([
        row.period,
        row.date,
        Math.round(row.principal),
        Math.round(row.interest),
        Math.round(row.total),
        Math.round(row.remain)
      ]);
    });
    
    // Add summary row
    wsData.push([
      'TỔNG', 
      '', 
      Math.round(loan.amount), 
      Math.round(loan.totalInterest), 
      Math.round(loan.amount + loan.totalInterest), 
      ''
    ]);
    
    let ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = [{wch: 10}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 15}];
    XLSX.utils.book_append_sheet(wb, ws, `KhoanVay_${loan.index}`);
  });
  
  XLSX.writeFile(wb, 'BaoCaoLaiVay_ChiTiet.xlsx');
}
