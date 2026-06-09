let growthChartIns = null;
let pieChartIns = null;
let scheduleData = [];

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

function toggleCustomTerm() {
  const select = document.getElementById('term-select');
  const customInput = document.getElementById('term-custom');
  const customType = document.getElementById('term-custom-type');
  
  if (select.value === 'custom') {
    customInput.style.display = 'inline-block';
    customType.style.display = 'inline-block';
  } else {
    customInput.style.display = 'none';
    customType.style.display = 'none';
  }
}

document.querySelectorAll('input[name="rollover"]').forEach(radio => {
  radio.addEventListener('change', function() {
    const expectedGroup = document.getElementById('expected-time-group');
    if (this.value === 'none') {
      expectedGroup.style.display = 'none';
    } else {
      expectedGroup.style.display = 'block';
    }
  });
});

function updateInterestConverted() {
  const rateInput = document.getElementById('interest-rate').value;
  const unit = document.getElementById('interest-unit').value;
  const display = document.getElementById('interest-converted');
  
  if (!rateInput) {
    display.innerText = '';
    return;
  }
  
  const rate = parseFloat(rateInput);
  if (unit === 'year') {
    const monthly = (rate / 12).toFixed(3);
    display.innerText = `~ ${monthly}% / tháng`;
  } else {
    const yearly = (rate * 12).toFixed(2);
    display.innerText = `= ${yearly}% / năm`;
  }
}

// Initial call to set correctly
updateInterestConverted();

function calculateResult() {
  const amount = getNumericValue('amount');
  let interestRateInput = parseFloat(document.getElementById('interest-rate').value) || 0;
  const interestUnit = document.getElementById('interest-unit').value;
  
  // Normalize interestRate to Yearly
  let interestRateYearly = interestRateInput;
  if (interestUnit === 'month') {
    interestRateYearly = interestRateInput * 12;
  }
  
  if(amount <= 0) return alert('Vui lòng nhập số tiền gửi hợp lệ!');
  if(interestRateYearly <= 0) return alert('Vui lòng nhập lãi suất hợp lệ!');

  // Lấy kỳ hạn gốc (của 1 sổ tiết kiệm)
  const termSelect = document.getElementById('term-select').value;
  let termDays = 0;
  let termMonths = 0;
  let termLabel = '';
  
  if(termSelect === 'custom') {
    const customVal = parseInt(document.getElementById('term-custom').value) || 0;
    const customType = document.getElementById('term-custom-type').value;
    if(customVal <= 0) return alert('Vui lòng nhập kỳ hạn hợp lệ!');
    
    if(customType === 'day') {
      termDays = customVal;
      termMonths = customVal / 30; // Approx for loop limits
      termLabel = `${customVal} ngày`;
    } else {
      termMonths = customVal;
      termDays = customVal * 30; // Standardize for bank interest (some use 365, but 1 month ~ 30d)
      termLabel = `${customVal} tháng`;
    }
  } else {
    termMonths = parseInt(termSelect);
    termDays = termMonths * 30; 
    termLabel = `${termMonths} tháng`;
  }
  
  const rolloverType = document.querySelector('input[name="rollover"]:checked').value;
  
  // Tính tổng thời gian dự kiến (để lập bảng)
  let expectedMonths = 0;
  if(rolloverType === 'none') {
    expectedMonths = termMonths;
  } else {
    const expVal = parseFloat(document.getElementById('expected-term').value) || 0;
    const expType = document.getElementById('expected-term-type').value;
    expectedMonths = expType === 'year' ? expVal * 12 : expVal;
  }
  
  // Tính số chu kỳ tái tục
  let totalCycles = 1;
  if(rolloverType !== 'none' && termMonths > 0) {
    totalCycles = Math.floor(expectedMonths / termMonths);
    if(totalCycles < 1) totalCycles = 1; // At least 1 cycle
  }
  
  // Reset data
  scheduleData = [];
  let currentPrincipal = amount;
  let totalInterestAccumulated = 0;
  
  let chartLabels = [];
  let chartPrincipal = [];
  let chartInterest = [];
  
  for(let i = 1; i <= totalCycles; i++) {
    // Interest formula: (Principal * Rate * Days) / 365. Many banks use 365.
    // For exact month, it's simpler: Principal * Rate * (Months/12)
    // We use the exact month formula if it's month-based to avoid 30/365 discrepancies
    let cycleInterest = 0;
    if (termSelect === 'custom' && document.getElementById('term-custom-type').value === 'day') {
       cycleInterest = currentPrincipal * (interestRateYearly / 100) * (termDays / 365);
    } else {
       cycleInterest = currentPrincipal * (interestRateYearly / 100) * (termMonths / 12);
    }
    
    let payout = 0;
    let endBalance = currentPrincipal;
    
    if(rolloverType === 'none') {
      payout = currentPrincipal + cycleInterest;
      endBalance = 0;
      totalInterestAccumulated += cycleInterest;
    } else if (rolloverType === 'principal') {
      payout = cycleInterest;
      // endBalance remains currentPrincipal
      totalInterestAccumulated += cycleInterest;
    } else if (rolloverType === 'both') {
      payout = 0; // nothing withdrawn
      endBalance = currentPrincipal + cycleInterest;
      totalInterestAccumulated += cycleInterest;
    }
    
    scheduleData.push({
      cycle: i,
      month: Math.round(i * termMonths),
      startPrincipal: currentPrincipal,
      interest: cycleInterest,
      payout: payout,
      endBalance: endBalance
    });
    
    chartLabels.push(`Kỳ ${i}`);
    chartPrincipal.push(currentPrincipal);
    chartInterest.push(rolloverType === 'both' ? (endBalance - amount) : totalInterestAccumulated);
    
    // Set for next cycle
    if(rolloverType === 'both') {
      currentPrincipal = endBalance; // Compound interest
    }
  }
  
  // Final summary
  const finalTotal = amount + totalInterestAccumulated;
  let yieldRate = (totalInterestAccumulated / amount) * 100;
  
  document.getElementById('res-principal').innerText = Math.round(amount).toLocaleString('vi-VN') + ' ₫';
  document.getElementById('res-interest').innerText = Math.round(totalInterestAccumulated).toLocaleString('vi-VN') + ' ₫';
  document.getElementById('res-interest-rate').innerText = `Tỷ suất sinh lời: ${yieldRate.toFixed(2)}%`;
  document.getElementById('res-total').innerText = Math.round(finalTotal).toLocaleString('vi-VN') + ' ₫';
  document.getElementById('res-duration').innerText = `Sau ${Math.round(totalCycles * termMonths)} tháng`;
  
  document.getElementById('report-section').style.display = 'block';
  
  renderTable();
  renderCharts(chartLabels, chartPrincipal, chartInterest, amount, totalInterestAccumulated);
  
  document.getElementById('report-section').scrollIntoView({behavior: 'smooth', block: 'start'});
}

