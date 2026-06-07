// Dữ liệu Hệ số trượt giá 2026
const truotGia = {
  "Truoc1995": 5.81, "1995": 4.91, "1996": 4.65, "1997": 4.5, "1998": 4.18, "1999": 4.01,
  "2000": 4.07, "2001": 4.09, "2002": 3.94, "2003": 3.81, "2004": 3.54, "2005": 3.27,
  "2006": 3.05, "2007": 2.29, "2008": 2.81, "2009": 2.14, "2010": 1.96, "2011": 1.65,
  "2012": 1.51, "2013": 1.42, "2014": 1.36, "2015": 1.36, "2016": 1.32, "2017": 1.28,
  "2018": 1.23, "2019": 1.2, "2020": 1.16, "2021": 1.14, "2022": 1.11, "2023": 1.07,
  "2024": 1.03, "2025": 1.0, "2026": 1.0
};

const truotGiaTuNguyen = {
  "2008": 2.29, "2009": 2.14, "2010": 1.96, "2011": 1.65,
  "2012": 1.51, "2013": 1.42, "2014": 1.36, "2015": 1.36, "2016": 1.32, "2017": 1.28,
  "2018": 1.23, "2019": 1.2, "2020": 1.16, "2021": 1.14, "2022": 1.11, "2023": 1.07,
  "2024": 1.03, "2025": 1.0, "2026": 1.0
};

// Render Bảng trượt giá Bắt buộc
function renderTruotGiaBatBuocTable() {
  const table = document.getElementById('table-truotgia-batbuoc');
  if (!table) return;
  let html = '<tbody>';
  
  // Row 1
  html += '<tr><th>Năm</th><th>Trước 1995</th>' + [1995,1996,1997,1998,1999,2000,2001,2002,2003,2004,2005,2006,2007].map(y => `<th>${y}</th>`).join('') + '</tr>';
  html += '<tr><th>Mức điều chỉnh</th><td>5,81</td>' + [1995,1996,1997,1998,1999,2000,2001,2002,2003,2004,2005,2006,2007].map(y => `<td>${truotGia[y].toString().replace('.', ',')}</td>`).join('') + '</tr>';
  
  // Row 2
  html += '<tr><th>Năm</th>' + [2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021].map(y => `<th>${y}</th>`).join('') + '</tr>';
  html += '<tr><th>Mức điều chỉnh</th>' + [2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021].map(y => `<td>${truotGia[y].toString().replace('.', ',')}</td>`).join('') + '</tr>';
  
  // Row 3
  html += '<tr><th>Năm</th>' + [2022,2023,2024,2025,2026].map(y => `<th>${y}</th>`).join('') + '<td colspan="9"></td></tr>';
  html += '<tr><th>Mức điều chỉnh</th>' + [2022,2023,2024,2025,2026].map(y => `<td>${truotGia[y].toString().replace('.', ',')}</td>`).join('') + '<td colspan="9"></td></tr>';
  
  html += '</tbody>';
  table.innerHTML = html;
}

// Render Bảng trượt giá Tự nguyện
function renderTruotGiaTuNguyenTable() {
  const table = document.getElementById('table-truotgia-tunguyen');
  if (!table) return;
  let html = '<tbody>';
  
  // Row 1
  html += '<tr><th>Năm</th>' + [2008,2009,2010,2011,2012,2013,2014].map(y => `<th>${y}</th>`).join('') + '</tr>';
  html += '<tr><th>Mức điều chỉnh</th>' + [2008,2009,2010,2011,2012,2013,2014].map(y => `<td>${truotGiaTuNguyen[y].toString().replace('.', ',')}</td>`).join('') + '</tr>';
  
  // Row 2
  html += '<tr><th>Năm</th>' + [2015,2016,2017,2018,2019,2020,2021].map(y => `<th>${y}</th>`).join('') + '</tr>';
  html += '<tr><th>Mức điều chỉnh</th>' + [2015,2016,2017,2018,2019,2020,2021].map(y => `<td>${truotGiaTuNguyen[y].toString().replace('.', ',')}</td>`).join('') + '</tr>';
  
  // Row 3
  html += '<tr><th>Năm</th>' + [2022,2023,2024,2025,2026].map(y => `<th>${y}</th>`).join('') + '<td colspan="2"></td></tr>';
  html += '<tr><th>Mức điều chỉnh</th>' + [2022,2023,2024,2025,2026].map(y => `<td>${truotGiaTuNguyen[y].toString().replace('.', ',')}</td>`).join('') + '<td colspan="2"></td></tr>';
  
  html += '</tbody>';
  table.innerHTML = html;
}

