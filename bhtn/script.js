// --- Dữ liệu các mốc quy định pháp lý ---
const rulesDB = {
  "2026": {
    BASE_SALARY: 2340000,
    MIN_WAGE: { "1": 4960000, "2": 4410000, "3": 3860000, "4": 3450000 },
    LEGAL: [
      "- Mức hưởng bảo hiểm thất nghiệp được quy định tại Điều 50 Luật Việc làm 2013 và được hướng dẫn chi tiết tại Điều 8 Nghị định 28/2015/NĐ-CP.",
      "- Áp dụng mức lương tối thiểu vùng mới nhất theo Nghị định 74/2024/NĐ-CP.",
      "- Áp dụng mức tham chiếu 2.340.000 đồng (Theo Luật Bảo hiểm xã hội 2024 và Nghị định 73/2024/NĐ-CP)."
    ]
  },
  "2025_2": {
    BASE_SALARY: 2340000,
    MIN_WAGE: { "1": 4960000, "2": 4410000, "3": 3860000, "4": 3450000 },
    LEGAL: [
      "- Mức hưởng bảo hiểm thất nghiệp được quy định tại Điều 50 Luật Việc làm 2013.",
      "- Áp dụng mức lương tối thiểu vùng mới nhất theo Nghị định 74/2024/NĐ-CP (Từ 01/7/2024).",
      "- Áp dụng mức tham chiếu 2.340.000 đồng (Từ 01/7/2025)."
    ]
  },
  "2025_1": {
    BASE_SALARY: 2340000,
    MIN_WAGE: { "1": 4680000, "2": 4160000, "3": 3640000, "4": 3250000 },
    LEGAL: [
      "- Mức hưởng bảo hiểm thất nghiệp được quy định tại Điều 50 Luật Việc làm 2013.",
      "- Áp dụng mức lương tối thiểu vùng theo Nghị định 38/2022/NĐ-CP.",
      "- Áp dụng mức lương cơ sở 2.340.000 đồng (Nghị định 73/2024/NĐ-CP)."
    ]
  }
};

function getCurrentRules() {
  const period = document.querySelector('input[name="rule-period"]:checked').value;
  return rulesDB[period];
}

// Format tiện ích
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

// Xử lý ẩn/hiện form
const salaryTypeRadios = document.querySelectorAll('input[name="salary-type"]');
const rowSalary1 = document.getElementById('row-salary-1');
const rowSalary6 = document.getElementById('row-salary-6');

salaryTypeRadios.forEach(r => {
  r.addEventListener('change', () => {
    if (r.value === 'changed') {
      rowSalary1.style.display = 'none';
      rowSalary6.style.display = 'block';
    } else {
      rowSalary1.style.display = 'block';
      rowSalary6.style.display = 'none';
    }
  });
});

const regimeRadios = document.querySelectorAll('input[name="salary-regime"]');
const rowRegion = document.getElementById('row-region');

regimeRadios.forEach(r => {
  r.addEventListener('change', () => {
    if (r.value === 'private') {
      rowRegion.style.display = 'block';
    } else {
      rowRegion.style.display = 'none';
    }
  });
});

document.querySelectorAll('input[name="rule-period"]').forEach(r => {
  r.addEventListener('change', () => {
    const rules = getCurrentRules();
    const list = document.getElementById('dynamic-legal-list');
    list.innerHTML = rules.LEGAL.map(item => `<li>${item}</li>`).join('');
  });
});

// SEO Accordion
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