function renderTable() {
  const tbody = document.getElementById('schedule-tbody');
  tbody.innerHTML = '';
  document.getElementById('table-area').style.display = 'block';
  
  scheduleData.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.cycle}</td>
      <td>Tháng ${row.month}</td>
      <td>${Math.round(row.startPrincipal).toLocaleString('vi-VN')}</td>
      <td>${Math.round(row.interest).toLocaleString('vi-VN')}</td>
      <td>${Math.round(row.payout).toLocaleString('vi-VN')}</td>
      <td>${Math.round(row.endBalance).toLocaleString('vi-VN')}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderCharts(labels, principalData, interestData, startP, totalI) {
  document.getElementById('chart-area').style.display = 'flex';
  
  // Bar Chart
  const ctxGrowth = document.getElementById('growthChart').getContext('2d');
  if(growthChartIns) growthChartIns.destroy();
  
  growthChartIns = new Chart(ctxGrowth, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Gốc ban đầu / Gốc đã nhập lãi',
          data: principalData,
          backgroundColor: '#0984e3',
          stack: 'Stack 0',
        },
        {
          label: 'Lãi tích lũy',
          data: interestData,
          backgroundColor: '#00b894',
          stack: 'Stack 0',
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { 
          stacked: true,
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: 'rgba(255,255,255,0.7)' }
        },
        y: { 
          stacked: true,
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: 'rgba(255,255,255,0.7)' }
        }
      },
      plugins: {
        legend: { 
          position: 'bottom',
          labels: { color: 'rgba(255,255,255,0.8)' }
        }
      }
    }
  });
  
  // Doughnut Chart
  const ctxPie = document.getElementById('pieChart').getContext('2d');
  if(pieChartIns) pieChartIns.destroy();
  
  let totalAmount = startP + totalI;
  let pPercent = totalAmount > 0 ? ((startP / totalAmount) * 100).toFixed(1) : 0;
  let iPercent = totalAmount > 0 ? ((totalI / totalAmount) * 100).toFixed(1) : 0;

  pieChartIns = new Chart(ctxPie, {
    type: 'doughnut',
    data: {
      labels: [`Tiền Gốc (${pPercent}%)`, `Tiền Lãi (${iPercent}%)`],
      datasets: [{
        data: [startP, totalI],
        backgroundColor: ['#0984e3', '#00b894'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: { 
          position: 'bottom',
          labels: { color: 'rgba(255,255,255,0.8)' }
        }
      }
    }
  });
}

function exportToExcel() {
  if(scheduleData.length === 0) return alert('Vui lòng tính toán trước khi tải báo cáo!');
  
  let wb = XLSX.utils.book_new();
  
  // Lấy thông tin đầu vào
  const amount = getNumericValue('amount');
  const termSelect = document.getElementById('term-select').options[document.getElementById('term-select').selectedIndex].text;
  const interestRate = document.getElementById('interest-rate').value;
  const interestUnit = document.getElementById('interest-unit').options[document.getElementById('interest-unit').selectedIndex].text;
  
  const rolloverMap = {
    'none': 'Không tái tục (Rút cả gốc và lãi)',
    'principal': 'Tái tục gốc (Rút lãi)',
    'both': 'Tái tục gốc & lãi (Lãi kép)'
  };
  const rolloverType = document.querySelector('input[name="rollover"]:checked').value;
  
  const resPrincipal = document.getElementById('res-principal').innerText;
  const resInterest = document.getElementById('res-interest').innerText;
  const resTotal = document.getElementById('res-total').innerText;
  const resInterestRate = document.getElementById('res-interest-rate').innerText;
  
  let wsData = [
    ['BẢNG TÍNH LÃI TIỀN GỬI TIẾT KIỆM'],
    [],
    ['I. THÔNG TIN GỬI TIẾT KIỆM'],
    ['Số tiền gửi ban đầu:', amount.toLocaleString('vi-VN') + ' ₫'],
    ['Kỳ hạn gửi:', termSelect === 'Khác...' ? document.getElementById('term-custom').value + ' ' + document.getElementById('term-custom-type').options[document.getElementById('term-custom-type').selectedIndex].text : termSelect],
    ['Lãi suất:', `${interestRate} ${interestUnit}`],
    ['Hình thức tái tục:', rolloverMap[rolloverType]],
    [],
    ['II. TỔNG QUAN KẾT QUẢ'],
    ['Tổng tiền gửi ban đầu:', resPrincipal],
    ['Tổng lãi nhận được:', resInterest],
    ['Tổng gốc lãi cuối kỳ:', resTotal],
    ['Hiệu quả đầu tư:', resInterestRate],
    [],
    ['III. CHI TIẾT DÒNG TIỀN (LỊCH NHẬN LÃI)'],
    ['Kỳ tái tục', 'Thời điểm (Tháng)', 'Số dư đầu kỳ', 'Tiền lãi phát sinh', 'Tiền rút ra', 'Số dư cuối kỳ']
  ];
  
  scheduleData.forEach(row => {
    wsData.push([
      row.cycle,
      row.month,
      Math.round(row.startPrincipal),
      Math.round(row.interest),
      Math.round(row.payout),
      Math.round(row.endBalance)
    ]);
  });
  
  let ws = XLSX.utils.aoa_to_sheet(wsData);
  
  // Style the worksheet a bit (Optional, aoa_to_sheet creates raw data, but column widths help)
  ws['!cols'] = [
    {wch: 15}, // Kỳ tái tục
    {wch: 25}, // Thời điểm
    {wch: 20}, // Số dư đầu
    {wch: 20}, // Lãi phát sinh
    {wch: 20}, // Tiền rút ra
    {wch: 20}  // Dư cuối kỳ
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, "Bang_Tinh_Lai");
  XLSX.writeFile(wb, "Bang_Tinh_Lai_Tiet_Kiem.xlsx");
}