// State
let currentTab = 'batbuoc';
let rowCount = 0;

// Tab logic
document.querySelectorAll('.bhxh-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.bhxh-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentTab = tab.dataset.type;
    updateUIForTab();
  });
});

function updateUIForTab(skipClear = false) {
  const colSalaryLabel = document.getElementById('col-salary-label');
  const colTypeLabel = document.getElementById('col-type-label');
  const supportTable = document.getElementById('table-support-container');
  const noteTuNguyen = document.getElementById('note-tunguyen');
  const sidebarNote = document.getElementById('sidebar-note-content');
  const sidebarLegal = document.getElementById('sidebar-legal-content');
  const btnAddPeriod = document.getElementById('btn-add-period');
  const btnAddBatbuoc = document.getElementById('btn-add-batbuoc');
  const btnAddTunguyen = document.getElementById('btn-add-tunguyen');
  const btnAddMaternity = document.getElementById('btn-add-maternity');
  const containerBatBuoc = document.getElementById('container-truotgia-batbuoc');
  const containerTuNguyen = document.getElementById('container-truotgia-tunguyen');

  if (currentTab === 'batbuoc') {
    colSalaryLabel.innerText = "Mức lương đóng BHXH";
    colTypeLabel.style.display = 'none';
    supportTable.style.display = 'none';
    noteTuNguyen.style.display = 'none';
    btnAddPeriod.style.display = 'inline-block';
    btnAddBatbuoc.style.display = 'none';
    btnAddTunguyen.style.display = 'none';
    if(btnAddMaternity) btnAddMaternity.style.display = 'inline-block';
    if(containerBatBuoc) containerBatBuoc.style.display = 'block';
    if(containerTuNguyen) containerTuNguyen.style.display = 'none';
    if (sidebarNote && sidebarLegal) {
      sidebarNote.innerHTML = '<strong>- Đối tượng áp dụng:</strong> Người lao động có toàn thời gian đóng BHXH bắt buộc theo tiền lương do doanh nghiệp quyết định.';
      sidebarLegal.innerHTML = `
        <li>1. Luật Bảo hiểm xã hội 2024</li>
        <li>2. Nghị định 158/2025/NĐ-CP</li>
        <li>3. Thông tư 25/2025/TT-BYT</li>
        <li>4. Công văn 340/BHXH-CSXH ngày 03/02/2026</li>
      `;
    }
  } else if (currentTab === 'tunguyen') {
    colSalaryLabel.innerText = "Mức thu nhập đóng BHXH";
    colTypeLabel.style.display = 'block';
    supportTable.style.display = 'block';
    noteTuNguyen.style.display = 'block';
    btnAddPeriod.style.display = 'inline-block';
    btnAddBatbuoc.style.display = 'none';
    btnAddTunguyen.style.display = 'none';
    if(btnAddMaternity) btnAddMaternity.style.display = 'none';
    if(containerBatBuoc) containerBatBuoc.style.display = 'none';
    if(containerTuNguyen) containerTuNguyen.style.display = 'block';
    if (sidebarNote && sidebarLegal) {
      sidebarNote.innerHTML = '<strong>- Đối tượng áp dụng:</strong> Người lao động có toàn thời gian đóng BHXH bắt buộc theo tiền lương do doanh nghiệp quyết định.';
      sidebarLegal.innerHTML = `
        <li>1. Luật Bảo hiểm xã hội 2024</li>
        <li>2. Nghị định 159/2025/NĐ-CP</li>
        <li>3. Công văn 340/BHXH-CSXH ngày 03/02/2026</li>
      `;
    }
  } else {
    // cahai
    colSalaryLabel.innerText = "Mức lương/thu nhập đóng BHXH";
    colTypeLabel.style.display = 'block';
    supportTable.style.display = 'block';
    noteTuNguyen.style.display = 'block';
    btnAddPeriod.style.display = 'none';
    btnAddBatbuoc.style.display = 'inline-block';
    btnAddTunguyen.style.display = 'inline-block';
    if(btnAddMaternity) btnAddMaternity.style.display = 'inline-block';
    if(containerBatBuoc) containerBatBuoc.style.display = 'block';
    if(containerTuNguyen) containerTuNguyen.style.display = 'block';
    if (sidebarNote && sidebarLegal) {
      sidebarNote.innerHTML = '<strong>- Đối tượng áp dụng:</strong> Người lao động vừa có thời gian đóng BHXH bắt buộc theo tiền lương do doanh nghiệp quyết định, vừa có thời gian tham gia BHXH tự nguyện.';
      sidebarLegal.innerHTML = `
        <li>1. Luật Bảo hiểm xã hội 2024</li>
        <li>2. Nghị định 158/2025/NĐ-CP</li>
        <li>3. Nghị định 159/2025/NĐ-CP</li>
        <li>4. Thông tư 25/2025/TT-BYT</li>
        <li>5. Công văn 340/BHXH-CSXH ngày 03/02/2026</li>
      `;
    }
  }
  
  // Reset form
  if (!skipClear) {
    document.getElementById('period-rows-container').innerHTML = '';
    rowCount = 0;
    const resultContainer = document.getElementById('result-container');
    if (resultContainer) {
      resultContainer.style.display = 'none';
      resultContainer.innerHTML = '';
    }
    addPeriodRow();
    saveToLocalStorage();
  }
}