// Logic Tính toán
function calculateBHTN() {
  const rules = getCurrentRules();
  const salaryType = document.querySelector('input[name="salary-type"]:checked').value;
  const regime = document.querySelector('input[name="salary-regime"]:checked').value;
  const region = document.querySelector('input[name="region"]:checked').value;
  const monthsPaid = parseInt(document.getElementById('months-paid').value) || 0;

  if (monthsPaid < 12) {
    alert("Thời gian đóng BHTN chưa đủ 12 tháng nên bạn không đủ điều kiện nhận trợ cấp thất nghiệp.");
    return;
  }

  // 1. Tính lương bình quân 6 tháng
  let avgSalary = 0;
  if (salaryType === 'unchanged') {
    avgSalary = parseCurrency(document.getElementById('salary-avg').value);
  } else {
    let sum = 0;
    for (let i = 1; i <= 6; i++) {
      sum += parseCurrency(document.getElementById(`sal-${i}`).value);
    }
    avgSalary = sum / 6;
  }

  if (avgSalary <= 0) {
    alert("Vui lòng nhập tiền lương đóng BHTN hợp lệ.");
    return;
  }

  // 2. Tính mức hưởng 1 tháng (60% bình quân)
  let monthlyBenefit = avgSalary * 0.6;

  // 3. Tính mức trần
  let maxBenefit = 0;
  if (regime === 'state') {
    maxBenefit = rules.BASE_SALARY * 5;
  } else {
    maxBenefit = rules.MIN_WAGE[region] * 5;
  }

  let isCapped = false;
  if (monthlyBenefit > maxBenefit) {
    monthlyBenefit = maxBenefit;
    isCapped = true;
  }

  // 4. Tính số tháng được hưởng
  let benefitMonths = 0;
  if (monthsPaid >= 12 && monthsPaid <= 36) {
    benefitMonths = 3;
  } else {
    benefitMonths = 3 + Math.floor((monthsPaid - 36) / 12);
  }
  
  // Tối đa 12 tháng
  if (benefitMonths > 12) {
    benefitMonths = 12;
  }

  // 5. Số tháng được bảo lưu
  // Theo luật, người lđ đóng đủ 12 tháng -> 3 tháng. Đóng từ >36 tháng thì cứ 12 tháng đc thêm 1 tháng.
  // Công thức chuẩn: Số tháng bảo lưu = Tổng tháng đóng - (Số tháng hưởng trợ cấp * 12)
  // Tuy nhiên nếu họ mới đóng 12-36 tháng (ví dụ 14 tháng), họ hưởng 3 tháng. Vậy số tháng đóng tương ứng với 3 tháng hưởng là bn? Là 36 tháng.
  // Luật ghi rõ: "Thời gian đóng BHTN để xét hưởng trợ cấp thất nghiệp kỳ tiếp theo... trừ đi thời gian đóng đã hưởng trợ cấp. Cứ 1 tháng đã hưởng tương đương 12 tháng đóng."
  // Vậy Số tháng bảo lưu = Tổng tháng đóng - (Số tháng hưởng * 12).
  // Nếu Tổng tháng đóng < (Số tháng hưởng * 12) (ví dụ đóng 20 tháng, hưởng 3 tháng -> 3*12 = 36), thì số tháng bảo lưu = 0.
  let reservedMonths = monthsPaid - (benefitMonths * 12);
  if (reservedMonths < 0) reservedMonths = 0;

  // 6. Tổng tiền
  let totalBenefit = monthlyBenefit * benefitMonths;

  // Render báo cáo
  renderBHTNReport(avgSalary, monthlyBenefit, isCapped, maxBenefit, benefitMonths, reservedMonths, totalBenefit);
}

function renderBHTNReport(avgSalary, monthlyBenefit, isCapped, maxBenefit, benefitMonths, reservedMonths, totalBenefit) {
  const container = document.getElementById('bhtn-report-container');
  
  let warningHTML = '';
  if (isCapped) {
    warningHTML = `
      <div style="background: rgba(245, 166, 35, 0.1); border: 1px dashed var(--gold); padding: 15px; border-radius: 8px; margin-top: 15px; font-size: 13px; color: var(--gold);">
        ⚠️ <b>Mức hưởng hằng tháng của bạn vượt mức trần quy định.</b><br>
        Theo pháp luật, mức trợ cấp thất nghiệp tối đa không quá 5 lần mức lương cơ sở / lương tối thiểu vùng (${formatCurrency(Math.round(maxBenefit))} VNĐ). Hệ thống đã tự động áp dụng mức trần này.
      </div>
    `;
  }

  container.innerHTML = `
    <h2 class="section-title" style="text-align: center; margin-bottom: 25px; color: var(--text);">KẾT QUẢ TÍNH TRỢ CẤP THẤT NGHIỆP</h2>
    
    ${warningHTML}

    <div class="tax-breakdown-table mt-20">
      <div class="b-row b-header">
        <div class="b-col-name">Diễn giải dòng tiền / Thông tin</div>
        <div class="b-col-val">Kết quả tính toán</div>
      </div>
      <div class="b-row b-main">
        <div class="b-col-name">1. Tiền lương bình quân 6 tháng</div>
        <div class="b-col-val" style="color: var(--blue);">${formatCurrency(Math.round(avgSalary))} VNĐ</div>
      </div>
      <div class="b-row">
        <div class="b-col-name">- Mức hưởng (60% bình quân)</div>
        <div class="b-col-val">${formatCurrency(Math.round(avgSalary * 0.6))} VNĐ</div>
      </div>
      <div class="b-row b-main">
        <div class="b-col-name">2. Mức hưởng trợ cấp mỗi tháng (Sau khi xét trần)</div>
        <div class="b-col-val" style="color: #ff4757;">${formatCurrency(Math.round(monthlyBenefit))} VNĐ</div>
      </div>
      <div class="b-row">
        <div class="b-col-name">- Số tháng được hưởng</div>
        <div class="b-col-val" style="color: var(--blue);">${benefitMonths} tháng</div>
      </div>
      <div class="b-row">
        <div class="b-col-name">- Số tháng đóng BHTN chưa hưởng (Bảo lưu)</div>
        <div class="b-col-val">${reservedMonths} tháng</div>
      </div>
      <div class="b-row b-header" style="margin-top: 10px; border-top: 2px solid var(--border);">
        <div class="b-col-name">3. TỔNG SỐ TIỀN TRỢ CẤP NHẬN ĐƯỢC</div>
        <div class="b-col-val" style="color: var(--green); font-size: 16px;">${formatCurrency(Math.round(totalBenefit))} VNĐ</div>
      </div>
    </div>
  `;
  container.style.display = 'block';
  
  // Cuộn xuống báo cáo
  container.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
