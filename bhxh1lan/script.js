// Dữ liệu Hệ số trượt giá 2026
const truotGia = {
  "Truoc1995": 5.81, "1995": 4.91, "1996": 4.65, "1997": 4.5, "1998": 4.18, "1999": 4.01,
  "2000": 4.07, "2001": 4.09, "2002": 3.94, "2003": 3.81, "2004": 3.54, "2005": 3.27,
  "2006": 3.05, "2007": 2.29, "2008": 2.81, "2009": 2.14, "2010": 1.96, "2011": 1.65,
  "2012": 1.51, "2013": 1.42, "2014": 1.36, "2015": 1.36, "2016": 1.32, "2017": 1.28,
  "2018": 1.23, "2019": 1.2, "2020": 1.16, "2021": 1.14, "2022": 1.11, "2023": 1.07,
  "2024": 1.03, "2025": 1.0, "2026": 1.0
};

// Render Bảng trượt giá
function renderTruotGiaTable() {
  const table = document.getElementById('table-truotgia');
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

function updateUIForTab() {
  const colSalaryLabel = document.getElementById('col-salary-label');
  const colTypeLabel = document.getElementById('col-type-label');
  const supportTable = document.getElementById('table-support-container');
  const noteTuNguyen = document.getElementById('note-tunguyen');

  if (currentTab === 'batbuoc') {
    colSalaryLabel.innerText = "Mức lương đóng BHXH";
    colTypeLabel.style.display = 'none';
    supportTable.style.display = 'none';
    noteTuNguyen.style.display = 'none';
  } else if (currentTab === 'tunguyen') {
    colSalaryLabel.innerText = "Mức thu nhập đóng BHXH";
    colTypeLabel.style.display = 'block';
    supportTable.style.display = 'block';
    noteTuNguyen.style.display = 'block';
  } else {
    // cahai
    colSalaryLabel.innerText = "Mức lương/thu nhập đóng BHXH";
    colTypeLabel.style.display = 'block';
    supportTable.style.display = 'block';
    noteTuNguyen.style.display = 'block';
  }
  
  // Reset form
  document.getElementById('period-rows-container').innerHTML = '';
  rowCount = 0;
  addPeriodRow();
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

function addPeriodRow() {
  rowCount++;
  const container = document.getElementById('period-rows-container');
  const row = document.createElement('div');
  row.className = 'period-row';
  row.id = `row-${rowCount}`;

  let stt = rowCount < 10 ? `0${rowCount}` : rowCount;
  
  let typeHTML = '';
  if (currentTab !== 'batbuoc') {
    typeHTML = `
      <div class="col-type">
        <select class="input-type">
          <option value="khac">Đối tượng khác</option>
          <option value="ngheo">Hộ nghèo</option>
          <option value="canngheo">Hộ cận nghèo</option>
        </select>
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
    <div class="col-salary">
      <input type="text" class="input-salary" placeholder="Nhập số tiền...">
    </div>
    ${typeHTML}
    <div class="col-action">
      ${rowCount > 1 ? `<button class="btn-remove" onclick="removeRow(${rowCount})">✕</button>` : ''}
    </div>
  `;

  container.appendChild(row);
  
  const salaryInput = row.querySelector('.input-salary');
  bindCurrencyFormat(salaryInput);
}

function removeRow(id) {
  document.getElementById(`row-${id}`).remove();
  // Re-index stt if necessary, but skipping is fine for simple visual.
}

function addMaternityRow() {
  addPeriodRow();
  // Set salary to 0 or indicator.
  // ...
}

// Calculate logic placeholder
function calculateBHXH() {
  const resultContainer = document.getElementById('result-container');
  
  // Logic tính toán rất phức tạp, cần bóc tách mảng tháng/năm, tính số tháng, nhân hệ số.
  // Ở đây giả lập hiển thị báo cáo.
  
  resultContainer.innerHTML = `
    <h3 style="color: var(--blue); margin-bottom: 15px; text-align: center;">KẾT QUẢ TÍNH BHXH 1 LẦN DỰ KIẾN</h3>
    
    <div class="tax-breakdown-table mt-20">
      <div class="b-row b-header">
        <div class="b-col-name">Diễn giải dòng tiền / Thông tin</div>
        <div class="b-col-val">Kết quả tính toán</div>
      </div>
      <div class="b-row b-main">
        <div class="b-col-name">1. Mức bình quân tiền lương/thu nhập đóng BHXH</div>
        <div class="b-col-val" style="color: var(--blue);">Đang tính toán...</div>
      </div>
      <div class="b-row">
        <div class="b-col-name">- Hệ số trượt giá áp dụng</div>
        <div class="b-col-val">Theo bảng 2026</div>
      </div>
      <div class="b-row b-main">
        <div class="b-col-name">2. Tổng thời gian tham gia BHXH</div>
        <div class="b-col-val" style="color: var(--text);">Đang tính toán...</div>
      </div>
      <div class="b-row">
        <div class="b-col-name">- Giai đoạn trước 2014</div>
        <div class="b-col-val">...</div>
      </div>
      <div class="b-row">
        <div class="b-col-name">- Giai đoạn từ 2014 trở đi</div>
        <div class="b-col-val">...</div>
      </div>
      <div class="b-row b-header" style="margin-top: 10px; border-top: 2px solid var(--border);">
        <div class="b-col-name">3. TỔNG SỐ TIỀN BHXH 1 LẦN NHẬN ĐƯỢC</div>
        <div class="b-col-val" style="color: var(--green); font-size: 16px;">Vui lòng liên hệ 1900.6192</div>
      </div>
    </div>
    
    <p style="font-size: 12px; color: var(--text3); text-align: center; margin-top: 15px;"><i>*Lưu ý: Phân hệ tính toán logic BHXH đang trong quá trình hoàn thiện các tham số phức tạp theo Luật 2024.</i></p>
  `;
  resultContainer.style.display = 'block';
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  renderTruotGiaTable();
  updateUIForTab();
});