// Format numbers
function formatCurrency(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function parseCurrency(str) {
  return parseFloat(str.replace(/,/g, '')) || 0;
}

function bindCurrencyFormat(input) {
  input.addEventListener('input', function() {
    let val = parseCurrency(this.value);
    if (val === 0 && this.value.trim() === '') {
      this.value = '';
    } else {
      this.value = formatCurrency(val);
    }
  });
}

// Thêm dòng
function generateMonthOptions() {
  let opts = '';
  for(let i=1; i<=12; i++) {
    let m = i < 10 ? '0'+i : i;
    opts += `<option value="${m}">Tháng ${m}</option>`;
  }
  return opts;
}

function generateYearOptions() {
  let opts = '';
  let currentYear = new Date().getFullYear();
  for(let i=currentYear; i>=1990; i--) {
    opts += `<option value="${i}">${i}</option>`;
  }
  return opts;
}

function addPeriodRow(type, skipSave = false) {
  rowCount++;
  const container = document.getElementById('period-rows-container');
  const row = document.createElement('div');
  row.className = 'period-row';
  row.id = `row-${rowCount}`;

  let stt = rowCount < 10 ? `0${rowCount}` : rowCount;
  
  let isMaternity = (type === 'thaisan');

  let rowType = type;
  if (!rowType || rowType === 'thaisan') {
    rowType = (currentTab === 'tunguyen' && !isMaternity) ? 'tunguyen' : 'batbuoc';
  }

  let typeHTML = '';
  if (currentTab !== 'batbuoc') {
    if (rowType === 'tunguyen') {
      typeHTML = `
        <div class="col-type">
          <select class="input-type">
            <option value="ngheo">Hộ nghèo</option>
            <option value="biendao">Người đang sinh sống tại xã đảo, đặc khu</option>
            <option value="canngheo">Hộ cận nghèo</option>
            <option value="dantoc">Người dân tộc thiểu số</option>
            <option value="khac" selected>Đối tượng khác</option>
          </select>
        </div>
      `;
    } else {
      typeHTML = `
        <div class="col-type" style="display:flex; align-items:center; color:var(--text2); font-size:12px; font-style:italic;">
          (Không có đối tượng)
        </div>
      `;
    }
  } else {
    typeHTML = '<div class="col-type" style="display:none;"></div>';
  }

  let salaryHTML = `
    <div class="col-salary">
      <input type="text" class="input-salary" placeholder="Nhập số tiền...">
    </div>
  `;
  if (isMaternity) {
    salaryHTML = `
      <div class="col-salary" style="display:flex; align-items:center; color:var(--text2); font-size:13px; font-style:italic;">
        (Giai đoạn hưởng thai sản)
      </div>
    `;
  }

  row.innerHTML = `
    <div class="col-stt">${stt}</div>
    <div class="col-period">
      Từ 
      <select class="input-from-m">${generateMonthOptions()}</select>
      <select class="input-from-y">${generateYearOptions()}</select>
      Đến
      <select class="input-to-m">${generateMonthOptions()}</select>
      <select class="input-to-y">${generateYearOptions()}</select>
    </div>
    ${salaryHTML}
    ${typeHTML}
    <div class="col-action">
      ${rowCount > 1 ? `<button class="btn-remove" onclick="removeRow(${rowCount})">✕</button>` : ''}
    </div>
  `;

  container.appendChild(row);
  
  const salaryInput = row.querySelector('.input-salary');
  if (salaryInput) {
    bindCurrencyFormat(salaryInput);
  }
}

function removeRow(id) {
  document.getElementById(`row-${id}`).remove();
  // Re-index stt if necessary, but skipping is fine for simple visual.
}

function addMaternityRow() {
  addPeriodRow('thaisan');
}

// Calculate logic placeholder
function calculateBHXH() {
  const resultContainer = document.getElementById('result-container');
  
  // Validate periods
  const rows = document.querySelectorAll('.period-row');
  let periods = [];
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const sttText = row.querySelector('.col-stt').innerText;
    
    const salaryInput = row.querySelector('.input-salary');
    if (salaryInput) {
      if (salaryInput.value.trim() === '') {
        alert(`Lỗi: Vui lòng nhập mức tiền lương/thu nhập đóng BHXH cho giai đoạn dòng số ${sttText}.`);
        return;
      }
      const parsedSalary = parseCurrency(salaryInput.value);
      if (parsedSalary <= 0) {
        alert(`Lỗi: Mức tiền lương/thu nhập đóng BHXH dòng số ${sttText} phải lớn hơn 0.`);
        return;
      }
    }

    const fromM = parseInt(row.querySelector('.input-from-m').value, 10);
    const fromY = parseInt(row.querySelector('.input-from-y').value, 10);
    const toM = parseInt(row.querySelector('.input-to-m').value, 10);
    const toY = parseInt(row.querySelector('.input-to-y').value, 10);
    
    const fromVal = fromY * 12 + fromM;
    const toVal = toY * 12 + toM;
    
    if (fromVal > toVal) {
      alert(`Lỗi: Giai đoạn dòng số ${sttText} không hợp lệ (Thời gian "Từ" phải trước hoặc bằng thời gian "Đến").`);
      return;
    }
    
    periods.push({ stt: sttText, from: fromVal, to: toVal, fromM, fromY, toM, toY, element: row });
  }
  
  // Check for overlaps
  periods.sort((a, b) => a.from - b.from);
  for (let i = 0; i < periods.length - 1; i++) {
    if (periods[i].to >= periods[i+1].from) {
      alert(`Lỗi: Các giai đoạn thời gian không được chồng lấn lên nhau (Giai đoạn dòng số ${periods[i].stt} bị trùng/chồng lấn với dòng số ${periods[i+1].stt}).`);
      return;
    }
  }

  // Validate maternity has preceding batbuoc
  let lastPTypeForMaternity = null;
  for (let i = 0; i < periods.length; i++) {
    let p = periods[i];
    const isMaternity = !p.element.querySelector('.input-salary');
    
    let pType = currentTab;
    if (currentTab === 'cahai') {
      if (isMaternity) {
        pType = 'batbuoc';
      } else {
        const typeSelect = p.element.querySelector('.input-type');
        pType = typeSelect && typeSelect.offsetParent !== null ? 'tunguyen' : 'batbuoc';
      }
    }
    
    if (isMaternity) {
      if (i === 0 || lastPTypeForMaternity !== 'batbuoc') {
        alert(`Thông báo\n\nQuý khách vui lòng thêm giai đoạn nộp BHXH bắt buộc ngay trước giai đoạn thai sản.`);
        return;
      }
      
      let months = (p.toY - p.fromY) * 12 + (p.toM - p.fromM) + 1;
      if (months > 6) {
        alert(`Thông báo\n\nThời gian nghỉ thai sản không được vượt quá 6 tháng.`);
        return;
      }
    }
    lastPTypeForMaternity = pType;
  }

  // Calculate logic
  function formatMoney(num) {
    return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  
  function getTruotGia(yearStr, type) {
    if (type === 'tunguyen') {
      return truotGiaTuNguyen[yearStr] || 1.0;
    }
    return truotGia[yearStr] || 1.0;
  }

  let totalMonthsBefore2014 = 0;
  let totalMonthsFrom2014 = 0;
  let totalMonths = 0;
  let totalMoney = 0;
  let lastSalary = 0;
  let calculationSteps = [];
  
  const subsidyRates = {
    ngheo: 0.30,
    canngheo: 0.25,
    biendao: 0.10,
    dantoc: 0.10,
    khac: 0.10
  };
  
  let subsidyAggr = {};
  let hasBatbuoc = false;
  let hasTunguyen = false;

  for (let p of periods) {
    const row = p.element;
    const salaryInput = row.querySelector('.input-salary');
    const isMaternity = !salaryInput;
    let salary = 0;
    
    if (isMaternity) {
      salary = lastSalary;
    } else {
      salary = parseCurrency(salaryInput.value);
      lastSalary = salary;
    }
    
    let pType = currentTab;
    let tType = 'khac';
    if (currentTab === 'cahai') {
      if (isMaternity) {
        pType = 'batbuoc';
      } else {
        const typeSelect = row.querySelector('.input-type');
        pType = typeSelect && typeSelect.offsetParent !== null ? 'tunguyen' : 'batbuoc';
        if (pType === 'tunguyen') tType = typeSelect.value;
      }
    } else if (currentTab === 'tunguyen') {
      const typeSelect = row.querySelector('.input-type');
      if (typeSelect) tType = typeSelect.value;
    }
    
    if (pType === 'batbuoc') hasBatbuoc = true;
    if (pType === 'tunguyen') hasTunguyen = true;
    
    for (let m = p.from; m <= p.to; m++) {
      let year = Math.floor((m - 1) / 12);
      if (year < 2014) totalMonthsBefore2014++;
      else totalMonthsFrom2014++;
      totalMonths++;
    }
    
    let currentY = p.fromY;
    let currentM = p.fromM;
    
    while (currentY < p.toY || (currentY === p.toY && currentM <= p.toM)) {
      let splitEndM = (currentY === p.toY) ? p.toM : 12;
      let monthsInSplit = splitEndM - currentM + 1;
      
      if (pType === 'tunguyen' && currentY >= 2018) {
        const rate = subsidyRates[tType] || 0.10;
        let baseIncome = (currentY <= 2021) ? 700000 : 1500000;
        let periodLabel = (currentY <= 2021) ? 'từ tháng 01/2018 - hết tháng 12/2021' : 'từ tháng 01/2022 - hết tháng 6/2025';
        
        let key = `${baseIncome}_${rate}_${periodLabel}`;
        if (!subsidyAggr[key]) {
          subsidyAggr[key] = { baseIncome, rate, months: 0, amount: 0, label: periodLabel };
        }
        subsidyAggr[key].months += monthsInSplit;
        subsidyAggr[key].amount += (0.22 * baseIncome * rate * monthsInSplit);
      }
      
      let multiplierStr = "Truoc1995";
      if (currentY >= 1995) multiplierStr = currentY.toString();
      
      let multiplier = getTruotGia(multiplierStr, pType);
      let money = salary * multiplier * monthsInSplit;
      totalMoney += money;
      
      let typeDesc = (pType === 'tunguyen') ? "Mức thu nhập" : "Mức tiền lương";
      let stepLine1 = `- Giai đoạn đóng từ T${currentM}/${currentY} đến T${splitEndM}/${currentY}: Thời gian ${monthsInSplit} tháng - ${isMaternity ? 'Thai sản' : `${typeDesc} đóng BHXH: ${formatMoney(salary)} đồng`}`;
      
      let stepLine2 = "";
      if (isMaternity) {
        stepLine2 += `<div style="font-style:italic; font-size: 13px; color: var(--text2); margin-top: 4px;">(Mức tiền lương đóng BHXH của thời gian nghỉ thai sản là mức tiền lương đóng BHXH của tháng trước khi nghỉ hưởng chế độ)</div>`;
      }
      
      let multiplierFormatted = multiplier.toString().replace('.', ',');
      stepLine2 += `<div style="margin-top: 6px;">${formatMoney(salary)} x ${multiplierFormatted} x ${monthsInSplit} = ${formatMoney(money)} đồng</div>`;
      
      calculationSteps.push({ money: Math.round(money), line1: stepLine1, line2: stepLine2 });
      
      currentY++;
      currentM = 1;
    }
  }

  let avgSalary = totalMonths > 0 ? Math.round(totalMoney / totalMonths) : 0;

  function getRoundedYears(months) {
    let y = Math.floor(months / 12);
    let rem = months % 12;
    if (rem >= 1 && rem <= 6) return y + 0.5;
    if (rem >= 7 && rem <= 11) return y + 1.0;
    return y;
  }

  let yearsBefore2014 = getRoundedYears(totalMonthsBefore2014);
  let yearsFrom2014 = getRoundedYears(totalMonthsFrom2014);

  let benefitBefore2014 = Math.round(avgSalary * yearsBefore2014 * 1.5);
  let benefitFrom2014 = Math.round(avgSalary * yearsFrom2014 * 2.0);
  let totalBenefit = benefitBefore2014 + benefitFrom2014;

  let totalSubsidy = 0;
  let subsidyHTML = '';
  if (Object.keys(subsidyAggr).length > 0) {
    subsidyHTML += `
      <div style="font-weight: bold; margin-bottom: 5px; margin-left: 15px;">Số tiền Nhà nước hỗ trợ đóng BHXH:</div>
      <div style="font-style: italic; margin-bottom: 10px; margin-left: 15px; color: var(--text2);">(Nhà nước bắt đầu hỗ trợ đóng BHXH tự nguyện từ 01/01/2018)</div>
    `;
    let subsidyStrs = [];
    for (let key in subsidyAggr) {
      let sub = subsidyAggr[key];
      totalSubsidy += sub.amount;
      subsidyHTML += `
        <div style="margin-bottom: 5px; margin-left: 15px;">Số tiền Nhà nước hỗ trợ đóng BHXH tự nguyện ${sub.label}</div>
        <div style="margin-bottom: 10px; margin-left: 30px;">0.22 x ${formatMoney(sub.baseIncome)} x ${sub.rate * 100}% x ${sub.months} tháng = <strong>${formatMoney(sub.amount)} đồng</strong></div>
      `;
      subsidyStrs.push(formatMoney(sub.amount));
    }
    
    if (subsidyStrs.length > 1) {
      subsidyHTML += `
        <div style="margin-bottom: 15px; margin-left: 15px; font-weight: bold;">
          Tổng số tiền nhà nước hỗ trợ đóng BHXH = ${subsidyStrs.join(" + ")} = <span style="color: var(--blue);">${formatMoney(totalSubsidy)} đồng</span>
        </div>
      `;
    } else {
      subsidyHTML += `
        <div style="margin-bottom: 15px; margin-left: 15px; font-weight: bold;">
          Tổng số tiền nhà nước hỗ trợ đóng BHXH = <span style="color: var(--blue);">${formatMoney(totalSubsidy)} đồng</span>
        </div>
      `;
    }
  }

  let finalBenefit = totalBenefit - totalSubsidy;

  let sumStringArr = calculationSteps.map(step => formatMoney(step.money));
  let stepsHTML = calculationSteps.map(step => `
    <div style="margin-bottom: 12px;">
      <div>${step.line1}</div>
      ${step.line2}
    </div>
  `).join('');
  
  let averageLabel = "Tiền lương/Thu nhập";
  if (hasBatbuoc && !hasTunguyen) averageLabel = "Tiền lương";
  if (!hasBatbuoc && hasTunguyen) averageLabel = "Thu nhập";

  window.downloadBHXHReport = function() {
    const content = document.getElementById('result-container').innerHTML;
    // Add some basic styling for the Word doc
    const docHTML = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Báo Cáo BHXH</title></head>
      <body>${content}</body>
      </html>
    `;
    const blob = new Blob([docHTML], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Bao_Cao_BHXH.doc';
    a.click();
    URL.revokeObjectURL(url);
  };

  let stepsWrapperStart = '';
  let stepsWrapperEnd = '';
  if (calculationSteps.length > 5) {
    stepsWrapperStart = `
      <div id="steps-container" style="max-height: 250px; overflow: hidden; position: relative; transition: max-height 0.3s ease;">
    `;
    stepsWrapperEnd = `
        <div id="steps-gradient" style="position: absolute; bottom: 0; left: 0; right: 0; height: 60px; background: linear-gradient(transparent, var(--bg2)); pointer-events: none;"></div>
      </div>
      <div style="text-align: center; margin-top: 10px;">
        <button id="btn-toggle-steps" onclick="toggleSteps()" style="background: var(--bg); border: 1px solid var(--border); border-radius: 20px; padding: 6px 16px; color: var(--text); cursor: pointer; font-size: 13px; font-weight: bold; transition: all 0.2s;">Xem thêm ⌄</button>
      </div>
    `;
  } else {
    stepsWrapperStart = `<div id="steps-container">`;
    stepsWrapperEnd = `</div>`;
  }

  window.toggleSteps = function() {
    const container = document.getElementById('steps-container');
    const grad = document.getElementById('steps-gradient');
    const btn = document.getElementById('btn-toggle-steps');
    if (container.style.maxHeight !== 'none') {
      container.style.maxHeight = 'none';
      if(grad) grad.style.display = 'none';
      btn.innerText = 'Thu gọn ⌃';
    } else {
      container.style.maxHeight = '250px';
      if(grad) grad.style.display = 'block';
      btn.innerText = 'Xem thêm ⌄';
      container.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  let html = `
    <div style="background: var(--bg2); color: var(--text); padding: 20px; border-radius: 8px; text-align: left; font-size: 14px; line-height: 1.6; font-family: var(--sans);">
      
      <div style="border-bottom: 2px solid var(--border); padding-bottom: 10px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
        <h3 style="color: var(--blue); margin: 0; font-size: 18px;">Tiền BHXH 1 lần được nhận: ${formatMoney(finalBenefit)} đồng</h3>
        <div>
          <a href="javascript:void(0)" onclick="window.print()" style="color: var(--blue); text-decoration: none; font-weight: bold; font-size: 13px; margin-right: 15px;">🖨️ In / Lưu PDF</a>
          <a href="javascript:void(0)" onclick="downloadBHXHReport()" style="color: var(--blue); text-decoration: none; font-weight: bold; font-size: 13px;">📥 Tải file tính tiền BHXH 1 lần</a>
        </div>
      </div>
      
      <h4 style="font-size: 16px; font-style: italic; margin-bottom: 15px;">Diễn giải cách tính BHXH 1 lần</h4>
      
      <div style="font-weight: bold; margin-bottom: 10px;">1. Thời gian tham gia BHXH: ${Math.floor(totalMonths / 12)} năm ${totalMonths % 12 > 0 ? (totalMonths % 12) + ' tháng' : ''}</div>
      
      <div style="margin-left: 15px; margin-bottom: 15px;">
        <div>- Thời gian tham gia BHXH trước năm 2014: ${Math.floor(totalMonthsBefore2014 / 12)} năm ${totalMonthsBefore2014 % 12 > 0 ? (totalMonthsBefore2014 % 12) + ' tháng' : ''}</div>
        <div>- Thời gian tham gia BHXH từ năm 2014 trở đi: ${Math.floor(totalMonthsFrom2014 / 12)} năm ${totalMonthsFrom2014 % 12 > 0 ? (totalMonthsFrom2014 % 12) + ' tháng' : ''}</div>
      </div>
      
      <div style="font-weight: bold; margin-bottom: 10px;">2. Mức bình quân ${averageLabel.toLowerCase()} tháng đóng BHXH:</div>
      <div style="margin-left: 15px; font-weight: bold; margin-bottom: 10px;">2.1. ${averageLabel} đóng BHXH của các giai đoạn tham gia BHXH như sau:</div>
      
      <div style="margin-left: 15px; margin-bottom: 15px;">
        ${stepsWrapperStart}
          ${stepsHTML}
        ${stepsWrapperEnd}
        
        <div style="margin-top: 15px; margin-bottom: 15px;">
          - Tổng ${averageLabel.toLowerCase()} đóng BHXH = ${sumStringArr.join(" + ")} = <strong>${formatMoney(totalMoney)} đồng</strong>
        </div>
        
        <div style="margin-bottom: 15px;">
          2.2. Mức bình quân ${averageLabel.toLowerCase()} đóng BHXH = Tổng tiền / tổng số tháng = ${formatMoney(avgSalary)} đồng
        </div>
      </div>
      
      <div style="font-weight: bold; margin-bottom: 10px;">3. Mức hưởng BHXH một lần:</div>
      
      <div style="margin-left: 15px; margin-bottom: 15px;">
        <div style="margin-bottom: 5px;">Mức hưởng BHXH 1 lần đối với thời gian đóng BHXH trước 2014:</div>
        <div style="margin-bottom: 10px; margin-left: 15px;">${formatMoney(avgSalary)} x ${yearsBefore2014} năm x 1,5 = <strong>${formatMoney(benefitBefore2014)} đồng</strong></div>
        
        <div style="margin-bottom: 5px;">Mức hưởng BHXH 1 lần đối với thời gian đóng BHXH từ 2014 trở đi:</div>
        <div style="margin-bottom: 10px; margin-left: 15px;">${formatMoney(avgSalary)} x ${yearsFrom2014} năm x 2 = <strong>${formatMoney(benefitFrom2014)} đồng</strong></div>
        
        ${subsidyHTML}
        
        <div style="margin-top: 15px; font-weight: bold; font-size: 15px;">
          Tổng tiền BHXH 1 lần được nhận = ${formatMoney(benefitBefore2014)} + ${formatMoney(benefitFrom2014)} ${totalSubsidy > 0 ? '- ' + formatMoney(totalSubsidy) : ''} = <span style="color: var(--blue);">${formatMoney(finalBenefit)} đồng</span>
        </div>
      </div>
      
      <div style="font-style: italic; font-size: 13px; color: var(--text3);">*Lưu ý: BHXH 1 lần đã được tính hệ số trượt giá</div>
    </div>
  `;
  
  resultContainer.innerHTML = html;
  resultContainer.style.display = 'block';
}

// LocalStorage & Toast
window.alert = function(msg) {
  showToast(msg, 'error');
};

function showToast(message, type = 'error') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'error' ? '⚠️' : '✅';
  toast.innerHTML = `<div style="font-size: 18px;">${icon}</div><div>${message.replace(/\n/g, '<br>')}</div>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastSlideOut 0.3s ease forwards';
    setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
  }, 4000);
}

function saveToLocalStorage() {
  if (typeof currentTab === 'undefined') return;
  const periods = [];
  document.querySelectorAll('.period-row').forEach(row => {
    const p = {
      fromM: row.querySelector('.input-from-m').value,
      fromY: row.querySelector('.input-from-y').value,
      toM: row.querySelector('.input-to-m').value,
      toY: row.querySelector('.input-to-y').value
    };
    const salaryInput = row.querySelector('.input-salary');
    if (salaryInput) p.salary = salaryInput.value;
    const typeSelect = row.querySelector('.input-type');
    if (typeSelect) p.type = typeSelect.value;
    periods.push(p);
  });
  const data = { currentTab, periods };
  localStorage.setItem('bhxh_data', JSON.stringify(data));
}

function loadFromLocalStorage() {
  const dataStr = localStorage.getItem('bhxh_data');
  if (!dataStr) {
    updateUIForTab();
    return;
  }
  try {
    const data = JSON.parse(dataStr);
    if (data.currentTab) {
      document.querySelectorAll('.bhxh-tab').forEach(t => t.classList.remove('active'));
      const tabBtn = document.querySelector(`.bhxh-tab[data-type="${data.currentTab}"]`);
      if (tabBtn) tabBtn.classList.add('active');
      currentTab = data.currentTab;
      updateUIForTab(true);
    }
    
    document.getElementById('period-rows-container').innerHTML = '';
    rowCount = 0;
    
    if (data.periods && data.periods.length > 0) {
      data.periods.forEach(p => {
        let type = 'batbuoc';
        if (p.salary === undefined) type = 'thaisan';
        else if (p.type) type = 'tunguyen';
        
        addPeriodRow(type, true);
        const row = document.getElementById(`row-${rowCount}`);
        if(row) {
            row.querySelector('.input-from-m').value = p.fromM;
            row.querySelector('.input-from-y').value = p.fromY;
            row.querySelector('.input-to-m').value = p.toM;
            row.querySelector('.input-to-y').value = p.toY;
            const salaryInput = row.querySelector('.input-salary');
            if (salaryInput && p.salary) salaryInput.value = p.salary;
            const typeSelect = row.querySelector('.input-type');
            if (typeSelect && p.type) typeSelect.value = p.type;
        }
      });
    } else {
      addPeriodRow('', true);
    }
  } catch(e) {
    console.error(e);
    updateUIForTab();
  }
}

function resetData() {
  localStorage.removeItem('bhxh_data');
  document.querySelectorAll('.bhxh-tab').forEach(t => t.classList.remove('active'));
  const firstTab = document.querySelector('.bhxh-tab[data-type="batbuoc"]');
  firstTab.classList.add('active');
  currentTab = 'batbuoc';
  updateUIForTab();
  showToast('Đã làm mới toàn bộ dữ liệu.', 'success');
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  renderTruotGiaBatBuocTable();
  renderTruotGiaTuNguyenTable();
  loadFromLocalStorage();
});
